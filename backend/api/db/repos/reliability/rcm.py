from sqlmodel import Session, select
from api.db.connection import get_async_db_service, get_session_context
import logging
from api.models.Rcm import RCM, RCMCreate, RCMUpdate
from api.models.systemconfiguration import SystemConfiguration
from typing import List, Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class RcmRepository:
    """Repository for managing RCM (Reliability Centered Maintenance) data."""
    
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    # ==================== CREATE ====================
    def _create_sync(self, session: Session, rcm_data: RCMCreate) -> RCM:
        """Create or update RCM entry (UPSERT), keeping only one row per component_id"""
        try:
            # Check if row already exists
            existing: RCM = session.query(RCM).filter(
                RCM.component_id == rcm_data.component_id
            ).first()

            if existing:
                # Update existing entry
                for field, value in rcm_data.dict().items():
                    setattr(existing, field, value)

                session.add(existing)
                session.commit()
                session.refresh(existing)

                logger.info(
                    f"Updated existing RCM record for component: {existing.component_id} "
                    f"(RCM ID: {existing.rcm_id})"
                )
                return existing

            # Else: Insert new record
            rcm = RCM(**rcm_data.dict())
            session.add(rcm)
            session.commit()
            session.refresh(rcm)

            logger.info(
                f"Created new RCM record for component: {rcm.component_id} "
                f"(ID: {rcm.rcm_id})"
            )
            return rcm

        except Exception as e:
            session.rollback()
            logger.error(f"Failed to upsert RCM record: {e}")
            raise


    async def create(self, rcm_data: RCMCreate) -> RCM:
        """Async wrapper for UPSERT RCM"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, rcm_data)

        return await self.async_service.run_in_thread(_create)


    # ==================== UPDATE ====================
    def _update_sync(self, session: Session, rcm_id: str, rcm_data: RCMUpdate) -> Optional[RCM]:
        """Synchronous RCM update"""
        try:
            rcm = session.get(RCM, rcm_id)
            if not rcm:
                logger.warning(f"RCM record not found: {rcm_id}")
                return None
            
            update_data = rcm_data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(rcm, key, value)
            
            rcm.modified_date = datetime.utcnow()
            session.add(rcm)
            session.commit()
            session.refresh(rcm)
            logger.info(f"Updated RCM record: {rcm_id}")
            return rcm
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to update RCM record {rcm_id}: {e}")
            raise

    async def update(self, rcm_id: str, rcm_data: RCMUpdate) -> Optional[RCM]:
        """Async RCM update"""
        def _update():
            with get_session_context() as session:
                return self._update_sync(session, rcm_id, rcm_data)
        return await self.async_service.run_in_thread(_update)

    # ==================== DELETE ====================
    def _delete_sync(self, session: Session, rcm_id: str) -> bool:
        """Synchronous RCM deletion"""
        try:
            rcm = session.get(RCM, rcm_id)
            if not rcm:
                logger.warning(f"RCM record not found: {rcm_id}")
                return False
            
            session.delete(rcm)
            session.commit()
            logger.info(f"Deleted RCM record: {rcm_id}")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to delete RCM record {rcm_id}: {e}")
            raise

    async def delete(self, rcm_id: str) -> bool:
        """Async RCM deletion"""
        def _delete():
            with get_session_context() as session:
                return self._delete_sync(session, rcm_id)
        return await self.async_service.run_in_thread(_delete)

    # ==================== READ ====================
    def _get_all_sync(
        self, 
        session: Session, 
        ship_id: Optional[str] = None,
        component_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Synchronous RCM data retrieval with filtering"""
        try:
            # Base query joining RCM with SystemConfiguration
            query = (
                select(
                    RCM.rcm_id,
                    RCM.component_id,
                    RCM.decision_path,
                    RCM.maintenance_policy,
                    RCM.created_date,
                    RCM.modified_date,
                    SystemConfiguration.component_name,
                    SystemConfiguration.nomenclature,
                    SystemConfiguration.ship_id
                )
                .join(SystemConfiguration, RCM.component_id == SystemConfiguration.component_id)
            )
            
            # Apply filters
            if ship_id:
                query = query.where(SystemConfiguration.ship_id == ship_id)
            
            if component_id:
                query = query.where(RCM.component_id == component_id)
            
            # Execute query
            results = session.exec(query).all()
            
            # Convert to list of dictionaries
            rcm_data = []
            for row in results:
                rcm_data.append({
                    "rcm_id": row.rcm_id,
                    "component_id": row.component_id,
                    "decision_path": row.decision_path,
                    "maintenance_policy": row.maintenance_policy,
                    "created_date": row.created_date,
                    "modified_date": row.modified_date,
                    "component_name": row.component_name,
                    "nomenclature": row.nomenclature,
                    "ship_id": row.ship_id
                })
            
            logger.info(f"Retrieved {len(rcm_data)} RCM records (ship_id: {ship_id}, component_id: {component_id})")
            return rcm_data
            
        except Exception as e:
            logger.error(f"Failed to retrieve RCM records: {e}")
            raise

    async def get_all(
        self, 
        ship_id: Optional[str] = None,
        component_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Async RCM data retrieval
        
        Args:
            ship_id: Optional ship ID to filter RCM records by ship
            component_id: Optional component ID to filter specific component
            
        Returns:
            List of RCM records with component details (nomenclature, component_name)
        """
        def _get_all():
            with get_session_context() as session:
                return self._get_all_sync(session, ship_id, component_id)
        return await self.async_service.run_in_thread(_get_all)

    # ==================== GET BY ID ====================
    def _get_by_id_sync(self, session: Session, rcm_id: str) -> Optional[Dict[str, Any]]:
        """Synchronous RCM retrieval by ID"""
        try:
            query = (
                select(
                    RCM.rcm_id,
                    RCM.component_id,
                    RCM.decision_path,
                    RCM.maintenance_policy,
                    RCM.created_date,
                    RCM.modified_date,
                    SystemConfiguration.component_name,
                    SystemConfiguration.nomenclature,
                    SystemConfiguration.ship_id
                )
                .join(SystemConfiguration, RCM.component_id == SystemConfiguration.component_id)
                .where(RCM.rcm_id == rcm_id)
            )
            
            result = session.exec(query).first()
            
            if not result:
                logger.warning(f"RCM record not found: {rcm_id}")
                return None
            
            return {
                "rcm_id": result.rcm_id,
                "component_id": result.component_id,
                "decision_path": result.decision_path,
                "maintenance_policy": result.maintenance_policy,
                "created_date": result.created_date,
                "modified_date": result.modified_date,
                "component_name": result.component_name,
                "nomenclature": result.nomenclature,
                "ship_id": result.ship_id
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve RCM record {rcm_id}: {e}")
            raise

    async def get_by_id(self, rcm_id: str) -> Optional[Dict[str, Any]]:
        """Async RCM retrieval by ID"""
        def _get_by_id():
            with get_session_context() as session:
                return self._get_by_id_sync(session, rcm_id)
        return await self.async_service.run_in_thread(_get_by_id)

    # ==================== GET BY COMPONENT ID ====================
    def _get_by_component_sync(self, session: Session, component_id: str) -> Optional[Dict[str, Any]]:
        """Synchronous RCM retrieval by component ID"""
        try:
            query = (
                select(
                    RCM.rcm_id,
                    RCM.component_id,
                    RCM.decision_path,
                    RCM.maintenance_policy,
                    RCM.created_date,
                    RCM.modified_date,
                    SystemConfiguration.component_name,
                    SystemConfiguration.nomenclature,
                    SystemConfiguration.ship_id
                )
                .join(SystemConfiguration, RCM.component_id == SystemConfiguration.component_id)
                .where(RCM.component_id == component_id)
            )
            
            result = session.exec(query).first()
            
            if not result:
                logger.warning(f"RCM record not found for component: {component_id}")
                return None
            
            return {
                "rcm_id": result.rcm_id,
                "component_id": result.component_id,
                "decision_path": result.decision_path,
                "maintenance_policy": result.maintenance_policy,
                "created_date": result.created_date,
                "modified_date": result.modified_date,
                "component_name": result.component_name,
                "nomenclature": result.nomenclature,
                "ship_id": result.ship_id
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve RCM record for component {component_id}: {e}")
            raise

    async def get_by_component(self, component_id: str) -> Optional[Dict[str, Any]]:
        """Async RCM retrieval by component ID"""
        def _get_by_component():
            with get_session_context() as session:
                return self._get_by_component_sync(session, component_id)
        return await self.async_service.run_in_thread(_get_by_component)
    
    def _get_by_component_ids_sync(
        self, 
        session: Session, 
        component_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Synchronous batch retrieval of RCM records by multiple component_ids.
        Optimized query using SQL IN clause.
        """
        try:
            if not component_ids:
                return []
            
            # Convert string IDs to UUID for query
            from uuid import UUID
            uuid_list = []
            for comp_id in component_ids:
                try:
                    uuid_list.append(UUID(comp_id))
                except ValueError:
                    logger.warning(f"Invalid UUID format for component_id: {comp_id}")
            
            if not uuid_list:
                return []
            
            # Query with IN clause for batch fetch
            query = (
                select(
                    RCM.rcm_id,
                    RCM.component_id,
                    RCM.decision_path,
                    RCM.maintenance_policy,
                    RCM.created_date,
                    RCM.modified_date,
                    SystemConfiguration.component_name,
                    SystemConfiguration.nomenclature,
                    SystemConfiguration.ship_id
                )
                .join(SystemConfiguration, RCM.component_id == SystemConfiguration.component_id)
                .where(RCM.component_id.in_(uuid_list))
            )
            
            results = session.exec(query).all()
            
            # Convert to list of dictionaries
            rcm_data = []
            for row in results:
                rcm_data.append({
                    "rcm_id": row.rcm_id,
                    "component_id": str(row.component_id),  # Convert UUID to string
                    "decision_path": row.decision_path,
                    "maintenance_policy": row.maintenance_policy,
                    "created_date": row.created_date,
                    "modified_date": row.modified_date,
                    "component_name": row.component_name,
                    "nomenclature": row.nomenclature,
                    "ship_id": row.ship_id
                })
            
            logger.info(f"Batch retrieved {len(rcm_data)} RCM records for {len(component_ids)} component_ids")
            return rcm_data
            
        except Exception as e:
            logger.error(f"Failed to batch retrieve RCM records: {e}")
            raise

    async def get_by_component_ids(
        self, 
        component_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Async batch retrieval of RCM records by multiple component_ids.
        
        Args:
            component_ids: List of component ID strings to fetch RCM records for
            
        Returns:
            List of RCM records with component details
            
        Example:
            component_ids = ["uuid-1", "uuid-2", "uuid-3"]
            records = await rcm_repo.get_by_component_ids(component_ids)
        """
        def _get_by_component_ids():
            with get_session_context() as session:
                return self._get_by_component_ids_sync(session, component_ids)
        return await self.async_service.run_in_thread(_get_by_component_ids)