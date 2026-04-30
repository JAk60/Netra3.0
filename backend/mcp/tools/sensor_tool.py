from backend.api.db.repos.sensor.reading import SensorReadingRepository as Sensor
from .base_tool import BaseTool
from typing import Dict, Any, List, Union, Optional
from fastapi.exceptions import HTTPException


class SensorReadingTool(BaseTool):
    """Tool for retrieving sensor readings based on component/nomenclature queries"""

    @property
    def name(self) -> str:
        return "get_sensor_readings"

    @property
    def description(self) -> str:
        return (
            "Retrieve sensor readings for components or nomenclatures over a time period.\n\n"

            "QUERY MODES — choose based on user intent:\n\n"

            "MODE 1 — SPECIFIC SENSORS paired to specific equipment:\n"
            "  Use when the user mentions a sensor name AND a specific equipment/ship.\n"
            "  time_query format: 'Show <SENSOR> on <EQUIPMENT> of <SHIP> for <TIME>'\n"
            "  Multiple pairs:    'Show <S1> on <E1> of <SHIP1> and <S2> on <E2> of <SHIP2> for <TIME>'\n\n"

            "MODE 2 — SPECIFIC SENSORS without equipment pairing:\n"
            "  Use when user mentions sensor names but no specific equipment.\n"
            "  time_query format: 'Show <SENSOR1> and <SENSOR2> for <TIME>'\n\n"

            "MODE 3 — ALL SENSORS:\n"
            "  Use when user says 'all sensors', 'every sensor', or 'everything'.\n"
            "  time_query format: 'Show all sensors on <EQUIPMENT> for <TIME>'\n"
            "  time_query format: 'everything for <TIME>'\n\n"

            "TIME PERIOD FORMATS: 'last 24 hours', 'last 7 days', 'last 2 weeks', "
            "'yesterday', 'today', 'this week', 'January 2024', '2024-01-01 to 2024-01-31'. "
            "Default if unspecified: last 7 days.\n\n"

            "IMPORTANT: Always include 'on <equipment> of <ship>' in time_query when the user "
            "specifies which sensor belongs to which equipment."
        )

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "time_query": {
                    "type": "string",
                    "description": (
                        "Query string containing BOTH sensor info AND time period.\n\n"
                        "SPECIFIC SENSORS — include 'SENSOR on EQUIPMENT of SHIP for TIME':\n"
                        "  'Show GTG_S4 on GT 1 of INS One for last 7 days'\n"
                        "  'Show GTG_S4 on GT 1 of INS One and AC_S6 on AC 2 of INS Two for last 24 hours'\n\n"
                        "FLAT SENSOR LIST — sensor names + time period:\n"
                        "  'Show S2 and S3 for last 24 hours'\n\n"
                        "ALL SENSORS — use 'all sensors', 'every sensor', or 'everything':\n"
                        "  'Show all sensors on GT 1 for last 7 days'\n"
                        "  'everything for last week'\n\n"
                        "RULE: When the user asks about specific sensors on specific equipment, "
                        "always use 'SENSOR on EQUIPMENT of SHIP for TIME' format."
                    )
                },
                "name": {
                    "oneOf": [
                        {
                            "type": "string",
                            "description": "Single component name or nomenclature"
                        },
                        {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of component names or nomenclatures"
                        }
                    ],
                    "description": (
                        "Component name(s) or nomenclature(s) to query.\n"
                        "  • Component name  → resolves to all its nomenclatures\n"
                        "  • Nomenclature    → targets a specific unit (e.g. 'GT 1')\n"
                        "  • Mixed list      → ['GasTurbine', 'AC 2']"
                    )
                },
                "ships": {
                    "oneOf": [
                        {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Filter to specific ships"
                        },
                        {
                            "type": "null",
                            "description": "No ship filter — all ships returned"
                        }
                    ],
                    "description": "Optional ship filter. Pass null to include all ships."
                }
            },
            "required": ["time_query", "name"]
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name":        self.name,
            "description": self.description,
            "parameters":  self.parameters
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

    def _format_sensor_result(self, nomenclature: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format grouped sensor data for a single nomenclature.

        Input data structure:
            {
                "nomenclature": "GT 1",
                "component_id": "uuid",
                "ship": "INS One",
                "sensors": {
                    "GTG_S4": {
                        "sensor_id": "...",
                        "readings":  [...],
                        "min_value": 0,
                        "max_value": 100,
                        "unit":      "rpm"
                    }
                }
            }
        """
        sensors_data   = data.get("sensors", {})
        total_readings = sum(
            len(sensor_info.get("readings", []))
            for sensor_info in sensors_data.values()
        )

        return {
            "nomenclature":       nomenclature,
            "component_id":       data.get("component_id"),
            "ship":               data.get("ship"),
            "sensors":            sensors_data,
            "total_reading_count": total_readings,
            "sensor_list":        list(sensors_data.keys())
        }

    def _build_summary(self, formatted_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        unique_nomenclatures = {r["nomenclature"] for r in formatted_results if r.get("nomenclature")}
        unique_ships         = {r["ship"]         for r in formatted_results if r.get("ship")}
        unique_sensors: set  = set()
        for r in formatted_results:
            unique_sensors.update(r.get("sensor_list", []))

        total_readings = sum(r.get("total_reading_count", 0) for r in formatted_results)

        return {
            "total_nomenclatures_queried": len(formatted_results),
            "total_readings":              total_readings,
            "nomenclatures":               sorted(unique_nomenclatures),
            "ships":                       sorted(unique_ships),
            "sensors":                     sorted(unique_sensors)
        }

    def _build_description(
        self,
        formatted_results: List[Dict[str, Any]],
        summary: Dict[str, Any]
    ) -> str:
        unique_ships   = set(summary.get("ships", []))
        ship_info      = f" across {len(unique_ships)} ship(s)" if unique_ships else ""
        total_readings = summary["total_readings"]
        unique_sensors = summary["sensors"]

        if len(formatted_results) == 1:
            r          = formatted_results[0]
            sensor_str = ", ".join(r["sensor_list"])
            s_info     = f" on {r['ship']}" if r.get("ship") else ""
            return (
                f"Retrieved {r['total_reading_count']} readings for "
                f"{r['nomenclature']} sensors ({sensor_str}){s_info}."
            )

        return (
            f"Retrieved {total_readings} total readings from "
            f"{len(unique_sensors)} sensor(s) across "
            f"{summary['total_nomenclatures_queried']} nomenclature(s){ship_info}."
        )

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute sensor reading retrieval."""
        try:
            # Backward compatible: accept both 'time_query' and legacy 'query'
            time_query = parameters.get("time_query") or parameters.get("query")
            name       = parameters["name"]
            ships      = parameters.get("ships")

            print(f"SensorReadingTool - Time Query: '{time_query}'")
            print(f"SensorReadingTool - Name:       '{name}'")
            print(f"SensorReadingTool - Ships:      '{ships}'")

            normalized_name  = self._normalize_name(name)
            normalized_ships = self._normalize_ships(ships)

            # ── Call service ─────────────────────────────────────────────────
            sensor_response = await Sensor.sensor_readings(
                time_query=time_query,
                name=normalized_name,
                ships=normalized_ships
            )

            ship_grouped_data = sensor_response.get("data", {})
            status            = sensor_response.get("status", "unknown")
            metadata          = sensor_response.get("metadata", {})
            errors            = sensor_response.get("errors", [])

            # ── No data returned ─────────────────────────────────────────────
            if not ship_grouped_data:
                return {
                    "success": False,
                    "error": (
                        f"No sensor data found for '{name}'"
                        + (f" on ships {ships}" if ships else "")
                    ),
                    "data": {
                        "time_query": time_query,
                        "name":       name,
                        "ships":      ships,
                        "results":    [],
                        "status":     status,
                        "metadata":   metadata,
                        "errors":     errors
                    }
                }

            # ── Flatten ship-grouped → list of formatted results ──────────────
            formatted_results = [
                self._format_sensor_result(nomenclature, data)
                for ship_name, nomenclatures in ship_grouped_data.items()
                for nomenclature, data in nomenclatures.items()
            ]

            # ── Summary + description ─────────────────────────────────────────
            summary     = self._build_summary(formatted_results)
            description = self._build_description(formatted_results, summary)

            # ── Build response ────────────────────────────────────────────────
            response_data: Dict[str, Any] = {
                "time_query":  time_query,
                "name":        name,
                "ships":       ships,
                "results":     formatted_results,
                "summary":     summary,
                "status":      status,
                "metadata":    metadata,
                "description": description,
            }

            if errors:
                response_data["errors"] = errors

            return {
                "success": status in ("success", "partial_success"),
                "data":    response_data
            }

        except HTTPException as http_exc:
            error_detail = http_exc.detail if hasattr(http_exc, "detail") else str(http_exc)

            if isinstance(error_detail, dict):
                error_message = error_detail.get("message", "Sensor reading failed")
                errors        = error_detail.get("errors", [])
            else:
                error_message = str(error_detail)
                errors        = []

            print(f"Sensor Service HTTP error: {error_message}")

            return {
                "success": False,
                "error":   error_message,
                "data": {
                    "time_query": parameters.get("time_query") or parameters.get("query"),
                    "name":       parameters.get("name"),
                    "ships":      parameters.get("ships"),
                    "results":    [],
                    "status":     "error",
                    "errors":     errors
                }
            }

        except Exception as e:
            error_message = (
                f"Failed to retrieve sensor readings for "
                f"'{parameters.get('name', 'unknown')}': {str(e)}"
            )
            print(f"SensorReadingTool error: {error_message}")
            import traceback
            traceback.print_exc()

            return {
                "success": False,
                "error":   error_message,
                "data": {
                    "time_query": parameters.get("time_query") or parameters.get("query"),
                    "name":       parameters.get("name"),
                    "ships":      parameters.get("ships"),
                    "results":    []
                }
            }