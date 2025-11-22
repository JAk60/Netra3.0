import sys
sys.path.append('..')
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from api.models.sensor import (
    FailureMode, FailureModeCreate, FailureModeRead, FailureModeUpdate
)
from api.db.connection import get_session_context, get_async_db_service


class FailureModeRepository:
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()
    # ======================
    # CREATE
    # ======================
    def _create_failure_mode_sync(self, session: Session, failure_data: FailureModeCreate) -> FailureModeRead:
            """Synchronous failure mode creation"""
            
            # Check if failure mode with same name exists for this component
            statement = select(FailureMode).where(
                FailureMode.name == failure_data.name,
                FailureMode.component_id == failure_data.component_id
            )
            existing = session.exec(statement).first()
            
            if existing:
                raise ValueError(
                    f"Failure mode with name '{failure_data.name}' already exists for this component"
                )
            
            # Create failure mode
            failure_mode = FailureMode(**failure_data.model_dump())
            session.add(failure_mode)
            session.commit()
            session.refresh(failure_mode)
            
            # Convert to Pydantic model BEFORE session closes
            return FailureModeRead.model_validate(failure_mode)
    
    async def create_failure_mode(self, failure_data: FailureModeCreate) -> FailureMode:
        """Async failure mode creation"""
        def _create():
            with get_session_context() as session:
                return self._create_failure_mode_sync(session, failure_data)
        
        return await self.async_service.run_in_thread(_create)

    # ======================
    # GET ALL
    # ======================
    def _get_failure_modes_sync(self, session: Session, skip: int = 0, limit: int = 100) -> List[FailureMode]:
        statement = select(FailureMode).offset(skip).limit(limit)
        return session.exec(statement).all()

    async def get_failure_modes(self, skip: int = 0, limit: int = 100) -> List[FailureMode]:
        def _get():
            with get_session_context() as session:
                return self._get_failure_modes_sync(session, skip, limit)

        return await self.async_service.run_in_thread(_get)

    # ======================
    # GET BY ID
    # ======================
    def _get_failure_mode_by_id_sync(self, session: Session, failuremode_id: UUID) -> Optional[FailureMode]:
        return session.get(FailureMode, failuremode_id)

    async def get_failure_mode_by_id(self, failuremode_id: UUID) -> Optional[FailureMode]:
        def _get():
            with get_session_context() as session:
                return self._get_failure_mode_by_id_sync(session, failuremode_id)

        return await self.async_service.run_in_thread(_get)

    # ======================
    # GET BY SENSOR ID
    # ======================
    def _get_failure_modes_by_sensor_sync(self, session: Session, sensor_id: str) -> List[FailureMode]:
        statement = select(FailureMode).where(FailureMode.sensor_id == sensor_id)
        return session.exec(statement).all()

    async def get_failure_modes_by_sensor(self, sensor_id: str) -> List[FailureMode]:
        def _get():
            with get_session_context() as session:
                return self._get_failure_modes_by_sensor_sync(session, sensor_id)

        return await self.async_service.run_in_thread(_get)

    # ======================
    # UPDATE
    # ======================
    def _update_failure_mode_sync(self, session: Session, failuremode_id: UUID, failure_update: FailureModeUpdate) -> Optional[FailureMode]:
        failure_mode = session.get(FailureMode, failuremode_id)
        if not failure_mode:
            return None

        update_data = failure_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(failure_mode, key, value)

        session.add(failure_mode)
        session.commit()
        session.refresh(failure_mode)
        return failure_mode

    async def update_failure_mode(self, failuremode_id: UUID, failure_update: FailureModeUpdate) -> Optional[FailureMode]:
        def _update():
            with get_session_context() as session:
                return self._update_failure_mode_sync(session, failuremode_id, failure_update)

        return await self.async_service.run_in_thread(_update)

    # ======================
    # DELETE
    # ======================
    def _delete_failure_mode_sync(self, session: Session, failuremode_id: UUID) -> bool:
        failure_mode = session.get(FailureMode, failuremode_id)
        if not failure_mode:
            return False

        session.delete(failure_mode)
        session.commit()
        return True

    async def delete_failure_mode(self, failuremode_id: UUID) -> bool:
        def _delete():
            with get_session_context() as session:
                return self._delete_failure_mode_sync(session, failuremode_id)

        return await self.async_service.run_in_thread(_delete)
