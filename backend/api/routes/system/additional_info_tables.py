"""
Routes for additional info tables — insert only.

Mount this router in your main app:
    from additional_info_routes import router as additional_info_router
    app.include_router(additional_info_router)
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from api.models.additional_info_tables import (
    # Maintenance config
    MaintenanceConfigurationData,
    MaintenanceConfigurationCreate,
    MaintenanceConfigurationRead,
    # Redundancy
    RedundancyData,
    RedundancyDataCreate,
    RedundancyDataRead,
    # Maintenance data
    DataManagerMaintenanceData,
    MaintenanceDataCreate,
    MaintenanceDataRead,
    # System config additional info
    SystemConfigAdditionalInfo,
    SystemConfigAdditionalInfoCreate,
    SystemConfigAdditionalInfoRead,
)
from api.db.connection import get_session

# ── Import your session dependency (adjust path to match your project) ─────────
# e.g. from database import get_session
# Replace the stub below with your actual import:


router = APIRouter(prefix="/additional-info", tags=["Additional Info"])


# ─── 1. Maintenance Configuration ─────────────────────────────────────────────

@router.post(
    "/maintenance-config",
    response_model=MaintenanceConfigurationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Insert a maintenance configuration record for a component",
)
def create_maintenance_config(
    payload: MaintenanceConfigurationCreate,
    session: Session = Depends(get_session),
) -> MaintenanceConfigurationRead:
    record = MaintenanceConfigurationData.model_validate(payload)
    session.add(record)
    try:
        session.commit()
        session.refresh(record)
    except Exception as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insert failed: {exc}",
        )
    return record


# ─── 2. Redundancy — batch insert (only rows with parallel components selected) ─

@router.post(
    "/redundancy/batch",
    response_model=List[RedundancyDataRead],
    status_code=status.HTTP_201_CREATED,
    summary="Batch insert redundancy rows (only rows where parallel components were selected)",
)
def create_redundancy_batch(
    payload: List[RedundancyDataCreate],
    session: Session = Depends(get_session),
) -> List[RedundancyDataRead]:
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload must contain at least one redundancy row.",
        )

    records = [RedundancyData.model_validate(row) for row in payload]
    for record in records:
        session.add(record)

    try:
        session.commit()
        for record in records:
            session.refresh(record)
    except Exception as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch insert failed: {exc}",
        )

    return records


# ─── 3. Maintenance Data ──────────────────────────────────────────────────────

@router.post(
    "/maintenance-data",
    response_model=MaintenanceDataRead,
    status_code=status.HTTP_201_CREATED,
    summary="Insert a maintenance data record for a component",
)
def create_maintenance_data(
    payload: MaintenanceDataCreate,
    session: Session = Depends(get_session),
) -> MaintenanceDataRead:
    record = DataManagerMaintenanceData.model_validate(payload)
    session.add(record)
    try:
        session.commit()
        session.refresh(record)
    except Exception as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insert failed: {exc}",
        )
    return record


# ─── 4. System Config Additional Info ─────────────────────────────────────────

@router.post(
    "/system-config",
    response_model=SystemConfigAdditionalInfoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Insert system config additional info (avg monthly utilization, installation date, unit)",
)
def create_system_config_additional(
    payload: SystemConfigAdditionalInfoCreate,
    session: Session = Depends(get_session),
) -> SystemConfigAdditionalInfoRead:
    record = SystemConfigAdditionalInfo.model_validate(payload)
    session.add(record)
    try:
        session.commit()
        session.refresh(record)
    except Exception as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insert failed: {exc}",
        )
    return record