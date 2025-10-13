from typing import List, Optional
from uuid import UUID
from sqlalchemy import func
from sqlmodel import Session, select, and_, or_, desc, asc
from datetime import datetime
from api.models import SystemConfiguration, Ship, Department  # Changed from backend.api.models
from api.models.systemconfiguration import (  # Changed from backend.api.models
    BulkComponentCreate, BulkOperationResult, ComponentHierarchyStats,
    ComponentSearchFilter,
    SystemConfigurationCreate, SystemConfigurationRead, SystemConfigurationUpdate
)
from api.db.connection import get_session_context, get_async_db_service

from datetime import datetime
from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import logging

# Import your naval ship models (adjust import path as needed)
from backend.api.models import SystemConfiguration, Ship, Department

logger = logging.getLogger(__name__)

class SystemConfigurationRepository:
    """Repository for SystemConfiguration operations"""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, component_data: SystemConfigurationCreate) -> SystemConfiguration:
        """Synchronous create a new component"""
        try:
            component = SystemConfiguration(**component_data.dict())
            session.add(component)
            session.commit()
            session.refresh(component)
            logger.info(
                f"Created component: {component.component_name} (ID: {component.component_id})")
            return component
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create component: {e}")
            raise

    async def create(self, component_data: SystemConfigurationCreate) -> SystemConfiguration:
        """Async create a new component"""
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, component_data)
        return await self.async_service.run_in_thread(_create)

    def _bulk_create_sync(self, session: Session, components_data: BulkComponentCreate) -> BulkOperationResult:
        """Synchronous create multiple components"""
        success_count = 0
        error_count = 0
        errors = []
        created_ids = []

        for component_data in components_data.components:
            try:
                component = SystemConfiguration(**component_data.dict())
                session.add(component)
                session.commit()
                success_count += 1
                created_ids.append(component.component_id)
            except Exception as e:
                error_count += 1
                errors.append(
                    f"Failed to create {component_data.component_id}: {str(e)}")
                session.rollback()

        return BulkOperationResult(
            success_count=success_count,
            error_count=error_count,
            errors=errors,
            created_ids=created_ids,
            updated_ids=[]
        )

    async def bulk_create(self, components_data: BulkComponentCreate) -> BulkOperationResult:
        """Async create multiple components"""
        def _bulk_create():
            with get_session_context() as session:
                return self._bulk_create_sync(session, components_data)
        return await self.async_service.run_in_thread(_bulk_create)

    def _get_by_id_sync(self, session: Session, component_id: UUID) -> Optional[SystemConfiguration]:
        """Synchronous get component by ID"""
        try:
            statement = select(SystemConfiguration).where(
                SystemConfiguration.component_id == component_id)
            return session.exec(statement).first()
        except Exception as e:
            logger.error(f"Failed to get component by ID {component_id}: {e}")
            raise


    def _get_components_with_nomenclatures_by_ships_sync(self, session: Session, ship_names: list[str] = None) -> dict[str, list[str]]:
        """Synchronous get component names with nomenclatures filtered by ships"""
        try:
            # Base query
            statement = select(
                SystemConfiguration.component_name,
                SystemConfiguration.nomenclature
            ).join(
                Ship, SystemConfiguration.ship_id == Ship.ship_id
            ).where(
                SystemConfiguration.parent_id.is_(None)
            )
            
            # Add ship filter if provided
            if ship_names:
                statement = statement.where(Ship.ship_name.in_(ship_names))
            
            statement = statement.order_by(SystemConfiguration.component_name, SystemConfiguration.nomenclature)
            
            results = session.exec(statement).all()
            
            # Group nomenclatures by component name
            component_dict = {}
            for component_name, nomenclature in results:
                if component_name not in component_dict:
                    component_dict[component_name] = []
                
                # Avoid duplicates while preserving order
                if nomenclature not in component_dict[component_name]:
                    component_dict[component_name].append(nomenclature)
            
            return component_dict
            
        except Exception as e:
            logger.error(f"Failed to get components with nomenclatures by ships {ship_names}: {e}")
            raise
        
    async def get_components_with_nomenclatures_by_ships(self, ship_names: list[str] = None) -> dict[str, list[str]]:
        """Async get component names with nomenclatures filtered by ship names"""
        def _get():
            with get_session_context() as session:
                return self._get_components_with_nomenclatures_by_ships_sync(session, ship_names)
        return await self.async_service.run_in_thread(_get)

    async def get_by_id(self, component_id: UUID) -> Optional[SystemConfiguration]:
        """Async get component by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_by_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_get)
    
    def _get_nomenclatures_wrt_component_name_sync(self, session: Session, component_name: str) -> List[dict]:
        """Synchronous get component id and nomenclature by component name"""
        try:
            statement = select(
                SystemConfiguration.component_id,
                SystemConfiguration.nomenclature,
                Ship.ship_name
            ).join(
                Ship, SystemConfiguration.ship_id == Ship.ship_id
            ).where(
                SystemConfiguration.component_name == component_name
            )
            
            results = session.exec(statement).all()
            
            return [{"id": result[0], "nomenclature": result[1] , "ship_name": result[2]} for result in results]
            
        except Exception as e:
            logger.error(f"Failed to get component details for {component_name}: {e}")
            raise

    async def get_nomenclatures_wrt_component_name(self, component_name: str) -> List[dict]:
        """Async get component id and nomenclature by component name"""
        def _get():
            with get_session_context() as session:
                return self._get_nomenclatures_wrt_component_name_sync(session, component_name)
        return await self.async_service.run_in_thread(_get)   
     
    def _get_nomenclatures_wrt_component_name_wrt_ships_sync(
        self, 
        session: Session, 
        component_name: str,
        ships: Optional[List[str]] = None
    ) -> List[dict]:
        """Synchronous get component id and nomenclature by component name"""
        try:
            statement = select(
                SystemConfiguration.component_id,
                SystemConfiguration.nomenclature,
                Ship.ship_name
            ).join(
                Ship, SystemConfiguration.ship_id == Ship.ship_id
            ).where(
                SystemConfiguration.component_name == component_name
            )
            
            # ✅ Add ships filter if provided
            if ships:
                statement = statement.where(Ship.ship_name.in_(ships))
            
            results = session.exec(statement).all()
            
            return [
                {
                    "id": result[0], 
                    "nomenclature": result[1], 
                    "ship": result[2]  # ✅ Changed key from "ship_name" to "ship" to match your service code
                } 
                for result in results
            ]
            
        except Exception as e:
            logger.error(f"Failed to get component details for {component_name}: {e}")
            raise

    async def get_nomenclatures_wrt_component_name_wrt_ships(
        self, 
        component_name: str,
        ships: Optional[List[str]] = None
    ) -> List[dict]:
        """Async get component id and nomenclature by component name"""
        def _get():
            with get_session_context() as session:
                return self._get_nomenclatures_wrt_component_name_wrt_ships_sync(
                    session, 
                    component_name,
                    ships
                )
        return await self.async_service.run_in_thread(_get)
    
    def _get_component_id_and_ship_name_by_nomenclature_sync(self, session: Session, nomenclature: str) -> list[tuple[str, str]]:
        """Synchronous get component ID by nomenclature"""
        try:
            statement = select(SystemConfiguration.component_id,Ship.ship_name
            ).join(
                Ship, SystemConfiguration.ship_id == Ship.ship_id
            ).where(
                SystemConfiguration.nomenclature == nomenclature)
            return session.exec(statement).all()
        except Exception as e:
            logger.error(f"Failed to get component ID by nomenclature {nomenclature}: {e}")
            raise

    async def get_component_id_and_ship_name_by_nomenclature(self, nomenclature: str) -> list[tuple[str, str]]:
        """Async get component ID by nomenclature"""
        def _get():
            with get_session_context() as session:
                return self._get_component_id_and_ship_name_by_nomenclature_sync(session, nomenclature)
        return await self.async_service.run_in_thread(_get)
    
    def _get_component_id_by_nomenclature_and_sensor_name_sync(self, session: Session, nomenclature: str) -> list[tuple[str, str]]:
        """Synchronous get component ID by nomenclature"""
        try:
            statement = select(SystemConfiguration.component_id,Ship.ship_name
            ).join(
                Ship, SystemConfiguration.ship_id == Ship.ship_id
            ).where(
                SystemConfiguration.nomenclature == nomenclature)
            return session.exec(statement).all()
        except Exception as e:
            logger.error(f"Failed to get component ID by nomenclature {nomenclature}: {e}")
            raise

    async def get_component_id_by_nomenclature_and_sensor_name(self, nomenclature: str,ships: Optional[List[str]] = None) -> list[tuple[str, str]]:
        """Async get component ID by nomenclature"""
        def _get():
            with get_session_context() as session:
                return self._get_component_id_by_nomenclature_and_sensor_name_sync(session, nomenclature,ships)
        return await self.async_service.run_in_thread(_get)
    
    def _get_component_id_by_nomenclature_sync(self, session: Session, nomenclature: str) -> Optional[str]:
        """Synchronous get component ID by nomenclature"""
        try:
            statement = select(SystemConfiguration.component_id).where(
                SystemConfiguration.nomenclature == nomenclature)
            return session.exec(statement).all()
        except Exception as e:
            logger.error(f"Failed to get component ID by nomenclature {nomenclature}: {e}")
            raise

    async def get_component_id_by_nomenclature(self, nomenclature: str) -> Optional[str]:
        """Async get component ID by nomenclature"""
        def _get():
            with get_session_context() as session:
                return self._get_component_id_by_nomenclature_sync(session, nomenclature)
        return await self.async_service.run_in_thread(_get)

    def _get_components_nomenclatures_sync(self, session: Session) -> Dict[str, List[str]]:
        """Synchronous get all components with their nomenclatures"""
        try:
            # Assuming you have a table structure where nomenclatures are linked to components
            # Adjust the query based on your actual table structure
            statement = select(
                SystemConfiguration.component_name,
                SystemConfiguration.nomenclature  # or whatever field contains the nomenclature
            ).where(
                SystemConfiguration.nomenclature.is_not(None)  # Only get records with nomenclatures
            ).order_by(
                SystemConfiguration.component_name,
                SystemConfiguration.nomenclature
            )
            
            results = session.exec(statement).all()
            
            # Group nomenclatures by component
            components_dict = {}
            for component_name, nomenclature in results:
                if component_name not in components_dict:
                    components_dict[component_name] = []
                components_dict[component_name].append(nomenclature)
            
            return components_dict
            
        except Exception as e:
            logger.error(f"Failed to get components nomenclatures: {e}")
            raise

    async def get_components_nomenclatures(self) -> Dict[str, List[str]]:
        """Async get all components with their nomenclatures"""
        def _get():
            with get_session_context() as session:
                return self._get_components_nomenclatures_sync(session)
        return await self.async_service.run_in_thread(_get)
    
    def _get_by_department_sync(self, session: Session, department_id: str) -> List[SystemConfiguration]:
        """Synchronous get all components for a department"""
        try:
            statement = select(SystemConfiguration).where(
                SystemConfiguration.department_id == department_id)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(
                f"Failed to get components for department {department_id}: {e}")
            raise

    async def get_by_department(self, department_id: str) -> List[SystemConfiguration]:
        """Async get all components for a department"""
        def _get():
            with get_session_context() as session:
                return self._get_by_department_sync(session, department_id)
        return await self.async_service.run_in_thread(_get)

    def _get_by_ship_sync(self, session: Session, ship_id: UUID) -> List[SystemConfigurationRead]:
        try:
            statement = (
                select(SystemConfiguration)
                .join(Department, Department.department_id == SystemConfiguration.department_id)
                .where(Department.ship_id == ship_id)
            )
            results = list(session.exec(statement))

            # 💥 Force full field loading into Pydantic models while session is still open
            return [SystemConfigurationRead.model_validate(row) for row in results]

        except Exception as e:
            logger.error(f"Failed to get components for ship {ship_id}: {e}")
            raise

    async def get_by_ship(self, ship_id: UUID) -> List[SystemConfigurationRead]:
        """Async get all components for a ship"""
        def _get():
            with get_session_context() as session:
                return self._get_by_ship_sync(session, ship_id)
        return await self.async_service.run_in_thread(_get)

    def _get_root_components_sync(self, session: Session, department_id: UUID) -> List[SystemConfigurationRead]:
        """Synchronous get root components (no parent) for a department"""
        try:
            statement = select(SystemConfiguration).where(
                and_(
                    SystemConfiguration.department_id == department_id,
                    SystemConfiguration.parent_id.is_(None)
                )
            )
            components = session.exec(statement).all()  # Get ORM objects
            # Convert to SystemConfigurationRead while session is active
            return [SystemConfigurationRead.model_validate(comp) for comp in components]
        except Exception as e:
            logger.error(
                f"Failed to get root components for department {department_id}: {e}")
            raise

    async def get_root_components(self, department_id: UUID) -> List[SystemConfigurationRead]:
        """Async get root components (no parent) for a department"""
        def _get():
            with get_session_context() as session:
                return self._get_root_components_sync(session, department_id)
        return await self.async_service.run_in_thread(_get)

    def _get_children_sync(self, session: Session, parent_id: UUID) -> List[SystemConfiguration]:
        """Synchronous get child components of a parent"""
        try:
            statement = select(SystemConfiguration).where(
                SystemConfiguration.parent_id == parent_id)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(f"Failed to get children for parent {parent_id}: {e}")
            raise

    async def get_children(self, parent_id: str) -> List[SystemConfiguration]:
        """Async get child components of a parent"""
        def _get():
            with get_session_context() as session:
                return self._get_children_sync(session, parent_id)
        return await self.async_service.run_in_thread(_get)
    
    def _is_component_sync(self, session: Session, name: str) -> bool:
        """Synchronous check if a component exists by name"""
        try:
            statement = select(SystemConfiguration).where(
                SystemConfiguration.component_name == name)
            result = session.exec(statement).first()
            
            return result is not None
            
        except Exception as e:
            logger.error(f"Failed to check if component {name} exists: {e}")
            raise

    async def is_component(self, name: str) -> bool:
        """Async check if a component exists by name"""
        def _check():
            with get_session_context() as session:
                return self._is_component_sync(session, name)
        return await self.async_service.run_in_thread(_check)

    def _get_hierarchy_by_nomenclature_and_ship_sync(self, session: Session, nomenclature: str, ship_name: str) -> Dict[str, Any]:
        """Synchronous get complete hierarchy for a component by nomenclature and ship name"""
        try:
            # First, find the ship by name
            ship_statement = select(Ship).where(Ship.ship_name == ship_name)
            ship = session.exec(ship_statement).first()

            if not ship:
                logger.error(f"Ship with name '{ship_name}' not found")
                return {}

            # Find the component by nomenclature within the ship
            component_statement = (
                select(SystemConfiguration)
                .join(Department, Department.department_id == SystemConfiguration.department_id)
                .where(
                    and_(
                        SystemConfiguration.nomenclature == nomenclature,
                        Department.ship_id == ship.ship_id
                    )
                )
            )

            component = session.exec(component_statement).first()

            if not component:
                logger.error(
                    f"Component with nomenclature '{nomenclature}' not found in ship '{ship_name}'")
                return {}

            # Get all descendants recursively
            def get_descendants(comp_id: str) -> List[Dict]:
                # ✅ Fixed: pass session parameter
                children = self._get_children_sync(session, comp_id)
                result = []
                for child in children:
                    child_dict = {
                        "component_id": child.component_id,
                        "component_name": child.component_name,
                        "nomenclature": child.nomenclature,
                        "children": get_descendants(child.component_id)
                    }
                    result.append(child_dict)
                return result

            return {
                "component_id": component.component_id,
                "component_name": component.component_name,
                "nomenclature": component.nomenclature,
                "ship_name": ship.ship_name,
                "department_id": component.department_id,
                "children": get_descendants(component.component_id)
            }

        except Exception as e:
            logger.error(
                f"Failed to get hierarchy for nomenclature '{nomenclature}' in ship '{ship_name}': {e}")
            raise

    async def get_hierarchy_by_nomenclature_and_ship(self, nomenclature: str, ship_name: str) -> Dict[str, Any]:
        """Async get complete hierarchy for a component by nomenclature and ship name"""
        def _get():
            with get_session_context() as session:
                return self._get_hierarchy_by_nomenclature_and_ship_sync(session, nomenclature, ship_name)
        return await self.async_service.run_in_thread(_get)

    def _get_hierarchy_sync(self, session: Session, component_id: UUID) -> Dict[str, Any]:
        """Synchronous get complete hierarchy for a component"""
        try:
            component = self._get_by_id_sync(session, component_id)
            if not component:
                return {}

            # Get all descendants recursively
            def get_descendants(comp_id: str) -> List[Dict]:
                children = self._get_children_sync(session, comp_id)
                result = []
                for child in children:
                    child_dict = {
                        "component_id": child.component_id,
                        "component_name": child.component_name,
                        "nomenclature": child.nomenclature,
                        "children": get_descendants(child.component_id)
                    }
                    result.append(child_dict)
                return result

            return {
                "component_id": component.component_id,
                "component_name": component.component_name,
                "nomenclature": component.nomenclature,
                "children": get_descendants(component_id)
            }
        except Exception as e:
            logger.error(
                f"Failed to get hierarchy for component {component_id}: {e}")
            raise

    async def get_hierarchy(self, component_id: UUID) -> Dict[str, Any]:
        """Async get complete hierarchy for a component"""
        def _get():
            with get_session_context() as session:
                return self._get_hierarchy_sync(session, component_id)
        return await self.async_service.run_in_thread(_get)

    def _search_sync(self, session: Session, filters: ComponentSearchFilter, skip: int = 0, limit: int = 100) -> List[SystemConfiguration]:
        """Synchronous search components with filters"""
        try:
            statement = select(SystemConfiguration)
            conditions = []

            if filters.ship_id:
                statement = statement.join(Department).where(
                    Department.ship_id == filters.ship_id)

            if filters.department_id:
                conditions.append(
                    SystemConfiguration.department_id == filters.department_id)

            if filters.component_name:
                conditions.append(SystemConfiguration.component_name.ilike(
                    f"%{filters.component_name}%"))

            if filters.parent_id:
                conditions.append(
                    SystemConfiguration.parent_id == filters.parent_id)

            if filters.is_lmu is not None:
                conditions.append(SystemConfiguration.is_lmu == filters.is_lmu)

            if filters.has_parent is not None:
                if filters.has_parent:
                    conditions.append(
                        SystemConfiguration.parent_id.is_not(None))
                else:
                    conditions.append(SystemConfiguration.parent_id.is_(None))

            if filters.cmms_equipment_code:
                conditions.append(SystemConfiguration.CMMS_EquipmentCode.ilike(
                    f"%{filters.cmms_equipment_code}%"))

            if conditions:
                statement = statement.where(and_(*conditions))

            statement = statement.offset(skip).limit(limit)
            return list(session.exec(statement))
        except Exception as e:
            logger.error(f"Failed to search components: {e}")
            raise

    async def search(self, filters: ComponentSearchFilter, skip: int = 0, limit: int = 100) -> List[SystemConfiguration]:
        """Async search components with filters"""
        def _search():
            with get_session_context() as session:
                return self._search_sync(session, filters, skip, limit)
        return await get_async_db_service.run_in_thread(_search)

    def _update_sync(self, session: Session, component_id: str, component_data: SystemConfigurationUpdate) -> Optional[SystemConfiguration]:
        """Synchronous update component"""
        try:
            component = self._get_by_id_sync(session, component_id)
            if not component:
                return None

            update_data = component_data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(component, key, value)

            component.modified_date = datetime.utcnow()
            session.commit()
            session.refresh(component)
            logger.info(
                f"Updated component: {component.component_name} (ID: {component.component_id})")
            return component
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to update component {component_id}: {e}")
            raise

    async def update(self, component_id: str, component_data: SystemConfigurationUpdate) -> Optional[SystemConfiguration]:
        """Async update component"""
        def _update():
            with get_session_context() as session:
                return self._update_sync(session, component_id, component_data)
        return await get_async_db_service.run_in_thread(_update)

    def _delete_sync(self, session: Session, component_id: str) -> bool:
        """Synchronous delete component (will fail if it has children due to foreign key constraint)"""
        try:
            component = self._get_by_id_sync(session, component_id)
            if not component:
                return False

            # Check if component has children
            children = self._get_children_sync(session, component_id)
            if children:
                raise ValueError(
                    f"Cannot delete component {component_id} as it has {len(children)} child components")

            session.delete(component)
            session.commit()
            logger.info(
                f"Deleted component: {component.component_name} (ID: {component.component_id})")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to delete component {component_id}: {e}")
            raise

    async def delete(self, component_id: str) -> bool:
        """Async delete component (will fail if it has children due to foreign key constraint)"""
        def _delete():
            with get_session_context() as session:
                return self._delete_sync(session, component_id)
        return await get_async_db_service.run_in_thread(_delete)

    def _get_hierarchy_stats_sync(self, session: Session, component_id: str) -> Optional[ComponentHierarchyStats]:
        """Synchronous get hierarchy statistics for a component"""
        try:
            component = self._get_by_id_sync(session, component_id)
            if not component:
                return None

            # Get department and ship info
            department = session.exec(
                select(Department).where(
                    Department.department_id == component.department_id)
            ).first()

            ship = session.exec(
                select(Ship).where(Ship.ship_id == department.ship_id)
            ).first() if department else None

            # Calculate hierarchy level
            level = 0
            current_parent = component.parent_id
            while current_parent:
                level += 1
                parent_component = self._get_by_id_sync(
                    session, current_parent)
                current_parent = parent_component.parent_id if parent_component else None

            # Count children
            children_count = len(
                self._get_children_sync(session, component_id))

            return ComponentHierarchyStats(
                component_id=component_id,
                component_name=component.component_name,
                department_name=department.department_name if department else "Unknown",
                ship_name=ship.ship_name if ship else "Unknown",
                hierarchy_level=level,
                total_children=children_count,
                is_root=component.parent_id is None
            )
        except Exception as e:
            logger.error(
                f"Failed to get hierarchy stats for component {component_id}: {e}")
            raise

    async def get_hierarchy_stats(self, component_id: str) -> Optional[ComponentHierarchyStats]:
        """Async get hierarchy statistics for a component"""
        def _get_stats():
            with get_session_context() as session:
                return self._get_hierarchy_stats_sync(session, component_id)
        return await get_async_db_service.run_in_thread(_get_stats)
