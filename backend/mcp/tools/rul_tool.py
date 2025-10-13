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
            "Calculate Remaining Useful Life (RUL) for components or nomenclatures. "
            "Use this to predict remaining operational hours before failure for specific "
            "sensors on components (e.g., 'GasTurbine') or nomenclatures (e.g., 'GT1', 'GT2'). "
            "The rul_query extracts which sensors to analyze based on the user's message. "
            "Optionally filter by ships. Returns RUL predictions at multiple confidence levels "
            "(80%, 85%, 90%, 95%) using Weibull analysis and P-F curve methodology."
        )
    
    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "rul_query": {
                    "type": "string",
                    "description": (
                        "User's query message containing sensor information for RUL calculation. "
                        "This is analyzed to determine which sensors to calculate RUL for. "
                        "Example: 'Calculate RUL for S2 and S3 on GT1' or "
                        "'What is the remaining life of temperature sensors on GasTurbine'"
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
                        "Component name(s) or nomenclature(s) to calculate RUL for. "
                        "Examples: 'GasTurbine' (all gas turbines), 'GT1' (specific instance), "
                        "['GT1', 'GT2'] (multiple instances)"
                    )
                },
                "ships": {
                    "oneOf": [
                        {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of ship names or identifiers"
                        },
                        {
                            "type": "null",
                            "description": "No ship filter applied"
                        }
                    ],
                    "description": (
                        "Optional list of ship names to filter results. "
                        "Examples: ['INS One', 'INS Two'] or null for all ships"
                    )
                }
            },
            "required": ["rul_query", "name"]
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert tool to dictionary format for serialization"""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters
        }
    
    def _normalize_name(self, name: Union[str, List[str]]) -> Union[str, List[str]]:
        """Normalize name parameter to string or list of strings"""
        if isinstance(name, list):
            return [str(n) for n in name]
        return str(name)
    
    def _normalize_ships(self, ships: Optional[Union[List[str], str]]) -> Optional[List[str]]:
        """Normalize ships parameter to list of strings or None"""
        if ships is None:
            return None
        if isinstance(ships, str):
            return [ships]
        if isinstance(ships, list):
            return [str(s) for s in ships]
        return None
    
    def _format_rul_result(self, nomenclature: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format RUL calculation data for better readability.
        
        Args:
            nomenclature: The nomenclature key (e.g., "GT1")
            data: The nested RUL data dict with structure:
                  {
                      "nomenclature": "GT1",
                      "ship": "INS One",
                      "sensors": {
                          "S2": {
                              "P": 80,
                              "F": 100,
                              "confidence": [0.8, 0.85, 0.9, 0.95],
                              "remaining_life": [150.5, 145.2, 138.7, 125.3],
                              "Table": {...},
                              "weibull_params": {...},
                              "latest_readings": {...}
                          },
                          "S3": {...}
                      }
                  }
        """
        sensors_data = data.get("sensors", {})
        
        # Calculate average RUL across all sensors at 90% confidence
        # (most commonly used confidence level)
        avg_rul_90 = None
        if sensors_data:
            rul_values_90 = [
                sensor_info.get("remaining_life", [None, None, None])[2]  # Index 2 = 90% confidence
                for sensor_info in sensors_data.values()
            ]
            valid_rul_values = [r for r in rul_values_90 if r is not None]
            if valid_rul_values:
                avg_rul_90 = round(sum(valid_rul_values) / len(valid_rul_values), 2)
        
        # Find minimum RUL (most critical sensor) at 90% confidence
        min_rul_90 = None
        critical_sensor = None
        if sensors_data:
            for sensor_name, sensor_info in sensors_data.items():
                rul_90 = sensor_info.get("remaining_life", [None, None, None])[2]
                if rul_90 is not None:
                    if min_rul_90 is None or rul_90 < min_rul_90:
                        min_rul_90 = rul_90
                        critical_sensor = sensor_name
        
        formatted = {
            "nomenclature": nomenclature,
            "ship": data.get("ship"),
            "sensors": sensors_data,  # Keep nested structure
            "sensor_list": list(sensors_data.keys()),
            "summary": {
                "average_rul_hours_90pct": avg_rul_90,
                "minimum_rul_hours_90pct": min_rul_90,
                "critical_sensor": critical_sensor,
                "total_sensors_analyzed": len(sensors_data)
            }
        }
        
        return formatted
    
    def _get_confidence_description(self, confidence_level: float) -> str:
        """Get human-readable description for confidence level"""
        descriptions = {
            0.80: "conservative estimate (80% confidence)",
            0.85: "moderate-conservative estimate (85% confidence)",
            0.90: "standard estimate (90% confidence)",
            0.95: "aggressive estimate (95% confidence)"
        }
        return descriptions.get(confidence_level, f"{int(confidence_level * 100)}% confidence")
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute RUL calculation"""
        try:
            # Extract parameters
            rul_query = parameters.get("rul_query")
            name = parameters["name"]
            ships = parameters.get("ships")
            
            # Debug logging
            print(f"RULCalculationTool - Query: '{rul_query}'")
            print(f"RULCalculationTool - Name: '{name}'")
            print(f"RULCalculationTool - Ships: '{ships}'")
            
            # Normalize parameters
            normalized_name = self._normalize_name(name)
            normalized_ships = self._normalize_ships(ships)
            
            # Call the RULCalculationService.rul static method
            # ✅ Returns structure with status, data, metadata, and optional errors
            rul_response = await RULCalculationService.rul(
                rul_query=rul_query,
                name=normalized_name,
                ships=normalized_ships
            )
            
            # ✅ Extract the nested data structure
            # Structure: {"INS One": {"GT1": {...}, "GT2": {...}}, "INS Two": {...}}
            ship_grouped_data = rul_response.get("data", {})
            status = rul_response.get("status", "unknown")
            metadata = rul_response.get("metadata", {})
            errors = rul_response.get("errors", [])
            
            # Process results
            if not ship_grouped_data:
                return {
                    "success": False,
                    "error": f"No RUL data calculated for '{name}'" + (f" on ships {ships}" if ships else ""),
                    "data": {
                        "rul_query": rul_query,
                        "name": name,
                        "ships": ships,
                        "results": [],
                        "status": status,
                        "metadata": metadata,
                        "errors": errors
                    }
                }
            
            # ✅ Flatten ship-grouped structure into list of results
            formatted_results = []
            for ship_name, nomenclatures in ship_grouped_data.items():
                for nomenclature, data in nomenclatures.items():
                    formatted_results.append(
                        self._format_rul_result(nomenclature, data)
                    )
            
            # ✅ Calculate summary statistics
            unique_nomenclatures = set(
                r.get("nomenclature") 
                for r in formatted_results 
                if r.get("nomenclature")
            )
            
            unique_ships = set(
                r.get("ship") 
                for r in formatted_results 
                if r.get("ship")
            )
            
            # ✅ Collect all unique sensors across all nomenclatures
            unique_sensors = set()
            for r in formatted_results:
                unique_sensors.update(r.get("sensor_list", []))
            
            # ✅ Find overall critical nomenclature (lowest RUL)
            overall_min_rul = None
            critical_nomenclature = None
            critical_sensor_overall = None
            
            for r in formatted_results:
                summary = r.get("summary", {})
                min_rul = summary.get("minimum_rul_hours_90pct")
                if min_rul is not None:
                    if overall_min_rul is None or min_rul < overall_min_rul:
                        overall_min_rul = min_rul
                        critical_nomenclature = r.get("nomenclature")
                        critical_sensor_overall = summary.get("critical_sensor")
            
            # ✅ Calculate average RUL across all nomenclatures
            avg_rul_values = [
                r.get("summary", {}).get("average_rul_hours_90pct")
                for r in formatted_results
            ]
            valid_avg_rul = [v for v in avg_rul_values if v is not None]
            overall_avg_rul = round(sum(valid_avg_rul) / len(valid_avg_rul), 2) if valid_avg_rul else None
            
            # Build response
            response_data = {
                "rul_query": rul_query,
                "name": name,
                "ships": ships,
                "results": formatted_results,
                "summary": {
                    "total_nomenclatures_analyzed": len(formatted_results),
                    "total_sensors_analyzed": sum(
                        r.get("summary", {}).get("total_sensors_analyzed", 0)
                        for r in formatted_results
                    ),
                    "nomenclatures": sorted(list(unique_nomenclatures)),
                    "ships": sorted(list(unique_ships)),
                    "sensors": sorted(list(unique_sensors)),
                    "overall_average_rul_hours_90pct": overall_avg_rul,
                    "overall_minimum_rul_hours_90pct": overall_min_rul,
                    "most_critical_nomenclature": critical_nomenclature,
                    "most_critical_sensor": critical_sensor_overall
                },
                "status": status,
                "metadata": metadata
            }
            
            # ✅ Include errors if any (for partial_success cases)
            if errors:
                response_data["errors"] = errors
            
            # ✅ Add human-readable description
            if len(formatted_results) == 1:
                result = formatted_results[0]
                sensor_list = ", ".join(result['sensor_list'])
                ship_info = f" on {result['ship']}" if result.get('ship') else ""
                min_rul = result.get("summary", {}).get("minimum_rul_hours_90pct")
                critical = result.get("summary", {}).get("critical_sensor")
                
                if min_rul is not None and critical:
                    response_data["description"] = (
                        f"Calculated RUL for {result['nomenclature']} sensors ({sensor_list}){ship_info}. "
                        f"Most critical: {critical} with {min_rul} hours remaining (90% confidence)."
                    )
                else:
                    response_data["description"] = (
                        f"Calculated RUL for {result['nomenclature']} sensors ({sensor_list}){ship_info}."
                    )
            else:
                ship_info = f" across {len(unique_ships)} ship(s)" if unique_ships else ""
                if overall_min_rul is not None and critical_nomenclature:
                    response_data["description"] = (
                        f"Analyzed {len(unique_sensors)} sensor(s) across "
                        f"{len(unique_nomenclatures)} nomenclature(s){ship_info}. "
                        f"Most critical: {critical_nomenclature}/{critical_sensor_overall} "
                        f"with {overall_min_rul} hours remaining (90% confidence)."
                    )
                else:
                    response_data["description"] = (
                        f"Analyzed {len(unique_sensors)} sensor(s) across "
                        f"{len(unique_nomenclatures)} nomenclature(s){ship_info}."
                    )
            
            # ✅ Add interpretation guidance
            if overall_min_rul is not None:
                if overall_min_rul < 50:
                    urgency = "CRITICAL - Immediate attention required"
                elif overall_min_rul < 200:
                    urgency = "HIGH - Schedule maintenance soon"
                elif overall_min_rul < 500:
                    urgency = "MODERATE - Monitor closely"
                else:
                    urgency = "LOW - Normal operation"
                
                response_data["urgency_level"] = urgency
            
            # ✅ Determine success based on status
            is_success = status in ["success", "partial_success"]
            
            return {
                "success": is_success,
                "data": response_data
            }
        
        # ✅ CRITICAL FIX: Catch HTTPException specifically    
        except HTTPException as http_exc:
            # Extract error details from HTTPException
            error_detail = http_exc.detail if hasattr(http_exc, 'detail') else str(http_exc)
            
            # Parse the error detail if it's a dict
            if isinstance(error_detail, dict):
                error_message = error_detail.get('message', 'RUL calculation failed')
                errors = error_detail.get('errors', [])
            else:
                error_message = str(error_detail)
                errors = []
            
            print(f"RUL Service returned HTTP error: {error_message}")
            print(f"Detailed errors: {errors}")
            
            return {
                "success": False,
                "error": error_message,
                "data": {
                    "rul_query": parameters.get("rul_query"),
                    "name": parameters.get("name"),
                    "ships": parameters.get("ships"),
                    "results": [],
                    "status": "error",
                    "errors": errors
                }
            }
            
        except Exception as e:
            error_message = (
                f"Failed to calculate RUL for '{parameters.get('name', 'unknown')}': "
                f"{str(e)}"
            )
            print(f"NetraKoshx {error_message}")
            import traceback
            traceback.print_exc()
            
            return {
                "success": False,
                "error": error_message,
                "data": {
                    "rul_query": parameters.get("rul_query"),
                    "name": parameters.get("name"),
                    "ships": parameters.get("ships"),
                    "results": []
                }
            }