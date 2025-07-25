# import json
# import asyncio
# import aiohttp
# import re
# from typing import Dict, Any, List

# class IntentClassifier:
#     def __init__(self, ollama_url: str = "http://localhost:11434"):
#         self.ollama_url = ollama_url
        
#     async def classify_intent(self, message: str) -> Dict[str, Any]:
#         """Use CodeLlama to classify user intent"""
        
#         prompt = f"""
# Classify the user's intent from this message: "{message}"

# Return ONLY a JSON object with these fields:
# {{
#     "intent": "one of: reliability_query, sensor_data, component_lookup, general_question, other",
#     "confidence": 0.0-1.0,
#     "extracted_entities": ["list", "of", "relevant", "components", "or", "terms"],
#     "needs_tools": true/false
# }}

# Examples:
# - "What is the reliability of component ABC-123?" → {{"intent": "reliability_query", "confidence": 0.95, "extracted_entities": ["ABC-123"], "needs_tools": true}}
# - "How do sensors work?" → {{"intent": "general_question", "confidence": 0.9, "extracted_entities": ["sensors"], "needs_tools": false}}
# - "Show me sensor readings for temperature" → {{"intent": "sensor_data", "confidence": 0.9, "extracted_entities": ["temperature"], "needs_tools": true}}

# Message: "{message}"
# JSON Response:
# """

#         try:
#             async with aiohttp.ClientSession() as session:
#                 async with session.post(
#                     f"{self.ollama_url}/api/generate",
#                     json={
#                         "model": "codellama",
#                         "prompt": prompt,
#                         "stream": False,
#                         "options": {
#                             "temperature": 0.1,  # Low temp for consistent classification
#                             "top_p": 0.9
#                         }
#                     }
#                 ) as response:
#                     result_data = await response.json()
#                     result_text = result_data["response"].strip()
                    
#                     # Try to extract JSON from the response
#                     json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
#                     if json_match:
#                         json_str = json_match.group()
#                         return json.loads(json_str)
#                     else:
#                         # If no JSON found, try parsing the whole response
#                         return json.loads(result_text)
            
#         except (json.JSONDecodeError, KeyError, aiohttp.ClientError) as e:
#             print(f"LLM classification failed: {e}")
#             # Fallback to simple classification
#             return self._fallback_classification(message)
#         except Exception as e:
#             print(f"Unexpected error in classification: {e}")
#             return self._fallback_classification(message)
    
#     def _extract_entities(self, message: str) -> List[str]:
#         """Extract potential entities from the message"""
#         entities = []
#         message_lower = message.lower()
        
#         # Look for component patterns (letters/numbers with dashes)
#         component_pattern = r'\b[A-Za-z0-9]+[-_][A-Za-z0-9]+\b'
#         components = re.findall(component_pattern, message)
#         entities.extend(components)
        
#         # Look for sensor types
#         sensor_types = ['temperature', 'pressure', 'humidity', 'motion', 'acceleration', 
#                        'optical', 'proximity', 'vibration', 'flow', 'level']
#         for sensor_type in sensor_types:
#             if sensor_type in message_lower:
#                 entities.append(sensor_type)
        
#         # Look for GT model references
#         gt_pattern = r'\bGT\s*\d+\b'
#         gt_matches = re.findall(gt_pattern, message, re.IGNORECASE)
#         entities.extend(gt_matches)
        
#         return list(set(entities))  # Remove duplicates
    
#     def _fallback_classification(self, message: str) -> Dict[str, Any]:
#         """Simple fallback if LLM fails"""
#         message_lower = message.lower()
#         entities = self._extract_entities(message)
        
#         if any(word in message_lower for word in ["reliability", "reliable", "dependable", "lifespan", "expected life"]):
#             return {
#                 "intent": "reliability_query", 
#                 "confidence": 0.7, 
#                 "extracted_entities": entities,
#                 "needs_tools": True
#             }
#         elif any(word in message_lower for word in ["sensor", "reading", "measurement", "data", "monitor"]):
#             return {
#                 "intent": "sensor_data", 
#                 "confidence": 0.7, 
#                 "extracted_entities": entities,
#                 "needs_tools": True
#             }
#         elif any(word in message_lower for word in ["component", "part", "lookup", "find", "search"]):
#             return {
#                 "intent": "component_lookup", 
#                 "confidence": 0.7, 
#                 "extracted_entities": entities,
#                 "needs_tools": True
#             }
#         else:
#             return {
#                 "intent": "general_question", 
#                 "confidence": 0.5, 
#                 "extracted_entities": entities,
#                 "needs_tools": False
#             }

# # Updated main function - now properly async
# async def _should_use_tools(message: str) -> bool:
#     """Determine if message needs tools using LLM classification"""
    
#     classifier = IntentClassifier()
#     result = await classifier.classify_intent(message)
    
#     print(f"Message: {message}")
#     print(f"Intent: {result['intent']}, Confidence: {result['confidence']}, Needs tools: {result['needs_tools']}")
#     print(f"Entities: {result['extracted_entities']}")
#     print("-" * 80)
    
#     return result["needs_tools"] and result["confidence"] > 0.6

# async def main():
#     """Main function to test the classifier"""
#     qts = [
#         "What types of sensors are installed on the GT 1?",
#         "How many temperature sensors does the GT 1 have?",
#         "Are there any pressure sensors on the GT 1, and if so, what are their specifications?",
#         "Does the GT 1 include any motion or acceleration sensors?",
#         "What is the purpose of the humidity sensors on the GT 1?",
#         "Are optical sensors present on the GT 1, and what do they measure?",
#         "How are the sensors on the GT 1 calibrated?",
#         "What is the expected lifespan of the sensors on the GT 1?",
#         "Are there any proximity sensors on the GT 1?",
#         "How do the sensors on the GT 1 communicate with the central processing unit?"
#     ]

#     for question in qts:
#         should_use = await _should_use_tools(question)

# # Run the async main function
# if __name__ == "__main__":
#     asyncio.run(main())


import json
import os
import httpx
from typing import List, Dict, Any, Set
import re
from fuzzywuzzy import fuzz
# from api.models.chat_models import ChatMessage
from .tool_executor import ToolExecutor

class EntityExtractor:
    """Extract known entities from user messages"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self._entity_cache = {}
        self._last_cache_update = None
        
    async def get_all_entities(self) -> Dict[str, List[str]]:
        """Get all known entities from database"""
        # Cache entities for performance (refresh every hour)
        import time
        current_time = time.time()
        
        if (self._last_cache_update is None or 
            current_time - self._last_cache_update > 3600):  # 1 hour
            
            entities = {
                'components': [],
                'nomenclatures': [],
                'ships': [],
                'systems': []
            }
            
            # Get component names
            component_query = "SELECT DISTINCT name FROM components WHERE name IS NOT NULL"
            entities['components'] = await self._execute_query(component_query)
            
            # Get nomenclatures
            nomenclature_query = "SELECT DISTINCT nomenclature FROM nomenclatures WHERE nomenclature IS NOT NULL"
            entities['nomenclatures'] = await self._execute_query(nomenclature_query)
            
            # Get ship names
            ship_query = "SELECT DISTINCT ship_name FROM ships WHERE ship_name IS NOT NULL"
            entities['ships'] = await self._execute_query(ship_query)
            
            # Get system names
            system_query = "SELECT DISTINCT system_name FROM systems WHERE system_name IS NOT NULL"
            entities['systems'] = await self._execute_query(system_query)
            
            self._entity_cache = entities
            self._last_cache_update = current_time
        
        return self._entity_cache
    
    async def _execute_query(self, query: str) -> List[str]:
        """Execute database query and return list of strings"""
        # Replace with your actual database execution logic
        try:
            result = await self.db.fetch(query)
            return [row[0] for row in result if row[0]]
        except Exception as e:
            print(f"Database query error: {e}")
            return []
    
    async def extract_entities_from_message(self, message: str) -> Dict[str, List[str]]:
        """Extract all known entities from the message"""
        entities = await self.get_all_entities()
        found_entities = {
            'components': [],
            'nomenclatures': [],
            'ships': [],
            'systems': []
        }
        
        message_lower = message.lower()
        message_words = set(message.lower().split())
        
        # Direct matching first (exact matches)
        for entity_type, entity_list in entities.items():
            for entity in entity_list:
                if self._is_entity_in_message(entity, message_lower, message_words):
                    found_entities[entity_type].append(entity)
        
        # Fuzzy matching for close matches (optional)
        if not any(found_entities.values()):  # Only if no exact matches found
            found_entities = await self._fuzzy_match_entities(message, entities)
        
        return found_entities
    
    def _is_entity_in_message(self, entity: str, message_lower: str, message_words: Set[str]) -> bool:
        """Check if entity exists in message using multiple strategies"""
        entity_lower = entity.lower()
        
        # Strategy 1: Exact substring match
        if entity_lower in message_lower:
            return True
        
        # Strategy 2: Word-based match (for multi-word entities)
        entity_words = entity_lower.split()
        if len(entity_words) > 1:
            # Check if all words of entity are present
            if all(word in message_words for word in entity_words):
                return True
        
        # Strategy 3: Handle common variations
        # Remove common separators and check
        entity_normalized = re.sub(r'[-_\s]+', '', entity_lower)
        message_normalized = re.sub(r'[-_\s]+', '', message_lower)
        if entity_normalized in message_normalized:
            return True
        
        return False
    
    async def _fuzzy_match_entities(self, message: str, entities: Dict[str, List[str]]) -> Dict[str, List[str]]:
        """Fuzzy matching for entities with similarity threshold"""
        found_entities = {
            'components': [],
            'nomenclatures': [],
            'ships': [],
            'systems': []
        }
        
        words_in_message = message.split()
        
        for entity_type, entity_list in entities.items():
            for entity in entity_list:
                # Check fuzzy match with each word/phrase in message
                for i in range(len(words_in_message)):
                    for j in range(i + 1, min(i + 4, len(words_in_message) + 1)):  # Check up to 3-word phrases
                        phrase = ' '.join(words_in_message[i:j])
                        similarity = fuzz.ratio(entity.lower(), phrase.lower())
                        
                        if similarity >= 85:  # 85% similarity threshold
                            found_entities[entity_type].append(entity)
                            break
                    else:
                        continue
                    break
        
        return found_entities


class LLMService:
    """Service for LLM integration with tool support using Ollama"""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "codellama:7b-instruct", db_connection=None):
        self.base_url = base_url
        self.model = model
        self.tool_executor = ToolExecutor()
        self.entity_extractor = EntityExtractor(db_connection) if db_connection else None
    
    async def chat_with_tools(
        self, 
        message: str, 
        conversation_history: List[any]
    ) -> Dict[str, Any]:
        """Process chat message with tool support"""
        
        # Build messages for Ollama
        messages = self._build_messages(message, conversation_history)
        print(f"Sending message to LLM: {message}")
        
        # Get available tools
        tools = self.tool_executor.get_tool_definitions()
        print(f"Available tools: {tools}")
        
        try:
            # Extract entities from message
            extracted_entities = await self._extract_entities(message)
            print(f"Extracted entities: {extracted_entities}")
            
            # Determine if we need tools based on extracted entities
            should_use_tools = self._should_use_tools_based_on_entities(extracted_entities)
            print(f"Should use tools: {should_use_tools}")
            
            if should_use_tools:
                return await self._handle_with_tools(message, messages, tools, extracted_entities)
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
    
    async def _extract_entities(self, message: str) -> Dict[str, List[str]]:
        """Extract entities from message using EntityExtractor"""
        if self.entity_extractor:
            return await self.entity_extractor.extract_entities_from_message(message)
        else:
            # Fallback to regex-based extraction if no DB connection
            return self._fallback_entity_extraction(message)
    
    def _fallback_entity_extraction(self, message: str) -> Dict[str, List[str]]:
        """Fallback entity extraction using regex patterns"""
        entities = {
            'components': [],
            'nomenclatures': [],
            'ships': [],
            'systems': []
        }
        
        # Basic patterns as fallback
        component_patterns = [
            r'\b([A-Z]{2,}\s*\d+)\b',
            r'\b([A-Z]+[-_][A-Z0-9]+)\b'
        ]
        
        for pattern in component_patterns:
            matches = re.findall(pattern, message)
            entities['components'].extend(matches)
        
        return entities
    
    def _should_use_tools_based_on_entities(self, entities: Dict[str, List[str]]) -> bool:
        """Determine if tools are needed based on extracted entities"""
        # If we found any entities, we might need tools
        has_entities = any(entity_list for entity_list in entities.values())
        
        # Also check for reliability-related keywords
        reliability_keywords = [
            "reliability", "dependable", "safe to use", "component score", 
            "maintenance", "failure rate", "uptime", "mtbf", "availability",
            "status", "how reliable"
        ]
        
        # This would need the original message - you'd pass it as a parameter
        return has_entities
    
    async def _handle_with_tools(
        self, 
        original_message: str,
        messages: List[Dict[str, str]], 
        tools: List[Dict[str, Any]],
        extracted_entities: Dict[str, List[str]]
    ) -> Dict[str, Any]:
        """Handle conversation that requires tools with extracted entities"""
        
        # Create tool selection prompt with extracted entities
        tool_prompt = self._create_tool_prompt_with_entities(original_message, tools, extracted_entities)
        
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
            
            # Enhanced system message based on tool result structure
            if tool_result.get("success"):
                data = tool_result.get("data", {})
                if isinstance(data.get("results"), list):
                    # Multiple nomenclatures case
                    final_messages.append({
                        "role": "system",
                        "content": f"Tool '{function_name}' was called with arguments {function_args} and returned multiple results: {json.dumps(serializable_result)}\n\nNow provide a helpful response to the user. Explain that multiple nomenclatures were found for this component and summarize the reliability scores. Include what the scores mean and any recommendations."
                    })
                else:
                    # Single result case
                    final_messages.append({
                        "role": "system",
                        "content": f"Tool '{function_name}' was called with arguments {function_args} and returned: {json.dumps(serializable_result)}\n\nNow provide a helpful response to the user based on this information. Include the reliability score and explain what it means. Provide recommendations based on the score."
                    })
            else:
                # Error case
                final_messages.append({
                    "role": "system",
                    "content": f"Tool '{function_name}' was called but encountered an error: {tool_result.get('error', 'Unknown error')}\n\nProvide a helpful response explaining that the component information could not be retrieved and suggest what the user might try instead."
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
    
    def _create_tool_prompt_with_entities(
        self, 
        message: str, 
        tools: List[Dict[str, Any]], 
        extracted_entities: Dict[str, List[str]]
    ) -> str:
        """Create tool selection prompt using extracted entities"""
        
        # Get the most relevant entity (prioritize components > nomenclatures > others)
        target_entity = None
        entity_type = None
        
        if extracted_entities['components']:
            target_entity = extracted_entities['components'][0]
            entity_type = 'component'
        elif extracted_entities['nomenclatures']:
            target_entity = extracted_entities['nomenclatures'][0]
            entity_type = 'nomenclature'
        elif extracted_entities['systems']:
            target_entity = extracted_entities['systems'][0]
            entity_type = 'system'
        elif extracted_entities['ships']:
            target_entity = extracted_entities['ships'][0]
            entity_type = 'ship'
        
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
        
        if target_entity:
            return f"""USER QUERY: "{message}"

EXTRACTED ENTITIES: {extracted_entities}
TARGET ENTITY: {target_entity} (type: {entity_type})
DURATION: {duration_hours} hours

YOU MUST respond with this EXACT JSON format:
{{"tool_name": "get_component_reliability", "arguments": {{"component_name": "{target_entity}", "duration_hours": {duration_hours}}}}}

DO NOT add explanations, markdown, or extra text. ONLY return the JSON."""
        else:
            return f"""USER QUERY: "{message}"

NO ENTITIES EXTRACTED. No tool needed.

YOU MUST respond with this EXACT JSON format:
{{"tool_name": null, "arguments": {{}}}}"""
    
    # ... rest of the methods remain the same (_call_ollama, _parse_tool_decision, etc.)
    
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
    
    def _build_messages(self, message: str, history: List[Any]) -> List[Dict[str, str]]:
        """Build message array for Ollama API"""
        messages = []
        
        # System message
        messages.append({
            "role": "system",
            "content": """You are a reliability engineering assistant. You help users analyze component reliability and provide actionable insights.

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

For reliability scores:
- Scores close to 1.0 (>0.9) indicate very reliable components
- Scores between 0.7-0.9 indicate moderately reliable components  
- Scores below 0.7 may indicate components needing attention
- Consider the time duration when interpreting scores

Be direct and precise while being technically accurate."""
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