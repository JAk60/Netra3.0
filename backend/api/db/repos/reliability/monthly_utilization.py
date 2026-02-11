import uuid
from sqlmodel import Session, and_, func, select
from api.db.connection import get_async_db_service, get_session_context

import logging

from api.models.Overhaul import Overhaul_Readings
from api.models.reliability.params import MonthlyUtilization

logger = logging.getLogger(__name__)

class MonthlyUtilizationRepository:
    """ Repository for managing monthly utilization data of naval ships."""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _get_age_since_last_overhaul_sync(self, session: Session, component_id: uuid.UUID) -> float:
        """
        Calculate operating hours accumulated since the last overhaul.
        If no overhaul exists, returns total lifetime utilization instead.
        """
        try:
            # Query 1: Get last overhaul date
            stmt1 = select(func.max(Overhaul_Readings.defect_date)).where(
                and_(
                    Overhaul_Readings.maintenance_type == 'Corrective Maintenance',
                    Overhaul_Readings.component_id == component_id
                )
            )
            result1 = session.exec(stmt1).first()
            
            # If no overhaul records exist, return total lifetime utilization
            if result1 is None:
                logger.info(f"No overhaul records found for component {component_id}, returning total lifetime utilization")
                return self._get_total_age_since_commissioning_sync(session, component_id)
            
            last_overhaul_date = result1
            # Format to first day of the month (to align with monthly operational data)
            formatted_date = last_overhaul_date.replace(day=1)
            
            # Query 2: Sum of utilization since the overhaul date
            stmt2 = select(func.sum(MonthlyUtilization.utlization)).where(
                and_(
                    MonthlyUtilization.operation_date >= formatted_date,
                    MonthlyUtilization.component_id == component_id
                )
            )
            result2 = session.exec(stmt2).first()
            
            # Handle None result from sum (no matching records or all NULL values)
            if result2 is None:
                logger.info(f"No utilization records found since overhaul for component {component_id}")
                return 0.0
            
            sum_of_utilization = float(result2)
            logger.info(f"Age since last overhaul for component {component_id}: {sum_of_utilization} hours")
            return sum_of_utilization
            
        except Exception as e:
            logger.error(f"Failed to get age since last overhaul for component {component_id}: {e}")
            return 0.0

    async def get_age_since_last_overhaul(self, component_id: uuid.UUID) -> float:
        """
        Async: Calculate operating hours accumulated since the last overhaul.
        If no overhaul exists, returns total lifetime utilization.
        """
        def _get_age():
            with get_session_context() as session:
                return self._get_age_since_last_overhaul_sync(session, component_id)
        
        try:
            result = await self.async_service.run_in_thread(_get_age)
            return result if result is not None else 0.0
        except Exception as e:
            logger.error(f"Error in get_age_since_last_overhaul: {e}")
            return 0.0

    def _get_total_age_since_commissioning_sync(self, session: Session, component_id: uuid.UUID) -> float:
        """
        Calculate total lifetime utilization hours for a component since commissioning.
        This represents the complete operational history regardless of overhauls.
        """
        try:
            # Sum all utilization values for the component
            stmt = select(func.sum(MonthlyUtilization.utlization)).where(
                MonthlyUtilization.component_id == component_id
            )
            result = session.exec(stmt).first()
            
            # Handle None result from sum (no matching records or all NULL values)
            if result is None:
                logger.info(f"No utilization records found for component {component_id}")
                return 0.0
            
            total_utilization = float(result)
            logger.info(f"Total age since commissioning for component {component_id}: {total_utilization} hours")
            return total_utilization
            
        except Exception as e:
            logger.error(f"Failed to get total age since commissioning for component {component_id}: {e}")
            return 0.0

    async def get_total_age_since_commissioning(self, component_id: uuid.UUID) -> float:
        """
        Async: Calculate total lifetime utilization hours since commissioning.
        """
        def _get_age():
            with get_session_context() as session:
                return self._get_total_age_since_commissioning_sync(session, component_id)
        
        try:
            result = await self.async_service.run_in_thread(_get_age)
            return result if result is not None else 0.0
        except Exception as e:
            logger.error(f"Error in get_total_age_since_commissioning: {e}")
            return 0.0