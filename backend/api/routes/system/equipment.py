from uuid import UUID
from api.db.dependencies import (
    get_system_config_repository,
)
from api.db.repos.system.sys_config import SystemConfigurationRepository
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import List, Dict, Any

from api.models.systemconfiguration import (
    SystemConfiguration,
    SystemConfigurationCreate,
    SystemConfigurationRead,
    SystemConfigurationUpdate,
    ComponentSearchFilter,
    ComponentHierarchyStats,
    BulkComponentCreate,
    BulkOperationResult,
)

# Create equipment_router
equipment_router = APIRouter(prefix="", tags=["system_configuration"])



# =============================================================================
# SYSTEM CONFIGURATION (COMPONENT) ENDPOINTS
# =============================================================================


@equipment_router.post("/components", response_model=SystemConfiguration, status_code=201)
async def create_component(
    component_data: SystemConfigurationCreate,
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Create a new component"""
    try:
        return await repo.create(component_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@equipment_router.post("/components/bulk", response_model=BulkOperationResult, status_code=201)
async def bulk_create_components(
    components_data: BulkComponentCreate,
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Create multiple components"""
    return await repo.bulk_create(components_data)


@equipment_router.get("/components/hierarchy", response_model=Dict[str, Any])
async def get_component_hierarchy_by_nomenclature_and_ship(
    nomenclature: str = Query(..., description="Component nomenclature"),
    ship_name: str = Query(..., description="Ship name"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get complete hierarchy for a component by nomenclature and ship name"""

    hierarchy = await repo.get_hierarchy_by_nomenclature_and_ship(
        nomenclature, ship_name
    )
    if not hierarchy:
        raise HTTPException(
            status_code=404,
            detail=f"Component with nomenclature '{nomenclature}' not found in ship '{ship_name}'",
        )
    return hierarchy

@equipment_router.get("/components/hierarchy_with_ids", response_model=Dict[str, Any])
async def get_component_hierarchy_by_ids(
    component_id: UUID = Query(..., description="Component ID"),
    ship_id: UUID = Query(..., description="Ship ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """
    Get complete hierarchy for a component using component_id and ship_id directly.
    """

    hierarchy = await repo.get_hierarchy_by_component_id_and_ship_id(
        component_id, ship_id
    )

    if not hierarchy:
        raise HTTPException(
            status_code=404,
            detail=f"Component '{component_id}' not found in ship '{ship_id}'",
        )

    return hierarchy



@equipment_router.get("/components/{component_id}", response_model=SystemConfiguration)
async def get_component_by_id(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get component by ID"""
    component = await repo.get_by_id(component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@equipment_router.get(
    "/departments/{department_id}/components", response_model=List[SystemConfiguration]
)
async def get_components_by_department(
    department_id: int = Path(..., description="Department ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get all components for a department"""
    return repo.get_by_department(department_id)


@equipment_router.get("/ships/{ship_id}/components", response_model=List[SystemConfigurationRead])
async def get_components_by_ship(
    ship_id: UUID = Path(..., description="Ship ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get all components for a ship"""
    return await repo.get_departments_by_ship(ship_id)


@equipment_router.get(
    "/departments/{department_id}/components/root",
    response_model=List[SystemConfiguration],
)
async def get_root_components(
    department_id: int = Path(..., description="Department ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get root components (no parent) for a department"""
    return repo.get_root_components(department_id)


@equipment_router.get(
    "/components/{parent_id}/children", response_model=List[SystemConfiguration]
)
async def get_component_children(
    parent_id: str = Path(..., description="Parent component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get child components of a parent"""
    return repo.get_children(parent_id)


@equipment_router.get("/components/{component_id}/hierarchy", response_model=Dict[str, Any])
async def get_component_hierarchy(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get complete hierarchy for a component"""
    hierarchy = await repo.get_hierarchy(component_id)
    if not hierarchy:
        raise HTTPException(status_code=404, detail="Component not found")
    return hierarchy


@equipment_router.post("/components/search", response_model=List[SystemConfiguration])
async def search_components(
    filters: ComponentSearchFilter,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Search components with filters"""
    return repo.search(filters, skip=skip, limit=limit)


@equipment_router.put("/components/{component_id}", response_model=SystemConfiguration)
async def update_component(
    component_id: str = Path(..., description="Component ID"),
    component_data: SystemConfigurationUpdate = ...,
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Update component"""
    component = repo.update(component_id, component_data)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@equipment_router.delete("/components/{component_id}", status_code=204)
async def delete_component(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Delete component (will fail if it has children)"""
    try:
        success = repo.delete(component_id)
        if not success:
            raise HTTPException(status_code=404, detail="Component not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@equipment_router.get(
    "/components/{component_id}/hierarchy-stats", response_model=ComponentHierarchyStats
)
async def get_component_hierarchy_stats(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get hierarchy statistics for a component"""
    stats = repo.get_hierarchy_stats(component_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Component not found")
    return stats
