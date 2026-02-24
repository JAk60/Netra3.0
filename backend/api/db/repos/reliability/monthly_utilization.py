import uuid
from api.models.Overhaul import Overhaul_Readings
from sqlmodel import Session, select, desc
from api.db.connection import get_async_db_service, get_session_context

import logging


logger = logging.getLogger(__name__)


class MonthlyUtilizationRepository:
    """Repository for fetching current running age directly."""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _get_current_age_sync(
        self,
        session: Session,
        component_id: uuid.UUID
    ) -> float | None:
        """
        Fetch latest running_age for a component.
        Equivalent to:

        SELECT TOP 1 running_age
        FROM data_manager_overhaul_maint_data
        WHERE component_id = ?
        ORDER BY date DESC
        """

        try:
            stmt = (
                select(Overhaul_Readings.running_age)
                .where(Overhaul_Readings.component_id == component_id)
                .order_by(desc(Overhaul_Readings.defect_date))
                .limit(1)
            )

            result = session.exec(stmt).first()

            if result is None:
                return None

            return float(result)

        except Exception as e:
            logger.error(f"Failed to fetch current age for {component_id}: {e}")
            return None

    async def get_current_age(self, component_id: uuid.UUID) -> float | None:
        """
        Async wrapper for fetching latest running age.
        """

        def _get_age():
            with get_session_context() as session:
                return self._get_current_age_sync(session, component_id)

        try:
            return await self.async_service.run_in_thread(_get_age)
        except Exception as e:
            logger.error(f"Error in get_current_age: {e}")
            return None
