from fastapi import HTTPException
import httpx
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import asyncio
import logging

logger = logging.getLogger(__name__)


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
    """Pure LLM communication service with robust timeout handling"""
    
    def __init__(
        self, 
        base_url: str = "http://localhost:11434", 
        generation_model: str = "codellama:7b-instruct-q4_0",
        intent_model: str = "mistral:latest",
        default_timeout: float = 120.0,  # Increased default timeout
        max_retries: int = 2
    ):
        self.base_url = base_url
        self.generation_model = generation_model
        self.intent_model = intent_model
        self.default_timeout = default_timeout
        self.max_retries = max_retries
        self._validate_connection()
    
    def _validate_connection(self):
        """Test connection once at startup"""
        try:
            import requests
            response = requests.get(f"{self.base_url}/api/tags", timeout=5.0)
            if response.status_code != 200:
                logger.warning("Ollama service returned non-200 status at startup")
        except Exception as e:
            logger.warning(f"Ollama connection test failed: {e}")
            # Don't fail hard at startup, just log warning
    
    async def call_llm(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None, 
        temperature: float = 0.7,
        timeout: Optional[float] = None,
        retry_on_timeout: bool = True
    ) -> str:
        """
        Pure LLM API call with enhanced error handling and retries
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: Model to use (defaults to self.generation_model)
            temperature: Temperature for generation
            timeout: Request timeout in seconds (defaults to self.default_timeout)
            retry_on_timeout: Whether to retry on timeout
            
        Returns:
            LLM response content as string
            
        Raises:
            HTTPException: With appropriate status codes for different error types
        """
        model = model or self.generation_model
        timeout = timeout or self.default_timeout
        
        # Track attempts
        attempts = 0
        max_attempts = self.max_retries + 1 if retry_on_timeout else 1
        last_exception = None
        
        while attempts < max_attempts:
            attempts += 1
            
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    payload = {
                        "model": model,
                        "messages": messages,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": 512,  # Limit tokens to reduce timeout risk
                        }
                    }
                    
                    logger.info(f"Calling Ollama (attempt {attempts}/{max_attempts}): model={model}, timeout={timeout}s")
                    
                    response = await client.post(f"{self.base_url}/api/chat", json=payload)
                    
                    if response.status_code != 200:
                        error_detail = f"Ollama returned status {response.status_code}"
                        try:
                            error_body = response.json()
                            error_detail += f": {error_body}"
                        except:
                            pass
                        raise HTTPException(status_code=503, detail=error_detail)
                    
                    result = response.json()
                    content = result.get("message", {}).get("content", "")
                    
                    if not content:
                        raise HTTPException(status_code=503, detail="Ollama returned empty response")
                    
                    logger.info(f"Ollama call successful on attempt {attempts}")
                    return content
                    
            except httpx.TimeoutException as e:
                last_exception = e
                logger.warning(f"Ollama timeout on attempt {attempts}/{max_attempts} (timeout={timeout}s)")
                
                if attempts < max_attempts:
                    # Wait before retrying with exponential backoff
                    wait_time = 2 ** (attempts - 1)  # 1s, 2s, 4s...
                    logger.info(f"Retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    # Out of retries
                    raise HTTPException(
                        status_code=504, 
                        detail=f"Ollama request timed out after {attempts} attempts ({timeout}s each). "
                               f"The model may be too slow or the request too complex. "
                               f"Consider using a faster model or simplifying the prompt."
                    )
                    
            except httpx.ConnectError as e:
                logger.error(f"Cannot connect to Ollama at {self.base_url}")
                raise HTTPException(
                    status_code=503, 
                    detail=f"Cannot connect to Ollama service at {self.base_url}. "
                           f"Ensure Ollama is running: 'ollama serve'"
                )
                
            except httpx.HTTPStatusError as e:
                logger.error(f"Ollama HTTP error: {e}")
                raise HTTPException(
                    status_code=503, 
                    detail=f"Ollama HTTP error: {str(e)}"
                )
                
            except Exception as e:
                logger.error(f"Unexpected Ollama error: {type(e).__name__}: {e}")
                raise HTTPException(
                    status_code=503, 
                    detail=f"Ollama service error: {type(e).__name__}: {str(e)}"
                )
    
    async def call_llm_with_fallback(
        self,
        messages: List[Dict[str, str]],
        fallback_response: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Call LLM with a fallback response if all attempts fail
        
        Useful for non-critical operations where you'd rather return
        a default response than fail the entire request
        """
        try:
            return await self.call_llm(messages, **kwargs)
        except HTTPException as e:
            if fallback_response:
                logger.warning(f"LLM call failed, using fallback: {e.detail}")
                return fallback_response
            else:
                raise
    
    async def is_service_healthy(self) -> bool:
        """Check if Ollama service is responsive"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False
    
    def get_model_config(self) -> Dict[str, Any]:
        """Return current model configuration"""
        return {
            "base_url": self.base_url,
            "generation_model": self.generation_model,
            "intent_model": self.intent_model,
            "default_timeout": self.default_timeout,
            "max_retries": self.max_retries
        }