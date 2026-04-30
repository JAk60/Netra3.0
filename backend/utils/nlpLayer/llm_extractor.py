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
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List

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
# Matches tokens that are LETTERS_S<digits> — always a sensor, never a component.
_SENSOR_ID_RE = re.compile(r'^[A-Za-z]+_S\d+$')

# Keywords that mean "expand to all" — used by FIX-ALL-SENTINEL to detect the
# sentinel value in raw_components so it can be stripped when type tokens are
# also present.
_ALL_KEYWORDS = {"all", "every", "each", "allequipment", "allcomponents", "everything"}

_SEP_PATTERN = re.compile(r"[\s\-_]+")


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
        """
        Args:
            llm_service: Any object with an async call(prompt: str) -> str method.
        """
        self._llm = llm_service

    async def extract(self, message: str, signal: IntentSignal) -> ExtractionResult:
        """
        Main entry point. Selects the right prompt template and calls the LLM.

        Args:
            message:  The raw user message.
            signal:   The full IntentSignal from the frontend classifier.
                      signal.catalogue is populated by Stage 0 when ships were
                      detected — prompts inject it automatically.

        Returns:
            ExtractionResult with raw mentions and structured pairs/triplets.

        Raises:
            PipelineError if the LLM response cannot be parsed.
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

        # Derive complexity from available signal fields.
        # Frontend no longer sends complexity — backend derives it here.
        #
        # Rules (in priority order):
        #   comparison signal        → comparative
        #   multiple ships           → multi_entity
        #   aggregate keywords       → aggregate  (unscoped PAIR intents only)
        #   default                  → simple
        _AGG_RE = re.compile(
            r'\b(all|every|each|list|highest|lowest|most|least|top|bottom|average|total|across)\b',
            re.IGNORECASE,
        )

        # FIX-AGG-TYPE — detect "all <specific type>" patterns.
        # When the user qualifies "all" with a type noun (e.g. "all assemblies",
        # "all gas turbines"), the aggregate template must NOT be used because it
        # hardcodes comp="all" and discards the type name entirely.
        # Exclusion list covers generic/unscoped words that should still aggregate.
        _TYPE_AGG_RE = re.compile(
            r'\ball\s+(?:the\s+)?(?!equipment\b|components?\b|parts?\b|sensors?\b|data\b)(\w+)',
            re.IGNORECASE,
        )

        if signal.has_comparison:
            complexity = "comparative"
        elif signal.has_multiple_ships or len(signal.resolved_ships) > 1:
            complexity = "multi_entity"
        elif _AGG_RE.search(message):
            # FIX-AGG-SENSOR: aggregate keyword on a TRIPLET intent → simple.
            # FIX-AGG-TYPE:   "all <specific type>" on any intent → simple so
            #                 the type name is preserved for the linker.
            # Only truly unscoped PAIR queries ("all equipment on ins one") still
            # reach the aggregate template.
            #
            # FIX-ARTICLE: strip articles (the/a/an) before running _TYPE_AGG_RE
            # so "all the equipment" is treated identically to "all equipment".
            # Without this, _TYPE_AGG_RE captures "the" as the type word,
            # bypassing the negative lookahead and incorrectly routing to simple.
            # e.g. "all the equipment" → "all equipment" → lookahead blocks on
            # "equipment" → no match → aggregate (correct).
            #      "all the assemblies" → "all assemblies" → match → simple (correct).
            _msg_no_articles = re.sub(r'\b(the|a|an)\b\s*', '', message, flags=re.IGNORECASE)
            if intent in _TRIPLET_INTENTS or _TYPE_AGG_RE.search(_msg_no_articles):
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

        # Select prompt template
        if complexity == "aggregate":
            prompt = self._aggregate_prompt(message, signal)
        elif complexity == "comparative":
            prompt = self._comparative_prompt(message, signal)
        elif complexity == "multi_entity":
            prompt = self._multi_entity_prompt(message, signal)
        else:
            prompt = self._simple_prompt(message, signal)

        log_stage("EXTRACTOR", f"template={complexity}")

        # Call LLM
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

        # Parse response — pass complexity so _build_result has it
        result = self._parse_response(raw_response, intent, complexity)

        log_stage(
            "EXTRACTOR",
            f"components={result.raw_components} ships={result.raw_ships} "
            f"sensors={result.raw_sensors} time={repr(result.time_expression)} "
            f"pairs={len(result.pairs)} triplets={len(result.triplets)}"
        )

        return result

    # ------------------------------------------------------------------
    # ⭐ STAGE-0 — Catalogue formatter
    # ------------------------------------------------------------------

    @staticmethod
    def _format_catalogue(catalogue: Dict[str, Any]) -> str:
        """
        Convert the Stage 0 catalogue dict into a compact prompt block.

        Now renders assemblies grouped under their parent component so the
        LLM sees the full hierarchy for RCM queries.

        Format:
            KNOWN ENTITIES (use these exact names):
            INS ONE:
              Components: GT 1, GT 2, AC 1, AC 2
              Assemblies (child components, grouped by parent):
                GT 1: p1, p2, pump 2
                AC 1: valve block, compressor unit
              Sensors: GT_S1, GT_S2, AC_S1

        Returns empty string if catalogue is empty — no prompt change.
        """
        if not catalogue:
            return ""

        lines = ["KNOWN ENTITIES (use these exact names):"]
        for ship_name, data in catalogue.items():
            lines.append(f"{ship_name}:")
            components = data.get("components", [])
            assemblies = data.get("assemblies", {})   # {parent_nom: [child_nom, ...]}
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
        intent = signal.intent
        needs_sensor = intent in _TRIPLET_INTENTS
        needs_time = intent in {"RELIABILITY", "SENSOR"}

        sensor_field = '"sensor": "<sensor name as spoken or null>",' if needs_sensor else ""
        time_field = '"time_expression": "<raw time phrase or null>",' if needs_time else ""

        # FIX-3 — sensor-ID rule for simple queries
        sensor_id_rule = (
            "- SENSOR IDs follow the pattern LETTERS_S<digits> (e.g. GT_S1, AC_S3, SRGM_S2). "
            "If such a token is present it is ALWAYS the sensor — never a component.\n"
            if needs_sensor else ""
        )

        # ⭐ STAGE-0 — catalogue block (empty string if no catalogue)
        catalogue_block = self._format_catalogue(signal.catalogue)
        catalogue_section = (
            f"\n{catalogue_block}\n"
            if catalogue_block else ""
        )

        pair_or_triplet = self._pair_or_triplet_example(intent)

        if needs_sensor:
            # Triplet intents (SENSOR / RUL) — sensor-ID few-shot
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
            # FIX-CHAINED-OF + FIX-AGG-TYPE + FIX-RCM-ASSEMBLY — pair intents (RCM / RELIABILITY).
            #
            # Chained-of rule: "X of Y of SHIP" → X is the target, Y is parent context.
            # Assembly-suffix rule: "p1 assembly" → "p1" (strip trailing type qualifier).
            # Type-aggregate rule: "all <type>" → comp = type name, NOT "all".
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

        # FIX-CHAINED-OF — prose rule injected for all non-sensor intents
        chained_of_rule = (
            "- In a chain like 'X of Y of SHIP', X is the target component. "
            "Y is a parent/scope qualifier — do NOT produce a second pair for Y.\n"
            if not needs_sensor else ""
        )

        # FIX-AGG-TYPE — prose rule for type-aggregate queries
        type_agg_rule = (
            "- If the user says 'all <type>' (e.g. 'all assemblies', 'all gas turbines', "
            "'all gtgs', 'all acs'), set component to the TYPE NAME ONLY "
            "(e.g. 'assembly', 'gas turbine', 'gtg', 'ac') — NOT 'all' and NOT both. "
            "Never include 'all' in raw_components when a type name is present.\n"
            if not needs_sensor else ""
        )

        # FIX-RCM-ASSEMBLY — strip trailing type-qualifier words from component names
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
        """
        Template for aggregate queries — 'all equipment', 'every component', etc.
        Component is always the literal string "all". Linker expands it.
        Catalogue NOT injected — it adds no value when component is always "all".

        NOTE: This template is only reached by PAIR intents (RELIABILITY / RCM)
        when the query is truly unscoped (no specific type name). Queries with
        "all <type>" (FIX-AGG-TYPE) and all TRIPLET intents (FIX-AGG-SENSOR)
        are routed to simple instead.
        """
        intent = signal.intent
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

    def _multi_entity_prompt(self, message: str, signal: IntentSignal) -> str:
        """
        Template for multi-entity queries.

        FIX-1: Added explicit sensor-ID detection rule and two few-shot
        examples that demonstrate GT_S1-style tokens belonging in the sensor
        slot, not the component slot.

        FIX-AGG-TYPE (multi_entity): Added "all assemblies on ins one and ins two"
        example so the LLM preserves the type name instead of coercing to "all".

        FIX-RCM-ASSEMBLY (multi_entity): Assembly-suffix stripping rule + examples
        for parent-scoped assembly queries across multiple ships.

        STAGE-0: Catalogue block injected when available, now including
        assembly hierarchy.
        """
        intent = signal.intent
        needs_sensor = intent in _TRIPLET_INTENTS
        needs_time = intent in {"RELIABILITY", "SENSOR"}
        time_field = '"time_expression": "<raw time phrase or null>",' if needs_time else ""

        # ⭐ STAGE-0 — catalogue block
        catalogue_block = self._format_catalogue(signal.catalogue)
        catalogue_section = (
            f"\n{catalogue_block}\n"
            if catalogue_block else ""
        )

        if needs_sensor:
            output_shape = """\
  "triplets": [
    {"sensor": "<sensor name or all>", "component": "<component name or all>", "ship": "<ship name>"}
  ]"""

            # FIX-1 — few-shot examples for sensor-intent multi_entity queries
            few_shot = """
EXAMPLES (sensor-intent multi-entity queries):
Input:  "calculate rul of GT_S1 on gt 1 of ins one"
Output: {"raw_components": ["gt 1"], "raw_ships": ["ins one"], "triplets": [{"sensor": "GT_S1", "component": "gt 1", "ship": "ins one"}]}

Input:  "show sensor readings for AC_S3 and SRGM_S2 on ins two"
Output: {"raw_components": ["all"], "raw_ships": ["ins two"], "triplets": [{"sensor": "AC_S3", "component": "all", "ship": "ins two"}, {"sensor": "SRGM_S2", "component": "all", "ship": "ins two"}]}

Input:  "rul for GT_S1 and GT_S2 on gt 1 of ins one"
Output: {"raw_components": ["gt 1"], "raw_ships": ["ins one"], "triplets": [{"sensor": "GT_S1", "component": "gt 1", "ship": "ins one"}, {"sensor": "GT_S2", "component": "gt 1", "ship": "ins one"}]}
"""
            # FIX-1 — explicit sensor-ID rule
            sensor_id_rule = (
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

            # FIX-AGG-TYPE + FIX-RCM-ASSEMBLY (multi_entity) — few-shot examples
            few_shot = """
EXAMPLES (type-aggregate, assembly, and mixed pair queries):
Input:  "reliability of all gas turbine on INS One over 100 hours"
Output: {"raw_components": ["gas turbine"], "raw_ships": ["INS One"], "time_expression": "100 hours", "pairs": [{"component": "gas turbine", "ship": "INS One"}]}

Input:  "reliability of all gas turbine on INS One and all air conditioner on INS Two over 50 hours"
Output: {"raw_components": ["gas turbine", "air conditioner"], "raw_ships": ["INS One", "INS Two"], "time_expression": "50 hours", "pairs": [{"component": "gas turbine", "ship": "INS One"}, {"component": "air conditioner", "ship": "INS Two"}]}

Input:  "rcm for all pumps on INS Three"
Output: {"raw_components": ["pumps"], "raw_ships": ["INS Three"], "pairs": [{"component": "pumps", "ship": "INS Three"}]}

Input:  "rcm for all assemblies on ins one and ins two"
Output: {"raw_components": ["assembly"], "raw_ships": ["ins one", "ins two"], "pairs": [{"component": "assembly", "ship": "ins one"}, {"component": "assembly", "ship": "ins two"}]}

Input:  "rcm of p1 assembly of gt 1 of ins one and p2 assembly of gt 1 of ins two"
Output: {"raw_components": ["p1", "p2"], "raw_ships": ["ins one", "ins two"], "pairs": [{"component": "p1", "ship": "ins one"}, {"component": "p2", "ship": "ins two"}]}

Input:  "show rcm of all assemblies on gt 1 of ins one and gt 2 of ins two"
Output: {"raw_components": ["assembly"], "raw_ships": ["ins one", "ins two"], "pairs": [{"component": "assembly", "ship": "ins one"}, {"component": "assembly", "ship": "ins two"}]}

Input:  "reliability of all gtgs on ins one and all acs on ins two for 100 hours"
Output: {"raw_components": ["gtg", "ac"], "raw_ships": ["ins one", "ins two"], "time_expression": "100 hours", "pairs": [{"component": "gtg", "ship": "ins one"}, {"component": "ac", "ship": "ins two"}]}
"""
            sensor_id_rule = ""
            # FIX-RCM-ASSEMBLY — suffix rule for multi_entity non-sensor path
            assembly_suffix_rule = (
                "- The word 'assembly' (or 'unit', 'module', 'block') after a component name "
                "is a TYPE QUALIFIER — strip it: 'p1 assembly' → 'p1', 'pump assembly' → 'pump'. "
                "Exception: keep 'assembly' as the component value when it IS the type "
                "(e.g. 'all assemblies' → component='assembly').\n"
            )

        return f"""You are an entity extractor for a naval maintenance system.

Extract all entities from the message below for a {intent} query.
{catalogue_section}
RULES:
- Extract EXACT words as the user typed. Do NOT normalise, resolve, or correct spelling.
- Produce one pair/triplet per (component, ship) combination explicitly mentioned.
- If the same component appears on multiple ships, produce one entry per ship.
- If multiple components appear on the same ship, produce one entry per component.
{sensor_id_rule}{assembly_suffix_rule}- TYPE AGGREGATE: if the user says "all <type>" (e.g. "all gas turbine", "all assemblies",
  "all gtgs", "all acs"), set component to the TYPE NAME ONLY (e.g. "gas turbine", "assembly",
  "gtg", "ac") — NOT "all" and NOT both. Never include "all" in raw_components when a
  type name is present. The linker expands types.
- If no explicit sensor is mentioned for a triplet, use "all" for sensor.
- If a catalogue is provided above, note that it lists INSTANCES — type names like
  "gas turbine" or "assembly" are valid even if not listed directly. Do NOT replace type names with "all".
- Only use ship names from the catalogue or the message. Do NOT invent names.
- Return ONLY valid JSON. No explanation, no markdown, no extra text.
{few_shot}
Message: "{message}"

Return JSON in this exact shape:
{{
  "raw_components": ["<all unique component/type names — NEVER include 'all' when a type name is present>"],
  "raw_ships": ["<all unique ship names as spoken>"],
  {time_field}
{output_shape}
}}\
"""

    def _comparative_prompt(self, message: str, signal: IntentSignal) -> str:
        intent = signal.intent
        needs_sensor = intent in _TRIPLET_INTENTS
        needs_time = intent in {"RELIABILITY", "SENSOR"}

        sensor_field = '"sensor": "<sensor name as spoken or null>",' if needs_sensor else ""
        time_field = '"time_expression": "<raw time phrase or null>",' if needs_time else ""

        # FIX-3 — sensor-ID rule for comparative queries
        sensor_id_rule = (
            "- SENSOR IDs follow the pattern LETTERS_S<digits> (e.g. GT_S1, AC_S3, SRGM_S2). "
            "If such a token is present it is ALWAYS the sensor — never a component.\n"
            if needs_sensor else ""
        )

        # ⭐ STAGE-0 — catalogue block
        catalogue_block = self._format_catalogue(signal.catalogue)
        catalogue_section = (
            f"\n{catalogue_block}\n"
            if catalogue_block else ""
        )

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

        # ⭐ STAGE-0 — catalogue block for compound queries
        catalogue_block = self._format_catalogue(signal.catalogue)
        catalogue_section = (
            f"\n{catalogue_block}\n"
            if catalogue_block else ""
        )

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
            lines = cleaned.splitlines()
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

    def _parse_response(self, raw: str, intent: str, complexity: str) -> ExtractionResult:
        """Parse the LLM JSON response into an ExtractionResult."""
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
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

        # Compound query — sub_results each parsed independently
        if data.get("is_compound"):
            sub_results = []
            for sub in data.get("sub_results", []):
                sub_intent = sub.get("intent", intent)
                sub_results.append(self._build_result(sub, sub_intent, complexity))
            return ExtractionResult(is_compound=True, sub_results=sub_results)

        return self._build_result(data, intent, complexity)

    def _build_result(self, data: Dict[str, Any], intent: str, complexity: str) -> ExtractionResult:
        """
        Build an ExtractionResult from a parsed dict.

        FIX-2: After parsing, runs a deterministic rescue pass that detects
        sensor IDs (LETTERS_S<digits>) misrouted to raw_components or to a
        triplet's component slot and moves them to the correct sensor slot.
        This runs regardless of which prompt template was used.

        FIX-ALL-SENTINEL: Strips 'all' from raw_components when non-'all'
        tokens are also present. The LLM inconsistently includes the 'all'
        sentinel alongside a type token (e.g. ['gtg', 'all'] for "all gtgs").
        The pair is built from raw_components, so the sentinel ends up in the
        pair's component field — but wait, the pair already has component='gtg'
        from the LLM JSON. The real problem is the sentinel ends up in
        raw_components but not in the pair, so if the LLM happened to produce
        component='all' in the pair JSON the linker would incorrectly expand
        to every component. Stripping here keeps raw_components clean and
        consistent regardless of LLM inconsistency.
        """
        result = ExtractionResult(
            raw_components=data.get("raw_components", []),
            raw_ships=data.get("raw_ships", []),
            raw_sensors=data.get("raw_sensors", []),
            time_expression=data.get("time_expression"),
        )

        # FIX-ALL-SENTINEL — strip 'all' when type/instance tokens are also present.
        # The LLM for "all gtgs" sometimes returns raw_components=['gtg', 'all']
        # instead of ['gtg']. The 'all' sentinel is meaningless noise when a real
        # token is present — the linker Path 2 type expansion handles it correctly
        # from the type token alone. Without this strip, if the LLM also produces
        # pairs=[{component: 'all', ship: ...}] the linker would expand to ALL
        # components instead of just GTGs.
        non_all_tokens = [t for t in result.raw_components if _normalise(t) not in _ALL_KEYWORDS]
        if non_all_tokens and len(non_all_tokens) < len(result.raw_components):
            log_stage(
                "EXTRACTOR",
                f"FIX-ALL-SENTINEL: stripped 'all' alongside type tokens {non_all_tokens} "
                f"(was {result.raw_components})"
            )
            result.raw_components = non_all_tokens

        # FIX-2a — rescue sensor IDs misrouted to raw_components
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

        # Parse pairs (RELIABILITY / RCM)
        for p in data.get("pairs", []):
            if isinstance(p, dict) and "component" in p and "ship" in p:
                result.pairs.append(RawPair(component=p["component"], ship=p["ship"]))

        # FIX-2b — parse triplets with per-triplet rescue
        for t in data.get("triplets", []):
            if not isinstance(t, dict) or "component" not in t or "ship" not in t:
                continue

            sensor_val = t.get("sensor") or "all"
            comp_val   = t["component"]

            # If sensor slot is missing/all but component looks like a sensor ID → swap
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

        # Safety fallback — if LLM returned raw lists but no pairs/triplets
        if not result.pairs and not result.triplets:
            result = self._synthesise_pairs_triplets(result, intent)

        return result

    def _synthesise_pairs_triplets(
        self, result: ExtractionResult, intent: str
    ) -> ExtractionResult:
        """
        Last-resort fallback for simple/aggregate/comparative templates only.
        If LLM returned raw lists but no pairs/triplets, synthesise from lists.
        Not used for multi_entity — groups handle that path.
        """
        components = result.raw_components or ["all"]
        ships = result.raw_ships or [""]
        sensors = result.raw_sensors or ["all"]

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
            "example": '{"component": "<component name or type name — NOT \'all\' when a type is present>", "ship": "<ship name>"}',
            "multi_example": (
                '{"component": "<component 1>", "ship": "<ship 1>"},\n'
                '    {"component": "<component 2>", "ship": "<ship 2>"}'
            ),
        }