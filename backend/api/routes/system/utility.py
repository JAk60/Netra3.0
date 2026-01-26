from typing import Annotated, Any, Dict, List
from uuid import UUID
import math
import logging

from api.db.dependencies import (
    get_alpha_beta_repository,
    get_department_repository,
    get_eta_beta_repository,
    get_monthly_utilization_repository,
    get_ship_repository,
    get_system_config_repository,
    get_system_repository,
)
from api.db.repos.system.department import DepartmentRepository
from api.db.repos.system.ship import ShipRepository
from api.db.repos.system.sys_config import SystemConfigurationRepository
from api.db.repos.system.system import SystemRepository
from api.models.systemconfiguration import (
    SystemConfigurationHierarchyResponse,
    UserSelectionResponse,
)
from fastapi import APIRouter, Depends, HTTPException, Path

from api.db.repos.reliability.alpha_beta import AlphaBetaRepository
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository
from api.db.repos.reliability.monthly_utilization import MonthlyUtilizationRepository

# Setup logging
logger = logging.getLogger(__name__)

# Create systems_utility_router
systems_utility_router = APIRouter(prefix="", tags=["system_utility"])


# =============================================================================
# HEALTH CHECK ENDPOINT
# =============================================================================


# @systems_utility_router.get("/health", status_code=200)
# async def health_check():
#     """Health check endpoint"""
#     return {"status": "healthy", "service": "ship-management-api"}


# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================


@systems_utility_router.get("/ships/{ship_id}/hierarchy", response_model=Dict[str, Any])
async def get_ship_full_hierarchy(
    ship_id: UUID = Path(..., description="Ship ID"),
    ship_repo: ShipRepository = Depends(get_ship_repository),
    dept_repo: DepartmentRepository = Depends(get_department_repository),
    sys_repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get complete hierarchy for a ship (ship -> departments -> components)"""
    ship = await ship_repo.get_ship_by_id(ship_id)
    logger.info(f"Fetching hierarchy for ship: {ship}")
    
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


@systems_utility_router.get("/components/{component_id}/path", response_model=List[Dict[str, Any]])
async def get_component_path(
    component_id: str = Path(..., description="Component ID"),
    repo: SystemConfigurationRepository = Depends(get_system_config_repository),
):
    """Get path from root to component (breadcrumb trail)"""
    # Fixed: Added await
    component = await repo.get_by_id(component_id)
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
            # Fixed: Added await
            current = await repo.get_by_id(current.parent_id)
        else:
            current = None

    return path


@systems_utility_router.get("/ships/{ship_id}/systems-hierarchy", response_model=Dict[str, Any])
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


@systems_utility_router.get("/reflow/{ship_id}/systems-hierarchy", response_model=Dict[str, Any])
async def get_ship_reactflow_hierarchy(
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
                "type": "one_to_many",
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

    logger.info(f"Found {len(systems)} systems for ship {ship_id}")

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
        "label": ship_system_rel["forward_label"],
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
        "label": ship_system_rel["reverse_label"],
        "style": {"stroke": "#6b7280", "strokeWidth": 1, "strokeDasharray": "3,3"},
        "labelStyle": {"fill": "#6b7280", "fontWeight": 400},
    }
    edges.append(systems_to_ship_edge)

    # STEP 4: Create system_type nodes
    unique_system_types = list(set(system.system_type for system in systems))
    system_types_created = {}

    logger.info(f"Found {len(unique_system_types)} unique system types: {unique_system_types}")

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

        logger.debug(f"Created system_type node: {system_type}")

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
            "label": system_systemtype_rel["forward_label"],
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
            "label": system_systemtype_rel["reverse_label"],
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
                component["system_type"] = system.system_type
                all_components.append(component)
        except Exception as e:
            logger.error(f"Error getting components for system {system.system_id}: {e}")

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
                "label": systemtype_component_rel["forward_label"],
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
                "label": systemtype_component_rel["reverse_label"],
                "style": {
                    "stroke": "#6b7280",
                    "strokeWidth": 1,
                    "strokeDasharray": "3,3",
                },
                "labelStyle": {"fill": "#6b7280", "fontWeight": 400},
            }
            edges.append(component_to_systemtype_edge)

    logger.info(f"Final counts - Nodes: {len(nodes)}, Edges: {len(edges)}")
    logger.info(
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
                "systems": 1,
                "system_types": len(unique_system_types),
                "components": len(all_components),
            },
        },
    }


@systems_utility_router.get("/user_selection", response_model=UserSelectionResponse)
async def get_hierarchical_ship_data(
    system_repo: SystemConfigurationRepository = Depends(get_system_config_repository)
):
    """Get all ships with their equipment organized hierarchically by command"""
    try:
        result = await system_repo.get_user_selection_data()
        return result
    except Exception as e:
        logger.error(f"Error fetching hierarchical ship data: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch hierarchical ship data"
        )
    

@systems_utility_router.get(
    "/ships/system-hierarchy-with-stat/{ship_id}",
    response_model=SystemConfigurationHierarchyResponse
)
async def get_ship_hierarchy_with_stat(
    ship_id: Annotated[UUID, Path(description="Ship UUID")],
    system_repo: SystemConfigurationRepository = Depends(get_system_config_repository)
):
    """Get ship system hierarchy with statistics"""
    try:
        result = await system_repo.get_system_hierarchy(ship_id)
        return result
    except Exception as e:
        logger.error(f"Error fetching hierarchical ship data: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch hierarchical ship data"
        )
    

@systems_utility_router.get("/ships/{ship_id}/systems-hierarchy-with-metadata", response_model=Dict[str, Any])
async def get_ship_systems_hierarchy_with_metadata(
    ship_id: UUID = Path(..., description="Ship ID"),
    ship_repo: ShipRepository = Depends(get_ship_repository),
    system_repo: SystemRepository = Depends(get_system_repository),
    alpha_beta_repo: AlphaBetaRepository = Depends(get_alpha_beta_repository),
    eta_beta_repo: EtaBetaRepository = Depends(get_eta_beta_repository),
    monthly_util_repo: MonthlyUtilizationRepository = Depends(get_monthly_utilization_repository),
):
    """Get ship hierarchy with systems, components and their metadata (alpha, beta, eta, current_age)"""
    ship = await ship_repo.get_ship_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")

    systems = await system_repo.get_systems_by_ship(ship_id=ship_id)

    ship_hierarchy = {
        "ship_id": ship.ship_id,
        "ship_name": ship.ship_name,
        "ship_category": ship.ship_category,
        "ship_class": ship.ship_class,
        "total_systems": len(systems),
        "has_systems": [system.system_id for system in systems],
        "systems": [],
    }

    system_types_map = {}
    for system in systems:
        if system.system_type not in system_types_map:
            system_types_map[system.system_type] = []
        system_types_map[system.system_type].append(system.system_id)

    for system in systems:
        component_hierarchy = await system_repo.get_components_by_system_as_dict(
            system.system_id, ship_id
        )

        # Enrich components with metadata
        enriched_components = []
        for comp in component_hierarchy.get("components", []):
            component_id = comp["component_id"]
            
            # Fetch metadata for each component (all return Lists)
            alpha_beta_list = await alpha_beta_repo.get_alphabeta_by_component_id(component_id)
            eta_beta_list = await eta_beta_repo.get_by_component_id(component_id)
            current_age = await monthly_util_repo.get_default_age(component_id)
            
            # Extract values from lists (take first item if exists)
            alpha_beta_data = alpha_beta_list[0] if alpha_beta_list else None
            eta_beta_data = eta_beta_list[0] if eta_beta_list else None
            
            # Add metadata to component
            comp["metadata"] = {
                "alpha": alpha_beta_data.alpha if alpha_beta_data else None,
                "beta": alpha_beta_data.beta if alpha_beta_data else None,
                "eta": eta_beta_data.eta if eta_beta_data else None,
                "eta_beta": eta_beta_data.beta if eta_beta_data else None,
                "priority": eta_beta_data.priority if eta_beta_data else None,
                "current_age": current_age if current_age else None,
            }
            
            enriched_components.append(comp)

        system_data = {
            "system_id": system.system_id,
            "system_type": system.system_type,
            "created_date": system.created_date,
            "total_components": component_hierarchy.get("total_components", 0),
            "root_components_count": component_hierarchy.get("root_components_count", 0),
            "belongs_to_ship": ship.ship_id,
            "has_components": [comp["component_id"] for comp in enriched_components],
            "system_type_shared_with_systems": [
                sys_id
                for sys_id in system_types_map.get(system.system_type, [])
                if sys_id != system.system_id
            ],
            "components": enriched_components,
        }

        ship_hierarchy["systems"].append(system_data)

    return ship_hierarchy