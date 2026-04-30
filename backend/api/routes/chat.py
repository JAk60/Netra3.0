"""
api/routes/chat.py
-------------------
FastAPI chat route.

Changes from original:
    - request.query passed as message to orchestrator (field kept as "query" to match frontend)
    - Full classifier dict passed through instead of just intent string
    - ChatOrchestrator singleton built at startup in main.py, injected via app.state
      NOT constructed here with ChatOrchestrator() — that is the root cause of the
      old pipeline still running (old class was being instantiated with no args)
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Any, Optional

router = APIRouter()


# ── Request / Response models ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str                              # raw user message — matches frontend payload key
    classifier: Dict[str, Any]             # full frontend ClassifierResult object
    conversation_history: Optional[List[Dict[str, Any]]] = []
    filters: Optional[Dict[str, Any]] = {}
    session_id: Optional[str] = None



class ChatResponse(BaseModel):
    response: Optional[str] = None
    results: Optional[Any] = None
    intent: Optional[str] = None
    tool_calls: Optional[Any] = None
    duration_hours: Optional[float] = None
    ai_response: Optional[Any] = None
    timestamp: Optional[str] = None  # ← just make it Optional
    error: Optional[str] = None


# ── Dependency ───────────────────────────────────────────────────────────────

def get_orchestrator(request: Request):
    """
    Returns the ChatOrchestrator singleton from app.state.
    Built once in main.py startup — never constructed here.

    WHY: The old chat.py did `ChatOrchestrator()` with no args inside get_orchestrator().
    The new ChatOrchestrator requires llm_service, entity_linker, temporal_resolver,
    pattern_memory, tool_orchestrator — so it must be wired at startup, not on-demand.

    Add to main.py:

        from mcp.llm import ChatOrchestrator, ToolOrchestrator
        from backend.utils.nlpLayer import EntityLinker, TemporalResolver, PatternMemory
        from backend.reliability.relformulas import Reliability
        from backend.reliability.rcm import RCMService
        from backend.sensor.rul import RULCalculationService
        from backend.sensor.sensors import SensorReadingService

        @app.on_event("startup")
        async def startup():
            # Build entity linker catalog from live DB
            entity_linker = EntityLinker(embedding_model=None)
            await entity_linker.build_catalogs(get_system_config_repository())

            app.state.orchestrator = ChatOrchestrator(
                llm_service=get_llm_service(),
                entity_linker=entity_linker,
                temporal_resolver=TemporalResolver(),
                pattern_memory=PatternMemory(embedding_model=get_embedding_model()),
                tool_orchestrator=ToolOrchestrator(
                    reliability_service=Reliability(get_reliability_repo()),
                    rcm_service=RCMService(get_rcm_repo()),
                    rul_service=RULCalculationService(get_sensor_repo()),
                    sensor_service=SensorReadingService(get_sensor_repo()),
                ),
            )
    """
    orchestrator = getattr(request.app.state, "orchestrator", None)
    if orchestrator is None:
        raise HTTPException(
            status_code=503,
            detail="ChatOrchestrator not initialised. Add startup wiring to main.py.",
        )
    return orchestrator


# ── Route ────────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    orchestrator=Depends(get_orchestrator),
) -> ChatResponse:
    """
    Main chat endpoint.

    Frontend sends:
        {
            "query": "what is the reliability of GT 1 of ins one for 50 hours?",
            "classifier": {
                "intent": "RELIABILITY",
                "intents": ["RELIABILITY"],
                "complexity": "single_entity",
                "matched": "anchor:reliability",
                "signals": {
                    "has_paired_entities": true,
                    "has_multiple_ships": false,
                    "has_multiple_components": false,
                    "has_multiple_sensors": false,
                    "has_negation": false,
                    "has_comparison": false,
                    "entity_count": 2
                }
            },
            "conversation_history": [],
            "filters": { "ships": [], "explain": false }
        }
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="query cannot be empty.")

    if not request.classifier or "intent" not in request.classifier:
        raise HTTPException(status_code=400, detail="classifier.intent is required.")

    result = await orchestrator.process_message(
        message=request.query,          # "query" in request → "message" in orchestrator
        classifier=request.classifier,  # full dict, not just intent string
    )

    if "error" in result:
        return ChatResponse(
            error=result["error"],
            intent=request.classifier.get("intent"),
        )

    return ChatResponse(
        results=result.get("results"),
        response=result.get("response"),
        intent=result.get("intent", request.classifier.get("intent")),
        tool_calls=result.get("tool_calls"),
        duration_hours=result.get("duration_hours"),
        ai_response=result.get("ai_response"),
        # timestamp=result.get("timestamp"),
    )