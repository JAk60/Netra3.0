from backend.reliabilty.relformulas import Reliability
from .base_tool import BaseTool
from typing import Dict, Any, Optional

class ReliabilityTool(BaseTool):
    """Tool for calculating component reliability with filtering support"""
    
    @property
    def name(self) -> str:
        return "get_component_reliability"
    
    @property
    def description(self) -> str:
        return "Calculate reliability score for a specific component by name over a given duration in hours with optional filtering"
    
    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "component_name": {
                    "type": "string",
                    "description": "Name/nomenclature of the component to analyze"
                },
                "duration_hours": {
                    "type": "number",
                    "minimum": 0.1,
                    "description": "Duration in hours to calculate reliability for"
                },
                "filter_config": {
                    "type": "object",
                    "description": "Optional filter configuration",
                    "properties": {
                        "ships": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of ship names to filter by"
                        },
                        "explain": {
                            "type": "boolean",
                            "description": "Include detailed explanations in the response",
                            "default": False
                        }
                    },
                    "additionalProperties": True
                }
            },
            "required": ["component_name", "duration_hours"]
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert tool to dictionary format for serialization"""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters
        }
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute reliability calculation with filtering support"""
        try:
            component_name = parameters["component_name"]
            duration = float(parameters["duration_hours"])
            
            # Extract filter_config, handling both direct and nested cases
            filter_config = parameters.get("filter_config", {})
            
            # Debug logging
            print(f"Calculating reliability for component '{component_name}' over {duration} hours")
            print(f"Filter config received: {filter_config}")
            print(f"All parameters received: {parameters}")
            
            # Call the Reliability.reliability static method with filter config
            reliability_result = await Reliability.reliability(
                duration=duration, 
                name=component_name,
                filter_config=filter_config
            )
            
            # Handle different return types (single result vs list)
            if isinstance(reliability_result, list):
                # Component with multiple nomenclatures
                # Filter out results based on applied filters
                filtered_results = []
                ships_filter = filter_config.get("ships", [])
                
                for result in reliability_result:
                    # If ship filter is applied, only include matching ships
                    if ships_filter and result.get("ship") not in ships_filter:
                        continue
                    filtered_results.append(result)
                
                # Prepare response data
                response_data = {
                    "component_name": component_name,
                    "duration_hours": duration,
                    "results": filtered_results,
                    "total_results": len(filtered_results),
                    "filters_applied": filter_config
                }
                
                if ships_filter:
                    response_data["description"] = f"Retrieved reliability data for {len(filtered_results)} nomenclatures filtered by ships: {', '.join(ships_filter)}"
                    response_data["original_count"] = len(reliability_result)
                    response_data["filtered_count"] = len(filtered_results)
                else:
                    response_data["description"] = f"Retrieved reliability data for {len(filtered_results)} nomenclatures"
                
                return {
                    "success": True,
                    "data": response_data
                }
            else:
                # Single nomenclature result
                reliability_score = reliability_result.get("reliability")
                if reliability_score is not None:
                    response_data = {
                        "component_name": component_name,
                        "component_id": reliability_result.get("component_id"),
                        "nomenclature": reliability_result.get("nomenclature"),
                        "ship": reliability_result.get("ship"),
                        "reliability_score": reliability_score,
                        "method": reliability_result.get("method"),
                        "duration_hours": duration,
                        "filters_applied": filter_config
                    }
                    
                    # Add explanation if requested
                    if filter_config.get("explain", False) and "explanation" in reliability_result:
                        response_data["explanation"] = reliability_result["explanation"]
                        response_data["description"] = f"The reliability score is {reliability_score:.4f} using {reliability_result.get('method', 'unknown')} method (with detailed explanation)"
                    else:
                        response_data["description"] = f"The reliability score is {reliability_score:.4f} using {reliability_result.get('method', 'unknown')} method"
                    
                    return {
                        "success": True,
                        "data": response_data
                    }
                else:
                    error_message = f"No reliability data found for component '{component_name}'"
                    if filter_config.get("ships"):
                        error_message += f" on ships: {', '.join(filter_config['ships'])}"
                    
                    return {
                        "success": False,
                        "error": error_message,
                        "filters_applied": filter_config
                    }
            
        except Exception as e:
            error_message = f"Failed to get reliability for '{component_name}': {str(e)}"
            return {
                "success": False,
                "error": error_message,
                "filters_applied": parameters.get("filter_config", {})
            }