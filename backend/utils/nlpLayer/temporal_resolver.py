"""
nlpLayer/temporal_resolver.py
------------------------------
Stage 2B — Temporal Resolver.
Thin wrapper around dateparser. Runs in parallel with entity_linker.

Converts raw time expressions from the LLM extractor into structured
TemporalRange objects that downstream services can use directly.

Rules by intent:
    RELIABILITY  → duration_hours (float)  — required, error if absent
    SENSOR       → start_ts + end_ts       — defaults to last 7 days if absent
    RUL / RCM    → TemporalRange() with all None (not required)

Duration extraction uses a 2-layer approach for RELIABILITY:
    Layer 1 — Regex fast path  (handles 80-90% of cases, zero cost)
    Layer 2 — LLM fallback     (handles complex/written expressions)
    Both null → NO_TIME error  (vague expressions always rejected)
"""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

import dateparser

from .chat_logger import log_stage
from api.models.nlp.nlplayer import PipelineError, PipelineStage, TemporalRange

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Intent buckets
# ---------------------------------------------------------------------------
_REQUIRES_TIME   = {"RELIABILITY"}
_USES_TIMESTAMP  = {"SENSOR"}
_NO_TIME         = {"RUL", "RCM"}

_DEFAULT_SENSOR_DAYS = 7

# ---------------------------------------------------------------------------
# Word-number map (extend as needed)
# ---------------------------------------------------------------------------
_WORD_TO_NUM: dict[str, float] = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40,
    "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80,
    "ninety": 90, "hundred": 100,
}
_WORD_NUM_PATTERN = "|".join(_WORD_TO_NUM.keys())

# Noise words to strip before matching
_NOISE = re.compile(
    r"\b(next|over|the|a|an|for|after|coming|upcoming|within|past|last|in|of|period|window|duration)\b",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Layer 1 regex patterns
# Number can be:  digits (50, 2.5)  OR  written word (fifty, two)
# Separator:      optional space or hyphen
# Unit:           h/hr/hrs/hour/hours | d/day/days | w/week/weeks
# ---------------------------------------------------------------------------
_SEP    = r"[\s\-]*"
_NUM    = rf"(\d+(?:\.\d+)?|{_WORD_NUM_PATTERN})"
_HOURS  = rf"{_NUM}{_SEP}(?:h(?:rs?|ours?)?)"
_DAYS   = rf"{_NUM}{_SEP}(?:d(?:ays?)?)"
_WEEKS  = rf"{_NUM}{_SEP}(?:w(?:eeks?)?)"

_RE_HOURS = re.compile(_HOURS, re.IGNORECASE)
_RE_DAYS  = re.compile(_DAYS,  re.IGNORECASE)
_RE_WEEKS = re.compile(_WEEKS, re.IGNORECASE)

# ---------------------------------------------------------------------------
# LLM prompt for Layer 2
# ---------------------------------------------------------------------------
_DURATION_PROMPT = """\
Extract a specific duration in hours from the phrase below.

Rules:
- Only return a number if an EXPLICIT duration is stated.
- Convert days → multiply by 24, weeks → multiply by 168.
- If the duration is vague ("a few", "short term", "some time", "a while") return null.
- If no concrete duration can be determined, return null.
- Return ONLY a JSON object: {{"hours": <float>}} or {{"hours": null}}

Phrase: "{expression}"
"""


def _word_to_float(token: str) -> float:
    """Convert a matched token (digit string or word) to float."""
    lower = token.lower()
    if lower in _WORD_TO_NUM:
        return float(_WORD_TO_NUM[lower])
    return float(token)


class TemporalResolver:
    """
    Converts raw time phrases to structured TemporalRange.

    Designed to be instantiated once and reused across requests.
    Accepts an optional `llm_client` for Layer 2 duration fallback.
    """

    def __init__(self, llm_client=None):
        """
        Args:
            llm_client: Any client exposing a
                        ``complete(prompt: str) -> str`` method.
                        If None, Layer 2 is skipped and vague expressions
                        go straight to NO_TIME.
        """
        self._llm = llm_client

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def resolve(self, raw_expression: Optional[str], intent: str) -> TemporalRange:
        """
        Main entry point. Returns a TemporalRange or raises PipelineError.

        Args:
            raw_expression: The raw time phrase from the LLM extractor,
                            e.g. "50-hour period", "next fifty hours", "last week".
            intent: RELIABILITY | SENSOR | RUL | RCM
        """
        log_stage("TEMPORAL", f"raw={repr(raw_expression)} intent={intent}")

        # Intents that don't use time at all
        if intent in _NO_TIME:
            log_stage("TEMPORAL", f"{intent} does not require time → null range")
            return TemporalRange(raw_expression=raw_expression)

        # No expression provided
        if not raw_expression or raw_expression.strip().lower() in ("", "none", "null"):
            return self._apply_default(intent)

        # ----------------------------------------------------------------
        # RELIABILITY → scalar duration extraction (NO dateparser)
        # ----------------------------------------------------------------
        if intent in _REQUIRES_TIME:
            hours = self._extract_duration_hours(raw_expression)
            if hours is None:
                raise PipelineError(
                    stage=PipelineStage.TEMPORAL,
                    code="NO_TIME",
                    message=f"Could not extract a duration from '{raw_expression}'. "
                            "Please specify a time period, e.g. 'over 50 hours' or 'next 3 days'.",
                )
            log_stage("TEMPORAL", f"→ duration_hours={hours}")
            return TemporalRange(raw_expression=raw_expression, duration_hours=hours)

        # ----------------------------------------------------------------
        # SENSOR → calendar range (dateparser handles anything)
        # ----------------------------------------------------------------
        if intent in _USES_TIMESTAMP:
            start, end = self._to_timestamp_range(raw_expression)
            if start is None or end is None:
                log_stage("TEMPORAL", "dateparser failed → applying 7-day default")
                return self._apply_default(intent)
            log_stage("TEMPORAL", f"→ start={start.isoformat()} end={end.isoformat()}")
            return TemporalRange(raw_expression=raw_expression, start_ts=start, end_ts=end)

        # Fallback for unknown intents
        return TemporalRange(raw_expression=raw_expression)

    # ------------------------------------------------------------------
    # Duration extraction — 2-layer
    # ------------------------------------------------------------------

    def _extract_duration_hours(self, expression: str) -> Optional[float]:
        """
        2-layer duration extraction for RELIABILITY intent.

        Layer 1 — regex (fast, zero cost)
        Layer 2 — LLM  (handles written numbers, complex phrasing)
        """
        # Strip noise words to simplify matching
        cleaned = _NOISE.sub(" ", expression).strip()
        cleaned = re.sub(r"\s{2,}", " ", cleaned)
        log_stage("TEMPORAL", f"cleaned expression='{cleaned}'")

        # --- Layer 1: regex ---
        hours = self._regex_extract(cleaned)
        if hours is not None:
            log_stage("TEMPORAL", f"Layer1 hit → {hours}h")
            return hours

        log_stage("TEMPORAL", "Layer1 miss → trying LLM fallback")

        # --- Layer 2: LLM ---
        hours = self._llm_extract(expression)  # pass original, LLM has context
        if hours is not None:
            log_stage("TEMPORAL", f"Layer2 hit → {hours}h")
            return hours

        log_stage("TEMPORAL", "Layer2 miss → no duration found")
        return None

    def _regex_extract(self, cleaned: str) -> Optional[float]:
        """Layer 1 — regex patterns over noise-stripped expression."""
        m = _RE_HOURS.search(cleaned)
        if m:
            return _word_to_float(m.group(1))

        m = _RE_DAYS.search(cleaned)
        if m:
            return _word_to_float(m.group(1)) * 24.0

        m = _RE_WEEKS.search(cleaned)
        if m:
            return _word_to_float(m.group(1)) * 24.0 * 7.0

        return None

    def _llm_extract(self, expression: str) -> Optional[float]:
        """
        Layer 2 — LLM fallback for complex/written expressions.
        Returns None if LLM is unavailable, returns null, or errors.
        """
        if self._llm is None:
            log_stage("TEMPORAL", "no LLM client configured, skipping Layer2")
            return None

        prompt = _DURATION_PROMPT.format(expression=expression)
        try:
            raw_response = self._llm.complete(prompt)
            data = json.loads(raw_response)
            hours = data.get("hours")
            if hours is None:
                return None
            return float(hours)
        except (json.JSONDecodeError, ValueError, KeyError) as exc:
            logger.warning("LLM duration parse failed for '%s': %s", expression, exc)
            return None
        except Exception as exc:
            logger.warning("LLM client error for '%s': %s", expression, exc)
            return None

    # ------------------------------------------------------------------
    # Timestamp range — dateparser (SENSOR only)
    # ------------------------------------------------------------------

    def _to_timestamp_range(self, expression: str) -> tuple[Optional[datetime], Optional[datetime]]:
        """
        Parse expression into a (start, end) timestamp range.
        End is always now. Start is resolved by dateparser.
        Handles open-ended ("since Monday") and closed ranges ("Monday to Friday").
        """
        now = datetime.now(timezone.utc)
        try:
            parsed = dateparser.parse(
                expression,
                settings={
                    "PREFER_DAY_OF_MONTH": "first",
                    "RETURN_AS_TIMEZONE_AWARE": True,
                    "RELATIVE_BASE": now,
                    "TO_TIMEZONE": "UTC",
                }
            )
            if parsed:
                return parsed, now
        except Exception as exc:
            logger.warning("dateparser error for '%s': %s", expression, exc)

        return None, None

    # ------------------------------------------------------------------
    # Defaults
    # ------------------------------------------------------------------

    def _apply_default(self, intent: str) -> TemporalRange:
        """
        Apply intent-specific defaults when no time expression was provided.
        SENSOR      → last 7 days (start/end timestamps)
        RELIABILITY → error (always required)
        """
        if intent in _REQUIRES_TIME:
            raise PipelineError(
                stage=PipelineStage.TEMPORAL,
                code="NO_TIME",
                message="Please specify a time period for reliability queries, "
                        "e.g. 'over 50 hours' or 'next 3 days'.",
            )

        if intent in _USES_TIMESTAMP:
                now = datetime.now(timezone.utc)
                log_stage("TEMPORAL", "no time given for SENSOR → fetching all data (no start bound)")
                return TemporalRange(
                    raw_expression=None,
                    start_ts=None,
                    end_ts=now,
                    is_default=True,
                )

        return TemporalRange()