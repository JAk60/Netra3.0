from typing import List, Optional
from uuid import UUID
from sqlalchemy import func
from sqlmodel import Session, select, and_, or_, desc, asc
from datetime import datetime
from api.models import SystemConfiguration, Ship, Department  # Changed from backend.api.models
from api.models.systemconfiguration import (  # Changed from backend.api.models
    BulkComponentCreate, BulkOperationResult, ComponentHierarchyStats,
    ComponentSearchFilter,
    SystemConfigurationCreate, SystemConfigurationRead, SystemConfigurationUpdate
)
from api.db.connection import get_session_context, get_async_db_service

from datetime import datetime
from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import logging

# Import your naval ship models (adjust import path as needed)
from backend.api.models import SystemConfiguration, Ship, Department

logger = logging.getLogger(__name__)

class MonthlyUtilizationRepository:
    """ Repository for managing monthly utilization data of naval ships."""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()