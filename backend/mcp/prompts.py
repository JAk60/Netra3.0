import json
import re
from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime, date
from decimal import Decimal

from api.db.dependencies import get_system_config_repository
from utils.nltk.component import extract_components
from utils.nltk.ship import extract_ships_from_message
from sensor.sensors import Sensor


class Prompts:
    """Centralized prompt templates for tool orchestration"""
    @staticmethod
    def _make_json_serializable(obj):
        """Convert objects to JSON-serializable format"""
        if obj is None:
            return None
        elif isinstance(obj, dict):
            return {key: Prompts._make_json_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [Prompts._make_json_serializable(item) for item in obj]
        elif isinstance(obj, tuple):
            return [Prompts._make_json_serializable(item) for item in obj]
        elif isinstance(obj, set):
            return [Prompts._make_json_serializable(item) for item in obj]
        elif isinstance(obj, uuid.UUID):
            return str(obj)
        elif isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        elif hasattr(obj, '__dict__'):
            return Prompts._make_json_serializable(obj.__dict__)
        elif hasattr(obj, '__str__') and not isinstance(obj, (str, int, float, bool)):
            return str(obj)
        else:
            return obj
    
    @staticmethod
    def _extract_duration(message: str) -> int:
        """Extract duration in hours from message"""
        duration_patterns = [
            r'(\d+)\s*hour', r'(\d+)\s*hr', r'(\d+)\s*h\b',
            r'last\s+(\d+)', r'past\s+(\d+)', r'over\s+(\d+)', r'for\s+(\d+)'
        ]
        
        for pattern in duration_patterns:
            match = re.search(pattern, message.lower())
            if match:
                return int(match.group(1))
        
        raise ValueError("No duration found in message. Please specify a duration.")
    
    @staticmethod
    def _parse_tool_decision(decision: str, tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse LLM tool decision - IMPROVED to handle nested structures"""
        try:
            decision = decision.strip()
            if decision.startswith('```'):
                decision = re.sub(r'```[a-zA-Z]*\n?', '', decision).replace('```', '')
            
            try:
                # ✅ First attempt: Standard JSON parsing
                parsed = json.loads(decision)
            except json.JSONDecodeError:
                # ✅ Second attempt: Extract JSON object with regex
                json_match = re.search(r'\{.*\}', decision, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                    # ✅ Handle single quotes (common LLM mistake)
                    json_str = json_str.replace("'", '"')
                    try:
                        parsed = json.loads(json_str)
                    except json.JSONDecodeError:
                        # ✅ Third attempt: Use ast.literal_eval for Python-style dicts
                        import ast
                        try:
                            # Restore single quotes for ast.literal_eval
                            parsed = ast.literal_eval(json_match.group(0))
                        except (ValueError, SyntaxError):
                            # logger.error(f"Failed to parse tool decision: {decision}")
                            return None
                else:
                    return None
            
            tool_name = parsed.get("tool_name")
            if tool_name:
                available_tools = [tool.get("name") for tool in tools]
                if tool_name in available_tools:
                    arguments = parsed.get("arguments", {})
                    
                    # # ✅ Log the parsed arguments for debugging
                    # logger.info(f"Parsed tool call: {tool_name}")
                    # logger.info(f"Arguments type check - name: {type(arguments.get('name'))}")
                    # logger.info(f"Arguments content: {arguments}")
                    
                    return {"name": tool_name, "arguments": arguments}
            
            return None
        except Exception as e:
            # logger.error(f"Error parsing tool decision: {e}", exc_info=True)
            return None
    
    @staticmethod
    async def _create_sensor_prompt(
        message: str,
        tools: List[Dict],
        filtered_ships: List[str],
        explain: bool = False,
    ) -> str:
        """
        Deterministic sensor tool selection prompt.

        IMPORTANT:
        - LLM MUST NOT reconstruct or modify the time query.
        - time_query will ALWAYS be the original user message.
        - Backend handles:
            • time parsing
            • sensor extraction
            • query mode detection (specific / flat / all)
        """

        name  = await extract_components(message)
        ships = await extract_ships_from_message(message)

        print("[Sensor prompt] Extracted ships:", ships)
        print("[Sensor prompt] Extracted components:", name)

        # ── Ship-level fallback ────────────────────────────────────────────────
        # Example:
        #   "show me all sensors on ins one"
        # → no component found but ship exists
        # → fetch all nomenclatures for that ship
        if not name and ships:
            print("[Sensor prompt] No component found, resolving all nomenclatures for ship...")
            try:
                sys_repo = get_system_config_repository()
                data_dict = await sys_repo.get_components_with_nomenclatures_by_ships(ships)

                if data_dict:
                    all_nomenclatures = [
                        nom
                        for handy_list in data_dict.values()
                        if isinstance(handy_list, list)
                        for nom in handy_list
                    ]

                    if all_nomenclatures:
                        name = all_nomenclatures
                        print(f"[Sensor prompt] Ship-level query resolved → name={name}")

            except Exception as e:
                print(f"[Sensor prompt] Failed to resolve ship-level components: {e}")

        # ── Validation ────────────────────────────────────────────────────────
        if not name:
            raise ValueError(
                "No component, nomenclature, or ship found in message. "
                "Please specify what you want to query "
                "(e.g., 'GT 1', 'Gas Turbine', 'all sensors on INS One')."
            )

        prompt = f"""
    Analyze this sensor reading request and generate the appropriate tool call.

    User Message:
    "{message}"

    Extracted:
    - Name: {json.dumps(name)}
    - Ships: {json.dumps(ships if ships else None)}

    Available Tools:
    {json.dumps(tools, indent=2)}

    Instructions:
    1. Use the "get_sensor_readings" tool.
    2. Set "time_query" EXACTLY to the original User Message above.
    3. Set "name" exactly as provided.
    4. Set "ships" exactly as provided.
    5. DO NOT modify, reconstruct, summarize, or change the user message.
    6. Return ONLY valid JSON.

    Return:
    {{
        "tool_name": "get_sensor_readings",
        "arguments": {{
            "time_query": "{message}",
            "name": {json.dumps(name)},
            "ships": {json.dumps(ships if ships else None)}
        }}
    }}
    """

        return prompt

    @staticmethod
    async def _create_rul_prompt(
        message: str,
        tools: List[Dict],
        filtered_ships: List[str],
        explain: bool = False,
    ) -> str:
        """
        Deterministic RUL tool selection prompt.

        IMPORTANT CHANGE:
        - LLM no longer constructs rul_query.
        - rul_query will ALWAYS be the original user message.
        - Backend handles mode detection (specific / flat / all).
        """

        name  = await extract_components(message)
        ships = await extract_ships_from_message(message)
        print(f"[RUL prompt] name={name}, ships={ships}")

        # ── Ship-only fallback ─────────────────────────────────────────────
        if not name and ships:
            print(f"[RUL prompt] No component found, but ships={ships} — fetching all nomenclatures for ship.")
            try:
                sys_repo = get_system_config_repository()
                data_dict = await sys_repo.get_components_with_nomenclatures_by_ships(ships)

                if data_dict:
                    all_nomenclatures = [
                        nom
                        for handy_list in data_dict.values()
                        if isinstance(handy_list, list)
                        for nom in handy_list
                    ]
                    if all_nomenclatures:
                        name = all_nomenclatures
                        print(f"[RUL prompt] Resolved ship-level query → name={name}")

            except Exception as e:
                print(f"[RUL prompt] Failed to fetch nomenclatures for ships {ships}: {e}")

        if not name:
            raise ValueError(
                "No component, nomenclature, or ship found in message. "
                "Please specify what you want to calculate RUL for."
            )

        prompt = f"""
    Analyze this RUL calculation request and generate the appropriate tool call.

    User Message:
    "{message}"

    Extracted:
    - Name: {json.dumps(name)}
    - Ships: {json.dumps(ships if ships else None)}

    Available Tools:
    {json.dumps(tools, indent=2)}

    Instructions:
    1. Use the "calculate_rul" tool.
    2. Set "rul_query" EXACTLY to the original User Message above.
    3. Set "name" exactly as provided.
    4. Set "ships" exactly as provided.
    5. Do NOT modify, reconstruct, or summarize the user message.
    6. Return ONLY valid JSON.

    Return:
    {{
        "tool_name": "calculate_rul",
        "arguments": {{
            "rul_query": "{message}",
            "name": {json.dumps(name)},
            "ships": {json.dumps(ships if ships else None)}
        }}
    }}
    """

        return prompt

    @staticmethod
    async def _create_reliability_prompt(  # Remove self!
        message: str, 
        tools: List[Dict[str, Any]], 
        filters: Optional[any] = None
    ) -> str:
        """Create prompt for reliability tool selection"""

        try:
            component_names = []
            if filters and hasattr(filters, "ships"):
                try:
                    component_names = await extract_components(message, filters.ships)
                except Exception as e:
                    print(f"Error extracting components: {e}")
                    component_names = []
            else:
                try:
                    component_names = await extract_components(message, [])
                except Exception as e:
                    print(f"Error extracting components: {e}")
                    component_names = []

            if isinstance(component_names, str):
                component_names = [component_names]
            elif not isinstance(component_names, list):
                component_names = []

            print(f"Extracted components: {component_names}")

            # Call static method correctly
            duration_hours = Prompts._extract_duration(message)

            filter_config = {}
            if filters:
                if hasattr(filters, "ships") and filters.ships:
                    filter_config["ships"] = filters.ships
                if hasattr(filters, "explain") and filters.explain:
                    filter_config["explain"] = filters.explain

            calc_type = "reliability"
            if "remaining life" in message.lower() or "rl" in message.lower():
                calc_type = "remaining_life"

            arguments = {
                "component_name": component_names if component_names else ["unknown"],
                "duration_hours": duration_hours,
                "calculation_type": calc_type,
            }

            if filter_config:
                arguments["filter_config"] = filter_config

            tool_name = "get_component_reliability"

            return f"""USER QUERY: "{message}"

EXTRACTED DATA:
- Component: {component_names}
- Calculation Type: {calc_type}
- Duration: {duration_hours} hours
- Filters: {filter_config if filter_config else "None"}

YOU MUST respond with this EXACT JSON format:
{{"tool_name": "{tool_name}", "arguments": {json.dumps(arguments)}}}

DO NOT add explanations, markdown, or extra text or any json."""

        except ValueError as ve:
            raise ve
        except Exception as e:
            print(f"Error in create_reliability_prompt: {str(e)}")
            return f"""USER QUERY: "{message}"

YOU MUST respond with this EXACT JSON format:
{{"tool_name": "get_component_reliability", "arguments": {{"component_name": ["unknown"], "duration_hours": duration, "calculation_type": "reliability"}}}}

DO NOT add explanations, markdown, or extra text. ONLY return the JSON."""
        
    @staticmethod
    async def _create_rcm_prompt(
        message: str,
        tools: List[Dict],
        filtered_ships: List[str]
    ) -> str:
        """
        Create prompt for RCM record retrieval tool selection.
        Extracts component/nomenclature names and ships from the message.
        """
        from utils.nltk.component import extract_assemblies
        from utils.nltk.ship import extract_ships_from_message
        name = await extract_assemblies(message)
        ships = await extract_ships_from_message(message)
        print("RCM - ships", ships)
        
        if not name:
            raise ValueError(
                "No component or nomenclature found in message. Please specify what you want RCM records for (e.g., 'Main Engine', 'ME1')."
            )
        
        prompt = f"""Analyze this RCM record request and generate the appropriate tool call.

    User Message: {message}

    Extracted Information:
    - RCM Query: {message}
    - Name (Component/Nomenclature): {name}
    - Ships: {ships if ships else 'None specified'}
    """
        
        if filtered_ships:
            prompt += f"- Additional Ships Context: {', '.join(filtered_ships)}\n"
        
        prompt += f"""
    Available Tools:
    {json.dumps(tools, indent=2)}

    Instructions:
    1. Use the 'get_rcm_records' tool
    2. Set "name" to: {json.dumps(name)}
    3. Set "ships" to: {json.dumps(ships if ships else None)}

    IMPORTANT: The tool accepts TWO parameters:
    - name: Component name(s) or nomenclature(s) as string or array
    - ships: Optional list of ship names/identifiers (can be null)

    Generate ONLY a valid JSON object matching the tool's schema:
    {{
        "tool_name": "get_rcm_records",
        "arguments": {{
            "name": {json.dumps(name)},
            "ships": {json.dumps(ships if ships else None)}
        }}
    }}

    Note: The tool will retrieve RCM (Reliability Centered Maintenance) records including decision paths,
    maintenance policies, and component metadata for the specified components/nomenclatures.
    """
        return prompt