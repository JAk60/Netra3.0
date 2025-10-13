import logging
import os
from logging.handlers import RotatingFileHandler

LOGGING_ENABLED = False  # 🔀 Switch here

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "application.log")

if LOGGING_ENABLED:
    file_handler = RotatingFileHandler(
        LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    )

    logging.basicConfig(
        level=logging.DEBUG,
        handlers=[file_handler, logging.StreamHandler()]
    )
else:
    logging.basicConfig(level=logging.CRITICAL)  # Only log CRITICAL errors

logger = logging.getLogger(__name__)
