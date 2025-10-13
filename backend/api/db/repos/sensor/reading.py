import sys
sys.path.append('..')
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func
from sqlmodel import Integer, Session, select
from api.models.sensor import (
    FailureMode, FailureModeCreate, FailureModeUpdate, 
    SensorMetadata, SensorMetadataCreate, SensorMetadataUpdate, 
    SensorReading, SensorReadingCreate, SensorReadingResponse
)
from api.db.connection import get_session_context, get_async_db_service
from datetime import datetime
from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import logging
from datetime import datetime, timedelta
import calendar

logger = logging.getLogger(__name__)


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
        sensor_id: Optional[UUID] = None,
        component_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[SensorReadingResponse]:
        import sys
        sys.stdout.flush()
        print("=" * 100, flush=True)
        print("🔥🔥🔥 INSIDE _get_readings_sync - THIS BETTER SHOW UP! 🔥🔥🔥", flush=True)
        print("=" * 100, flush=True)
        """Synchronous readings with filters"""
        statement = select(SensorReading)

        if sensor_id:
            statement = statement.where(SensorReading.sensor_id == sensor_id)
        if component_id:
            statement = statement.where(SensorReading.component_id == component_id)
        if start_date:
            statement = statement.where(SensorReading.date >= start_date)
        if end_date:
            statement = statement.where(SensorReading.date <= end_date)

        statement = statement.offset(skip).limit(limit).order_by(SensorReading.date.desc())
        
        results = session.exec(statement).all()
        
        print(f"📊 RESULTS COUNT: {len(results)}")
        print(f"📊 RESULTS TYPE: {type(results)}")
        
        if results:
            print(f"📊 FIRST RESULT TYPE: {type(results[0])}")
            print(f"📊 FIRST RESULT: {results[0]}")
            print(f"📊 FIRST RESULT __dict__: {results[0].__dict__}")
            
            # Try converting first one
            try:
                first_converted = SensorReadingResponse.model_validate(results[0])
                print(f"✅ CONVERTED FIRST: {first_converted}")
                print(f"✅ CONVERTED DICT: {first_converted.model_dump()}")
            except Exception as e:
                print(f"❌ CONVERSION ERROR: {e}")
        
        # Actual conversion
        converted = [SensorReadingResponse.model_validate(reading) for reading in results]
        print(f"📊 CONVERTED LIST TYPE: {type(converted)}")
        print(f"📊 CONVERTED LIST: {converted}")
        
        return converted
    
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
                # DO THE CONVERSION HERE instead of in _get_readings_sync
                statement = select(SensorReading)

                if sensor_id:
                    statement = statement.where(SensorReading.sensor_id == sensor_id)
                if component_id:
                    statement = statement.where(SensorReading.component_id == component_id)
                if start_date:
                    statement = statement.where(SensorReading.date >= start_date)
                if end_date:
                    statement = statement.where(SensorReading.date <= end_date)

                statement = statement.offset(skip).limit(limit).order_by(SensorReading.date.desc())
                
                results = session.exec(statement).all()
                
                # Convert to SensorReadingResponse HERE
                return [SensorReadingResponse.model_validate(reading) for reading in results]

        return await self.async_service.run_in_thread(_get)
    
    def _get_latest_readings_sync(
        self,
        session: Session,
        sensor_id: Optional[UUID] = None,
        limit: int = None
    ) -> List[SensorReadingResponse]:
        """Synchronous latest readings, optionally filtered by sensor_id"""
        statement = select(SensorReading).order_by(SensorReading.date.desc()).limit(limit)
        if sensor_id is not None:
            statement = statement.where(SensorReading.sensor_id == sensor_id)
        sensor_readings = session.exec(statement).all()
        # Convert ORM objects to response objects
        return [SensorReadingResponse.model_validate(sr) for sr in sensor_readings]

    async def get_latest_readings(self, sensor_id: Optional[UUID] = None, limit: int = None) -> List[SensorReadingResponse]:
        """Async latest readings"""
        def _get():
            with get_session_context() as session:
                result = self._get_latest_readings_sync(session, sensor_id, limit)
                print(f"Type returned: {type(result)}")
                print(f"Length: {len(result) if result else 0}")
                return result
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
            .order_by(SensorReading.date.desc())
            .limit(limit)
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
            SensorReading.alert == True).order_by(SensorReading.date.desc())
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

    def _get_readings_time_based_sync(
        self,
        session: Session,
        sensor_id: Optional[UUID] = None,
        component_id: Optional[UUID] = None,
        # Time-based parameters
        last_hours: Optional[int] = None,
        last_days: Optional[int] = None,
        last_weeks: Optional[int] = None,
        last_months: Optional[int] = None,
        # Specific date ranges
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        # Month/Year queries
        year: Optional[int] = None,
        month: Optional[int] = None,  # 1-12
        month_name: Optional[str] = None,  # "january", "jan", "August", "aug", etc.
        # Week queries
        week_number: Optional[int] = None,  # ISO week number
        # Day queries
        today: bool = False,
        yesterday: bool = False,
        # Pagination
        skip: int = 0,
        limit: int = 100
    ) -> List[SensorReadingResponse]:
        """
        Flexible time-based sensor readings query.
        
        Examples:
        - last_hours=20 -> last 20 hours
        - last_days=7 -> last 7 days
        - year=2025, month=8 -> August 2025
        - year=2025, month_name="aug" -> August 2025
        - today=True -> today's data
        - week_number=35, year=2025 -> week 35 of 2025
        """
        now = datetime.now()
        calculated_start_date = start_date
        calculated_end_date = end_date
        
        # Handle relative time periods
        if last_hours:
            calculated_start_date = now - timedelta(hours=last_hours)
            calculated_end_date = now
        elif last_days:
            calculated_start_date = now - timedelta(days=last_days)
            calculated_end_date = now
        elif last_weeks:
            calculated_start_date = now - timedelta(weeks=last_weeks)
            calculated_end_date = now
        elif last_months:
            # Approximate months as 30 days each
            calculated_start_date = now - timedelta(days=last_months * 30)
            calculated_end_date = now
        
        # Handle specific day queries
        elif today:
            calculated_start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            calculated_end_date = calculated_start_date + timedelta(days=1)
        elif yesterday:
            yesterday_date = now - timedelta(days=1)
            calculated_start_date = yesterday_date.replace(hour=0, minute=0, second=0, microsecond=0)
            calculated_end_date = calculated_start_date + timedelta(days=1)
        
        # Handle month queries
        elif month or month_name:
            target_year = year or now.year
            target_month = month
            
            # Parse month name if provided
            if month_name:
                month_name_lower = month_name.lower()
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
                target_month = month_mapping.get(month_name_lower)
                if not target_month:
                    raise ValueError(f"Invalid month name: {month_name}")
            
            if target_month:
                calculated_start_date = datetime(target_year, target_month, 1)
                # Get the last day of the month
                last_day = calendar.monthrange(target_year, target_month)[1]
                calculated_end_date = datetime(target_year, target_month, last_day, 23, 59, 59)
        
        # Handle week queries
        elif week_number:
            target_year = year or now.year
            # Get the Monday of the specified week
            jan_1 = datetime(target_year, 1, 1)
            # Find the Monday of week 1
            days_to_monday = -jan_1.weekday()
            monday_week_1 = jan_1 + timedelta(days=days_to_monday)
            # Calculate the target week's Monday
            calculated_start_date = monday_week_1 + timedelta(weeks=week_number - 1)
            calculated_end_date = calculated_start_date + timedelta(days=7)
        
        # Handle year-only queries
        elif year and not month and not month_name:
            calculated_start_date = datetime(year, 1, 1)
            calculated_end_date = datetime(year, 12, 31, 23, 59, 59)
        
        # Build the query
        statement = select(SensorReading)
        
        if sensor_id:
            statement = statement.where(SensorReading.sensor_id == sensor_id)
        if component_id:
            statement = statement.where(SensorReading.component_id == component_id)
        if calculated_start_date:
            statement = statement.where(SensorReading.date >= calculated_start_date)
        if calculated_end_date:
            statement = statement.where(SensorReading.date <= calculated_end_date)
        
        statement = statement.offset(skip).limit(limit).order_by(SensorReading.date.desc())
        results = session.exec(statement).all()
    
        # Convert to response models WHILE session is active
        response_models = []
        for reading in results:
            response_models.append(SensorReadingResponse(
                id=str(reading.id),
                date=reading.date,
                value=reading.value,
                operating_hours=reading.operating_hours,
                alert=reading.alert,
                component_id=str(reading.component_id),
                sensor_id=str(reading.sensor_id)
            ))
        
        return response_models

    async def get_readings_time_based(
        self,
        sensor_id: Optional[UUID] = None,
        component_id: Optional[UUID] = None,
        # Time-based parameters
        last_hours: Optional[int] = None,
        last_days: Optional[int] = None,
        last_weeks: Optional[int] = None,
        last_months: Optional[int] = None,
        # Specific date ranges
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        # Month/Year queries
        year: Optional[int] = None,
        month: Optional[int] = None,
        month_name: Optional[str] = None,
        # Week queries
        week_number: Optional[int] = None,
        # Day queries
        today: bool = False,
        yesterday: bool = False,
        # Pagination
        skip: int = 0,
        limit: int = 100
    ) -> List[SensorReadingResponse]:
        """
        Async time-based readings with flexible filters.
        
        Usage examples:
        
        # Last X time periods
        await get_readings_time_based(last_hours=20)  # Last 20 hours
        await get_readings_time_based(last_days=7)    # Last 7 days
        await get_readings_time_based(last_weeks=2)   # Last 2 weeks
        await get_readings_time_based(last_months=3)  # Last 3 months
        
        # Specific months
        await get_readings_time_based(year=2025, month=8)           # August 2025
        await get_readings_time_based(year=2025, month_name="aug")  # August 2025
        await get_readings_time_based(month_name="january")         # January of current year
        
        # Specific days
        await get_readings_time_based(today=True)      # Today's data
        await get_readings_time_based(yesterday=True)  # Yesterday's data
        
        # Specific weeks
        await get_readings_time_based(week_number=35, year=2025)  # Week 35 of 2025
        
        # Entire year
        await get_readings_time_based(year=2024)  # All of 2024
        
        # Traditional date ranges still work
        await get_readings_time_based(
            start_date=datetime(2025, 8, 1),
            end_date=datetime(2025, 8, 31)
        )
        """
        def _get():
            with get_session_context() as session:
                return self._get_readings_time_based_sync(
                    session, sensor_id, component_id,
                    last_hours, last_days, last_weeks, last_months,
                    start_date, end_date, year, month, month_name,
                    week_number, today, yesterday, skip, limit
                )

        return await self.async_service.run_in_thread(_get)

    