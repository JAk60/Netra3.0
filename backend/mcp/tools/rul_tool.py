from backend.sensor.rul import RULCalculationService
from .base_tool import BaseTool
from typing import Dict, Any, List, Union, Optional
from fastapi.exceptions import HTTPException


class RULCalculationTool(BaseTool):
    """Tool for calculating Remaining Useful Life (RUL) for components or nomenclatures"""

    @property
    def name(self) -> str:
        return "calculate_rul"

    @property
    def description(self) -> str:
        return (
            "Calculate Remaining Useful Life (RUL) for equipment sensors using Weibull analysis "
            "and P-F curve methodology. Returns predictions at 80%, 85%, 90%, and 95% confidence levels.\n\n"

            "QUERY MODES — choose based on user intent:\n\n"

            "MODE 1 — SPECIFIC SENSORS (paired to equipment):\n"
            "  Use when user asks about specific sensors on specific equipment.\n"
            "  rul_query format: 'Calculate RUL for GTG_S4 on GT 1 of INS One'\n"
            "  rul_query format: 'RUL for GTG_S4 on GT 1 of INS One and AC_S6 on AC 2 of INS Two'\n"
            "  → Each sensor is calculated only for the equipment it was paired with.\n\n"

            "MODE 2 — FLAT SENSOR LIST (no equipment pairing):\n"
            "  Use when user mentions sensors without specifying which equipment.\n"
            "  rul_query format: 'Calculate RUL for S2 and S3'\n"
            "  → S2 and S3 are tried against every resolved nomenclature in `name`.\n\n"

            "MODE 3 — ALL SENSORS:\n"
            "  Use when user asks for all sensors, every sensor, or everything.\n"
            "  rul_query format: 'Calculate RUL for all sensors on GT 1'\n"
            "  rul_query format: 'all sensors on INS One'\n"
            "  rul_query format: 'calculate everything'\n"
            "  → Every sensor in the DB for each resolved nomenclature is calculated.\n\n"

            "IMPORTANT: Always include 'on <equipment> of <ship>' in rul_query when the user "
            "specifies which sensor belongs to which equipment. This ensures correct pairing."
        )

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "rul_query": {
                    "type": "string",
                    "description": (
                        "The query string that drives sensor detection and mode selection.\n\n"
                        "SPECIFIC SENSORS — include 'SENSOR on EQUIPMENT of SHIP':\n"
                        "  'Calculate RUL for GTG_S4 on GT 1 of INS One'\n"
                        "  'RUL for GTG_S4 on GT 1 of INS One and AC_S6 on AC 2 of INS Two'\n\n"
                        "FLAT SENSOR LIST — just mention the sensors:\n"
                        "  'Calculate RUL for S2 and S3'\n\n"
                        "ALL SENSORS — use 'all sensors', 'every sensor', or 'everything':\n"
                        "  'Calculate RUL for all sensors on GT 1'\n"
                        "  'all sensors on INS One'\n"
                        "  'calculate everything'\n\n"
                        "RULE: When the user asks about specific sensors on specific equipment, "
                        "always use 'SENSOR on EQUIPMENT of SHIP' format to avoid cross-matching."
                    )
                },
                "name": {
                    "oneOf": [
                        {
                            "type": "string",
                            "description": "Single component name or nomenclature (e.g. 'GasTurbine', 'GT 1')"
                        },
                        {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Multiple component names or nomenclatures (e.g. ['GT 1', 'AC 2'])"
                        }
                    ],
                    "description": (
                        "Component name(s) or nomenclature(s) to calculate RUL for.\n"
                        "  • Component name  → resolves to all its nomenclatures (e.g. 'GasTurbine' → GT 1, GT 2, ...)\n"
                        "  • Nomenclature    → targets a specific unit (e.g. 'GT 1')\n"
                        "  • Mixed list      → ['GasTurbine', 'AC 2']"
                    )
                },
                "ships": {
                    "oneOf": [
                        {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Filter to specific ships (e.g. ['INS One', 'INS Two'])"
                        },
                        {
                            "type": "null",
                            "description": "No ship filter — all ships returned"
                        }
                    ],
                    "description": (
                        "Optional ship filter. Pass null to include all ships.\n"
                        "Examples: ['INS One'], ['INS One', 'INS Two'], null"
                    )
                }
            },
            "required": ["rul_query", "name"]
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters
        }

    def _normalize_name(self, name: Union[str, List[str]]) -> Union[str, List[str]]:
        if isinstance(name, list):
            return [str(n) for n in name]
        return str(name)

    def _normalize_ships(self, ships: Optional[Union[List[str], str]]) -> Optional[List[str]]:
        if ships is None:
            return None
        if isinstance(ships, str):
            return [ships]
        if isinstance(ships, list):
            return [str(s) for s in ships]
        return None

    def _format_rul_result(self, nomenclature: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format RUL calculation data for a single nomenclature.

        Input data structure:
            {
                "nomenclature": "GT 1",
                "ship": "INS One",
                "sensors": {
                    "GTG_S4": {
                        "P": 80, "F": 100,
                        "confidence": [0.8, 0.85, 0.9, 0.95],
                        "remaining_life": [150.5, 145.2, 138.7, 125.3],
                        "Table": {...},
                        "weibull_params": {...},
                        "latest_readings": {...}
                    }
                }
            }
        """
        sensors_data = data.get("sensors", {})

        # RUL at 90% confidence (index 2) — standard reference level
        rul_values_90 = [
            sensor_info.get("remaining_life", [None, None, None])[2]
            for sensor_info in sensors_data.values()
        ]
        valid_rul_90 = [r for r in rul_values_90 if r is not None]

        avg_rul_90 = round(sum(valid_rul_90) / len(valid_rul_90), 2) if valid_rul_90 else None

        min_rul_90      = None
        critical_sensor = None
        for sensor_name, sensor_info in sensors_data.items():
            rul_90 = sensor_info.get("remaining_life", [None, None, None])[2]
            if rul_90 is not None:
                if min_rul_90 is None or rul_90 < min_rul_90:
                    min_rul_90      = rul_90
                    critical_sensor = sensor_name

        return {
            "nomenclature": nomenclature,
            "ship":         data.get("ship"),
            "sensors":      sensors_data,
            "sensor_list":  list(sensors_data.keys()),
            "summary": {
                "average_rul_hours_90pct":  avg_rul_90,
                "minimum_rul_hours_90pct":  min_rul_90,
                "critical_sensor":          critical_sensor,
                "total_sensors_analyzed":   len(sensors_data)
            }
        }

    def _get_confidence_description(self, confidence_level: float) -> str:
        descriptions = {
            0.80: "conservative estimate (80% confidence)",
            0.85: "moderate-conservative estimate (85% confidence)",
            0.90: "standard estimate (90% confidence)",
            0.95: "aggressive estimate (95% confidence)"
        }
        return descriptions.get(confidence_level, f"{int(confidence_level * 100)}% confidence")

    def _build_summary(self, formatted_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute aggregate summary statistics across all formatted results."""
        unique_nomenclatures = {r["nomenclature"] for r in formatted_results if r.get("nomenclature")}
        unique_ships         = {r["ship"]         for r in formatted_results if r.get("ship")}
        unique_sensors: set  = set()
        for r in formatted_results:
            unique_sensors.update(r.get("sensor_list", []))

        overall_min_rul            = None
        critical_nomenclature      = None
        critical_sensor_overall    = None
        avg_rul_values: List[float] = []

        for r in formatted_results:
            summary = r.get("summary", {})
            min_rul = summary.get("minimum_rul_hours_90pct")
            avg_rul = summary.get("average_rul_hours_90pct")

            if avg_rul is not None:
                avg_rul_values.append(avg_rul)

            if min_rul is not None:
                if overall_min_rul is None or min_rul < overall_min_rul:
                    overall_min_rul         = min_rul
                    critical_nomenclature   = r.get("nomenclature")
                    critical_sensor_overall = summary.get("critical_sensor")

        overall_avg_rul = (
            round(sum(avg_rul_values) / len(avg_rul_values), 2)
            if avg_rul_values else None
        )

        return {
            "total_nomenclatures_analyzed":  len(formatted_results),
            "total_sensors_analyzed": sum(
                r.get("summary", {}).get("total_sensors_analyzed", 0)
                for r in formatted_results
            ),
            "nomenclatures":                  sorted(unique_nomenclatures),
            "ships":                          sorted(unique_ships),
            "sensors":                        sorted(unique_sensors),
            "overall_average_rul_hours_90pct": overall_avg_rul,
            "overall_minimum_rul_hours_90pct": overall_min_rul,
            "most_critical_nomenclature":      critical_nomenclature,
            "most_critical_sensor":            critical_sensor_overall,
        }

    def _build_description(
        self,
        formatted_results: List[Dict[str, Any]],
        summary: Dict[str, Any]
    ) -> str:
        """Build a human-readable description of the RUL results."""
        unique_ships  = set(summary.get("ships", []))
        ship_info     = f" across {len(unique_ships)} ship(s)" if unique_ships else ""
        overall_min   = summary.get("overall_minimum_rul_hours_90pct")
        critical_nom  = summary.get("most_critical_nomenclature")
        critical_sen  = summary.get("most_critical_sensor")
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
                f"Most critical: {critical_nom}/{critical_sen} "
                f"with {overall_min} hours remaining (90% confidence)."
            )
        return (
            f"Analyzed {len(unique_sensors)} sensor(s) across "
            f"{summary['total_nomenclatures_analyzed']} nomenclature(s){ship_info}."
        )

    @staticmethod
    def _urgency_level(min_rul: Optional[float]) -> Optional[str]:
        if min_rul is None:
            return None
        if min_rul < 50:
            return "CRITICAL - Immediate attention required"
        if min_rul < 200:
            return "HIGH - Schedule maintenance soon"
        if min_rul < 500:
            return "MODERATE - Monitor closely"
        return "LOW - Normal operation"

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute RUL calculation."""
        try:
            rul_query = parameters.get("rul_query")
            name      = parameters["name"]
            ships     = parameters.get("ships")

            print(f"RULCalculationTool - Query: '{rul_query}'")
            print(f"RULCalculationTool - Name:  '{name}'")
            print(f"RULCalculationTool - Ships: '{ships}'")

            normalized_name  = self._normalize_name(name)
            normalized_ships = self._normalize_ships(ships)

            # ── Call service ─────────────────────────────────────────────────
            rul_response = await RULCalculationService.rul(
                rul_query=rul_query,
                name=normalized_name,
                ships=normalized_ships
            )

            ship_grouped_data = rul_response.get("data", {})
            status            = rul_response.get("status", "unknown")
            metadata          = rul_response.get("metadata", {})
            errors            = rul_response.get("errors", [])

            # ── No data returned ─────────────────────────────────────────────
            if not ship_grouped_data:
                return {
                    "success": False,
                    "error": (
                        f"No RUL data calculated for '{name}'"
                        + (f" on ships {ships}" if ships else "")
                    ),
                    "data": {
                        "rul_query": rul_query,
                        "name":      name,
                        "ships":     ships,
                        "results":   [],
                        "status":    status,
                        "metadata":  metadata,
                        "errors":    errors
                    }
                }

            # ── Flatten ship-grouped → list of formatted results ──────────────
            formatted_results = [
                self._format_rul_result(nomenclature, data)
                for ship_name, nomenclatures in ship_grouped_data.items()
                for nomenclature, data in nomenclatures.items()
            ]

            # ── Summary + description + urgency ───────────────────────────────
            summary     = self._build_summary(formatted_results)
            description = self._build_description(formatted_results, summary)
            urgency     = self._urgency_level(summary.get("overall_minimum_rul_hours_90pct"))

            # ── Build response ────────────────────────────────────────────────
            response_data: Dict[str, Any] = {
                "rul_query":   rul_query,
                "name":        name,
                "ships":       ships,
                "results":     formatted_results,
                "summary":     summary,
                "status":      status,
                "metadata":    metadata,
                "description": description,
            }

            if urgency:
                response_data["urgency_level"] = urgency

            if errors:
                response_data["errors"] = errors

            return {
                "success": status in ("success", "partial_success"),
                "data":    response_data
            }

        except HTTPException as http_exc:
            error_detail = http_exc.detail if hasattr(http_exc, "detail") else str(http_exc)

            if isinstance(error_detail, dict):
                error_message = error_detail.get("message", "RUL calculation failed")
                errors        = error_detail.get("errors", [])
            else:
                error_message = str(error_detail)
                errors        = []

            print(f"RUL Service HTTP error: {error_message}")
            print(f"Detailed errors: {errors}")

            return {
                "success": False,
                "error":   error_message,
                "data": {
                    "rul_query": parameters.get("rul_query"),
                    "name":      parameters.get("name"),
                    "ships":     parameters.get("ships"),
                    "results":   [],
                    "status":    "error",
                    "errors":    errors
                }
            }

        except Exception as e:
            error_message = (
                f"Failed to calculate RUL for '{parameters.get('name', 'unknown')}': {str(e)}"
            )
            print(f"RULCalculationTool error: {error_message}")
            import traceback
            traceback.print_exc()

            return {
                "success": False,
                "error":   error_message,
                "data": {
                    "rul_query": parameters.get("rul_query"),
                    "name":      parameters.get("name"),
                    "ships":     parameters.get("ships"),
                    "results":   []
                }
            }