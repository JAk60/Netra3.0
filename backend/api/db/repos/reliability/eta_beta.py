import sys
sys.path.append('..')
from typing import List, Optional
import uuid
from sqlmodel import SQLModel, Session, select
from api.models import (
    EtaBeta
)
from api.models.reliability import EtaBetaRead
from api.db.connection import get_session_context, get_async_db_service
import logging

# Import your naval ship models (adjust import path as needed)

logger = logging.getLogger(__name__)
class AlphaBetaUpdate(SQLModel):
    alpha: Optional[float] = None
    beta: Optional[float] = None
    component_id: Optional[uuid.UUID] = None

class EtaBetaRepository:
    """Repository for EtaBeta operations"""

    def __init__(
        self,
        session: Optional[Session] = None,
        async_service=None
    ):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, data: EtaBeta) -> EtaBeta:
        try:
            session.add(data)
            session.commit()
            session.refresh(data)
            logger.info(
                f"Created EtaBeta record for component: {data.component_id}")
            return data
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create EtaBeta: {e}")
            raise

    async def create(self, data: EtaBeta) -> EtaBeta:
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, data)
        return await self.async_service.run_in_thread(_create)

    def _get_all_sync(self, session: Session) -> List[EtaBeta]:
        return session.exec(select(EtaBeta)).all()

    async def get_all(self) -> List[EtaBeta]:
        def _fetch():
            with get_session_context() as session:
                return self._get_all_sync(session)
        return await self.async_service.run_in_thread(_fetch)

    def _get_by_component_id_sync(self, session: Session, component_id: uuid.UUID) -> List[EtaBetaRead]:
        statement = select(EtaBeta).where(EtaBeta.component_id == component_id)
        results=session.exec(statement).all()
        return [EtaBetaRead.model_validate(r) for r in results]

    async def get_by_component_id(self, component_id: uuid.UUID) -> List[EtaBeta]:
        def _fetch():
            with get_session_context() as session:
                return self._get_by_component_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_fetch)

