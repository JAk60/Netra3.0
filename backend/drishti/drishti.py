from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Path

from api.db.dependencies import get_ship_repository, get_system_repository
from api.db.repos.ship import ShipRepository
from api.db.repos.system import SystemRepository
from utils.nltk.drishti import ShipComponentQuerySystem
from utils.nltk.flow import NaturalLanguageQueryFilter
from utils.nltk.ship import extract_ships_from_message


class Drishti:
    @staticmethod
    async def get_ship_systems_hierarchy(
    ship_id: UUID = Path(..., description="Ship ID"),
    ship_repo: ShipRepository = get_ship_repository(),
    system_repo: SystemRepository = get_system_repository()):
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
            
            "systems": []
        }

        # Group systems by type for reverse relation
        system_types_map = {}
        for system in systems:
            if system.system_type not in system_types_map:
                system_types_map[system.system_type] = []
            system_types_map[system.system_type].append(system.system_id)

        for system in systems:
            component_hierarchy = await system_repo.get_components_by_system_as_dict(system.system_id, ship_id)
            
            system_data = {
                "system_id": system.system_id,
                "system_type": system.system_type,
                "created_date": system.created_date,
                "total_components": component_hierarchy.get("total_components", 0),
                "root_components_count": component_hierarchy.get("root_components_count", 0),
                
                # Bidirectional relations for system level
                # Reverse relation: system belongs to ship
                "belongs_to_ship": ship.ship_id,
                
                # Forward relation: system type has components
                "has_components": [comp["component_id"] for comp in component_hierarchy.get("components", [])],
                
                # Reverse relation: system type is part of these other systems
                "system_type_shared_with_systems": [
                    sys_id for sys_id in system_types_map.get(system.system_type, []) 
                    if sys_id != system.system_id
                ],
                
                "components": component_hierarchy.get("components", [])
            }

            ship_hierarchy["systems"].append(system_data)

        return ship_hierarchy
    
    @staticmethod
    async def get_reactflow_heiarchry_ds(
        ship_id: UUID = Path(..., description="Ship ID"),
        ship_repo: ShipRepository = get_ship_repository(),
        system_repo: SystemRepository = get_system_repository()
    ):
        """Get ship hierarchy in ReactFlow format: Ship -> System -> System Types -> Components"""
        
        # Relationship configuration
        ship_relationships = {
            'ships': {
                'systems': {
                    'forward_label': 'has_systems',
                    'reverse_label': 'are_on',
                    'type': 'one_to_one' 
                }
            },
            'systems': {
                'ships': {
                    'forward_label': 'are_on', 
                    'reverse_label': 'has_systems',
                    'type': 'one_to_one'
                },
                'system_types': {
                    'forward_label': 'has_category',
                    'reverse_label': 'is_a_type_of',
                    'type': 'one_to_many'
                }
            },
            'system_types': {
                'systems': {
                    'forward_label': 'is_a_type_of',
                    'reverse_label': 'has_category', 
                    'type': 'many_to_one'
                },
                'components': {
                    'forward_label': 'has_equipment',
                    'reverse_label': 'is_part_of',
                    'type': 'one_to_many'
                }
            },
            'components': {
                'system_types': {
                    'forward_label': 'is_part_of',
                    'reverse_label': 'has_equipment',
                    'type': 'many_to_one'
                }
            }
        }
        
        ship = await ship_repo.get_ship_by_id(ship_id)
        if not ship:
            raise HTTPException(status_code=404, detail="Ship not found")

        systems = await system_repo.get_systems_by_ship(ship_id=ship_id)
        
        # Debug: Add logging to check if systems are found
        print(f"Found {len(systems)} systems for ship {ship_id}")
        
        nodes = []
        edges = []
        
        # STEP 1: Create ship node (root node) - Glassmorphism Blue
        ship_node = {
            "id": str(ship.ship_id),
            "type": "bidirectional",
            "position": {"x": 50, "y": 400},
            "data": {
                "label": ship.ship_name,
                "ship_category": ship.ship_category,
                "ship_class": ship.ship_class,
                "total_systems": len(systems),
                "node_type": "ship"
            },
            "style": {
                "background": "rgba(59, 130, 246, 0.15)",
                "backdropFilter": "blur(10px)",
                "border": "1px solid rgba(59, 130, 246, 0.3)",
                "borderRadius": "50%",
                "color": "white",
                "fontWeight": "bold",
                "fontSize": "14px",
                "textAlign": "center",
                "display": "flex",
                "alignItems": "center",
                "justifyContent": "center",
                "width": 120,
                "height": 120,
                "boxShadow": "0 8px 32px 0 rgba(59, 130, 246, 0.2)"
            }
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
                    "message": "No systems found for this ship"
                }
            }
        
        # STEP 2: Create single "Systems" node - Glassmorphism Green
        systems_node = {
            "id": f"systems_collective_{ship.ship_id}",
            "type": "bidirectional",
            "position": {"x": 250, "y": 400},
            "data": {
                "label": "Systems",
                "total_systems": len(systems),
                "total_system_types": len(set(system.system_type for system in systems)),
                "node_type": "systems_collective"
            },
            "style": {
                "background": "rgba(124, 58, 237, 0.15)",
                "backdropFilter": "blur(10px)",
                "border": "1px solid rgba(124, 58, 237, 0.3)",
                "borderRadius": "50px",  # High border-radius creates oval
                "color": "white",
                "fontWeight": "bold",
                "fontSize": "11px",
                "textAlign": "center",
                "display": "flex",
                "alignItems": "center",
                "justifyContent": "center",
                "width": "140px",   # Wider for text like "power_generation"
                "height": "70px",   # Shorter height creates oval shape
                "boxShadow": "0 8px 32px 0 rgba(124, 58, 237, 0.2)",
                "padding": "8px 16px"  # More horizontal padding
            }
        }
        nodes.append(systems_node)
        
        # STEP 3: Create edges between ship and systems
        ship_system_rel = ship_relationships['ships']['systems']
        
        # Forward edge: ship -> systems
        ship_to_systems_edge = {
            "id": f"ship-{ship.ship_id}-to-systems",
            "source": str(ship.ship_id),
            "target": systems_node["id"],
            "type": "bidirectional",
            "sourceHandle": "right",
            "targetHandle": "left",
            "markerEnd": {"type": "ArrowClosed"},
            "label": ship_system_rel['forward_label'],
            "style": {
                "stroke": "rgba(59, 130, 246, 0.6)",
                "strokeWidth": 2
            },
            "labelStyle": {
                "fill": "#374151",
                "fontWeight": 600,
                "fontSize": "12px"
            }
        }
        edges.append(ship_to_systems_edge)
        
        # Reverse edge: systems -> ship
        systems_to_ship_edge = {
            "id": f"systems-to-ship-{ship.ship_id}",
            "source": systems_node["id"],
            "target": str(ship.ship_id),
            "type": "bidirectional",
            "sourceHandle": "left",
            "targetHandle": "right",
            "markerEnd": {"type": "ArrowClosed"},
            "label": ship_system_rel['reverse_label'],
            "style": {
                "stroke": "rgba(107, 114, 128, 0.4)",
                "strokeWidth": 1,
                "strokeDasharray": "3,3"
            },
            "labelStyle": {
                "fill": "#6b7280",
                "fontWeight": 400,
                "fontSize": "11px"
            }
        }
        edges.append(systems_to_ship_edge)
        
        # STEP 4: Create system_type nodes - Glassmorphism Purple
        unique_system_types = list(set(system.system_type for system in systems))
        system_types_created = {}
        
        print(f"Found {len(unique_system_types)} unique system types: {unique_system_types}")
        
        # Position system_types in a circular layout around the systems node
        import math
        system_type_count = len(unique_system_types)
        radius = 200
        
        for i, system_type in enumerate(unique_system_types):
            # Calculate position in circle around systems node
            angle = (2 * math.pi * i) / system_type_count
            x = 450 + radius * math.cos(angle)
            y = 400 + radius * math.sin(angle)
            
            system_type_node = {
                "id": f"system_type_{system_type}",
                "type": "bidirectional", 
                "position": {"x": x, "y": y},
                "data": {
                    "label": system_type,
                    "system_type": system_type,
                    "instances_count": len([s for s in systems if s.system_type == system_type]),
                    "node_type": "system_type"
                },
                "style": {
                    "background": "rgba(124, 58, 237, 0.15)",
                    "backdropFilter": "blur(10px)",
                    "border": "1px solid rgba(124, 58, 237, 0.3)",
                    "borderRadius": "50%",
                    "color": "white",
                    "fontWeight": "bold",
                    "fontSize": "11px",
                    "textAlign": "center",
                    "display": "flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "width": 80,
                    "height": 80,
                    "boxShadow": "0 8px 32px 0 rgba(124, 58, 237, 0.2)",
                    "padding": "8px"
                }
            }
            nodes.append(system_type_node)
            system_types_created[system_type] = f"system_type_{system_type}"
            
            print(f"Created system_type node: {system_type}")
            
            # STEP 5: Create edges between systems and each system_type
            system_systemtype_rel = ship_relationships['systems']['system_types']
            
            # Forward edge: systems -> system_type
            systems_to_type_edge = {
                "id": f"systems-to-type-{system_type}",
                "source": systems_node["id"],
                "target": f"system_type_{system_type}",
                "type": "bidirectional",
                "sourceHandle": "right",
                "targetHandle": "left",
                "markerEnd": {"type": "ArrowClosed"},
                "label": system_systemtype_rel['forward_label'],
                "style": {
                    "stroke": "rgba(124, 58, 237, 0.6)",
                    "strokeWidth": 2
                },
                "labelStyle": {
                    "fill": "#374151",
                    "fontWeight": 600,
                    "fontSize": "10px"
                }
            }
            edges.append(systems_to_type_edge)
            
            # Reverse edge: system_type -> systems
            type_to_systems_edge = {
                "id": f"type-{system_type}-to-systems",
                "source": f"system_type_{system_type}",
                "target": systems_node["id"],
                "type": "bidirectional",
                "sourceHandle": "left",
                "targetHandle": "right",
                "markerEnd": {"type": "ArrowClosed"},
                "label": system_systemtype_rel['reverse_label'],
                "style": {
                    "stroke": "rgba(107, 114, 128, 0.4)",
                    "strokeWidth": 1,
                    "strokeDasharray": "3,3"
                },
                "labelStyle": {
                    "fill": "#6b7280",
                    "fontWeight": 400,
                    "fontSize": "9px"
                }
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
                print(f"Error getting components for system {system.system_id}: {e}")
        
        # Group components by system_type
        components_by_type = {}
        for component in all_components:
            system_type = component["system_type"]
            if system_type not in components_by_type:
                components_by_type[system_type] = []
            components_by_type[system_type].append(component)
        
        # Create component nodes around each system_type - Glassmorphism Orange/Red
        for system_type, components in components_by_type.items():
            system_type_node_id = f"system_type_{system_type}"
            
            # Get the position of the system_type node
            system_type_node = next(node for node in nodes if node["id"] == system_type_node_id)
            center_x = system_type_node["position"]["x"]
            center_y = system_type_node["position"]["y"]
            
            # Position components in a circle around their system_type
            component_radius = 120
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
                        "label": component.get("nomenclature", f"Component {j+1}"),
                        "component_id": component["component_id"],
                        "system_type": system_type,
                        "node_type": "component"
                    },
                    "style": {
                        "background": "rgba(234, 88, 12, 0.15)",
                        "backdropFilter": "blur(10px)",
                        "border": "1px solid rgba(234, 88, 12, 0.3)",
                        "borderRadius": "50%",
                        "color": "white",
                        "fontWeight": "bold",
                        "fontSize": "9px",
                        "textAlign": "center",
                        "display": "flex",
                        "alignItems": "center",
                        "justifyContent": "center",
                        "width": 60,
                        "height": 60,
                        "boxShadow": "0 8px 32px 0 rgba(234, 88, 12, 0.2)",
                        "padding": "6px"
                    }
                }
                nodes.append(component_node)
                
                # STEP 7: Create edges between system_type and components
                systemtype_component_rel = ship_relationships['system_types']['components']
                
                # Forward edge: system_type -> component
                systemtype_to_component_edge = {
                    "id": f"systemtype-{system_type}-to-component-{component['component_id']}",
                    "source": system_type_node_id,
                    "target": str(component["component_id"]),
                    "type": "bidirectional",
                    "sourceHandle": "right",
                    "targetHandle": "left",
                    "markerEnd": {"type": "ArrowClosed"},
                    "label": systemtype_component_rel['forward_label'],
                    "style": {
                        "stroke": "rgba(234, 88, 12, 0.6)",
                        "strokeWidth": 2
                    },
                    "labelStyle": {
                        "fill": "#374151",
                        "fontWeight": 600,
                        "fontSize": "9px"
                    }
                }
                edges.append(systemtype_to_component_edge)
                
                # Reverse edge: component -> system_type
                component_to_systemtype_edge = {
                    "id": f"component-{component['component_id']}-to-systemtype-{system_type}",
                    "source": str(component["component_id"]),
                    "target": system_type_node_id,
                    "type": "bidirectional",
                    "sourceHandle": "left",
                    "targetHandle": "right",
                    "markerEnd": {"type": "ArrowClosed"},
                    "label": systemtype_component_rel['reverse_label'],
                    "style": {
                        "stroke": "rgba(107, 114, 128, 0.4)",
                        "strokeWidth": 1,
                        "strokeDasharray": "3,3"
                    },
                    "labelStyle": {
                        "fill": "#6b7280",
                        "fontWeight": 400,
                        "fontSize": "8px"
                    }
                }
                edges.append(component_to_systemtype_edge)
        
        # Debug: Final counts
        print(f"Final counts - Nodes: {len(nodes)}, Edges: {len(edges)}")
        print(f"Hierarchy: 1 Ship -> 1 Systems -> {len(unique_system_types)} System Types -> {len(all_components)} Components")
        
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
                    "components": len(all_components)
                }
            }
        }
    
    @staticmethod
    async def ship_system_kg(message: str, ship_repo=None):
        """
        Main entry point for Drishti API with filtering support
        
        Args:
            message: Message to extract ships from and use for filtering
            ship_repo: Ship repository dependency
        """
        from api.db.dependencies import get_ship_repository
        if ship_repo is None:
            ship_repo = get_ship_repository()
            
        # Extract ships from message
        ships = await extract_ships_from_message(message)
        print(f"Extracted ships: {ships}")
        
        if not ships:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="No ships found in the message")
        
        system_kg = []
        
        for ship in ships:
            print(f"Processing ship: {ship}")
            ship_id = await ship_repo.get_shipid_by_shipname(ship)
            
            # Get both hierarchies
            ship_hierarchy_data = await Drishti.get_ship_systems_hierarchy(ship_id=ship_id)
            reactflow_hierarchy = await Drishti.get_reactflow_heiarchry_ds(ship_id=ship_id)
            
            # Combine the data
            combined_data = {
                'reactflow': reactflow_hierarchy,
                'ship_name': ship_hierarchy_data
            }
            
            # Apply filtering using the original message
            query=NaturalLanguageQueryFilter()
            filtered_flow=await query.process_flow_query(reactflow_hierarchy, message)
            print(f"Filtered flow: {filtered_flow}")
            print("*"*100)
            query_system = ShipComponentQuerySystem(ship_hierarchy_data)
            filtered_ship = await query_system.process_natural_language_query(message)
            print(f"Filtered ship data: {filtered_ship}")
            system_kg.append({
                'reactflow': filtered_flow,
                'ship_name': filtered_ship
            })
            print(f"Processed ship: {ship}")
        
        return system_kg