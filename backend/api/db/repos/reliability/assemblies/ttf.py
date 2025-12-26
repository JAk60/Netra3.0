# ==================== reliability/assemblies/actual_data.py ====================

import sys
sys.path.append('..')
from typing import List, Optional
import uuid
from sqlmodel import Session, select
import logging

from api.models.reliability import TTFData, FailureStatusEnum
from api.db.connection import get_session_context, get_async_db_service

logger = logging.getLogger(__name__)


# ==================== reliability/assemblies/ttf.py ====================



class TTFDataRepository:
    """Repository for TTFData (Time-To-Failure) operations"""

    def __init__(self, session: Optional[Session] = None, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, component_id: uuid.UUID, hours: float, 
                     f_s: FailureStatusEnum, priority: int) -> TTFData:
        """Create single TTFData record - SYNC"""
        try:
            record = TTFData(
                id=uuid.uuid4(),
                component_id=component_id,
                hours=hours,
                f_s=f_s,
                priority=priority
            )
            session.add(record)
            session.commit()
            session.refresh(record)
            logger.info(f"Created TTFData record: {record.id}")
            return record
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create TTFData: {e}")
            raise

    async def create(self, component_id: uuid.UUID, hours: float, 
                    f_s: FailureStatusEnum, priority: int) -> TTFData:
        """Create single TTFData record - ASYNC"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, component_id, hours, f_s, priority)
        return await self.async_service.run_in_thread(_create)

    def _create_bulk_sync(self, session: Session, component_id: uuid.UUID, 
                          ttf_values: List[float], priority: int,
                          status: FailureStatusEnum = FailureStatusEnum.FAILURE) -> List[TTFData]:
        """Create multiple TTFData records - SYNC"""
        try:
            records = []
            for hours in ttf_values:
                record = TTFData(
                    id=uuid.uuid4(),
                    component_id=component_id,
                    hours=hours,
                    f_s=status,
                    priority=priority
                )
                session.add(record)
                records.append(record)
            
            session.commit()
            for record in records:
                session.refresh(record)
            
            logger.info(f"Created {len(records)} TTFData records for component {component_id}")
            return records
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create bulk TTFData: {e}")
            raise

    async def create_bulk(self, component_id: uuid.UUID, ttf_values: List[float], 
                         priority: int, status: FailureStatusEnum = FailureStatusEnum.FAILURE) -> List[TTFData]:
        """Create multiple TTFData records - ASYNC"""
        def _create():
            with get_session_context() as session:
                return self._create_bulk_sync(session, component_id, ttf_values, priority, status)
        return await self.async_service.run_in_thread(_create)

    def _get_by_component_sync(self, session: Session, component_id: uuid.UUID) -> List[TTFData]:
        """Get all TTFData records for a component - SYNC"""
        try:
            statement = select(TTFData).where(TTFData.component_id == component_id)
            records = session.exec(statement).all()
            logger.info(f"Retrieved {len(records)} TTFData records for component {component_id}")
            return records
        except Exception as e:
            logger.error(f"Failed to retrieve TTFData: {e}")
            raise

    async def get_by_component(self, component_id: uuid.UUID) -> List[TTFData]:
        """Get all TTFData records for a component - ASYNC"""
        def _get():
            with get_session_context() as session:
                return self._get_by_component_sync(session, component_id)
        return await self.async_service.run_in_thread(_get)

    def _get_by_priority_sync(self, session: Session, component_id: uuid.UUID, priority: int) -> List[TTFData]:
        """Get TTFData records for a component and priority - SYNC"""
        try:
            statement = select(TTFData).where(
                TTFData.component_id == component_id,
                TTFData.priority == priority
            )
            records = session.exec(statement).all()
            logger.info(f"Retrieved {len(records)} TTFData records for component {component_id}, priority {priority}")
            return records
        except Exception as e:
            logger.error(f"Failed to retrieve TTFData by priority: {e}")
            raise

    async def get_by_priority(self, component_id: uuid.UUID, priority: int) -> List[TTFData]:
        """Get TTFData records for a component and priority - ASYNC"""
        def _get():
            with get_session_context() as session:
                return self._get_by_priority_sync(session, component_id, priority)
        return await self.async_service.run_in_thread(_get)

    def _get_all_sync(self, session: Session) -> List[TTFData]:
        """Get all TTFData records - SYNC"""
        return session.exec(select(TTFData)).all()

    async def get_all(self) -> List[TTFData]:
        """Get all TTFData records - ASYNC"""
        def _get():
            with get_session_context() as session:
                return self._get_all_sync(session)
        return await self.async_service.run_in_thread(_get)