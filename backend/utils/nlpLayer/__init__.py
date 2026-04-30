"""
nlpLayer
--------
Naval NLP query pipeline.

Stages:
    LLMExtractor      Stage 1 — raw entity extraction via LLM
    EntityLinker      Stage 2A — entity resolution via three-tier catalog
    TemporalResolver  Stage 2B — time expression parsing via dateparser
    PatternMemory     Stage 3 — ChromaDB hybrid shape cache

Logging:
    clear_chat_log    — call at start of every process_message run
    log_stage         — write one line to chat.log per pipeline event
"""

from .chat_logger import clear_chat_log, get_chat_logger, log_stage
from .entity_linker import EntityLinker
from .llm_extractor import LLMExtractor
from api.models.nlp.nlplayer import (
    ExtractionResult,
    IntentSignal,
    PatternMemoryResult,
    PipelineError,
    PipelineStage,
    QueryShape,
    RawPair,
    RawTriplet,
    ResolvedEntities,
    ResolvedPair,
    ResolvedTriplet,
    TemporalRange,
)
from .pattern_memory import PatternMemory
from .temporal_resolver import TemporalResolver

__all__ = [
    # Core pipeline classes
    "LLMExtractor",
    "EntityLinker",
    "TemporalResolver",
    "PatternMemory",
    # Models
    "IntentSignal",
    "ExtractionResult",
    "RawPair",
    "RawTriplet",
    "ResolvedEntities",
    "ResolvedPair",
    "ResolvedTriplet",
    "TemporalRange",
    "PatternMemoryResult",
    "QueryShape",
    "PipelineError",
    "PipelineStage",
    # Logging
    "clear_chat_log",
    "log_stage",
    "get_chat_logger",
]