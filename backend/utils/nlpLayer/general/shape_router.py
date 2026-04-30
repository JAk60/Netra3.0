# nlpLayer/general/shape_router.py

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from backend.utils.nlpLayer.chat_logger import log_stage


@dataclass
class ShapeRoute:
    shape: str
    aggregation: Optional[str]
    route: str


# ─────────────────────────────────────────────
# CONTEXT HELPERS
# ─────────────────────────────────────────────

def _has_component(resolved) -> bool:
    return bool(resolved.components)

def _has_ship_only(resolved) -> bool:
    return bool(resolved.ships) and not resolved.components

def _has_fleet(resolved) -> bool:
    return not resolved.ships and not resolved.components

def _is_assembly(resolved) -> bool:
    return resolved.components[0].is_assembly if resolved.components else False

def _has_time(temporal) -> bool:
    return temporal and (temporal.start_ts or temporal.end_ts)


# ─────────────────────────────────────────────
# AGE QUERY DETECTOR
# ─────────────────────────────────────────────

_AGE_RE = re.compile(r'\b(current age|running age|how old)\b', re.I)

def _is_age_query(message: str) -> bool:
    return bool(_AGE_RE.search(message))


# ─────────────────────────────────────────────
# SHAPE TABLE
# ─────────────────────────────────────────────

_SHAPE_TABLE = {

    # RELIABILITY
    ("reliability_alpha", False, True,  False, False): "REL|ALPHA_COMP",
    ("reliability_alpha", False, False, True,  False): "REL|ALPHA_SHIP",

    ("reliability_eta",   False, True,  False, False): "REL|ETA_COMP",
    ("reliability_eta",   False, False, True,  False): "REL|ETA_SHIP",

    # SENSOR META
    ("sensor_meta", False, True,  False, False): "SEN|COMP",
    ("sensor_meta", False, False, True,  False): "SEN|SHIP",
    ("sensor_meta", False, False, False, True ): "SEN|LIST",

    # READINGS
    ("sensor_readings", False, True,  False, False): "READ|LATEST",
    ("sensor_readings", False, False, True,  False): "READ|AGG_SHIP",

    # ALERT
    ("fault", False, True,  False, False): "READ|ALERT_COMP",
    ("fault", False, False, True,  False): "READ|ALERT_SHIP",
    ("fault", False, False, False, True ): "READ|ALERT_SHIP",

    # MAINTENANCE
    ("maintenance", False, True,  False, False): "MAINT|COMP",
    ("maintenance", False, False, True,  False): "MAINT|SHIP",

    # OVERHAUL META
    # Routes to Overhaul_metadata table (schedule/frequency/last_overhaul_date).
    # Separated from OH_READ|* which targets Overhaul_Readings (event history).
    ("overhaul_meta", False, True,  False, False): "OH_META|COMP",
    ("overhaul_meta", False, False, True,  False): "OH_META|SHIP",

    # OVERHAUL
    ("overhaul", False, True,  False, False): "OH_READ|COMP",
    ("overhaul", False, False, True,  False): "OH_READ|SHIP",

    # UTIL
    ("utilisation", False, True,  False, False): "UTIL|COMP",
    ("utilisation", False, False, True,  False): "UTIL|SHIP",

    # COMPONENT
    ("component", False, True,  False, False): "COMP|DETAIL",
    ("component", False, False, True,  False): "COMP|AGG_SHIP",

    # SHIP
    ("ship", False, False, True,  False): "SHIP|DETAIL",
    ("ship", False, False, False, True ): "SHIP|LIST",
}


# ─────────────────────────────────────────────
# ROUTER
# ─────────────────────────────────────────────

def route(message: str, resolved, kernel, temporal=None) -> ShapeRoute:

    has_comp      = _has_component(resolved)
    has_ship_only = _has_ship_only(resolved)
    has_fleet     = _has_fleet(resolved)
    is_asm        = _is_assembly(resolved)

    lookup_key = (
        kernel.entity_target,
        is_asm,
        has_comp,
        has_ship_only,
        has_fleet,
    )

    shape = _SHAPE_TABLE.get(lookup_key)

    if shape is None:
        raise ValueError(f"[SHAPE_ROUTER] No shape for key={lookup_key}")

    # BUG FIX: Sensor-specific alert narrowing.
    # READ|ALERT_COMP filters by component_id only, returning all alerts for
    # the component regardless of which sensor was asked about. When a specific
    # sensor has been resolved, redirect to READ|ALERT_SENSOR which filters by
    # sr.sensor_id directly — the narrowest correct scope.
    if shape == "READ|ALERT_COMP" and getattr(resolved, "sensors", None):
        shape = "READ|ALERT_SENSOR"

    msg = message.lower()

    # ─────────────────────────────────────────────
    # "all overhaul events" detection
    # BUG FIX: removed redundant `"overhaul" in msg` guard — at this point
    # shape == "OH_READ|COMP" already implies entity_target == overhaul,
    # so that check was always True and only obscured the real guard.
    # ─────────────────────────────────────────────
    if shape == "OH_READ|COMP" and ("all" in msg or "history" in msg):
        shape = "OH_READ|ALL_OVERHAUL_COMP"

    # ─────────────────────────────────────────────
    # ACTION MODIFIERS
    # ─────────────────────────────────────────────

    aggregation = None

    if kernel.action == "count":
        aggregation = "COUNT"

    if kernel.action == "list":
        if shape == "OH_READ|COMP":
            shape = "OH_READ|ALL_OVERHAUL_COMP"

    if kernel.action == "latest":
        if shape == "OH_READ|COMP":
            shape = "OH_READ|LATEST_COMP"
        elif shape == "UTIL|COMP":
            shape = "UTIL|LATEST_COMP"

    # ─────────────────────────────────────────────
    # AGE DISAMBIGUATION
    # BUG FIX: extended to cover the ship-level age case.
    #
    # OH_READ|LATEST_COMP fires when a single component is named and action ==
    # "latest". If the user actually asked for current/running age, redirect to
    # OH_READ|CURRENT_AGE (TOP(1), single component — correct).
    #
    # OH_READ|SHIP fires when has_ship_only=True and no component is named.
    # For age queries at ship scope, TOP(1) in OH_READ|CURRENT_AGE would return
    # only the globally most recent non-overhaul row across all components on the
    # ship — wrong. Redirect to OH_READ|CURRENT_AGE_MULTI which uses
    # ROW_NUMBER() PARTITION BY component_id to return one row per component.
    # ─────────────────────────────────────────────
    if _is_age_query(message):
        if shape == "OH_READ|LATEST_COMP":
            shape = "OH_READ|CURRENT_AGE"
        elif shape == "OH_READ|SHIP":
            shape = "OH_READ|CURRENT_AGE_MULTI"

    if kernel.action == "range" and _has_time(temporal):
        if shape == "READ|LATEST":
            shape = "READ|RANGE"
        elif shape == "MAINT|COMP":
            shape = "MAINT|RANGE"
        elif shape == "OH_READ|COMP":
            shape = "OH_READ|RANGE"
        elif shape == "UTIL|COMP":
            shape = "UTIL|RANGE"

    # ─────────────────────────────────────────────
    # LOGGING
    # ─────────────────────────────────────────────

    log_stage(
        "SHAPE_ROUTER",
        f"entity={kernel.entity_target} action={kernel.action} "
        f"is_asm={is_asm} has_comp={has_comp} "
        f"has_ship={has_ship_only} has_fleet={has_fleet} "
        f"→ shape={shape} agg={aggregation}"
    )

    return ShapeRoute(
        shape=shape,
        aggregation=aggregation,
        route="GENERAL"
    )