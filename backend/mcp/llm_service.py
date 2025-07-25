import json
import os
import httpx
from typing import List, Dict, Any, Optional
import re
from .tool_executor import ToolExecutor

class LLMService:
    """Service for LLM integration with tool support using Ollama"""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "codellama:7b-instruct"):
        self.base_url = base_url
        self.model = model
        self.tool_executor = ToolExecutor()
    
    async def chat_with_tools(
        self, 
        message: str, 
        conversation_history: List[any],
        filters: Optional[any] = None
    ) -> Dict[str, Any]:
        """Process chat message with tool support and filtering"""
        
        # Build messages for Ollama
        messages = self._build_messages(message, conversation_history, filters)
        print(f"Sending message to LLM: {message}")
        print(f"Applied filters: {filters}")
        
        # Get available tools
        tools = self.tool_executor.get_tool_definitions()
        print(f"Available tools: {tools}")
        
        try:
            # Improved tool detection logic
            should_use_tools = await self._should_use_tools(message, tools)
            print(f"Should use tools: {should_use_tools}")
            
            if should_use_tools:
                return await self._handle_with_tools(message, messages, tools, filters)
            else:
                # Direct response without tools
                response = await self._call_ollama(messages)
                return {
                    "response": response,
                    "tool_calls": None
                }
                
        except Exception as e:
            print(f"Error in chat_with_tools: {str(e)}")
            return {
                "response": f"I encountered an error while processing your request: {str(e)}",
                "tool_calls": None
            }
    
    async def _call_ollama(self, messages: List[Dict[str, str]], stream: bool = False) -> str:
        """Make API call to Ollama"""
        async with httpx.AsyncClient() as client:
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": stream,
                "options": {
                    "temperature": 0.7
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
    
    async def _should_use_tools(self, message: str, tools: List[Dict[str, Any]]) -> bool:
        """Determine if the message requires tool usage - Improved detection for component names"""
        message_lower = message.lower()
        
        # Check for UUID pattern (component IDs) - keeping for backward compatibility
        uuid_pattern = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        has_uuid = bool(re.search(uuid_pattern, message_lower))
        
        # Reliability-related keywords
        reliability_keywords = [
            "reliability", "dependable", "safe to use", "component score", 
            "maintenance", "failure rate", "uptime", "mtbf", "availability",
            "component", "reliability of", "how reliable", "status of"
        ]
        
        # Component reference patterns - expanded for component names
        component_patterns = [
            "reliability of", "status of", "component", "ins one", "ins two", 
            "system", "part", "device", "nomenclature", "component name"
        ]
        
        # Check for specific component naming patterns (adjust these based on your naming conventions)
        component_naming_patterns = [
            r'\b[A-Z]{2,}\d+\b',  # Pattern like ABC123, DEF456
            r'\b[A-Z]+[-_][A-Z0-9]+\b',  # Pattern like ABC-123, DEF_456
            r'\bcomponent\s+["\']?([A-Za-z0-9_-]+)["\']?',  # "component XYZ" or component "ABC-123"
        ]
        
        has_component_naming = any(re.search(pattern, message) for pattern in component_naming_patterns)
        
        # Check for reliability keywords OR UUID OR component patterns OR component naming
        has_reliability_keyword = any(keyword in message_lower for keyword in reliability_keywords)
        has_component_reference = any(pattern in message_lower for pattern in component_patterns)
        
        result = has_uuid or has_reliability_keyword or has_component_reference or has_component_naming
        print(f"Tool detection - UUID: {has_uuid}, Reliability keywords: {has_reliability_keyword}, Component ref: {has_component_reference}, Component naming: {has_component_naming}, Result: {result}")
        
        return result
    
    async def _handle_with_tools(
        self, 
        original_message: str,
        messages: List[Dict[str, str]], 
        tools: List[Dict[str, Any]],
        filters: Optional[any] = None
    ) -> Dict[str, Any]:
        """Handle conversation that requires tools with filter support"""
        
        # Create a more specific prompt for tool usage
        tool_prompt = self._create_tool_prompt(original_message, tools, filters)
        
        # Get LLM response about which tool to use
        tool_messages = [
            {
                "role": "system",
                "content": "You are a JSON generator. You ONLY output valid JSON. No explanations, no markdown, no extra text."
            },
            {
                "role": "user",
                "content": tool_prompt
            }
        ]
        
        print(f"Tool selection prompt: {tool_prompt}")
        tool_decision = await self._call_ollama(tool_messages)
        print(f"Tool decision response: {tool_decision}")
        
        # Parse the tool decision
        tool_call = self._parse_tool_decision(tool_decision, tools)
        print(f"Parsed tool call: {tool_call}")
        
        if tool_call:
            # Execute the tool
            function_name = tool_call["name"]
            function_args = tool_call["arguments"]
            
            print(f"Executing tool: {function_name} with args: {function_args}")
            tool_result = await self.tool_executor.execute_tool(function_name, function_args)
            print(f"Tool result: {tool_result}")
            
            # Create final response using tool result
            final_messages = messages.copy()
            
            # Convert UUIDs to strings for JSON serialization
            serializable_result = self._make_json_serializable(tool_result)
            
            # Enhanced system message based on tool result structure and filters
            filter_context = ""
            if filters:
                filter_parts = []
                if hasattr(filters, 'ships') and filters.ships:
                    filter_parts.append(f"filtered for ships: {', '.join(filters.ships)}")
                if hasattr(filters, 'explain') and filters.explain:
                    filter_parts.append("with detailed explanations requested")
                if filter_parts:
                    filter_context = f" (Results were {' and '.join(filter_parts)})"
            
            if tool_result.get("success"):
                data = tool_result.get("data", {})
                if isinstance(data.get("results"), list):
                    # Multiple nomenclatures case
                    final_messages.append({
                        "role": "system",
                        "content": f"Tool '{function_name}' was called with arguments {function_args} and returned multiple results{filter_context}: {json.dumps(serializable_result)}\n\nNow provide a helpful response to the user. Explain that multiple nomenclatures were found for this component and summarize the reliability scores. Include what the scores mean and any recommendations. If filters were applied, mention how they affected the results."
                    })
                else:
                    # Single result case
                    final_messages.append({
                        "role": "system",
                        "content": f"Tool '{function_name}' was called with arguments {function_args} and returned{filter_context}: {json.dumps(serializable_result)}\n\nNow provide a helpful response to the user based on this information. Include the reliability score and explain what it means. Provide recommendations based on the score. If filters were applied, mention their impact."
                    })
            else:
                # Error case
                final_messages.append({
                    "role": "system",
                    "content": f"Tool '{function_name}' was called but encountered an error{filter_context}: {tool_result.get('error', 'Unknown error')}\n\nProvide a helpful response explaining that the component information could not be retrieved and suggest what the user might try instead. If filters were applied, suggest trying without filters or with different filter criteria."
                })
            
            final_response = await self._call_ollama(final_messages)
            
            return {
                "response": final_response,
                "tool_calls": [{
                    "name": function_name,
                    "arguments": function_args,
                    "result": tool_result
                }]
            }
        else:
            # No valid tool call, respond normally
            response = await self._call_ollama(messages)
            return {
                "response": response,
                "tool_calls": None
            }
    
    def _create_tool_prompt(self, message: str, tools: List[Dict[str, Any]], filters: Optional[any] = None) -> str:
        """Create a direct, no-nonsense tool selection prompt for component names with filter support"""
        
        # Extract component name from message
        component_name = self._extract_component_name(message)
        
        # Extract duration in hours (default to 24 if not specified)
        duration_patterns = [
            r'(\d+)\s*hour',
            r'(\d+)\s*hr',
            r'(\d+)\s*h\b',
            r'last\s+(\d+)',
            r'past\s+(\d+)',
            r'over\s+(\d+)',
            r'for\s+(\d+)'
        ]
        duration_hours = 24  # Default
        for pattern in duration_patterns:
            match = re.search(pattern, message.lower())
            if match:
                duration_hours = int(match.group(1))
                break
        
        # Build filter config
        filter_config = {}
        if filters:
            if hasattr(filters, 'ships') and filters.ships:
                filter_config["ships"] = filters.ships
            if hasattr(filters, 'explain') and filters.explain:
                filter_config["explain"] = filters.explain
            if hasattr(filters, 'additional_filters') and filters.additional_filters:
                filter_config.update(filters.additional_filters)
        
        # Create the arguments JSON
        arguments = {
            "component_name": component_name,
            "duration_hours": duration_hours
        }
        
        if filter_config:
            arguments["filter_config"] = filter_config
        
        return f"""USER QUERY: "{message}"

EXTRACTED DATA:
- Component Name: {component_name}
- Duration: {duration_hours} hours
- Filters: {filter_config if filter_config else "None"}

YOU MUST respond with this EXACT JSON format:
{{"tool_name": "get_component_reliability", "arguments": {json.dumps(arguments)}}}

DO NOT add explanations, markdown, or extra text. ONLY return the JSON."""
    
    def _extract_component_name(self, message: str) -> str:
        """Extract component name from user message"""
        # Simple approach: Look for specific patterns and stop words
        
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
                filter_context = f"\n\nIMPORTAT: The user has applied filters - show results {' and '.join(filter_parts)}. Always mention which filters were applied and how they affected the results."
        
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