from sqlmodel import Session
from api.db.connection import get_async_db_service

from sqlmodel import Session
import logging

# Import your naval ship models (adjust import path as needed)

logger = logging.getLogger(__name__)

class MonthlyUtilizationRepository:
    """ Repository for managing monthly utilization data of naval ships."""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()