from fastapi import APIRouter, HTTPException, Depends
from backend.api.routes.ai import authenticate_user
from mcp.llm_service import LLMService
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class ReliabilityFilters(BaseModel):
    """Filters for reliability calculations"""
    ships: Optional[List[str]] = None
    explain: Optional[bool] = False
    # Add more filter options as needed
    additional_filters: Optional[Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    filters: Optional[ReliabilityFilters] = None

class ToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]

class AIResponse(BaseModel):
    """Schema-aware AI response structure"""
    generated_sql: Optional[str] = None
    records_retrieved: Optional[int] = None
    result: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    response: str
    tool_calls: Optional[List[ToolCall]] = None
    ai_response: Optional[AIResponse] = None  # New field for schema-aware responses
    filters_applied: Optional[ReliabilityFilters] = None
    timestamp: datetime = Field(default_factory=datetime.now)

router = APIRouter(prefix="/chat", tags=["AI Chat"])

# Initialize LLM service - should be done with proper error handling
try:
    llm_service = LLMService()
except Exception as e:
    # Log the error and set llm_service to None for graceful handling
    print(f"Failed to initialize LLM service: {e}")
    llm_service = None

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, user_identity: dict = Depends(authenticate_user)):
    """Main AI chat endpoint with tool support and filtering"""
    if llm_service is None:
        raise HTTPException(
            status_code=503,
            detail="AI service is not available"
        )
    
    try:
        # Validate that message is not empty
        if not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )
        
        result = await llm_service.chat_with_tools(
            message=request.message,
            conversation_history=request.conversation_history,
            filters=request.filters,
            user_identity=user_identity
        )
        
        # Ensure result has expected structure
        if not isinstance(result, dict):
            raise ValueError("Invalid response format from LLM service")
        
        response_text = result.get("response", "")
        tool_calls = result.get("tool_calls", [])
        intent = result.get("intent", "")
        
        # Handle different response types based on intent and tool_calls
        ai_response = None
        
        # Check if this is a schema-aware response (tool_calls == "schema_aware_sql_generator")
        if tool_calls == "schema_aware_sql_generator" and intent == "GENERAL":
            # This indicates a schema-aware AI response, extract the AI response data
            # The response should contain the AI agent's structured response
            try:
                # Parse the response to extract structured data
                # Assuming the response contains the structured data we need
                if isinstance(response_text, dict):
                    ai_response = AIResponse(
                        generated_sql=response_text.get("generated_sql"),
                        records_retrieved=response_text.get("records_retrieved"),
                        result=response_text.get("result", [])
                    )
                    # Update response_text to be more user-friendly
                    if ai_response.records_retrieved is not None:
                        response_text = f"Found {ai_response.records_retrieved} records matching your query."
                    else:
                        response_text = "Query executed successfully."
                elif hasattr(llm_service, '_last_ai_response'):
                    # Fallback: check if LLM service stored the last AI response
                    last_response = getattr(llm_service, '_last_ai_response', {})
                    ai_response = AIResponse(
                        generated_sql=last_response.get("generated_sql"),
                        records_retrieved=last_response.get("records_retrieved"),
                        result=last_response.get("result", [])
                    )
            except Exception as e:
                print(f"Error parsing AI response: {e}")
                # Continue with regular response if parsing fails
        
        # Convert tool_calls back to proper format if it's not a string indicator
        if isinstance(tool_calls, str) and tool_calls == "schema_aware_sql_generator":
            tool_calls = []  # Clear the string indicator
        elif not isinstance(tool_calls, list):
            tool_calls = []
        
        return ChatResponse(
            response=response_text,
            tool_calls=tool_calls,
            ai_response=ai_response,
            filters_applied=request.filters
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid data: {str(e)}"
        )
    except Exception as e:
        # Log the actual error for debugging
        print(f"Chat processing error: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error occurred while processing your request"
        )

@router.get("/tools")
async def get_available_tools():
    """Get list of available AI tools"""
    if llm_service is None:
        raise HTTPException(
            status_code=503,
            detail="AI service is not available"
        )
    
    try:
        # Check if tool_executor exists and has the expected methods
        if not hasattr(llm_service, 'tool_executor'):
            return {
                "tools": [],
                "count": 0,
                "message": "No tool executor available"
            }
        
        tool_definitions = llm_service.tool_executor.get_tool_definitions()
        tool_count = len(getattr(llm_service.tool_executor, 'tools', []))
        
        return {
            "tools": tool_definitions,
            "count": tool_count
        }
        
    except AttributeError as e:
        raise HTTPException(
            status_code=500,
            detail="Tool executor not properly configured"
        )
    except Exception as e:
        print(f"Error getting tools: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve available tools"
        )
    
@router.post("/drishti/chat")
async def drishti_chat(request: ChatRequest):
    """Drishti chat endpoint for ship hierarchy and system components"""
    if llm_service is None:
        raise HTTPException(
            status_code=503,
            detail="AI service is not available"
        )
    
    try:
        # Validate that message is not empty
        if not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )
        
        # Call Drishti API with the message
        ships = await llm_service.drishti(request.message)
        
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