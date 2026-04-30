import sys

from api.db.repos.sensor.metadata import SensorRepository
sys.path.append('..')
from typing import Dict, List, Optional
from uuid import UUID
from sqlalchemy import func
from sqlmodel import Integer, Session, select
from api.models.sensor import (
    SensorMetadata, SensorReading, SensorReadingCreate, SensorReadingCreateByName, SensorReadingResponse
)
from api.db.connection import get_session_context, get_async_db_service
from datetime import datetime
from sqlmodel import Session, select, func
from typing import Optional, List, Tuple
from datetime import datetime
import logging
from datetime import datetime, timezone, timedelta

import calendar

logger = logging.getLogger(__name__)


class SensorReadingRepository:
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_reading_sync(self, session: Session, reading_data: SensorReadingCreate) -> SensorReading:
        """Synchronous reading creation"""
        sensor = session.get(SensorMetadata, reading_data.sensor_id)
        if not sensor:
            raise ValueError(
                f"Sensor with ID {reading_data.sensor_id} not found")

        reading_dict = reading_data.model_dump()
        if reading_dict['value'] < sensor.min_value or reading_dict['value'] > sensor.max_value:
            reading_dict['alert'] = True

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
        sensor_id: Optional[UUID] = None,
        component_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[SensorReadingResponse]:
        """Synchronous readings with filters"""
        # FIX Bug 2: removed duplicate definition. This is the single, canonical
        # _get_readings_sync — returns SensorReadingResponse, no debug prints.
        statement = select(SensorReading)

        if sensor_id:
            statement = statement.where(SensorReading.sensor_id == sensor_id)
        if component_id:
            statement = statement.where(SensorReading.component_id == component_id)
        if start_date:
            statement = statement.where(SensorReading.date >= _make_naive(start_date))
        if end_date:
            statement = statement.where(SensorReading.date <= _make_naive(end_date))

        statement = statement.offset(skip).limit(limit).order_by(SensorReading.date.desc())
        results = session.exec(statement).all()
        return [SensorReadingResponse.model_validate(reading) for reading in results]

    async def get_readings(
        self,
        sensor_id: Optional[UUID] = None,
        component_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 1000
    ) -> List[SensorReadingResponse]:
        """Async readings with filters"""
        def _get():
            with get_session_context() as session:
                return self._get_readings_sync(
                    session, sensor_id, component_id,
                    start_date, end_date, skip, limit
                )

        return await self.async_service.run_in_thread(_get)

    def _get_latest_readings_sync(
        self,
        session: Session,
        sensor_id: Optional[UUID] = None,
        limit: int = None
    ) -> List[SensorReadingResponse]:
        """Synchronous latest readings, optionally filtered by sensor_id"""
        statement = select(SensorReading).order_by(SensorReading.date.asc()).limit(limit)
        if sensor_id is not None:
            statement = statement.where(SensorReading.sensor_id == sensor_id)
        sensor_readings = session.exec(statement).all()
        return [SensorReadingResponse.model_validate(sr) for sr in sensor_readings]

    async def get_latest_readings(self, sensor_id: Optional[UUID] = None, limit: int = None) -> List[SensorReadingResponse]:
        """Async latest readings"""
        def _get():
            with get_session_context() as session:
                return self._get_latest_readings_sync(session, sensor_id, limit)
        return await self.async_service.run_in_thread(_get)

    def _get_latest_operating_values_readings_sync(
        self,
        session: Session,
        sensor_id: Optional[UUID] = None,
        limit: int = 50
    ) -> List[Tuple[float, float]]:
        """Synchronous latest readings, optionally filtered by sensor_id"""
        statement = (
            select(SensorReading.operating_hours, SensorReading.value)
            .order_by(SensorReading.date.asc())
        )
        if sensor_id is not None:
            statement = statement.where(SensorReading.sensor_id == sensor_id)
        return session.exec(statement).all()

    async def get_latest_operating_values_readings(
        self,
        sensor_id: Optional[UUID] = None,
        limit: int = 50
    ) -> List[Tuple[float, float]]:
        """Async latest readings"""
        def _get():
            with get_session_context() as session:
                return self._get_latest_operating_values_readings_sync(session, sensor_id, limit)
        return await self.async_service.run_in_thread(_get)

    def _get_active_alerts_sync(self, session: Session) -> List[SensorReading]:
        """Synchronous active alerts"""
        statement = select(SensorReading).where(
            SensorReading.alert).order_by(SensorReading.date.desc())
        return session.exec(statement).all()

    async def get_active_alerts(self) -> List[SensorReading]:
        """Async active alerts"""
        def _get():
            with get_session_context() as session:
                return self._get_active_alerts_sync(session)

        return await self.async_service.run_in_thread(_get)

    def _get_sensor_stats_sync(self, session: Session, sensor_id: UUID) -> Optional[dict]:
        """Synchronous sensor statistics"""
        statement = select(
            func.count(SensorReading.id).label("total_readings"),
            func.avg(SensorReading.value).label("avg_value"),
            func.min(SensorReading.value).label("min_value"),
            func.max(SensorReading.value).label("max_value"),
            func.sum(func.cast(SensorReading.alert, Integer)).label("alert_count"),
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

    async def get_sensor_stats(self, sensor_id: UUID) -> Optional[dict]:
        """Async sensor statistics"""
        def _get():
            with get_session_context() as session:
                return self._get_sensor_stats_sync(session, sensor_id)

        return await self.async_service.run_in_thread(_get)

    def _bulk_create_readings_sync(self, session: Session, readings_data: List[SensorReadingCreate]) -> List[SensorReading]:
        """Synchronous bulk reading creation"""
        readings = []
        for reading_data in readings_data:
            sensor = session.get(SensorMetadata, reading_data.sensor_id)
            if not sensor:
                continue

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

    def _get_readings_time_based_sync(
        self,
        session: Session,
        sensor_id: Optional[UUID] = None,
        component_id: Optional[UUID] = None,
        last_hours: Optional[int] = None,
        last_days: Optional[int] = None,
        last_weeks: Optional[int] = None,
        last_months: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        month_name: Optional[str] = None,
        week_number: Optional[int] = None,
        today: bool = False,
        yesterday: bool = False,
        skip: int = 0,
        limit: int = 10000
    ) -> List[SensorReadingResponse]:
        """
        Flexible time-based sensor readings query.

        FIX 1: limit raised from 100 → 10000 to avoid silent truncation.

        FIX 2 (Bug 1): DB stores naive timestamps (e.g. 2023-01-13 20:00:00.000).
        All datetime calculations are done in UTC-aware form for correctness, then
        _make_naive() strips tzinfo before hitting the WHERE clause so Postgres
        doesn't throw a type mismatch that gets silently swallowed upstream.

        FIX 3 (Bug 2): removed duplicate _get_readings_sync definition that was
        shadowing the correct one.
        """

        def _make_aware(dt: datetime) -> datetime:
            """Ensure a datetime is UTC-aware. No-op if already aware."""
            if dt is not None and dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt

        # Use UTC-aware now for all internal calculations
        now = datetime.now(timezone.utc)

        calculated_start_date = _make_aware(start_date)
        calculated_end_date   = _make_aware(end_date)

        # Handle relative time periods
        if last_hours:
            calculated_start_date = now - timedelta(hours=last_hours)
            calculated_end_date   = now
        elif last_days:
            calculated_start_date = now - timedelta(days=last_days)
            calculated_end_date   = now
        elif last_weeks:
            calculated_start_date = now - timedelta(weeks=last_weeks)
            calculated_end_date   = now
        elif last_months:
            calculated_start_date = now - timedelta(days=last_months * 30)
            calculated_end_date   = now

        # Handle specific day queries
        elif today:
            calculated_start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            calculated_end_date   = calculated_start_date + timedelta(days=1)
        elif yesterday:
            yesterday_dt          = now - timedelta(days=1)
            calculated_start_date = yesterday_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            calculated_end_date   = calculated_start_date + timedelta(days=1)

        # Handle month queries
        elif month or month_name:
            target_year  = year or now.year
            target_month = month

            if month_name:
                month_mapping = {
                    'january': 1, 'jan': 1,
                    'february': 2, 'feb': 2,
                    'march': 3, 'mar': 3,
                    'april': 4, 'apr': 4,
                    'may': 5,
                    'june': 6, 'jun': 6,
                    'july': 7, 'jul': 7,
                    'august': 8, 'aug': 8,
                    'september': 9, 'sep': 9, 'sept': 9,
                    'october': 10, 'oct': 10,
                    'november': 11, 'nov': 11,
                    'december': 12, 'dec': 12
                }
                target_month = month_mapping.get(month_name.lower())
                if not target_month:
                    raise ValueError(f"Invalid month name: {month_name}")

            if target_month:
                last_day              = calendar.monthrange(target_year, target_month)[1]
                calculated_start_date = datetime(target_year, target_month, 1, tzinfo=timezone.utc)
                calculated_end_date   = datetime(target_year, target_month, last_day, 23, 59, 59, tzinfo=timezone.utc)

        # Handle week queries
        elif week_number:
            target_year    = year or now.year
            jan_1          = datetime(target_year, 1, 1, tzinfo=timezone.utc)
            days_to_monday = -jan_1.weekday()
            monday_week_1  = jan_1 + timedelta(days=days_to_monday)
            calculated_start_date = monday_week_1 + timedelta(weeks=week_number - 1)
            calculated_end_date   = calculated_start_date + timedelta(days=7)

        # Handle year-only queries
        elif year and not month and not month_name:
            calculated_start_date = datetime(year, 1, 1, tzinfo=timezone.utc)
            calculated_end_date   = datetime(year, 12, 31, 23, 59, 59, tzinfo=timezone.utc)

        # Log the resolved window for debugging
        logger.debug(
            "[Sensors] time window: start=%s end=%s",
            calculated_start_date,
            calculated_end_date,
        )

        # Warn if limit may have been hit (potential silent truncation)
        # checked after query below

        # Build the query — strip tzinfo before comparing against naive DB timestamps
        statement = select(SensorReading)

        if sensor_id:
            statement = statement.where(SensorReading.sensor_id == sensor_id)
        if component_id:
            statement = statement.where(SensorReading.component_id == component_id)
        if calculated_start_date:
            statement = statement.where(SensorReading.date >= _make_naive(calculated_start_date))
        if calculated_end_date:
            statement = statement.where(SensorReading.date <= _make_naive(calculated_end_date))

        statement = statement.offset(skip).limit(limit).order_by(SensorReading.date.desc())
        results   = session.exec(statement).all()

        # FIX Bug 3: warn if we may have hit the limit and silently truncated
        if len(results) == limit:
            logger.warning(
                "[Sensors] sensor_id=%s returned exactly %d readings — limit may have been hit, some data could be truncated",
                sensor_id, limit
            )

        response_models = []
        for reading in results:
            response_models.append(SensorReadingResponse(
                id               = str(reading.id),
                date             = reading.date,
                value            = reading.value,
                operating_hours  = reading.operating_hours,
                alert            = reading.alert,
                component_id     = str(reading.component_id),
                sensor_id        = str(reading.sensor_id)
            ))

        return response_models

    async def get_readings_time_based(
        self,
        sensor_id: Optional[UUID] = None,
        component_id: Optional[UUID] = None,
        last_hours: Optional[int] = None,
        last_days: Optional[int] = None,
        last_weeks: Optional[int] = None,
        last_months: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        month_name: Optional[str] = None,
        week_number: Optional[int] = None,
        today: bool = False,
        yesterday: bool = False,
        skip: int = 0,
        limit: int = 10000
    ) -> List[SensorReadingResponse]:

        def _get():
            with get_session_context() as session:
                return self._get_readings_time_based_sync(
                    session, sensor_id, component_id,
                    last_hours, last_days, last_weeks, last_months,
                    start_date, end_date, year, month, month_name,
                    week_number, today, yesterday, skip, limit
                )

        return await self.async_service.run_in_thread(_get)

    def _bulk_create_readings_by_name_sync(
        self,
        session: Session,
        readings_data: List[SensorReadingCreateByName],
        component_id: UUID
    ) -> Dict[str, any]:
        """Synchronous bulk reading creation with sensor name resolution"""
        sensor_repo = SensorRepository(session)
        created_readings = []
        failed = 0
        errors = []

        for idx, reading_data in enumerate(readings_data):
            try:
                sensor_id = sensor_repo._get_sensorid_by_name_sync(
                    session,
                    reading_data.sensor_name,
                    component_id
                )

                if not sensor_id:
                    failed += 1
                    errors.append({
                        "row": idx,
                        "sensor_name": reading_data.sensor_name,
                        "error": f"Sensor '{reading_data.sensor_name}' not found for this component"
                    })
                    continue

                reading = SensorReading(
                    sensor_id=sensor_id,
                    component_id=component_id,
                    value=reading_data.value,
                    date=reading_data.date,
                    operating_hours=reading_data.operating_hours
                )
                session.add(reading)
                created_readings.append(reading)

            except Exception as e:
                failed += 1
                errors.append({
                    "row": idx,
                    "sensor_name": getattr(reading_data, 'sensor_name', 'unknown'),
                    "error": str(e)
                })

        if created_readings:
            session.commit()
            for reading in created_readings:
                session.refresh(reading)

        return {
            "created": len(created_readings),
            "failed": failed,
            "errors": errors if errors else [],
            "readings": created_readings
        }

    async def bulk_create_readings_by_name(
        self,
        readings_data: List[SensorReadingCreate],
        component_id: UUID
    ) -> Dict[str, any]:
        """Async bulk reading creation with sensor name resolution"""
        def _create():
            with get_session_context() as session:
                return self._bulk_create_readings_by_name_sync(session, readings_data, component_id)

        return await self.async_service.run_in_thread(_create)


# ------------------------------------------------------------------
# Module-level helpers
# ------------------------------------------------------------------

def _make_naive(dt: datetime) -> Optional[datetime]:
    """
    Strip tzinfo from a datetime before comparing against naive DB timestamps.
    Converts to UTC first so the value is correct even if the input is in
    a non-UTC timezone.
    """
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt