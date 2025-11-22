from datetime import datetime
import logging
import sys

from models.ship_configuration import ShipConfiguration, ShipConfigurationCreate, ShipConfigurationUpdate

sys.path.append('..')
from sqlmodel import Session, select
from api.db.connection import get_async_db_service, get_session_context


logger = logging.getLogger(__name__)

class ConfigService:
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()
    
    # CREATE
    def _create_sync(self, session: Session, config_data: ShipConfigurationCreate) -> ShipConfiguration:
        """Synchronous config creation"""
        try:
            config = ShipConfiguration(**config_data.dict())
            session.add(config)
            session.commit()
            session.refresh(config)
            logger.info(f"Created config: {config.config_name} (ID: {config.id})")
            return config
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create config: {e}")
            raise
    
    async def create(self, config_data: ShipConfigurationCreate) -> ShipConfiguration:
        """Async config creation"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, config_data)
        return await self.async_service.run_in_thread(_create)
    
    # READ ALL
    def _get_all_sync(self, session: Session) -> list[ShipConfiguration]:
        """Synchronous get all configs"""
        try:
            statement = select(ShipConfiguration).order_by(ShipConfiguration.modified_date.desc())
            configs = session.exec(statement).all()
            logger.info(f"Retrieved {len(configs)} configurations")
            return configs
        except Exception as e:
            logger.error(f"Failed to retrieve configs: {e}")
            raise
    
    async def get_all(self) -> list[ShipConfiguration]:
        """Async get all configs"""
        def _get_all():
            with get_session_context() as session:
                return self._get_all_sync(session)
        return await self.async_service.run_in_thread(_get_all)
    
    # READ ONE
    def _get_by_id_sync(self, session: Session, config_id: str) -> ShipConfiguration | None:
        """Synchronous get config by ID"""
        try:
            config = session.get(ShipConfiguration, config_id)
            if config:
                logger.info(f"Retrieved config: {config.config_name}")
            return config
        except Exception as e:
            logger.error(f"Failed to retrieve config {config_id}: {e}")
            raise
    
    async def get_by_id(self, config_id: str) -> ShipConfiguration | None:
        """Async get config by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_by_id_sync(session, config_id)
        return await self.async_service.run_in_thread(_get)
    
    # UPDATE
    def _update_sync(self, session: Session, config_id: str, config_data: ShipConfigurationUpdate) -> ShipConfiguration | None:
        """Synchronous config update"""
        try:
            config = session.get(ShipConfiguration, config_id)
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
    
    async def update(self, config_id: str, config_data: ShipConfigurationUpdate) -> ShipConfiguration | None:
        """Async config update"""
        def _update():
            with get_session_context() as session:
                return self._update_sync(session, config_id, config_data)
        return await self.async_service.run_in_thread(_update)
    
    # DELETE
    def _delete_sync(self, session: Session, config_id: str) -> bool:
        """Synchronous config deletion"""
        try:
            config = session.get(ShipConfiguration, config_id)
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
    async def duplicate(self, config_id: str) -> ShipConfiguration | None:
        """Create a copy of existing config"""
        config = await self.get_by_id(config_id)
        if not config:
            return None
        
        new_config_data = ShipConfigurationCreate(
            config_name=f"Copy of {config.config_name}",
            ship_id=config.ship_id,
            ship_name=config.ship_name,
            configuration=config.configuration
        )
        return await self.create(new_config_data)
    
    # COPY TO ANOTHER SHIP
    async def copy_to_ship(self, config_id: str, target_ship_id: str, target_ship_name: str) -> ShipConfiguration | None:
        """Copy config to another ship (equipment mapping required on frontend)"""
        config = await self.get_by_id(config_id)
        if not config:
            return None
        
        new_config_data = ShipConfigurationCreate(
            config_name=f"{config.config_name} (for {target_ship_name})",
            ship_id=target_ship_id,
            ship_name=target_ship_name,
            configuration=config.configuration  # Frontend handles equipment mapping
        )
        return await self.create(new_config_data)