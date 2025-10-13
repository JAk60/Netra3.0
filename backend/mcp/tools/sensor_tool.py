from backend.sensor.sensors import Sensor
from .base_tool import BaseTool
from typing import Dict, Any, List, Union, Optional

class SensorReadingTool(BaseTool):
    """Tool for retrieving sensor readings based on component/nomenclature queries"""
    
    @property
    def name(self) -> str:
        return "get_sensor_readings"
    
    @property
    def description(self) -> str:
        return (
            "Retrieve sensor readings for components or nomenclatures. "
            "Use this to get sensor data from specific components (e.g., 'GasTurbine') "
            "or nomenclatures (e.g., 'GT1', 'GT2'). The time_query extracts which sensors "
            "to fetch and the time range based on the user's message. Optionally filter by ships."
        )
    
    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "time_query": {
                    "type": "string",
                    "description": (
                        "User's query message containing time period and sensor information. "
                        "This is analyzed to determine which sensors to retrieve and the time range. "
                        "Example: 'Show me S2 and S3 readings for GT1 in the last 24 hours' or "
                        "'Get temperature sensors for GasTurbine yesterday'"
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
                        "Component name(s) or nomenclature(s) to query. "
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
            "required": ["time_query", "name"]
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
    
    def _format_sensor_result(self, nomenclature: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format grouped sensor data for better readability.
        
        Args:
            nomenclature: The nomenclature key (e.g., "GT1")
            data: The nested sensor data dict with structure:
                  {
                      "nomenclature": "GT1",
                      "component_id": "uuid",
                      "ship": "INS One",
                      "sensors": {
                          "S2": {"sensor_id": "...", "readings": [...], "min_value": 0, "max_value": 100},
                          "S3": {...}
                      }
                  }
        """
        sensors_data = data.get("sensors", {})
        
        # Calculate total readings across all sensors
        total_readings = sum(
            len(sensor_info.get("readings", [])) 
            for sensor_info in sensors_data.values()
        )
        
        formatted = {
            "nomenclature": nomenclature,
            "component_id": data.get("component_id"),
            "ship": data.get("ship"),
            "sensors": sensors_data,  # Keep nested structure
            "total_reading_count": total_readings,
            "sensor_list": list(sensors_data.keys())  # Quick reference to available sensors
        }
        
        return formatted
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute sensor reading retrieval"""
        try:
            # Extract parameters with backward compatibility for 'query'
            time_query = parameters.get("time_query") or parameters.get("query")
            name = parameters["name"]
            ships = parameters.get("ships")
            
            # Debug logging
            print(f"SensorReadingTool - Time Query: '{time_query}'")
            print(f"SensorReadingTool - Name: '{name}'")
            print(f"SensorReadingTool - Ships: '{ships}'")
            
            # Normalize parameters
            normalized_name = self._normalize_name(name)
            normalized_ships = self._normalize_ships(ships)
            
            # Call the Sensor.sensor_readings static method
            # ✅ NEW: Returns structure with status, data, metadata, and optional errors
            sensor_response = await Sensor.sensor_readings(
                time_query=time_query,
                name=normalized_name,
                ships=normalized_ships
            )
            
            # ✅ Extract the nested data structure
            # Structure: {"INS One": {"GT1": {...}, "GT2": {...}}, "INS Two": {...}}
            ship_grouped_data = sensor_response.get("data", {})
            status = sensor_response.get("status", "unknown")
            metadata = sensor_response.get("metadata", {})
            errors = sensor_response.get("errors", [])
            
            # Process results
            if not ship_grouped_data:
                return {
                    "success": False,
                    "error": f"No sensor data found for '{name}'" + (f" on ships {ships}" if ships else ""),
                    "data": {
                        "time_query": time_query,
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
                        self._format_sensor_result(nomenclature, data)
                    )
            
            # ✅ Calculate summary statistics
            total_readings = sum(
                r.get("total_reading_count", 0) 
                for r in formatted_results
            )
            
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
            
            # Build response
            response_data = {
                "time_query": time_query,
                "name": name,
                "ships": ships,
                "results": formatted_results,
                "summary": {
                    "total_sensors_queried": len(formatted_results),
                    "total_readings": total_readings,
                    "nomenclatures": sorted(list(unique_nomenclatures)),
                    "ships": sorted(list(unique_ships)),
                    "sensors": sorted(list(unique_sensors))
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
                response_data["description"] = (
                    f"Retrieved {result['total_reading_count']} readings for "
                    f"{result['nomenclature']} sensors ({sensor_list}){ship_info}"
                )
            else:
                ship_info = f" across {len(unique_ships)} ship(s)" if unique_ships else ""
                response_data["description"] = (
                    f"Retrieved {total_readings} total readings from "
                    f"{len(unique_sensors)} sensor(s) across "
                    f"{len(unique_nomenclatures)} nomenclature(s){ship_info}"
                )
            
            # ✅ Determine success based on status
            is_success = status in ["success", "partial_success"]
            
            return {
                "success": is_success,
                "data": response_data
            }
            
        except Exception as e:
            error_message = (
                f"Failed to retrieve sensor readings for '{parameters.get('name', 'unknown')}': "
                f"{str(e)}"
            )
            print(f"Error in SensorReadingTool: {error_message}")
            import traceback
            traceback.print_exc()
            
            return {
                "success": False,
                "error": error_message,
                "data": {
                    "time_query": parameters.get("time_query") or parameters.get("query"),
                    "name": parameters.get("name"),
                    "ships": parameters.get("ships"),
                    "results": []
                }
            }