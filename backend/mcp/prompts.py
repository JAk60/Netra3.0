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
        try:
            decision = decision.strip()
            if decision.startswith('```'):
                decision = re.sub(r'```[a-zA-Z]*\n?', '', decision).replace('```', '')

            try:
                parsed = json.loads(decision)
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', decision, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0).replace("'", '"')
                    try:
                        parsed = json.loads(json_str)
                    except json.JSONDecodeError:
                        import ast
                        try:
                            parsed = ast.literal_eval(json_match.group(0))
                        except (ValueError, SyntaxError):
                            return None
                else:
                    return None

            tool_name = parsed.get("tool_name")
            if tool_name:
                available_tools = [tool.get("name") for tool in tools]
                if tool_name in available_tools:
                    arguments = parsed.get("arguments", {})
                    return {"name": tool_name, "arguments": arguments}

            return None
        except Exception:
            return None

    # ── FIX #9: extract nom→ship pairings from reliability queries ────────────
    @staticmethod
    async def _extract_nom_ship_pairings(
        message: str,
        component_names: List[str],
        available_ships: List[str],
    ) -> Dict[str, str]:
        """
        Extract {nomenclature: ship} pairings from queries like:
          "GT 1 on INS ONE and GT 2 on INS TWO over 50 hours"
          "reliability of GT 1 on ins one and GT 2 on ins two"

        Returns {} if no clear pairings found (fall back to flat ship list).

        Handles:
          - "NOM on SHIP"
          - "NOM of SHIP"
          - Case-insensitive ship matching
        """
        if not component_names or not available_ships:
            return {}

        pairings: Dict[str, str] = {}

        # Split on "and" to get individual clauses
        clauses = re.split(r'\band\b', message, flags=re.IGNORECASE)

        for clause in clauses:
            # Find nomenclature in this clause
            matched_nom = None
            # Sort by length desc so "GT 10" matches before "GT 1"
            for nom in sorted(component_names, key=len, reverse=True):
                if re.search(r'\b' + re.escape(nom) + r'\b', clause, re.IGNORECASE):
                    matched_nom = nom
                    break

            if not matched_nom:
                continue

            # Find ship in this clause
            matched_ship = None
            for ship in sorted(available_ships, key=len, reverse=True):
                if re.search(r'\b' + re.escape(ship) + r'\b', clause, re.IGNORECASE):
                    matched_ship = ship
                    break

            # Normalized fallback (handles "insone" → "INS ONE" etc.)
            if not matched_ship:
                def _norm(s):
                    return re.sub(r'[\s\-_]+', '', s).lower()
                norm_clause = _norm(clause)
                for ship in sorted(available_ships, key=len, reverse=True):
                    if _norm(ship) in norm_clause:
                        matched_ship = ship
                        break

            if matched_nom and matched_ship:
                pairings[matched_nom] = matched_ship

        # Only return pairings if EVERY extracted nom got a ship
        # If some noms are unpaired, it means the query uses a shared ship list
        # (e.g. "GT 1, GT 2 on INS ONE") — don't partially pair in that case
        if len(pairings) == len(component_names):
            return pairings

        return {}

    @staticmethod
    async def _create_sensor_prompt(
        message: str,
        tools: List[Dict],
        filtered_ships: List[str],
        explain: bool = False,
    ) -> str:
        name  = await extract_components(message)
        ships = await extract_ships_from_message(message)

        print("[Sensor prompt] Extracted ships:", ships)
        print("[Sensor prompt] Extracted components:", name)

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

        if not name:
            raise ValueError(
                "No component, nomenclature, or ship found in message. "
                "Please specify what you want to query."
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
        name  = await extract_components(message)
        ships = await extract_ships_from_message(message)
        print(f"[RUL prompt] name={name}, ships={ships}")

        if not name and ships:
            print(f"[RUL prompt] No component found, fetching all nomenclatures for ship.")
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
    async def _create_reliability_prompt(
        message: str,
        tools: List[Dict[str, Any]],
        filters: Optional[any] = None
    ) -> str:
        """
        Create prompt for reliability tool selection.

        FIX #8/#9: Now extracts nom→ship pairings and passes them in
        filter_config so the reliability engine evaluates only the correct
        (nomenclature, ship) combos instead of all combinations.
        """
        try:
            component_names = []
            ships_for_extraction = []

            if filters and hasattr(filters, "ships"):
                ships_for_extraction = filters.ships or []
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

            duration_hours = Prompts._extract_duration(message)

            # Build base filter_config
            filter_config = {}
            if filters:
                if hasattr(filters, "ships") and filters.ships:
                    filter_config["ships"] = filters.ships
                if hasattr(filters, "explain") and filters.explain:
                    filter_config["explain"] = filters.explain

            # FIX #9: Extract nom→ship pairings from the message
            # e.g. "GT 1 on INS ONE and GT 2 on INS TWO" → {"GT 1": "INS ONE", "GT 2": "INS TWO"}
            if component_names and filter_config.get("ships"):
                nom_ship_pairings = await Prompts._extract_nom_ship_pairings(
                    message=message,
                    component_names=component_names,
                    available_ships=filter_config["ships"],
                )
                if nom_ship_pairings:
                    filter_config["nom_ship_pairings"] = nom_ship_pairings
                    print(f"[Reliability prompt] Nom-ship pairings: {nom_ship_pairings}")

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
{{"tool_name": "get_component_reliability", "arguments": {{"component_name": ["unknown"], "duration_hours": 50, "calculation_type": "reliability"}}}}

DO NOT add explanations, markdown, or extra text. ONLY return the JSON."""

    @staticmethod
    async def _create_rcm_prompt(
        message: str,
        tools: List[Dict],
        filtered_ships: List[str]
    ) -> str:
        from utils.nltk.component import extract_assemblies
        from utils.nltk.ship import extract_ships_from_message
        name  = await extract_assemblies(message)
        ships = await extract_ships_from_message(message)
        print("RCM - ships", ships)

        if not name:
            raise ValueError(
                "No component or nomenclature found in message. Please specify what you want RCM records for."
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

Note: The tool will retrieve RCM records including decision paths,
maintenance policies, and component metadata for the specified components.
"""
        return prompt