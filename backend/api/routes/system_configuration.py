from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# Import your repository classes and models
from db.repositories import ShipRepository, DepartmentRepository, SystemConfigurationRepository
from backend.api.models.systemconfiguration import (
    DepartmentRead, Ship, Department, ShipRead, SystemConfiguration,
    ShipCreate, ShipUpdate, ShipSearchFilter, ShipStats,
    DepartmentCreate, DepartmentUpdate, DepartmentStats,
    SystemConfigurationCreate, SystemConfigurationRead, SystemConfigurationUpdate, ComponentSearchFilter,
    ComponentHierarchyStats, BulkComponentCreate, BulkOperationResult
)
from db.connection import get_async_db_service

# Create router
router = APIRouter(prefix="", tags=["system_configuration"])

# Dependency to get repositories


def get_ship_repo(session: Session = Depends(get_async_db_service)) -> ShipRepository:
    return ShipRepository(session)


def get_department_repo(session: Session = Depends(get_async_db_service)) -> DepartmentRepository:
    return DepartmentRepository(session)


def get_component_repo(session: Session = Depends(get_async_db_service)) -> SystemConfigurationRepository:
    return SystemConfigurationRepository(session)

# =============================================================================
# SHIP ENDPOINTS
# =============================================================================


@router.post("/ships", response_model=Ship, status_code=201)
async def create_ship(
    ship_data: ShipCreate,
    repo: ShipRepository = Depends(get_ship_repo)
):
    """Create a new ship"""
    try:
        return await repo.create_ship(ship_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/ships/{ship_id}", response_model=Ship)
async def get_ship_by_id(
    ship_id: int = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repo)
):
    """Get ship by ID"""
    ship = repo.get_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship


@router.get("/ships/name/{ship_name}", response_model=Ship)
async def get_ship_by_name(
    ship_name: str = Path(..., description="Ship name"),
    repo: ShipRepository = Depends(get_ship_repo)
):
    """Get ship by name"""
    ship = repo.get_by_name(ship_name)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship


@router.get("/ships", response_model=List[ShipRead])
async def get_all_ships(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of records to return"),
    repo: ShipRepository = Depends(get_ship_repo)
):
    """Get all ships with pagination"""
    return await repo.get_all_ships(skip=skip, limit=limit)


@router.post("/ships/search", response_model=List[Ship])
async def search_ships(
    filters: ShipSearchFilter,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of records to return"),
    repo: ShipRepository = Depends(get_ship_repo)
):
    """Search ships with filters"""
    return repo.search(filters, skip=skip, limit=limit)


@router.put("/ships/{ship_id}", response_model=Ship)
async def update_ship(
    ship_id: int = Path(..., description="Ship ID"),
    ship_data: ShipUpdate = ...,
    repo: ShipRepository = Depends(get_ship_repo)
):
    """Update ship"""
    ship = repo.update(ship_id, ship_data)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship


@router.delete("/ships/{ship_id}", status_code=204)
async def delete_ship(
    ship_id: int = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repo)
):
    """Delete ship (cascade delete departments and components)"""
    success = repo.delete(ship_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ship not found")


@router.get("/ships/{ship_id}/stats", response_model=ShipStats)
async def get_ship_stats(
    ship_id: int = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repo)
):
    """Get ship statistics"""
    stats = repo.get_stats(ship_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Ship not found")
    return stats

# =============================================================================
# DEPARTMENT ENDPOINTS
# =============================================================================


@router.post("/departments", response_model=DepartmentRead, status_code=201)
async def create_department(
    department_data: DepartmentCreate,
    repo: DepartmentRepository = Depends(get_department_repo)
):
    """Create a new department"""
    try:
        return await repo.create(department_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/departments/{department_id}", response_model=Department)
async def get_department_by_id(
    department_id: int = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repo)
):
    """Get department by ID"""
    department = repo.get_by_id(department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.get("/ships/{ship_id}/departments", response_model=List[Department])
async def get_departments_by_ship(
    ship_id: int = Path(..., description="Ship ID"),
    repo: DepartmentRepository = Depends(get_department_repo)
):
    """Get all departments for a ship"""
    return repo.get_by_ship(ship_id)


@router.get("/ships/{ship_id}/departments/{department_name}", response_model=Department)
async def get_department_by_ship_and_name(
    ship_id: int = Path(..., description="Ship ID"),
    department_name: str = Path(..., description="Department name"),
    repo: DepartmentRepository = Depends(get_department_repo)
):
    """Get department by ship and name"""
    department = repo.get_by_ship_and_name(ship_id, department_name)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.put("/departments/{department_id}", response_model=Department)
async def update_department(
    department_id: int = Path(..., description="Department ID"),
    department_data: DepartmentUpdate = ...,
    repo: DepartmentRepository = Depends(get_department_repo)
):
    """Update department"""
    department = repo.update(department_id, department_data)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.delete("/departments/{department_id}", status_code=204)
async def delete_department(
    department_id: int = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repo)
):
    """Delete department (cascade delete components)"""
    success = repo.delete(department_id)
    if not success:
        raise HTTPException(status_code=404, detail="Department not found")


@router.get("/departments/{department_id}/stats", response_model=DepartmentStats)
async def get_department_stats(
    department_id: int = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repo)
):
    """Get department statistics"""
    stats = repo.get_stats(department_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Department not found")
    return stats

# =============================================================================
# SYSTEM CONFIGURATION (COMPONENT) ENDPOINTS
# =============================================================================


@router.post("/components", response_model=SystemConfiguration, status_code=201)
async def create_component(
    component_data: SystemConfigurationCreate,
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Create a new component"""
    try:
        return repo.create(component_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/components/bulk", response_model=BulkOperationResult, status_code=201)
async def bulk_create_components(
    components_data: BulkComponentCreate,
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Create multiple components"""
    return await repo.bulk_create(components_data)

@router.get("/components/hierarchy", response_model=Dict[str, Any])
async def get_component_hierarchy_by_nomenclature_and_ship(
    nomenclature: str = Query(..., description="Component nomenclature"),
    ship_name: str = Query(..., description="Ship name"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get complete hierarchy for a component by nomenclature and ship name"""
    
    hierarchy = await repo.get_hierarchy_by_nomenclature_and_ship(nomenclature, ship_name)
    if not hierarchy:
        raise HTTPException(
            status_code=404,
            detail=f"Component with nomenclature '{nomenclature}' not found in ship '{ship_name}'"
        )
    return hierarchy

@router.get("/components/{component_id}", response_model=SystemConfiguration)
async def get_component_by_id(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get component by ID"""
    component = await repo.get_by_id(component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@router.get("/departments/{department_id}/components", response_model=List[SystemConfiguration])
async def get_components_by_department(
    department_id: int = Path(..., description="Department ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get all components for a department"""
    return repo.get_by_department(department_id)


@router.get("/ships/{ship_id}/components", response_model=List[SystemConfigurationRead])
async def get_components_by_ship(
    ship_id: UUID = Path(..., description="Ship ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get all components for a ship"""
    return await repo.get_by_ship(ship_id)


@router.get("/departments/{department_id}/components/root", response_model=List[SystemConfiguration])
async def get_root_components(
    department_id: int = Path(..., description="Department ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get root components (no parent) for a department"""
    return repo.get_root_components(department_id)


@router.get("/components/{parent_id}/children", response_model=List[SystemConfiguration])
async def get_component_children(
    parent_id: str = Path(..., description="Parent component ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get child components of a parent"""
    return repo.get_children(parent_id)


@router.get("/components/{component_id}/hierarchy", response_model=Dict[str, Any])
async def get_component_hierarchy(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get complete hierarchy for a component"""
    hierarchy = await repo.get_hierarchy(component_id)
    if not hierarchy:
        raise HTTPException(status_code=404, detail="Component not found")
    return hierarchy




@router.post("/components/search", response_model=List[SystemConfiguration])
async def search_components(
    filters: ComponentSearchFilter,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of records to return"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Search components with filters"""
    return repo.search(filters, skip=skip, limit=limit)


@router.put("/components/{component_id}", response_model=SystemConfiguration)
async def update_component(
    component_id: str = Path(..., description="Component ID"),
    component_data: SystemConfigurationUpdate = ...,
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Update component"""
    component = repo.update(component_id, component_data)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@router.delete("/components/{component_id}", status_code=204)
async def delete_component(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Delete component (will fail if it has children)"""
    try:
        success = repo.delete(component_id)
        if not success:
            raise HTTPException(status_code=404, detail="Component not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/components/{component_id}/hierarchy-stats", response_model=ComponentHierarchyStats)
async def get_component_hierarchy_stats(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get hierarchy statistics for a component"""
    stats = repo.get_hierarchy_stats(component_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Component not found")
    return stats

# =============================================================================
# HEALTH CHECK ENDPOINT
# =============================================================================


@router.get("/health", status_code=200)
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ship-management-api"}

# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================


@router.get("/ships/{ship_id}/hierarchy", response_model=Dict[str, Any])
async def get_ship_full_hierarchy(
    ship_id: int = Path(..., description="Ship ID"),
    ship_repo: ShipRepository = Depends(get_ship_repo),
    dept_repo: DepartmentRepository = Depends(get_department_repo),
    comp_repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get complete hierarchy for a ship (ship -> departments -> components)"""
    ship = ship_repo.get_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")

    departments = dept_repo.get_by_ship(ship_id)
    ship_hierarchy = {
        "ship_id": ship.ship_id,
        "ship_name": ship.ship_name,
        "departments": []
    }

    for dept in departments:
        root_components = comp_repo.get_root_components(dept.department_id)
        dept_data = {
            "department_id": dept.department_id,
            "department_name": dept.department_name,
            "components": []
        }

        for component in root_components:
            comp_hierarchy = comp_repo.get_hierarchy(component.component_id)
            dept_data["components"].append(comp_hierarchy)

        ship_hierarchy["departments"].append(dept_data)

    return ship_hierarchy


@router.get("/components/{component_id}/path", response_model=List[Dict[str, Any]])
async def get_component_path(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_component_repo)
):
    """Get path from root to component (breadcrumb trail)"""
    component = repo.get_by_id(component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    path = []
    current = component

    while current:
        path.insert(0, {
            "component_id": current.component_id,
            "component_name": current.component_name,
            "nomenclature": current.nomenclature
        })
        if current.parent_id:
            current = repo.get_by_id(current.parent_id)
        else:
            current = None

    return path
