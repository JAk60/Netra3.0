import logging
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func
from sqlmodel import Session, select, and_, or_, desc, asc
from datetime import datetime
from api.models import SystemConfiguration, Ship  # Changed from backend.api.models
from api.models.systemconfiguration import (  # Changed from backend.api.models
    Department, ShipCreate, ShipSearchFilter, ShipStats, ShipUpdate, ShipRead
)
from db.connection import get_session_context, get_async_db_service
from datetime import datetime
from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
# Import your naval ship models (adjust import path as needed)
from backend.api.models import SystemConfiguration, Ship

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

    def _get_ship_by_id_sync(self, session: Session, ship_id: UUID) -> Optional[ShipRead]:
        """Synchronous get ship by ID"""
        try:
            statement = select(Ship).where(Ship.ship_id == ship_id)
            ship = session.exec(statement).first()
            if ship:
                # Convert to ShipRead while session is active
                return ShipRead.model_validate(ship)
            return None
        except Exception as e:
            logger.error(f"Failed to get ship by ID {ship_id}: {e}")
            raise

    async def get_ship_by_id(self, ship_id: UUID) -> Optional[ShipRead]:
        """Async get ship by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_ship_by_id_sync(session, ship_id)

        return await self.async_service.run_in_thread(_get)
    
    def _get_ship_id_by_name_sync(self, session: Session, ship_name: str) -> Optional[str]:
        """Synchronous get ship by ID"""
        try:
            statement = select(Ship.ship_id).where(Ship.ship_name == ship_name)
            ship = session.exec(statement).first()
            if ship:
                # Convert to ShipRead while session is active
                return ship
            return None
        except Exception as e:
            logger.error(f"Failed to get ship by name {ship_name}: {e}")
            raise

    async def get_shipid_by_shipname(self, ship_name: str) -> Optional[str]:
        """Async get ship by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_ship_id_by_name_sync(session, ship_name)

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

