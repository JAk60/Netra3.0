import re  # For regex
import ollama  # For Ollama-managed models
from dotenv import load_dotenv  # For loading environment variables
# from llama_cpp import Llama  # For local Llama models
from utils.logging_config import logger  # For logging

# Load environment variables
load_dotenv()


import re
import ollama
from utils.logging_config import logger


class LLMClient:
    def __init__(self, config):
        """Initialize the LLM client for Ollama."""
        self.provider = "ollama"
        self.model = config["OLLAMA"]["MODEL"]
        self.client = ollama
        logger.info(f"Initializing LLMClient with Ollama model: {self.model}")

    def llm_client_validate_sql(self, sql_query):
        """Validate SQL query using LLM."""
        logger.info("Validating SQL query using LLM.")
        prompt = f"Analyze the following SQL query for logical errors, inefficiencies, and security risks. Please update the query for any critical findings:\n\n{sql_query}"
        # Placeholder for validation model
        response = "PLACEHOLDER: call your validation model here"
        return response

    def llm_client_generate_sql_query(self, prompt):
        """Generate SQL query using Ollama."""
        logger.info("Generating SQL query...")

        try:
            if not hasattr(self, 'client') or self.client is None:
                logger.error("Ollama client is not initialized")
                return {"error": "Client Error", "message": "Ollama client is not properly initialized"}
            
            ollama_response = self.client.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                options={
                    "temperature": 0,
                    "num_threads": 16,
                    "num_ctx": 4096,
                    "num_predict": 1024,
                    "f16_kv": True,
                },
            )
            response_text = ollama_response.message.content

            if response_text is None:
                logger.error("LLM returned None response")
                return {"error": "No Response", "message": "LLM returned no response"}

            # Extract SQL from the response
            response = self.extract_sql(response_text)
            logger.info("SQL query generation completed")
            logger.debug(f"Generated SQL query: {response}")
            return response

        except Exception as e:
            logger.error(f"Error generating SQL query: {e}")
            return {"error": "Generation Error", "message": f"Failed to generate SQL query: {str(e)}"}

    @staticmethod
    def extract_sql(response_text):
        """Extract SQL query from LLM response."""
        logger.debug(f"Extracting SQL from response: {response_text[:200]}...")

        if not response_text or not response_text.strip():
            logger.error("Empty or None response text")
            return {"error": "Empty Response", "message": "LLM returned empty response"}

        # Remove AI reasoning tags
        response_text = re.sub(r"<think>.*?</think>", "", response_text, flags=re.DOTALL).strip()

        # Extract SQL from code block
        match = re.search(r"```sql(.*?)```", response_text, re.DOTALL)
        if match:
            sql = match.group(1).strip()
            logger.info("SQL extracted from formatted response")
            return sql

        # Find first valid SELECT statement
        match = re.search(r"\bSELECT\b\s+.*", response_text, re.IGNORECASE | re.DOTALL)
        if match:
            sql = match.group(0).strip()
            logger.info(f"Direct SQL response detected: {sql}")
            return sql

        # Handle error responses
        lower_text = response_text.lower()
        
        if "access denied" in lower_text:
            logger.warning("LLM response indicates access is denied")
            return {"error": "Access Denied", "message": "You do not have permission to perform this operation"}

        if "i don't know" in lower_text:
            logger.warning("LLM response indicates it cannot answer the question")
            return {"error": "Unsupported Question", "message": "I will only answer questions about the database I'm connected to"}

        if "not authorized" in lower_text:
            logger.warning("LLM response indicates authorization issue")
            return {"error": "Authorization Failed", "message": "Your role does not allow this action"}

        if "clarify:" in lower_text:
            logger.warning("LLM response requests clarification")
            clarification = response_text.replace("CLARIFY:", "").strip()
            return {"error": "Clarification Needed", "message": clarification}

        # Handle requests for clarification
        clarification_keywords = [
            "clarify:", "please provide more details", "could you clarify", 
            "what do you mean", "can you specify", "your request is not clear"
        ]
        if any(keyword in lower_text for keyword in clarification_keywords):
            logger.warning("LLM response requests clarification")
            return {"error": "Clarification Needed", "message": "I need more details to generate a useful query. Can you specify?"}

        # No valid SQL found
        logger.error("No valid SQL query found in response")
        return {"error": "Invalid SQL Response", "message": f"Could not extract valid SQL from response: {response_text[:100]}..."}