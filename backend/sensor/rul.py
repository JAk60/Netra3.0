import asyncio
from uuid import UUID
from typing import List, Dict, Any, Union, Optional, Tuple
from fastapi import HTTPException
from pydantic import BaseModel, Field
from scipy.stats import weibull_min
import math
import logging

from api.db.dependencies import (
    get_sensor_reading_repository,
    get_sensor_repository,
    get_system_config_repository
)
from utils.nltk.sensors import extract_sensors_from_message

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RULCalculationRequest(BaseModel):
    equipment_id: str = Field(..., description="Equipment/Component ID")
    sensor: str = Field(..., description="sensor name")


class EquipmentRULRequest(BaseModel):
    equipment_id: str = Field(..., description="Equipment ID for all sensors")


class RULResponse(BaseModel):
    P: float
    F: float
    confidence: List[float]
    remaining_life: List[float]
    Table: Dict[str, float]


class EquipmentRULResponse(BaseModel):
    results: Dict[str, float]


class SensorListResponse(BaseModel):
    sensors: List[str]


class RULCalculationService:
    """Handles all RUL calculation logic"""

    CONFIDENCE_LEVELS = [0.8, 0.85, 0.9, 0.95]

    @staticmethod
    def group_sequential_data(
        data: List[tuple[float, float]]
    ) -> List[List[tuple[float, float]]]:
        """
        Group data into sequential runs (monotonically increasing operating hours).

        Args:
            data: List of (operating_hours, value) tuples

        Returns:
            List of groups, where each group is a list of tuples
        """
        if not data:
            return []

        result = []
        current_group = [data[0]]

        for item in data[1:]:
            if item[0] >= current_group[-1][0]:
                current_group.append(item)
            else:
                result.append(current_group)
                current_group = [item]

        result.append(current_group)
        return result

    @staticmethod
    def find_threshold_crossing_points(
        grouped_data: List[List[tuple[float, float]]], threshold: float
    ) -> List[float]:
        """
        Find operating hours where threshold is first reached in each group.

        Args:
            grouped_data: List of sequential data groups
            threshold: Threshold value (F)

        Returns:
            List of operating hours where threshold was first crossed
        """
        crossing_points = []

        for group in grouped_data:
            for operating_hours, value in group:
                if value >= threshold:
                    crossing_points.append(operating_hours)
                    break

        return crossing_points

    @staticmethod
    def estimate_weibull_sensors(failure_times: List[float]) -> tuple[float, float]:
        """
        Estimate Weibull distribution sensors using MLE.

        Args:
            failure_times: List of failure/threshold crossing times

        Returns:
            Tuple of (beta, eta) - shape and scale sensors
        """
        if len(failure_times) == 0:
            raise ValueError("No failure times available for Weibull estimation")

        params = weibull_min.fit(failure_times, floc=0)
        beta, eta = params[0], params[2]

        return round(beta, 2), round(eta, 2)

    @staticmethod
    def calculate_rul(eta: float, beta: float, t0: float, confidence: float) -> float:
        """
        Calculate Remaining Useful Life (RUL) at given confidence level.

        Args:
            eta: Weibull scale sensor
            beta: Weibull shape sensor
            t0: Current operating hours
            confidence: Confidence level (0-1)

        Returns:
            Remaining useful life in hours
        """
        try:
            reliability = math.exp(-((t0 / eta) ** beta))
            rul = (eta * (-math.log(reliability * confidence)) ** (1 / beta)) - t0
            return max(0, rul)  # RUL cannot be negative
        except (ValueError, ZeroDivisionError) as e:
            logger.error(f"RUL calculation error: {e}")
            return 0.0

    @classmethod
    def calculate_rul_for_all_confidence_levels(
        cls,
        eta: float,
        beta: float,
        tp: float,
        t0: float,
        vc: float,
        p: float,
        f: float,
    ) -> List[float]:
        """
        Calculate RUL for all standard confidence levels with P-F curve adjustment.

        Args:
            eta: Weibull scale sensor
            beta: Weibull shape sensor
            tp: Latest value/time
            t0: Previous value/time
            vc: Latest operating hours
            p: Potential failure point (P)
            f: Functional failure point (F)

        Returns:
            List of RUL values for each confidence level
        """
        results = []

        for confidence in cls.CONFIDENCE_LEVELS:
            if vc < p:
                # Before potential failure point
                rulp = cls.calculate_rul(eta, beta, tp, confidence)
                rulc = cls.calculate_rul(eta, beta, t0, confidence)
            else:
                # After potential failure point - adjust eta
                m = abs((f - vc)) / (f - p)
                etac = eta * m
                rulp = cls.calculate_rul(etac, beta, tp, confidence)
                rulc = cls.calculate_rul(etac, beta, t0, confidence)

            # Take the minimum (more conservative estimate)
            remaining_life = min(rulc, rulp)
            results.append(round(remaining_life, 2))

        return results

    @staticmethod
    async def _resolve_names_to_nomenclatures(
        names: List[str],
        ships: Optional[List[str]] = None
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        🚀 Resolve all names (components/nomenclatures) to actual nomenclatures in ONE batch.
        
        Returns:
            (nomenclature_list, errors)
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
    async def _calculate_rul_for_single_sensor(
        nomenclature: str,
        component_id: UUID,
        ship: str,
        sensor_name: str
    ) -> Dict[str, Any]:
        """
        🚀 Calculate RUL for a single sensor on a single nomenclature.
        
        Returns:
            Dict with RUL calculation results or error information
        """
        metadata_repo = get_sensor_repository()
        reading_repo = get_sensor_reading_repository()
        
        try:
            # 1. Get sensor ID
            sensor_id = await metadata_repo.get_sensorid_by_name(
                component_id=component_id,
                sensor_name=sensor_name
            )
            
            if not sensor_id:
                return {
                    "status": "error",
                    "nomenclature": nomenclature,
                    "ship": ship,
                    "sensor": sensor_name,
                    "error": f"Sensor '{sensor_name}' not found on {nomenclature}"
                }
            
            # 2. Get P and F values
            pf_values = await metadata_repo.get_sensor_pf_by_id(sensor_id=sensor_id)
            
            if pf_values is None:
                return {
                    "status": "error",
                    "nomenclature": nomenclature,
                    "ship": ship,
                    "sensor": sensor_name,
                    "error": f"P and F values not found for sensor '{sensor_name}'"
                }
            
            p, f = pf_values
            logger.info(f"P={p}, F={f} for {sensor_name} on {nomenclature}")
            
            # 3. Fetch latest 2 readings
            latest_readings = await reading_repo.get_latest_operating_values_readings(
                sensor_id=sensor_id,
                limit=2
            )
            
            if len(latest_readings) < 2:
                return {
                    "status": "error",
                    "nomenclature": nomenclature,
                    "ship": ship,
                    "sensor": sensor_name,
                    "error": "Insufficient data: need at least 2 readings"
                }
            
            vc = latest_readings[0][0]  # Latest operating hours
            tp = latest_readings[0][1]  # Latest value
            t0 = latest_readings[1][1]  # Previous value
            print(f"Latest readings: vc={vc}, tp={tp}, t0={t0}")
            logger.info(f"Latest readings for {nomenclature}/{sensor_name} - vc={vc}, tp={tp}, t0={t0}")
            
            # 4. Fetch all historical data for Weibull analysis
            all_data = await reading_repo.get_latest_readings(
                sensor_id=sensor_id,
            )
            
            if not all_data:
                return {
                    "status": "error",
                    "nomenclature": nomenclature,
                    "ship": ship,
                    "sensor": sensor_name,
                    "error": "No historical data found"
                }
            data_tuples = [
                (reading.operating_hours, reading.value) 
                for reading in all_data
            ]

            # 5. Group data and find threshold crossing points
            grouped_data = RULCalculationService.group_sequential_data(data_tuples)
            crossing_points = RULCalculationService.find_threshold_crossing_points(
                grouped_data, f
            )
            
            if not crossing_points:
                return {
                    "status": "error",
                    "nomenclature": nomenclature,
                    "ship": ship,
                    "sensor": sensor_name,
                    "error": f"Threshold F={f} has never been reached in historical data"
                }
            
            logger.info(f"Found {len(crossing_points)} threshold crossing points for {nomenclature}/{sensor_name}")
            
            # 6. Estimate Weibull parameters
            beta, eta = RULCalculationService.estimate_weibull_sensors(crossing_points)
            logger.info(f"Weibull parameters for {nomenclature}/{sensor_name} - beta={beta}, eta={eta}")
            
            # 7. Calculate RUL for all confidence levels
            remaining_life = RULCalculationService.calculate_rul_for_all_confidence_levels(
                eta, beta, tp, t0, vc, p, f
            )
            
            # 8. Build response
            return {
                "status": "success",
                "nomenclature": nomenclature,
                "ship": ship,
                "sensor": sensor_name,
                "sensor_id": str(sensor_id),
                "data": {
                    "P": p,
                    "F": f,
                    "confidence": RULCalculationService.CONFIDENCE_LEVELS,
                    "remaining_life": remaining_life,
                    "Table": {
                        "0.8": remaining_life[0],
                        "0.85": remaining_life[1],
                        "0.9": remaining_life[2],
                        "0.95": remaining_life[3],
                    },
                    "weibull_params": {
                        "beta": beta,
                        "eta": eta
                    },
                    "latest_readings": {
                        "vc": vc,
                        "tp": tp,
                        "t0": t0
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"RUL calculation failed for {nomenclature}/{sensor_name}: {e}", exc_info=True)
            return {
                "status": "error",
                "nomenclature": nomenclature,
                "ship": ship,
                "sensor": sensor_name,
                "error": str(e)
            }

    @staticmethod
    async def _calculate_rul_batch(
        nomenclature_data: List[Dict[str, Any]],
        sensors: List[str]
    ) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:
        """
        🚀 Calculate RUL for ALL nomenclatures and sensors in parallel.
        
        Returns:
            (ship_grouped_data, errors)
        """
        errors = []
        
        # Create all tasks for parallel execution
        tasks = []
        for nom_info in nomenclature_data:
            for sensor_name in sensors:
                task = RULCalculationService._calculate_rul_for_single_sensor(
                    nomenclature=nom_info["nomenclature"],
                    component_id=nom_info["component_id"],
                    ship=nom_info["ship"],
                    sensor_name=sensor_name
                )
                tasks.append(task)
        
        # ✅ Execute ALL RUL calculations in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # ✅ Group results by ship and nomenclature
        ship_grouped = {}
        
        for result in results:
            if isinstance(result, Exception):
                errors.append({
                    "type": "unexpected_error",
                    "message": str(result),
                    "severity": "error"
                })
                continue
            
            if result["status"] == "error":
                errors.append({
                    "nomenclature": result["nomenclature"],
                    "ship": result["ship"],
                    "sensor": result["sensor"],
                    "type": "calculation_error",
                    "message": result["error"],
                    "severity": "error"
                })
                continue
            
            # Add successful result to grouped data
            ship = result["ship"]
            nomenclature = result["nomenclature"]
            sensor = result["sensor"]
            
            if ship not in ship_grouped:
                ship_grouped[ship] = {}
            
            if nomenclature not in ship_grouped[ship]:
                ship_grouped[ship][nomenclature] = {
                    "nomenclature": nomenclature,
                    "ship": ship,
                    "sensors": {}
                }
            
            ship_grouped[ship][nomenclature]["sensors"][sensor] = result["data"]
        
        return ship_grouped, errors

    @staticmethod
    async def rul(
        rul_query: str,
        name: Union[str, List[str]],
        ships: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        🚀 OPTIMIZED: Main orchestrator for RUL calculation.
        
        Key Optimizations:
        1. Extract sensors ONCE from query
        2. Batch all component/nomenclature lookups
        3. Parallel processing of ALL RUL calculations
        4. No duplicate queries
        
        Args:
            rul_query: Natural language query (e.g., "Calculate RUL for S2 and S3")
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
                            "ship": "INS One",
                            "sensors": {
                                "S2": {
                                    "P": 80,
                                    "F": 100,
                                    "confidence": [0.8, 0.85, 0.9, 0.95],
                                    "remaining_life": [150.5, 145.2, 138.7, 125.3],
                                    "Table": {...}
                                }
                            }
                        }
                    }
                },
                "metadata": {...},
                "errors": [...]
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
        
        # ✅ Fetch sensor dictionary ONCE (for NLP extraction)
        sensor_dict_component = await metadata_repo.get_sensors_grouped_by_component()
        sensor_dict_nomenclature = await metadata_repo.get_sensors_grouped_by_nomenclature()
        
        # Merge both dictionaries for sensor extraction
        combined_sensor_dict = {**sensor_dict_component, **sensor_dict_nomenclature}
        
        # ✅ Extract sensors ONCE from query
        sensors = extract_sensors_from_message(rul_query, combined_sensor_dict)
        
        # ✅ Require explicit sensors
        if not sensors:
            raise HTTPException(
                status_code=400,
                detail="No sensors specified in query. Please mention specific sensors (e.g., 'Calculate RUL for S2 and S3')"
            )
        
        # ✅ Resolve all names to nomenclatures in ONE batch
        nomenclature_data, resolution_errors = await RULCalculationService._resolve_names_to_nomenclatures(
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
        
        # ✅ Calculate RUL for ALL nomenclatures and sensors in parallel
        ship_grouped_data, calculation_errors = await RULCalculationService._calculate_rul_batch(
            nomenclature_data=nomenclature_data,
            sensors=sensors
        )
        
        # ✅ Combine all errors
        all_errors = resolution_errors + calculation_errors
        
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
                "rul_query": rul_query,
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
                    "message": "Failed to calculate RUL",
                    "errors": all_errors
                }
            )
        
        return response