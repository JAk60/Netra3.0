# ==================== reliability/assemblies/actual_data.py ====================

import sys
sys.path.append('..')
from typing import List, Optional
import uuid
from sqlmodel import Session, select
import logging

from api.db.connection import get_session_context, get_async_db_service
from api.models.reliability import IntervalData, IntervalDataCreate

logger = logging.getLogger(__name__)


# ==================== reliability/assemblies/interval_data.py ====================



class IntervalDataRepository:
    """Repository for IntervalData operations"""

    def __init__(self, session: Optional[Session] = None, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, data: IntervalDataCreate) -> IntervalData:
        """Create single IntervalData record - SYNC"""
        try:
            record = IntervalData(**data.model_dump(), id=uuid.uuid4())
            session.add(record)
            session.commit()
            session.refresh(record)
            logger.info(f"Created IntervalData record: {record.id}")
            return record
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create IntervalData: {e}")
            raise

    async def create(self, data: IntervalDataCreate) -> IntervalData:
        """Create single IntervalData record - ASYNC"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, data)
        return await self.async_service.run_in_thread(_create)

    def _create_bulk_sync(self, session: Session, data_list: List[IntervalDataCreate]) -> List[IntervalData]:
        """Create multiple IntervalData records - SYNC"""
        try:
            records = []
            for data in data_list:
                record = IntervalData(**data.model_dump(), id=uuid.uuid4())
                session.add(record)
                records.append(record)
            
            session.commit()
            for record in records:
                session.refresh(record)
            
            logger.info(f"Created {len(records)} IntervalData records")
            return records
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create bulk IntervalData: {e}")
            raise

    async def create_bulk(self, data_list: List[IntervalDataCreate]) -> List[IntervalData]:
        """Create multiple IntervalData records - ASYNC"""
        def _create():
            with get_session_context() as session:
                return self._create_bulk_sync(session, data_list)
        return await self.async_service.run_in_thread(_create)

    def _get_by_component_sync(self, session: Session, component_id: uuid.UUID) -> List[IntervalData]:
        """Get all IntervalData records for a component - SYNC"""
        try:
            statement = select(IntervalData).where(IntervalData.component_id == component_id)
            records = session.exec(statement).all()
            logger.info(f"Retrieved {len(records)} IntervalData records for component {component_id}")
            return records
        except Exception as e:
            logger.error(f"Failed to retrieve IntervalData: {e}")
            raise

    async def get_by_component(self, component_id: uuid.UUID) -> List[IntervalData]:
        """Get all IntervalData records for a component - ASYNC"""
        def _get():
            with get_session_context() as session:
                return self._get_by_component_sync(session, component_id)
        return await self.async_service.run_in_thread(_get)

    def _get_all_sync(self, session: Session) -> List[IntervalData]:
        """Get all IntervalData records - SYNC"""
        return session.exec(select(IntervalData)).all()

    async def get_all(self) -> List[IntervalData]:
        """Get all IntervalData records - ASYNC"""
        def _get():
            with get_session_context() as session:
                return self._get_all_sync(session)
        return await self.async_service.run_in_thread(_get)

