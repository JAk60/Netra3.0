from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
import asyncio
import json
import re
from typing import Dict, Any, Optional

# Ship database for disambiguation
SHIPS_DATABASE = {
    "gt1": {"name": "GT Ship 1", "sensors": ["s1", "s2", "s3", "temp1", "humidity1"]},
    "gt2": {"name": "GT Ship 2", "sensors": ["s1", "s2", "temp2", "pressure1"]},
    "mv_atlantic": {"name": "MV Atlantic", "sensors": ["s1", "s4", "s5", "navigation1"]},
    "ss_pacific": {"name": "SS Pacific", "sensors": ["s2", "s3", "engine1", "fuel1"]},
}

# =============================================================================
# DISAMBIGUATION AGENT (Separate Entity)
# =============================================================================

def get_available_ships() -> Dict[str, Any]:
    """Tool for disambiguation agent to get available ships."""
    return {
        "ships": [
            {"code": code, "name": details["name"], "sensors": details["sensors"]}
            for code, details in SHIPS_DATABASE.items()
        ]
    }

def find_sensor_on_ships(sensor_id: str) -> Dict[str, Any]:
    """Tool to find which ships have a specific sensor."""
    matching_ships = []
    for ship_code, ship_details in SHIPS_DATABASE.items():
        if sensor_id.lower() in [s.lower() for s in ship_details["sensors"]]:
            matching_ships.append({
                "ship_code": ship_code,
                "ship_name": ship_details["name"]
            })
    
    return {
        "sensor_id": sensor_id,
        "found_on_ships": matching_ships,
        "total_matches": len(matching_ships)
    }

# Disambiguation Agent - handles ambiguous queries
disambiguation_agent = Agent(
    model=OpenAIChatModel(
        model_name="mistral",
        provider=OpenAIProvider(
            base_url="http://localhost:11434/v1",
            api_key="ollama"
        ),
    ),
    system_prompt="""You are a Query Disambiguation Agent for maritime systems.

Your ONLY job is to resolve ambiguous queries by identifying missing ship information.

RULES:
1. If a query mentions a sensor but NO ship, use your tools to find which ships have that sensor
2. If sensor exists on multiple ships, return a disambiguation request asking user to specify ship
3. If sensor exists on only one ship, return the clarified query with ship included
4. If sensor doesn't exist anywhere, return an error with available options
5. If query already has ship information, return it unchanged

RESPONSE FORMATS:
- For disambiguation needed: {"action": "disambiguate", "sensor": "s1", "ships": ["gt1", "gt2"], "message": "Sensor s1 found on multiple ships..."}
- For single match: {"action": "clarify", "original_query": "...", "clarified_query": "What is the value of s1 sensor on gt1?"}  
- For no ship needed: {"action": "pass_through", "query": "original query"}
- For errors: {"action": "error", "message": "Sensor not found", "available": [...]}

Always return valid JSON.""",
    tools=[get_available_ships, find_sensor_on_ships],
)

# =============================================================================
# SENSOR AGENT (Your Original Agent - Separate Entity)  
# =============================================================================

def get_sensors() -> Dict[str, Any]:
    """Simulated function to retrieve sensors from the database."""
    # Your original simulated sensor data
    sensors = [
        {"id": 1, "type": "temperature", "value": 22.5, "unit": "C"},
        {"id": 2, "type": "humidity", "value": 45.0, "unit": "%"},
        {"id": 3, "type": "pressure", "value": 101.3, "unit": "kPa"},
    ]
    return {"sensors": sensors}

def get_sensor_by_ship_and_id(ship_code: str, sensor_id: str) -> Dict[str, Any]:
    """Get specific sensor data for a ship."""
    if ship_code.lower() in SHIPS_DATABASE:
        ship_data = SHIPS_DATABASE[ship_code.lower()]
        if sensor_id.lower() in [s.lower() for s in ship_data["sensors"]]:
            return {
                "sensor_id": sensor_id,
                "ship": ship_code,
                "ship_name": ship_data["name"],
                "value": 23.7,  # Simulated
                "unit": "C",
                "status": "active",
                "timestamp": "2024-01-15T10:30:00Z"
            }
    return {"error": f"Sensor {sensor_id} not found on ship {ship_code}"}

# Your original sensor agent (unchanged)
stats_agent = Agent(
    model=OpenAIChatModel(
        model_name="mistral",
        provider=OpenAIProvider(
            base_url="http://localhost:11434/v1",
            api_key="ollama"
        ),
    ),
    system_prompt="""You are a data analyst. Analyze questions
    Always use the provided tools to fetch data. Do not make up data.
    If you cannot answer, return an empty JSON object {}.""",
    tools=[get_sensors, get_sensor_by_ship_and_id],
)

# =============================================================================
# QUERY PROCESSING PIPELINE
# =============================================================================

class QueryProcessor:
    """Orchestrates the two-layer disambiguation system."""
    
    def __init__(self):
        self.ship_patterns = {
            'gt1': ['gt1', 'gt 1', 'gt-1'],
            'gt2': ['gt2', 'gt 2', 'gt-2'],
            'mv_atlantic': ['mv atlantic', 'mv_atlantic', 'atlantic'],
            'ss_pacific': ['ss pacific', 'ss_pacific', 'pacific'],
        }
        
        self.sensor_patterns = [
            r'\bs\d+\b', r'\btemp\d*\b', r'\bhumidity\d*\b', 
            r'\bpressure\d*\b', r'\bengine\d*\b', r'\bfuel\d*\b'
        ]
    
    def extract_sensor_from_query(self, query: str) -> Optional[str]:
        """Extract sensor ID from query."""
        query_lower = query.lower()
        for pattern in self.sensor_patterns:
            match = re.search(pattern, query_lower)
            if match:
                return match.group()
        return None
    
    def has_ship_reference(self, query: str) -> bool:
        """Check if query mentions a ship."""
        query_lower = query.lower()
        for ship_code, patterns in self.ship_patterns.items():
            for pattern in patterns:
                if pattern in query_lower:
                    return True
        return False
    
    def needs_disambiguation(self, query: str) -> bool:
        """Check if query needs ship disambiguation."""
        has_sensor = self.extract_sensor_from_query(query) is not None
        has_ship = self.has_ship_reference(query)
        return has_sensor and not has_ship
    
    async def process_query(self, user_query: str) -> str:
        """Main processing pipeline with two separate agents."""
        print(f"\n🔄 Processing: '{user_query}'")
        
        # Layer 1: Disambiguation (if needed)
        if self.needs_disambiguation(user_query):
            print("🔍 Layer 1: Ship disambiguation needed")
            
            disambiguation_prompt = f"""
            Analyze this query for missing ship information: "{user_query}"
            
            The user mentioned a sensor but didn't specify which ship. 
            Use your tools to determine which ships have this sensor and respond accordingly.
            """
            
            try:
                disambig_result = await disambiguation_agent.run(disambiguation_prompt)
                
                # Extract disambiguation response
                disambig_response = None
                if hasattr(disambig_result, 'data'):
                    disambig_response = disambig_result.data
                elif hasattr(disambig_result, 'content'):
                    disambig_response = disambig_result.content
                else:
                    disambig_response = str(disambig_result)
                
                print(f"🤖 Disambiguation Agent Response: {disambig_response}")
                
                # Try to parse as JSON
                try:
                    disambig_json = json.loads(disambig_response)
                    
                    if disambig_json.get("action") == "disambiguate":
                        # Need user to specify ship
                        return f"❓ Disambiguation needed: {disambig_json.get('message', 'Please specify ship')}"
                    
                    elif disambig_json.get("action") == "clarify":
                        # Single ship found, use clarified query
                        clarified_query = disambig_json.get("clarified_query", user_query)
                        print(f"✅ Clarified query: {clarified_query}")
                        user_query = clarified_query
                    
                    elif disambig_json.get("action") == "error":
                        return f"❌ Error: {disambig_json.get('message', 'Unknown error')}"
                        
                except json.JSONDecodeError:
                    # If not JSON, treat as text response
                    if "multiple ships" in disambig_response.lower():
                        return f"❓ {disambig_response}"
            
            except Exception as e:
                print(f"❌ Disambiguation error: {e}")
                return f"Error in disambiguation: {e}"
        
        else:
            print("✅ Layer 1: No disambiguation needed")
        
        # Layer 2: Sensor Data Retrieval (Your original agent)
        print("🔍 Layer 2: Sensor data retrieval")
        
        try:
            sensor_result = await stats_agent.run(user_query)
            
            # Extract sensor response (your original logic)
            response_text = None
            if hasattr(sensor_result, 'data'):
                response_text = sensor_result.data
            elif hasattr(sensor_result, 'content'):
                response_text = sensor_result.content
            elif hasattr(sensor_result, 'message'):
                response_text = str(sensor_result.message)
            else:
                response_text = str(sensor_result)
            
            print(f"🤖 Sensor Agent Response: {response_text}")
            return response_text
            
        except Exception as e:
            print(f"❌ Sensor agent error: {e}")
            return f"Error retrieving sensor data: {e}"

# =============================================================================
# MAIN EXECUTION
# =============================================================================

async def main():
    processor = QueryProcessor()
    
    print("=== Two-Layer Maritime Query System ===")
    print("Layer 1: Disambiguation Agent")  
    print("Layer 2: Sensor Data Agent")
    print("="*50)
    
    # Test cases
    test_queries = [
        "What is the value of s1 sensor on gt1?",   # No disambiguation needed
        "What is the value of s1 sensor?",          # Needs ship disambiguation 
        "Show me temp1 sensor data",                # Needs ship disambiguation
        "Get all sensors",                          # No disambiguation needed
        "What is pressure1 sensor reading?",       # Needs ship disambiguation
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{'='*60}")
        print(f"🧪 Test {i}: {query}")
        print('='*60)
        
        response = await processor.process_query(query)
        print(f"\n📤 Final Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())