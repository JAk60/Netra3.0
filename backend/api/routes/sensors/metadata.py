from uuid import UUID
from api.models.sensor import (
    FailureModesAnalysisResponse,
    SensorMetadata,
    SensorMetadataCreate,
    SensorMetadataUpdate
)

from fastapi import APIRouter, HTTPException, Query, Path, Depends
from typing import List, Optional
from api.db.dependencies import get_sensor_repository
# from api.db.repositories import FailureModeRepository, SensorReadingRepository


router = APIRouter()

# SENSOR METADATA ENDPOINTS


@router.post("/create", response_model=SensorMetadata, status_code=201)
async def create_sensor(
    sensor_data: SensorMetadataCreate,  
    sensor_repo = Depends(get_sensor_repository)
):
    """Create a new sensor"""
    try:
        return await sensor_repo.create_sensor(sensor_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error {str(e)}")
    
@router.get("/ans", response_model=FailureModesAnalysisResponse)
async def get_failure_modes_analysis(
    component_id: Optional[UUID] = Query(None, description="Filter by component ID"),
    metadata_repo = Depends(get_sensor_repository)
):
    """
    Get comprehensive analysis of failure modes and their associated sensors.
    
    Returns:
        - Total failure modes count
        - Total sensors count
        - Alerted sensors count (sensors with P and F values)
        - Sensors without failure modes count
        - Detailed breakdown of each failure mode with associated sensors
    """
    print("=== ANALYSIS ENDPOINT CALLED ===")
    print(f"component_id: {component_id}")
    print(f"service: {metadata_repo}")
    return await metadata_repo.get_failure_modes_analysis(component_id)


@router.get("/", response_model=List[SensorMetadata])
async def get_sensors(
    skip: int = Query(0, ge=0, description="Number of sensors to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of sensors to return"),
    sensor_repo = Depends(get_sensor_repository)
):
    """Get all sensors with pagination"""
    try:
        return await sensor_repo.get_sensors(skip=skip, limit=limit)
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{sensor_id}", response_model=SensorMetadata)
async def get_sensor_by_id(
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    sensor_repo = Depends(get_sensor_repository)
):
    """Get a specific sensor by ID"""
    try:
        sensor = await sensor_repo.get_sensor_by_id(sensor_id)
        if not sensor:
            raise HTTPException(
                status_code=404, detail=f"Sensor with ID {sensor_id} not found")
        return sensor
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/component/{component_id}", response_model=List[SensorMetadata])
async def get_sensors_by_component(
    component_id: str = Path(..., description="Component identifier"),
    sensor_repo = Depends(get_sensor_repository)
):
    """Get all sensors for a specific component"""
    try:
        return await sensor_repo.get_sensors_by_component(component_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{sensor_id}", response_model=SensorMetadata)
async def update_sensor(
    sensor_update: SensorMetadataUpdate,
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    sensor_repo = Depends(get_sensor_repository)
):
    """Update a sensor's metadata"""
    try:
        updated_sensor = await sensor_repo.update_sensor(sensor_id, sensor_update)
        if not updated_sensor:
            raise HTTPException(
                status_code=404, detail=f"Sensor with ID {sensor_id} not found")
        return updated_sensor
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{sensor_id}", status_code=204)
async def delete_sensor(
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    sensor_repo = Depends(get_sensor_repository)
):
    """Delete a sensor"""
    try:
        deleted = await sensor_repo.delete_sensor(sensor_id)
        if not deleted:
            raise HTTPException(
                status_code=404, detail=f"Sensor with ID {sensor_id} not found")
        return None
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
