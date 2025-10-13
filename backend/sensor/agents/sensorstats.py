from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
import asyncio
import json
from typing import Dict, Any

def get_sensors() -> Dict[str, Any]:
    """Simulated function to retrieve sensors from the database."""
    # Simulated sensor data
    sensors = [
        {"id": 1, "type": "temperature", "value": 22.5, "unit": "C"},
        {"id": 2, "type": "humidity", "value": 45.0, "unit": "%"},
        {"id": 3, "type": "pressure", "value": 101.3, "unit": "kPa"},
    ]
    return {"sensors": sensors}

# Create a simple agent that returns JSON
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
    tools=[get_sensors],  # Note: should be the function reference, not function call
)

async def get_all_sensors():
    """Query the agent to get all sensors using the provided tool."""
    try:
        # Ask the agent to get all sensors
        result = await stats_agent.run(
            "Please use the available tool to get all sensors in the system. "
            "Provide an analysis of the sensor data including count, types, and any insights."
        )
        
        # Access the response content correctly
        # In PydanticAI, the result has different attributes depending on version
        response_text = None
        if hasattr(result, 'data'):
            response_text = result.data
        elif hasattr(result, 'content'):
            response_text = result.content
        elif hasattr(result, 'message'):
            response_text = str(result.message)
        else:
            # Fallback - convert result to string
            response_text = str(result)
        
        print(f"Raw response: {response_text}")
        
        # Try to parse as JSON if it looks like JSON
        if response_text and (response_text.strip().startswith('{') or response_text.strip().startswith('[')):
            try:
                response_data = json.loads(response_text)
                print("Agent Response (Parsed JSON):")
                print(json.dumps(response_data, indent=2))
                return response_data
            except json.JSONDecodeError:
                print("Response is not valid JSON, returning as text")
                return {"response": response_text}
        else:
            print("Agent Response (Text):")
            print(response_text)
            return {"response": response_text}
        
    except Exception as e:
        print(f"Error running agent: {e}")
        print(f"Result object attributes: {dir(result) if 'result' in locals() else 'N/A'}")
        return None

async def get_sensors_direct_query():
    """Alternative approach - more direct query for sensor retrieval."""
    try:
        result = await stats_agent.run(
            "Get all sensors from the database using the get_sensors tool. "
            "Return the sensor list along with your analysis."
        )
        
        # Access the response content correctly
        response_text = None
        if hasattr(result, 'data'):
            response_text = result.data
        elif hasattr(result, 'content'):
            response_text = result.content
        elif hasattr(result, 'message'):
            response_text = str(result.message)
        else:
            response_text = str(result)
        
        print(f"Direct Query Raw response: {response_text}")
        
        # Try to parse as JSON
        if response_text and (response_text.strip().startswith('{') or response_text.strip().startswith('[')):
            try:
                response_data = json.loads(response_text)
                print("Direct Query Response (Parsed JSON):")
                print(json.dumps(response_data, indent=2))
                return response_data
            except json.JSONDecodeError:
                return {"response": response_text}
        else:
            print("Direct Query Response (Text):")
            print(response_text)
            return {"response": response_text}
        
    except Exception as e:
        print(f"Error in direct query: {e}")
        return None

async def debug_result_structure():
    """Debug function to understand the result object structure."""
    try:
        result = await stats_agent.run("Hello, can you call the get_sensors tool?")
        print("=== DEBUG: Result Object Structure ===")
        print(f"Result type: {type(result)}")
        print(f"Result attributes: {dir(result)}")
        
        # Try different ways to access the content
        for attr in ['data', 'content', 'message', 'response', 'text']:
            if hasattr(result, attr):
                value = getattr(result, attr)
                print(f"result.{attr}: {value} (type: {type(value)})")
        
        # If it's a complex object, try to serialize it
        try:
            print(f"Result as dict: {result.__dict__ if hasattr(result, '__dict__') else 'No __dict__'}")
        except:
            pass
            
        return result
        
    except Exception as e:
        print(f"Debug error: {e}")
        return None

# Main execution
async def main():
    print("=== Getting All Sensors via Pydantic AI Agent ===\n")
    
    # Debug first to understand the structure
    print("Debug: Understanding result structure")
    debug_result = await debug_result_structure()
    
    print("\n" + "="*50 + "\n")
    
    # Method 1: Detailed analysis request
    print("Method 1: Detailed Analysis Request")
    sensors_analysis = await get_all_sensors()
    
    print("\n" + "="*50 + "\n")
    
    # Method 2: Direct query
    print("Method 2: Direct Query")
    sensors_direct = await get_sensors_direct_query()
    
    return sensors_analysis, sensors_direct

if __name__ == "__main__":
    # Run the async function
    results = asyncio.run(main())