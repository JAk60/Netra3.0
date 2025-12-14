import asyncio
import logging
from typing import List, Dict, Any, Union
from fastapi import HTTPException

from backend.api.db.dependencies import get_system_config_repository
from api.db.repos.reliability.rcm import RcmRepository

logger = logging.getLogger(__name__)


class RCMFilter:
    """Filter configuration for RCM retrieval."""
    def __init__(self, ships: List[str] = None, **kwargs):
        self.ships = ships or []
        self.additional_filters = kwargs
    
    def should_include_ship(self, ship_name: str) -> bool:
        """Check if a ship should be included based on filter criteria."""
        if not self.ships:  # Empty list means include all ships
            return True
        return ship_name in self.ships


class RCMService:
    """Service for retrieving RCM (Reliability Centered Maintenance) data."""
    
    @staticmethod
    async def _get_all_component_ids_with_ships(
        names: Union[List[str], Dict[str, List[str]]],
        rcm_filter: RCMFilter
    ) -> List[Dict[str, Any]]:
        """
        Batch query to get all component_ids with their ship and nomenclature info.
        
        Args:
            names: Either a list of component/nomenclature names, OR 
                   a dict mapping parent nomenclatures to lists of assembly nomenclatures
                   Example: {"GT1": ["P1", "P2"], "GT2": ["P1"]}
        
        Returns:
            List of dicts with: component_id, nomenclature, ship_id, component_name, parent_nomenclature
        """
        sys_repo = get_system_config_repository()
        
        # ✅ CRITICAL: Check type BEFORE any processing
        logger.info(f"_get_all_component_ids_with_ships - Input type: {type(names)}")
        logger.info(f"_get_all_component_ids_with_ships - Input value: {names}")
        
        # Handle hierarchical structure (dict input)
        if isinstance(names, dict):
            logger.info(f"Processing hierarchical structure with {len(names)} parents")
            return await RCMService._get_assembly_component_ids(names, rcm_filter, sys_repo)
        
        # Handle flat list input (original behavior)
        logger.info(f"Processing flat list with {len(names)} items")
        return await RCMService._get_flat_component_ids(names, rcm_filter, sys_repo)
    
    @staticmethod
    async def _get_assembly_component_ids(
        assembly_dict: Dict[str, List[str]],
        rcm_filter: RCMFilter,
        sys_repo
    ) -> List[Dict[str, Any]]:
        """
        Get component_ids for assemblies under parent equipment.
        
        Args:
            assembly_dict: Dict mapping parent nomenclatures to assembly nomenclatures
                          Example: {"GT1": ["P1", "P2"], "GT2": ["P1"]}
        """
        all_components = []
        
        for parent_nomenclature, assembly_list in assembly_dict.items():
            logger.info(f"Processing parent '{parent_nomenclature}' with assemblies: {assembly_list}")
            
            # Check which assemblies are components vs nomenclatures
            assembly_checks = await asyncio.gather(
                *[sys_repo.is_component(assembly) for assembly in assembly_list]
            )
            
            component_assemblies = []
            nomenclature_assemblies = []
            
            for assembly, is_comp in zip(assembly_list, assembly_checks):
                if is_comp:
                    component_assemblies.append(assembly)
                else:
                    nomenclature_assemblies.append(assembly)
            
            logger.info(f"Component assemblies: {component_assemblies}, Nomenclature assemblies: {nomenclature_assemblies}")
            
            # Process component assemblies
            for assembly_component in component_assemblies:
                nomenclatures = await sys_repo.get_nomenclatures_wrt_component_name_wrt_ships(
                    assembly_component,
                    rcm_filter.ships
                )
                for nom_data in nomenclatures:
                    ship_name = nom_data.get("ship", "Unknown")
                    # Apply ship filter
                    if rcm_filter.should_include_ship(ship_name):
                        all_components.append({
                            "component_id": nom_data["id"],
                            "nomenclature": nom_data["nomenclature"],
                            "ship_id": ship_name,
                            "component_name": assembly_component,
                            "parent_nomenclature": parent_nomenclature
                        })
            
            # Process nomenclature assemblies with case-insensitive matching
            for assembly_nomenclature in nomenclature_assemblies:
                # Get component_id and ship info for this assembly nomenclature
                component_data = await sys_repo.get_component_id_and_ship_name_by_nomenclature(
                    assembly_nomenclature
                )
                
                # ✅ Case-insensitive fallback if exact match fails
                if not component_data:
                    logger.warning(f"No exact match for '{assembly_nomenclature}', trying case-insensitive search")
                    # Get all nomenclatures and search case-insensitively
                    all_nomenclatures = await sys_repo.get_all_nomenclatures_by_ships(rcm_filter.ships)
                    
                    # Search for case-insensitive match
                    normalized_input = assembly_nomenclature.lower()
                    for parent, assemblies in all_nomenclatures.items():
                        for actual_nomenclature in assemblies:
                            if actual_nomenclature.lower() == normalized_input:
                                logger.info(
                                    f"Found case-insensitive match: '{assembly_nomenclature}' -> '{actual_nomenclature}'"
                                )
                                # Get component data for the actual nomenclature
                                component_data = await sys_repo.get_component_id_and_ship_name_by_nomenclature(
                                    actual_nomenclature
                                )
                                if component_data:
                                    break
                        if component_data:
                            break
                
                if component_data:
                    for component_id, ship_name in component_data:
                        # Apply ship filter
                        if rcm_filter.should_include_ship(ship_name):
                            all_components.append({
                                "component_id": component_id,
                                "nomenclature": assembly_nomenclature,
                                "ship_id": ship_name,
                                "component_name": assembly_nomenclature,
                                "parent_nomenclature": parent_nomenclature
                            })
                else:
                    logger.warning(f"No component found for assembly nomenclature: {assembly_nomenclature}")
        
        logger.info(f"Found {len(all_components)} assembly components after filtering")
        return all_components
    
    @staticmethod
    async def _get_flat_component_ids(
        names: List[str],
        rcm_filter: RCMFilter,
        sys_repo
    ) -> List[Dict[str, Any]]:
        """
        Get component_ids for flat list of component/nomenclature names (original behavior).
        """
        # Step 1: Batch check which names are components vs nomenclatures
        component_checks = await asyncio.gather(
            *[sys_repo.is_component(name) for name in names]
        )
        
        component_names = []
        nomenclature_names = []
        
        for name, is_component in zip(names, component_checks):
            if is_component:
                component_names.append(name)
            else:
                nomenclature_names.append(name)
        
        logger.info(f"Components: {component_names}, Nomenclatures: {nomenclature_names}")
        
        # Step 2: Batch query for all component_ids
        all_components = []
        
        # Get nomenclatures for components
        if component_names:
            for component_name in component_names:
                nomenclatures = await sys_repo.get_nomenclatures_wrt_component_name_wrt_ships(
                    component_name,
                    rcm_filter.ships
                )
                for nom_data in nomenclatures:
                    all_components.append({
                        "component_id": nom_data["id"],
                        "nomenclature": nom_data["nomenclature"],
                        "ship_id": nom_data.get("ship", "Unknown"),
                        "component_name": component_name
                    })
        
        # Get component_ids for nomenclatures with case-insensitive fallback
        if nomenclature_names:
            for nomenclature in nomenclature_names:
                component_data = await sys_repo.get_component_id_and_ship_name_by_nomenclature(nomenclature)
                
                # ✅ Case-insensitive fallback if exact match fails
                if not component_data:
                    logger.warning(f"No exact match for '{nomenclature}', trying case-insensitive search")
                    all_nomenclatures = await sys_repo.get_all_nomenclatures_by_ships(rcm_filter.ships)
                    
                    normalized_input = nomenclature.lower()
                    for parent, assemblies in all_nomenclatures.items():
                        for actual_nomenclature in assemblies:
                            if actual_nomenclature.lower() == normalized_input:
                                logger.info(
                                    f"Found case-insensitive match: '{nomenclature}' -> '{actual_nomenclature}'"
                                )
                                component_data = await sys_repo.get_component_id_and_ship_name_by_nomenclature(
                                    actual_nomenclature
                                )
                                if component_data:
                                    break
                        if component_data:
                            break
                
                if component_data:
                    for component_id, ship_name in component_data:
                        all_components.append({
                            "component_id": component_id,
                            "nomenclature": nomenclature,
                            "ship_id": ship_name,
                            "component_name": nomenclature
                        })
        
        # Step 3: Apply ship filter
        filtered_components = [
            comp for comp in all_components 
            if rcm_filter.should_include_ship(comp["ship_id"])
        ]
        
        logger.info(f"Found {len(filtered_components)} components after filtering")
        return filtered_components
    
    @staticmethod
    async def _batch_fetch_rcm_records(
        component_ids: List[str]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Fetch RCM records for multiple component_ids at once using optimized batch query.
        
        Returns:
            Dict mapping component_id -> RCM record
        """
        if not component_ids:
            return {}
        
        rcm_repo = RcmRepository(session=None)  # Will use async internally
        
        # Use new batch method to fetch only requested component_ids
        rcm_records = await rcm_repo.get_by_component_ids(component_ids)
        
        # Create mapping: component_id -> RCM record
        rcm_map = {}
        for rcm_record in rcm_records:
            comp_id = str(rcm_record.get("component_id"))
            rcm_map[comp_id] = rcm_record
        
        logger.info(f"Found {len(rcm_map)} RCM records out of {len(component_ids)} requested")
        
        return rcm_map
    
    @staticmethod
    async def get_rcm(
        name: Union[str, List[str], Dict[str, List[str]]], 
        filter_config: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve RCM records for component(s) or nomenclature(s) with optional filtering.
        
        Args:
            name: One of:
                - str: Single component name or nomenclature
                - List[str]: List of component names or nomenclatures
                - Dict[str, List[str]]: Hierarchical structure mapping parent nomenclatures to assemblies
                  Example: {"GT1": ["P1", "P2"], "GT2": ["P1"]}
            filter_config: Dictionary containing filter parameters
                - ships: List[str] - Filter by specific ships
                
        Returns:
            List of RCM records or error messages for components without records
            
        Example Requests:
            # Original - Single component
            name="Main Engine", ships=["INS ONE"]
            
            # Original - Multiple components
            name=["Main Engine", "Aux Engine"], ships=["INS ONE"]
            
            # NEW - Hierarchical assemblies
            name={"GT 1": ["p1", "p2"], "GT 2": ["p1"]}, ships=["INS ONE"]
            
        Example Response:
            [
                {
                    "rcm_id": "...",
                    "component_id": "...",
                    "nomenclature": "p1",
                    "ship_id": "INS ONE",
                    "parent_nomenclature": "GT 1",  # Only for hierarchical queries
                    "decision_path": {...},
                    "maintenance_policy": "...",
                    "created_date": "...",
                    "modified_date": "..."
                },
                {
                    "component_id": "...",
                    "nomenclature": "p2",
                    "ship_id": "INS ONE",
                    "parent_nomenclature": "GT 1",  # Only for hierarchical queries
                    "error": "No RCM record found for this component"
                }
            ]
        """
        try:
            # ✅ CRITICAL DEBUG LOGGING
            logger.info("=" * 80)
            logger.info("RCM get_rcm called with:")
            logger.info(f"  - name type: {type(name).__name__}")
            logger.info(f"  - name value: {name}")
            logger.info(f"  - name repr: {repr(name)}")
            logger.info(f"  - isinstance(name, dict): {isinstance(name, dict)}")
            logger.info(f"  - isinstance(name, list): {isinstance(name, list)}")
            logger.info(f"  - isinstance(name, str): {isinstance(name, str)}")
            logger.info(f"  - filter_config: {filter_config}")
            logger.info("=" * 80)
            
            print(name, filter_config, "------------>>>>")
            
            # Step 1: Parse filter config
            if filter_config is None:
                filter_config = {}
            
            rcm_filter = RCMFilter(**filter_config)
            logger.info(f"RCM query with filter: {filter_config}")
            
            # Step 2: Handle different input formats and validate EARLY
            # ✅ ADD EXPLICIT TYPE CHECK WITH DETAILED LOGGING
            if isinstance(name, dict):
                logger.info("✅ Detected DICT input - using hierarchical path")
                # Hierarchical input
                if not name:
                    raise HTTPException(
                        status_code=400,
                        detail="Assembly dictionary cannot be empty"
                    )
                names = name
                logger.info(f"Received hierarchical input with {len(name)} parents: {list(name.keys())}")
                
            elif isinstance(name, str):
                logger.info("✅ Detected STRING input - converting to list")
                # Single string - convert to list
                names = [name]
                logger.info(f"Received single component/nomenclature: {name}")
                
            elif isinstance(name, list):
                logger.info("✅ Detected LIST input - using flat path")
                # List of strings
                if not name:
                    raise HTTPException(
                        status_code=400,
                        detail="At least one component or nomenclature name must be provided"
                    )
                names = name
                logger.info(f"Received list of {len(name)} components/nomenclatures")
                
            else:
                error_msg = (
                    f"Invalid 'name' format. Must be str, List[str], or Dict[str, List[str]]. "
                    f"Got: {type(name).__name__} with value: {repr(name)}"
                )
                logger.error(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)
            
            # Step 3: Get all component_ids with metadata (handles both flat and hierarchical)
            components_info = await RCMService._get_all_component_ids_with_ships(
                names, rcm_filter
            )
            
            logger.info(f"Found {len(components_info)} components after processing")
            
            if not components_info:
                raise HTTPException(
                    status_code=404,
                    detail="No components found for the given names with specified filters"
                )
            
            # Step 4: Extract component_ids
            component_ids = [str(comp["component_id"]) for comp in components_info]
            
            # Step 5: Batch fetch RCM records
            rcm_records_map = await RCMService._batch_fetch_rcm_records(component_ids)
            
            # Step 6: Build results - match RCM records with component info
            results = []
            for comp_info in components_info:
                comp_id = str(comp_info["component_id"])
                
                if comp_id in rcm_records_map:
                    # RCM record exists
                    rcm_record = rcm_records_map[comp_id].copy()
                    
                    # Add parent_nomenclature if this was a hierarchical query
                    if "parent_nomenclature" in comp_info:
                        rcm_record["parent_nomenclature"] = comp_info["parent_nomenclature"]
                    
                    results.append(rcm_record)
                else:
                    # No RCM record found
                    error_info = {
                        "component_id": comp_id,
                        "nomenclature": comp_info["nomenclature"],
                        "ship_id": comp_info["ship_id"],
                        "component_name": comp_info["component_name"],
                        "error": "No RCM record found for this component"
                    }
                    
                    # Add parent_nomenclature if this was a hierarchical query
                    if "parent_nomenclature" in comp_info:
                        error_info["parent_nomenclature"] = comp_info["parent_nomenclature"]
                    
                    results.append(error_info)
            
            logger.info(f"Returning {len(results)} RCM results")
            return results
            
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Error in get_rcm: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to retrieve RCM records: {str(e)}"
            )