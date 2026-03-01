import uuid
from datetime import datetime
from decimal import Decimal

from api.models.Overhaul import Overhaul_Readings
from api.db.connection import get_async_db_service, get_session_context

from sqlmodel import Session, select, desc

import logging

from api.models.reliability.params import MonthlyUtilization, MonthlyUtilizationRead

logger = logging.getLogger(__name__)

CHUNK_SIZE = 500  # SQL Server param limit is 2100; 500 rows × 4 cols = 2000 params


class MonthlyUtilizationRepository:
    """Full CRUD + bulk-insert repository for monthly utilization data."""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    # ─────────────────────────────────────────────────────────────────
    # CURRENT AGE  (overhaul-aware)
    # ─────────────────────────────────────────────────────────────────

    def _get_current_age_sync(
        self,
        session: Session,
        component_id: uuid.UUID,
    ) -> float | None:
        """
        Mirrors the original T-SQL proc:
            SELECT TOP 1 maintenance_type, running_age
            FROM data_manager_overhaul_maint_data
            WHERE component_id = ?
            ORDER BY date DESC

        Returns 0.0 when the latest event is an Overhaul (age resets).
        """
        try:
            stmt = (
                select(
                    Overhaul_Readings.maintenance_type,
                    Overhaul_Readings.running_age,
                )
                .where(Overhaul_Readings.component_id == component_id)
                .order_by(desc(Overhaul_Readings.defect_date))
                .limit(1)
            )

            row = session.exec(stmt).first()

            if row is None:
                logger.debug("No overhaul records for component %s", component_id)
                return None

            maintenance_type, running_age = row

            if maintenance_type == "Overhaul":
                logger.debug(
                    "Latest record for %s is Overhaul — returning 0.0", component_id
                )
                return 0.0

            if running_age is None:
                logger.warning(
                    "running_age is NULL for %s (maintenance_type=%s)",
                    component_id,
                    maintenance_type,
                )
                return None

            return float(running_age)

        except Exception:
            logger.exception("Failed to fetch current age for %s", component_id)
            return None

    async def get_current_age(self, component_id: uuid.UUID) -> float | None:
        """Async wrapper — returns effective running age."""

        def _work():
            with get_session_context() as session:
                return self._get_current_age_sync(session, component_id)

        try:
            return await self.async_service.run_in_thread(_work)
        except Exception:
            logger.exception("Error in get_current_age")
            return None

    # ─────────────────────────────────────────────────────────────────
    # LIST
    # ─────────────────────────────────────────────────────────────────

    def _list_sync(
        self,
        session: Session,
        component_id: uuid.UUID,
    ) -> list[MonthlyUtilizationRead]:
        try:
            stmt = (
                select(MonthlyUtilization)
                .where(MonthlyUtilization.component_id == component_id)
                .order_by(desc(MonthlyUtilization.operation_date))
            )
            rows = session.exec(stmt).all()
            # Convert to Pydantic read models BEFORE session closes
            return [MonthlyUtilizationRead.model_validate(r) for r in rows]
        except Exception:
            logger.exception("Failed to list utilization for %s", component_id)
            return []

    async def list_by_component(
        self, component_id: uuid.UUID
    ) -> list[MonthlyUtilizationRead]:
        def _work():
            with get_session_context() as session:
                return self._list_sync(session, component_id)

        try:
            return await self.async_service.run_in_thread(_work)
        except Exception:
            logger.exception("Error in list_by_component")
            return []

    # ─────────────────────────────────────────────────────────────────
    # GET SINGLE
    # ─────────────────────────────────────────────────────────────────

    def _get_sync(
        self, session: Session, record_id: uuid.UUID
    ) -> MonthlyUtilizationRead | None:
        record = session.get(MonthlyUtilization, record_id)
        if record is None:
            return None
        # Convert to Pydantic read model BEFORE session closes
        return MonthlyUtilizationRead.model_validate(record)

    async def get_by_id(self, record_id: uuid.UUID) -> MonthlyUtilizationRead | None:
        def _work():
            with get_session_context() as session:
                return self._get_sync(session, record_id)

        try:
            return await self.async_service.run_in_thread(_work)
        except Exception:
            logger.exception("Error in get_by_id")
            return None

    # ─────────────────────────────────────────────────────────────────
    # CREATE
    # ─────────────────────────────────────────────────────────────────

    def _create_sync(
        self,
        session: Session,
        component_id: uuid.UUID,
        operation_date: datetime,
        utilization: Decimal,
    ) -> MonthlyUtilizationRead:
        record = MonthlyUtilization(
            component_id=component_id,
            operation_date=operation_date,
            utlization=utilization,
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        logger.info(
            "Created utilization record %s for component %s", record.id, component_id
        )
        # Convert to Pydantic read model BEFORE session closes
        return MonthlyUtilizationRead.model_validate(record)

    async def create(
        self,
        component_id: uuid.UUID,
        operation_date: datetime,
        utilization: Decimal,
    ) -> MonthlyUtilizationRead:
        def _work():
            with get_session_context() as session:
                return self._create_sync(session, component_id, operation_date, utilization)

        try:
            return await self.async_service.run_in_thread(_work)
        except Exception:
            logger.exception("Error in create")
            raise

    # ─────────────────────────────────────────────────────────────────
    # UPDATE
    # ─────────────────────────────────────────────────────────────────

    def _update_sync(
        self,
        session: Session,
        record_id: uuid.UUID,
        operation_date: datetime | None,
        utilization: Decimal | None,
    ) -> MonthlyUtilizationRead | None:
        record = session.get(MonthlyUtilization, record_id)
        if record is None:
            logger.warning("Record %s not found for update", record_id)
            return None

        if operation_date is not None:
            record.operation_date = operation_date
        if utilization is not None:
            record.utlization = utilization

        session.add(record)
        session.commit()
        session.refresh(record)
        logger.info("Updated utilization record %s", record_id)
        # Convert to Pydantic read model BEFORE session closes
        return MonthlyUtilizationRead.model_validate(record)

    async def update(
        self,
        record_id: uuid.UUID,
        operation_date: datetime | None = None,
        utilization: Decimal | None = None,
    ) -> MonthlyUtilizationRead | None:
        def _work():
            with get_session_context() as session:
                return self._update_sync(session, record_id, operation_date, utilization)

        try:
            return await self.async_service.run_in_thread(_work)
        except Exception:
            logger.exception("Error in update")
            raise

    # ─────────────────────────────────────────────────────────────────
    # DELETE
    # ─────────────────────────────────────────────────────────────────

    def _delete_sync(self, session: Session, record_id: uuid.UUID) -> bool:
        record = session.get(MonthlyUtilization, record_id)
        if record is None:
            logger.warning("Record %s not found for delete", record_id)
            return False
        session.delete(record)
        session.commit()
        logger.info("Deleted utilization record %s", record_id)
        return True

    async def delete(self, record_id: uuid.UUID) -> bool:
        def _work():
            with get_session_context() as session:
                return self._delete_sync(session, record_id)

        try:
            return await self.async_service.run_in_thread(_work)
        except Exception:
            logger.exception("Error in delete")
            raise

    # ─────────────────────────────────────────────────────────────────
    # BULK INSERT  — SQL Server safe (no PostgreSQL dialect)
    # ─────────────────────────────────────────────────────────────────

    def _bulk_insert_sync(
        self,
        session: Session,
        records: list[dict],
    ) -> int:
        """
        Chunked bulk insert using SQLModel ORM (SQL Server compatible).

        Each dict must have:
            - operation_date  (datetime)
            - utlization      (Decimal)
            - component_id    (uuid.UUID)

        SQL Server's parameter limit is 2100; at 4 columns per row we cap
        each chunk at 500 rows (4 × 500 = 2000 params).
        """
        if not records:
            return 0

        inserted_total = 0

        try:
            for i in range(0, len(records), CHUNK_SIZE):
                chunk = records[i : i + CHUNK_SIZE]
                objects = [
                    MonthlyUtilization(
                        id=r.get("id", uuid.uuid4()),
                        operation_date=r["operation_date"],
                        utlization=r["utlization"],
                        component_id=r["component_id"],
                    )
                    for r in chunk
                ]
                session.add_all(objects)
                session.flush()  # write chunk, keep transaction open
                inserted_total += len(objects)
                logger.debug("Flushed chunk of %d rows", len(objects))

            session.commit()
            logger.info(
                "Bulk inserted %d MonthlyUtilization records (chunk_size=%d)",
                inserted_total,
                CHUNK_SIZE,
            )
            # bulk_insert only returns a count — no ORM objects escape the session
            return inserted_total

        except Exception:
            session.rollback()
            logger.exception("Bulk insert failed — rolled back")
            raise

    async def bulk_insert(self, records: list[dict]) -> int:
        """
        Async wrapper.

        Example record dict:
            {
                "operation_date": datetime(2024, 1, 1),
                "utlization": Decimal("720.00"),
                "component_id": uuid.UUID("..."),
            }
        """

        def _work():
            with get_session_context() as session:
                return self._bulk_insert_sync(session, records)

        try:
            return await self.async_service.run_in_thread(_work)
        except Exception:
            logger.exception("Error in bulk_insert")
            raise