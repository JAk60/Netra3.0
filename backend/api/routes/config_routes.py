# routes/config_routes.py

from fastapi import APIRouter, HTTPException, status
from db.repos.ship_config.config import ConfigService
from models.ship_configuration import (
    ShipConfiguration,
    ShipConfigurationCreate,
    ShipConfigurationUpdate
)

router = APIRouter(prefix="/api/configs", tags=["configurations"])
config_service = ConfigService()

@router.post("/", response_model=ShipConfiguration, status_code=status.HTTP_201_CREATED)
async def create_config(config_data: ShipConfigurationCreate):
    """Create new ship configuration"""
    return await config_service.create(config_data)

@router.get("/", response_model=list[ShipConfiguration])
async def get_all_configs():
    """Get all configurations"""
    return await config_service.get_all()

@router.get("/{config_id}", response_model=ShipConfiguration)
async def get_config(config_id: str):
    """Get single configuration"""
    config = await config_service.get_by_id(config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@router.put("/{config_id}", response_model=ShipConfiguration)
async def update_config(config_id: str, config_data: ShipConfigurationUpdate):
    """Update configuration"""
    config = await config_service.update(config_id, config_data)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_config(config_id: str):
    """Delete configuration"""
    success = await config_service.delete(config_id)
    if not success:
        raise HTTPException(status_code=404, detail="Configuration not found")

@router.post("/{config_id}/duplicate", response_model=ShipConfiguration)
async def duplicate_config(config_id: str):
    """Duplicate existing configuration"""
    config = await config_service.duplicate(config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@router.post("/{config_id}/copy-to-ship", response_model=ShipConfiguration)
async def copy_to_ship(
    config_id: str,
    target_ship_id: str,
    target_ship_name: str
):
    """Copy configuration to another ship"""
    config = await config_service.copy_to_ship(config_id, target_ship_id, target_ship_name)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config