from uuid import UUID
from api.db.dependencies import (
    get_department_repository,
)
from api.db.repos.system.department import DepartmentRepository
from fastapi import APIRouter, HTTPException, Depends, Path
from typing import List
import uuid
from api.models.systemconfiguration import (
    DepartmentRead,
    Department,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentStats,
)

# Create department_router
department_router = APIRouter(prefix="", tags=["department"])




# =============================================================================
# DEPARTMENT ENDPOINTS
# =============================================================================


@department_router.post("/departments", response_model=DepartmentRead, status_code=201)
async def create_department(
    department_data: DepartmentCreate,
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Create a new department"""
    try:
        return await repo.create(department_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@department_router.get("/departments/{department_id}", response_model=Department)
async def get_department_by_id(
    department_id: UUID = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Get department by ID"""
    department = repo.get_by_id(department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@department_router.get("/ships/{ship_id}/departments", response_model=List[Department])
async def get_departments_by_ship(
    ship_id: UUID = Path(..., description="Ship ID"),
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Get all departments for a ship"""
    return await repo.get_departments_by_ship(ship_id)


@department_router.get("/ships/{ship_id}/departments/{department_name}", response_model=Department)
async def get_department_by_ship_and_name(
    ship_id: UUID = Path(..., description="Ship ID"),
    department_name: str = Path(..., description="Department name"),
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Get department by ship and name"""
    department = repo.get_by_ship_and_name(ship_id, department_name)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@department_router.put("/departments/{department_id}", response_model=Department)
async def update_department(
    department_id: UUID = Path(..., description="Department ID"),
    department_data: DepartmentUpdate = ...,
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Update department"""
    department = repo.update(department_id, department_data)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@department_router.delete("/departments/{department_id}", status_code=204)
async def delete_department(
    department_id: UUID = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Delete department (cascade delete components)"""
    success = repo.delete(department_id)
    if not success:
        raise HTTPException(status_code=404, detail="Department not found")


@department_router.get("/departments/{department_id}/stats", response_model=DepartmentStats)
async def get_department_stats(
    department_id: UUID = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Get department statistics"""
    stats = repo.get_stats(department_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Department not found")
    return stats
