from backend.reliabilty.rcm import RCMService
from .base_tool import BaseTool
from typing import Dict, Any, List, Union, Optional
import logging
import json

logger = logging.getLogger(__name__)


class RCMTool(BaseTool):
    """Tool for retrieving RCM (Reliability Centered Maintenance) records"""
    
    def __init__(self):
        super().__init__()
    
    @property
    def name(self) -> str:
        return "get_rcm_records"
    
    @property
    def description(self) -> str:
        return (
            "Retrieve RCM (Reliability Centered Maintenance) records for components or nomenclatures. "
            "Use this to get maintenance policies, decision paths, and RCM analysis data for specific "
            "components (e.g., 'Main Engine') or nomenclatures (e.g., 'ME1', 'ME2'). "
            "Optionally filter by ships. Returns RCM records including decision_path JSON, "
            "maintenance_policy recommendations, and component metadata."
        )
    
    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
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
                        },
                        {
                            "type": "object",
                            "description": "Hierarchical structure mapping parent nomenclatures to assembly nomenclatures",
                            "additionalProperties": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        }
                    ],
                    "description": (
                        "Component name(s) or nomenclature(s) to query RCM records for. "
                        "Examples: 'Main Engine' (all main engines), 'ME1' (specific instance), "
                        "['ME1', 'ME2'] (multiple instances), {'GT 1': ['p1', 'p2']} (hierarchical)"
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
                },
                "include_decision_path": {
                    "type": "boolean",
                    "description": "Whether to include full decision path JSON (default: true)",
                    "default": True
                }
            },
            "required": ["name"]
        }
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters
        }
    
    def _normalize_name(self, name: Union[str, List[str], Dict[str, List[str]]]) -> Union[str, List[str], Dict[str, List[str]]]:
        if isinstance(name, dict):
            if not name:
                raise ValueError("Assembly dictionary cannot be empty")
            normalized_dict = {}
            for parent, assemblies in name.items():
                if not isinstance(parent, str) or not parent.strip():
                    raise ValueError(f"Invalid parent nomenclature: {parent}")
                if not isinstance(assemblies, list):
                    raise ValueError(f"Assemblies must be a list for parent {parent}")
                normalized_assemblies = [str(a).strip() for a in assemblies if a and str(a).strip()]
                if not normalized_assemblies:
                    raise ValueError(f"Empty assemblies list for parent {parent}")
                normalized_dict[parent.strip()] = normalized_assemblies
            return normalized_dict
        
        if isinstance(name, list):
            normalized = [str(n).strip() for n in name if n and str(n).strip()]
            if not normalized:
                raise ValueError("Name list cannot be empty or contain only whitespace")
            return normalized
        
        name_str = str(name).strip()
        if not name_str:
            raise ValueError("Name cannot be empty or whitespace")
        return name_str
    
    def _normalize_ships(self, ships: Optional[Union[List[str], str]]) -> Optional[List[str]]:
        if ships is None:
            return None
        if isinstance(ships, str):
            ship_str = ships.strip()
            if not ship_str:
                return None
            return [ship_str]
        if isinstance(ships, list):
            normalized = [str(s).strip() for s in ships if s and str(s).strip()]
            return normalized if normalized else None
        logger.warning(f"Unexpected ships type: {type(ships)}, treating as None")
        return None
    
    def _format_rcm_result(
        self, 
        record: Dict[str, Any], 
        include_decision_path: bool = True
    ) -> Dict[str, Any]:
        if "error" in record:
            return {
                "nomenclature": record.get("nomenclature"),
                "component_id": record.get("component_id"),
                "ship": record.get("ship_id"),
                "component_name": record.get("component_name"),
                "parent_nomenclature": record.get("parent_nomenclature"),
                "has_rcm": False,
                "error": record.get("error")
            }
        
        formatted = {
            "rcm_id": record.get("rcm_id"),
            "nomenclature": record.get("nomenclature"),
            "component_id": record.get("component_id"),
            "ship": record.get("ship_id"),
            "component_name": record.get("component_name"),
            "parent_nomenclature": record.get("parent_nomenclature"),
            "has_rcm": True,
            "maintenance_policy": record.get("maintenance_policy"),
            "created_date": record.get("created_date"),
            "modified_date": record.get("modified_date")
        }
        
        if include_decision_path:
            formatted["decision_path"] = record.get("decision_path", {})
        else:
            decision_path = record.get("decision_path", {})
            formatted["decision_path_summary"] = {
                "has_path": bool(decision_path),
                "num_questions": len(decision_path) if isinstance(decision_path, dict) else 0
            }
        
        return formatted
    
    def _build_summary(self, formatted_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        records_with_rcm = sum(1 for r in formatted_results if r.get("has_rcm", False))
        records_without_rcm = len(formatted_results) - records_with_rcm
        
        unique_nomenclatures = set(r.get("nomenclature") for r in formatted_results if r.get("nomenclature"))
        unique_ships = set(r.get("ship") for r in formatted_results if r.get("ship"))
        unique_components = set(r.get("component_name") for r in formatted_results if r.get("component_name"))
        unique_parents = set(r.get("parent_nomenclature") for r in formatted_results if r.get("parent_nomenclature"))
        
        policies = [
            r.get("maintenance_policy", "").strip()
            for r in formatted_results 
            if r.get("has_rcm") and r.get("maintenance_policy")
        ]
        policy_counts = {}
        for policy in policies:
            policy_key = policy.split('.')[0][:50] if policy else "Unknown"
            policy_counts[policy_key] = policy_counts.get(policy_key, 0) + 1
        
        summary = {
            "total_records": len(formatted_results),
            "records_with_rcm": records_with_rcm,
            "records_without_rcm": records_without_rcm,
            "unique_nomenclatures": len(unique_nomenclatures),
            "unique_ships": len(unique_ships),
            "unique_components": len(unique_components),
            "nomenclatures": sorted(list(unique_nomenclatures)),
            "ships": sorted(list(unique_ships)),
            "components": sorted(list(unique_components)),
            "policy_distribution": policy_counts
        }
        
        if unique_parents:
            summary["unique_parents"] = len(unique_parents)
            summary["parents"] = sorted(list(unique_parents))
        
        return summary
    
    def _build_description(self, formatted_results: List[Dict[str, Any]], summary: Dict[str, Any]) -> str:
        if len(formatted_results) == 1:
            result = formatted_results[0]
            ship_info = f" on {result['ship']}" if result.get('ship') else ""
            parent_info = f" under {result['parent_nomenclature']}" if result.get('parent_nomenclature') else ""
            if result.get("has_rcm"):
                policy = result.get("maintenance_policy", "N/A")
                policy_preview = policy[:100] + "..." if policy and len(policy) > 100 else policy
                return f"Found RCM record for {result['nomenclature']}{parent_info}{ship_info}. Maintenance Policy: {policy_preview}"
            else:
                return f"No RCM record found for {result['nomenclature']}{parent_info}{ship_info}."
        else:
            ship_info = f" across {summary['unique_ships']} ship(s)" if summary['unique_ships'] > 0 else ""
            parent_info = f" under {summary.get('unique_parents', 0)} parent(s)" if summary.get('unique_parents') else ""
            return (
                f"Retrieved {summary['records_with_rcm']} RCM records out of "
                f"{summary['total_records']} total components "
                f"({summary['unique_nomenclatures']} nomenclature(s){parent_info}{ship_info})"
            )
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        try:
            raw_name = parameters.get("name")
            if not raw_name:
                return {
                    "success": False,
                    "error": "Parameter 'name' is required",
                    "data": {"results": []}
                }
            
            raw_ships = parameters.get("ships")
            include_decision_path = parameters.get("include_decision_path", True)
            
            logger.info(f"RCMTool - Raw params: name={raw_name}, ships={raw_ships}")
            
            # Handle stringified dict
            if isinstance(raw_name, str):
                try:
                    parsed_name = json.loads(raw_name)
                    if isinstance(parsed_name, dict):
                        raw_name = parsed_name
                except json.JSONDecodeError:
                    try:
                        fixed_json = raw_name.replace("'", '"')
                        parsed_name = json.loads(fixed_json)
                        if isinstance(parsed_name, dict):
                            raw_name = parsed_name
                    except json.JSONDecodeError:
                        try:
                            import ast
                            parsed_name = ast.literal_eval(raw_name)
                            if isinstance(parsed_name, dict):
                                raw_name = parsed_name
                        except (ValueError, SyntaxError):
                            pass
            
            try:
                normalized_name = self._normalize_name(raw_name)
                normalized_ships = self._normalize_ships(raw_ships)
            except ValueError as e:
                return {
                    "success": False,
                    "error": f"Invalid parameters: {str(e)}",
                    "data": {"results": []}
                }
            
            logger.info(f"RCMTool - Normalized: name={normalized_name}, ships={normalized_ships}")
            
            filter_config = None
            if normalized_ships:
                filter_config = {"ships": normalized_ships}
            
            try:
                rcm_results = await RCMService.get_rcm(
                    name=normalized_name,
                    filter_config=filter_config
                )
            except Exception as service_error:
                logger.error(f"RCMService error: {service_error}", exc_info=True)
                return {
                    "success": False,
                    "error": f"Database service error: {str(service_error)}",
                    "data": {
                        "name": raw_name,
                        "ships": raw_ships,
                        "results": []
                    }
                }
            
            if not rcm_results:
                ships_msg = f" on ships {normalized_ships}" if normalized_ships else ""
                return {
                    "success": False,
                    "error": f"No components found for '{normalized_name}'{ships_msg}",
                    "data": {
                        "name": raw_name,
                        "ships": raw_ships,
                        "results": [],
                        "summary": {
                            "total_records": 0,
                            "records_with_rcm": 0,
                            "records_without_rcm": 0
                        }
                    }
                }
            
            formatted_results = [
                self._format_rcm_result(record, include_decision_path) 
                for record in rcm_results
            ]
            
            summary = self._build_summary(formatted_results)
            description = self._build_description(formatted_results, summary)
            
            return {
                "success": True,
                "data": {
                    "name": raw_name,
                    "ships": raw_ships,
                    "results": formatted_results,
                    "summary": summary,
                    "description": description,
                }
            }
            
        except Exception as e:
            error_message = (
                f"Unexpected error retrieving RCM records for '{parameters.get('name', 'unknown')}': "
                f"{type(e).__name__}: {str(e)}"
            )
            logger.error(f"RCMTool error: {error_message}", exc_info=True)
            return {
                "success": False,
                "error": error_message,
                "data": {
                    "name": parameters.get("name"),
                    "ships": parameters.get("ships"),
                    "results": []
                }
            }