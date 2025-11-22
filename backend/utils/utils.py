import os
import yaml
from dotenv import load_dotenv
from drishti.llm_client import LLMClient
from utils.logging_config import logger
# Load environment variables
load_dotenv()


def load_config():
    """Loads configuration from config.yaml."""

    # Get the absolute path of this script
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Construct the absolute path to config.yaml
    config_path = os.path.join(base_dir, "config.yaml")
    logger.info(f"Loading configuration from: {config_path}")
    if not os.path.exists(config_path):
        # Better error message
        raise FileNotFoundError(f"❌ Config file not found at: {config_path}")

    with open(config_path, "r") as file:
        return yaml.safe_load(file)


def get_user_identity():
    """Retrieve user identity based on environment variables."""
    return {
        "role": os.getenv("USER_ROLE", "customer"),
        "user_id": os.getenv("USER_ID"),
        "username": os.getenv("USERNAME", "guest"),
    }


def get_user_identity():
    """Retrieve user identity from config.yaml. in production these will be supplied by your authentication system."""

    config = load_config()  # Load configuration

    # Get USER_SETTINGS section
    user_settings = config.get("USER_SETTINGS", {})

    return {
        # Default: "customer"
        "role": user_settings.get("USER_ROLE", "customer"),
        # May be None if missing
        "user_id": user_settings.get("USER_ID"),
        "username": user_settings.get("USERNAME", "guest"),  # Default: "guest"
    }


def get_llm_client():
    """Initializes and returns an LLM client instance."""
    config = load_config()
    return LLMClient(config)
