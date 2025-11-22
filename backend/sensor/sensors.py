import asyncio
from datetime import datetime
import re
from typing import List, Dict, Any, Union, Optional, Tuple
from fastapi import HTTPException
from dateutil import parser
from api.db.dependencies import (
    get_sensor_reading_repository,
    get_sensor_repository,
    get_system_config_repository
)
from utils.nltk.sensors import extract_sensors_from_message


class Sensor:
    @staticmethod
    async def _parse_time_query(time_query: str) -> Dict[str, Any]:
        """
        Parse natural language time queries into function parameters.
        Returns a dict with parameters for get_readings_time_based()
        
        ✅ NEW: Returns default (last 7 days) if parsing fails
        """
        if not time_query:
            return {'last_days': 7}
        
        query = time_query.lower().strip()
        params = {}
        
        # Relative time patterns
        if match := re.search(r'last\s+(\d+)\s+hours?', query):
            params['last_hours'] = int(match.group(1))
        elif match := re.search(r'past\s+(\d+)\s+hours?', query):
            params['last_hours'] = int(match.group(1))
        elif match := re.search(r'(\d+)\s+hours?\s+ago', query):
            params['last_hours'] = int(match.group(1))
        
        elif match := re.search(r'last\s+(\d+)\s+days?', query):
            params['last_days'] = int(match.group(1))
        elif match := re.search(r'past\s+(\d+)\s+days?', query):
            params['last_days'] = int(match.group(1))
        elif match := re.search(r'(\d+)\s+days?\s+ago', query):
            params['last_days'] = int(match.group(1))
        
        elif match := re.search(r'last\s+(\d+)\s+weeks?', query):
            params['last_weeks'] = int(match.group(1))
        elif match := re.search(r'past\s+(\d+)\s+weeks?', query):
            params['last_weeks'] = int(match.group(1))
        
        elif match := re.search(r'last\s+(\d+)\s+months?', query):
            params['last_months'] = int(match.group(1))
        elif match := re.search(r'past\s+(\d+)\s+months?', query):
            params['last_months'] = int(match.group(1))
        
        # Special relative periods
        elif 'last week' in query or 'past week' in query:
            params['last_days'] = 7
        elif 'last month' in query or 'past month' in query:
            params['last_months'] = 1
        elif 'last year' in query or 'past year' in query:
            params['last_months'] = 12
        
        # Today/Yesterday
        elif query in ['today', "today's", 'today data', 'todays data']:
            params['today'] = True
        elif query in ['yesterday', "yesterday's", 'yesterday data', 'yesterdays data']:
            params['yesterday'] = True
        
        # Month patterns
        elif match := re.search(r'(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d{4})', query):
            params['month_name'] = match.group(1)
            params['year'] = int(match.group(2))
        elif match := re.search(r'(\d{4})\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)', query):
            params['year'] = int(match.group(1))
            params['month_name'] = match.group(2)
        elif match := re.search(r'(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)', query):
            params['month_name'] = match.group(1)
        
        # Year patterns
        elif match := re.search(r'^\s*(\d{4})\s*$', query):
            params['year'] = int(match.group(1))
        elif match := re.search(r'year\s+(\d{4})', query):
            params['year'] = int(match.group(1))
        
        # Week patterns
        elif match := re.search(r'week\s+(\d+)(?:\s+of\s+(\d{4}))?', query):
            params['week_number'] = int(match.group(1))
            if match.group(2):
                params['year'] = int(match.group(2))
        
        # This week/month/year
        elif 'this week' in query:
            params['last_days'] = 7
        elif 'this month' in query:
            now = datetime.now()
            params['year'] = now.year
            params['month'] = now.month
        elif 'this year' in query:
            params['year'] = datetime.now().year
        
        # Date range patterns
        elif match := re.search(r'(\d{4}-\d{2}-\d{2})(?:\s+to\s+|\s*-\s*)(\d{4}-\d{2}-\d{2})', query):
            try:
                params['start_date'] = parser.parse(match.group(1))
                params['end_date'] = parser.parse(match.group(2))
            except:
                pass
        
        # Common shortcuts
        elif query in ['recent', 'recently', 'latest']:
            params['last_hours'] = 24
        elif query in ['overnight', 'last night']:
            params['last_hours'] = 12
        elif query in ['this morning']:
            now = datetime.now()
            params['start_date'] = now.replace(hour=6, minute=0, second=0, microsecond=0)
            params['end_date'] = now.replace(hour=12, minute=0, second=0, microsecond=0)
        
        # ✅ If nothing matched, return default
        if not params:
            params = {'last_days': 7}
        
        return params

    @staticmethod
    async def _resolve_names_to_nomenclatures(
        names: List[str],
        ships: Optional[List[str]] = None
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        🚀 NEW: Resolve all names (components/nomenclatures) to actual nomenclatures in ONE batch.
        
        This prevents duplicate queries for:
        - is_component() checks
        - get_nomenclatures_wrt_component_name() calls
        - get_component_id_and_ship_name_by_nomenclature() calls
        
        Returns:
            (nomenclature_list, errors)
            
            nomenclature_list: [
                {
                    "original_name": "GT1",
                    "nomenclature": "GT1",
                    "component_id": uuid,
                    "ship": "INS One"
                },
                ...
            ]
        """
        sys_repo = get_system_config_repository()
        errors = []
        nomenclature_data = []
        
        # ✅ Batch check: which names are components vs nomenclatures
        component_checks = await asyncio.gather(
            *[sys_repo.is_component(name) for name in names],
            return_exceptions=True
        )
        
        # Separate components from nomenclatures
        component_names = []
        nomenclature_names = []
        
        for name, is_comp in zip(names, component_checks):
            if isinstance(is_comp, Exception):
                errors.append({
                    "name": name,
                    "type": "validation_error",
                    "message": f"Failed to validate name: {str(is_comp)}",
                    "severity": "error"
                })
            elif is_comp:
                component_names.append(name)
            else:
                nomenclature_names.append(name)
        
        # ✅ Batch fetch: Get all nomenclatures for components
        if component_names:
            component_nomenclatures_tasks = [
                sys_repo.get_nomenclatures_wrt_component_name_wrt_ships(comp, ships=ships)
                for comp in component_names
            ]
            component_results = await asyncio.gather(
                *component_nomenclatures_tasks,
                return_exceptions=True
            )
            
            for comp_name, result in zip(component_names, component_results):
                if isinstance(result, Exception):
                    errors.append({
                        "name": comp_name,
                        "type": "fetch_error",
                        "message": f"Failed to fetch nomenclatures: {str(result)}",
                        "severity": "error"
                    })
                elif not result:
                    errors.append({
                        "name": comp_name,
                        "type": "no_data",
                        "message": f"No nomenclatures found for component '{comp_name}'",
                        "severity": "warning"
                    })
                else:
                    for nom_data in result:
                        nomenclature_data.append({
                            "original_name": comp_name,
                            "nomenclature": nom_data["nomenclature"],
                            "component_id": nom_data["id"],
                            "ship": nom_data.get("ship", "Unknown")
                        })
        
        # ✅ Batch fetch: Get component IDs for nomenclatures
        if nomenclature_names:
            nomenclature_tasks = [
                sys_repo.get_component_id_and_ship_name_by_nomenclature(nom)
                for nom in nomenclature_names
            ]
            nomenclature_results = await asyncio.gather(
                *nomenclature_tasks,
                return_exceptions=True
            )
            
            for nom_name, result in zip(nomenclature_names, nomenclature_results):
                if isinstance(result, Exception):
                    errors.append({
                        "name": nom_name,
                        "type": "fetch_error",
                        "message": f"Failed to fetch component data: {str(result)}",
                        "severity": "error"
                    })
                elif not result:
                    errors.append({
                        "name": nom_name,
                        "type": "not_found",
                        "message": f"No component found for nomenclature: {nom_name}",
                        "severity": "error"
                    })
                else:
                    # Filter by ships if specified
                    filtered_results = result
                    if ships:
                        filtered_results = [(cid, ship) for cid, ship in result if ship in ships]
                    
                    if not filtered_results:
                        errors.append({
                            "name": nom_name,
                            "type": "filtered_out",
                            "message": f"Nomenclature '{nom_name}' not found on ships: {ships}",
                            "severity": "warning"
                        })
                    else:
                        for comp_id, ship in filtered_results:
                            nomenclature_data.append({
                                "original_name": nom_name,
                                "nomenclature": nom_name,
                                "component_id": comp_id,
                                "ship": ship
                            })
        
        return nomenclature_data, errors

    @staticmethod
    async def _fetch_sensor_readings_batch(
        nomenclature_data: List[Dict[str, Any]],
        sensors: List[str],
        time_params: Dict[str, Any]
    ) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:
        """
        🚀 NEW: Fetch sensor readings for ALL nomenclatures in parallel.
        
        This is more efficient than processing each nomenclature sequentially.
        
        Returns:
            (ship_grouped_data, errors)
        """
        metadata_repo = get_sensor_repository()
        reading_repo = get_sensor_reading_repository()
        errors = []
        
        async def fetch_for_single_nomenclature(nom_info: Dict[str, Any]) -> Dict[str, Any]:
            """Fetch data for one nomenclature."""
            nomenclature = nom_info["nomenclature"]
            component_id = nom_info["component_id"]
            ship = nom_info["ship"]
            
            try:
                sensor_data = {}
                
                for sensor_name in sensors:
                    try:
                        # Get sensor ID
                        sensor_id = await metadata_repo.get_sensorid_by_name(
                            component_id=component_id,
                            sensor_name=sensor_name
                        )
                        
                        if not sensor_id:
                            errors.append({
                                "nomenclature": nomenclature,
                                "ship": ship,
                                "sensor": sensor_name,
                                "type": "sensor_not_found",
                                "message": f"Sensor '{sensor_name}' not found on {nomenclature}",
                                "severity": "warning"
                            })
                            continue
                        
                        # Get min/max values
                        sensor_minmax = await metadata_repo.get_sensor_minmax_by_id(
                            sensor_id=sensor_id
                        )
                        
                        if sensor_minmax is None:
                            errors.append({
                                "nomenclature": nomenclature,
                                "ship": ship,
                                "sensor": sensor_name,
                                "type": "minmax_not_found",
                                "message": f"Min/max values not found for sensor '{sensor_name}'",
                                "severity": "warning"
                            })
                            continue
                        
                        min_val, max_val, unit = sensor_minmax
                        
                        # Get readings
                        readings = await reading_repo.get_readings_time_based(
                            sensor_id=sensor_id,
                            component_id=component_id,
                            **time_params
                        )
                        
                        # Validate readings format
                        if readings is None:
                            readings = []
                        elif not isinstance(readings, list):
                            raise ValueError(f"Expected list of readings, got {type(readings)}")
                        
                        sensor_data[sensor_name] = {
                            "sensor_id": str(sensor_id),
                            "readings": readings,
                            "min_value": min_val,
                            "max_value": max_val,
                            "unit": unit
                        }
                    
                    except Exception as e:
                        errors.append({
                            "nomenclature": nomenclature,
                            "ship": ship,
                            "sensor": sensor_name,
                            "type": "sensor_fetch_error",
                            "message": str(e),
                            "severity": "error"
                        })
                
                return {
                    "ship": ship,
                    "nomenclature": nomenclature,
                    "data": {
                        "nomenclature": nomenclature,
                        "component_id": str(component_id),
                        "ship": ship,
                        "sensors": sensor_data
                    }
                }
            
            except Exception as e:
                errors.append({
                    "nomenclature": nomenclature,
                    "ship": ship,
                    "type": "nomenclature_fetch_error",
                    "message": str(e),
                    "severity": "error"
                })
                return None
        
        # ✅ Process ALL nomenclatures in parallel
        results = await asyncio.gather(
            *[fetch_for_single_nomenclature(nom) for nom in nomenclature_data],
            return_exceptions=True
        )
        
        # ✅ Group by ship
        ship_grouped = {}
        for result in results:
            if isinstance(result, Exception):
                errors.append({
                    "type": "unexpected_error",
                    "message": str(result),
                    "severity": "error"
                })
                continue
            
            if result is None:
                continue
            
            ship = result["ship"]
            nomenclature = result["nomenclature"]
            data = result["data"]
            
            if ship not in ship_grouped:
                ship_grouped[ship] = {}
            
            ship_grouped[ship][nomenclature] = data
        
        return ship_grouped, errors

    @staticmethod
    async def sensor_readings(
        time_query: str,
        name: Union[str, List[str]],
        ships: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        🚀 OPTIMIZED: Main orchestrator for sensor reading retrieval.
        
        Key Optimizations:
        1. Extract sensors ONCE from query (not per nomenclature)
        2. Fetch metadata ONCE (sensor dictionaries)
        3. Batch all component/nomenclature lookups
        4. Parallel processing of all nomenclatures
        5. No duplicate queries
        
        Args:
            time_query: Natural language time query (e.g., "Show S2 and S3 for last 20 days")
                       Must include sensor names!
            name: Component name(s) or Nomenclature name(s)
                  Examples: 'GasTurbine', ['GT1', 'GT2'], 'GT1'
            ships: Optional list of ship names to filter by
                   Examples: ['INS One'], ['INS One', 'INS Two']
                
        Returns:
            {
                "status": "success" | "partial_success" | "error",
                "data": {
                    "INS One": {
                        "GT1": {
                            "nomenclature": "GT1",
                            "component_id": "uuid",
                            "ship": "INS One",
                            "sensors": {
                                "S2": {
                                    "sensor_id": "uuid",
                                    "readings": [...],
                                    "min_value": 0,
                                    "max_value": 100
                                }
                            }
                        }
                    }
                },
                "metadata": {
                    "requested": ["GT1", "GT2"],
                    "successful": ["GT1", "GT2"],
                    "failed": [],
                    "ships_requested": ["INS One"],
                    "ships_returned": ["INS One"]
                },
                "errors": []
            }
        """
        metadata_repo = get_sensor_repository()
        
        # Convert string to list if needed
        if isinstance(name, str):
            try:
                import ast
                name = ast.literal_eval(name)
            except:
                name = [name]
        
        # ✅ Deduplicate names (preserve order)
        if isinstance(name, list):
            name = list(dict.fromkeys(name))
        
        # ✅ Normalize ship names
        original_ships = ships
        if ships:
            ships = [s.strip() for s in ships]
        
        # ✅ Parse time query ONCE
        time_params = await Sensor._parse_time_query(time_query)
        
        # ✅ Fetch sensor dictionary ONCE (for NLP extraction)
        # Note: We fetch both component and nomenclature dictionaries
        # because we don't know yet which names are components vs nomenclatures
        sensor_dict_component = await metadata_repo.get_sensors_grouped_by_component()
        sensor_dict_nomenclature = await metadata_repo.get_sensors_grouped_by_nomenclature()
        
        # Merge both dictionaries for sensor extraction
        combined_sensor_dict = {**sensor_dict_component, **sensor_dict_nomenclature}
        
        # ✅ Extract sensors ONCE from query
        sensors = extract_sensors_from_message(time_query, combined_sensor_dict)
        
        # ✅ Require explicit sensors (Option B)
        if not sensors:
            raise HTTPException(
                status_code=400,
                detail=f"No sensors specified in query. Please mention specific sensors (e.g., 'Show S2 and S3 for last 7 days')"
            )
        
        # ✅ Resolve all names to nomenclatures in ONE batch
        nomenclature_data, resolution_errors = await Sensor._resolve_names_to_nomenclatures(
            names=name,
            ships=ships
        )
        
        if not nomenclature_data:
            # Total failure - no valid nomenclatures found
            raise HTTPException(
                status_code=404,
                detail={
                    "message": "No valid nomenclatures found",
                    "errors": resolution_errors
                }
            )
        
        # ✅ Fetch sensor readings for ALL nomenclatures in parallel
        ship_grouped_data, fetch_errors = await Sensor._fetch_sensor_readings_batch(
            nomenclature_data=nomenclature_data,
            sensors=sensors,
            time_params=time_params
        )
        
        # ✅ Combine all errors
        all_errors = resolution_errors + fetch_errors
        
        # ✅ Build metadata
        successful_names = list(set(
            nom["original_name"] 
            for nom in nomenclature_data
        ))
        
        failed_names = [err["name"] for err in resolution_errors if "name" in err]
        ships_returned = list(ship_grouped_data.keys())
        
        # ✅ Determine status
        status = "success"
        if all_errors and not ship_grouped_data:
            status = "error"
        elif all_errors:
            status = "partial_success"
        
        # ✅ Build response
        response = {
            "status": status,
            "data": ship_grouped_data,
            "metadata": {
                "requested": name,
                "successful": successful_names,
                "failed": failed_names,
                "ships_requested": original_ships or "all",
                "ships_returned": ships_returned,
                "time_query": time_query,
                "time_params": time_params,
                "sensors_extracted": sensors
            }
        }
        
        if all_errors:
            response["errors"] = all_errors
        
        # ✅ If total failure, raise HTTP exception
        if status == "error":
            raise HTTPException(
                status_code=404,
                detail={
                    "message": "Failed to retrieve sensor readings",
                    "errors": all_errors
                }
            )
        
        return response