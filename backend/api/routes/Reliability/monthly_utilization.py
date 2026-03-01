"""
FastAPI router — Monthly Utilization
=====================================
Mount in your app with:

    from api.routes.monthly_utilization import router as monthly_utilization_router
    app.include_router(monthly_utilization_router)

Endpoints
---------
GET    /monthly-utilization                   list by component_id
GET    /monthly-utilization/current-age       current running age
GET    /monthly-utilization/{record_id}       single record
POST   /monthly-utilization                   create single
PATCH  /monthly-utilization/{record_id}       update
DELETE /monthly-utilization/{record_id}       delete
POST   /monthly-utilization/bulk              bulk insert
"""

import uuid
from typing import Annotated

from api.db.repos.reliability.monthly_utilization import MonthlyUtilizationRepository
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from api.db.connection import get_session
from api.models.reliability.params import (
    BulkInsertPayload,
    BulkInsertResponse,
    MonthlyUtilizationCreate,
    MonthlyUtilizationRead,
    MonthlyUtilizationUpdate,
)


import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/monthly-utilization",
    tags=["Monthly Utilization"],
)


# ── Dependency ────────────────────────────────────────────────────────────────

def get_repo(session: Session = Depends(get_session)) -> MonthlyUtilizationRepository:
    return MonthlyUtilizationRepository(session=session)


RepoDepends = Annotated[MonthlyUtilizationRepository, Depends(get_repo)]


# ─────────────────────────────────────────────────────────────────────────────
# GET  /monthly-utilization/current-age
# Must be declared BEFORE /{record_id} to avoid path collision
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/current-age",
    summary="Get current effective running age for a component",
    response_model=dict,
)
async def get_current_age(
    component_id: Annotated[uuid.UUID, Query(description="Component UUID")],
    repo: RepoDepends,
):
    """
    Returns the effective running age:
    - `null`  — no overhaul records exist
    - `0.0`   — latest event was an Overhaul (age resets)
    - `float` — actual running_age from latest record
    """
    age = await repo.get_current_age(component_id)
    return {"component_id": str(component_id), "age": age}


# ─────────────────────────────────────────────────────────────────────────────
# GET  /monthly-utilization
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "",
    summary="List monthly utilization records for a component",
    response_model=list[MonthlyUtilizationRead],
)
async def list_utilization(
    component_id: Annotated[uuid.UUID, Query(description="Component UUID")],
    repo: RepoDepends,
):
    """Returns all records for the given component, ordered newest first."""
    records = await repo.list_by_component(component_id)
    return records


# ─────────────────────────────────────────────────────────────────────────────
# GET  /monthly-utilization/{record_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/{record_id}",
    summary="Get a single monthly utilization record",
    response_model=MonthlyUtilizationRead,
)
async def get_utilization(
    record_id: uuid.UUID,
    repo: RepoDepends,
):
    record = await repo.get_by_id(record_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record {record_id} not found",
        )
    return record


# ─────────────────────────────────────────────────────────────────────────────
# POST  /monthly-utilization
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "",
    summary="Create a single monthly utilization record",
    response_model=MonthlyUtilizationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_utilization(
    payload: MonthlyUtilizationCreate,
    repo: RepoDepends,
):
    try:
        record = await repo.create(
            component_id=payload.component_id,
            operation_date=payload.operation_date,
            utilization=payload.utlization,
        )
        return record
    except Exception as exc:
        logger.error("Create failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create record",
        )


# ─────────────────────────────────────────────────────────────────────────────
# PATCH  /monthly-utilization/{record_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.patch(
    "/{record_id}",
    summary="Update a monthly utilization record (partial update)",
    response_model=MonthlyUtilizationRead,
)
async def update_utilization(
    record_id: uuid.UUID,
    payload: MonthlyUtilizationUpdate,
    repo: RepoDepends,
):
    if payload.operation_date is None and payload.utlization is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one of operation_date or utlization must be provided",
        )

    try:
        record = await repo.update(
            record_id=record_id,
            operation_date=payload.operation_date,
            utilization=payload.utlization,
        )
    except Exception as exc:
        logger.error("Update failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update record",
        )

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record {record_id} not found",
        )

    return record


# ─────────────────────────────────────────────────────────────────────────────
# DELETE  /monthly-utilization/{record_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.delete(
    "/{record_id}",
    summary="Delete a monthly utilization record",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_utilization(
    record_id: uuid.UUID,
    repo: RepoDepends,
):
    try:
        deleted = await repo.delete(record_id)
    except Exception as exc:
        logger.error("Delete failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete record",
        )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record {record_id} not found",
        )

    # 204 — no body


# ─────────────────────────────────────────────────────────────────────────────
# POST  /monthly-utilization/bulk
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/bulk",
    summary="Bulk insert monthly utilization records",
    response_model=BulkInsertResponse,
    status_code=status.HTTP_201_CREATED,
)
async def bulk_insert_utilization(
    payload: BulkInsertPayload,
    repo: RepoDepends,
):
    """
    Insert multiple records in a single call.
    SQL Server safe — uses ORM-level chunked inserts (500 rows per chunk)
    to stay within the 2100 parameter limit.
    """
    if not payload.records:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="records list must not be empty",
        )

    records_dicts = [
        {
            "operation_date": r.operation_date,
            "utlization": r.utlization,
            "component_id": r.component_id,
        }
        for r in payload.records
    ]

    try:
        inserted = await repo.bulk_insert(records_dicts)
    except Exception as exc:
        logger.error("Bulk insert failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk insert failed",
        )

    return BulkInsertResponse(
        inserted=inserted,
        message=f"Successfully inserted {inserted} record(s)",
    )