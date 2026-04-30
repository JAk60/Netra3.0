"""
nlpLayer/models.py
------------------
All shared dataclasses and enums that flow between every pipeline stage.
No logic. No imports from the rest of the app.
Everything else imports from here — nothing imports into here.

Changes
-------
STAGE-0  IntentSignal : `matched_ships` added — frontend now sends pre-resolved
                        ship records from the live fleet list (ship_id + ship_name).
                        Stage 0 uses these directly, skipping fuzzy matching.
                        Removed dead fields: complexity, has_paired_entities,
                        has_multiple_components, has_multiple_sensors, entity_count.
                        `catalogue` and `resolved_ships` remain — populated by
                        Stage 0 after validating matched_ships and fetching the
                        scoped catalogue slice.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Frontend signal
# ---------------------------------------------------------------------------

@dataclass
class IntentSignal:
    """
    Frontend classifier output passed from chat.py into the pipeline.

    Changes (frontend refactor)
    ---------------------------
    - complexity         : removed — backend derives this from extraction result
    - has_paired_entities: removed — backend derives from catalogue
    - has_multiple_components: removed — backend's job
    - has_multiple_sensors   : removed — backend's job
    - entity_count           : removed — backend derives from catalogue

    - matched_ships      : NEW — frontend sends pre-resolved ship records from
                           the live fleet list. Shape:
                           [{ "ship_id": "...", "ship_name": "INS ONE" }, ...]
                           Stage 0 uses these directly — no fuzzy matching needed.

    - resolved_ships     : populated by Stage 0 from matched_ships. Kept as a
                           separate field so Stage 0 can validate and enrich
                           before attaching to catalogue fetch.

    - catalogue          : populated by Stage 0 after fetching the scoped slice
                           for the matched ship IDs.
    """
    intent: str                          # RELIABILITY | SENSOR | RUL | RCM | GENERAL
    intents: List[str]                   # all matched intents (compound queries)
    matched: str                         # the matched label/pattern string

    # Signals the frontend CAN determine without catalogue knowledge
    has_multiple_ships: bool = False
    has_negation: bool = False
    has_comparison: bool = False

    # ⭐ Frontend-supplied ship records (from live fleet via useShips hook).
    # Shape: [{ "ship_id": "d03d2f7e-...", "ship_name": "INS ONE" }, ...]
    # Empty list = frontend found no ships in the query.
    # Stage 0 reads this directly — skips fuzzy matching entirely.
    matched_ships: List[Dict[str, str]] = field(default_factory=list)

    # ⭐ STAGE-0 — validated ship records after Stage 0 confirms IDs exist in DB.
    # Populated from matched_ships by Stage 0 in llm.py.
    resolved_ships: List[Dict[str, str]] = field(default_factory=list)

    # ⭐ STAGE-0 — scoped catalogue fetched for the resolved ship IDs.
    # Shape:
    #   {
    #     "INS ONE": {
    #       "components": ["GT 1", "GT 2", "AC 1", ...],
    #       "sensors":    ["GT_S1", "GT_S2", "AC_S1", ...]
    #     },
    #     "INS TWO": { ... }
    #   }
    catalogue: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "IntentSignal":
        signals = d.get("signals", {})
        return cls(
            intent=d.get("intent", "GENERAL"),
            intents=d.get("intents", [d.get("intent", "GENERAL")]),
            matched=d.get("matched", ""),
            has_multiple_ships=signals.get("has_multiple_ships", False),
            has_negation=signals.get("has_negation", False),
            has_comparison=signals.get("has_comparison", False),
            # Frontend-supplied ship records — Stage 0 reads these directly
            matched_ships=signals.get("matched_ships", []),
            # catalogue and resolved_ships populated by Stage 0
        )


# ---------------------------------------------------------------------------
# Stage 1 — LLM Extractor output
# ---------------------------------------------------------------------------

@dataclass
class RawPair:
    """A raw (component mention, ship mention) exactly as the LLM extracted it."""
    component: str
    ship: str


@dataclass
class RawTriplet:
    """A raw (sensor, component, ship) mention exactly as the LLM extracted it."""
    sensor: str
    component: str
    ship: str

# ---------------------------------------------------------------------------
# GENERAL path resolved context
# ---------------------------------------------------------------------------

@dataclass
class GeneralResolvedContext:
    """
    Soft-resolved entities for GENERAL intent queries.
    Never raises — empty lists mean 'not mentioned / not resolved'.
    Passed to the SQL tool builder prompt.
    """
    ships: List[Dict[str, str]] = field(default_factory=list)       # [{ship_id, ship_name}]
    components: List[CatalogEntry] = field(default_factory=list)
    sensors: List[SensorCatalogEntry] = field(default_factory=list)
    topic_hint: Optional[str] = None
    scope: Optional[str] = None

    
@dataclass
class ExtractionResult:
    raw_components: List[str] = field(default_factory=list)
    raw_ships: List[str] = field(default_factory=list)
    raw_sensors: List[str] = field(default_factory=list)
    time_expression: Optional[str] = None

    # GENERAL path only
    topic_hint: Optional[str] = None   # e.g. "reliability", "maintenance", "sensor"
    scope: Optional[str] = None        # "fleet" | "ship" | "component" | "sensor"

    pairs: List[RawPair] = field(default_factory=list)
    triplets: List[RawTriplet] = field(default_factory=list)
    sub_results: List["ExtractionResult"] = field(default_factory=list)
    is_compound: bool = False


# ---------------------------------------------------------------------------
# Catalog entry types (used internally by entity_linker)
# ---------------------------------------------------------------------------

@dataclass
class CatalogEntry:
    """One resolved row from the instance_catalog."""
    component_id: str
    component_name: str          # Gas Turbine, Air Conditioner, etc.
    nomenclature: str            # GT 1, AC 2, GTG 1 — the instance label
    ship_id: str
    ship_name: str
    parent_id: Optional[str] = None   # set for assemblies (p1 → GT 1)
    is_assembly: bool = False


@dataclass
class SensorCatalogEntry:
    """One resolved row from the sensor_catalog."""
    sensor_id: str
    sensor_name: str
    parent_component_id: str
    parent_nomenclature: str     # GTG 1, AC 1, etc.
    ship_id: str
    ship_name: str


# ---------------------------------------------------------------------------
# Stage 2A — Entity Linker output
# ---------------------------------------------------------------------------

@dataclass
class ResolvedPair:
    """
    A fully resolved (component, ship) pair.
    Contract between entity_linker and relformulas / rcm.
    IDs are real DB values — no further catalog lookup needed downstream.
    """
    component_id: str
    nomenclature: str
    ship_id: str
    ship_name: str
    is_assembly: bool = False
    confidence: float = 1.0    # 1.0 = tier1/2 hit, <1.0 = tier3 embedding match


@dataclass
class ResolvedTriplet:
    """
    A fully resolved (sensor, component, ship) triplet.
    Contract between entity_linker and rul / sensors.
    """
    sensor_id: str
    sensor_name: str
    component_id: str
    nomenclature: str
    ship_id: str
    ship_name: str
    confidence: float = 1.0


@dataclass
class ResolvedEntities:
    """
    Canonical output from Stage 2A Entity Linker.
    RELIABILITY / RCM   → pairs list populated
    RUL / SENSOR        → triplets list populated
    """
    intent: str
    pairs: List[ResolvedPair] = field(default_factory=list)
    triplets: List[ResolvedTriplet] = field(default_factory=list)
    has_negation: bool = False
    excluded_ids: List[str] = field(default_factory=list)  # "except GT 2"

    @property
    def all_component_ids(self) -> List[str]:
        if self.pairs:
            return sorted({p.component_id for p in self.pairs})
        return sorted({t.component_id for t in self.triplets})

    @property
    def all_ship_ids(self) -> List[str]:
        if self.pairs:
            return sorted({p.ship_id for p in self.pairs})
        return sorted({t.ship_id for t in self.triplets})

    @property
    def all_sensor_ids(self) -> List[str]:
        return sorted({t.sensor_id for t in self.triplets})


# ---------------------------------------------------------------------------
# Stage 2B — Temporal Resolver output
# ---------------------------------------------------------------------------

@dataclass
class TemporalRange:
    """
    Output from Stage 2B Temporal Resolver.
    RELIABILITY  → duration_hours set
    SENSOR       → start_ts + end_ts set
    RUL / RCM    → all None (not required)
    """
    raw_expression: Optional[str] = None
    duration_hours: Optional[float] = None
    start_ts: Optional[datetime] = None
    end_ts: Optional[datetime] = None
    is_default: bool = False     # True when the 7-day default was applied

    def to_params(self) -> Dict[str, Any]:
        """Convenience: returns DB-ready time params dict."""
        if self.duration_hours is not None:
            return {"duration_hours": self.duration_hours}
        if self.start_ts and self.end_ts:
            return {"start": self.start_ts.isoformat(), "end": self.end_ts.isoformat()}
        return {}


# ---------------------------------------------------------------------------
# Stage 3 — Pattern Memory output
# ---------------------------------------------------------------------------

@dataclass
class PatternMemoryResult:
    """Output from Stage 3 Pattern Memory."""
    hit: bool
    key: str                              # canonical shape key e.g. REL|CG→S,CG→S|D
    tool_json: Optional[Dict[str, Any]] = None
    confidence: float = 0.0
    was_shape_reuse: bool = False         # similarity > 0.85 but key differed → template filled


# ---------------------------------------------------------------------------
# Query shapes — canonical key enum
# ---------------------------------------------------------------------------
class SqlQueryShape(str, Enum):
    """
    Structural shape vocabulary for Netra 3.0 SQL generation.

    Key grammar:
        DOMAIN | SCOPE[_FILTER][_MULTI] [| OP]

    DOMAIN   : SHIP · DEPT · COMP · SEN · READ · FM · MAINT
               OH_META · OH_READ · MAINT_CFG · UTIL · REL · RCM · ADD
    SCOPE    : single entity  → _SHIP / _DEPT / _COMP / _SEN
               group          → _CMD / _CLASS / _TYPE / _DEPT
               fleet-wide     → _ALL / _FLEET
               multi-entity   → _MULTI  (WHERE id = ANY(:ids) or UNION)
    OP       : LIST (default, omitted) · COUNT · AGG · LATEST · RANGE
               ALERT · COMPARE_* · EXISTS · TEMPORAL · PHASE · DELTA

    All IDs are sorted before key comparison — order-independent matching.
    """

    # ── helpers ──────────────────────────────────────────────────────────────

    @classmethod
    def domain(cls, shape: "QueryShape") -> str:
        """Extract domain prefix for routing and log scanning."""
        return shape.value.split("|")[0]

    @classmethod
    def op(cls, shape: "QueryShape") -> str:
        """Extract operation suffix (returns empty string if absent)."""
        parts = shape.value.split("|")
        return parts[1] if len(parts) > 1 else ""

    # ── SHIP ─────────────────────────────────────────────────────────────────

    SHIP_LIST            = "SHIP|LIST"
    SHIP_COUNT           = "SHIP|COUNT"
    SHIP_DETAIL          = "SHIP|DETAIL"
    SHIP_FILTER_CMD      = "SHIP|FILTER_CMD"
    SHIP_FILTER_CLASS    = "SHIP|FILTER_CLASS"
    SHIP_AGG_CMD         = "SHIP|AGG_CMD"
    SHIP_AGG_CLASS       = "SHIP|AGG_CLASS"
    SHIP_SORT            = "SHIP|SORT"
    SHIP_RANGE_DATE      = "SHIP|RANGE_DATE"
    SHIP_EXISTS          = "SHIP|EXISTS"

    # ── DEPT ─────────────────────────────────────────────────────────────────

    DEPT_LIST            = "DEPT|LIST"
    DEPT_COUNT           = "DEPT|COUNT"
    DEPT_SHIP            = "DEPT|SHIP"
    DEPT_SEARCH_NAME     = "DEPT|SEARCH_NAME"
    DEPT_AGG_SHIP        = "DEPT|AGG_SHIP"
    DEPT_AGG_CMD         = "DEPT|AGG_CMD"
    DEPT_FILTER_CLASS    = "DEPT|FILTER_CLASS"
    DEPT_FILTER_CODE     = "DEPT|FILTER_CODE"
    DEPT_SHIP_COUNT      = "DEPT|SHIP_COUNT"

    # ── COMP ─────────────────────────────────────────────────────────────────

    COMP_LIST            = "COMP|LIST"
    COMP_COUNT           = "COMP|COUNT"
    COMP_DETAIL          = "COMP|DETAIL"
    COMP_EXISTS          = "COMP|EXISTS"
    COMP_SHIP            = "COMP|SHIP"
    COMP_SHIP_MULTI      = "COMP|SHIP_MULTI"       # WHERE ship_id = ANY(:ids)
    COMP_DEPT            = "COMP|DEPT"
    COMP_SHIP_DEPT       = "COMP|SHIP_DEPT"
    COMP_FILTER_TYPE     = "COMP|FILTER_TYPE"       # repairable / replaceable / ETL
    COMP_FILTER_CLASS    = "COMP|FILTER_CLASS"
    COMP_FILTER_CMD      = "COMP|FILTER_CMD"
    COMP_FILTER_SYS      = "COMP|FILTER_SYS"
    COMP_SEARCH_NAME     = "COMP|SEARCH_NAME"       # LIKE %Pump%
    COMP_HIERARCHY_ROOT  = "COMP|HIERARCHY_ROOT"
    COMP_HIERARCHY_CHILD = "COMP|HIERARCHY_CHILD"
    COMP_AGG_SHIP        = "COMP|AGG_SHIP"
    COMP_AGG_DEPT        = "COMP|AGG_DEPT"
    COMP_AGG_TYPE        = "COMP|AGG_TYPE"
    COMP_AGG_SYS         = "COMP|AGG_SYS"
    COMP_RANGE_DATE      = "COMP|RANGE_DATE"

    # ── SENSOR ───────────────────────────────────────────────────────────────

    SEN_LIST             = "SEN|LIST"
    SEN_COUNT            = "SEN|COUNT"
    SEN_DETAIL           = "SEN|DETAIL"             # PF / freq / thresholds
    SEN_COMP             = "SEN|COMP"
    SEN_SHIP             = "SEN|SHIP"
    SEN_SHIP_MULTI       = "SEN|SHIP_MULTI"         # sensors across N named ships
    SEN_SHIP_DEPT        = "SEN|SHIP_DEPT"
    SEN_SHIP_DEPT_COMP   = "SEN|SHIP_DEPT_COMP"     # full 3-level scope
    SEN_FILTER_UNIT      = "SEN|FILTER_UNIT"
    SEN_FILTER_THRESHOLD = "SEN|FILTER_THRESHOLD"
    SEN_FILTER_FREQ      = "SEN|FILTER_FREQ"
    SEN_FILTER_PF        = "SEN|FILTER_PF"
    SEN_FM_LINK          = "SEN|FM_LINK"
    SEN_FM_NONE          = "SEN|FM_NONE"
    SEN_AGG_COMP         = "SEN|AGG_COMP"
    SEN_AGG_SHIP         = "SEN|AGG_SHIP"
    SEN_AGG_UNIT         = "SEN|AGG_UNIT"
    SEN_AGG_TYPE         = "SEN|AGG_TYPE"
    SEN_SORT             = "SEN|SORT"
    SEN_COMP_TYPE        = "SEN|COMP_TYPE"

    # ── SENSOR READINGS ──────────────────────────────────────────────────────

    READ_LATEST          = "READ|LATEST"
    READ_COUNT           = "READ|COUNT"
    READ_RANGE           = "READ|RANGE"
    READ_ALERT           = "READ|ALERT"
    READ_ALERT_COMP      = "READ|ALERT_COMP"
    READ_ALERT_SHIP      = "READ|ALERT_SHIP"
    READ_ALERT_SHIP_MULTI = "READ|ALERT_SHIP_MULTI" # alerts across N named ships
    READ_ALERT_DEPT      = "READ|ALERT_DEPT"
    READ_ALERT_RATE      = "READ|ALERT_RATE"        # % readings that were alerts
    READ_AGG_SEN         = "READ|AGG_SEN"
    READ_AGG_SHIP        = "READ|AGG_SHIP"
    READ_AGG_DEPT        = "READ|AGG_DEPT"
    READ_TEMPORAL        = "READ|TEMPORAL"          # monthly/yearly rollup
    READ_TEMPORAL_SHIP   = "READ|TEMPORAL_SHIP"
    READ_OPHR            = "READ|OPHR"
    READ_OPHR_EXCEED     = "READ|OPHR_EXCEED"
    READ_THRESHOLD_CROSS = "READ|THRESHOLD_CROSS"   # value > max or < min threshold
    READ_FIRST           = "READ|FIRST"
    READ_SEN_ZERO_ALERT  = "READ|SEN_ZERO_ALERT"    # sensors that never alerted

    # ── FAILURE MODES ────────────────────────────────────────────────────────

    FM_LIST              = "FM|LIST"
    FM_COUNT             = "FM|COUNT"
    FM_COMP              = "FM|COMP"
    FM_SHIP              = "FM|SHIP"
    FM_DEPT              = "FM|DEPT"
    FM_FILTER_SEV        = "FM|FILTER_SEV"
    FM_FILTER_NAME       = "FM|FILTER_NAME"
    FM_FILTER_SYS        = "FM|FILTER_SYS"
    FM_AGG_SEV           = "FM|AGG_SEV"
    FM_AGG_COMP          = "FM|AGG_COMP"
    FM_AGG_SHIP          = "FM|AGG_SHIP"
    FM_AGG_SYS           = "FM|AGG_SYS"
    FM_SEN_LINK          = "FM|SEN_LINK"
    FM_SEN_NONE          = "FM|SEN_NONE"
    FM_COMP_NONE         = "FM|COMP_NONE"
    FM_COMP_MANY         = "FM|COMP_MANY"           # comps with > N failure modes
    FM_SHIP_TOP          = "FM|SHIP_TOP"
    FM_COMMON            = "FM|COMMON"              # most frequent FM names fleet-wide

    # ── OVERHAUL METADATA ────────────────────────────────────────────────────

    OH_META_COMP         = "OH_META|COMP"
    OH_META_SHIP         = "OH_META|SHIP"
    OH_META_DEPT         = "OH_META|DEPT"
    OH_META_FILTER_FREQ  = "OH_META|FILTER_FREQ"
    OH_META_FILTER_DATE  = "OH_META|FILTER_DATE"
    OH_META_FILTER_COUNT = "OH_META|FILTER_COUNT"
    OH_META_AGG_SHIP     = "OH_META|AGG_SHIP"
    OH_META_AGG_DEPT     = "OH_META|AGG_DEPT"
    OH_META_NONE_DATE    = "OH_META|NONE_DATE"
    OH_META_NONE_EVENTS  = "OH_META|NONE_EVENTS"
    OH_META_COMP_NONE    = "OH_META|COMP_NONE"
    OH_META_TOP          = "OH_META|TOP"
    OH_META_AVG_FREQ     = "OH_META|AVG_FREQ"

    # ── OVERHAUL READINGS ────────────────────────────────────────────────────

    OH_READ_COMP         = "OH_READ|COMP"
    OH_READ_SHIP         = "OH_READ|SHIP"
    OH_READ_SHIP_MULTI   = "OH_READ|SHIP_MULTI"     # OH readings across N named ships
    OH_READ_DEPT         = "OH_READ|DEPT"
    OH_READ_FILTER_TYPE  = "OH_READ|FILTER_TYPE"    # corrective vs preventive
    OH_READ_RANGE        = "OH_READ|RANGE"
    OH_READ_RANGE_OPHR   = "OH_READ|RANGE_OPHR"
    OH_READ_AGG_SHIP     = "OH_READ|AGG_SHIP"
    OH_READ_AGG_TYPE     = "OH_READ|AGG_TYPE"
    OH_READ_AGG_COMP     = "OH_READ|AGG_COMP"
    OH_READ_AGG_TEMPORAL = "OH_READ|AGG_TEMPORAL"
    OH_READ_OPHR_AVG     = "OH_READ|OPHR_AVG"
    OH_READ_OPHR_MAX     = "OH_READ|OPHR_MAX"
    OH_READ_OPHR_DELTA   = "OH_READ|OPHR_DELTA"     # CMMS age vs actual age diff
    OH_READ_SORT         = "OH_READ|SORT"
    OH_READ_FILTER_MISS  = "OH_READ|FILTER_MISS"    # CMMS age is null

    # ── MAINTENANCE CONFIG ───────────────────────────────────────────────────

    MAINT_CFG_COMP       = "MAINT_CFG|COMP"
    MAINT_CFG_SHIP       = "MAINT_CFG|SHIP"
    MAINT_CFG_DEPT       = "MAINT_CFG|DEPT"
    MAINT_CFG_FILTER_PM  = "MAINT_CFG|FILTER_PM"
    MAINT_CFG_FILTER_SS  = "MAINT_CFG|FILTER_SS"    # ship staff replaceable
    MAINT_CFG_FILTER_SP  = "MAINT_CFG|FILTER_SP"    # system params recorded
    MAINT_CFG_AGG_SHIP   = "MAINT_CFG|AGG_SHIP"
    MAINT_CFG_ALL_FLAGS  = "MAINT_CFG|ALL_FLAGS"    # all 3 flags = Yes
    MAINT_CFG_NONE       = "MAINT_CFG|NONE"
    MAINT_CFG_PM_NO_SS   = "MAINT_CFG|PM_NO_SS"     # PM=Yes but ship staff=No

    # ── MAINTENANCE EVENTS ───────────────────────────────────────────────────

    MAINT_LIST           = "MAINT|LIST"
    MAINT_COMP           = "MAINT|COMP"
    MAINT_SHIP           = "MAINT|SHIP"
    MAINT_SHIP_MULTI     = "MAINT|SHIP_MULTI"       # events across N named ships
    MAINT_DEPT           = "MAINT|DEPT"
    MAINT_FILTER_TYPE    = "MAINT|FILTER_TYPE"
    MAINT_FILTER_FM      = "MAINT|FILTER_FM"
    MAINT_FILTER_REPLACEMENT = "MAINT|FILTER_REPLACEMENT"
    MAINT_FILTER_CANNIBAL    = "MAINT|FILTER_CANNIBAL"
    MAINT_RANGE          = "MAINT|RANGE"
    MAINT_RANGE_TEMPORAL = "MAINT|RANGE_TEMPORAL"
    MAINT_AGG_SHIP       = "MAINT|AGG_SHIP"
    MAINT_AGG_DEPT       = "MAINT|AGG_DEPT"
    MAINT_AGG_COMP       = "MAINT|AGG_COMP"
    MAINT_AGG_TYPE       = "MAINT|AGG_TYPE"
    MAINT_AGG_FM         = "MAINT|AGG_FM"
    MAINT_DURATION_AGG   = "MAINT|DURATION_AGG"
    MAINT_DURATION_FILTER = "MAINT|DURATION_FILTER"
    MAINT_RECENT         = "MAINT|RECENT"
    MAINT_TOP_COMP       = "MAINT|TOP_COMP"
    MAINT_ZERO_FM        = "MAINT|ZERO_FM"
    MAINT_CMD_FILTER     = "MAINT|CMD_FILTER"

    # ── UTILISATION ──────────────────────────────────────────────────────────

    UTIL_COMP            = "UTIL|COMP"
    UTIL_SHIP            = "UTIL|SHIP"
    UTIL_SHIP_MULTI      = "UTIL|SHIP_MULTI"        # util across N named ships
    UTIL_DEPT            = "UTIL|DEPT"
    UTIL_FILTER_HIGH     = "UTIL|FILTER_HIGH"
    UTIL_FILTER_LOW      = "UTIL|FILTER_LOW"
    UTIL_RANGE           = "UTIL|RANGE"
    UTIL_AGG_SHIP        = "UTIL|AGG_SHIP"
    UTIL_AGG_DEPT        = "UTIL|AGG_DEPT"
    UTIL_AGG_SYS         = "UTIL|AGG_SYS"
    UTIL_TEMPORAL        = "UTIL|TEMPORAL"          # monthly trend for a comp
    UTIL_TEMPORAL_DELTA  = "UTIL|TEMPORAL_DELTA"    # month-on-month change
    UTIL_COMPARE_SHIP    = "UTIL|COMPARE_SHIP"      # ship A vs ship B avg util
    UTIL_COMPARE_COMP    = "UTIL|COMPARE_COMP"      # comp A vs comp B monthly util
    UTIL_COMPARE_PERIOD  = "UTIL|COMPARE_PERIOD"    # same comp, year-over-year
    UTIL_TOP             = "UTIL|TOP"
    UTIL_MONTHS_ACTIVE   = "UTIL|MONTHS_ACTIVE"
    UTIL_PERIOD          = "UTIL|PERIOD"            # all ships in a given month

    # ── RELIABILITY (WEIBULL) ────────────────────────────────────────────────

    REL_COMP             = "REL|COMP"
    REL_SHIP             = "REL|SHIP"
    REL_SHIP_MULTI       = "REL|SHIP_MULTI"         # Weibull params across N ships
    REL_DEPT             = "REL|DEPT"
    REL_FILTER_BETA_HIGH = "REL|FILTER_BETA_HIGH"   # beta > 1, wear-out
    REL_FILTER_BETA_LOW  = "REL|FILTER_BETA_LOW"    # beta < 1, infant mortality
    REL_FILTER_BETA_EXP  = "REL|FILTER_BETA_EXP"   # beta == 1, exponential
    REL_FILTER_ETA       = "REL|FILTER_ETA"
    REL_FILTER_ALPHA     = "REL|FILTER_ALPHA"
    REL_NONE             = "REL|NONE"
    REL_COUNT            = "REL|COUNT"
    REL_AGG_AVG          = "REL|AGG_AVG"
    REL_AGG_SHIP         = "REL|AGG_SHIP"
    REL_AGG_DEPT         = "REL|AGG_DEPT"
    REL_AGG_SYS          = "REL|AGG_SYS"
    REL_AGG_TYPE         = "REL|AGG_TYPE"           # replaceable vs repairable avg eta
    REL_COMPARE_COMP     = "REL|COMPARE_COMP"       # comp A vs comp B Weibull params
    REL_COMPARE_SHIP     = "REL|COMPARE_SHIP"       # avg eta: ship A vs ship B
    REL_PHASE            = "REL|PHASE"              # classify wear-out / burn-in per comp
    REL_TOP_ETA          = "REL|TOP_ETA"
    REL_MAX_ETA          = "REL|MAX_ETA"

    # ── RCM ──────────────────────────────────────────────────────────────────

    RCM_COMP             = "RCM|COMP"               # decision path + policy for named comp
    RCM_SHIP             = "RCM|SHIP"               # all RCM records on a ship
    RCM_DEPT             = "RCM|DEPT"               # RCM records per dept
    RCM_FILTER_POLICY    = "RCM|FILTER_POLICY"      # comps with a specific policy type
    RCM_NONE             = "RCM|NONE"               # comps with no RCM record
    RCM_COUNT            = "RCM|COUNT"              # how many comps have RCM data
    RCM_AGG_SHIP         = "RCM|AGG_SHIP"           # RCM coverage per ship

    # ── ADDITIONAL INFO / REDUNDANCY ─────────────────────────────────────────

    ADD_COMP             = "ADD|COMP"               # installation date, cycles, unit
    ADD_SHIP             = "ADD|SHIP"               # all comp additional info on ship
    ADD_FILTER_REDUND    = "ADD|FILTER_REDUND"      # k-of-n redundancy filter
    ADD_FILTER_INSTALL   = "ADD|FILTER_INSTALL"     # installed before/after date
    ADD_NONE             = "ADD|NONE"               # comps with no additional info record

    # ── CROSS-ENTITY ─────────────────────────────────────────────────────────

    CROSS_SHIP_COMP_SEN_ALERT_MAINT = "CROSS|SHIP→COMP→SEN_ALERT+MAINT"
    CROSS_COMP_REL_UTIL_HIGH        = "CROSS|COMP→REL+UTIL_HIGH"
    CROSS_COMP_BETA_OH              = "CROSS|COMP→REL_BETA+OH_EVENTS"
    CROSS_SHIP_ALERT_MAINT_YEAR     = "CROSS|SHIP→ALERT+MAINT_AGG_YEAR"
    CROSS_COMP_OH_UTIL_CORR         = "CROSS|COMP→OH_FREQ+UTIL_AVG"
    CROSS_FM_REL_LINK               = "CROSS|FM→REL_COMP"
    CROSS_DEPT_REL_NONE             = "CROSS|DEPT→COMP_REL_NONE"
    CROSS_COMP_ALERT_RATE_HIGH      = "CROSS|COMP→SEN_ALERT_RATE>10PCT"

class QueryShape(str, Enum):
    """
    Every distinct structural shape gets its own entry.
    Keys capture SHAPE only — not entity IDs.
    All IDs are sorted before key comparison (order-independent matching).
    """

    # RELIABILITY
    REL_C_S_D            = "REL|C→S|D"
    REL_CG_S_D           = "REL|CG→S|D"
    REL_C_SS_D           = "REL|C→S+S|D"
    REL_C_S_C_S_D        = "REL|C→S,C→S|D"
    REL_CG_SS_D          = "REL|CG→S+S|D"
    REL_CG_S_CG_S_D      = "REL|CG→S,CG→S|D"
    REL_ALLC_S_D         = "REL|ALL_C→S|D"
    REL_ALLC_SS_D        = "REL|ALL_C→S+S|D"
    REL_T_S_T_S_D        = "REL|T→S,T→S|D"
    REL_A_S_D            = "REL|A→S|D"
    REL_A_SS_D           = "REL|A→S+S|D"
    REL_A_S_A_S_D        = "REL|A→S,A→S|D"
    REL_ALLA_S_D         = "REL|ALL_A→S|D"
    REL_ALLA_SS_D        = "REL|ALL_A→S+S|D"
    REL_T_S_D            = "REL|T→S|D"
    REL_T_SS_D           = "REL|T→S+S|D"
    REL_CG_S_C_S_D       = "REL|CG→S,C→S|D"
    REL_C_S_CG_S_D       = "REL|C→S,CG→S|D"
    REL_ALLC_S_ALLC_S_D  = "REL|ALL_C→S,ALL_C→S|D"
    REL_ALLA_S_ALLA_S_D  = "REL|ALL_A→S,ALL_A→S|D"

    # RUL
    RUL_SN_C_S                  = "RUL|SN→C→S"
    RUL_SN_C_S_SN_C_S           = "RUL|SN→C→S,SN→C→S"
    RUL_SN_C_S_SN_C_S2          = "RUL|SN→C→S,SN→C→S2"
    RUL_ALLSN_C_S               = "RUL|ALL_SN→C→S"
    RUL_ALLSN_S                 = "RUL|ALL_SN→S"
    RUL_ALLSN_SS                = "RUL|ALL_SN→S+S"
    RUL_SN_C_SS                 = "RUL|SN→C→S+S"
    RUL_SN_C_S2_SN_C_S          = "RUL|SN→C→S2,SN→C→S"
    RUL_SN_C_S2_SN_C_S2         = "RUL|SN→C→S2,SN→C→S2"
    RUL_ALLSN_C_SS              = "RUL|ALL_SN→C→S+S"
    RUL_ALLSN_C_S_ALLSN_C_S     = "RUL|ALL_SN→C→S,ALL_SN→C→S"
    RUL_ALLSN_C_S_ALLSN_C_S2    = "RUL|ALL_SN→C→S,ALL_SN→C→S2"

    # SENSOR
    SEN_SN_C_S                  = "SEN|SN→C→S"
    SEN_SN_C_S_SN_C_S           = "SEN|SN→C→S,SEN→C→S"
    SEN_SN_C_S_SN_C_S2          = "SEN|SN→C→S,SEN→C→S2"
    SEN_ALLSN_C_S               = "SEN|ALL_SN→C→S"
    SEN_ALLSN_S                 = "SEN|ALL_SN→S"
    SEN_ALLSN_SS                = "SEN|ALL_SN→S+S"
    SEN_SN_C_SS                 = "SEN|SN→C→S+S"
    SEN_SN_C_S2_SN_C_S          = "SEN|SN→C→S2,SEN→C→S"
    SEN_SN_C_S2_SN_C_S2         = "SEN|SN→C→S2,SEN→C→S2"
    SEN_ALLSN_C_SS              = "SEN|ALL_SN→C→S+S"
    SEN_ALLSN_C_S_ALLSN_C_S     = "SEN|ALL_SN→C→S,ALL_SN→C→S"
    SEN_ALLSN_C_S_ALLSN_C_S2    = "SEN|ALL_SN→C→S,ALL_SN→C→S2"

    # RCM
    RCM_ALLA_C_S             = "RCM|ALL_A→C→S"
    RCM_ALLA_S               = "RCM|ALL_A→S"
    RCM_ALLA_SS              = "RCM|ALL_A→S+S"
    RCM_A_C_S                = "RCM|A→C→S"
    RCM_A_S                  = "RCM|A→S"
    RCM_A_SS                 = "RCM|A→S+S"
    RCM_A_C_S_A_C_S          = "RCM|A→C→S,A→C→S"
    RCM_A_S_A_S              = "RCM|A→S,A→S"
    RCM_A_S_A_S2             = "RCM|A→S,A→S2"
    RCM_ALLA_C_S_ALLA_C_S    = "RCM|ALL_A→C→S,ALL_A→C→S"
    RCM_ALLA_S_ALLA_S        = "RCM|ALL_A→S,ALL_A→S"
    RCM_ALLA_S_ALLA_S2       = "RCM|ALL_A→S,ALL_A→S2"


# ---------------------------------------------------------------------------
# Pipeline error
# ---------------------------------------------------------------------------

class PipelineStage(str, Enum):
    EXTRACTOR = "EXTRACTOR"
    LINKER    = "LINKER"
    TEMPORAL  = "TEMPORAL"
    MEMORY    = "MEMORY"
    EXECUTOR  = "EXECUTOR"


@dataclass
class PipelineError(Exception):
    """
    Typed error raised by any pipeline stage.
    Caught at the orchestrator level and turned into a user-facing message.
    """
    stage: PipelineStage
    code: str          # ENTITY_NOT_FOUND | PAIR_INVALID | SENSOR_NOT_ON_COMPONENT | NO_TIME
    message: str       # safe to show the user
    entity: Optional[str] = None

    def __str__(self) -> str:
        return f"[{self.stage}:{self.code}] {self.message}"