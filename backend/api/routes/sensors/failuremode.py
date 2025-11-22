from uuid import UUID
from api.models.sensor import (
    FailureModeCreate,
    FailureModeRead,
    FailureModeUpdate
)
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from api.db.dependencies import get_failure_mode_repository
# from api.db.repositories import FailureModeRepository, SensorReadingRepository


router = APIRouter()
@router.post("/create_failure_mode", response_model=FailureModeRead)
async def create_failure_mode(
    failure_data: FailureModeCreate,
    repo = Depends(get_failure_mode_repository)
):
    """Create a new failure mode"""
    return await repo.create_failure_mode(failure_data)


@router.get("/", response_model=List[FailureModeRead])
async def get_failure_modes(
    skip: int = 0,
    limit: int = 100,
    repo = Depends(get_failure_mode_repository)
):
    """Get a list of failure modes with pagination"""
    return await repo.get_failure_modes(skip, limit)


@router.get("/{failuremode_id}", response_model=FailureModeRead)
async def get_failure_mode_by_id(
    failuremode_id: UUID,
    repo = Depends(get_failure_mode_repository)
):
    """Get failure mode by its ID"""
    failure_mode = await repo.get_failure_mode_by_id(failuremode_id)
    if not failure_mode:
        raise HTTPException(status_code=404, detail="Failure mode not found")
    return failure_mode


@router.get("/sensor/{sensor_id}", response_model=List[FailureModeRead])
async def get_failure_modes_by_sensor(
    sensor_id: str,
    repo = Depends(get_failure_mode_repository)
):
    """Get all failure modes linked to a specific sensor"""
    return await repo.get_failure_modes_by_sensor(sensor_id)


@router.put("/{failuremode_id}", response_model=FailureModeRead)
async def update_failure_mode(
    failuremode_id: UUID,
    failure_update: FailureModeUpdate,
    repo = Depends(get_failure_mode_repository)
):
    """Update an existing failure mode"""
    updated = await repo.update_failure_mode(failuremode_id, failure_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Failure mode not found")
    return updated


@router.delete("/{failuremode_id}")
async def delete_failure_mode(
    failuremode_id: UUID,
    repo = Depends(get_failure_mode_repository)
):
    """Delete a failure mode"""
    deleted = await repo.delete_failure_mode(failuremode_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Failure mode not found")