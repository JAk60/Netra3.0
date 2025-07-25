import sys
sys.path.append('..')
from typing import List, Optional
from unittest import result
from uuid import UUID
from typing import TYPE_CHECKING
import uuid
from sqlalchemy import func
from sqlmodel import Session, select
from backend.api.models import (
    AlphaBeta, EtaBeta, SystemConfiguration, Ship, Department,
    User, RefreshToken
)
from backend.api.models.reliability import AlphaBetaRead, EtaBetaRead
from backend.api.models.systemconfiguration import (
    BulkComponentCreate, BulkOperationResult, ComponentHierarchyStats,
    ComponentSearchFilter, DepartmentCreate, DepartmentStats, DepartmentUpdate,
    ShipCreate, ShipSearchFilter, ShipStats, ShipUpdate,ShipRead,
    SystemConfigurationCreate, SystemConfigurationRead, SystemConfigurationUpdate
)
from backend.api.models.sensor import (
    FailureMode, FailureModeCreate, FailureModeUpdate, 
    SensorMetadata, SensorMetadataCreate, SensorMetadataUpdate, 
    SensorReading, SensorReadingCreate
)
from backend.api.models.users import User, UserCreate, UserUpdate, RefreshToken
from db.connection import get_session_context, get_async_db_service
from auth.security import auth_service
from datetime import datetime
from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import logging

# Import your naval ship models (adjust import path as needed)
from backend.api.models import SystemConfiguration, Ship, Department

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


class ShipRepository:
    """Repository for Ship operations with async wrapper pattern"""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_ship_sync(self, session: Session, ship_data: ShipCreate) -> Ship:
        """Synchronous ship creation"""
        try:
            ship = Ship(**ship_data.model_dump())
            session.add(ship)
            session.commit()
            session.refresh(ship)
            logger.info(f"Created ship: {ship.ship_name} (ID: {ship.ship_id})")
            return ship
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create ship: {e}")
            raise

    async def create_ship(self, ship_data: ShipCreate) -> Ship:
        """Async ship creation"""
        def _create():
            with get_session_context() as session:
                return self._create_ship_sync(session, ship_data)

        return await self.async_service.run_in_thread(_create)

    def _get_ship_by_id_sync(self, session: Session, ship_id: int) -> Optional[Ship]:
        """Synchronous get ship by ID"""
        try:
            statement = select(Ship).where(Ship.ship_id == ship_id)
            return session.exec(statement).first()
        except Exception as e:
            logger.error(f"Failed to get ship by ID {ship_id}: {e}")
            raise

    async def get_ship_by_id(self, ship_id: int) -> Optional[Ship]:
        """Async get ship by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_ship_by_id_sync(session, ship_id)

        return await self.async_service.run_in_thread(_get)

    def _get_ship_by_name_sync(self, session: Session, ship_name: str) -> Optional[Ship]:
        """Synchronous get ship by name"""
        try:
            statement = select(Ship).where(Ship.ship_name == ship_name)
            return session.exec(statement).first()
        except Exception as e:
            logger.error(f"Failed to get ship by name {ship_name}: {e}")
            raise

    async def get_ship_by_name(self, ship_name: str) -> Optional[Ship]:
        """Async get ship by name"""
        def _get():
            with get_session_context() as session:
                return self._get_ship_by_name_sync(session, ship_name)

        return await self.async_service.run_in_thread(_get)

    def _get_all_ships_sync(self, session: Session, skip: int = 0, limit: int = 100) -> List[ShipRead]:
        """Synchronous get all ships with pagination"""
        try:
            # Add ORDER BY clause - using created_date for consistent ordering
            statement = select(Ship).order_by(Ship.created_date).offset(skip).limit(limit)
            ships = list(session.exec(statement))
            
            # Convert to Pydantic models while session is active
            return [ShipRead.model_validate(ship) for ship in ships]
            
        except Exception as e:
            logger.error(f"Failed to get all ships: {e}")
            raise

    async def get_all_ships(self, skip: int = 0, limit: int = 100) -> List[ShipRead]:
        """Async get all ships with pagination"""
        def _get():
            with get_session_context() as session:
                return self._get_all_ships_sync(session, skip, limit)

        return await self.async_service.run_in_thread(_get)
    
    def _get_all_ship_names_sync(self, session: Session, skip: int = 0, limit: int = 100) -> List[str]:
        """Synchronous get all ships with pagination"""
        try:
            statement = select(Ship.ship_name).offset(skip).limit(limit)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(f"Failed to get all ships: {e}")
            raise

    async def get_all_ship_names(self, skip: int = 0, limit: int = 100) -> List[str]:
        """Async get all ships with pagination"""
        def _get():
            with get_session_context() as session:
                return self._get_all_ship_names_sync(session, skip, limit)

        return await self.async_service.run_in_thread(_get)

    def _search_ships_sync(self, session: Session, filters: ShipSearchFilter, skip: int = 0, limit: int = 100) -> List[Ship]:
        """Synchronous search ships with filters"""
        try:
            statement = select(Ship)
            conditions = []

            if filters.ship_name:
                conditions.append(Ship.ship_name.ilike(
                    f"%{filters.ship_name}%"))
            if filters.ship_category:
                conditions.append(Ship.ship_category == filters.ship_category)
            if filters.ship_class:
                conditions.append(Ship.ship_class == filters.ship_class)
            if filters.command:
                conditions.append(Ship.command == filters.command)

            if conditions:
                statement = statement.where(and_(*conditions))

            statement = statement.offset(skip).limit(limit)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(f"Failed to search ships: {e}")
            raise

    async def search_ships(self, filters: ShipSearchFilter, skip: int = 0, limit: int = 100) -> List[Ship]:
        """Async search ships with filters"""
        def _search():
            with get_session_context() as session:
                return self._search_ships_sync(session, filters, skip, limit)

        return await self.async_service.run_in_thread(_search)

    def _update_ship_sync(self, session: Session, ship_id: int, ship_data: ShipUpdate) -> Optional[Ship]:
        """Synchronous update ship"""
        try:
            ship = self._get_ship_by_id_sync(session, ship_id)
            if not ship:
                return None

            update_data = ship_data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(ship, key, value)

            ship.modified_date = datetime.utcnow()
            session.commit()
            session.refresh(ship)
            logger.info(f"Updated ship: {ship.ship_name} (ID: {ship.ship_id})")
            return ship
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to update ship {ship_id}: {e}")
            raise

    async def update_ship(self, ship_id: int, ship_data: ShipUpdate) -> Optional[Ship]:
        """Async update ship"""
        def _update():
            with get_session_context() as session:
                return self._update_ship_sync(session, ship_id, ship_data)

        return await self.async_service.run_in_thread(_update)

    def _delete_ship_sync(self, session: Session, ship_id: int) -> bool:
        """Synchronous delete ship (cascade delete departments and components)"""
        try:
            ship = self._get_ship_by_id_sync(session, ship_id)
            if not ship:
                return False

            session.delete(ship)
            session.commit()
            logger.info(f"Deleted ship: {ship.ship_name} (ID: {ship.ship_id})")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to delete ship {ship_id}: {e}")
            raise

    async def delete_ship(self, ship_id: int) -> bool:
        """Async delete ship (cascade delete departments and components)"""
        def _delete():
            with get_session_context() as session:
                return self._delete_ship_sync(session, ship_id)

        return await self.async_service.run_in_thread(_delete)

    def _get_ship_stats_sync(self, session: Session, ship_id: int) -> Optional[ShipStats]:
        """Synchronous get ship statistics"""
        try:
            ship = self._get_ship_by_id_sync(session, ship_id)
            if not ship:
                return None

            # Count departments
            dept_count = session.exec(
                select(func.count(Department.department_id))
                .where(Department.ship_id == ship_id)
            ).first()

            # Count components by department
            component_stats = session.exec(
                select(
                    Department.department_name,
                    func.count(SystemConfiguration.component_id).label('count')
                )
                .join(SystemConfiguration)
                .where(Department.ship_id == ship_id)
                .group_by(Department.department_name)
            ).all()

            total_components = sum(stat.count for stat in component_stats)
            components_by_dept = {
                stat.department_name: stat.count for stat in component_stats
            }

            return ShipStats(
                ship_id=ship_id,
                ship_name=ship.ship_name,
                total_departments=dept_count or 0,
                total_components=total_components,
                components_by_department=components_by_dept
            )
        except Exception as e:
            logger.error(f"Failed to get ship stats for {ship_id}: {e}")
            raise

    async def get_ship_stats(self, ship_id: int) -> Optional[ShipStats]:
        """Async get ship statistics"""
        def _get_stats():
            with get_session_context() as session:
                return self._get_ship_stats_sync(session, ship_id)

        return await self.async_service.run_in_thread(_get_stats)


class DepartmentRepository:
    """Repository for Department operations"""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, department_data: DepartmentCreate) -> Department:
        """Synchronous department creation"""
        try:
            department = Department(**department_data.dict())
            session.add(department)
            session.commit()
            session.refresh(department)
            logger.info(
                f"Created department: {department.department_name} (ID: {department.department_id})")
            return department
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create department: {e}")
            raise

    async def create(self, department_data: DepartmentCreate) -> Department:
        """Async department creation"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, department_data)
        return await self.async_service.run_in_thread(_create)

    def _get_by_id_sync(self, session: Session, department_id: int) -> Optional[Department]:
        """Synchronous get department by ID"""
        try:
            statement = select(Department).where(
                Department.department_id == department_id)
            return session.exec(statement).first()
        except Exception as e:
            logger.error(
                f"Failed to get department by ID {department_id}: {e}")
            raise

    async def get_by_id(self, department_id: int) -> Optional[Department]:
        """Async get department by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_by_id_sync(session, department_id)
        return await get_async_db_service.run_in_thread(_get)

    def _get_by_ship_sync(self, session: Session, ship_id: int) -> List[Department]:
        """Synchronous get all departments for a ship"""
        try:
            statement = select(Department).where(Department.ship_id == ship_id)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(f"Failed to get departments for ship {ship_id}: {e}")
            raise

    async def get_by_ship(self, ship_id: int) -> List[Department]:
        """Async get all departments for a ship"""
        def _get():
            with get_session_context() as session:
                return self._get_by_ship_sync(session, ship_id)
        return await get_async_db_service.run_in_thread(_get)

    def _get_by_ship_and_name_sync(self, session: Session, ship_id: int, department_name: str) -> Optional[Department]:
        """Synchronous get department by ship and name (unique constraint)"""
        try:
            statement = select(Department).where(
                and_(
                    Department.ship_id == ship_id,
                    Department.department_name == department_name
                )
            )
            return session.exec(statement).first()
        except Exception as e:
            logger.error(f"Failed to get department by ship and name: {e}")
            raise

    async def get_by_ship_and_name(self, ship_id: int, department_name: str) -> Optional[Department]:
        """Async get department by ship and name (unique constraint)"""
        def _get():
            with get_session_context() as session:
                return self._get_by_ship_and_name_sync(session, ship_id, department_name)
        return await get_async_db_service.run_in_thread(_get)

    def _update_sync(self, session: Session, department_id: int, department_data: DepartmentUpdate) -> Optional[Department]:
        """Synchronous update department"""
        try:
            department = self._get_by_id_sync(session, department_id)
            if not department:
                return None

            update_data = department_data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(department, key, value)

            department.modified_date = datetime.utcnow()
            session.commit()
            session.refresh(department)
            logger.info(
                f"Updated department: {department.department_name} (ID: {department.department_id})")
            return department
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to update department {department_id}: {e}")
            raise

    async def update(self, department_id: int, department_data: DepartmentUpdate) -> Optional[Department]:
        """Async update department"""
        def _update():
            with get_session_context() as session:
                return self._update_sync(session, department_id, department_data)
        return await get_async_db_service.run_in_thread(_update)

    def _delete_sync(self, session: Session, department_id: int) -> bool:
        """Synchronous delete department (cascade delete components)"""
        try:
            department = self._get_by_id_sync(session, department_id)
            if not department:
                return False

            session.delete(department)
            session.commit()
            logger.info(
                f"Deleted department: {department.department_name} (ID: {department.department_id})")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to delete department {department_id}: {e}")
            raise

    async def delete(self, department_id: int) -> bool:
        """Async delete department (cascade delete components)"""
        def _delete():
            with get_session_context() as session:
                return self._delete_sync(session, department_id)
        return await get_async_db_service.run_in_thread(_delete)

    def _get_stats_sync(self, session: Session, department_id: int) -> Optional[DepartmentStats]:
        """Synchronous get department statistics"""
        try:
            department = self._get_by_id_sync(session, department_id)
            if not department:
                return None

            # Get ship name
            ship = session.exec(
                select(Ship).where(Ship.ship_id == department.ship_id)
            ).first()

            # Count total components
            total_components = session.exec(
                select(func.count(SystemConfiguration.component_id))
                .where(SystemConfiguration.department_id == department_id)
            ).first()

            # Count root components (no parent)
            root_components = session.exec(
                select(func.count(SystemConfiguration.component_id))
                .where(
                    and_(
                        SystemConfiguration.department_id == department_id,
                        SystemConfiguration.parent_id.is_(None)
                    )
                )
            ).first()

            child_components = (total_components or 0) - (root_components or 0)

            return DepartmentStats(
                department_id=department_id,
                department_name=department.department_name,
                ship_name=ship.ship_name if ship else "Unknown",
                total_components=total_components or 0,
                root_components=root_components or 0,
                child_components=child_components
            )
        except Exception as e:
            logger.error(
                f"Failed to get department stats for {department_id}: {e}")
            raise

    async def get_stats(self, department_id: int) -> Optional[DepartmentStats]:
        """Async get department statistics"""
        def _get_stats():
            with get_session_context() as session:
                return self._get_stats_sync(session, department_id)
        return await get_async_db_service.run_in_thread(_get_stats)


class SystemConfigurationRepository:
    """Repository for SystemConfiguration operations"""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, component_data: SystemConfigurationCreate) -> SystemConfiguration:
        """Synchronous create a new component"""
        try:
            component = SystemConfiguration(**component_data.dict())
            session.add(component)
            session.commit()
            session.refresh(component)
            logger.info(
                f"Created component: {component.component_name} (ID: {component.component_id})")
            return component
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create component: {e}")
            raise

    async def create(self, component_data: SystemConfigurationCreate) -> SystemConfiguration:
        """Async create a new component"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, component_data)
        return await self.async_service.run_in_thread(_create)

    def _bulk_create_sync(self, session: Session, components_data: BulkComponentCreate) -> BulkOperationResult:
        """Synchronous create multiple components"""
        success_count = 0
        error_count = 0
        errors = []
        created_ids = []

        for component_data in components_data.components:
            try:
                component = SystemConfiguration(**component_data.dict())
                session.add(component)
                session.commit()
                success_count += 1
                created_ids.append(component.component_id)
            except Exception as e:
                error_count += 1
                errors.append(
                    f"Failed to create {component_data.component_id}: {str(e)}")
                session.rollback()

        return BulkOperationResult(
            success_count=success_count,
            error_count=error_count,
            errors=errors,
            created_ids=created_ids,
            updated_ids=[]
        )

    async def bulk_create(self, components_data: BulkComponentCreate) -> BulkOperationResult:
        """Async create multiple components"""
        def _bulk_create():
            with get_session_context() as session:
                return self._bulk_create_sync(session, components_data)
        return await self.async_service.run_in_thread(_bulk_create)

    def _get_by_id_sync(self, session: Session, component_id: str) -> Optional[SystemConfiguration]:
        """Synchronous get component by ID"""
        try:
            statement = select(SystemConfiguration).where(
                SystemConfiguration.component_id == component_id)
            return session.exec(statement).first()
        except Exception as e:
            logger.error(f"Failed to get component by ID {component_id}: {e}")
            raise

    async def get_by_id(self, component_id: str) -> Optional[SystemConfiguration]:
        """Async get component by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_by_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_get)
    
    def _get_nomenclatures_wrt_component_name_sync(self, session: Session, component_name: str) -> List[dict]:
        """Synchronous get component id and nomenclature by component name"""
        try:
            statement = select(
                SystemConfiguration.component_id,
                SystemConfiguration.nomenclature,
                Ship.ship_name
            ).join(
                Ship, SystemConfiguration.ship_id == Ship.ship_id
            ).where(
                SystemConfiguration.component_name == component_name
            )
            
            results = session.exec(statement).all()
            
            return [{"id": result[0], "nomenclature": result[1] , "ship_name": result[2]} for result in results]
            
        except Exception as e:
            logger.error(f"Failed to get component details for {component_name}: {e}")
            raise

    async def get_nomenclatures_wrt_component_name(self, component_name: str) -> List[dict]:
        """Async get component id and nomenclature by component name"""
        def _get():
            with get_session_context() as session:
                return self._get_nomenclatures_wrt_component_name_sync(session, component_name)
        return await self.async_service.run_in_thread(_get)   
     
    def _get_component_id_and_ship_name_by_nomenclature_sync(self, session: Session, nomenclature: str) -> list[tuple[str, str]]:
        """Synchronous get component ID by nomenclature"""
        try:
            statement = select(SystemConfiguration.component_id,Ship.ship_name
            ).join(
                Ship, SystemConfiguration.ship_id == Ship.ship_id
            ).where(
                SystemConfiguration.nomenclature == nomenclature)
            return session.exec(statement).all()
        except Exception as e:
            logger.error(f"Failed to get component ID by nomenclature {nomenclature}: {e}")
            raise

    async def get_component_id_and_ship_name_by_nomenclature(self, nomenclature: str) -> list[tuple[str, str]]:
        """Async get component ID by nomenclature"""
        def _get():
            with get_session_context() as session:
                return self._get_component_id_and_ship_name_by_nomenclature_sync(session, nomenclature)
        return await self.async_service.run_in_thread(_get)
    
    def _get_component_id_by_nomenclature_sync(self, session: Session, nomenclature: str) -> Optional[str]:
        """Synchronous get component ID by nomenclature"""
        try:
            statement = select(SystemConfiguration.component_id).where(
                SystemConfiguration.nomenclature == nomenclature)
            return session.exec(statement).all()
        except Exception as e:
            logger.error(f"Failed to get component ID by nomenclature {nomenclature}: {e}")
            raise

    async def get_component_id_by_nomenclature(self, nomenclature: str) -> Optional[str]:
        """Async get component ID by nomenclature"""
        def _get():
            with get_session_context() as session:
                return self._get_component_id_by_nomenclature_sync(session, nomenclature)
        return await self.async_service.run_in_thread(_get)

    def _get_components_nomenclatures_sync(self, session: Session) -> Dict[str, List[str]]:
        """Synchronous get all components with their nomenclatures"""
        try:
            # Assuming you have a table structure where nomenclatures are linked to components
            # Adjust the query based on your actual table structure
            statement = select(
                SystemConfiguration.component_name,
                SystemConfiguration.nomenclature  # or whatever field contains the nomenclature
            ).where(
                SystemConfiguration.nomenclature.is_not(None)  # Only get records with nomenclatures
            ).order_by(
                SystemConfiguration.component_name,
                SystemConfiguration.nomenclature
            )
            
            results = session.exec(statement).all()
            
            # Group nomenclatures by component
            components_dict = {}
            for component_name, nomenclature in results:
                if component_name not in components_dict:
                    components_dict[component_name] = []
                components_dict[component_name].append(nomenclature)
            
            return components_dict
            
        except Exception as e:
            logger.error(f"Failed to get components nomenclatures: {e}")
            raise

    async def get_components_nomenclatures(self) -> Dict[str, List[str]]:
        """Async get all components with their nomenclatures"""
        def _get():
            with get_session_context() as session:
                return self._get_components_nomenclatures_sync(session)
        return await self.async_service.run_in_thread(_get)
    
    def _get_by_department_sync(self, session: Session, department_id: str) -> List[SystemConfiguration]:
        """Synchronous get all components for a department"""
        try:
            statement = select(SystemConfiguration).where(
                SystemConfiguration.department_id == department_id)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(
                f"Failed to get components for department {department_id}: {e}")
            raise

    async def get_by_department(self, department_id: str) -> List[SystemConfiguration]:
        """Async get all components for a department"""
        def _get():
            with get_session_context() as session:
                return self._get_by_department_sync(session, department_id)
        return await self.async_service.run_in_thread(_get)

    def _get_by_ship_sync(self, session: Session, ship_id: UUID) -> List[SystemConfigurationRead]:
        try:
            statement = (
                select(SystemConfiguration)
                .join(Department, Department.department_id == SystemConfiguration.department_id)
                .where(Department.ship_id == ship_id)
            )
            results = list(session.exec(statement))

            # 💥 Force full field loading into Pydantic models while session is still open
            return [SystemConfigurationRead.model_validate(row) for row in results]

        except Exception as e:
            logger.error(f"Failed to get components for ship {ship_id}: {e}")
            raise

    async def get_by_ship(self, ship_id: UUID) -> List[SystemConfigurationRead]:
        """Async get all components for a ship"""
        def _get():
            with get_session_context() as session:
                return self._get_by_ship_sync(session, ship_id)
        return await self.async_service.run_in_thread(_get)

    def _get_root_components_sync(self, session: Session, department_id: str) -> List[SystemConfiguration]:
        """Synchronous get root components (no parent) for a department"""
        try:
            statement = select(SystemConfiguration).where(
                and_(
                    SystemConfiguration.department_id == department_id,
                    SystemConfiguration.parent_id.is_(None)
                )
            )
            return list(session.exec(statement))
        except Exception as e:
            logger.error(
                f"Failed to get root components for department {department_id}: {e}")
            raise

    async def get_root_components(self, department_id: str) -> List[SystemConfiguration]:
        """Async get root components (no parent) for a department"""
        def _get():
            with get_session_context() as session:
                return self._get_root_components_sync(session, department_id)
        return await self.async_service.run_in_thread(_get)

    def _get_children_sync(self, session: Session, parent_id: str) -> List[SystemConfiguration]:
        """Synchronous get child components of a parent"""
        try:
            statement = select(SystemConfiguration).where(
                SystemConfiguration.parent_id == parent_id)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(f"Failed to get children for parent {parent_id}: {e}")
            raise

    async def get_children(self, parent_id: str) -> List[SystemConfiguration]:
        """Async get child components of a parent"""
        def _get():
            with get_session_context() as session:
                return self._get_children_sync(session, parent_id)
        return await self.async_service.run_in_thread(_get)
    
    def _is_component_sync(self, session: Session, name: str) -> bool:
        """Synchronous check if a component exists by name"""
        try:
            statement = select(SystemConfiguration).where(
                SystemConfiguration.component_name == name)
            result = session.exec(statement).first()
            
            return result is not None
            
        except Exception as e:
            logger.error(f"Failed to check if component {name} exists: {e}")
            raise

    async def is_component(self, name: str) -> bool:
        """Async check if a component exists by name"""
        def _check():
            with get_session_context() as session:
                return self._is_component_sync(session, name)
        return await self.async_service.run_in_thread(_check)

    def _get_hierarchy_by_nomenclature_and_ship_sync(self, session: Session, nomenclature: str, ship_name: str) -> Dict[str, Any]:
        """Synchronous get complete hierarchy for a component by nomenclature and ship name"""
        try:
            # First, find the ship by name
            ship_statement = select(Ship).where(Ship.ship_name == ship_name)
            ship = session.exec(ship_statement).first()

            if not ship:
                logger.error(f"Ship with name '{ship_name}' not found")
                return {}

            # Find the component by nomenclature within the ship
            component_statement = (
                select(SystemConfiguration)
                .join(Department, Department.department_id == SystemConfiguration.department_id)
                .where(
                    and_(
                        SystemConfiguration.nomenclature == nomenclature,
                        Department.ship_id == ship.ship_id
                    )
                )
            )

            component = session.exec(component_statement).first()

            if not component:
                logger.error(
                    f"Component with nomenclature '{nomenclature}' not found in ship '{ship_name}'")
                return {}

            # Get all descendants recursively
            def get_descendants(comp_id: str) -> List[Dict]:
                # ✅ Fixed: pass session parameter
                children = self._get_children_sync(session, comp_id)
                result = []
                for child in children:
                    child_dict = {
                        "component_id": child.component_id,
                        "component_name": child.component_name,
                        "nomenclature": child.nomenclature,
                        "children": get_descendants(child.component_id)
                    }
                    result.append(child_dict)
                return result

            return {
                "component_id": component.component_id,
                "component_name": component.component_name,
                "nomenclature": component.nomenclature,
                "ship_name": ship.ship_name,
                "department_id": component.department_id,
                "children": get_descendants(component.component_id)
            }

        except Exception as e:
            logger.error(
                f"Failed to get hierarchy for nomenclature '{nomenclature}' in ship '{ship_name}': {e}")
            raise

    async def get_hierarchy_by_nomenclature_and_ship(self, nomenclature: str, ship_name: str) -> Dict[str, Any]:
        """Async get complete hierarchy for a component by nomenclature and ship name"""
        def _get():
            with get_session_context() as session:
                return self._get_hierarchy_by_nomenclature_and_ship_sync(session, nomenclature, ship_name)
        return await self.async_service.run_in_thread(_get)

    def _get_hierarchy_sync(self, session: Session, component_id: str) -> Dict[str, Any]:
        """Synchronous get complete hierarchy for a component"""
        try:
            component = self._get_by_id_sync(session, component_id)
            if not component:
                return {}

            # Get all descendants recursively
            def get_descendants(comp_id: str) -> List[Dict]:
                children = self._get_children_sync(session, comp_id)
                result = []
                for child in children:
                    child_dict = {
                        "component_id": child.component_id,
                        "component_name": child.component_name,
                        "nomenclature": child.nomenclature,
                        "children": get_descendants(child.component_id)
                    }
                    result.append(child_dict)
                return result

            return {
                "component_id": component.component_id,
                "component_name": component.component_name,
                "nomenclature": component.nomenclature,
                "children": get_descendants(component_id)
            }
        except Exception as e:
            logger.error(
                f"Failed to get hierarchy for component {component_id}: {e}")
            raise

    async def get_hierarchy(self, component_id: str) -> Dict[str, Any]:
        """Async get complete hierarchy for a component"""
        def _get():
            with get_session_context() as session:
                return self._get_hierarchy_sync(session, component_id)
        return await self.async_service.run_in_thread(_get)

    def _search_sync(self, session: Session, filters: ComponentSearchFilter, skip: int = 0, limit: int = 100) -> List[SystemConfiguration]:
        """Synchronous search components with filters"""
        try:
            statement = select(SystemConfiguration)
            conditions = []

            if filters.ship_id:
                statement = statement.join(Department).where(
                    Department.ship_id == filters.ship_id)

            if filters.department_id:
                conditions.append(
                    SystemConfiguration.department_id == filters.department_id)

            if filters.component_name:
                conditions.append(SystemConfiguration.component_name.ilike(
                    f"%{filters.component_name}%"))

            if filters.parent_id:
                conditions.append(
                    SystemConfiguration.parent_id == filters.parent_id)

            if filters.is_lmu is not None:
                conditions.append(SystemConfiguration.is_lmu == filters.is_lmu)

            if filters.has_parent is not None:
                if filters.has_parent:
                    conditions.append(
                        SystemConfiguration.parent_id.is_not(None))
                else:
                    conditions.append(SystemConfiguration.parent_id.is_(None))

            if filters.cmms_equipment_code:
                conditions.append(SystemConfiguration.CMMS_EquipmentCode.ilike(
                    f"%{filters.cmms_equipment_code}%"))

            if conditions:
                statement = statement.where(and_(*conditions))

            statement = statement.offset(skip).limit(limit)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(f"Failed to search components: {e}")
            raise

    async def search(self, filters: ComponentSearchFilter, skip: int = 0, limit: int = 100) -> List[SystemConfiguration]:
        """Async search components with filters"""
        def _search():
            with get_session_context() as session:
                return self._search_sync(session, filters, skip, limit)
        return await get_async_db_service.run_in_thread(_search)

    def _update_sync(self, session: Session, component_id: str, component_data: SystemConfigurationUpdate) -> Optional[SystemConfiguration]:
        """Synchronous update component"""
        try:
            component = self._get_by_id_sync(session, component_id)
            if not component:
                return None

            update_data = component_data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(component, key, value)

            component.modified_date = datetime.utcnow()
            session.commit()
            session.refresh(component)
            logger.info(
                f"Updated component: {component.component_name} (ID: {component.component_id})")
            return component
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to update component {component_id}: {e}")
            raise

    async def update(self, component_id: str, component_data: SystemConfigurationUpdate) -> Optional[SystemConfiguration]:
        """Async update component"""
        def _update():
            with get_session_context() as session:
                return self._update_sync(session, component_id, component_data)
        return await get_async_db_service.run_in_thread(_update)

    def _delete_sync(self, session: Session, component_id: str) -> bool:
        """Synchronous delete component (will fail if it has children due to foreign key constraint)"""
        try:
            component = self._get_by_id_sync(session, component_id)
            if not component:
                return False

            # Check if component has children
            children = self._get_children_sync(session, component_id)
            if children:
                raise ValueError(
                    f"Cannot delete component {component_id} as it has {len(children)} child components")

            session.delete(component)
            session.commit()
            logger.info(
                f"Deleted component: {component.component_name} (ID: {component.component_id})")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to delete component {component_id}: {e}")
            raise

    async def delete(self, component_id: str) -> bool:
        """Async delete component (will fail if it has children due to foreign key constraint)"""
        def _delete():
            with get_session_context() as session:
                return self._delete_sync(session, component_id)
        return await get_async_db_service.run_in_thread(_delete)

    def _get_hierarchy_stats_sync(self, session: Session, component_id: str) -> Optional[ComponentHierarchyStats]:
        """Synchronous get hierarchy statistics for a component"""
        try:
            component = self._get_by_id_sync(session, component_id)
            if not component:
                return None

            # Get department and ship info
            department = session.exec(
                select(Department).where(
                    Department.department_id == component.department_id)
            ).first()

            ship = session.exec(
                select(Ship).where(Ship.ship_id == department.ship_id)
            ).first() if department else None

            # Calculate hierarchy level
            level = 0
            current_parent = component.parent_id
            while current_parent:
                level += 1
                parent_component = self._get_by_id_sync(
                    session, current_parent)
                current_parent = parent_component.parent_id if parent_component else None

            # Count children
            children_count = len(
                self._get_children_sync(session, component_id))

            return ComponentHierarchyStats(
                component_id=component_id,
                component_name=component.component_name,
                department_name=department.department_name if department else "Unknown",
                ship_name=ship.ship_name if ship else "Unknown",
                hierarchy_level=level,
                total_children=children_count,
                is_root=component.parent_id is None
            )
        except Exception as e:
            logger.error(
                f"Failed to get hierarchy stats for component {component_id}: {e}")
            raise

    async def get_hierarchy_stats(self, component_id: str) -> Optional[ComponentHierarchyStats]:
        """Async get hierarchy statistics for a component"""
        def _get_stats():
            with get_session_context() as session:
                return self._get_hierarchy_stats_sync(session, component_id)
        return await get_async_db_service.run_in_thread(_get_stats)


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
