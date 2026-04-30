"""
nlpLayer/chat_logger.py
-----------------------
Dedicated run logger. One file. Clears itself completely at the start
of every pipeline run so each query produces a clean, readable trace.

Never propagates to application.log.

Usage:
    from nlpLayer.chat_logger import clear_chat_log, log_stage

    async def process_message(message, signal):
        clear_chat_log()                       # ← very first line
        log_stage("QUERY", message)
        log_stage("FRONTEND", str(signal))
        ...
"""

import logging
import os

LOG_DIR = "logs"
CHAT_LOG_FILE = os.path.join(LOG_DIR, "chat.log")


def get_chat_logger() -> logging.Logger:
    return logging.getLogger("chat")


def clear_chat_log() -> None:
    """
    Called once at the start of every process_message run.
    Closes existing handlers, wipes the file, reattaches a fresh FileHandler.
    After this returns the chat logger is clean and ready.
    """
    os.makedirs(LOG_DIR, exist_ok=True)

    chat_logger = logging.getLogger("chat")

    # Close and detach all existing handlers
    for handler in chat_logger.handlers[:]:
        handler.close()
        chat_logger.removeHandler(handler)

    # Wipe the file
    with open(CHAT_LOG_FILE, "w", encoding="utf-8"):
        pass

    # Fresh handler — mode "w" so even if something appended mid-clear it resets
    handler = logging.FileHandler(CHAT_LOG_FILE, mode="a", encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(message)s"))
    chat_logger.addHandler(handler)
    chat_logger.setLevel(logging.DEBUG)
    chat_logger.propagate = False   # never bleeds into application.log


def log_stage(stage: str, message: str) -> None:
    """
    Write one line to chat.log with a fixed-width stage label.

    Format:
        [QUERY       ] "What is the reliability of GT 1..."
        [LINKER T1   ] "gt1" → alias hit → component_id=5358d044
        [MEMORY      ] vector top=0.89 key=REL|CG→S+S|D ≠ REL|CG→S,CG→S|D → MISS
    """
    get_chat_logger().debug(f"[{stage:<12}] {message}")