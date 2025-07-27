import json
import os
import httpx
from typing import List, Dict, Any, Optional
import re
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
        
        try:
            # Simple regex check for reliability keyword
            if self._should_use_reliability_tool(message):
                print("Reliability keyword detected - using tools")
                return await self._handle_reliability_query(message, conversation_history, filters)
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
        """Handle reliability queries using tools"""
        print("Handling reliability query with tools")
        
        # Build messages for generation model
        messages = self._build_messages(message, conversation_history, filters)
        
        # Get calculation tools
        tools = self.tool_executor.get_tool_definitions()
        
        # Create tool selection prompt for reliability calculations
        tool_prompt = self._create_reliability_prompt(message, tools, filters)
        
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
            
            # Generate response with calculation results
            final_messages = messages.copy()
            serializable_result = self._make_json_serializable(tool_result)
            
            if tool_result.get("success"):
                final_messages.append({
                    "role": "system",
                    "content": f"Reliability tool '{function_name}' returned: {json.dumps(serializable_result)}\n\nProvide a comprehensive analysis including the calculated values, their meaning, recommendations, and any actionable insights."
                })
            else:
                final_messages.append({
                    "role": "system",
                    "content": f"Reliability tool '{function_name}' encountered an error: {tool_result.get('error', 'Unknown error')}\n\nExplain what went wrong and suggest alternatives."
                })
            
            final_response = await self._call_ollama_with_model(final_messages, self.generation_model)
            
            return {
                "response": final_response,
                "tool_calls": [{
                    "name": function_name,
                    "arguments": function_args,
                    "result": tool_result
                }],
                "intent": "RELIABILITY"
            }
        else:
            return {
                "response": "I couldn't determine how to perform the requested reliability calculation. Please specify the component name more clearly.",
                "tool_calls": None,
                "intent": "RELIABILITY"
            }
    
    async def _handle_general_query(self, message: str, conversation_history: List[any], user_identity: dict = None) -> Dict[str, Any]:
        """Handle general queries using AIAgent (no tools)"""
        print("Handling general query with AIAgent (no tools)")
        
        ai_agent = AIAgent()
        ai_response = ai_agent.chat(message, user_identity)
        
        print(f"AI Agent response: {ai_response}")
        
        return {
            "response": ai_response,  # Return the raw AI response directly
            "tool_calls": "schema_aware_sql_generator",  # Indicate the intent for schema-aware SQL generation
            "intent": "GENERAL"
        }
    
    def _create_reliability_prompt(self, message: str, tools: List[Dict[str, Any]], filters: Optional[any] = None) -> str:
        """Create prompt for reliability tool selection"""
        
        # Extract component name from message
        component_name = self._extract_component_name(message)
        duration_hours = self._extract_duration(message)
        
        # Build filter config
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
            "component_name": component_name,
            "duration_hours": duration_hours,
            "calculation_type": calc_type
        }
        
        if filter_config:
            arguments["filter_config"] = filter_config
        
        # Use reliability tool as default calculation tool
        tool_name = "get_component_reliability"
        
        return f"""USER QUERY: "{message}"

EXTRACTED DATA:
- Component: {component_name}
- Calculation Type: {calc_type}
- Duration: {duration_hours} hours
- Filters: {filter_config if filter_config else "None"}

YOU MUST respond with this EXACT JSON format:
{{"tool_name": "{tool_name}", "arguments": {json.dumps(arguments)}}}

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
        
        return 24  # Default to 24 hours
    
    def _extract_component_name(self, message: str) -> str:
        """Extract component name from user message"""
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
        
        if isinstance(obj, dict):
            return {key: self._make_json_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._make_json_serializable(item) for item in obj]
        elif isinstance(obj, uuid.UUID):
            return str(obj)
        else:
            return obj
    
    def _build_messages(self, message: str, history: List[Any], filters: Optional[any] = None) -> List[Dict[str, str]]:
        """Build message array for Ollama API with filter context"""
        messages = []
        
        # Enhanced system message with filter awareness
        filter_context = ""
        if filters:
            filter_parts = []
            if hasattr(filters, 'ships') and filters.ships:
                filter_parts.append(f"only for ships: {', '.join(filters.ships)}")
            if hasattr(filters, 'explain') and filters.explain:
                filter_parts.append("with detailed technical explanations")
            if filter_parts:
                filter_context = f"\n\nIMPORTANT: The user has applied filters - show results {' and '.join(filter_parts)}. Always mention which filters were applied and how they affected the results."
        
        system_message = f"""You are a reliability engineering assistant. You help users analyze component reliability and provide actionable insights.

When users ask about:
- Component reliability scores by name/nomenclature
- How dependable a component is  
- Whether a component is safe to use
- Maintenance recommendations
- Component status by name or ID

You have access to tools that can provide accurate data.

Always provide:
1. The reliability score (if available)
2. Human-readable interpretation 
3. Actionable recommendations
4. Context about what the score means
5. Information about any filters that were applied

For reliability scores:
- Scores close to 1.0 (>0.9) indicate very reliable components
- Scores between 0.7-0.9 indicate moderately reliable components  
- Scores below 0.7 may indicate components needing attention
- Consider the time duration when interpreting scores

Be direct and precise while being technically accurate.{filter_context}"""
        
        messages.append({
            "role": "system",
            "content": system_message
        })
        
        # Add conversation history
        for msg in history[-10:]:  # Last 10 messages for context
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current message
        messages.append({
            "role": "user", 
            "content": message
        })
        
        return messages