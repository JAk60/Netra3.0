
from tkinter.tix import STATUS
from uuid import UUID
from backend.api.models.sensor import (
    FailureModeCreate,
    FailureModeRead,
    FailureModeUpdate,
    SensorMetadata,
    SensorReading,
    SensorMetadataCreate,
    SensorReadingCreate,
    SensorMetadataUpdate,
    SensorReadingUpdate
)

from fastapi import APIRouter, HTTPException, Query, Path, Depends
from typing import List, Optional
from datetime import datetime
from db.dependencies import get_sensor_repository, get_sensor_reading_repository,get_failure_mode_repository
from db.repositories import FailureModeRepository, SensorRepository, SensorReadingRepository

router = APIRouter()

# SENSOR METADATA ENDPOINTS


@router.post("/", response_model=SensorMetadata, status_code=201)
async def create_sensor(
    sensor_data: SensorMetadataCreate,
    sensor_repo: SensorRepository = Depends(get_sensor_repository)
):
    """Create a new sensor"""
    try:
        return await sensor_repo.create_sensor(sensor_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=List[SensorMetadata])
async def get_sensors(
    skip: int = Query(0, ge=0, description="Number of sensors to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of sensors to return"),
    sensor_repo: SensorRepository = Depends(get_sensor_repository)
):
    """Get all sensors with pagination"""
    try:
        return await sensor_repo.get_sensors(skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{sensor_id}", response_model=SensorMetadata)
async def get_sensor_by_id(
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    sensor_repo: SensorRepository = Depends(get_sensor_repository)
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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/component/{component_id}", response_model=List[SensorMetadata])
async def get_sensors_by_component(
    component_id: str = Path(..., description="Component identifier"),
    sensor_repo: SensorRepository = Depends(get_sensor_repository)
):
    """Get all sensors for a specific component"""
    try:
        return await sensor_repo.get_sensors_by_component(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{sensor_id}", response_model=SensorMetadata)
async def update_sensor(
    sensor_update: SensorMetadataUpdate,
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    sensor_repo: SensorRepository = Depends(get_sensor_repository)
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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{sensor_id}", status_code=204)
async def delete_sensor(
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    sensor_repo: SensorRepository = Depends(get_sensor_repository)
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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# SENSOR READINGS ENDPOINTS


@router.post("/{sensor_id}/readings", response_model=SensorReading, status_code=201)
async def create_sensor_reading(
    reading_data: SensorReadingCreate,
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Create a new sensor reading"""
    try:
        # Ensure the sensor_id in the path matches the one in the payload
        if reading_data.sensor_id != sensor_id:
            raise HTTPException(
                status_code=400,
                detail="Sensor ID in path must match sensor ID in request body"
            )
        return await reading_repo.create_reading(reading_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/readings/bulk", response_model=List[SensorReading], status_code=201)
async def bulk_create_readings(
    readings_data: List[SensorReadingCreate],
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Create multiple sensor readings in bulk"""
    try:
        if not readings_data:
            raise HTTPException(status_code=400, detail="No readings provided")
        if len(readings_data) > 1000:  # Reasonable limit
            raise HTTPException(
                status_code=400, detail="Too many readings (max 1000)")
        return await reading_repo.bulk_create_readings(readings_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/readings", response_model=List[SensorReading])
async def get_readings(
    sensor_id: Optional[str] = Query(None, description="Filter by sensor ID"),
    component_id: Optional[str] = Query(
        None, description="Filter by component ID"),
    start_date: Optional[datetime] = Query(
        None, description="Filter readings from this date"),
    end_date: Optional[datetime] = Query(
        None, description="Filter readings until this date"),
    skip: int = Query(0, ge=0, description="Number of readings to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of readings to return"),
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Get sensor readings with various filters"""
    try:
        # Validate date range
        if start_date and end_date and start_date > end_date:
            raise HTTPException(
                status_code=400, detail="start_date must be before end_date")

        return await reading_repo.get_readings(
            sensor_id=sensor_id,
            component_id=component_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{sensor_id}/readings", response_model=List[SensorReading])
async def get_sensor_readings(
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    start_date: Optional[datetime] = Query(
        None, description="Filter readings from this date"),
    end_date: Optional[datetime] = Query(
        None, description="Filter readings until this date"),
    skip: int = Query(0, ge=0, description="Number of readings to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of readings to return"),
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Get readings for a specific sensor"""
    try:
        # Validate date range
        if start_date and end_date and start_date > end_date:
            raise HTTPException(
                status_code=400, detail="start_date must be before end_date")

        return await reading_repo.get_readings(
            sensor_id=sensor_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/readings/latest", response_model=List[SensorReading])
async def get_latest_readings(
    limit: int = Query(
        50, ge=1, le=500, description="Maximum number of latest readings to return"),
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Get the most recent sensor readings across all sensors"""
    try:
        return await reading_repo.get_latest_readings(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/readings/alerts", response_model=List[SensorReading])
async def get_active_alerts(
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Get all active sensor alerts"""
    try:
        return await reading_repo.get_active_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{sensor_id}/stats")
async def get_sensor_statistics(
    sensor_id: str = Path(..., description="Unique sensor identifier"),
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Get statistical summary for a specific sensor"""
    try:
        stats = await reading_repo.get_sensor_stats(sensor_id)
        if not stats:
            raise HTTPException(
                status_code=404,
                detail=f"No statistics available for sensor {sensor_id} (sensor may not exist or have no readings)"
            )
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# HEALTH CHECK AND UTILITY ENDPOINTS


@router.get("/health", status_code=200)
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "sensor-api"}


@router.get("/component/{component_id}/readings", response_model=List[SensorReading])
async def get_component_readings(
    component_id: str = Path(..., description="Component identifier"),
    start_date: Optional[datetime] = Query(
        None, description="Filter readings from this date"),
    end_date: Optional[datetime] = Query(
        None, description="Filter readings until this date"),
    skip: int = Query(0, ge=0, description="Number of readings to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of readings to return"),
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Get all readings for sensors belonging to a specific component"""
    try:
        # Validate date range
        if start_date and end_date and start_date > end_date:
            raise HTTPException(
                status_code=400, detail="start_date must be before end_date")

        return await reading_repo.get_readings(
            component_id=component_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/component/{component_id}/alerts", response_model=List[SensorReading])
async def get_component_alerts(
    component_id: str = Path(..., description="Component identifier"),
    reading_repo: SensorReadingRepository = Depends(
        get_sensor_reading_repository)
):
    """Get active alerts for all sensors in a specific component"""
    try:
        # Get all alerts and filter by component_id
        all_alerts = await reading_repo.get_active_alerts()
        component_alerts = [
            alert for alert in all_alerts if alert.component_id == component_id]
        return component_alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")




@router.post("/", response_model=FailureModeRead)
async def create_failure_mode(
    failure_data: FailureModeCreate,
    repo: FailureModeRepository = Depends(get_failure_mode_repository)
):
    """Create a new failure mode"""
    return await repo.create_failure_mode(failure_data)


@router.get("/", response_model=List[FailureModeRead])
async def get_failure_modes(
    skip: int = 0,
    limit: int = 100,
    repo: FailureModeRepository = Depends(get_failure_mode_repository)
):
    """Get a list of failure modes with pagination"""
    return await repo.get_failure_modes(skip, limit)


@router.get("/{failuremode_id}", response_model=FailureModeRead)
async def get_failure_mode_by_id(
    failuremode_id: UUID,
    repo: FailureModeRepository = Depends(get_failure_mode_repository)
):
    """Get failure mode by its ID"""
    failure_mode = await repo.get_failure_mode_by_id(failuremode_id)
    if not failure_mode:
        raise HTTPException(status_code=404, detail="Failure mode not found")
    return failure_mode


@router.get("/sensor/{sensor_id}", response_model=List[FailureModeRead])
async def get_failure_modes_by_sensor(
    sensor_id: str,
    repo: FailureModeRepository = Depends(get_failure_mode_repository)
):
    """Get all failure modes linked to a specific sensor"""
    return await repo.get_failure_modes_by_sensor(sensor_id)


@router.put("/{failuremode_id}", response_model=FailureModeRead)
async def update_failure_mode(
    failuremode_id: UUID,
    failure_update: FailureModeUpdate,
    repo: FailureModeRepository = Depends(get_failure_mode_repository)
):
    """Update an existing failure mode"""
    updated = await repo.update_failure_mode(failuremode_id, failure_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Failure mode not found")
    return updated


@router.delete("/{failuremode_id}")
async def delete_failure_mode(
    failuremode_id: UUID,
    repo: FailureModeRepository = Depends(get_failure_mode_repository)
):
    """Delete a failure mode"""
    deleted = await repo.delete_failure_mode(failuremode_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Failure mode not found")
