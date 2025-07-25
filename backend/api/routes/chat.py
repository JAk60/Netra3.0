from fastapi import APIRouter, HTTPException
from mcp.llm_service import LLMService
from pydantic import BaseModel
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

class ChatResponse(BaseModel):
    response: str
    tool_calls: Optional[List[ToolCall]] = None
    filters_applied: Optional[ReliabilityFilters] = None
    timestamp: datetime = datetime.now()

router = APIRouter(prefix="/chat", tags=["AI Chat"])

# Initialize LLM service
llm_service = LLMService()

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Main AI chat endpoint with tool support and filtering"""
    
    try:
        result = await llm_service.chat_with_tools(
            message=request.message,
            conversation_history=request.conversation_history,
            filters=request.filters
        )
        
        return ChatResponse(
            response=result["response"],
            tool_calls=result["tool_calls"],
            filters_applied=request.filters
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Chat processing error: {str(e)}"
        )

@router.get("/tools")
async def get_available_tools():
    """Get list of available AI tools"""
    return {
        "tools": llm_service.tool_executor.get_tool_definitions(),
        "count": len(llm_service.tool_executor.tools)
    }
