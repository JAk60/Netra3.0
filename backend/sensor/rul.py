"""
sensor/rul.py
"""

import asyncio
import logging
import math
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from scipy.stats import weibull_min

from api.models.nlp.nlplayer import ResolvedTriplet
from api.db.dependencies import get_sensor_reading_repository, get_sensor_repository

logger = logging.getLogger(__name__)


class RULCalculationService:

    def __init__(self):
        pass  # deps created per-call

    CONFIDENCE_LEVELS = [0.8, 0.85, 0.9, 0.95]

    async def rul(self, triplets: List[ResolvedTriplet]) -> Dict[str, Any]:
        logger.info("[RUL] %d triplets", len(triplets))

        tasks = [
            self._calculate_rul_for_single_sensor(
                sensor_id=t.sensor_id,
                sensor_name=t.sensor_name,
                nomenclature=t.nomenclature,
                component_id=UUID(t.component_id),
                ship=t.ship_name,
            )
            for t in triplets
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        sensor_results = []
        for triplet, result in zip(triplets, results):
            if isinstance(result, Exception):
                logger.error("[RUL] Error for %s on %s/%s: %s",
                             triplet.sensor_name, triplet.nomenclature, triplet.ship_name, result)
                sensor_results.append({
                    "status":       "error",
                    "sensor_id":    triplet.sensor_id,
                    "sensor_name":  triplet.sensor_name,
                    "nomenclature": triplet.nomenclature,
                    "ship":         triplet.ship_name,
                    "error":        str(result),
                })
            else:
                sensor_results.append(result)

        # ----------------------------------------------------------------
        # Group individual sensor results by (nomenclature, ship) so that
        # _format_rul_result receives the nested "sensors" dict it expects.
        #
        # Before this fix, _format_rul_result was called with a flat per-
        # sensor result that had no "sensors" key — so sensors_data was
        # always {} and all RUL values came back null.
        # ----------------------------------------------------------------
        grouped: Dict[Tuple[str, str], Dict[str, Any]] = {}

        for r in sensor_results:
            if r.get("status") != "success":
                continue

            key = (r["nomenclature"], r["ship"])
            if key not in grouped:
                grouped[key] = {
                    "nomenclature": r["nomenclature"],
                    "ship":         r["ship"],
                    "sensors":      {},
                }

            sensor_name = r["sensor"]
            grouped[key]["sensors"][sensor_name] = {
                "sensor_id":      r["sensor_id"],
                "remaining_life": r["data"]["remaining_life"],
                "confidence":     r["data"]["confidence"],
                "P":              r["data"]["P"],
                "F":              r["data"]["F"],
                "Table":          r["data"]["Table"],
                "weibull_params": r["data"]["weibull_params"],
                "latest_readings":r["data"]["latest_readings"],
            }

        formatted   = [self._format_rul_result(v["nomenclature"], v) for v in grouped.values()]
        summary     = self._build_summary(formatted)
        description = self._build_description(formatted, summary)
        urgency     = self._urgency_level(summary.get("overall_minimum_rul_hours_90pct"))

        response = {
            "status":      "success" if not any(r.get("status") == "error" for r in sensor_results) else "partial_success",
            "data":        formatted,
            "summary":     summary,
            "description": description,
        }
        if urgency:
            response["urgency_level"] = urgency

        errors = [r for r in sensor_results if r.get("status") == "error"]
        if errors:
            response["errors"] = errors

        return response

    # ------------------------------------------------------------------
    # Core math — preserved from original
    # ------------------------------------------------------------------

    async def _calculate_rul_for_single_sensor(
        self,
        sensor_id: str,
        sensor_name: str,
        nomenclature: str,
        component_id: UUID,
        ship: str,
    ) -> Dict[str, Any]:
        metadata_repo = get_sensor_repository()
        reading_repo  = get_sensor_reading_repository()

        try:
            pf_values = await metadata_repo.get_sensor_pf_by_id(sensor_id=sensor_id)
            if pf_values is None:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": f"P and F values not found for sensor '{sensor_name}'"
                }

            p, f = pf_values
            logger.info("P=%s, F=%s for %s on %s", p, f, sensor_name, nomenclature)

            latest_readings = await reading_repo.get_latest_operating_values_readings(
                sensor_id=sensor_id
            )
            if len(latest_readings) < 2:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": "Insufficient data: need at least 2 readings"
                }

            tp = latest_readings[-1][0]
            vc = latest_readings[-1][1]
            t0 = latest_readings[-2][0]

            all_data = await reading_repo.get_latest_readings(sensor_id=sensor_id)
            if not all_data:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": "No historical data found"
                }

            data_tuples     = [(r.operating_hours, r.value) for r in all_data]
            grouped_data    = self.group_sequential_data(data_tuples)
            crossing_points = self.find_threshold_crossing_points(grouped_data, f)

            if not crossing_points:
                return {
                    "status": "error", "nomenclature": nomenclature,
                    "ship": ship, "sensor": sensor_name,
                    "error": f"Threshold F={f} has never been reached in historical data"
                }

            beta, eta      = self.estimate_weibull_sensors(crossing_points)
            remaining_life = self.calculate_rul_for_all_confidence_levels(eta, beta, tp, t0, vc, p, f)

            return {
                "status":       "success",
                "nomenclature": nomenclature,
                "ship":         ship,
                "sensor":       sensor_name,
                "sensor_id":    str(sensor_id),
                "data": {
                    "P": p, "F": f,
                    "confidence":     self.CONFIDENCE_LEVELS,
                    "remaining_life": remaining_life,
                    "Table": {
                        "0.8":  remaining_life[0],
                        "0.85": remaining_life[1],
                        "0.9":  remaining_life[2],
                        "0.95": remaining_life[3],
                    },
                    "weibull_params":   {"beta": beta, "eta": eta},
                    "latest_readings":  {"vc": vc, "tp": tp, "t0": t0},
                }
            }

        except Exception as exc:
            logger.error("RUL calculation failed for %s/%s: %s", nomenclature, sensor_name, exc, exc_info=True)
            return {
                "status": "error", "nomenclature": nomenclature,
                "ship": ship, "sensor": sensor_name, "error": str(exc)
            }

    # ------------------------------------------------------------------
    # Weibull helpers — unchanged from original
    # ------------------------------------------------------------------

    @staticmethod
    def group_sequential_data(data: List[Tuple[float, float]]) -> List[List[Tuple[float, float]]]:
        if not data:
            return []
        result, current_group = [], [data[0]]
        for item in data[1:]:
            if item[0] >= current_group[-1][0]:
                current_group.append(item)
            else:
                result.append(current_group)
                current_group = [item]
        result.append(current_group)
        return result

    @staticmethod
    def find_threshold_crossing_points(
        grouped_data: List[List[Tuple[float, float]]], threshold: float
    ) -> List[float]:
        crossing_points = []
        for group in grouped_data:
            for operating_hours, value in group:
                if value >= threshold:
                    crossing_points.append(operating_hours)
                    break
        return crossing_points

    @staticmethod
    def estimate_weibull_sensors(failure_times: List[float]) -> Tuple[float, float]:
        if not failure_times:
            raise ValueError("No failure times available for Weibull estimation")
        params = weibull_min.fit(failure_times, floc=0)
        beta, eta = params[0], params[2]
        return round(beta, 2), round(eta, 2)

    @staticmethod
    def calculate_rul(eta: float, beta: float, t0: float, confidence: float) -> float:
        try:
            reliability = math.exp(-((t0 / eta) ** beta))
            rul = (eta * (-math.log(reliability * confidence)) ** (1 / beta)) - t0
            return max(0, rul)
        except (ValueError, ZeroDivisionError) as exc:
            logger.error("RUL calculation error: %s", exc)
            return 0.0

    @classmethod
    def calculate_rul_for_all_confidence_levels(
        cls, eta: float, beta: float, tp: float, t0: float, vc: float, p: float, f: float
    ) -> List[float]:
        results = []
        for confidence in cls.CONFIDENCE_LEVELS:
            if vc < p:
                rulp = cls.calculate_rul(eta, beta, tp, confidence)
                rulc = cls.calculate_rul(eta, beta, t0, confidence)
            else:
                m    = abs(f - vc) / (f - p)
                etac = eta * m
                rulp = cls.calculate_rul(etac, beta, tp, confidence)
                rulc = cls.calculate_rul(etac, beta, t0, confidence)
            results.append(round(min(rulc, rulp), 2))
        return results

    # ------------------------------------------------------------------
    # Formatting helpers — unchanged from original
    # ------------------------------------------------------------------

    @staticmethod
    def _format_rul_result(nomenclature: str, data: Dict[str, Any]) -> Dict[str, Any]:
        sensors_data = data.get("sensors", {})
        rul_values_90 = [
            s.get("remaining_life", [None, None, None, None])[2]
            for s in sensors_data.values()
        ]
        valid_rul_90 = [r for r in rul_values_90 if r is not None]
        avg_rul_90   = round(sum(valid_rul_90) / len(valid_rul_90), 2) if valid_rul_90 else None

        min_rul_90, critical_sensor = None, None
        for sensor_name, sensor_info in sensors_data.items():
            rul_90 = sensor_info.get("remaining_life", [None, None, None, None])[2]
            if rul_90 is not None and (min_rul_90 is None or rul_90 < min_rul_90):
                min_rul_90      = rul_90
                critical_sensor = sensor_name

        return {
            "nomenclature": nomenclature,
            "ship":         data.get("ship"),
            "sensors":      sensors_data,
            "sensor_list":  list(sensors_data.keys()),
            "summary": {
                "average_rul_hours_90pct": avg_rul_90,
                "minimum_rul_hours_90pct": min_rul_90,
                "critical_sensor":         critical_sensor,
                "total_sensors_analyzed":  len(sensors_data),
            }
        }

    @staticmethod
    def _build_summary(formatted_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        unique_nomenclatures = {r["nomenclature"] for r in formatted_results if r.get("nomenclature")}
        unique_ships         = {r["ship"]         for r in formatted_results if r.get("ship")}
        unique_sensors: set  = set()
        for r in formatted_results:
            unique_sensors.update(r.get("sensor_list", []))

        overall_min_rul, critical_nomenclature, critical_sensor_overall = None, None, None
        avg_rul_values: List[float] = []

        for r in formatted_results:
            summary = r.get("summary", {})
            min_rul = summary.get("minimum_rul_hours_90pct")
            avg_rul = summary.get("average_rul_hours_90pct")
            if avg_rul is not None:
                avg_rul_values.append(avg_rul)
            if min_rul is not None and (overall_min_rul is None or min_rul < overall_min_rul):
                overall_min_rul         = min_rul
                critical_nomenclature   = r.get("nomenclature")
                critical_sensor_overall = summary.get("critical_sensor")

        return {
            "total_nomenclatures_analyzed":    len(formatted_results),
            "total_sensors_analyzed":          sum(r.get("summary", {}).get("total_sensors_analyzed", 0) for r in formatted_results),
            "nomenclatures":                   sorted(unique_nomenclatures),
            "ships":                           sorted(unique_ships),
            "sensors":                         sorted(unique_sensors),
            "overall_average_rul_hours_90pct": round(sum(avg_rul_values) / len(avg_rul_values), 2) if avg_rul_values else None,
            "overall_minimum_rul_hours_90pct": overall_min_rul,
            "most_critical_nomenclature":      critical_nomenclature,
            "most_critical_sensor":            critical_sensor_overall,
        }

    @staticmethod
    def _build_description(formatted_results: List[Dict[str, Any]], summary: Dict[str, Any]) -> str:
        unique_ships   = set(summary.get("ships", []))
        ship_info      = f" across {len(unique_ships)} ship(s)" if unique_ships else ""
        overall_min    = summary.get("overall_minimum_rul_hours_90pct")
        critical_nom   = summary.get("most_critical_nomenclature")
        critical_sen   = summary.get("most_critical_sensor")
        unique_sensors = summary.get("sensors", [])

        if len(formatted_results) == 1:
            r          = formatted_results[0]
            sensor_str = ", ".join(r["sensor_list"])
            s_info     = f" on {r['ship']}" if r.get("ship") else ""
            min_rul    = r["summary"].get("minimum_rul_hours_90pct")
            critical   = r["summary"].get("critical_sensor")
            if min_rul is not None and critical:
                return (
                    f"Calculated RUL for {r['nomenclature']} sensors ({sensor_str}){s_info}. "
                    f"Most critical: {critical} with {min_rul} hours remaining (90% confidence)."
                )
            return f"Calculated RUL for {r['nomenclature']} sensors ({sensor_str}){s_info}."

        if overall_min is not None and critical_nom:
            return (
                f"Analyzed {len(unique_sensors)} sensor(s) across "
                f"{summary['total_nomenclatures_analyzed']} nomenclature(s){ship_info}. "
                f"Most critical: {critical_nom}/{critical_sen} with {overall_min} hours remaining (90% confidence)."
            )
        return (
            f"Analyzed {len(unique_sensors)} sensor(s) across "
            f"{summary['total_nomenclatures_analyzed']} nomenclature(s){ship_info}."
        )

    @staticmethod
    def _urgency_level(min_rul: Optional[float]) -> Optional[str]:
        if min_rul is None:
            return None
        if min_rul < 50:   return "CRITICAL - Immediate attention required"
        if min_rul < 200:  return "HIGH - Schedule maintenance soon"
        if min_rul < 500:  return "MODERATE - Monitor closely"
        return "LOW - Normal operation"