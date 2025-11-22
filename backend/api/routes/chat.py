from fastapi import APIRouter, HTTPException, Depends
from backend.api.routes.ai import authenticate_user
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from mcp.llm import ChatOrchestrator


# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Import the new ChatOrchestrator
# ChatOrchestrator = None
# try:
#     logger.info("✅ Successfully imported ChatOrchestrator!")
# except Exception as e:
#     logger.error(f"❌ Failed to import ChatOrchestrator: {e}")
#     ChatOrchestrator = None

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None

class ReliabilityFilters(BaseModel):
    ships: Optional[List[str]] = None
    explain: Optional[bool] = False
    additional_filters: Optional[Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    message: str
    classifier: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[ChatMessage]] = []
    filters: Optional[ReliabilityFilters] = None

class ToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]

class AIResponse(BaseModel):
    generated_sql: Optional[str] = None
    records_retrieved: Optional[int] = None
    result: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    response: str
    tool_calls: Optional[List[ToolCall]] = None
    ai_response: Optional[AIResponse] = None
    filters_applied: Optional[ReliabilityFilters] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    intent: Optional[str] = None
    execution_data: Optional[Dict[str, Any]] = None

router = APIRouter(prefix="/chat", tags=["AI Chat"])

# Global orchestrator instance
chat_orchestrator = None

def get_chat_orchestrator():
    """Get or create ChatOrchestrator instance"""
    global chat_orchestrator
    
    # Check if ChatOrchestrator class is available
    if ChatOrchestrator is None:
        raise HTTPException(
            status_code=503,
            detail="ChatOrchestrator class could not be imported"
        )
    
    # Create instance if it doesn't exist
    if chat_orchestrator is None:
        try:
            logger.info("🚀 Creating ChatOrchestrator instance...")
            chat_orchestrator = ChatOrchestrator()
            logger.info("✅ ChatOrchestrator instance created successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to create ChatOrchestrator: {e}")
            raise HTTPException(
                status_code=503,
                detail=f"Failed to initialize ChatOrchestrator: {str(e)}"
            )
    
    return chat_orchestrator

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        orchestrator = get_chat_orchestrator()
        
        # Test LLM connection
        status = "healthy"
        try:
            # Quick test to see if the orchestrator is working
            test_response = await orchestrator.process_message("health check")
            if not test_response:
                status = "degraded"
        except Exception as e:
            logger.warning(f"Health check warning: {e}")
            status = "degraded"
        
        return {
            "status": status,
            "service": "available",
            "message": "AI chat service is running",
            "components": {
                "chat_orchestrator": "available",
                "llm_service": "available" if hasattr(orchestrator, 'llm_service') else "unavailable",
                "intent_classifier": "available" if hasattr(orchestrator, 'intent_classifier') else "unavailable",
                "tool_orchestrator": "available" if hasattr(orchestrator, 'tool_orchestrator') else "unavailable"
            }
        }
    except HTTPException as e:
        return {
            "status": "unhealthy",
            "error": e.detail
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, user_identity: dict = Depends(authenticate_user)):
    """Main chat endpoint using the new ChatOrchestrator"""
    logger.info(f"📨 Chat request: {request.message[:50]}...")
    
    try:
        orchestrator = get_chat_orchestrator()
        logger.info("✅ Got ChatOrchestrator")
        
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        print(f"request : {request}")
        # Process the message through the orchestrator
        chat_response = await orchestrator.process_message(
            message=request.message,
            intent=request.classifier.get('intent') if hasattr(request, 'classifier') else None,
            user_identity=user_identity
        )
        
        logger.info(f"✅ Got response from ChatOrchestrator - Intent: {chat_response.intent}")
        
        # Convert the orchestrator response to FastAPI response format
        response_data = {
            "response": chat_response.response,
            "intent": chat_response.intent,
            "execution_data": chat_response.execution_data,
            "filters_applied": request.filters
        }
        
        # Handle tool calls
        tool_calls = []
        if chat_response.tool_calls:
            if isinstance(chat_response.tool_calls, list):
                # Handle reliability/sensor tool calls
                for tool_call in chat_response.tool_calls:
                    if isinstance(tool_call, dict):
                        tool_calls.append(ToolCall(
                            name=tool_call.get("tool_name", "unknown"),
                            arguments=tool_call.get("arguments", {}),
                            result=tool_call.get("result", {})
                        ))
            elif chat_response.tool_calls == "schema_aware_sql_generator":
                # Handle general AI query - get the stored response
                last_response = orchestrator.get_last_ai_response()
                if last_response:
                    # Handle both dict and object responses safely
                    if isinstance(last_response, dict):
                        # It's a dictionary - use .get()
                        response_data["ai_response"] = AIResponse(
                            generated_sql=last_response.get("generated_sql"),
                            records_retrieved=last_response.get("records_retrieved"),
                            result=last_response.get("result", [])
                        )
                    else:
                        # It's an object - use attribute access with getattr for safety
                        response_data["ai_response"] = AIResponse(
                            generated_sql=getattr(last_response, "generated_sql", None),
                            records_retrieved=getattr(last_response, "records_retrieved", None),
                            result=getattr(last_response, "result", [])
                        )
        
        response_data["tool_calls"] = tool_calls if tool_calls else None
        
        return ChatResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.get("/tools")
async def get_available_tools():
    """Get available tools from the orchestrator"""
    try:
        orchestrator = get_chat_orchestrator()
        
        if (not hasattr(orchestrator, 'tool_orchestrator') or 
            orchestrator.tool_orchestrator is None or
            not hasattr(orchestrator.tool_orchestrator, 'tool_executor')):
            return {"tools": [], "count": 0, "message": "No tool orchestrator or executor available"}
        
        tools = orchestrator.tool_orchestrator.tool_executor.get_tool_definitions()
        return {"tools": tools, "count": len(tools)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tools: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tools")

@router.get("/intents")
async def get_intent_info():
    """Get information about available intents"""
    try:
        # Import IntentType safely
        try:
            from mcp.llm_service import IntentType
        except ImportError:
            return {
                "error": "IntentType not available",
                "available_intents": ["reliability", "sensor", "general"],
                "intent_descriptions": {
                    "reliability": "Questions about component reliability, failure rates, remaining life, MTBF, uptime",
                    "sensor": "Questions about sensor data, temperature, pressure, readings, sensor status",
                    "general": "General queries, data requests, analysis"
                }
            }
        
        intents = {
            "available_intents": [intent.value for intent in IntentType],
            "intent_descriptions": {
                "reliability": "Questions about component reliability, failure rates, remaining life, MTBF, uptime",
                "sensor": "Questions about sensor data, temperature, pressure, readings, sensor status",
                "general": "General queries, data requests, analysis"
            }
        }
        return intents
        
    except Exception as e:
        logger.error(f"Error getting intent info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get intent information")

@router.post("/classify")
async def classify_message_intent(request: dict):
    """Endpoint to classify message intent without processing"""
    try:
        message = request.get("message", "")
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        orchestrator = get_chat_orchestrator()
        
        # Check if intent_classifier exists
        if not hasattr(orchestrator, 'intent_classifier') or orchestrator.intent_classifier is None:
            raise HTTPException(status_code=503, detail="Intent classifier not available")
        
        intent_result = await orchestrator.intent_classifier.classify_intent(message)
        
        return {
            "message": message,
            "intent": intent_result.intent.value,
            "confidence": intent_result.confidence,
            "method": intent_result.method
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error classifying intent: {e}")
        raise HTTPException(status_code=500, detail="Failed to classify intent")

@router.post("/drishti/chat")
async def drishti_chat(request: ChatRequest):
    """Drishti chat endpoint - uses AI agent for ship-related queries"""
    try:
        orchestrator = get_chat_orchestrator()
        
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Check if ai_agent exists
        if not hasattr(orchestrator, 'ai_agent') or orchestrator.ai_agent is None:
            raise HTTPException(status_code=503, detail="AI agent not available")
        
        # Validate that message is not empty
        if not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )
        
        # Call Drishti API with the message
        ships = await orchestrator.drishti(request.message)
        
        return {"ships": ships}
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Drishti chat error: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error occurred while processing your request"
        )

@router.get("/debug/orchestrator")
async def debug_orchestrator():
    """Debug endpoint to check orchestrator status"""
    try:
        orchestrator = get_chat_orchestrator()
        
        debug_info = {
            "orchestrator_available": orchestrator is not None,
            "llm_service_available": hasattr(orchestrator, 'llm_service') and orchestrator.llm_service is not None,
            "intent_classifier_available": hasattr(orchestrator, 'intent_classifier') and orchestrator.intent_classifier is not None,
            "tool_orchestrator_available": hasattr(orchestrator, 'tool_orchestrator') and orchestrator.tool_orchestrator is not None,
            "ai_agent_available": hasattr(orchestrator, 'ai_agent') and orchestrator.ai_agent is not None,
        }
        
        # Safely get LLM service info
        if debug_info["llm_service_available"]:
            try:
                debug_info["llm_base_url"] = getattr(orchestrator.llm_service, 'base_url', None)
                debug_info["generation_model"] = getattr(orchestrator.llm_service, 'generation_model', None)
                debug_info["intent_model"] = getattr(orchestrator.llm_service, 'intent_model', None)
            except Exception as e:
                debug_info["llm_service_error"] = str(e)
        
        return debug_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Debug error: {e}")
        return {
            "error": str(e),
            "orchestrator_available": False
        }