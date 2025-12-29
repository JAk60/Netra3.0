import logging
import os
from logging.handlers import RotatingFileHandler

LOGGING_ENABLED = True  # 🔀 Switch here

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "application.log")
AUTH_LOG_FILE = os.path.join(LOG_DIR, "auth.log")  # NEW: Separate auth log
ERROR_LOG_FILE = os.path.join(LOG_DIR, "error.log")  # NEW: Error log

if LOGGING_ENABLED:
    # Application log handler (all logs)
    file_handler = RotatingFileHandler(
        LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    )

    # Error log handler (errors only)
    error_handler = RotatingFileHandler(
        ERROR_LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(levelname)s - %(name)s - %(message)s")
    )

    logging.basicConfig(
        level=logging.DEBUG,
        handlers=[file_handler, error_handler, logging.StreamHandler()]
    )
    
    # ===== NEW: Auth-specific logger =====
    auth_logger = logging.getLogger('auth')
    auth_logger.setLevel(logging.INFO)
    
    auth_handler = RotatingFileHandler(
        AUTH_LOG_FILE,
        maxBytes=10 * 1024 * 1024,  # 10MB for auth logs
        backupCount=10,  # Keep more auth log backups
        encoding="utf-8"
    )
    auth_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    )
    auth_logger.addHandler(auth_handler)
    
    # Prevent auth logs from duplicating in application.log
    auth_logger.propagate = False
    
else:
    logging.basicConfig(level=logging.CRITICAL)  # Only log CRITICAL errors

logger = logging.getLogger(__name__)


# Utility function to get auth logger
def get_auth_logger():
    """Get the auth-specific logger"""
    return logging.getLogger('auth')