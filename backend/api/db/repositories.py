import sys
sys.path.append('..')
from typing import List, Optional
from unittest import result
from uuid import UUID
from typing import TYPE_CHECKING
import uuid
from sqlalchemy import func
from sqlmodel import Session, select
from api.models import (
    AlphaBeta, EtaBeta, SystemConfiguration, Ship, Department,
    User, RefreshToken
)
from api.models.reliability import AlphaBetaRead, EtaBetaRead
from api.models.systemconfiguration import (
    BulkComponentCreate, BulkOperationResult, ComponentHierarchyStats,
    ComponentSearchFilter, DepartmentCreate, DepartmentStats, DepartmentUpdate,
    ShipCreate, ShipSearchFilter, ShipStats, ShipUpdate,ShipRead,
    SystemConfigurationCreate, SystemConfigurationRead, SystemConfigurationUpdate
)
from api.models.sensor import (
    FailureMode, FailureModeCreate, FailureModeUpdate, 
    SensorMetadata, SensorMetadataCreate, SensorMetadataUpdate, 
    SensorReading, SensorReadingCreate
)
from api.models.users import User, UserCreate, UserUpdate, RefreshToken
from db.connection import get_session_context, get_async_db_service
from auth.security import auth_service
from datetime import datetime
from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import logging

# Import your naval ship models (adjust import path as needed)
from api.models import SystemConfiguration, Ship, Department

logger = logging.getLogger(__name__)


class UserRepository:
    def _create_user_sync(self, session: Session, user_data: UserCreate) -> User:
        """Synchronous user creation"""
        # Check if user exists
        statement = select(User).where(
            (User.email == user_data.email) | (
                User.username == user_data.username)
        )
        existing_user = session.exec(statement).first()

        if existing_user:
            raise ValueError("User with this email or username already exists")

        # Create user
        hashed_password = auth_service.get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            role=user_data.role,
            hashed_password=hashed_password
        )

        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    async def create_user(self, user_data: UserCreate) -> User:
        """Async user creation"""
        def _create():
            with get_session_context() as session:
                return self._create_user_sync(session, user_data)

        return await get_async_db_service.run_in_thread(_create)

    def _get_users_sync(self, session: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Synchronous user listing"""
        statement = select(User).offset(skip).limit(limit)
        return session.exec(statement).all()

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Async user listing"""
        def _get():
            with get_session_context() as session:
                return self._get_users_sync(session, skip, limit)

        return await get_async_db_service.run_in_thread(_get)

    def _get_user_by_id_sync(self, session: Session, user_id: int) -> Optional[User]:
        """Synchronous user retrieval by ID"""
        return session.get(User, user_id)

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Async user retrieval by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_user_by_id_sync(session, user_id)

        return await get_async_db_service.run_in_thread(_get)

    def _update_user_sync(self, session: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Synchronous user update"""
        user = session.get(User, user_id)
        if not user:
            return None

        update_data = user_update.dict(exclude_unset=True)

        if "password" in update_data:
            update_data["hashed_password"] = auth_service.get_password_hash(
                update_data.pop("password"))

        update_data["updated_at"] = datetime.utcnow()

        for key, value in update_data.items():
            setattr(user, key, value)

        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    async def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Async user update"""
        def _update():
            with get_session_context() as session:
                return self._update_user_sync(session, user_id, user_update)

        return await get_async_db_service.run_in_thread(_update)

    def _delete_user_sync(self, session: Session, user_id: int) -> bool:
        """Synchronous user deletion"""
        user = session.get(User, user_id)
        if not user:
            return False

        session.delete(user)
        session.commit()
        return True

    async def delete_user(self, user_id: int) -> bool:
        """Async user deletion"""
        def _delete():
            with get_session_context() as session:
                return self._delete_user_sync(session, user_id)

        return await get_async_db_service.run_in_thread(_delete)

    def _update_last_login_sync(self, session: Session, user_id: int) -> None:
        """Synchronous last login update"""
        user = session.get(User, user_id)
        if user:
            user.last_login = datetime.utcnow()
            session.add(user)
            session.commit()

    async def update_last_login(self, user_id: int) -> None:
        """Async last login update"""
        def _update():
            with get_session_context() as session:
                return self._update_last_login_sync(session, user_id)

        await get_async_db_service.run_in_thread(_update)


class TokenRepository:
    def _get_refresh_token_sync(self, session: Session, token: str) -> Optional[RefreshToken]:
        """Synchronous refresh token retrieval"""
        statement = select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.is_revoked == False
        )
        return session.exec(statement).first()

    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        """Async refresh token retrieval"""
        def _get():
            with get_session_context() as session:
                return self._get_refresh_token_sync(session, token)

        return await get_async_db_service.run_in_thread(_get)

    def _revoke_refresh_token_sync(self, session: Session, token: str, user_id: int) -> bool:
        """Synchronous refresh token revocation"""
        statement = select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False
        )
        refresh_token = session.exec(statement).first()

        if refresh_token:
            refresh_token.is_revoked = True
            session.add(refresh_token)
            session.commit()
            return True
        return False

    async def revoke_refresh_token(self, token: str, user_id: int) -> bool:
        """Async refresh token revocation"""
        def _revoke():
            with get_session_context() as session:
                return self._revoke_refresh_token_sync(session, token, user_id)

        return await get_async_db_service.run_in_thread(_revoke)



class FailureModeRepository:
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()
    # ======================
    # CREATE
    # ======================
    def _create_failure_mode_sync(self, session: Session, failure_data: FailureModeCreate) -> FailureMode:
        failure_mode = FailureMode(**failure_data.model_dump())
        session.add(failure_mode)
        session.commit()
        session.refresh(failure_mode)
        return failure_mode

    async def create_failure_mode(self, failure_data: FailureModeCreate) -> FailureMode:
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

class SensorRepository:
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()
    # SENSOR METADATA OPERATIONS
    def _create_sensor_sync(self, session: Session, sensor_data: SensorMetadataCreate) -> SensorMetadata:
        """Synchronous sensor creation"""
        # Check if sensor already exists
        existing_sensor = session.get(SensorMetadata, sensor_data.sensor_id)
        if existing_sensor:
            raise ValueError(
                f"Sensor with ID {sensor_data.sensor_id} already exists")

        # Create sensor
        sensor = SensorMetadata(**sensor_data.model_dump())
        session.add(sensor)
        session.commit()
        session.refresh(sensor)
        return sensor

    async def create_sensor(self, sensor_data: SensorMetadataCreate) -> SensorMetadata:
        """Async sensor creation"""
        def _create():
            with get_session_context() as session:
                return self._create_sensor_sync(session, sensor_data)

        return await self.async_service.run_in_thread(_create)

    def _get_sensors_sync(self, session: Session, skip: int = 0, limit: int = 100) -> List[SensorMetadata]:
        """Synchronous sensor listing"""
        statement = select(SensorMetadata).offset(skip).limit(limit)
        return session.exec(statement).all()

    async def get_sensors(self, skip: int = 0, limit: int = 100) -> List[SensorMetadata]:
        """Async sensor listing"""
        def _get():
            with get_session_context() as session:
                return self._get_sensors_sync(session, skip, limit)

        return await self.async_service.run_in_thread(_get)

    def _get_sensor_by_id_sync(self, session: Session, sensor_id: str) -> Optional[SensorMetadata]:
        """Synchronous sensor retrieval by ID"""
        return session.get(SensorMetadata, sensor_id)

    async def get_sensor_by_id(self, sensor_id: str) -> Optional[SensorMetadata]:
        """Async sensor retrieval by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_sensor_by_id_sync(session, sensor_id)

        return await self.async_service.run_in_thread(_get)

    def _get_sensors_by_component_sync(self, session: Session, component_id: str) -> List[SensorMetadata]:
        """Synchronous sensors by component"""
        statement = select(SensorMetadata).where(
            SensorMetadata.component_id == component_id)
        return session.exec(statement).all()

    async def get_sensors_by_component(self, component_id: str) -> List[SensorMetadata]:
        """Async sensors by component"""
        def _get():
            with get_session_context() as session:
                return self._get_sensors_by_component_sync(session, component_id)

        return await self.async_service.run_in_thread(_get)

    def _update_sensor_sync(self, session: Session, sensor_id: str, sensor_update: SensorMetadataUpdate) -> Optional[SensorMetadata]:
        """Synchronous sensor update"""
        sensor = session.get(SensorMetadata, sensor_id)
        if not sensor:
            return None

        update_data = sensor_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(sensor, key, value)

        session.add(sensor)
        session.commit()
        session.refresh(sensor)
        return sensor

    async def update_sensor(self, sensor_id: str, sensor_update: SensorMetadataUpdate) -> Optional[SensorMetadata]:
        """Async sensor update"""
        def _update():
            with get_session_context() as session:
                return self._update_sensor_sync(session, sensor_id, sensor_update)

        return await self.async_service.run_in_thread(_update)

    def _delete_sensor_sync(self, session: Session, sensor_id: str) -> bool:
        """Synchronous sensor deletion"""
        sensor = session.get(SensorMetadata, sensor_id)
        if not sensor:
            return False

        session.delete(sensor)
        session.commit()
        return True

    async def delete_sensor(self, sensor_id: str) -> bool:
        """Async sensor deletion"""
        def _delete():
            with get_session_context() as session:
                return self._delete_sensor_sync(session, sensor_id)

        return await self.async_service.run_in_thread(_delete)


class SensorReadingRepository:
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_reading_sync(self, session: Session, reading_data: SensorReadingCreate) -> SensorReading:
        """Synchronous reading creation"""
        # Validate sensor exists
        sensor = session.get(SensorMetadata, reading_data.sensor_id)
        if not sensor:
            raise ValueError(
                f"Sensor with ID {reading_data.sensor_id} not found")

        # Check if value is within sensor range and set alert
        reading_dict = reading_data.model_dump()
        if reading_dict['value'] < sensor.min_value or reading_dict['value'] > sensor.max_value:
            reading_dict['alert'] = True

        # Create reading
        reading = SensorReading(**reading_dict)
        session.add(reading)
        session.commit()
        session.refresh(reading)
        return reading

    async def create_reading(self, reading_data: SensorReadingCreate) -> SensorReading:
        """Async reading creation"""
        def _create():
            with get_session_context() as session:
                return self._create_reading_sync(session, reading_data)

        return await self.async_service.run_in_thread(_create)

    def _get_readings_sync(
        self,
        session: Session,
        sensor_id: Optional[str] = None,
        component_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[SensorReading]:
        """Synchronous readings with filters"""
        statement = select(SensorReading)

        if sensor_id:
            statement = statement.where(SensorReading.sensor_id == sensor_id)
        if component_id:
            statement = statement.where(
                SensorReading.component_id == component_id)
        if start_date:
            statement = statement.where(SensorReading.date >= start_date)
        if end_date:
            statement = statement.where(SensorReading.date <= end_date)

        statement = statement.offset(skip).limit(
            limit).order_by(SensorReading.date.desc())
        return session.exec(statement).all()

    async def get_readings(
        self,
        sensor_id: Optional[str] = None,
        component_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[SensorReading]:
        """Async readings with filters"""
        def _get():
            with get_session_context() as session:
                return self._get_readings_sync(session, sensor_id, component_id, start_date, end_date, skip, limit)

        return await self.async_service.run_in_thread(_get)

    def _get_latest_readings_sync(self, session: Session, limit: int = 50) -> List[SensorReading]:
        """Synchronous latest readings"""
        statement = select(SensorReading).order_by(
            SensorReading.date.desc()).limit(limit)
        return session.exec(statement).all()

    async def get_latest_readings(self, limit: int = 50) -> List[SensorReading]:
        """Async latest readings"""
        def _get():
            with get_session_context() as session:
                return self._get_latest_readings_sync(session, limit)

        return await self.async_service.run_in_thread(_get)

    def _get_active_alerts_sync(self, session: Session) -> List[SensorReading]:
        """Synchronous active alerts"""
        statement = select(SensorReading).where(
            SensorReading.alert == True).order_by(SensorReading.date.desc())
        return session.exec(statement).all()

    async def get_active_alerts(self) -> List[SensorReading]:
        """Async active alerts"""
        def _get():
            with get_session_context() as session:
                return self._get_active_alerts_sync(session)

        return await self.async_service.run_in_thread(_get)

    def _get_sensor_stats_sync(self, session: Session, sensor_id: str) -> Optional[dict]:
        """Synchronous sensor statistics"""
        statement = select(
            func.count(SensorReading.id).label("total_readings"),
            func.avg(SensorReading.value).label("avg_value"),
            func.min(SensorReading.value).label("min_value"),
            func.max(SensorReading.value).label("max_value"),
            func.sum(func.cast(SensorReading.alert, int)).label("alert_count"),
            func.max(SensorReading.date).label("last_reading_date")
        ).where(SensorReading.sensor_id == sensor_id)

        result = session.exec(statement).first()
        if result and result.total_readings > 0:
            return {
                "sensor_id": sensor_id,
                "total_readings": result.total_readings,
                "avg_value": float(result.avg_value),
                "min_value": float(result.min_value),
                "max_value": float(result.max_value),
                "alert_count": result.alert_count,
                "last_reading_date": result.last_reading_date
            }
        return None

    async def get_sensor_stats(self, sensor_id: str) -> Optional[dict]:
        """Async sensor statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_sensor_stats_sync(session, sensor_id)

        return await self.async_service.run_in_thread(_get)

    def _bulk_create_readings_sync(self, session: Session, readings_data: List[SensorReadingCreate]) -> List[SensorReading]:
        """Synchronous bulk reading creation"""
        readings = []
        for reading_data in readings_data:
            # Validate sensor exists
            sensor = session.get(SensorMetadata, reading_data.sensor_id)
            if not sensor:
                continue  # Skip invalid sensors

            # Check range and set alert
            reading_dict = reading_data.model_dump()
            if reading_dict['value'] < sensor.min_value or reading_dict['value'] > sensor.max_value:
                reading_dict['alert'] = True

            readings.append(SensorReading(**reading_dict))

        session.add_all(readings)
        session.commit()
        for reading in readings:
            session.refresh(reading)
        return readings

    async def bulk_create_readings(self, readings_data: List[SensorReadingCreate]) -> List[SensorReading]:
        """Async bulk reading creation"""
        def _create():
            with get_session_context() as session:
                return self._bulk_create_readings_sync(session, readings_data)

        return await self.async_service.run_in_thread(_create)


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

    def _get_by_component_id_sync(self, session: Session, component_id: uuid.UUID) -> List[AlphaBetaRead]:
        statement = select(AlphaBeta).where(
            AlphaBeta.component_id == component_id)
        results = session.exec(statement).all()
        # 👈 serialize before session closes
        return [AlphaBetaRead.model_validate(r) for r in results]

    async def get_by_component_id(self, component_id: uuid.UUID) -> List[AlphaBetaRead]:
        def _fetch():
            with get_session_context() as session:
                return self._get_by_component_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_fetch)
