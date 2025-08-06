import sys

from api.models.systemconfiguration import SystemRead
sys.path.append('..')

from api.models import Ship, SystemConfiguration, System 
from typing import List, Optional
from unittest import result
from uuid import UUID

from sqlalchemy import func
from sqlmodel import Session, select
   
from db.connection import get_async_db_service, get_session_context


import logging

logger = logging.getLogger(__name__)


class SystemRepository:
    "Repository for system related methods"
    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _get_systems_by_ship_sync(self, session: Session, ship_id: Optional[UUID] = None, ship_name: Optional[str] = None) -> List[SystemRead]:
        """Synchronous get systems by ship"""
        try:
            if not ship_id and not ship_name:
                raise ValueError("Either ship_id or ship_name must be provided")
            
            # Build the query to get systems for a specific ship
            # Systems are connected to ships through SystemConfiguration
            query = (
                select(System)
                .join(SystemConfiguration, System.system_id == SystemConfiguration.system_id)
                .join(Ship, SystemConfiguration.ship_id == Ship.ship_id)
            )
            
            if ship_id:
                query = query.where(Ship.ship_id == ship_id)
            elif ship_name:
                query = query.where(Ship.ship_name == ship_name)
            
            # Use distinct to avoid duplicate systems
            query = query.distinct()
            
            systems = session.exec(query).all()
            
            logger.info(f"Retrieved {len(systems)} systems for ship {'ID: ' + str(ship_id) if ship_id else 'name: ' + ship_name}")
            return [SystemRead.from_orm(system) for system in systems]
            
        except Exception as e:
            logger.error(f"Failed to get systems for ship: {e}")
            raise

    async def get_systems_by_ship(self, ship_id: Optional[UUID] = None, ship_name: Optional[str] = None) -> List[SystemRead]:
        """Async get systems by ship"""
        def _get_systems():
            with get_session_context() as session:
                return self._get_systems_by_ship_sync(session, ship_id, ship_name)

        return await self.async_service.run_in_thread(_get_systems)

    def _get_systems_by_ship_with_counts_sync(self, session: Session, ship_id: Optional[UUID] = None, ship_name: Optional[str] = None) -> List[dict]:
        """Synchronous get systems by ship with component counts"""
        try:
            if not ship_id and not ship_name:
                raise ValueError("Either ship_id or ship_name must be provided")
            
            # Build query to get systems with component counts
            query = (
                select(
                    System.system_id,
                    System.system_type,
                    System.created_date,
                    func.count(SystemConfiguration.component_id).label('component_count')
                )
                .join(SystemConfiguration, System.system_id == SystemConfiguration.system_id)
                .join(Ship, SystemConfiguration.ship_id == Ship.ship_id)
            )
            
            if ship_id:
                query = query.where(Ship.ship_id == ship_id)
            elif ship_name:
                query = query.where(Ship.ship_name == ship_name)
            
            query = query.group_by(System.system_id, System.system_type, System.created_date)
            
            results = session.exec(query).all()
            
            systems_with_counts = [
                {
                    "system_id": result.system_id,
                    "system_type": result.system_type,
                    "created_date": result.created_date,
                    "component_count": result.component_count
                }
                for result in results
            ]
            
            logger.info(f"Retrieved {len(systems_with_counts)} systems with counts for ship {'ID: ' + str(ship_id) if ship_id else 'name: ' + ship_name}")
            return systems_with_counts
            
        except Exception as e:
            logger.error(f"Failed to get systems with counts for ship: {e}")
            raise

    async def get_systems_by_ship_with_counts(self, ship_id: Optional[UUID] = None, ship_name: Optional[str] = None) -> List[dict]:
        """Async get systems by ship with component counts"""
        def _get_systems():
            with get_session_context() as session:
                return self._get_systems_by_ship_with_counts_sync(session, ship_id, ship_name)

        return await self.async_service.run_in_thread(_get_systems)

    def _get_components_by_system_sync(self, session: Session, system_id: UUID,ship_id:UUID, include_hierarchy: bool = False) -> List[SystemConfiguration]:
        """Synchronous get components by system"""
        try:
            if include_hierarchy:
                # Get all components for the system
                all_components = session.exec(
                    select(SystemConfiguration).where(SystemConfiguration.system_id == system_id and SystemConfiguration)& 
                    (SystemConfiguration.ship_id == ship_id)
                ).all()
                
                # Separate root components (no parent) and build hierarchy
                root_components = [comp for comp in all_components if comp.parent_id is None]
                components_dict = {comp.component_id: comp for comp in all_components}
                
                # Build hierarchy for each root component
                def build_component_hierarchy(component):
                    children = [comp for comp in all_components if comp.parent_id == component.component_id]
                    # Add children to the component object (if your model supports it)
                    # This is a simple approach - you might want to return a dict structure instead
                    component.children = [build_component_hierarchy(child) for child in children]
                    return component
                
                components = [build_component_hierarchy(root_comp) for root_comp in root_components]
                
            else:
                # Get all components for the system (flat list)
                components = session.exec(
                    select(SystemConfiguration).where(SystemConfiguration.system_id == system_id)
                ).all()
            
            logger.info(f"Retrieved {len(components)} components for system {system_id} {'with hierarchy' if include_hierarchy else ''}")
            return components
            
        except Exception as e:
            logger.error(f"Failed to get components for system {system_id}: {e}")
            raise

    async def get_components_by_system(self, system_id: UUID,ship_id: Optional[UUID] = None, include_hierarchy: bool = False) -> List[SystemConfiguration]:
        """Async get components by system"""
        def _get_components():
            with get_session_context() as session:
                return self._get_components_by_system_sync(session, system_id,ship_id, include_hierarchy)

        return await self.async_service.run_in_thread(_get_components)

    def _get_components_by_system_as_dict_sync(self, session: Session, system_id: UUID, ship_id: UUID) -> dict:
        """Synchronous get components by system returning hierarchical dict structure with bidirectional relations"""
        try:
            # Get all components for the system
            all_components = session.exec(
                select(SystemConfiguration).where(
                    (SystemConfiguration.system_id == system_id) &
                    (SystemConfiguration.ship_id == ship_id)
                )
            ).all()
            
            if not all_components:
                return {"system_id": system_id, "components": []}
            
            # Build components dictionary for quick lookup
            components_dict = {comp.component_id: comp for comp in all_components}
            root_components = [comp for comp in all_components if comp.parent_id is None]
            
            # Helper function to get all child IDs recursively with cycle detection
            def get_all_child_ids(component_id, visited=None):
                if visited is None:
                    visited = set()
                
                # Prevent infinite recursion due to circular references
                if component_id in visited:
                    return []
                
                visited.add(component_id)
                children = [comp.component_id for comp in all_components if comp.parent_id == component_id]
                all_children = children.copy()
                
                for child_id in children:
                    all_children.extend(get_all_child_ids(child_id, visited.copy()))
                
                return all_children
            
            def build_component_tree(component, current_path=None):
                """Build component tree with cycle detection using current path"""
                if current_path is None:
                    current_path = set()
                
                # Prevent infinite recursion by checking if we're already processing this component in current path
                if component.component_id in current_path:
                    logger.warning(f"Circular reference detected for component {component.component_id}")
                    return {
                        "component_id": component.component_id,
                        "component_name": component.component_name,
                        "error": "circular_reference",
                        "children": []
                    }
                
                # Add current component to path
                current_path.add(component.component_id)
                
                # Get direct children
                direct_children = [comp for comp in all_components if comp.parent_id == component.component_id]
                
                # Get all descendant IDs
                all_descendant_ids = get_all_child_ids(component.component_id)
                
                # Build the component data
                component_data = {
                    "component_id": component.component_id,
                    "component_name": component.component_name,
                    "department_id": component.department_id,
                    "parent_id": component.parent_id,
                    "CMMS_EquipmentCode": component.CMMS_EquipmentCode,
                    "is_lmu": component.is_lmu,
                    "parent_name": component.parent_name,
                    "nomenclature": component.nomenclature,
                    "etl": component.etl,
                    "created_date": component.created_date,
                    "modified_date": component.modified_date,
                    
                    # Bidirectional relations for component level
                    "belongs_to_system": system_id,
                    "has_children": [child.component_id for child in direct_children],
                    "is_child_of": component.parent_id,
                    "has_descendants": all_descendant_ids,
                    "is_root_component": component.parent_id is None,
                    "child_count": len(direct_children),
                    "descendant_count": len(all_descendant_ids),
                    
                    # Recursively build children with updated path
                    "children": []
                }
                
                # Process children
                for child in direct_children:
                    child_tree = build_component_tree(child, current_path.copy())
                    component_data["children"].append(child_tree)
                
                # Remove current component from path before returning
                current_path.discard(component.component_id)
                
                return component_data
            
            # Build result components
            result_components = []
            for root_comp in root_components:
                component_tree = build_component_tree(root_comp)
                result_components.append(component_tree)
            
            result = {
                "system_id": system_id,
                "total_components": len(all_components),
                "root_components_count": len(root_components),
                
                # Bidirectional relations at component collection level
                "all_component_ids": [comp.component_id for comp in all_components],
                "root_component_ids": [comp.component_id for comp in root_components],
                
                "components": result_components
            }
            
            logger.info(f"Retrieved hierarchical component structure for system {system_id}: {len(all_components)} total components, {len(root_components)} root components")
            return result
            
        except Exception as e:
            logger.error(f"Failed to get component hierarchy for system {system_id}: {e}")
            raise    
    async def get_components_by_system_as_dict(self, system_id: UUID, ship_id: UUID) -> dict:
        """Async get components by system returning hierarchical dict structure with bidirectional relations"""
        def _get_components():
            with get_session_context() as session:
                return self._get_components_by_system_as_dict_sync(session, system_id, ship_id)

        return await self.async_service.run_in_thread(_get_components)

    def _get_root_components_by_system_sync(self, session: Session, system_id: UUID) -> List[SystemConfiguration]:
        """Synchronous get only root components (no parent) by system"""
        try:
            root_components = session.exec(
                select(SystemConfiguration).where(
                    SystemConfiguration.system_id == system_id,
                    SystemConfiguration.parent_id.is_(None)
                )
            ).all()
            
            logger.info(f"Retrieved {len(root_components)} root components for system {system_id}")
            return root_components
            
        except Exception as e:
            logger.error(f"Failed to get root components for system {system_id}: {e}")
            raise

    async def get_root_components_by_system(self, system_id: UUID) -> List[SystemConfiguration]:
        """Async get only root components (no parent) by system"""
        def _get_components():
            with get_session_context() as session:
                return self._get_root_components_by_system_sync(session, system_id)

        return await self.async_service.run_in_thread(_get_components)