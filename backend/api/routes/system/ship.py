from typing import List
from uuid import UUID

from api.db.dependencies import (
    get_ship_repository,
)
from api.db.repos.system.ship import ShipRepository
from api.models.systemconfiguration import (
    Ship,
    ShipCreate,
    ShipRead,
    ShipSearchFilter,
    ShipStats,
    ShipUpdate,
)
from fastapi import APIRouter, Depends, HTTPException, Path, Query

# Create ship_router
ship_router = APIRouter(prefix="", tags=["ships"])

# =============================================================================
# SHIP ENDPOINTS
# =============================================================================


@ship_router.post("/ships", response_model=Ship, status_code=201)
async def create_ship(
    ship_data: ShipCreate, repo: ShipRepository = Depends(get_ship_repository)
):
    """Create a new ship"""
    try:
        return await repo.create_ship(ship_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@ship_router.get("/ships/{ship_id}", response_model=Ship)
async def get_ship_by_id(
    ship_id: int = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Get ship by ID"""
    ship = repo.get_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship


@ship_router.get("/ships/name/{ship_name}", response_model=Ship)
async def get_ship_by_name(
    ship_name: str = Path(..., description="Ship name"),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Get ship by name"""
    ship = repo.get_by_name(ship_name)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship


@ship_router.get("/ships", response_model=List[ShipRead])
async def get_all_ships(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Get all ships with pagination"""
    return await repo.get_all_ships(skip=skip, limit=limit)


@ship_router.post("/ships/search", response_model=List[Ship])
async def search_ships(
    filters: ShipSearchFilter,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Search ships with filters"""
    return repo.search(filters, skip=skip, limit=limit)


@ship_router.put("/ships/{ship_id}", response_model=Ship)
async def update_ship(
    ship_id: UUID = Path(..., description="Ship ID"),  # FIXED
    ship_data: ShipUpdate = ...,
    repo: ShipRepository = Depends(get_ship_repository),
):
    ship = await repo.update_ship(ship_id, ship_data)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship



@ship_router.delete("/ships/{ship_id}", status_code=204)
async def delete_ship(
    ship_id: UUID = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Delete ship (cascade delete departments and components)"""
    success = await repo.delete_ship(ship_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ship not found")


@ship_router.get("/ships/{ship_id}/stats", response_model=ShipStats)
async def get_ship_stats(
    ship_id: int = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Get ship statistics"""
    stats = repo.get_stats(ship_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Ship not found")
    return stats