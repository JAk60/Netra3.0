import logging
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func
from sqlmodel import Session, select, and_
from datetime import datetime
from api.models import SystemConfiguration, Ship, Department  # Changed from backend.api.models
from api.models.systemconfiguration import (  # Changed from backend.api.models
    DepartmentCreate, DepartmentRead, DepartmentStats, DepartmentUpdate,
)
from api.db.connection import get_session_context, get_async_db_service


logger = logging.getLogger(__name__)

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
        return await self.async_service.run_in_thread(_get)

    def _get_departments_by_ship_sync(self, session: Session, ship_id: int) -> List[DepartmentRead]:
        """Synchronous get all departments for a ship"""
        try:
            statement = select(Department).where(Department.ship_id == ship_id)
            departments = session.exec(statement).all()  # Get the ORM objects
            # Convert to DepartmentRead while session is active
            return [DepartmentRead.model_validate(dept) for dept in departments]
        except Exception as e:
            logger.error(f"Failed to get departments for ship {ship_id}: {e}")
            raise

    async def get_departments_by_ship(self, ship_id: UUID) -> List[DepartmentRead]:
        """Async get all departments for a ship"""
        def _get():
            with get_session_context() as session:
                return self._get_departments_by_ship_sync(session, ship_id)
        return await self.async_service.run_in_thread(_get)

    def _get_by_ship_and_name_sync(self, session: Session, ship_id: UUID, department_name: str) -> Optional[Department]:
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
