from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from db.schemaAwareSQL import initialize, process_query
from backend.utils.utils import get_user_identity
from backend.drishti.ai_agent import AIAgent
from backend.utils.logging_config import logger

# Request Models


class QueryRequest(BaseModel):
    question: str = Field(...,
                          example="What are the top 5 customers by revenue")


class ChatRequest(BaseModel):
    query: str

# Dummy authentication (replace with real auth)

router = APIRouter()

def authenticate_user():
    user_identity = get_user_identity()
    if not user_identity["user_id"]:
        raise HTTPException(
            status_code=401, detail="Unauthorized access: User ID is missing")
    logger.info(f"📌 User authenticated: {user_identity}")
    return user_identity

# Root endpoint


@router.get("/", summary="Root API Endpoint", response_model=dict)
def root():
    return {"message": "Welcome to the AI-Powered SQL API! Use /docs for API documentation."}

# /ask endpoint


@router.post("/ask", summary="Process AI-powered query through API endpoint", response_model=dict)
def ask(request: QueryRequest, user_identity: dict = Depends(authenticate_user)):
    logger.info("📌 Received client request over API endpoint: /ask")
    response = process_query(request.question, user_identity)
    logger.debug(f"📌 API Response Before Sending: {response}")
    return handle_response(response)

# /chat endpoint


@router.post("/chat", summary="Process AI-powered query through AI agent", response_model=dict)
def chat(request: ChatRequest, user_identity: dict = Depends(authenticate_user)):
    initialize() 
    ai_agent = AIAgent()  # ✅ created after init
    logger.info("📌 Received client request over AI Agent endpoint: /chat")
    response = ai_agent.chat(request.query, user_identity)
    logger.debug(f"📌 API Response Before Sending: {response}")
    return handle_response(response)

# Centralized response handler


def handle_response(response):
    logger.debug(f"📌 API Response Received: {response}")
    if isinstance(response, dict) and "error" in response:
        error_message = response.get(
            "message", "⚠️ An unexpected error occurred.")
        error_type = response.get("error", "")

        if isinstance(error_message, dict) and "error" in error_message:
            logger.warning(f"🔄 Extracting nested error: {error_message}")
            return error_message

        if error_type.lower() == "unsupported question":
            logger.warning(f"🚫 Unsupported Question: {error_message}")
            return response

        if error_type.lower() == "access denied":
            logger.warning(f"🚫 Access Denied: {error_message}")
            return {
                "error": "Access Denied",
                "message": "🚫 LLM has determined that you do not have permission to access this data."
            }

        if error_type.lower() == "clarification needed":
            logger.warning(f"🤔 Clarification Needed: {error_message}")
            return {
                "error": "Clarification Needed",
                "message": f"🤔 Clarification Needed: {error_message}"
            }

        if "access denied" in str(error_message).lower():
            logger.warning(f"🚫 Access Denied: {error_message}")
            return {
                "error": "Access Denied",
                "message": "🚫 LLM has determined that you do not have permission to access this data."
            }

        elif "sql query failed security validation" in error_message.lower():
            logger.error(f"🛑 SQL Security Blocked: {error_message}")
            return {
                "error": "Security Violation",
                "message": "🚨 Your query was blocked due to security restrictions."
            }

        elif "i don't know" in str(error_message).lower() or "not authorized" in str(error_message).lower():
            logger.warning(f"unknown topic: {error_message}")
            return {
                "error": "Unknown Query",
                "message": "I will only answer questions about the db I'm connected to."
            }

        else:
            logger.error(f"🚫 Unexpected API Error: {error_message}")
            return {
                "error": "Unexpected Error",
                "message": str(error_message)
            }

    return response


