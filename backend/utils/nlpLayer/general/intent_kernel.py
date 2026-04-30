# nlpLayer/general/intent_kernel.py

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class IntentKernel:
    action: str
    entity_target: str


# ─────────────────────────────────────────────
# ACTION DETECTION (ordered)
# ─────────────────────────────────────────────

_ACTION_PATTERNS = [
    # BUG FIX: range must come before latest.
    # "last 3 months" contains \blast\b which matched "latest" first,
    # silently misclassifying all "last N days/weeks/months/years" queries.
    ("range", re.compile(
        r'\b(last \d+ (day|week|month|year)s?|between|from .+ to|since)\b', re.I
    )),
    ("latest", re.compile(r'\b(latest|most recent|current|last)\b', re.I)),
    ("count", re.compile(r'\b(how many|count|number of|total)\b', re.I)),
    ("compare", re.compile(r'\b(compare|vs|versus)\b', re.I)),
    ("list", re.compile(r'\b(list|show all|all the)\b', re.I)),
    ("fetch", re.compile(r'\b(show|give|get|tell|find|display|fetch)\b', re.I)),
]

_DEFAULT_ACTION = "fetch"


def detect_action(message: str) -> str:
    for action, pattern in _ACTION_PATTERNS:
        if pattern.search(message):
            return action
    return _DEFAULT_ACTION


# ─────────────────────────────────────────────
# ENTITY TARGET DETECTION
# ─────────────────────────────────────────────

_ENTITY_PATTERNS = [

    # ── RELIABILITY SPLIT ─────────────────────

    ("reliability_alpha", re.compile(
        r'\b(alpha|beta|alpha.?beta|alphabeta)\b',
        re.I
    )),

    ("reliability_eta", re.compile(
        r'\b(eta|eta.?beta|etabeta|weibull|shape parameter|scale parameter)\b',
        re.I
    )),

    # ── ALERTS ────────────────────────────────
    # BUG FIX: fault moved above sensor_meta.
    # Queries like "when was sensor X alerted?" contain both "sensor" and "alert".
    # sensor_meta was firing first on "sensor", routing to SEN|COMP instead of
    # READ|ALERT_COMP. fault must be checked before sensor_meta.

    ("fault", re.compile(
        r'\b(alert|fault|anomaly|abnormal)\b',
        re.I
    )),

    # ── SENSOR READINGS ───────────────────────

    ("sensor_readings", re.compile(
        r'\b(reading|readings|measurement|sensor data|sensor value)\b',
        re.I
    )),

    # ── SENSOR META ───────────────────────────

    ("sensor_meta", re.compile(
        r'\b(sensor|sensors|pf interval|p-f|frequency)\b',
        re.I
    )),

    # ── OVERHAUL META ─────────────────────────
    # Matches queries about overhaul schedule/frequency/metadata.
    # Must sit above overhaul so "overhaul metadata" doesn't fall through
    # to the readings-based overhaul target (OH_READ|*).
    # Routes to OH_META|* shapes → Overhaul_metadata table.

    ("overhaul_meta", re.compile(
        r'\b(overh\w+\s+meta\w*|meta\w*\s+overh\w+|overhaul\s+(schedule|frequency|interval))\b',
        re.I
    )),

    # ── OVERHAUL ──────────────────────────────
    # "current age", "running age", "how old" route to OH_READ|CURRENT_AGE
    # via the "latest" action modifier in shape_router.
    # Bare "age" intentionally excluded — too broad (e.g. "average age of ships").

    ("overhaul", re.compile(
        r'\b(overh\w+|defect|running age|current age|how old|cmms)\b',
        re.I
    )),

    # ── MAINTENANCE ───────────────────────────

    ("maintenance", re.compile(
        r'\b(maintenance|service|repair)\b',
        re.I
    )),

    # ── RCM ───────────────────────────────────

    ("rcm", re.compile(
        r'\b(rcm|policy|decision path)\b',
        re.I
    )),

    # ── UTIL ──────────────────────────────────

    ("utilisation", re.compile(
        r'\b(utilisation|utilization|uptime)\b',
        re.I
    )),

    # ── SHIP ──────────────────────────────────

    ("ship", re.compile(
        r'\b(ships?|fleet|vessels?)\b',
        re.I
    )),

    # ── COMPONENT ─────────────────────────────

    ("component", re.compile(
        r'\b(components?|equipments?|assembly)\b',
        re.I
    )),

]

_DEFAULT_ENTITY = "unknown"


def detect_entity_target(message: str) -> str:
    for target, pattern in _ENTITY_PATTERNS:
        if pattern.search(message):
            return target
    return _DEFAULT_ENTITY


# ─────────────────────────────────────────────
# MAIN ENTRY
# ─────────────────────────────────────────────

def run(message: str) -> IntentKernel:
    return IntentKernel(
        action=detect_action(message),
        entity_target=detect_entity_target(message),
    )