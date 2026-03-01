import asyncio
import logging
from typing import List, Dict, Any, Union, Optional
from fastapi import HTTPException
from uuid import UUID

from backend.api.db.dependencies import get_system_config_repository
from api.db.repos.reliability.rcm import RcmRepository

logger = logging.getLogger(__name__)


class RCMFilter:
    """Filter configuration for RCM retrieval."""
    def __init__(self, ships: List[str] = None, **kwargs):
        self.ships = ships or []
        self.additional_filters = kwargs

    def should_include_ship(self, ship_name: str) -> bool:
        if not self.ships:
            return True
        return ship_name in self.ships


class RCMService:
    """Service for retrieving RCM (Reliability Centered Maintenance) data."""

    @staticmethod
    async def _get_all_component_ids_with_ships(
        names: Union[List[str], Dict[str, List[str]]],
        rcm_filter: RCMFilter
    ) -> List[Dict[str, Any]]:
        sys_repo = get_system_config_repository()

        logger.info(f"_get_all_component_ids_with_ships - Input type: {type(names)}")
        logger.info(f"_get_all_component_ids_with_ships - Input value: {names}")

        if isinstance(names, dict):
            logger.info(f"Processing hierarchical structure with {len(names)} parents")
            return await RCMService._get_assembly_component_ids(names, rcm_filter, sys_repo)

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
        
        Key behavior:
        - Uses DB parent_id to verify each component truly belongs to the requested parent
        - Skips components whose DB parent doesn't match the requested parent
        - Removes skipped components from `seen` so the correct parent can claim them
        - This correctly handles GT1/GT2 sharing nomenclature "p1" but different components
        """
        all_components = []
        seen = set()  # Global dedup: (component_id, ship_name)

        for parent_nomenclature, assembly_list in assembly_dict.items():
            logger.info(f"Processing parent '{parent_nomenclature}' with assemblies: {assembly_list}")

            all_nomenclatures = await sys_repo.get_all_nomenclatures_by_ships(rcm_filter.ships)
            parent_assemblies = all_nomenclatures.get(parent_nomenclature, [])
            logger.info(f"Assemblies under '{parent_nomenclature}': {parent_assemblies}")

            assembly_checks = await asyncio.gather(
                *[sys_repo.is_component(assembly) for assembly in assembly_list]
            )

            nomenclature_assemblies = [
                assembly for assembly, is_comp
                in zip(assembly_list, assembly_checks)
                if not is_comp
            ]

            for assembly_nomenclature in nomenclature_assemblies:
                matched_nomenclature = None
                normalized_input = assembly_nomenclature.lower()

                for actual_nomenclature in parent_assemblies:
                    if actual_nomenclature.lower() == normalized_input:
                        matched_nomenclature = actual_nomenclature
                        break

                if not matched_nomenclature:
                    logger.warning(f"No match for '{assembly_nomenclature}' under '{parent_nomenclature}'")
                    continue

                component_data_full = await sys_repo.get_component_with_name_by_nomenclature(
                    matched_nomenclature
                )

                logger.info(
                    f"get_component_with_name_by_nomenclature('{matched_nomenclature}') "
                    f"returned {len(component_data_full) if component_data_full else 0} results"
                )

                if not component_data_full:
                    continue

                for row in component_data_full:
                    # Support both 3-tuple (old) and 4-tuple (new with parent_id)
                    if len(row) == 4:
                        component_id, ship_name, component_name, parent_id = row
                    else:
                        component_id, ship_name, component_name = row
                        parent_id = None

                    # ── Global dedup ───────────────────────────────────────────
                    dedup_key = (str(component_id), str(ship_name))
                    if dedup_key in seen:
                        logger.warning(
                            f"⚠️ Skipping duplicate: component_id={component_id} on {ship_name}"
                        )
                        continue
                    seen.add(dedup_key)

                    # ── Verify DB parent matches requested parent ───────────────
                    # This prevents GT2's "Pump" from appearing under GT1
                    # and GT1's "pump1" from appearing under GT2
                    if parent_id:
                        try:
                            actual_parent = await sys_repo.get_nomenclature_by_component_id(
                                UUID(str(parent_id))
                            )
                        except Exception as e:
                            logger.warning(f"Could not resolve parent_id {parent_id}: {e}")
                            actual_parent = None

                        if actual_parent and actual_parent != parent_nomenclature:
                            logger.warning(
                                f"⚠️ Skipping {matched_nomenclature} (component_id={component_id}): "
                                f"DB parent='{actual_parent}' != requested parent='{parent_nomenclature}'"
                            )
                            # ✅ Remove from seen so the correct parent can claim it
                            seen.discard(dedup_key)
                            continue

                    # ── Ship filter ────────────────────────────────────────────
                    if not rcm_filter.should_include_ship(ship_name):
                        logger.info(f"Filtered out: {ship_name} not in requested ships")
                        seen.discard(dedup_key)
                        continue

                    all_components.append({
                        "component_id": component_id,
                        "nomenclature": matched_nomenclature,
                        "ship_id": ship_name,
                        "component_name": component_name,
                        "parent_nomenclature": parent_nomenclature
                    })
                    logger.info(
                        f"✅ Added: {matched_nomenclature} "
                        f"(component_id={component_id}, ship={ship_name}, parent={parent_nomenclature})"
                    )

        logger.info(f"Found {len(all_components)} assembly components")
        return all_components

    @staticmethod
    async def _get_flat_component_ids(
        names: List[str],
        rcm_filter: RCMFilter,
        sys_repo
    ) -> List[Dict[str, Any]]:
        """Get component_ids for flat list of component/nomenclature names."""
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

        all_components = []

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

        if nomenclature_names:
            for nomenclature in nomenclature_names:
                component_data = await sys_repo.get_component_id_and_ship_name_by_nomenclature(nomenclature)

                if not component_data:
                    logger.warning(f"No exact match for '{nomenclature}', trying case-insensitive")
                    all_nomenclatures = await sys_repo.get_all_nomenclatures_by_ships(rcm_filter.ships)
                    normalized_input = nomenclature.lower()
                    for parent, assemblies in all_nomenclatures.items():
                        for actual_nomenclature in assemblies:
                            if actual_nomenclature.lower() == normalized_input:
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
        """Fetch RCM records for multiple component_ids at once."""
        if not component_ids:
            return {}

        rcm_repo = RcmRepository(session=None)
        rcm_records = await rcm_repo.get_by_component_ids(component_ids)

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
        """
        try:
            logger.info("=" * 80)
            logger.info(f"get_rcm called: name={name}, filter_config={filter_config}")
            logger.info("=" * 80)

            if filter_config is None:
                filter_config = {}

            rcm_filter = RCMFilter(**filter_config)

            if isinstance(name, dict):
                if not name:
                    raise HTTPException(status_code=400, detail="Assembly dictionary cannot be empty")
                names = name
            elif isinstance(name, str):
                names = [name]
            elif isinstance(name, list):
                if not name:
                    raise HTTPException(
                        status_code=400,
                        detail="At least one component or nomenclature name must be provided"
                    )
                names = name
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid 'name' format. Got: {type(name).__name__}"
                )

            # Step 1: Get all components with correct parents verified from DB
            components_info = await RCMService._get_all_component_ids_with_ships(names, rcm_filter)
            logger.info(f"Found {len(components_info)} components after processing")

            if not components_info:
                raise HTTPException(
                    status_code=404,
                    detail="No components found for the given names with specified filters"
                )

            # Step 2: Fetch RCM records
            component_ids = [str(comp["component_id"]) for comp in components_info]
            rcm_records_map = await RCMService._batch_fetch_rcm_records(component_ids)

            # Step 3: Build results
            results = []
            for comp_info in components_info:
                comp_id = str(comp_info["component_id"])

                if comp_id in rcm_records_map:
                    rcm_record = rcm_records_map[comp_id].copy()
                    # Use parent verified from DB in _get_assembly_component_ids
                    rcm_record["parent_nomenclature"] = comp_info.get("parent_nomenclature")
                    results.append(rcm_record)
                else:
                    results.append({
                        "component_id": comp_id,
                        "nomenclature": comp_info["nomenclature"],
                        "ship_id": comp_info["ship_id"],
                        "component_name": comp_info["component_name"],
                        "parent_nomenclature": comp_info.get("parent_nomenclature"),
                        "error": "No RCM record found for this component"
                    })

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