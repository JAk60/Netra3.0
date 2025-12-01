from uuid import UUID
from api.db.dependencies import (
    get_department_repository,
    get_ship_repository,
    get_system_config_repository,
    get_system_repository,
)
from api.db.repos.department import DepartmentRepository
from api.db.repos.ship import ShipRepository
from api.db.repos.sys_config import SystemConfigurationRepository
from api.db.repos.system import SystemRepository
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import Annotated, List, Dict, Any

from api.models.systemconfiguration import (
    DepartmentRead,
    Ship,
    Department,
    ShipRead,
    SystemConfiguration,
    ShipCreate,
    ShipUpdate,
    ShipSearchFilter,
    ShipStats,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentStats,
    SystemConfigurationCreate,
    SystemConfigurationHierarchyResponse,
    SystemConfigurationRead,
    SystemConfigurationUpdate,
    ComponentSearchFilter,
    ComponentHierarchyStats,
    BulkComponentCreate,
    BulkOperationResult,
    UserSelectionResponse,
)

# Create router
router = APIRouter(prefix="", tags=["system_configuration"])

# =============================================================================
# SHIP ENDPOINTS
# =============================================================================


@router.post("/ships", response_model=Ship, status_code=201)
async def create_ship(
    ship_data: ShipCreate, repo: ShipRepository = Depends(get_ship_repository)
):
    """Create a new ship"""
    try:
        return await repo.create_ship(ship_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/ships/{ship_id}", response_model=Ship)
async def get_ship_by_id(
    ship_id: int = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Get ship by ID"""
    ship = repo.get_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship


@router.get("/ships/name/{ship_name}", response_model=Ship)
async def get_ship_by_name(
    ship_name: str = Path(..., description="Ship name"),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Get ship by name"""
    ship = repo.get_by_name(ship_name)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship


@router.get("/ships", response_model=List[ShipRead])
async def get_all_ships(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Get all ships with pagination"""
    return await repo.get_all_ships(skip=skip, limit=limit)


@router.post("/ships/search", response_model=List[Ship])
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


@router.put("/ships/{ship_id}", response_model=Ship)
async def update_ship(
    ship_id: UUID = Path(..., description="Ship ID"),  # FIXED
    ship_data: ShipUpdate = ...,
    repo: ShipRepository = Depends(get_ship_repository),
):
    ship = await repo.update_ship(ship_id, ship_data)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship



@router.delete("/ships/{ship_id}", status_code=204)
async def delete_ship(
    ship_id: UUID = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repository),
):
    """Delete ship (cascade delete departments and components)"""
    success = await repo.delete_ship(ship_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ship not found")


@router.get("/ships/{ship_id}/stats", response_model=ShipStats)
async def get_ship_stats(
    ship_id: int = Path(..., description="Ship ID"),
    repo: ShipRepository = Depends(get_ship_repository),
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
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Create a new department"""
    try:
        return await repo.create(department_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/departments/{department_id}", response_model=Department)
async def get_department_by_id(
    department_id: int = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Get department by ID"""
    department = repo.get_by_id(department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.get("/ships/{ship_id}/departments", response_model=List[Department])
async def get_departments_by_ship(
    ship_id: int = Path(..., description="Ship ID"),
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Get all departments for a ship"""
    return repo.get_departments_by_ship(ship_id)


@router.get("/ships/{ship_id}/departments/{department_name}", response_model=Department)
async def get_department_by_ship_and_name(
    ship_id: int = Path(..., description="Ship ID"),
    department_name: str = Path(..., description="Department name"),
    repo: DepartmentRepository = Depends(get_department_repository),
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
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Update department"""
    department = repo.update(department_id, department_data)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.delete("/departments/{department_id}", status_code=204)
async def delete_department(
    department_id: int = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repository),
):
    """Delete department (cascade delete components)"""
    success = repo.delete(department_id)
    if not success:
        raise HTTPException(status_code=404, detail="Department not found")


@router.get("/departments/{department_id}/stats", response_model=DepartmentStats)
async def get_department_stats(
    department_id: int = Path(..., description="Department ID"),
    repo: DepartmentRepository = Depends(get_department_repository),
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
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Create a new component"""
    try:
        return await repo.create(component_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/components/bulk", response_model=BulkOperationResult, status_code=201)
async def bulk_create_components(
    components_data: BulkComponentCreate,
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Create multiple components"""
    return await repo.bulk_create(components_data)


@router.get("/components/hierarchy", response_model=Dict[str, Any])
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


@router.get("/components/{component_id}", response_model=SystemConfiguration)
async def get_component_by_id(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get component by ID"""
    component = await repo.get_by_id(component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@router.get(
    "/departments/{department_id}/components", response_model=List[SystemConfiguration]
)
async def get_components_by_department(
    department_id: int = Path(..., description="Department ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get all components for a department"""
    return repo.get_by_department(department_id)


@router.get("/ships/{ship_id}/components", response_model=List[SystemConfigurationRead])
async def get_components_by_ship(
    ship_id: UUID = Path(..., description="Ship ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get all components for a ship"""
    return await repo.get_departments_by_ship(ship_id)


@router.get(
    "/departments/{department_id}/components/root",
    response_model=List[SystemConfiguration],
)
async def get_root_components(
    department_id: int = Path(..., description="Department ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get root components (no parent) for a department"""
    return repo.get_root_components(department_id)


@router.get(
    "/components/{parent_id}/children", response_model=List[SystemConfiguration]
)
async def get_component_children(
    parent_id: str = Path(..., description="Parent component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get child components of a parent"""
    return repo.get_children(parent_id)


@router.get("/components/{component_id}/hierarchy", response_model=Dict[str, Any])
async def get_component_hierarchy(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
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
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Search components with filters"""
    return repo.search(filters, skip=skip, limit=limit)


@router.put("/components/{component_id}", response_model=SystemConfiguration)
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


@router.delete("/components/{component_id}", status_code=204)
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


@router.get(
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
    ship_id: UUID = Path(..., description="Ship ID"),
    ship_repo: ShipRepository = Depends(get_ship_repository),
    dept_repo: DepartmentRepository = Depends(get_department_repository),
    sys_repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get complete hierarchy for a ship (ship -> departments -> components)"""
    ship = await ship_repo.get_ship_by_id(ship_id)
    print("ship", ship)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")

    departments = await dept_repo.get_departments_by_ship(ship_id)
    ship_hierarchy = {
        "ship_id": ship.ship_id,
        "ship_name": ship.ship_name,
        "departments": [],
    }

    for dept in departments:
        root_components = await sys_repo.get_root_components(dept.department_id)
        dept_data = {
            "department_id": dept.department_id,
            "department_name": dept.department_name,
            "components": [],
        }

        for component in root_components:
            comp_hierarchy = await sys_repo.get_hierarchy(component.component_id)
            dept_data["components"].append(comp_hierarchy)

        ship_hierarchy["departments"].append(dept_data)

    return ship_hierarchy


@router.get("/components/{component_id}/path", response_model=List[Dict[str, Any]])
async def get_component_path(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get path from root to component (breadcrumb trail)"""
    component = repo.get_by_id(component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    path = []
    current = component

    while current:
        path.insert(
            0,
            {
                "component_id": current.component_id,
                "component_name": current.component_name,
                "nomenclature": current.nomenclature,
            },
        )
        if current.parent_id:
            current = repo.get_by_id(current.parent_id)
        else:
            current = None

    return path


@router.get("/ships/test/{ship_id}/", response_model=Dict[str, Any])
async def get_ship_systems_hierarchy(
    ship_id: UUID = Path(..., description="Ship ID"),
    system_repo: SystemRepository = Depends(get_system_repository),
):
    systems = await system_repo.get_systems_by_ship(ship_id=ship_id)
    return systems


@router.get("/ships/{ship_id}/systems-hierarchy", response_model=Dict[str, Any])
async def get_ship_systems_hierarchy(
    ship_id: UUID = Path(..., description="Ship ID"),
    ship_repo: ShipRepository = Depends(get_ship_repository),
    system_repo: SystemRepository = Depends(get_system_repository),
):
    """Get ship hierarchy focused on systems: ship -> systems -> components with bidirectional relations"""
    ship = await ship_repo.get_ship_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")

    systems = await system_repo.get_systems_by_ship(ship_id=ship_id)

    # Build ship hierarchy with bidirectional relations
    ship_hierarchy = {
        "ship_id": ship.ship_id,
        "ship_name": ship.ship_name,
        "ship_category": ship.ship_category,
        "ship_class": ship.ship_class,
        "total_systems": len(systems),
        # Forward relation: ship has systems
        "has_systems": [system.system_id for system in systems],
        "systems": [],
    }

    # Group systems by type for reverse relation
    system_types_map = {}
    for system in systems:
        if system.system_type not in system_types_map:
            system_types_map[system.system_type] = []
        system_types_map[system.system_type].append(system.system_id)

    for system in systems:
        component_hierarchy = await system_repo.get_components_by_system_as_dict(
            system.system_id, ship_id
        )

        system_data = {
            "system_id": system.system_id,
            "system_type": system.system_type,
            "created_date": system.created_date,
            "total_components": component_hierarchy.get("total_components", 0),
            "root_components_count": component_hierarchy.get(
                "root_components_count", 0
            ),
            # Bidirectional relations for system level
            # Reverse relation: system belongs to ship
            "belongs_to_ship": ship.ship_id,
            # Forward relation: system type has components
            "has_components": [
                comp["component_id"]
                for comp in component_hierarchy.get("components", [])
            ],
            # Reverse relation: system type is part of these other systems
            "system_type_shared_with_systems": [
                sys_id
                for sys_id in system_types_map.get(system.system_type, [])
                if sys_id != system.system_id
            ],
            "components": component_hierarchy.get("components", []),
        }

        ship_hierarchy["systems"].append(system_data)

    return ship_hierarchy


@router.get("/reflow/{ship_id}/systems-hierarchy", response_model=Dict[str, Any])
async def get_ship_systems_hierarchy(
    ship_id: UUID = Path(..., description="Ship ID"),
    ship_repo: ShipRepository = Depends(get_ship_repository),
    system_repo: SystemRepository = Depends(get_system_repository),
):
    """Get ship hierarchy in ReactFlow format: Ship -> System -> System Types -> Components"""

    # Relationship configuration
    ship_relationships = {
        "ships": {
            "systems": {
                "forward_label": "has_systems",
                "reverse_label": "are_on",
                "type": "one_to_one",
            }
        },
        "systems": {
            "ships": {
                "forward_label": "are_on",
                "reverse_label": "has_systems",
                "type": "one_to_one",
            },
            "system_types": {
                "forward_label": "has_category",
                "reverse_label": "is_a_type_of",
                "type": "one_to_many",  # One "Systems" node to many system types
            },
        },
        "system_types": {
            "systems": {
                "forward_label": "is_a_type_of",
                "reverse_label": "has_category",
                "type": "many_to_one",
            },
            "components": {
                "forward_label": "has_equipment",
                "reverse_label": "is_part_of",
                "type": "one_to_many",
            },
        },
        "components": {
            "system_types": {
                "forward_label": "is_part_of",
                "reverse_label": "has_equipment",
                "type": "many_to_one",
            }
        },
    }

    ship = await ship_repo.get_ship_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")

    systems = await system_repo.get_systems_by_ship(ship_id=ship_id)

    # Debug: Add logging to check if systems are found
    print(f"Found {len(systems)} systems for ship {ship_id}")

    nodes = []
    edges = []

    # STEP 1: Create ship node (root node)
    ship_node = {
        "id": str(ship.ship_id),
        "type": "bidirectional",
        "position": {"x": 400, "y": 50},
        "data": {
            "label": ship.ship_name,
            "ship_category": ship.ship_category,
            "ship_class": ship.ship_class,
            "total_systems": len(systems),
            "node_type": "ship",
        },
        "style": {
            "background": "#1f2937",
            "color": "white",
            "border": "2px solid #3b82f6",
            "borderRadius": "8px",
            "width": 200,
            "height": 80,
        },
    }
    nodes.append(ship_node)

    # Early return if no systems found
    if not systems:
        return {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "ship_id": str(ship.ship_id),
                "ship_name": ship.ship_name,
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "total_systems": 0,
                "message": "No systems found for this ship",
            },
        }

    # STEP 2: Create single "Systems" node (represents all systems collectively)
    systems_node = {
        "id": f"systems_collective_{ship.ship_id}",
        "type": "bidirectional",
        "position": {"x": 400, "y": 200},
        "data": {
            "label": "Systems",
            "total_systems": len(systems),
            "total_system_types": len(set(system.system_type for system in systems)),
            "node_type": "systems_collective",
        },
        "style": {
            "background": "#059669",
            "color": "white",
            "border": "2px solid #10b981",
            "borderRadius": "6px",
            "width": 150,
            "height": 60,
        },
    }
    nodes.append(systems_node)

    # STEP 3: Create edges between ship and systems
    ship_system_rel = ship_relationships["ships"]["systems"]

    # Forward edge: ship -> systems
    ship_to_systems_edge = {
        "id": f"ship-{ship.ship_id}-to-systems",
        "source": str(ship.ship_id),
        "target": systems_node["id"],
        "type": "bidirectional",
        "sourceHandle": "bottom",
        "targetHandle": "top",
        "markerEnd": {"type": "ArrowClosed"},
        "label": ship_system_rel["forward_label"],  # 'has_systems'
        "style": {"stroke": "#3b82f6", "strokeWidth": 2},
        "labelStyle": {"fill": "#374151", "fontWeight": 600},
    }
    edges.append(ship_to_systems_edge)

    # Reverse edge: systems -> ship
    systems_to_ship_edge = {
        "id": f"systems-to-ship-{ship.ship_id}",
        "source": systems_node["id"],
        "target": str(ship.ship_id),
        "type": "bidirectional",
        "sourceHandle": "top",
        "targetHandle": "bottom",
        "markerEnd": {"type": "ArrowClosed"},
        "label": ship_system_rel["reverse_label"],  # 'belongs_to_ship'
        "style": {"stroke": "#6b7280", "strokeWidth": 1, "strokeDasharray": "3,3"},
        "labelStyle": {"fill": "#6b7280", "fontWeight": 400},
    }
    edges.append(systems_to_ship_edge)

    # STEP 4: Create system_type nodes (many from the single systems node)
    unique_system_types = list(set(system.system_type for system in systems))
    system_types_created = {}

    print(
        f"Found {len(unique_system_types)} unique system types: {unique_system_types}"
    )

    # Position system_types in a circular layout around the systems node
    import math

    system_type_count = len(unique_system_types)
    radius = 250

    for i, system_type in enumerate(unique_system_types):
        # Calculate position in circle around systems node
        angle = (2 * math.pi * i) / system_type_count
        x = 400 + radius * math.cos(angle)
        y = 350 + radius * math.sin(angle)

        system_type_node = {
            "id": f"system_type_{system_type}",
            "type": "bidirectional",
            "position": {"x": x, "y": y},
            "data": {
                "label": system_type,
                "system_type": system_type,
                "instances_count": len(
                    [s for s in systems if s.system_type == system_type]
                ),
                "node_type": "system_type",
            },
            "style": {
                "background": "#7c3aed",
                "color": "white",
                "border": "2px solid #8b5cf6",
                "borderRadius": "6px",
                "width": 120,
                "height": 50,
            },
        }
        nodes.append(system_type_node)
        system_types_created[system_type] = f"system_type_{system_type}"

        print(f"Created system_type node: {system_type}")

        # STEP 5: Create edges between systems and each system_type
        system_systemtype_rel = ship_relationships["systems"]["system_types"]

        # Forward edge: systems -> system_type
        systems_to_type_edge = {
            "id": f"systems-to-type-{system_type}",
            "source": systems_node["id"],
            "target": f"system_type_{system_type}",
            "type": "bidirectional",
            "sourceHandle": "bottom",
            "targetHandle": "top",
            "markerEnd": {"type": "ArrowClosed"},
            "label": system_systemtype_rel["forward_label"],  # 'contains_types'
            "style": {"stroke": "#7c3aed", "strokeWidth": 2},
            "labelStyle": {"fill": "#374151", "fontWeight": 600},
        }
        edges.append(systems_to_type_edge)

        # Reverse edge: system_type -> systems
        type_to_systems_edge = {
            "id": f"type-{system_type}-to-systems",
            "source": f"system_type_{system_type}",
            "target": systems_node["id"],
            "type": "bidirectional",
            "sourceHandle": "top",
            "targetHandle": "bottom",
            "markerEnd": {"type": "ArrowClosed"},
            "label": system_systemtype_rel["reverse_label"],  # 'part_of_systems'
            "style": {"stroke": "#6b7280", "strokeWidth": 1, "strokeDasharray": "3,3"},
            "labelStyle": {"fill": "#6b7280", "fontWeight": 400},
        }
        edges.append(type_to_systems_edge)

    # STEP 6: Create components for each system type
    all_components = []
    for system in systems:
        try:
            component_hierarchy = await system_repo.get_components_by_system_as_dict(
                system.system_id, ship_id
            )
            components = component_hierarchy.get("components", [])
            for component in components:
                component["system_type"] = system.system_type  # Add system_type info
                all_components.append(component)
        except Exception as e:
            print(f"Error getting components for system {system.system_id}: {e}")

    # Group components by system_type
    components_by_type = {}
    for component in all_components:
        system_type = component["system_type"]
        if system_type not in components_by_type:
            components_by_type[system_type] = []
        components_by_type[system_type].append(component)

    # Create component nodes around each system_type
    for system_type, components in components_by_type.items():
        system_type_node_id = f"system_type_{system_type}"

        # Get the position of the system_type node
        system_type_node = next(
            node for node in nodes if node["id"] == system_type_node_id
        )
        center_x = system_type_node["position"]["x"]
        center_y = system_type_node["position"]["y"]

        # Position components in a circle around their system_type
        component_radius = 150
        component_count = len(components)

        for j, component in enumerate(components):
            if component_count > 1:
                comp_angle = (2 * math.pi * j) / component_count
                comp_x = center_x + component_radius * math.cos(comp_angle)
                comp_y = center_y + component_radius * math.sin(comp_angle)
            else:
                # Single component - place directly below system_type
                comp_x = center_x
                comp_y = center_y + component_radius

            component_node = {
                "id": str(component["component_id"]),
                "type": "bidirectional",
                "position": {"x": comp_x, "y": comp_y},
                "data": {
                    "label": component.get("component_name", f"Component {j+1}"),
                    "component_id": component["component_id"],
                    "system_type": system_type,
                    "node_type": "component",
                },
                "style": {
                    "background": "#dc2626",
                    "color": "white",
                    "border": "2px solid #ef4444",
                    "borderRadius": "4px",
                    "width": 100,
                    "height": 40,
                },
            }
            nodes.append(component_node)

            # STEP 7: Create edges between system_type and components
            systemtype_component_rel = ship_relationships["system_types"]["components"]

            # Forward edge: system_type -> component
            systemtype_to_component_edge = {
                "id": f"systemtype-{system_type}-to-component-{component['component_id']}",
                "source": system_type_node_id,
                "target": str(component["component_id"]),
                "type": "bidirectional",
                "sourceHandle": "bottom",
                "targetHandle": "top",
                "markerEnd": {"type": "ArrowClosed"},
                "label": systemtype_component_rel["forward_label"],  # 'has_equipment'
                "style": {"stroke": "#10b981", "strokeWidth": 2},
                "labelStyle": {"fill": "#374151", "fontWeight": 600},
            }
            edges.append(systemtype_to_component_edge)

            # Reverse edge: component -> system_type
            component_to_systemtype_edge = {
                "id": f"component-{component['component_id']}-to-systemtype-{system_type}",
                "source": str(component["component_id"]),
                "target": system_type_node_id,
                "type": "bidirectional",
                "sourceHandle": "top",
                "targetHandle": "bottom",
                "markerEnd": {"type": "ArrowClosed"},
                "label": systemtype_component_rel["reverse_label"],  # 'belongs_to_type'
                "style": {
                    "stroke": "#6b7280",
                    "strokeWidth": 1,
                    "strokeDasharray": "3,3",
                },
                "labelStyle": {"fill": "#6b7280", "fontWeight": 400},
            }
            edges.append(component_to_systemtype_edge)

    # Debug: Final counts
    print(f"Final counts - Nodes: {len(nodes)}, Edges: {len(edges)}")
    print(
        f"Hierarchy: 1 Ship -> 1 Systems -> {len(unique_system_types)} System Types -> {len(all_components)} Components"
    )

    # Return in ReactFlow format
    return {
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "ship_id": str(ship.ship_id),
            "ship_name": ship.ship_name,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "hierarchy": {
                "ships": 1,
                "systems": 1,  # Single collective systems node
                "system_types": len(unique_system_types),
                "components": len(all_components),
            },
        },
    }


@router.get("/user_selection", response_model=UserSelectionResponse)
async def get_hierarchical_ship_data():
    """Get all ships with their equipment organized hierarchically by command"""
    system_repo: SystemConfiguration = get_system_config_repository()
    try:
        result = await system_repo.get_user_selection_data()
        return result
    except Exception as e:
        print(f"Error fetching hierarchical ship data: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch hierarchical ship data"
        )
    
@router.get(
    "/ships/system-hierarchy-with-stat/{ship_id}",
    response_model=SystemConfigurationHierarchyResponse
)
async def get_ship_hierarchy_with_stat(
    ship_id: Annotated[UUID, Path(description="Ship UUID")],
    system_repo: SystemConfigurationRepository = Depends(get_system_config_repository)
):
    try:
        result = await system_repo.get_system_hierarchy(ship_id)
        return result
    except Exception as e:
        print(f"Error fetching hierarchical ship data: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch hierarchical ship data"
        )