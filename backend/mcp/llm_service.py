import json
import os
from fastapi import HTTPException
import httpx
from typing import List, Dict, Any, Optional
import re

from drishti import drishti
from utils.nltk.component import extract_components
from utils.nltk.ship import create_ship_filter
from .tool_executor import ToolExecutor
from backend.drishti.ai_agent import AIAgent

class LLMService:
    """Service for LLM integration with simple regex-based tool detection"""
    
    def __init__(self, 
                 base_url: str = "http://localhost:11434", 
                 generation_model: str = "codellama:7b-instruct",
                 intent_model: str = "mistral:latest"):
        self.base_url = base_url
        self.generation_model = generation_model
        self.intent_model = intent_model
        self.tool_executor = ToolExecutor()
    
    async def chat_with_tools(
        self, 
        message: str, 
        conversation_history: List[any],
        filters: Optional[any] = None,
        user_identity: dict = None
    ) -> Dict[str, Any]:
        """Process chat message with simple regex-based tool detection"""
        
        print(f"Sending message to LLM: {message}")
        print(f"Applied filters: {filters}")
        
        filtered_ships=await create_ship_filter(message)
        print(filtered_ships,"HELLLLLLLLLLL")
        try:
            # Simple regex check for reliability keyword
            if self._should_use_reliability_tool(message):
                print("Reliability keyword detected - using tools")
                return await self._handle_reliability_query(message, conversation_history, filtered_ships)
            else:
                print("No reliability keyword - using AIAgent without tools")
                return await self._handle_general_query(message, conversation_history, user_identity)
                
        except Exception as e:
            print(f"Error in chat_with_tools: {str(e)}")
            return {
                "response": f"I encountered an error while processing your request: {str(e)}",
                "tool_calls": None,
                "intent": "ERROR"
            }
    
    async def drishti(self, message: str):
        """Main entry point for Drishti API"""
        d= drishti.Drishti()
        result=await d.ship_system_kg(message)
        print("Dres",result)
        if not result:
            raise HTTPException(status_code=404, detail="No ships found in the message")
        print(f"Drishti result: {result}")
        return result
    
    def _should_use_reliability_tool(self, message: str) -> bool:
        """Simple regex check for reliability-related keywords"""
        reliability_keywords = [
            r'\breliability\b',
            r'\breliable\b', 
            r'\bdependable\b',
            r'\bremaining life\b',
            r'\brl\b',
            r'\bmaintenance\b',
            r'\bfailure rate\b',
            r'\bmtbf\b',
            r'\buptime\b',
            r'\bavailability\b',
            r'\bsafe to use\b'
        ]
        
        message_lower = message.lower()
        for pattern in reliability_keywords:
            if re.search(pattern, message_lower):
                return True
        return False
    
    async def _handle_reliability_query(self, message: str, conversation_history: List[any], filters: Optional[any] = None) -> Dict[str, Any]:
        """Handle reliability queries using tools - return only tool response"""
        print("Handling reliability query with tools")
        
        try:
            # Get calculation tools
            tools = self.tool_executor.get_tool_definitions()
            
            # Create tool selection prompt for reliability calculations
            tool_prompt = await self._create_reliability_prompt(message, tools, filters)
            
            # Get tool decision
            tool_messages = [
                {
                    "role": "system",
                    "content": "You are a JSON generator for reliability tools. You ONLY output valid JSON. No explanations, no markdown, no extra text."
                },
                {
                    "role": "user",
                    "content": tool_prompt
                }
            ]
            
            tool_decision = await self._call_ollama_with_model(tool_messages, self.generation_model, temperature=0.1)
            tool_call = self._parse_tool_decision(tool_decision, tools)
            
            if tool_call:
                # Execute the reliability tool
                function_name = tool_call["name"]
                function_args = tool_call["arguments"]
                
                print(f"Executing reliability tool: {function_name} with args: {function_args}")
                tool_result = await self.tool_executor.execute_tool(function_name, function_args)
                
                # Make everything JSON serializable FIRST
                if tool_result:
                    serializable_result = self._make_json_serializable(tool_result)
                else:
                    serializable_result = {"error": "No result returned from tool"}
                
                # Return only the tool result without AI-generated response
                if serializable_result and serializable_result.get("success"):
                    # Extract the actual data/response from tool result
                    tool_response = (serializable_result.get("data") or 
                                   serializable_result.get("result") or 
                                   serializable_result.get("response"))
                    
                    # Ensure tool_response is a string
                    if isinstance(tool_response, (dict, list)):
                        try:
                            tool_response = json.dumps(tool_response)
                        except Exception as e:
                            print(f"Error serializing tool response: {e}")
                            tool_response = str(tool_response)
                    elif tool_response is None:
                        try:
                            tool_response = json.dumps(serializable_result)
                        except Exception as e:
                            print(f"Error serializing result: {e}")
                            tool_response = str(serializable_result)
                    
                    return {
                        "response": "",  # Ensure string response
                        "tool_calls": [{
                            "name": function_name,
                            "arguments": self._make_json_serializable(function_args),
                            "result": serializable_result
                        }],
                        "intent": "RELIABILITY"
                    }
                else:
                    error_msg = serializable_result.get('error', 'Tool execution failed') if serializable_result else 'No result from tool'
                    return {
                        "response": str(error_msg),
                        "tool_calls": [{
                            "name": function_name,
                            "arguments": self._make_json_serializable(function_args),
                            "result": serializable_result
                        }],
                        "intent": "RELIABILITY"
                    }
            else:
                return {
                    "response": "Unable to determine reliability calculation parameters.",
                    "tool_calls": None,
                    "intent": "RELIABILITY"
                }
        except Exception as e:
            print(f"Error in _handle_reliability_query: {str(e)}")
            return {
                "response": f"Error processing reliability query: {str(e)}",
                "tool_calls": None,
                "intent": "RELIABILITY"
            }
    
    async def _handle_general_query(self, message: str, conversation_history: List[any], user_identity: dict = None) -> Dict[str, Any]:
        """Handle general queries using AIAgent - return structured response"""
        print("Handling general query with AIAgent")
        
        try:
            ai_agent = AIAgent()
            # Get the response from AIAgent
            ai_response = ai_agent.chat(message, user_identity)
            
            print(f"Raw AI Agent response type: {type(ai_response)}")
            print(f"Raw AI Agent response: {ai_response}")
            
            # Store the raw response for the FastAPI route to access
            self._last_ai_response = ai_response
            
            # Check if it's an error response
            if isinstance(ai_response, dict) and "error" in ai_response:
                return {
                    "response": f"Error: {ai_response.get('message', 'Query processing failed')}",
                    "tool_calls": None,
                    "intent": "GENERAL"
                }
            
            # Generate appropriate response text based on the AI response
            response_text = "Query processed successfully."
            
            if isinstance(ai_response, dict):
                records_count = ai_response.get("records_retrieved", 0)
                if records_count is not None:
                    if records_count == 0:
                        response_text = "Query executed successfully but returned no results."
                    else:
                        response_text = f"Found {records_count} records matching your query."
                
                # If there's an execution status, include it
                exec_status = ai_response.get("execution_status")
                if exec_status == "success":
                    # Good, keep the response as is
                    pass
                elif exec_status:
                    response_text += f" Status: {exec_status}"
            
            return {
                "response": response_text,
                "tool_calls": "schema_aware_sql_generator",  # Signal to FastAPI route
                "intent": "GENERAL"
            }
            
        except Exception as e:
            print(f"Error in _handle_general_query: {str(e)}")
            return {
                "response": f"Error processing general query: {str(e)}",
                "tool_calls": None,
                "intent": "GENERAL"
            }
        
    async def _create_reliability_prompt(self, message: str, tools: List[Dict[str, Any]], filters: Optional[any] = None) -> str:
        """Create prompt for reliability tool selection"""
        
        try:
            # Extract component name from message - handle potential errors
            component_names = []
            if filters and hasattr(filters, 'ships'):
                component_names = await extract_components(message, filters.ships)
            else:
                component_names = await extract_components(message, [])
            
            # Ensure component_names is a list
            if isinstance(component_names, str):
                component_names = [component_names]
            elif not isinstance(component_names, list):
                component_names = []
                
            print(f"Extracted components: {component_names}")
            
            duration_hours = self._extract_duration(message)
            
            # Build filter config safely
            filter_config = {}
            if filters:
                if hasattr(filters, 'ships') and filters.ships:
                    filter_config["ships"] = filters.ships
                if hasattr(filters, 'explain') and filters.explain:
                    filter_config["explain"] = filters.explain
            
            # Determine calculation type
            calc_type = "reliability"  # default
            if "remaining life" in message.lower() or "rl" in message.lower():
                calc_type = "remaining_life"
            
            arguments = {
                "component_name": component_names,
                "duration_hours": duration_hours,
                "calculation_type": calc_type
            }
            
            if filter_config:
                arguments["filter_config"] = filter_config
            
            # Use reliability tool as default calculation tool
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

        except Exception as e:
            print(f"Error in _create_reliability_prompt: {str(e)}")
            # Return a fallback prompt
            return f"""USER QUERY: "{message}"

YOU MUST respond with this EXACT JSON format:
{{"tool_name": "get_component_reliability", "arguments": {{"component_name": ["unknown"], "duration_hours": unknown, "calculation_type": "reliability"}}}}

DO NOT add explanations, markdown, or extra text. ONLY return the JSON."""
    
    def _extract_duration(self, message: str) -> int:
        """Extract duration in hours from message"""

        duration_patterns = [
                    r'(\d+)\s*hour',
                    r'(\d+)\s*hr',
                    r'(\d+)\s*h\b',
                    r'last\s+(\d+)',
                    r'past\s+(\d+)',
                    r'over\s+(\d+)',
                    r'for\s+(\d+)'
                ]
                    
        for pattern in duration_patterns:
            match = re.search(pattern, message.lower())
            if match:
                return int(match.group(1))

        raise ValueError("Error: You didn't specify a duration. Please include a valid duration.")
    
    def _extract_component_name(self, message: str,ship: List[str]) -> str:
        """Extract component name from user message"""
        print("ships",ship)
        # Pattern 1: "reliability of X" - capture until stop words
        match = re.search(r'reliability\s+of\s+([A-Z][a-zA-Z\s\d]+?)(?:\s+over|\s+for|\s+during|\s+in|\s*\?|$)', message, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        # Pattern 2: "X reliability" or "X's reliability"
        match = re.search(r'([A-Z][a-zA-Z\s\d]+?)(?:\'s)?\s+reliability', message, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        # Pattern 3: Component codes like ABC123, GT 1, DEF-456
        match = re.search(r'\b([A-Z]{2,}\s*\d+)\b', message)
        if match:
            return match.group(1)
        
        match = re.search(r'\b([A-Z]{2,}\d+)\b', message)
        if match:
            return match.group(1)
            
        match = re.search(r'\b([A-Z]+[-_][A-Z0-9]+)\b', message)
        if match:
            return match.group(1)
        
        # Pattern 4: Any capitalized multi-word before time indicators
        match = re.search(r'([A-Z][a-zA-Z\d]+(?:\s+[A-Z\d][a-zA-Z\d]*)+)(?:\s+over|\s+for|\s+during)', message)
        if match:
            return match.group(1).strip()
        
        # Pattern 5: Simple capitalized words with numbers (fallback)
        words = message.split()
        skip_words = {'What', 'Is', 'The', 'How', 'Over', 'For', 'Hours', 'Minutes', 'Days'}
        for i, word in enumerate(words):
            if word[0].isupper() and word not in skip_words and len(word) > 1:
                # Check if next word is a number or another capitalized word
                if i + 1 < len(words):
                    next_word = words[i + 1]
                    if next_word.isdigit() or (next_word[0].isupper() and next_word not in skip_words):
                        return f"{word} {next_word}"
                return word
        
        return "unknown_component"
    
    async def _call_ollama_with_model(self, messages: List[Dict[str, str]], model: str, temperature: float = 0.7, stream: bool = False) -> str:
        """Make API call to Ollama with specified model"""
        async with httpx.AsyncClient() as client:
            payload = {
                "model": model,
                "messages": messages,
                "stream": stream,
                "options": {
                    "temperature": temperature
                }
            }
            
            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=60.0
            )
            response.raise_for_status()
            
            result = response.json()
            return result["message"]["content"]
    
    def _parse_tool_decision(self, decision: str, tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse the LLM's decision - expect clean JSON"""
        try:
            print(f"Raw tool decision: '{decision}'")
            
            # Clean the response
            decision = decision.strip()
            
            # Remove any markdown code blocks if present
            if decision.startswith('```'):
                decision = re.sub(r'```[a-zA-Z]*\n?', '', decision)
                decision = decision.replace('```', '')
            
            # Try direct JSON parse first
            try:
                parsed = json.loads(decision)
            except json.JSONDecodeError:
                # If that fails, extract JSON from text
                json_match = re.search(r'\{.*\}', decision, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                else:
                    print("No valid JSON found in response")
                    return None
            
            print(f"Parsed tool decision: {parsed}")
            
            tool_name = parsed.get("tool_name")
            if tool_name and tool_name != "null":
                # Validate that the tool exists
                available_tool_names = [tool.get("name") for tool in tools]
                if tool_name in available_tool_names:
                    return {
                        "name": tool_name,
                        "arguments": parsed.get("arguments", {})
                    }
                else:
                    print(f"Tool '{tool_name}' not found in available tools: {available_tool_names}")
            
            return None
            
        except Exception as e:
            print(f"Error parsing tool decision: {e}")
            return None
        
    def _make_json_serializable(self, obj):
        """Convert UUID objects and other non-serializable types to strings"""
        import uuid
        from datetime import datetime, date
        from decimal import Decimal
        
        if obj is None:
            return None
        elif isinstance(obj, dict):
            return {key: self._make_json_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._make_json_serializable(item) for item in obj]
        elif isinstance(obj, tuple):
            return [self._make_json_serializable(item) for item in obj]
        elif isinstance(obj, set):
            return [self._make_json_serializable(item) for item in obj]
        elif isinstance(obj, uuid.UUID):
            return str(obj)
        elif isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        elif hasattr(obj, '__dict__'):
            # Handle custom objects by converting to dict
            return self._make_json_serializable(obj.__dict__)
        elif hasattr(obj, '__str__') and not isinstance(obj, (str, int, float, bool)):
            # Convert any other object to string as fallback
            return str(obj)
        else:
            return obj