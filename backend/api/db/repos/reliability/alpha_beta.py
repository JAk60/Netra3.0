import sys
sys.path.append('..')
from typing import List, Optional
import uuid
from sqlmodel import SQLModel, Session, select
from api.models import (
    AlphaBeta
)
from api.models.reliability.params import AlphaBetaRead
from api.db.connection import get_session_context, get_async_db_service
import logging

# Import your naval ship models (adjust import path as needed)

logger = logging.getLogger(__name__)
class AlphaBetaUpdate(SQLModel):
    alpha: Optional[float] = None
    beta: Optional[float] = None
    component_id: Optional[uuid.UUID] = None

class AlphaBetaRepository:
    """Repository for AlphaBeta operations"""

    def __init__(
        self,
        session: Optional[Session] = None,
        async_service=None
    ):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, data: AlphaBeta) -> AlphaBeta:
        try:
            session.add(data)
            session.commit()
            session.refresh(data)
            logger.info(
                f"Created AlphaBeta record for component: {data.component_id}")
            return data
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create AlphaBeta: {e}")
            raise

    async def create(self, data: AlphaBeta) -> AlphaBeta:
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, data)
        return await self.async_service.run_in_thread(_create)

    def _get_all_sync(self, session: Session) -> List[AlphaBeta]:
        return session.exec(select(AlphaBeta)).all()

    async def get_all(self) -> List[AlphaBeta]:
        def _fetch():
            with get_session_context() as session:
                return self._get_all_sync(session)
        return await self.async_service.run_in_thread(_fetch)

    def _get_alphabeta_by_component_id_sync(self, session: Session, component_id: uuid.UUID) -> List[AlphaBetaRead]:
        statement = select(AlphaBeta).where(
            AlphaBeta.component_id == component_id)
        results = session.exec(statement).all()
        # 👈 serialize before session closes
        return [AlphaBetaRead.model_validate(r) for r in results]

    async def get_alphabeta_by_component_id(self, component_id: uuid.UUID) -> List[AlphaBetaRead]:
        def _fetch():
            with get_session_context() as session:
                return self._get_alphabeta_by_component_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_fetch)
    
    def _update_alphabeta_by_component_id_sync(self, session: Session, component_id: uuid.UUID, update_data: AlphaBetaUpdate) -> List[AlphaBetaRead]:
        """Synchronous function to update AlphaBeta records by component_id."""
        statement = select(AlphaBeta).where(AlphaBeta.component_id == component_id)
        alphabeta_records = session.exec(statement).all()
        
        if not alphabeta_records:
            raise ValueError(f"No AlphaBeta records found for component_id {component_id}")
        
        # Update only provided fields for all records
        update_dict = update_data.model_dump(exclude_unset=True)
        updated_records = []
        
        for alphabeta in alphabeta_records:
            for key, value in update_dict.items():
                setattr(alphabeta, key, value)
            session.add(alphabeta)
            updated_records.append(alphabeta)
        
        session.commit()
        
        # Refresh and serialize before session closes
        for record in updated_records:
            session.refresh(record)
        
        return [AlphaBetaRead.model_validate(r) for r in updated_records]

    async def update_alphabeta_by_component_id(self, component_id: uuid.UUID, update_data: AlphaBetaUpdate) -> List[AlphaBetaRead]:
        """Async wrapper to update AlphaBeta records by component_id."""
        def _update():
            with get_session_context() as session:
                return self._update_alphabeta_by_component_id_sync(session, component_id, update_data)
        return await self.async_service.run_in_thread(_update)