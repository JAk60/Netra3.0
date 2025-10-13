import json
import re
from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime, date
from decimal import Decimal
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
        """Parse LLM tool decision"""
        try:
            decision = decision.strip()
            if decision.startswith('```'):
                decision = re.sub(r'```[a-zA-Z]*\n?', '', decision).replace('```', '')
            
            try:
                parsed = json.loads(decision)
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', decision, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                else:
                    return None
            
            tool_name = parsed.get("tool_name")
            if tool_name:
                available_tools = [tool.get("name") for tool in tools]
                if tool_name in available_tools:
                    return {"name": tool_name, "arguments": parsed.get("arguments", {})}
            
            return None
        except Exception as e:
            print(f"Error parsing tool decision: {e}")
            return None
    
    @staticmethod
    async def _create_sensor_prompt(  # Remove self!
        message: str,
        tools: List[Dict],
        filtered_ships: List[str],
        explain: bool = False,
    ) -> str:
        """
        Create prompt for sensor reading tool selection.
        Extracts time query, component/nomenclature names, and ships from the message.
        """
        # Extract component/nomenclature names from message
        name = await extract_components(message)
        ships = await extract_ships_from_message(message)
        print("ships", ships)

        # Validate that time parameters can be extracted
        time_params = await Sensor._parse_time_query(message)
        if not time_params:
            raise ValueError(
                "No time query found in message. Please specify a time period like 'last 24 hours', 'yesterday', 'last week', etc."
            )

        # Validate that component/nomenclature names were extracted
        if not name:
            raise ValueError(
                "No component or nomenclature found in message. Please specify what you want to query (e.g., 'GT', 'GT1', 'Gas Turbine')."
            )

        # Build the prompt
        prompt = f"""Analyze this sensor reading request and generate the appropriate tool call.

User Message: {message}

Extracted Information:
- Time Query: {message}
- Name (Component/Nomenclature): {name}
- Ships: {ships if ships else 'None specified'}
- Time Parameters Detected: {time_params}
"""

        if filtered_ships:
            prompt += f"- Additional Ships Context: {', '.join(filtered_ships)}\n"

        prompt += f"""
Available Tools:
{json.dumps(tools, indent=2)}

Instructions:
1. Use the 'get_sensor_readings' tool
2. Set "time_query" to the original user message: "{message}"
3. Set "name" to: {json.dumps(name)}
4. Set "ships" to: {json.dumps(ships if ships else None)}

IMPORTANT: The tool accepts THREE parameters:
- time_query: The full user message (used to extract time periods)
- name: Component name(s) or nomenclature(s) as string or array
- ships: Optional list of ship names/identifiers (can be null)

Generate ONLY a valid JSON object matching the tool's schema:
{{
    "tool_name": "get_sensor_readings",
    "arguments": {{
        "time_query": "{message}",
        "name": {json.dumps(name)},
        "ships": {json.dumps(ships if ships else None)}
    }}
}}

Note: The tool will parse the time_query parameter internally to extract the actual time range.
"""
        return prompt

    @staticmethod
    async def _create_rul_prompt(  # Remove self!
        message: str,
        tools: List[Dict],
        filtered_ships: List[str],
        explain: bool = False,
    ) -> str:
        """
        Create prompt for RUL calculation tool selection.
        Extracts component/nomenclature names and ships from the message.
        """
        name = await extract_components(message)
        ships = await extract_ships_from_message(message)
        print("ships", ships)
        
        if not name:
            raise ValueError(
                "No component or nomenclature found in message. Please specify what you want to calculate RUL for (e.g., 'GT', 'GT1', 'Gas Turbine')."
            )
        
        prompt = f"""Analyze this RUL calculation request and generate the appropriate tool call.

User Message: {message}

Extracted Information:
- RUL Query: {message}
- Name (Component/Nomenclature): {name}
- Ships: {ships if ships else 'None specified'}
"""
        
        if filtered_ships:
            prompt += f"- Additional Ships Context: {', '.join(filtered_ships)}\n"
        
        prompt += f"""
Available Tools:
{json.dumps(tools, indent=2)}

Instructions:
1. Use the 'calculate_rul' tool
2. Set "rul_query" to the original user message: "{message}"
3. Set "name" to: {json.dumps(name)}
4. Set "ships" to: {json.dumps(ships if ships else None)}

IMPORTANT: The tool accepts THREE parameters:
- rul_query: The full user message (used to extract sensor information for RUL analysis)
- name: Component name(s) or nomenclature(s) as string or array
- ships: Optional list of ship names/identifiers (can be null)

Generate ONLY a valid JSON object matching the tool's schema:
{{
    "tool_name": "calculate_rul",
    "arguments": {{
        "rul_query": "{message}",
        "name": {json.dumps(name)},
        "ships": {json.dumps(ships if ships else None)}
    }}
}}

Note: The tool will analyze the rul_query parameter to determine which sensors to calculate RUL for.
The RUL calculation uses Weibull analysis and P-F curve methodology to predict remaining operational hours
at multiple confidence levels (80%, 85%, 90%, 95%).
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