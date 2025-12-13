from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from api.db.connection import get_async_db_service, get_session_context

import logging

from api.models.Overhaul import Overhaul_Readings, Overhaul_metadata, OverhaulMetadataCreate, OverhaulReadingsCreate


from api.models.systemconfiguration import SystemConfiguration

logger = logging.getLogger(__name__)


class OverhaulMetadataRepository:
    '''Repository for Overhaul related database operations'''

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(
        self, 
        session: Session, 
        metadata_data: OverhaulMetadataCreate
    ) -> dict:
        """Synchronous overhaul metadata creation"""
        try:
            metadata = Overhaul_metadata(**metadata_data.dict())
            session.add(metadata)
            session.commit()
            session.refresh(metadata)
            logger.info(
                f"Created overhaul metadata for component: {metadata.component_id} "
                f"(ID: {metadata.id})"
            )
            
            # Convert to dict before session closes
            result = {
                "id": metadata.id,
                "component_id": metadata.component_id,
                "overhaul_frequency_hours": metadata.overhaul_frequency_hours,
                "total_overhaul_events": metadata.total_overhaul_events,
                "last_overhaul_date": metadata.last_overhaul_date
            }
            return result
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create overhaul metadata: {e}")
            raise

    async def create(
        self, 
        metadata_data: OverhaulMetadataCreate
    ) -> dict:
        """Async overhaul metadata creation"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, metadata_data)
        return await self.async_service.run_in_thread(_create)

    def _get_by_component_id_sync(
        self, 
        session: Session, 
        component_id: UUID
    ) -> Optional[dict]:
        """Synchronous get overhaul metadata by component_id"""
        try:
            statement = select(Overhaul_metadata).where(
                Overhaul_metadata.component_id == component_id
            )
            metadata = session.exec(statement).first()
            
            if not metadata:
                logger.warning(f"Overhaul metadata not found for component_id: {component_id}")
                return None
            
            # Convert to dict before session closes
            result = {
                "id": metadata.id,
                "component_id": metadata.component_id,
                "overhaul_frequency_hours": metadata.overhaul_frequency_hours,
                "total_overhaul_events": metadata.total_overhaul_events,
                "last_overhaul_date": metadata.last_overhaul_date
            }
            
            logger.info(f"Retrieved overhaul metadata for component_id: {component_id}")
            return result
        except Exception as e:
            logger.error(f"Failed to retrieve overhaul metadata by component_id: {e}")
            raise

    async def get_by_component_id(
        self, 
        component_id: UUID
    ) -> Optional[dict]:
        """Async get overhaul metadata by component_id"""
        def _get_by_component_id():
            with get_session_context() as session:
                return self._get_by_component_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_get_by_component_id)

    def _get_all_sync(
        self, 
        session: Session, 
        ship_id: Optional[UUID] = None
    ) -> List[dict]:
        """Synchronous get all overhaul metadata"""
        try:
            # Join with system_configuration to filter by ship_id
            statement = select(Overhaul_metadata).join(
                SystemConfiguration,
                Overhaul_metadata.component_id == SystemConfiguration.component_id
            )
            
            # Filter by ship_id if provided
            if ship_id:
                statement = statement.where(SystemConfiguration.ship_id == ship_id)
            
            metadata_list = session.exec(statement).all()
            
            # Convert to list of dicts before session closes
            result = [
                {
                    "id": metadata.id,
                    "component_id": metadata.component_id,
                    "overhaul_frequency_hours": metadata.overhaul_frequency_hours,
                    "total_overhaul_events": metadata.total_overhaul_events,
                    "last_overhaul_date": metadata.last_overhaul_date
                }
                for metadata in metadata_list
            ]
            
            logger.info(f"Retrieved {len(result)} overhaul metadata records for ship_id: {ship_id}")
            return result
        except Exception as e:
            logger.error(f"Failed to retrieve overhaul metadata: {e}")
            raise

    async def get_all(
        self, 
        ship_id: Optional[UUID] = None
    ) -> List[dict]:
        """Async get all overhaul metadata"""
        def _get_all():
            with get_session_context() as session:
                return self._get_all_sync(session, ship_id)
        return await self.async_service.run_in_thread(_get_all)





class OverhaulReadingsRepository:
    '''Repository for Overhaul Readings related database operations'''
    
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()
    
    def _create_sync(
        self, 
        session: Session, 
        readings_data: OverhaulReadingsCreate
    ) -> dict:
        """Synchronous overhaul readings creation"""
        try:
            readings = Overhaul_Readings(**readings_data.dict())
            session.add(readings)
            session.commit()
            session.refresh(readings)
            logger.info(
                f"Created overhaul reading for component: {readings.component_id} "
                f"(ID: {readings.id})"
            )
            
            # Convert to dict before session closes
            result = {
                "id": readings.id,
                "component_id": readings.component_id,
                "maintenance_type": readings.maintenance_type,
                "defect_date": readings.defect_date,
                "cmms_running_age": readings.cmms_running_age,
                "running_age": readings.running_age
            }
            return result
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create overhaul reading: {e}")
            raise

    async def create(
        self, 
        readings_data: OverhaulReadingsCreate
    ) -> dict:
        """Async overhaul readings creation"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, readings_data)
        return await self.async_service.run_in_thread(_create)

    def _get_by_component_id_sync(
        self, 
        session: Session, 
        component_id: UUID
    ) -> List[dict]:
        """Synchronous get all overhaul readings by component_id"""
        try:
            statement = select(Overhaul_Readings).where(
                Overhaul_Readings.component_id == component_id
            )
            readings = session.exec(statement).all()
            
            # Convert to list of dicts before session closes
            result = [
                {
                    "id": reading.id,
                    "component_id": reading.component_id,
                    "maintenance_type": reading.maintenance_type,
                    "defect_date": reading.defect_date,
                    "cmms_running_age": reading.cmms_running_age,
                    "running_age": reading.running_age
                }
                for reading in readings
            ]
            
            logger.info(f"Retrieved {len(result)} overhaul readings for component_id: {component_id}")
            return result
        except Exception as e:
            logger.error(f"Failed to retrieve overhaul readings by component_id: {e}")
            raise

    async def get_by_component_id(
        self, 
        component_id: UUID
    ) -> List[dict]:
        """Async get all overhaul readings by component_id"""
        def _get_by_component_id():
            with get_session_context() as session:
                return self._get_by_component_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_get_by_component_id)