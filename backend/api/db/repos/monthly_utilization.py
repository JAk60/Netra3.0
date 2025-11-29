import uuid
from sqlmodel import Session, and_, func, select
from api.db.connection import get_async_db_service, get_session_context

import logging

from api.models.Overhaul import Overhaul_Readings
from api.models.reliability import MonthlyUtilization

logger = logging.getLogger(__name__)

class MonthlyUtilizationRepository:
    """ Repository for managing monthly utilization data of naval ships."""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _get_curr_age_sync(self, session: Session, component_id: uuid.UUID) -> float:
        """Synchronous current age calculation"""
        try:
            # Query 1: Get last overhaul date
            stmt1 = select(func.max(Overhaul_Readings.defect_date)).where(
                and_(
                    Overhaul_Readings.maintenance_type == 'Corrective Maintenance',
                    Overhaul_Readings.component_id == component_id
                )
            )
            result1 = session.exec(stmt1).first()
            
            # If no overhaul records exist, return 0.0
            if result1 is None:
                logger.info(f"No overhaul records found for component {component_id}")
                return 0.0
            
            last_overhaul_date = result1
            # Format to first day of the month
            formatted_date = last_overhaul_date.replace(day=1)
            
            # Query 2: Sum of utilization up to formatted date
            stmt2 = select(func.sum(MonthlyUtilization.utlization)).where(
                and_(
                    MonthlyUtilization.operation_date <= formatted_date,
                    MonthlyUtilization.component_id == component_id
                )
            )
            result2 = session.exec(stmt2).first()
            
            # Handle None result from sum (no matching records or all NULL values)
            if result2 is None:
                logger.info(f"No utilization records found for component {component_id}")
                return 0.0
            
            sum_of_utilization = float(result2)
            logger.info(f"Current age for component {component_id}: {sum_of_utilization}")
            return sum_of_utilization
            
        except Exception as e:
            logger.error(f"Failed to get current age for component {component_id}: {e}")
            # Return 0.0 instead of raising to prevent 500 errors
            return 0.0

    async def get_curr_age(self, component_id: uuid.UUID) -> float:
        """Async current age calculation"""
        def _get_age():
            with get_session_context() as session:
                return self._get_curr_age_sync(session, component_id)
        
        try:
            result = await self.async_service.run_in_thread(_get_age)
            # Ensure we always return a float, never None
            return result if result is not None else 0.0
        except Exception as e:
            logger.error(f"Error in get_curr_age: {e}")
            return 0.0