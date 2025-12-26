# ==================== reliability/assemblies/actual_data.py ====================

import sys
sys.path.append('..')
from typing import List, Optional
import uuid
from sqlmodel import Session, select
import logging

from api.db.connection import get_session_context, get_async_db_service

from api.models.reliability import NPRDData, NPRDDataCreate
logger = logging.getLogger(__name__)



# ==================== reliability/assemblies/nprd.py ====================



class NPRDDataRepository:
    """Repository for NPRDData operations"""

    def __init__(self, session: Optional[Session] = None, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, data: NPRDDataCreate) -> NPRDData:
        """Create NPRDData record - SYNC"""
        try:
            record = NPRDData(**data.model_dump(), id=uuid.uuid4())
            session.add(record)
            session.commit()
            session.refresh(record)
            logger.info(f"Created NPRDData record: {record.id}")
            return record
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create NPRDData: {e}")
            raise

    async def create(self, data: NPRDDataCreate) -> NPRDData:
        """Create NPRDData record - ASYNC"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, data)
        return await self.async_service.run_in_thread(_create)

    def _get_by_component_sync(self, session: Session, component_id: uuid.UUID) -> List[NPRDData]:
        """Get all NPRDData records for a component - SYNC"""
        try:
            statement = select(NPRDData).where(NPRDData.component_id == component_id)
            records = session.exec(statement).all()
            logger.info(f"Retrieved {len(records)} NPRDData records for component {component_id}")
            return records
        except Exception as e:
            logger.error(f"Failed to retrieve NPRDData: {e}")
            raise

    async def get_by_component(self, component_id: uuid.UUID) -> List[NPRDData]:
        """Get all NPRDData records for a component - ASYNC"""
        def _get():
            with get_session_context() as session:
                return self._get_by_component_sync(session, component_id)
        return await self.async_service.run_in_thread(_get)

    def _get_all_sync(self, session: Session) -> List[NPRDData]:
        """Get all NPRDData records - SYNC"""
        return session.exec(select(NPRDData)).all()

    async def get_all(self) -> List[NPRDData]:
        """Get all NPRDData records - ASYNC"""
        def _get():
            with get_session_context() as session:
                return self._get_all_sync(session)
        return await self.async_service.run_in_thread(_get)

