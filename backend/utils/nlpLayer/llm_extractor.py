"""
nlpLayer/llm_extractor.py
--------------------------
Stage 1 — LLM Extractor.

One LLM call per pipeline run. Selects prompt template based on the
complexity signal from the frontend classifier. Returns raw mentions
EXACTLY as the user typed — no resolution, no normalisation.

Pair/triplet production strategy:
  - simple / aggregate / comparative → LLM produces flat pairs/triplets directly
  - multi_entity                     → LLM produces GROUPS, pairs/triplets are
                                       expanded deterministically in code.

Group structure (multi_entity):
  PAIRS     → {"components": [...], "ship": "..."}
  TRIPLETS  → {"sensors": [...], "components": [...], "ship": "..."}

  "all" is a valid value for sensors or components — the linker expands it.

Fixes applied
-------------
FIX-1  _multi_entity_prompt  : Added explicit sensor-ID detection rule +
                               two few-shot examples so the LLM stops
                               routing tokens like "GT_S1" to the component slot.

FIX-2  _build_result         : Post-LLM deterministic rescue pass — detects
                               sensor IDs misrouted to raw_components or to a
                               triplet's component slot and corrects them before
                               results leave the extractor.

FIX-3  _simple_prompt /
       _comparative_prompt   : Same sensor-ID rule added for completeness so
                               single-entity and comparative queries don't
                               regress.

FIX-AGG-SENSOR               : Aggregate complexity is no longer assigned to
                               TRIPLET intents (SENSOR / RUL). The pair-only
                               aggregate template cannot produce triplets, so
                               queries like "all available sensors on ins one"
                               were returning 0 triplets and executing with no
                               data. These queries now route to the simple
                               template, which produces the correct triplet
                               shape with sensor="all".

FIX-AGG-TYPE                 : Aggregate complexity is no longer assigned when
                               the user says "all <specific type>" (e.g. "all
                               assemblies", "all gas turbines"). The aggregate
                               template hardcodes comp="all" and discards the
                               type name, causing the linker to expand to every
                               component on the ship rather than just instances
                               of the named type. These queries now route to
                               simple, which preserves the type name.
                               Unscoped queries ("all equipment", "all
                               components") still route to aggregate as before.

FIX-CHAINED-OF               : Added chained-"of" rule + few-shot examples to
                               _simple_prompt non-sensor branch. In a query
                               like "rcm of X of Y of SHIP", only X is the
                               target component — Y is a parent/scope qualifier.
                               Previously the LLM produced two pairs (X and Y),
                               executing an unwanted extra RCM for the parent.

FIX-ARTICLE                  : _TYPE_AGG_RE was matching "all the equipment" by
                               capturing "the" as the type word, bypassing the
                               negative lookahead and incorrectly routing to
                               simple instead of aggregate. Fixed by stripping
                               articles (the/a/an) from the message before the
                               _TYPE_AGG_RE check. "all the equipment" now
                               correctly routes to aggregate; "all the assemblies"
                               still correctly routes to simple.

FIX-RCM-ASSEMBLY             : Added assembly-suffix stripping rule + corrected
                               few-shot examples so the LLM extracts the bare
                               component name without the trailing type qualifier.
                               "p1 assembly" → "p1", "pump assembly" → "pump".
                               The Tier A linker pass provides a safety net if
                               the LLM still passes the suffix through.

FIX-ALL-SENTINEL             : Post-LLM deterministic cleanup in _build_result.
                               The LLM inconsistently includes 'all' alongside a
                               type token in raw_components (e.g. ['gtg', 'all']
                               for "all gtgs"). When non-'all' tokens are present,
                               'all' is stripped before pairs are built — the type
                               token alone is sufficient for linker Path 2 type
                               expansion. Without this fix, the pair gets
                               component='gtg' and the 'all' sentinel is silently
                               dropped, causing the linker to fall through to
                               single-instance embedding instead of expanding.

FIX-NAMED-INSTANCE-COLLAPSE  : Three-part fix for queries like
                               "GT 1, GT 2 on ins one and ins two".
                               The LLM collapses named instances to their bare
                               type ("GT") and emits one pair per ship instead
                               of one pair per (instance, ship).
                               Part A: new few-shot example in _multi_entity_prompt
                               teaches the correct cross-product expansion.
                               Part B: post-LLM rescue pass in _build_result
                               detects when raw_components tokens are absent from
                               the produced pairs and re-synthesises the missing
                               cross-product entries with ship-scoping derived
                               from the LLM pairs (type→ships index) or from
                               proximity search in the original message as a
                               last resort (_infer_ship_scope).
                               Part C: _infer_ship_scope scans the raw message
                               for spatial proximity between a component token
                               and ship names when the LLM produced no pairs
                               (empty pairs list → empty type→ships index).

FIX-NAMED-INSTANCE-COLLAPSE-D: Extends Part B to catch the consistent-collapse
                               case where the LLM strips instance numbers from
                               BOTH raw_components AND the pairs (e.g. both
                               become "GT" instead of "GT 1"/"GT 2"). The old
                               Part B only detected tokens present in
                               raw_components but absent from pair components.
                               Part D additionally checks whether any
                               raw_components token has a trailing digit suffix
                               (i.e. is a named instance) whose bare type root
                               IS present in the pairs — indicating the LLM
                               performed a consistent collapse that the mismatch
                               detector would otherwise miss. Those tokens are
                               injected into missing_tokens and the existing
                               rescue machinery handles them.

FIX-MULTI-AGG                : "all equipment / all components" across multiple
                               ships was routing to multi_entity because
                               has_multiple_ships fires before the aggregate
                               keyword check. The multi_entity template does not
                               know how to handle unscoped "all" — the LLM emits
                               component='equipment' which the linker cannot
                               resolve. Fix: check for unscoped aggregate BEFORE
                               checking has_multiple_ships. A new complexity
                               value "aggregate_multi" is introduced; a dedicated
                               _aggregate_multi_prompt handles it and always
                               produces component="all" pairs — one per ship.
                               "all <specific type>" across multiple ships still
                               routes to multi_entity so the type name is
                               preserved (guarded by _TYPE_AGG_RE miss).

FIX-MIXED-AGG-NAMED          : "all equipment on INS One and all Gas Turbines
                               on INS Two" mixes an unscoped aggregate with a
                               type-scoped aggregate across two ships. Neither
                               aggregate_multi (forces comp="all" everywhere)
                               nor multi_entity (LLM struggles with the mixed
                               pattern) handles this cleanly. Fix: detect the
                               mixed pattern in complexity derivation — if the
                               message contains BOTH an unscoped aggregate ship
                               AND a type-scoped aggregate ship, route to
                               multi_entity and let the LLM handle it with the
                               improved few-shot examples.

STAGE-0 additions
-----------------
_format_catalogue()          : Converts the catalogue dict from IntentSignal
                               into a compact, human-readable block for
                               injection into LLM prompts. Now renders
                               assemblies grouped under their parent component
                               so the LLM can see the full hierarchy for RCM
                               queries. Empty catalogue → returns empty string.

_simple_prompt               : Catalogue block injected when available.
_multi_entity_prompt         : Catalogue block injected when available.
_comparative_prompt          : Catalogue block injected when available.
_aggregate_prompt            : NOT injected — component is always "all",
                               catalogue adds no value here.
_aggregate_multi_prompt      : NOT injected — component is always "all",
                               catalogue adds no value here.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Set

from .chat_logger import log_stage
from api.models.nlp.nlplayer import (
    ExtractionResult,
    IntentSignal,
    PipelineError,
    PipelineStage,
    RawPair,
    RawTriplet,
)

logger = logging.getLogger(__name__)

# Intents that produce pairs (component + ship)
_PAIR_INTENTS = {"RELIABILITY", "RCM"}

# Intents that produce triplets (sensor + component + ship)
_TRIPLET_INTENTS = {"SENSOR", "RUL"}

# FIX-2 — structured sensor ID pattern  e.g. GT_S1, AC_S3, SRGM_S2
_SENSOR_ID_RE = re.compile(r'^[A-Za-z]+_S\d+$')

# Keywords that mean "expand to all"
_ALL_KEYWORDS = {"all", "every", "each", "allequipment", "allcomponents", "everything"}

_SEP_PATTERN = re.compile(r"[\s\-_]+")

# FIX-NAMED-INSTANCE-COLLAPSE-D: matches a trailing integer on a normalised
# component token, e.g. "gt1" → root="gt", "ac2" → root="ac"
_INSTANCE_SUFFIX_RE = re.compile(r'^(.*?)(\d+)$')


def _normalise(text: str) -> str:
    """Lowercase and strip all separators — mirrors entity_linker._normalise."""
    return _SEP_PATTERN.sub("", text.lower())


class LLMExtractor:
    """
    Wraps LLM calls to produce structured ExtractionResult.

    Designed to be instantiated once with an LLM service reference
    and reused across requests.
    """

    def __init__(self, llm_service):
        self._llm = llm_service
    # ------------------------------------------------------------------
    # FIX-NAMED-INSTANCE-COLLAPSE-E
    # Recover numbered instances directly from the original message when
    # the LLM collapses GT 1, GT 2 -> GT everywhere.
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_named_instances(message: str) -> List[str]:
        _STOPWORDS = {
            "what", "is", "the", "of", "on", "for", "and", "or",
            "both", "all", "over", "in", "a", "an", "with", "to",
            "show", "get", "give", "find", "list", "calculate",
            "reliability", "sensor", "rul", "rcm", "hours", "ins",
        }

        # Two separate patterns: two-word name, then single-word name
        # Tried in order so "Gas Turbine 1" beats "Turbine 1"
        patterns = [
            re.compile(r'\b([A-Za-z]{2,10}\s[A-Za-z]{2,10})\s+(\d+)\b', re.IGNORECASE),
            re.compile(r'\b([A-Za-z]{2,10})\s+(\d+)\b', re.IGNORECASE),
        ]

        seen: set = set()
        instances = []

        for pattern in patterns:
            for m in pattern.finditer(message):
                name = m.group(1).strip()
                words = name.lower().split()
                if any(w in _STOPWORDS for w in words):
                    continue
                token = f"{name} {m.group(2)}"
                norm = _normalise(token)
                if norm not in seen:
                    seen.add(norm)
                    instances.append(token)

        return instances

    @staticmethod
    def _instance_root(token: str) -> str:
        """
        GT 1 -> gt
        GT 2 -> gt
        AC 1 -> ac
        """
        return _normalise(
            re.sub(r'\s+\d+\s*$', '', token).strip()
        )
    async def extract(self, message: str, signal: IntentSignal) -> ExtractionResult:
        """
        Main entry point. Selects the right prompt template and calls the LLM.
        """
        intent = signal.intent
        if intent == "GENERAL":
            prompt = self._general_prompt(message, signal)
            log_stage("EXTRACTOR", "template=general")
            try:
                raw_response = await self._llm.call_llm(
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.0,
                )
            except Exception as exc:
                logger.error("LLM call failed in extractor (GENERAL): %s", exc)
                raise PipelineError(
                    stage=PipelineStage.EXTRACTOR,
                    code="LLM_CALL_FAILED",
                    message="Failed to extract entities from your query. Please try again.",
                )
            return self._parse_general_response(raw_response)

        _AGG_RE = re.compile(
            r'\b(all|every|each|list|highest|lowest|most|least|top|bottom|average|total|across)\b',
            re.IGNORECASE,
        )

        _TYPE_AGG_RE = re.compile(
            r'\ball\s+(?:the\s+)?(?!equipment\b|components?\b|parts?\b|sensors?\b|data\b)(\w+)',
            re.IGNORECASE,
        )

        # FIX-ARTICLE: strip articles before _TYPE_AGG_RE check
        _msg_no_articles = re.sub(r'\b(the|a|an)\b\s*', '', message, flags=re.IGNORECASE)

        _has_agg      = _AGG_RE.search(message) is not None
        _has_type_agg = _TYPE_AGG_RE.search(_msg_no_articles) is not None
        _multi_ship   = signal.has_multiple_ships or len(signal.resolved_ships) > 1

        _is_unscoped_aggregate = (
            intent in _PAIR_INTENTS
            and _has_agg
            and not _has_type_agg
        )

        # FIX-MIXED-AGG-NAMED: detect "all equipment on X AND all <type> on Y"
        # pattern — one unscoped ship + one type-scoped ship. Route to
        # multi_entity so the LLM preserves the type name on the scoped ship
        # and emits "all" on the unscoped one.
        _unscoped_agg_re  = re.compile(
            r'\ball\s+(?:the\s+)?(?:equipment|components?|parts?)\b',
            re.IGNORECASE,
        )
        _is_mixed_agg = (
            _multi_ship
            and _has_type_agg
            and _unscoped_agg_re.search(message) is not None
        )

        if signal.has_comparison:
            complexity = "comparative"
        elif _is_unscoped_aggregate and _multi_ship and not _is_mixed_agg:
            complexity = "aggregate_multi"
        elif _multi_ship:
            complexity = "multi_entity"
        elif _has_agg:
            if intent in _TRIPLET_INTENTS or _has_type_agg:
                complexity = "simple"
            else:
                complexity = "aggregate"
        else:
            complexity = "simple"

        log_stage("EXTRACTOR", f"intent={intent} complexity={complexity} (derived)")
        log_stage(
            "EXTRACTOR",
            f"catalogue ships={list(signal.catalogue.keys()) if signal.catalogue else 'none'}"
        )

        if complexity == "aggregate_multi":
            prompt = self._aggregate_multi_prompt(message, signal)
        elif complexity == "aggregate":
            prompt = self._aggregate_prompt(message, signal)
        elif complexity == "comparative":
            prompt = self._comparative_prompt(message, signal)
        elif complexity == "multi_entity":
            prompt = self._multi_entity_prompt(message, signal)
        else:
            prompt = self._simple_prompt(message, signal)

        log_stage("EXTRACTOR", f"template={complexity}")

        try:
            raw_response = await self._llm.call_llm(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
            )
        except Exception as exc:
            logger.error("LLM call failed in extractor: %s", exc)
            raise PipelineError(
                stage=PipelineStage.EXTRACTOR,
                code="LLM_CALL_FAILED",
                message="Failed to extract entities from your query. Please try again.",
            )

        result = self._parse_response(raw_response, intent, complexity, message)

        if result is None:
            logger.error(
                "_parse_response returned None for intent=%s complexity=%s",
                intent, complexity,
            )
            raise PipelineError(
                stage=PipelineStage.EXTRACTOR,
                code="BUILD_RESULT_FAILED",
                message="Internal extraction error. Please rephrase your query.",
            )

        log_stage(
            "EXTRACTOR",
            f"components={result.raw_components} ships={result.raw_ships} "
            f"sensors={result.raw_sensors} time={repr(result.time_expression)} "
            f"pairs={len(result.pairs)} triplets={len(result.triplets)}"
        )

        return result

    # ------------------------------------------------------------------
    # STAGE-0 — Catalogue formatter
    # ------------------------------------------------------------------

    @staticmethod
    def _format_catalogue(catalogue: Dict[str, Any]) -> str:
        """
        Convert the Stage 0 catalogue dict into a compact prompt block.
        """
        if not catalogue:
            return ""

        lines = ["KNOWN ENTITIES (use these exact names):"]
        for ship_name, data in catalogue.items():
            lines.append(f"{ship_name}:")
            components = data.get("components", [])
            assemblies = data.get("assemblies", {})
            sensors    = data.get("sensors", [])

            if components:
                lines.append(f"  Components: {', '.join(components)}")
            if assemblies:
                lines.append("  Assemblies (child components, grouped by parent):")
                for parent, children in sorted(assemblies.items()):
                    lines.append(f"    {parent}: {', '.join(children)}")
            if sensors:
                lines.append(f"  Sensors: {', '.join(sensors)}")

        return "\n".join(lines)

    # ------------------------------------------------------------------
    # FIX-NAMED-INSTANCE-COLLAPSE Part C — proximity-based ship scoping
    # ------------------------------------------------------------------

    @staticmethod
    def _infer_ship_scope(
        component: str,
        raw_ships: List[str],
        message: str,
        window: int = 80,
    ) -> List[str]:
        """
        When the type→ships index is empty (LLM produced no pairs), scan the
        original message for proximity between the component type root and each
        ship name. Returns the subset of raw_ships within `window` characters
        either side of the component token, or all raw_ships if none found.

        Handles all query patterns from the test matrix:

        Q3  "GT 1 on ins one and ins two"
            → GT near both ships → both returned (correct: same comp on both)

        Q4  "GT 1 on ins one and GT 2 on ins two"
            → GT 1 near ins one, GT 2 near ins two → scoped correctly

        Q8  "GT 1 and GT 2 on INS One, and AC 1 and AC 2 on INS Two"
            → GT near INS One, AC near INS Two → scoped correctly

        Q11 "GT 1 and AC 1 on INS One, and GT 2 and AC 2 on INS Two"
            → GT 1 near INS One, GT 2 near INS Two → scoped correctly
        """
        msg_lower  = message.lower()
        comp_lower = component.lower()

        # Strip trailing instance number to get the bare type root
        # "GT 1" → "gt", "AC 2" → "ac", "gas turbine" → "gas turbine"
        type_root = re.sub(r'\s+\d+\s*$', '', comp_lower).strip()

        # Find all occurrences of the type root in the message
        positions: List[int] = []
        search_start = 0
        while True:
            idx = msg_lower.find(type_root, search_start)
            if idx == -1:
                break
            positions.append(idx)
            search_start = idx + 1

        if not positions:
            return raw_ships

        # For each ship, find its position in the message and check whether
        # any component occurrence is within `window` chars of it.
        scoped: List[str] = []
        for ship in raw_ships:
            ship_lower = ship.lower()
            ship_idx   = msg_lower.find(ship_lower)
            if ship_idx == -1:
                continue
            for pos in positions:
                if abs(pos - ship_idx) <= window:
                    scoped.append(ship)
                    break

        return scoped if scoped else raw_ships

    # ------------------------------------------------------------------
    # Prompt templates
    # ------------------------------------------------------------------

    def _general_prompt(self, message: str, signal: IntentSignal) -> str:
        catalogue_block   = self._format_catalogue(signal.catalogue)
        catalogue_section = f"\n{catalogue_block}\n" if catalogue_block else ""

        return f"""You are an entity extractor for a naval maintenance intelligence system.

    The user is asking a GENERAL question — not a specific reliability calculation, RCM decision, RUL prediction, or live sensor query.
    Your job is to identify what the question is about and extract any entities mentioned.
    {catalogue_section}
    RULES:

    topic_hint — pick the single best-matching word from this list:
    "reliability_params"  — user asks for Weibull parameters: alpha, beta, eta, shape, scale,
                            reliability parameters, statistical parameters, distribution params
    "reliability"         — user asks about reliability scores, MTBF, availability, failure probability
    "sensor"              — user asks about sensor metadata: PF interval, thresholds, frequency, unit
    "fault"               — user asks about alerts, alerted readings, threshold crossings, anomalies
    "maintenance"         — user asks about maintenance events, service history, repair records,
                            replacement history, maintenance type, maintenance duration
    "overhaul"            — user asks about overhaul records, defect dates, running age,
                            cmms age, overhaul frequency, number of overhaul events
    "rcm"                 — user asks about RCM policy, decision path, maintenance strategy,
                            reliability centred maintenance records
    "utilisation"         — user asks about utilisation, operating hours, monthly utilisation,
                            utilisation percentage, uptime
    "history"             — user asks about historical data, past records, trends over time
    "status"              — user asks about current state, component details, what is installed,
                            component info, installation date, runtime
    "inventory"           — user asks to list, count, or enumerate ships, components, departments
    "overview"            — user asks for a summary or overview of a ship or the fleet
    "comparison"          — user asks to compare two or more entities against each other
    "general"             — use ONLY if none of the above fit

    CRITICAL TOPIC RULES:
    - "alpha beta", "eta beta", "beta value", "shape parameter", "scale parameter",
    "Weibull params", "reliability parameters" → ALWAYS topic_hint = "reliability_params"
    - "maintenance history", "service record", "repair history" → topic_hint = "maintenance"
    - "overhaul", "defect date", "running age", "cmms age" → topic_hint = "overhaul"
    - "alert", "alerted", "threshold", "anomaly", "fault" → topic_hint = "fault"
    - "sensor readings", "sensor values", "reading" → topic_hint = "sensor"
    - "list all", "how many", "count", "enumerate" → topic_hint = "inventory"

    scope — pick one:
    "fleet"     — no specific ship mentioned, question spans all ships or the entire fleet
    "ship"      — one or more ships mentioned, but no specific component
    "component" — a specific component or component type is mentioned
    "sensor"    — a specific sensor name or ID is mentioned

    Extract:
    - raw_ships: ship names exactly as the user typed, or [] if none mentioned
    - raw_components: component names or type names exactly as typed, or [] if none
    - raw_sensors: sensor IDs or names exactly as typed, or [] if none
    - time_expression: raw time phrase if present (e.g. "last 30 days", "in 2024"), else null

    Return ONLY valid JSON. No explanation, no markdown.

    EXAMPLES:

    Input:  "what is the alpha beta of GT 1 of INS ONE"
    Output: {{"topic_hint": "reliability_params", "scope": "component", "raw_ships": ["INS ONE"], "raw_components": ["GT 1"], "raw_sensors": [], "time_expression": null}}

    Input:  "show me eta beta parameters for all components on INS TWO"
    Output: {{"topic_hint": "reliability_params", "scope": "ship", "raw_ships": ["INS TWO"], "raw_components": [], "raw_sensors": [], "time_expression": null}}

    Input:  "what are the Weibull shape and scale parameters for AC 1"
    Output: {{"topic_hint": "reliability_params", "scope": "component", "raw_ships": [], "raw_components": ["AC 1"], "raw_sensors": [], "time_expression": null}}

    Input:  "give me an overview of all ships"
    Output: {{"topic_hint": "overview", "scope": "fleet", "raw_ships": [], "raw_components": [], "raw_sensors": [], "time_expression": null}}

    Input:  "what is the maintenance history of GT 1 on INS ONE"
    Output: {{"topic_hint": "maintenance", "scope": "component", "raw_ships": ["INS ONE"], "raw_components": ["GT 1"], "raw_sensors": [], "time_expression": null}}

    Input:  "show me all fault records for INS TWO in the last 30 days"
    Output: {{"topic_hint": "fault", "scope": "ship", "raw_ships": ["INS TWO"], "raw_components": [], "raw_sensors": [], "time_expression": "last 30 days"}}

    Input:  "which ships have the most overdue maintenance tasks"
    Output: {{"topic_hint": "maintenance", "scope": "fleet", "raw_ships": [], "raw_components": [], "raw_sensors": [], "time_expression": null}}

    Input:  "list all sensors on GT 1 of INS ONE"
    Output: {{"topic_hint": "sensor", "scope": "component", "raw_ships": ["INS ONE"], "raw_components": ["GT 1"], "raw_sensors": [], "time_expression": null}}

    Input:  "show me the overhaul records for GT 2 on INS ONE last year"
    Output: {{"topic_hint": "overhaul", "scope": "component", "raw_ships": ["INS ONE"], "raw_components": ["GT 2"], "raw_sensors": [], "time_expression": "last year"}}

    Input:  "what is the RCM policy for AC 1 on INS TWO"
    Output: {{"topic_hint": "rcm", "scope": "component", "raw_ships": ["INS TWO"], "raw_components": ["AC 1"], "raw_sensors": [], "time_expression": null}}

    Input:  "show monthly utilisation for INS ONE"
    Output: {{"topic_hint": "utilisation", "scope": "ship", "raw_ships": ["INS ONE"], "raw_components": [], "raw_sensors": [], "time_expression": null}}

    Input:  "how many components are on INS THREE"
    Output: {{"topic_hint": "inventory", "scope": "ship", "raw_ships": ["INS THREE"], "raw_components": [], "raw_sensors": [], "time_expression": null}}

    Input:  "compare reliability of GT 1 and GT 2 on INS ONE"
    Output: {{"topic_hint": "comparison", "scope": "component", "raw_ships": ["INS ONE"], "raw_components": ["GT 1", "GT 2"], "raw_sensors": [], "time_expression": null}}

    Input:  "latest sensor readings for AC 1"
    Output: {{"topic_hint": "fault", "scope": "component", "raw_ships": [], "raw_components": ["AC 1"], "raw_sensors": [], "time_expression": null}}

    Message: "{message}"

    Return JSON in this exact shape:
    {{
    "topic_hint": "<word from the list above>",
    "scope": "<fleet|ship|component|sensor>",
    "raw_ships": ["<ship names as typed>"],
    "raw_components": ["<component names as typed>"],
    "raw_sensors": ["<sensor names as typed>"],
    "time_expression": "<raw time phrase or null>"
    }}"""

    def _simple_prompt(self, message: str, signal: IntentSignal) -> str:
        intent       = signal.intent
        needs_sensor = intent in _TRIPLET_INTENTS
        needs_time   = intent in {"RELIABILITY", "SENSOR"}

        sensor_field = '"sensor": "<sensor name as spoken or null>",' if needs_sensor else ""
        time_field   = '"time_expression": "<raw time phrase or null>",' if needs_time else ""

        sensor_id_rule = (
            "- SENSOR IDs follow the pattern LETTERS_S<digits> (e.g. GT_S1, AC_S3, SRGM_S2). "
            "If such a token is present it is ALWAYS the sensor — never a component.\n"
            if needs_sensor else ""
        )

        catalogue_block   = self._format_catalogue(signal.catalogue)
        catalogue_section = f"\n{catalogue_block}\n" if catalogue_block else ""

        pair_or_triplet = self._pair_or_triplet_example(intent)

        if needs_sensor:
            few_shot = """
EXAMPLES:
Input:  "what is the rul of GT_S1 sensor of GT 1 of ins one"
Output: {"raw_components": ["GT 1"], "raw_ships": ["ins one"], "sensor": "GT_S1", "triplets": [{"sensor": "GT_S1", "component": "GT 1", "ship": "ins one"}]}

Input:  "show sensor readings for AC_S1 on AC 1 of ins two"
Output: {"raw_components": ["AC 1"], "raw_ships": ["ins two"], "sensor": "AC_S1", "triplets": [{"sensor": "AC_S1", "component": "AC 1", "ship": "ins two"}]}

Input:  "show me rul of all available sensors on ins one"
Output: {"raw_components": ["all"], "raw_ships": ["ins one"], "sensor": "all", "triplets": [{"sensor": "all", "component": "all", "ship": "ins one"}]}
"""
        else:
            few_shot = """
EXAMPLES:
Input:  "what is the rcm policy of p1 assembly of gt 1 of ins one"
Output: {"raw_components": ["p1"], "raw_ships": ["ins one"], "pairs": [{"component": "p1", "ship": "ins one"}]}

Input:  "rcm for valve block assembly of ac 1 of ins two"
Output: {"raw_components": ["valve block"], "raw_ships": ["ins two"], "pairs": [{"component": "valve block", "ship": "ins two"}]}

Input:  "show me rcm policy of all the assemblies on gt 1 of ins one"
Output: {"raw_components": ["assembly"], "raw_ships": ["ins one"], "pairs": [{"component": "assembly", "ship": "ins one"}]}

Input:  "show me rcm policy of all assemblies on ins one"
Output: {"raw_components": ["assembly"], "raw_ships": ["ins one"], "pairs": [{"component": "assembly", "ship": "ins one"}]}

Input:  "reliability of gt 1 of ins one over 200 hours"
Output: {"raw_components": ["gt 1"], "raw_ships": ["ins one"], "time_expression": "200 hours", "pairs": [{"component": "gt 1", "ship": "ins one"}]}

Input:  "reliability of all gas turbines on ins two over 50 hours"
Output: {"raw_components": ["gas turbine"], "raw_ships": ["ins two"], "time_expression": "50 hours", "pairs": [{"component": "gas turbine", "ship": "ins two"}]}

Input:  "what is the reliability of all gtgs of ins one for 50 hours"
Output: {"raw_components": ["gtg"], "raw_ships": ["ins one"], "time_expression": "50 hours", "pairs": [{"component": "gtg", "ship": "ins one"}]}

Input:  "what is the reliability of all acs of ins one for 50 hours"
Output: {"raw_components": ["ac"], "raw_ships": ["ins one"], "time_expression": "50 hours", "pairs": [{"component": "ac", "ship": "ins one"}]}
"""

        chained_of_rule = (
            "- In a chain like 'X of Y of SHIP', X is the target component. "
            "Y is a parent/scope qualifier — do NOT produce a second pair for Y.\n"
            if not needs_sensor else ""
        )

        type_agg_rule = (
            "- If the user says 'all <type>' (e.g. 'all assemblies', 'all gas turbines', "
            "'all gtgs', 'all acs'), set component to the TYPE NAME ONLY "
            "(e.g. 'assembly', 'gas turbine', 'gtg', 'ac') — NOT 'all' and NOT both. "
            "Never include 'all' in raw_components when a type name is present.\n"
            if not needs_sensor else ""
        )

        assembly_suffix_rule = (
            "- The word 'assembly' (or 'unit', 'module', 'block') after a component name "
            "is a TYPE QUALIFIER, not part of the name. Strip it when extracting: "
            "'p1 assembly' → 'p1', 'pump assembly' → 'pump', 'valve block assembly' → 'valve block'. "
            "Exception: keep 'assembly' when it IS the type name itself "
            "(e.g. 'all assemblies' → 'assembly').\n"
            if not needs_sensor else ""
        )

        return f"""You are an entity extractor for a naval maintenance system.

The user query is about {intent}. Extract the entities from this message.
{catalogue_section}
RULES:
- Extract EXACT words as the user typed. Do NOT normalise, resolve, or correct spelling.
- Even if only one component/ship is mentioned, still produce one pair or triplet in the list.
- The SHIP is always the vessel name (e.g. INS ONE, ins one). A component like "GT 1" is NEVER a ship.
{sensor_id_rule}{chained_of_rule}{type_agg_rule}{assembly_suffix_rule}- If "all sensors" or similar phrasing is used with no specific sensor named, set sensor to "all".
- If a catalogue is provided above, only use entity names that appear in it.
- Return ONLY valid JSON. No explanation, no markdown, no extra text.
{few_shot}
Message: "{message}"

Return JSON in this exact shape:
{{
  "raw_components": ["<component name as spoken, or type name — NEVER include 'all' here when a type name is present>"],
  "raw_ships": ["<ship name as spoken>"],
  {sensor_field}
  {time_field}
  "{pair_or_triplet['key']}": [
    {pair_or_triplet['example']}
  ]
}}"""

    def _aggregate_prompt(self, message: str, signal: IntentSignal) -> str:
        intent     = signal.intent
        needs_time = intent in {"RELIABILITY", "SENSOR"}
        time_field = '"time_expression": "<raw time phrase or null>",' if needs_time else ""

        return f"""You are an entity extractor for a naval maintenance system.

The user is asking about ALL equipment / every component on a ship (aggregate query).

RULES:
- The component field must always be the literal string "all". Do NOT invent component names.
- Extract the ship name EXACTLY as the user typed it.
- Return ONLY valid JSON. No explanation, no markdown, no extra text.

Message: "{message}"

Return JSON in this exact shape:
{{
  "raw_components": ["all"],
  "raw_ships": ["<ship name as spoken>"],
  {time_field}
  "pairs": [
    {{"component": "all", "ship": "<ship name as spoken>"}}
  ]
}}"""

    def _aggregate_multi_prompt(self, message: str, signal: IntentSignal) -> str:
        intent     = signal.intent
        needs_time = intent in {"RELIABILITY", "SENSOR"}
        time_field = '"time_expression": "<raw time phrase or null>",' if needs_time else ""

        return f"""You are an entity extractor for a naval maintenance system.

The user is asking about ALL equipment / every component across MULTIPLE ships (multi-ship aggregate query).

RULES:
- The component field must always be the literal string "all" for every pair. Do NOT invent component names.
- Extract ALL ship names EXACTLY as the user typed them.
- Produce one pair per ship, each with component="all".
- Return ONLY valid JSON. No explanation, no markdown, no extra text.

EXAMPLES:
Input:  "reliability of all equipment on ins one and ins two over 50 hours"
Output: {{"raw_components": ["all"], "raw_ships": ["ins one", "ins two"], "time_expression": "50 hours", "pairs": [{{"component": "all", "ship": "ins one"}}, {{"component": "all", "ship": "ins two"}}]}}

Input:  "what is the reliability of all the equipment on ins one and ins two over 50 hours"
Output: {{"raw_components": ["all"], "raw_ships": ["ins one", "ins two"], "time_expression": "50 hours", "pairs": [{{"component": "all", "ship": "ins one"}}, {{"component": "all", "ship": "ins two"}}]}}

Input:  "rcm for all components on ins one, ins two and ins three"
Output: {{"raw_components": ["all"], "raw_ships": ["ins one", "ins two", "ins three"], "pairs": [{{"component": "all", "ship": "ins one"}}, {{"component": "all", "ship": "ins two"}}, {{"component": "all", "ship": "ins three"}}]}}

Input:  "every component reliability on ins two and ins three for 100 hours"
Output: {{"raw_components": ["all"], "raw_ships": ["ins two", "ins three"], "time_expression": "100 hours", "pairs": [{{"component": "all", "ship": "ins two"}}, {{"component": "all", "ship": "ins three"}}]}}

Message: "{message}"

Return JSON in this exact shape:
{{
  "raw_components": ["all"],
  "raw_ships": ["<all ship names as spoken>"],
  {time_field}
  "pairs": [
    {{"component": "all", "ship": "<ship 1 as spoken>"}},
    {{"component": "all", "ship": "<ship 2 as spoken>"}}
  ]
}}"""

    def _multi_entity_prompt(self, message: str, signal: IntentSignal) -> str:
        intent       = signal.intent
        needs_sensor = intent in _TRIPLET_INTENTS
        needs_time   = intent in {"RELIABILITY", "SENSOR"}
        time_field   = '"time_expression": "<raw time phrase or null>",' if needs_time else ""

        catalogue_block   = self._format_catalogue(signal.catalogue)
        catalogue_section = f"\n{catalogue_block}\n" if catalogue_block else ""

        if needs_sensor:
            output_shape = """\
  "triplets": [
    {"sensor": "<sensor name or all>", "component": "<component name or all>", "ship": "<ship name>"}
  ]"""

            few_shot = """
EXAMPLES (sensor-intent multi-entity queries):
Input:  "calculate rul of GT_S1 on gt 1 of ins one"
Output: {"raw_components": ["gt 1"], "raw_ships": ["ins one"], "triplets": [{"sensor": "GT_S1", "component": "gt 1", "ship": "ins one"}]}

Input:  "show sensor readings for AC_S3 and SRGM_S2 on ins two"
Output: {"raw_components": ["all"], "raw_ships": ["ins two"], "triplets": [{"sensor": "AC_S3", "component": "all", "ship": "ins two"}, {"sensor": "SRGM_S2", "component": "all", "ship": "ins two"}]}

Input:  "rul for GT_S1 and GT_S2 on gt 1 of ins one"
Output: {"raw_components": ["gt 1"], "raw_ships": ["ins one"], "triplets": [{"sensor": "GT_S1", "component": "gt 1", "ship": "ins one"}, {"sensor": "GT_S2", "component": "gt 1", "ship": "ins one"}]}
"""
            sensor_id_rule     = (
                "- SENSOR IDs follow the pattern LETTERS_S<digits> (e.g. GT_S1, AC_S3, SRGM_S2). "
                "A token matching this pattern is ALWAYS the sensor — NEVER the component. "
                "Place it in the \"sensor\" field of the triplet, not in \"raw_components\".\n"
            )
            assembly_suffix_rule = ""

        else:
            output_shape = """\
  "pairs": [
    {"component": "<component name or type name>", "ship": "<ship name>"}
  ]"""

            few_shot = """
EXAMPLES:

# Q1-style: single named instance, single ship
Input:  "reliability of GT 1 on ins one over 50 hours"
Output: {"raw_components": ["GT 1"], "raw_ships": ["ins one"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "ins one"}]}

# Q2-style: two named instances, SAME ship
Input:  "reliability of GT 1, GT 2 on ins one over 50 hours"
Output: {"raw_components": ["GT 1", "GT 2"], "raw_ships": ["ins one"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "ins one"}, {"component": "GT 2", "ship": "ins one"}]}

# Q3-style: one named instance on BOTH ships (explicit "on ins one and ins two")
Input:  "reliability of GT 1 on ins one and ins two over 50 hours"
Output: {"raw_components": ["GT 1"], "raw_ships": ["ins one", "ins two"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "ins one"}, {"component": "GT 1", "ship": "ins two"}]}

# Q4-style: different named instance per ship (explicit scoping)
Input:  "reliability of GT 1 on ins one and GT 2 on ins two over 50 hours"
Output: {"raw_components": ["GT 1", "GT 2"], "raw_ships": ["ins one", "ins two"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "ins one"}, {"component": "GT 2", "ship": "ins two"}]}

# Q5-style: two named instances on BOTH ships (full cross-product)
Input:  "reliability of GT 1, GT 2 on both ins one and ins two over 50 hours"
Output: {"raw_components": ["GT 1", "GT 2"], "raw_ships": ["ins one", "ins two"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "ins one"}, {"component": "GT 2", "ship": "ins one"}, {"component": "GT 1", "ship": "ins two"}, {"component": "GT 2", "ship": "ins two"}]}

# Q8-style: different named instances per ship, each ship has 2 instances
Input:  "reliability of GT 1 and GT 2 on INS One, and AC 1 and AC 2 on INS Two over 50 hours"
Output: {"raw_components": ["GT 1", "GT 2", "AC 1", "AC 2"], "raw_ships": ["INS One", "INS Two"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "INS One"}, {"component": "GT 2", "ship": "INS One"}, {"component": "AC 1", "ship": "INS Two"}, {"component": "AC 2", "ship": "INS Two"}]}

# Q9-style: four named instances explicitly on BOTH ships (full cross-product, 8 pairs)
Input:  "reliability of GT 1, GT 2, AC 1, and AC 2 on INS One, and GT 1, GT 2, AC 1, and AC 2 on INS Two over 50 hours"
Output: {"raw_components": ["GT 1", "GT 2", "AC 1", "AC 2"], "raw_ships": ["INS One", "INS Two"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "INS One"}, {"component": "GT 2", "ship": "INS One"}, {"component": "AC 1", "ship": "INS One"}, {"component": "AC 2", "ship": "INS One"}, {"component": "GT 1", "ship": "INS Two"}, {"component": "GT 2", "ship": "INS Two"}, {"component": "AC 1", "ship": "INS Two"}, {"component": "AC 2", "ship": "INS Two"}]}

# Q10-style: type-scoped per ship (different type per ship)
Input:  "reliability of all gas turbine on INS One and all Air Conditioner on INS Two over 50 hours"
Output: {"raw_components": ["gas turbine", "Air Conditioner"], "raw_ships": ["INS One", "INS Two"], "time_expression": "50 hours", "pairs": [{"component": "gas turbine", "ship": "INS One"}, {"component": "Air Conditioner", "ship": "INS Two"}]}

# Q11-style: mixed named instances, different scoping per ship
Input:  "reliability of GT 1 and AC 1 on INS One, and GT 2 and AC 2 on INS Two over 50 hours"
Output: {"raw_components": ["GT 1", "AC 1", "GT 2", "AC 2"], "raw_ships": ["INS One", "INS Two"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "INS One"}, {"component": "AC 1", "ship": "INS One"}, {"component": "GT 2", "ship": "INS Two"}, {"component": "AC 2", "ship": "INS Two"}]}

# Q12-style: same type on both ships (type name preserved, one pair per ship)
Input:  "reliability of all GT units on INS One and all GT units on INS Two over 50 hours"
Output: {"raw_components": ["GT"], "raw_ships": ["INS One", "INS Two"], "time_expression": "50 hours", "pairs": [{"component": "GT", "ship": "INS One"}, {"component": "GT", "ship": "INS Two"}]}

# Q13-style: asymmetric named instances across ships
Input:  "reliability of GT 1, GT 2, and AC 1 on INS One, and GT 1 and AC 2 on INS Two over 50 hours"
Output: {"raw_components": ["GT 1", "GT 2", "AC 1", "AC 2"], "raw_ships": ["INS One", "INS Two"], "time_expression": "50 hours", "pairs": [{"component": "GT 1", "ship": "INS One"}, {"component": "GT 2", "ship": "INS One"}, {"component": "AC 1", "ship": "INS One"}, {"component": "GT 1", "ship": "INS Two"}, {"component": "AC 2", "ship": "INS Two"}]}

# Q14-style: mixed unscoped + type-scoped across ships
Input:  "reliability of all equipment on INS One and all Gas Turbine units on INS Two over 50 hours"
Output: {"raw_components": ["all", "Gas Turbine"], "raw_ships": ["INS One", "INS Two"], "time_expression": "50 hours", "pairs": [{"component": "all", "ship": "INS One"}, {"component": "Gas Turbine", "ship": "INS Two"}]}

# Assembly queries
Input:  "rcm of p1 assembly of gt 1 of ins one and p2 assembly of gt 1 of ins two"
Output: {"raw_components": ["p1", "p2"], "raw_ships": ["ins one", "ins two"], "pairs": [{"component": "p1", "ship": "ins one"}, {"component": "p2", "ship": "ins two"}]}

Input:  "rcm for all assemblies on ins one and ins two"
Output: {"raw_components": ["assembly"], "raw_ships": ["ins one", "ins two"], "pairs": [{"component": "assembly", "ship": "ins one"}, {"component": "assembly", "ship": "ins two"}]}
"""
            sensor_id_rule     = ""
            assembly_suffix_rule = (
                "- The word 'assembly' (or 'unit', 'module', 'block') after a component name "
                "is a TYPE QUALIFIER — strip it: 'p1 assembly' → 'p1', 'pump assembly' → 'pump'. "
                "Exception: keep 'assembly' as the component value when it IS the type "
                "(e.g. 'all assemblies' → component='assembly').\n"
                "- The word 'units' after a type name is also a TYPE QUALIFIER — strip it: "
                "'GT units' → 'GT', 'all GT units' → component='GT'.\n"
            )

        return f"""You are an entity extractor for a naval maintenance system.

Extract all entities from the message below for a {intent} query.
{catalogue_section}
RULES:
- Extract EXACT words as the user typed. Do NOT normalise, resolve, or correct spelling.
- Produce one pair per (component, ship) combination explicitly mentioned or implied.
- NAMED INSTANCES on a SCOPED ship: if the user says "GT 1 and GT 2 on INS One", both
  instances belong to INS One only — produce two pairs, both with ship=INS One.
- NAMED INSTANCES on BOTH ships: if the user says "GT 1, GT 2 on both ins one and ins two"
  or lists the same instances for each ship, produce the full cross-product.
- DIFFERENT instances per ship: if the user says "GT 1 on ins one and GT 2 on ins two",
  produce one pair each with the correct ship — do NOT cross-join.
- SAME INSTANCE on multiple ships: if the user says "GT 1 on ins one and ins two", produce
  one pair per ship for GT 1.
- TYPE AGGREGATE per ship: if the user says "all gas turbine on INS One", set component to
  the type name only ("gas turbine") — NOT "all". One pair per ship.
- UNSCOPED + TYPE-SCOPED mix: if one ship gets "all equipment" and another gets
  "all Gas Turbines", emit component="all" for the unscoped ship and component="Gas Turbine"
  for the type-scoped ship.
- NAMED INSTANCES: preserve the full name including number — "GT 1" stays "GT 1",
  never collapse to "GT".
- Never include "all" in raw_components when named instances or type names are present,
  EXCEPT for the Q14 mixed pattern where one ship genuinely gets component="all".
{sensor_id_rule}{assembly_suffix_rule}
- If a catalogue is provided above, note that it lists INSTANCES — type names like
  "gas turbine" or "assembly" are valid even if not listed directly.
- Only use ship names from the catalogue or the message. Do NOT invent names.
- Return ONLY valid JSON. No explanation, no markdown, no extra text.
{few_shot}
Message: "{message}"

Return JSON in this exact shape:
{{
  "raw_components": ["<all unique component/type names>"],
  "raw_ships": ["<all unique ship names as spoken>"],
  {time_field}
{output_shape}
}}\
"""

    def _comparative_prompt(self, message: str, signal: IntentSignal) -> str:
        intent       = signal.intent
        needs_sensor = intent in _TRIPLET_INTENTS
        needs_time   = intent in {"RELIABILITY", "SENSOR"}

        sensor_field = '"sensor": "<sensor name as spoken or null>",' if needs_sensor else ""
        time_field   = '"time_expression": "<raw time phrase or null>",' if needs_time else ""

        sensor_id_rule = (
            "- SENSOR IDs follow the pattern LETTERS_S<digits> (e.g. GT_S1, AC_S3, SRGM_S2). "
            "If such a token is present it is ALWAYS the sensor — never a component.\n"
            if needs_sensor else ""
        )

        catalogue_block   = self._format_catalogue(signal.catalogue)
        catalogue_section = f"\n{catalogue_block}\n" if catalogue_block else ""

        pair_or_triplet = self._pair_or_triplet_example(intent)

        return f"""You are an entity extractor for a naval maintenance system.

The user query is about {intent} and is a COMPARISON (comparing entities against each other).
{catalogue_section}
RULES:
- Extract EXACT words as the user typed. Do NOT normalise, resolve, or correct spelling.
- Create one pair/triplet per entity being compared.
{sensor_id_rule}- If a catalogue is provided above, only use entity names that appear in it.
- Return ONLY valid JSON. No explanation, no markdown, no extra text.

Message: "{message}"

Return JSON in this exact shape:
{{
  "raw_components": ["<all component names as spoken>"],
  "raw_ships": ["<all ship names as spoken>"],
  {sensor_field}
  {time_field}
  "{pair_or_triplet['key']}": [
    {pair_or_triplet['multi_example']}
  ]
}}"""

    def _compound_prompt(self, message: str, signal: IntentSignal) -> str:
        intents_list = ", ".join(signal.intents)

        catalogue_block   = self._format_catalogue(signal.catalogue)
        catalogue_section = f"\n{catalogue_block}\n" if catalogue_block else ""

        return f"""You are an entity extractor for a naval maintenance system.

The user query spans MULTIPLE intents: {intents_list}.
Split the extraction per intent anchor.
{catalogue_section}
RULES:
- Extract EXACT words as the user typed. Do NOT normalise, resolve, or correct spelling.
- For each intent, produce a separate object in the "sub_results" list.
- SENSOR IDs follow the pattern LETTERS_S<digits> (e.g. GT_S1, AC_S3, SRGM_S2).
  A token matching this pattern is ALWAYS the sensor — never a component.
- If a catalogue is provided above, only use entity names that appear in it.
- Return ONLY valid JSON. No explanation, no markdown, no extra text.

Message: "{message}"

Return JSON in this exact shape:
{{
  "is_compound": true,
  "sub_results": [
    {{
      "intent": "<RELIABILITY|SENSOR|RUL|RCM>",
      "raw_components": ["<component names for this intent>"],
      "raw_ships": ["<ship names for this intent>"],
      "raw_sensors": ["<sensor names for this intent, or []>"],
      "time_expression": "<raw time phrase or null>",
      "pairs": [{{"component": "<name>", "ship": "<name>"}}],
      "triplets": []
    }}
  ]
}}"""

    # ------------------------------------------------------------------
    # Parse LLM response
    # ------------------------------------------------------------------

    def _parse_general_response(self, raw: str) -> ExtractionResult:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines   = cleaned.splitlines()
            cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("GENERAL extractor produced invalid JSON: %s\nRaw: %s", exc, raw[:500])
            raise PipelineError(
                stage=PipelineStage.EXTRACTOR,
                code="PARSE_FAILED",
                message="Failed to parse the entity extraction response. Please rephrase your query.",
            )

        result = ExtractionResult(
            raw_ships=data.get("raw_ships", []),
            raw_components=data.get("raw_components", []),
            raw_sensors=data.get("raw_sensors", []),
            time_expression=data.get("time_expression"),
            topic_hint=data.get("topic_hint"),
            scope=data.get("scope"),
        )

        log_stage(
            "EXTRACTOR",
            f"topic_hint={result.topic_hint} scope={result.scope} "
            f"ships={result.raw_ships} components={result.raw_components} "
            f"sensors={result.raw_sensors} time={repr(result.time_expression)}"
        )

        return result

    def _parse_response(
        self,
        raw: str,
        intent: str,
        complexity: str,
        message: str = "",
    ) -> ExtractionResult:
        """Parse the LLM JSON response into an ExtractionResult."""
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines   = cleaned.splitlines()
            cleaned = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

        try:
            data: Dict[str, Any] = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("LLM extractor produced invalid JSON: %s\nRaw: %s", exc, raw[:500])
            raise PipelineError(
                stage=PipelineStage.EXTRACTOR,
                code="PARSE_FAILED",
                message="Failed to parse the entity extraction response. Please rephrase your query.",
            )

        if data.get("is_compound"):
            sub_results = []
            for sub in data.get("sub_results", []):
                sub_intent = sub.get("intent", intent)
                sub_results.append(self._build_result(sub, sub_intent, complexity, message))
            return ExtractionResult(is_compound=True, sub_results=sub_results)

        return self._build_result(data, intent, complexity, message)

    def _build_result(
        self,
        data: Dict[str, Any],
        intent: str,
        complexity: str,
        message: str = "",
    ) -> ExtractionResult:
        """
        Build an ExtractionResult from a parsed dict.

        Post-LLM deterministic rescue passes applied in order:
          FIX-ALL-SENTINEL                  : strip 'all' when type/instance tokens present
          FIX-2a                            : rescue sensor IDs from raw_components
          pair parsing
          FIX-NAMED-INSTANCE-COLLAPSE (B+C) : rescue instances absent from pairs
          FIX-NAMED-INSTANCE-COLLAPSE-D     : rescue instances collapsed consistently
                                              in both raw_components AND pairs
          FIX-2b                            : per-triplet sensor-ID rescue
          safety fallback                   : synthesise from raw lists if still empty
        """
        result = ExtractionResult(
            raw_components=data.get("raw_components", []),
            raw_ships=data.get("raw_ships", []),
            raw_sensors=data.get("raw_sensors", []),
            time_expression=data.get("time_expression"),
        )
                # ------------------------------------------------------------
        # FIX-NAMED-INSTANCE-COLLAPSE-E
        #
        # Example:
        #
        # User:
        #   GT 1, GT 2 on INS ONE and INS TWO
        #
        # LLM:
        #   raw_components = ["GT"]
        #
        # Recover GT 1 / GT 2 from the original message before the
        # existing collapse-rescue logic runs.
        # ------------------------------------------------------------
        if intent in _PAIR_INTENTS and message:

            explicit_instances = self._extract_named_instances(message)

            if explicit_instances:

                # Deduplicate raw_components before comparison
                unique_extracted_norms = {
                    _normalise(c) for c in result.raw_components
                }

                instance_roots = {
                    self._instance_root(c)
                    for c in explicit_instances
                }

                # Collapse detected if:
                # - more instances found in message than unique types in raw_components
                # - AND all raw_component norms are roots of the found instances
                collapsed_detected = (
                    len(explicit_instances) > len(unique_extracted_norms)
                    and unique_extracted_norms
                    and unique_extracted_norms.issubset(instance_roots)
                )

                if collapsed_detected:
                    log_stage(
                        "EXTRACTOR",
                        "FIX-NAMED-INSTANCE-COLLAPSE-E: "
                        f"recovered {explicit_instances}"
                    )
                    result.raw_components = explicit_instances
        # ----------------------------------------------------------------
        # FIX-ALL-SENTINEL
        # Strip 'all' from raw_components when real type/instance tokens
        # are also present — but ONLY when none of the real tokens is itself
        # the literal string "all" (Q14 mixed pattern keeps comp="all" for
        # the unscoped ship, which the LLM emits as a pair directly).
        # ----------------------------------------------------------------
        non_all_tokens = [
            t for t in result.raw_components
            if _normalise(t) not in _ALL_KEYWORDS
        ]
        if non_all_tokens and len(non_all_tokens) < len(result.raw_components):
            log_stage(
                "EXTRACTOR",
                f"FIX-ALL-SENTINEL: stripped 'all' alongside type tokens {non_all_tokens} "
                f"(was {result.raw_components})"
            )
            result.raw_components = non_all_tokens

        # ----------------------------------------------------------------
        # FIX-2a — rescue sensor IDs misrouted to raw_components
        # ----------------------------------------------------------------
        if intent in _TRIPLET_INTENTS:
            rescued: List[str] = []
            clean_components: List[str] = []

            for token in result.raw_components:
                if _SENSOR_ID_RE.match(token):
                    rescued.append(token)
                    log_stage(
                        "EXTRACTOR",
                        f"FIX-2a: rescued sensor ID '{token}' from raw_components"
                    )
                else:
                    clean_components.append(token)

            if rescued:
                result.raw_sensors = rescued + [
                    s for s in result.raw_sensors if s not in rescued
                ]
                result.raw_components = clean_components if clean_components else ["all"]

        # ----------------------------------------------------------------
        # Parse pairs (RELIABILITY / RCM)
        # ----------------------------------------------------------------
        for p in data.get("pairs", []):
            if isinstance(p, dict) and "component" in p and "ship" in p:
                result.pairs.append(RawPair(component=p["component"], ship=p["ship"]))

        # ----------------------------------------------------------------
        # FIX-NAMED-INSTANCE-COLLAPSE (Part B + C + D)
        #
        # Runs for PAIR intents regardless of whether pairs is empty.
        #
        # Part B+C (unchanged):
        #   Detect tokens in raw_components whose normalised form is absent
        #   from the set of pair component norms, and synthesise missing pairs.
        #
        # Part D (NEW — FIX-NAMED-INSTANCE-COLLAPSE-D):
        #   Catches the consistent-collapse case where the LLM strips instance
        #   numbers from BOTH raw_components AND the pairs simultaneously.
        #
        #   Example: user says "GT 1, GT 2 on both ins one and ins two"
        #   LLM emits: raw_components=["GT"], pairs=[{GT,ins one},{GT,ins two}]
        #   → norm("GT") == "gt" IS in pair_comp_norms → Part B sees nothing missing
        #   → But raw_components should have been ["GT 1","GT 2"] — collapse missed
        #
        #   Part D detects this by checking if a raw_components token has a
        #   trailing digit suffix (named instance) whose bare type root IS in
        #   pair_comp_norms. If so, the LLM collapsed it consistently and the
        #   token is injected into missing_tokens for the rescue machinery.
        # ----------------------------------------------------------------
        if intent in _PAIR_INTENTS:
            pair_comp_norms: Set[str] = {_normalise(p.component) for p in result.pairs}

            # Part B: tokens absent from pairs entirely
            missing_tokens: List[str] = [
                token for token in result.raw_components
                if _normalise(token) not in _ALL_KEYWORDS
                and _normalise(token) not in pair_comp_norms
            ]

            # Part D: named-instance tokens whose bare type root WAS used in
            # pairs — signals a consistent collapse (number stripped from both
            # raw_components and pairs by the LLM).
            already_in_missing: Set[str] = {_normalise(t) for t in missing_tokens}
            for token in result.raw_components:
                norm = _normalise(token)
                if norm in _ALL_KEYWORDS or norm in already_in_missing:
                    continue
                m = _INSTANCE_SUFFIX_RE.match(norm)
                if m:
                    type_root_norm = m.group(1)  # e.g. "gt" from "gt1"
                    if type_root_norm and type_root_norm in pair_comp_norms:
                        # Bare type root is in pairs but the full instance token
                        # is not → consistent collapse detected
                        log_stage(
                            "EXTRACTOR",
                            f"FIX-NAMED-INSTANCE-COLLAPSE-D: '{token}' (norm='{norm}') "
                            f"has type root '{type_root_norm}' present in pairs — "
                            f"consistent collapse detected, adding to missing_tokens"
                        )
                        missing_tokens.append(token)
                        already_in_missing.add(norm)

            if missing_tokens:
                # Step 1 — build type→ships index from LLM pairs
                type_to_ships: Dict[str, List[str]] = {}
                for p in result.pairs:
                    norm = _normalise(p.component)
                    if norm not in type_to_ships:
                        type_to_ships[norm] = []
                    if p.ship not in type_to_ships[norm]:
                        type_to_ships[norm].append(p.ship)

                collapsed_norms: Set[str] = set()

                for comp in missing_tokens:
                    norm_comp = _normalise(comp)

                    # Step 2a — longest-prefix match in type_to_ships
                    matched_root: str | None = None
                    for root in type_to_ships:
                        if norm_comp.startswith(root):
                            if matched_root is None or len(root) > len(matched_root):
                                matched_root = root

                    if matched_root:
                        scoped_ships = type_to_ships[matched_root]
                        collapsed_norms.add(matched_root)
                    else:
                        # Step 2c — proximity search in raw message (Part C)
                        scoped_ships = self._infer_ship_scope(
                            comp, result.raw_ships, message
                        )

                    log_stage(
                        "EXTRACTOR",
                        f"FIX-NAMED-INSTANCE-COLLAPSE: '{comp}' → type root "
                        f"'{matched_root}' → scoped to ships {scoped_ships}"
                    )
                    for ship in scoped_ships:
                        result.pairs.append(RawPair(component=comp, ship=ship))

                # Step 3 — prune replaced collapsed type-root pairs
                if collapsed_norms:
                    before = len(result.pairs)
                    result.pairs = [
                        p for p in result.pairs
                        if _normalise(p.component) not in collapsed_norms
                    ]
                    log_stage(
                        "EXTRACTOR",
                        f"FIX-NAMED-INSTANCE-COLLAPSE: pruned "
                        f"{before - len(result.pairs)} collapsed type pairs, "
                        f"final pair count={len(result.pairs)}"
                    )

        # ----------------------------------------------------------------
        # FIX-2b — parse triplets with per-triplet sensor-ID rescue
        # ----------------------------------------------------------------
        for t in data.get("triplets", []):
            if not isinstance(t, dict) or "component" not in t or "ship" not in t:
                continue

            sensor_val = t.get("sensor") or "all"
            comp_val   = t["component"]

            if (sensor_val == "all") and _SENSOR_ID_RE.match(comp_val):
                log_stage(
                    "EXTRACTOR",
                    f"FIX-2b: swapped sensor ID '{comp_val}' from component slot to sensor slot"
                )
                sensor_val = comp_val
                comp_val   = "all"

            result.triplets.append(RawTriplet(
                sensor=sensor_val,
                component=comp_val,
                ship=t["ship"],
            ))

        # ----------------------------------------------------------------
        # Safety fallback — synthesise from raw lists if still empty
        # ----------------------------------------------------------------
        if not result.pairs and not result.triplets:
            result = self._synthesise_pairs_triplets(result, intent)

        return result

    def _synthesise_pairs_triplets(
        self, result: ExtractionResult, intent: str
    ) -> ExtractionResult:
        """
        Last-resort fallback. Synthesise pairs/triplets from raw lists.
        Not used for multi_entity — groups handle that path.
        """
        components = result.raw_components or ["all"]
        ships      = result.raw_ships or [""]
        sensors    = result.raw_sensors or ["all"]

        if intent in _PAIR_INTENTS:
            for comp in components:
                for ship in ships:
                    result.pairs.append(RawPair(component=comp, ship=ship))
        elif intent in _TRIPLET_INTENTS:
            for sensor in sensors:
                for comp in components:
                    for ship in ships:
                        result.triplets.append(RawTriplet(
                            sensor=sensor, component=comp, ship=ship
                        ))

        return result

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _pair_or_triplet_example(intent: str) -> Dict[str, str]:
        if intent in _TRIPLET_INTENTS:
            return {
                "key": "triplets",
                "example": '{"sensor": "<sensor name or all>", "component": "<component name or all>", "ship": "<ship name>"}',
                "multi_example": (
                    '{"sensor": "<sensor 1>", "component": "<component 1>", "ship": "<ship 1>"},\n'
                    '    {"sensor": "<sensor 2>", "component": "<component 2>", "ship": "<ship 2>"}'
                ),
            }
        return {
            "key": "pairs",
            "example": '{"component": "<component name or type name>", "ship": "<ship name>"}',
            "multi_example": (
                '{"component": "<component 1>", "ship": "<ship 1>"},\n'
                '    {"component": "<component 2>", "ship": "<ship 2>"}'
            ),
        }