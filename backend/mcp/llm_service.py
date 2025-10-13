import json
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


class LLMService:
    """Pure LLM communication service"""
    
    def __init__(self, base_url: str = "http://localhost:11434", 
                 generation_model: str = "codellama:7b-instruct",
                 intent_model: str = "mistral:latest"):
        self.base_url = base_url
        self.generation_model = generation_model
        self.intent_model = intent_model
        self._validate_connection()
    
    def _validate_connection(self):
        """Test connection once at startup"""
        try:
            import requests
            response = requests.get(f"{self.base_url}/api/tags", timeout=5.0)
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="Ollama service not available at startup")
        except Exception as e:
            print(f"Warning: Ollama connection test failed: {e}")
            # Don't fail hard at startup, just log warning
    
    async def call_llm(self, messages: List[Dict[str, str]], model: str = None, 
                      temperature: float = 0.7) -> str:
        """Pure LLM API call"""
        model = model or self.generation_model
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                payload = {
                    "model": model,
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": temperature}
                }
                
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                
                if response.status_code != 200:
                    raise HTTPException(status_code=503, detail=f"Ollama returned status {response.status_code}")
                
                result = response.json()
                content = result.get("message", {}).get("content", "")
                
                if not content:
                    raise HTTPException(status_code=503, detail="Ollama returned empty response")
                
                return content
                
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Ollama request timed out")
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Cannot connect to Ollama service")
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Ollama service error: {str(e)}")
    
    