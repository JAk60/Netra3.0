from datetime import datetime
import logging
import sys
from typing import List

from api.models.mission_configuration import MissionConfiguration, MissionConfigurationCreate, MissionConfigurationRead, MissionConfigurationUpdate

sys.path.append('..')
from sqlmodel import Session, select
from api.db.connection import get_async_db_service, get_session_context


logger = logging.getLogger(__name__)

class Mission_ConfigService:
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()
    
    # CREATE
    def _create_sync(self, session: Session, config_data: MissionConfigurationCreate) -> MissionConfiguration:
        """Synchronous config creation"""
        try:
            config = MissionConfiguration(**config_data.dict())
            session.add(config)
            session.commit()
            session.refresh(config)
            logger.info(f"Created config: {config.config_name} (ID: {config.id})")
            return config
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create config: {e}")
            raise
    
    async def create(self, config_data: MissionConfigurationCreate) -> MissionConfiguration:
        """Async config creation"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, config_data)
        return await self.async_service.run_in_thread(_create)
    
    # READ ALL
    def _get_all_sync(self, session: Session) -> List[MissionConfigurationRead]:
        """Synchronous get all configs - returns Read models"""
        try:
            statement = select(MissionConfiguration).order_by(
                MissionConfiguration.modified_date.desc()
            )
            configs = session.exec(statement).all()
            
            # Convert ORM models to Pydantic Read models
            config_reads = [
                MissionConfigurationRead.model_validate(config) 
                for config in configs
            ]
            
            logger.info(f"Retrieved {len(config_reads)} configurations")
            
            if config_reads:
                logger.debug(f"Sample config: {config_reads[0].model_dump()}")
            
            return config_reads
            
        except Exception as e:
            logger.error(f"Failed to retrieve configs: {e}", exc_info=True)
            raise

    async def get_all(self) -> List[MissionConfigurationRead]:
        """Async get all configs - returns Read models"""
        def _get_all():
            with get_session_context() as session:
                return self._get_all_sync(session)
        
        result = await self.async_service.run_in_thread(_get_all)
        logger.debug(f"Async get_all returned {len(result)} configurations")
        return result
    # READ ONE
    def _get_by_id_sync(self, session: Session, config_id: str) -> MissionConfiguration | None:
        """Synchronous get config by ID"""
        try:
            config = session.get(MissionConfiguration, config_id)
            if config:
                logger.info(f"Retrieved config: {config.config_name}")
            return config
        except Exception as e:
            logger.error(f"Failed to retrieve config {config_id}: {e}")
            raise
    
    async def get_by_id(self, config_id: str) -> MissionConfiguration | None:
        """Async get config by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_by_id_sync(session, config_id)
        return await self.async_service.run_in_thread(_get)
    
    # UPDATE
    def _update_sync(self, session: Session, config_id: str, config_data: MissionConfigurationUpdate) -> MissionConfiguration | None:
        """Synchronous config update"""
        try:
            config = session.get(MissionConfiguration, config_id)
            if not config:
                return None
            
            update_data = config_data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(config, key, value)
            
            config.modified_date = datetime.utcnow()
            session.add(config)
            session.commit()
            session.refresh(config)
            logger.info(f"Updated config: {config.config_name} (ID: {config.id})")
            return config
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to update config {config_id}: {e}")
            raise
    
    async def update(self, config_id: str, config_data: MissionConfigurationUpdate) -> MissionConfiguration | None:
        """Async config update"""
        def _update():
            with get_session_context() as session:
                return self._update_sync(session, config_id, config_data)
        return await self.async_service.run_in_thread(_update)
    
    # DELETE
    def _delete_sync(self, session: Session, config_id: str) -> bool:
        """Synchronous config deletion"""
        try:
            config = session.get(MissionConfiguration, config_id)
            if not config:
                return False
            
            session.delete(config)
            session.commit()
            logger.info(f"Deleted config: {config.config_name} (ID: {config_id})")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to delete config {config_id}: {e}")
            raise
    
    async def delete(self, config_id: str) -> bool:
        """Async config deletion"""
        def _delete():
            with get_session_context() as session:
                return self._delete_sync(session, config_id)
        return await self.async_service.run_in_thread(_delete)
    
    # DUPLICATE
    async def duplicate(self, config_id: str) -> MissionConfiguration | None:
        """Create a copy of existing config"""
        config = await self.get_by_id(config_id)
        if not config:
            return None
        
        new_config_data = MissionConfigurationCreate(
            config_name=f"Copy of {config.config_name}",
            Mission_id=config.Mission_id,
            Mission_name=config.Mission_name,
            configuration=config.configuration
        )
        return await self.create(new_config_data)
    
    # COPY TO ANOTHER Mission
    async def copy_to_Mission(self, config_id: str, target_Mission_id: str, target_Mission_name: str) -> MissionConfiguration | None:
        """Copy config to another Mission (equipment mapping required on frontend)"""
        config = await self.get_by_id(config_id)
        if not config:
            return None
        
        new_config_data = MissionConfigurationCreate(
            config_name=f"{config.config_name} (for {target_Mission_name})",
            Mission_id=target_Mission_id,
            Mission_name=target_Mission_name,
            configuration=config.configuration  # Frontend handles equipment mapping
        )
        return await self.create(new_config_data)