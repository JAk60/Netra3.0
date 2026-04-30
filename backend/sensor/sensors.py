"""
sensor/sensors.py
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from api.models.nlp.nlplayer import ResolvedTriplet, TemporalRange
from api.db.dependencies import get_sensor_reading_repository, get_sensor_repository

logger = logging.getLogger(__name__)


class SensorReadingService:

    def __init__(self):
        pass  # deps created per-call

    async def sensor_readings(
        self,
        triplets: List[ResolvedTriplet],
        temporal: TemporalRange,
    ) -> Dict[str, Any]:
        logger.info(
            "[Sensors] %d triplets, start=%s end=%s",
            len(triplets),
            temporal.start_ts.isoformat() if temporal.start_ts else "default",
            temporal.end_ts.isoformat() if temporal.end_ts else "now",
        )

        metadata_repo = get_sensor_repository()
        reading_repo  = get_sensor_reading_repository()

        start_ts, end_ts = self._resolve_time_window(temporal)
        sensor_map: Dict[str, ResolvedTriplet] = {t.sensor_id: t for t in triplets}

        readings = await self._fetch_sensor_readings_batch(
            triplets=list(sensor_map.values()),
            start=start_ts,
            end=end_ts,
            metadata_repo=metadata_repo,
            reading_repo=reading_repo,
        )

        results = []
        for sensor_id, triplet in sensor_map.items():
            sensor_data = readings.get(sensor_id, {})
            results.append({
                "sensor_id":     sensor_id,
                "sensor_name":   triplet.sensor_name,
                "nomenclature":  triplet.nomenclature,
                "ship":          triplet.ship_name,
                "component_id":  triplet.component_id,
                "readings":      sensor_data.get("readings", []),
                "min_value":     sensor_data.get("min_value"),
                "max_value":     sensor_data.get("max_value"),
                "unit":          sensor_data.get("unit"),
                "reading_count": len(sensor_data.get("readings", [])),
                "time_window": {
                    "start":      start_ts.isoformat() if start_ts else None,
                    "end":        end_ts.isoformat() if end_ts else None,
                    "is_default": temporal.is_default,
                },
            })

        return {
            "results":       results,
            "total_sensors": len(triplets),
            "time_window": {
                "start": start_ts.isoformat() if start_ts else None,
                "end":   end_ts.isoformat() if end_ts else None,
            },
        }

    # ------------------------------------------------------------------
    # Core DB reads
    # ------------------------------------------------------------------

    async def _fetch_sensor_readings_batch(
        self,
        triplets: List[ResolvedTriplet],
        start: datetime,
        end: datetime,
        metadata_repo,
        reading_repo,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Fetch readings + minmax for each sensor_id.
        Returns dict keyed by sensor_id.
        """
        if not triplets:
            return {}

        result: Dict[str, Dict[str, Any]] = {}

        for triplet in triplets:
            sensor_id    = triplet.sensor_id
            component_id = triplet.component_id

            try:
                sensor_minmax = await metadata_repo.get_sensor_minmax_by_id(sensor_id=sensor_id)
                if sensor_minmax is None:
                    logger.warning("[Sensors] No minmax for sensor_id=%s", sensor_id)
                    min_val = max_val = unit = None
                else:
                    min_val, max_val, unit = sensor_minmax

                readings = await reading_repo.get_readings_time_based(
                    sensor_id=sensor_id,
                    component_id=component_id,
                    start_date=start,
                    end_date=end,
                )

                if readings is None:
                    readings = []

                result[sensor_id] = {
                    "readings":  readings,
                    "min_value": min_val,
                    "max_value": max_val,
                    "unit":      unit,
                }

            except Exception as exc:
                logger.error("[Sensors] Failed for sensor_id=%s: %s", sensor_id, exc)
                result[sensor_id] = {"readings": [], "min_value": None, "max_value": None, "unit": None}

        return result

    # ------------------------------------------------------------------
    # Time window resolution
    # ------------------------------------------------------------------

    def _resolve_time_window(self, temporal: TemporalRange) -> Tuple[datetime, datetime]:
        if temporal.start_ts and temporal.end_ts:
            return temporal.start_ts, temporal.end_ts

        logger.warning("[Sensors] No time window in TemporalRange — fetching all data (no start bound)")
        end = datetime.now(timezone.utc)
        return None, end  # None start → repo skips the lower-bound WHERE clause