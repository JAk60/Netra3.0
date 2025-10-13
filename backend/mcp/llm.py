import json
from drishti import drishti
from fastapi import HTTPException
import httpx
from typing import List, Dict, Any, Optional
import re
import asyncio
from dataclasses import dataclass
from enum import Enum
import uuid
from datetime import datetime, date
from decimal import Decimal

# Import your existing modules
from mcp.llm_service import LLMService
from mcp.prompts import Prompts
from sensor.sensors import Sensor
from utils.nltk.component import extract_components
from utils.nltk.ship import create_ship_filter, extract_ships_from_message
from .tool_executor import ToolExecutor
from backend.drishti.ai_agent import AIAgent


class IntentType(Enum):
    RELIABILITY = "RELIABILITY"
    SENSOR = "SENSOR"
    GENERAL = "GENERAL"


@dataclass
class IntentResult:
    intent: IntentType
    confidence: float
    method: str  # 'semantic' or 'llm' or 'combined'
    entities: Dict[str, Any] = None


@dataclass
class ChatResponse:
    response: str
    tool_calls: Any = None
    intent: str = None
    execution_data: Any = None


class ToolOrchestrator:
    """Handles tool selection and execution for reliability and sensor intents"""
    
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
        self.tool_executor = ToolExecutor()
    
    async def execute_tools(self, intent: IntentType, message: str) -> Dict[str, Any]:
        """Execute tools based on intent type"""
        if intent == "RELIABILITY":
            return await self._execute_reliability_tools(message)
        elif intent == "SENSOR":
            return await self._execute_sensor_tools(message)
        elif intent == "RUL":
            return await self._execute_rul_tools(message)
        else:
            raise ValueError(f"ToolOrchestrator cannot handle intent: {intent}")
        
    async def _execute_reliability_tools(self, message: str) -> Dict[str, Any]:
        """Execute reliability-specific tools"""
        try:
            filtered_ships = await create_ship_filter(message)
            tools = self.tool_executor.get_tool_definitions()
            
            # This will raise ValueError with specific message if no duration found
            tool_prompt = await Prompts._create_reliability_prompt(message, tools, filtered_ships)
            
            # Get tool decision from LLM
            messages = [
                {
                    "role": "system",
                    "content": "You are a JSON generator for reliability tools. Output ONLY valid JSON."
                },
                {"role": "user", "content": tool_prompt}
            ]
            
            tool_decision = await self.llm_service.call_llm(messages, temperature=0.1)
            tool_call = Prompts._parse_tool_decision(tool_decision, tools)
            
            if tool_call:
                function_name = tool_call["name"]
                function_args = tool_call["arguments"]
                
                print(f"Executing reliability tool: {function_name} with args: {function_args}")
                tool_result = await self.tool_executor.execute_tool(function_name, function_args)
                
                return {
                    "success": True,
                    "tool_name": function_name,
                    "arguments": Prompts._make_json_serializable(function_args),
                    "result": Prompts._make_json_serializable(tool_result)
                }
            else:
                return {
                    "success": False,
                    "error": "Unable to determine reliability calculation parameters"
                }
                
        except ValueError as ve:
            # This will catch the specific duration error message
            print(f"Duration extraction error: {ve}")
            return {"success": False, "error": str(ve)}
        except Exception as e:
            print(f"Error in reliability tools: {e}")
            return {"success": False, "error": str(e)}
        
    async def _execute_sensor_tools(self, message: str) -> Dict[str, Any]:
        """Execute sensor-specific tools"""
        try:
            # Extract time query and optional filters from message
            ship_filter_model = await create_ship_filter(message)
            
            # Extract ships list from ReliabilityFilters model
            filtered_ships = ship_filter_model.ships if ship_filter_model.ships else []
            explain = ship_filter_model.explain if hasattr(ship_filter_model, 'explain') else False
            
            tools = self.tool_executor.get_tool_definitions()
            
            # This will raise ValueError with specific message if no time query found
            tool_prompt = await Prompts._create_sensor_prompt(message, tools, filtered_ships, explain)
            
            # Get tool decision from LLM
            messages = [
                {
                    "role": "system",
                    "content": "You are a JSON generator for sensor reading tools. Output ONLY valid JSON."
                },
                {"role": "user", "content": tool_prompt}
            ]
            
            tool_decision = await self.llm_service.call_llm(messages, temperature=0.1)
            tool_call = Prompts._parse_tool_decision(tool_decision, tools)
            print("tool_call", tool_call)
            
            if tool_call:
                function_name = tool_call["name"]
                function_args = tool_call["arguments"]
                
                print(f"Executing sensor tool: {function_name} with args: {function_args}")
                tool_result = await self.tool_executor.execute_tool(function_name, function_args)
                
                return {
                    "success": True,
                    "tool_name": function_name,
                    "arguments": Prompts._make_json_serializable(function_args),
                    "result": Prompts._make_json_serializable(tool_result)
                }
            else:
                return {
                    "success": False,
                    "error": "Unable to determine sensor reading parameters"
                }
                
        except ValueError as ve:
            # This will catch the specific time query extraction error
            print(f"Time query extraction error: {ve}")
            return {"success": False, "error": str(ve)}
        except Exception as e:
            print(f"Error in sensor tools: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "error": str(e)}
        
    async def _execute_rul_tools(self, message: str) -> Dict[str, Any]:
        """Execute sensor-specific tools"""
        try:
            # Extract time query and optional filters from message
            ship_filter_model = await create_ship_filter(message)
            
            # Extract ships list from ReliabilityFilters model
            filtered_ships = ship_filter_model.ships if ship_filter_model.ships else []
            explain = ship_filter_model.explain if hasattr(ship_filter_model, 'explain') else False
            
            tools = self.tool_executor.get_tool_definitions()
            
            # This will raise ValueError with specific message if no time query found
            tool_prompt = await Prompts._create_rul_prompt(message, tools, filtered_ships, explain)
            
            # Get tool decision from LLM
            messages = [
                {
                    "role": "system",
                    "content": "You are a JSON generator for rul tools. Output ONLY valid JSON."
                },
                {"role": "user", "content": tool_prompt}
            ]
            
            tool_decision = await self.llm_service.call_llm(messages, temperature=0.1)
            tool_call = Prompts._parse_tool_decision(tool_decision, tools)
            print("tool_call", tool_call)
            
            if tool_call:
                function_name = tool_call["name"]
                function_args = tool_call["arguments"]
                
                print(f"Executing sensor tool: {function_name} with args: {function_args}")
                tool_result = await self.tool_executor.execute_tool(function_name, function_args)
                
                return {
                    "success": True,
                    "tool_name": function_name,
                    "arguments": Prompts._make_json_serializable(function_args),
                    "result": Prompts._make_json_serializable(tool_result)
                }
            else:
                return {
                    "success": False,
                    "error": "Unable to determine sensor reading parameters"
                }
                
        except ValueError as ve:
            # This will catch the specific time query extraction error
            print(f"Time query extraction error: {ve}")
            return {"success": False, "error": str(ve)}
        except Exception as e:
            print(f"Error in sensor tools: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "error": str(e)}


class ChatOrchestrator:
    """Main coordinator - the central hub"""
    
    def __init__(self, 
                 base_url: str = "http://localhost:11434",
                 generation_model: str = "codellama:7b-instruct", 
                 intent_model: str = "mistral:latest"):
        
        # Initialize services
        self.llm_service = LLMService(base_url, generation_model, intent_model)
        self.tool_orchestrator = ToolOrchestrator(self.llm_service)
        self.ai_agent = AIAgent()
        
        # Store last AI response for FastAPI route access
        self._last_ai_response = None

    async def drishti(self, message: str):
        """Main entry point for Drishti API"""
        try:
            d = drishti.Drishti()
            result = await d.ship_system_kg(message)
            print("Drishti result:", result)
            if not result:
                raise HTTPException(status_code=404, detail="No ships found in the message")
            return result
        except Exception as e:
            print(f"Error in drishti: {e}")
            raise HTTPException(status_code=500, detail=f"Drishti processing failed: {str(e)}")
        
    async def process_message(self, message: str, intent: str = None, user_identity: dict = None) -> ChatResponse:
        """Main entry point - orchestrates the entire chat flow"""
        try:
            print(f"Processing message: {message} with intent: {intent}")
            # Step 2: Route based on intent~
            if intent in ["RELIABILITY", "SENSOR", "RUL"]:
                return await self._handle_tool_intent(intent, message)
            else:
                return await self._handle_general_intent(message, user_identity)
                
        except Exception as e:
            print(f"Error in ChatOrchestrator: {e}")
            import traceback
            traceback.print_exc()
            return ChatResponse(
                response=f"I encountered an error while processing your request: {str(e)}",
                intent="ERROR"
            )
    
    async def _handle_tool_intent(self, intent: IntentType, message: str) -> ChatResponse:
        """Handle reliability and sensor intents using tools"""
        try:
            tool_result = await self.tool_orchestrator.execute_tools(intent, message)
            
            if tool_result.get("success"):
                return ChatResponse(
                    response="",  # Tool results speak for themselves
                    tool_calls=[tool_result],
                    intent=intent
                )
            else:
                error_msg = tool_result.get("error", "Tool execution failed")
                return ChatResponse(
                    response=str(error_msg),
                    tool_calls=[tool_result],
                    intent=intent
                )
        except Exception as e:
            print(f"Error handling tool intent: {e}")
            return ChatResponse(
                response=f"Error processing {intent} query: {str(e)}",
                intent=intent
            )
    
    async def _handle_general_intent(self, message: str, user_identity: dict = None) -> ChatResponse:
        """Handle general queries using AIAgent"""
        try:
            print("Routing to AIAgent for general query")
            
            # Call AIAgent
            try:
                if hasattr(self.ai_agent.chat, '__await__'):
                    ai_response = await self.ai_agent.chat(message, user_identity)
                else:
                    ai_response = self.ai_agent.chat(message, user_identity)
            except Exception as e:
                print(f"AIAgent error: {e}")
                return ChatResponse(
                    response=f"AI Agent processing failed: {str(e)}",
                    intent="GENERAL"
                )
            
            # Store for FastAPI route access
            self._last_ai_response = ai_response
            
            # Handle error responses
            if isinstance(ai_response, dict) and "error" in ai_response:
                return ChatResponse(
                    response=f"Error: {ai_response.get('message', 'Query processing failed')}",
                    intent="GENERAL"
                )
            
            # Generate response text
            response_text = "Query processed successfully."
            if isinstance(ai_response, dict):
                records_count = ai_response.get("records_retrieved", 0)
                if records_count is not None:
                    if records_count == 0:
                        response_text = "Query executed successfully but returned no results."
                    else:
                        response_text = f"Found {records_count} records matching your query."
            
            return ChatResponse(
                response=response_text,
                tool_calls="schema_aware_sql_generator",  # Signal for FastAPI route
                intent="GENERAL",
                execution_data=ai_response
            )
            
        except Exception as e:
            print(f"Error handling general intent: {e}")
            return ChatResponse(
                response=f"Error processing general query: {str(e)}",
                intent="GENERAL"
            )
    
    def get_last_ai_response(self):
        """Access method for FastAPI route"""
        return self._last_ai_response