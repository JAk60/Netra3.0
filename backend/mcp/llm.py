"""
mcp/llm.py
-----------
ChatOrchestrator — the main pipeline entry point.
ToolOrchestrator — routes to domain services with pre-resolved entities.

Pipeline order per request:
    0. clear_chat_log() — wipe chat.log for this run
    1. [STAGE-0] Ship validation — frontend sends pre-resolved ship records
       (ship_id + ship_name) from the live fleet via useShips hook.
       Stage 0 reads signal.matched_ships directly, fetches scoped catalogue
       slice for those ship IDs, attaches to IntentSignal.
       Hard stop with user-friendly message if matched_ships is empty.
    2. LLMExtractor.extract() — raw entity mentions (catalogue-aware)
    3. EntityLinker.resolve() + TemporalResolver.resolve() — parallel
    4. PatternMemory.find() — cache check
    5. [cache miss] LLM builds tool_json → PatternMemory.store()
    6. ToolOrchestrator.execute() — fire the appropriate service

NLTK calls removed entirely.
Services now receive ResolvedPair / ResolvedTriplet objects directly.

Changes
-------
STAGE-0  process_message : Ship resolver block added between signal parsing
                           and LLM extraction. Calls:
                             linker.get_catalogue_slice(ship_ids)
                           Attaches results to signal.resolved_ships and
                           signal.catalogue before any LLM call is made.
                           Returns early with a clear user message if no
                           ships are detected and intent is not GENERAL.

GENERAL  _general_pipeline : Full GENERAL intent pipeline implemented.
                           Uses dedicated extractor template (topic_hint +
                           scope), soft entity resolution via
                           resolve_for_general(), and SQLTool execution
                           via ToolOrchestrator.execute_sql().
                           Removed dead _tool_executor references.

STAGE-6  _general_pipeline : Argument builder now uses bind_entity() for
                           correct cardinality (single vs multi) instead of
                           hardcoded [0] indexing. dedupe_by() applied at
                           linker exit to prevent duplicate IDs reaching SQL.

BUG FIX  _general_pipeline : limit is now set to 1 when kernel.action ==
                           'latest' and the resolved shape is a single-row
                           shape (READ|ALERT_COMP, READ|ALERT_SENSOR,
                           READ|ALERT_SHIP, OH_READ|LATEST_COMP,
                           OH_READ|CURRENT_AGE, UTIL|LATEST_COMP).
                           Previously hardcoded to 100, causing queries like
                           "when was the last alert for GT_S1" to return all
                           matching rows instead of just the most recent one.

BUG FIX  _general_pipeline : OH_READ|CURRENT_AGE_MULTI always uses :ship_ids
                           (uuid[]) even when only one ship is resolved.
                           The generic cardinality heuristic (single ship →
                           scalar :ship_id) was incorrectly binding ship_id
                           instead of ship_ids, causing the validator to
                           reject the query with "Unbound params: ['ship_ids']".
                           _MULTI_SHIP_PARAM_SHAPES set added at module level —
                           shapes listed there always receive :ship_ids as a
                           list regardless of how many ships are resolved.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from backend.utils.nlpLayer import (
    EntityLinker,
    IntentSignal,
    LLMExtractor,
    PatternMemory,
    PipelineError,
    ResolvedEntities,
    TemporalRange,
    TemporalResolver,
    clear_chat_log,
    log_stage,
)
from backend.reliabilty.relformulas import Reliability
from backend.reliabilty.rcm import RCMService
from mcp.prompts import Prompts
from api.models.nlp.nlplayer import QueryShape, SqlQueryShape
from backend.sensor.rul import RULCalculationService
from backend.sensor.sensors import SensorReadingService
from mcp.tools.sql_tool import bind_entity, dedupe_by

logger = logging.getLogger(__name__)

# Intents that require at least one ship to be resolved before extraction.
# GENERAL bypasses the entire pipeline so it is excluded here.
_SHIP_REQUIRED_INTENTS = {"RELIABILITY", "RCM", "RUL", "SENSOR"}

# Shapes where action=latest should return only 1 row.
# These shapes already ORDER BY date/date DESC so TOP(1) gives the correct answer.
# All other shapes use limit=100 (the default list/fetch behaviour).
_SINGLE_ROW_SHAPES = {
    "READ|ALERT_COMP",
    "READ|ALERT_SENSOR",
    "READ|ALERT_SHIP",
    "OH_READ|LATEST_COMP",
    "OH_READ|CURRENT_AGE",
    "UTIL|LATEST_COMP",
}

# Shapes that bind ship(s) as a list param (:ship_ids uuid[]) even when only
# one ship is resolved. Required because their SQL templates use IN (:ship_ids)
# rather than a scalar = :ship_id.  expand_in_param() handles single-element
# lists correctly so there is no need for a special-case scalar path.
_MULTI_SHIP_PARAM_SHAPES = {
    "OH_READ|CURRENT_AGE_MULTI",
}


class ChatOrchestrator:
    """
    Top-level message handler.
    Owns the full nlpLayer pipeline and delegates to ToolOrchestrator.
    """

    def __init__(
        self,
        llm_service,
        entity_linker: EntityLinker,
        temporal_resolver: TemporalResolver,
        pattern_memory: PatternMemory,
        tool_orchestrator: "ToolOrchestrator",
    ):
        self._extractor = LLMExtractor(llm_service)
        self._linker    = entity_linker
        self._temporal  = temporal_resolver
        self._memory    = pattern_memory
        self._tools     = tool_orchestrator
        self._llm       = llm_service

    async def process_message(
        self,
        message: str,
        classifier: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Main entry point. Called from api/routes/chat.py.

        Args:
            message:    Raw user message (mapped from request.query in chat.py).
            classifier: Full frontend classifier output dict.
        """
        # ----------------------------------------------------------------
        # 0. Start fresh log for this run
        # ----------------------------------------------------------------
        clear_chat_log()
        log_stage("QUERY", f'"{message}"')

        # Parse frontend signal
        signal = IntentSignal.from_dict(classifier)
        log_stage(
            "FRONTEND",
            f"intent={signal.intent} multi_ship={signal.has_multiple_ships} "
            f"negation={signal.has_negation} comparison={signal.has_comparison} "
            f"matched_ships={[s['ship_name'] for s in signal.matched_ships]}"
        )

        # GENERAL — dedicated SQL pipeline
        if signal.intent == "GENERAL":
            log_stage("STAGE-0", "GENERAL intent → SQL pipeline")
            return await self._general_pipeline(message, signal)

        try:
            # ----------------------------------------------------------------
            # ⭐ STAGE-0 — Ship validation + catalogue fetch
            # ----------------------------------------------------------------
            log_stage("STAGE-0", "reading frontend-matched ships...")

            if not signal.matched_ships:
                log_stage("STAGE-0", "no ships found → early return")
                return {
                    "error": (
                        "Please mention a ship name in your query "
                        "(e.g. INS ONE, INS TWO)."
                    ),
                    "stage": "STAGE-0",
                }

            # Attach to resolved_ships — downstream stages read from here
            signal.resolved_ships = signal.matched_ships

            # Fetch scoped catalogue slice for the matched ship IDs only
            ship_ids = [s["ship_id"] for s in signal.matched_ships]
            signal.catalogue = self._linker.get_catalogue_slice(ship_ids)

            log_stage(
                "STAGE-0",
                f"ships: {[s['ship_name'] for s in signal.matched_ships]} "
                f"→ catalogue attached"
            )

            # ----------------------------------------------------------------
            # 1. LLM Extraction (catalogue-aware via signal.catalogue)
            # ----------------------------------------------------------------
            extraction = await self._extractor.extract(message, signal)

            # ----------------------------------------------------------------
            # 2. Entity Linking + Temporal Resolution (parallel)
            # ----------------------------------------------------------------
            async def _resolve_temporal():
                return self._temporal.resolve(
                    extraction.time_expression, signal.intent
                )

            resolved, temporal = await asyncio.gather(
                self._linker.resolve(extraction, signal),
                _resolve_temporal(),
            )

            # ----------------------------------------------------------------
            # 3. Pattern Memory — cache check
            # ----------------------------------------------------------------
            memory_result = self._memory.find(message, resolved, temporal)

            if memory_result and memory_result.hit:
                log_stage("MEMORY", f"HIT key={memory_result.key} confidence={memory_result.confidence}")
                tool_json = memory_result.tool_json
            else:
                # ----------------------------------------------------------------
                # 4. Cache miss — LLM builds tool_json, store pattern
                # ----------------------------------------------------------------
                log_stage("MEMORY", "MISS → building tool_json via LLM")
                tool_json = await self._build_tool_json(message, resolved, temporal, signal)
                self._memory.store(message, resolved, temporal, tool_json)

            # ----------------------------------------------------------------
            # 5. Execute
            # ----------------------------------------------------------------
            log_stage("EXECUTOR", f"intent={signal.intent} pairs={len(resolved.pairs)} triplets={len(resolved.triplets)}")
            result = await self._tools.execute(signal.intent, resolved, temporal)
            log_stage("RESPONSE", "success")
            return result

        except PipelineError as pe:
            log_stage("ERROR", str(pe))
            logger.warning("[Pipeline] %s", pe)
            return {"error": pe.message, "stage": pe.stage}

        except Exception as exc:
            log_stage("ERROR", f"unexpected: {exc}")
            logger.exception("[Pipeline] Unexpected error: %s", exc)
            return {"error": "An unexpected error occurred. Please try again."}

    async def _build_tool_json(
        self,
        message: str,
        resolved: ResolvedEntities,
        temporal: TemporalRange,
        signal: IntentSignal,
    ) -> Dict[str, Any]:
        """
        On cache miss: ask the LLM to build the tool_json structure.
        """
        time_params = temporal.to_params()

        if resolved.pairs:
            entities_str = json.dumps([
                {"component_id": p.component_id, "nomenclature": p.nomenclature,
                 "ship_id": p.ship_id, "ship_name": p.ship_name}
                for p in resolved.pairs
            ], indent=2)
            entity_type = "pairs"
        else:
            entities_str = json.dumps([
                {"sensor_id": t.sensor_id, "sensor_name": t.sensor_name,
                 "component_id": t.component_id, "nomenclature": t.nomenclature,
                 "ship_id": t.ship_id, "ship_name": t.ship_name}
                for t in resolved.triplets
            ], indent=2)
            entity_type = "triplets"

        prompt = f"""You are a tool argument builder for a naval maintenance system.

Intent: {signal.intent}
Resolved entities ({entity_type}):
{entities_str}
Time parameters: {json.dumps(time_params)}

Build the tool_json arguments object for this query.
Return ONLY valid JSON. No explanation.

{{
  "tool_name": "<appropriate tool name>",
  "arguments": {{
    "{entity_type}": <entities array>,
    <time params if applicable>
  }}
}}"""

        try:
            raw = await self._llm.call_llm(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
            )
            cleaned = raw.strip().lstrip("```json").lstrip("```").rstrip("```")
            return json.loads(cleaned)
        except Exception as exc:
            logger.error("[ChatOrchestrator] tool_json build failed: %s", exc)
            return {
                "tool_name": f"get_{signal.intent.lower()}",
                "arguments": {
                    entity_type: entities_str,
                    **time_params,
                }
            }

    async def _general_pipeline(
        self,
        message: str,
        signal: IntentSignal,
    ) -> Dict[str, Any]:
        """
        GENERAL intent pipeline.

        Stage order:
            0  → context setup (ships, catalogue)
            1  → LLM extraction (raw entities only)
            2  → Intent Kernel (action + entity_target, rules only)
            3  → Entity Linking (IDs + is_assembly)
            4  → Temporal Resolution
            5  → Shape Router (deterministic shape, no LLM)
            6  → Argument Builder (deterministic, no LLM)
            7  → SQLTool (cache → validate → execute)
            8  → Response
        """
        from mcp.tools import get_sql_memory
        from utils.nlpLayer.general.seed_patterns import seed_sql_patterns
        from utils.nlpLayer.general.intent_kernel import run as kernel_run
        from utils.nlpLayer.general.shape_router import route as shape_route

        SQL_MEMORY = get_sql_memory()
        await seed_sql_patterns(SQL_MEMORY)

        # ── STAGE 0 — context setup ───────────────────────────────────
        if signal.matched_ships:
            ship_ids         = [s["ship_id"] for s in signal.matched_ships]
            signal.catalogue = self._linker.get_catalogue_slice(ship_ids)
            log_stage(
                "STAGE-0",
                f"catalogue slice built for {[s['ship_name'] for s in signal.matched_ships]} "
                + "→ "
                + ", ".join(
                    f"{s['ship_name']}: "
                    f"{len(signal.catalogue.get(s['ship_id'], {}).get('components', []))} components, "
                    f"{len(signal.catalogue.get(s['ship_id'], {}).get('assembly_parents', []))} assembly parents, "
                    f"{len(signal.catalogue.get(s['ship_id'], {}).get('sensors', []))} sensors"
                    for s in signal.matched_ships
                )
            )
            log_stage(
                "STAGE-0",
                f"ships={[s['ship_name'] for s in signal.matched_ships]} → catalogue attached"
            )
        else:
            signal.catalogue = {}
            log_stage("STAGE-0", "no ships → fleet-wide query")

        # ── STAGE 1 — LLM extraction (raw entities only) ──────────────
        extraction = await self._extractor.extract(message, signal)
        log_stage(
            "EXTRACTOR",
            f"template=general"
        )
        log_stage(
            "EXTRACTOR",
            f"topic_hint=fault scope=sensor "
            f"ships={extraction.raw_ships} components={extraction.raw_components} "
            f"sensors={extraction.raw_sensors} time={extraction.time_expression}"
        )
        log_stage(
            "EXTRACTOR",
            f"ships={extraction.raw_ships} components={extraction.raw_components} "
            f"sensors={extraction.raw_sensors} time={extraction.time_expression}"
        )

        # ── STAGE 2 — Intent Kernel (rules, no LLM) ───────────────────
        kernel = kernel_run(message)
        log_stage(
            "KERNEL",
            f"action={kernel.action} entity_target={kernel.entity_target}"
        )

        # ── STAGE 3 — Entity Linking ──────────────────────────────────
        resolved = await self._linker.resolve_for_general(
            extraction=extraction,
            matched_ships=signal.matched_ships,
        )

        # Deduplicate at linker exit — prevents duplicate IDs reaching SQL
        # if the linker expands a synonym that maps to the same entity as a
        # directly named one. Last-write wins; assumes duplicates are equivalent.
        resolved.components = dedupe_by(resolved.components, "component_id")
        resolved.sensors    = dedupe_by(resolved.sensors, "sensor_id")
        resolved.ships      = list({s["ship_id"]: s for s in resolved.ships}.values())

        log_stage(
            "LINKER-G",
            f"ships={len(resolved.ships)} "
            f"components={len(resolved.components)} "
            f"sensors={len(resolved.sensors)}"
        )

        # ── STAGE 4 — Temporal Resolution ────────────────────────────
        temporal = self._temporal.resolve(
            extraction.time_expression, signal.intent
        )

        # ── STAGE 5 — Shape Router (deterministic) ────────────────────
        shape_result = shape_route(
            message=message,
            resolved=resolved,
            kernel=kernel,
            temporal=temporal,
        )
        log_stage("SHAPE", f"shape={shape_result.shape} route={shape_result.route}")

        # DOMAIN route — hand off to domain pipeline (future use)
        if shape_result.route == "DOMAIN":
            log_stage("SHAPE", f"DOMAIN route → not yet implemented, falling through")

        # ── STAGE 6 — Argument Builder (deterministic) ────────────────
        #
        # Always bind as lists — all GENERAL SQL templates use IN (:component_ids)
        # and IN (:sensor_ids), never = :component_id singular.
        # expand_in_param() in SQLTool expands the list into positional params.
        # Single-element lists are handled correctly by expand_in_param.
        #
        # Ship binding: components take priority over bare ship binding.
        #
        # BUG FIX: limit is now 1 for latest action on single-row shapes.
        # Previously hardcoded to 100, all latest queries returned up to 100
        # rows instead of just the most recent one. _SINGLE_ROW_SHAPES defines
        # the shapes where TOP(1) is the correct and expected behaviour.
        #
        # BUG FIX: shapes in _MULTI_SHIP_PARAM_SHAPES always receive :ship_ids
        # as a list, even when only one ship is resolved. Their SQL templates
        # use IN (:ship_ids) — never a scalar :ship_id — so the generic
        # single-ship → scalar heuristic must be bypassed for these shapes.

        _limit = (
            1
            if kernel.action == "latest" and shape_result.shape in _SINGLE_ROW_SHAPES
            else 100
        )

        arguments: Dict[str, Any] = {
            "shape": shape_result.shape,
            "limit": _limit,
        }

        if resolved.components:
            arguments["component_ids"] = [c.component_id for c in resolved.components]
        elif resolved.ships:
            ship_id_list = [s["ship_id"] for s in resolved.ships]
            if shape_result.shape in _MULTI_SHIP_PARAM_SHAPES:
                # Template uses IN (:ship_ids) — always bind as list.
                # expand_in_param() handles single-element lists correctly.
                arguments["ship_ids"] = ship_id_list
            elif len(ship_id_list) == 1:
                arguments["ship_id"] = ship_id_list[0]
            else:
                arguments["ship_ids"] = ship_id_list

        if resolved.sensors:
            arguments["sensor_ids"] = [s.sensor_id for s in resolved.sensors]

        if temporal.start_ts:
            arguments["start_date"] = temporal.start_ts.isoformat()
        if temporal.end_ts:
            arguments["end_date"] = temporal.end_ts.isoformat()

        if shape_result.aggregation:
            arguments["aggregation"] = shape_result.aggregation

        arguments["_user_query"] = message

        log_stage("KEY",    shape_result.shape)
        log_stage("PARAMS", f"bound arguments = {arguments}")

        # ── STAGE 7 — SQLTool ─────────────────────────────────────────
        log_stage("EXECUTOR", f"intent=GENERAL shape={shape_result.shape}")

        tool_result = await self._tools.execute_sql(arguments)

        if not tool_result.get("success"):
            error_msg = tool_result.get("error", "SQL execution failed.")
            log_stage("ERROR", error_msg)
            return {"error": error_msg, "stage": "SQL_TOOL"}

        # ── STAGE 8 — Response ────────────────────────────────────────
        data      = tool_result.get("data", {})
        row_count = data.get("row_count", 0)
        log_stage("RESPONSE", f"success rows={row_count}")

        return self._tools._wrap(
            intent="GENERAL",
            tool_name="sql_query",
            arguments={"shape": shape_result.shape},
            data=data,
        )


class ToolOrchestrator:
    """
    Routes to domain services with pre-resolved entities.
    Wraps all service output in the legacy tool_calls shape so the
    frontend does not need to change.

    Legacy shape the frontend expects:
        {
            "tool_calls": [
                {
                    "name": "<tool_name>",
                    "arguments": { ... },
                    "result": {
                        "success": true,
                        "data": { ... }
                    }
                }
            ],
            "intent": "<INTENT>",
            "response": "",
            "timestamp": "<ISO>"
        }
    """

    # Map intent → tool name (matches what the old frontend looked for)
    _TOOL_NAMES = {
        "RELIABILITY": "get_component_reliability",
        "RCM":         "get_rcm_records",
        "RUL":         "calculate_rul",
        "SENSOR":      "get_sensor_readings",
        "GENERAL":     "sql_query",
    }

    def __init__(
        self,
        reliability_service: Reliability,
        rcm_service: RCMService,
        rul_service: RULCalculationService,
        sensor_service: SensorReadingService,
        sql_tool,
    ):
        self._reliability = reliability_service
        self._rcm         = rcm_service
        self._rul         = rul_service
        self._sensors     = sensor_service
        self._sql_tool    = sql_tool

    async def execute(
        self,
        intent: str,
        resolved: ResolvedEntities,
        temporal: TemporalRange,
    ) -> Dict[str, Any]:
        """
        Route to the correct service, then wrap the result in the
        legacy tool_calls envelope the frontend expects.
        """
        if intent == "RELIABILITY":
            raw = await self._reliability.reliability(
                duration=temporal.duration_hours,
                pairs=resolved.pairs,
                explain=True
            )
            return self._wrap(
                intent=intent,
                tool_name=self._TOOL_NAMES[intent],
                arguments={"duration_hours": temporal.duration_hours},
                data={
                    "results":     raw,
                    "description": f"Reliability calculated for {len(raw)} component(s).",
                },
            )

        if intent == "RCM":
            raw = await self._rcm.get_rcm(pairs=resolved.pairs)
            return self._wrap(
                intent=intent,
                tool_name=self._TOOL_NAMES[intent],
                arguments={},
                data={
                    "results":     raw,
                    "description": f"RCM records retrieved for {len(raw)} component(s).",
                },
            )

        if intent == "RUL":
            raw = await self._rul.rul(triplets=resolved.triplets)
            return self._wrap(
                intent=intent,
                tool_name=self._TOOL_NAMES[intent],
                arguments={},
                data=raw,
            )

        if intent == "SENSOR":
            raw = await self._sensors.sensor_readings(
                triplets=resolved.triplets,
                temporal=temporal,
            )
            return self._wrap(
                intent=intent,
                tool_name=self._TOOL_NAMES[intent],
                arguments={
                    "start": raw.get("time_window", {}).get("start"),
                    "end":   raw.get("time_window", {}).get("end"),
                },
                data=raw,
            )

        return {"intent": intent, "error": f"Unknown intent: {intent}"}

    async def execute_sql(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a GENERAL intent SQL query via SQLTool."""
        return await self._sql_tool.execute(arguments)

    # ------------------------------------------------------------------
    # Envelope builder
    # ------------------------------------------------------------------

    @staticmethod
    def _wrap(
        intent: str,
        tool_name: str,
        arguments: Dict[str, Any],
        data: Any,
    ) -> Dict[str, Any]:
        """
        Wraps service output in the legacy tool_calls shape.
        """
        return {
            "response":   "",
            "intent":     intent,
            "timestamp":  datetime.now(timezone.utc).isoformat(),
            "tool_calls": [
                {
                    "name":      tool_name,
                    "arguments": arguments,
                    "result": {
                        "success": True,
                        "data":    data,
                    },
                }
            ],
        }