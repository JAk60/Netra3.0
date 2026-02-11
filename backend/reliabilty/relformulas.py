import asyncio
from decimal import Decimal, getcontext
import math
import uuid
import numpy as np
from fastapi import HTTPException
from typing import List, Dict, Any, Optional, Tuple, Union
import logging

from sqlmodel import SQLModel
from backend.api.db.dependencies import get_monthly_utilization_repository, get_overhaul_metadata_repo, get_overhaul_readings_repo, get_system_config_repository
from api.db.repos.reliability.alpha_beta import AlphaBetaRepository
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository

logger = logging.getLogger(__name__)
class AlphaBetaUpdate(SQLModel):
    alpha: Optional[float] = None
    beta: Optional[float] = None
    component_id: Optional[uuid.UUID] = None
class ReliabilityFilter:
    """Filter configuration for reliability calculations."""
    def __init__(self, ships: List[str] = None, explain: bool = False, **kwargs):
        self.ships = ships or []
        self.explain = explain
        # Allow for future filter extensions
        self.additional_filters = kwargs
    
    def should_include_ship(self, ship_name: str) -> bool:
        """Check if a ship should be included based on filter criteria."""
        if not self.ships:  # Empty list means include all ships
            return True
        return ship_name in self.ships

class Reliability:
    @staticmethod
    async def estimate_alpha_beta(
        overhaul_readings: List[Dict],
        overhaul_metadata: Dict,
        component_id: uuid.UUID
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Estimate Alpha and Beta using Weibull MLE from overhaul readings.

        - Recognizes EXACT maintenance_type strings: "Corrective Maintenance" and "Overhaul"
        (case-insensitive, trimmed).
        - Produces a list of failure datasets (cycles). If total_overhaul_events <= 1,
        merges into a single dataset (all failures).
        - Filters-out empty cycles and duplicates.
        - If no valid failures found, returns (None, None) and does NOT call MLE or update DB.

        Returns:
            (alpha, beta) as floats if computed, otherwise (None, None).
        """
        try:
            alphabeta_repo = AlphaBetaRepository()

            # Defensive: ensure lists / metadata exist
            if not isinstance(overhaul_readings, list):
                logger.warning("overhaul_readings is not a list; treating as empty")
                overhaul_readings = []

            # Sort readings by cmms_running_age (safe default 0)
            sorted_readings = sorted(
                overhaul_readings,
                key=lambda x: x.get("cmms_running_age", 0) or 0
            )

            failure_times: List[List[float]] = []
            current_cycle_failures: List[float] = []
            overhaul_count = int(overhaul_metadata.get("total_overhaul_events") or 0)

            for reading in sorted_readings:
                raw_mt = reading.get("maintenance_type", "")
                maint_type = (raw_mt or "").strip().lower()

                # safely coerce running_age; if missing or not numeric, skip that reading
                try:
                    running_age = float(reading.get("running_age", 0) or 0)
                except (TypeError, ValueError):
                    logger.debug("Skipping reading with invalid running_age: %r", reading)
                    continue

                # Match exact strings (case-insensitive)
                if maint_type == "corrective maintenance":
                    # Only consider positive running ages
                    if running_age > 0:
                        current_cycle_failures.append(running_age)
                    else:
                        logger.debug("Ignoring non-positive running_age: %s", running_age)

                elif maint_type == "overhaul":
                    # Close cycle only if it has failures
                    if current_cycle_failures:
                        failure_times.append(current_cycle_failures)

                    # Reset cycle accumulator
                    current_cycle_failures = []

                else:
                    # Unknown maintenance_type — ignore but log at debug level
                    logger.debug("Unknown maintenance_type ignored: %r", raw_mt)

            # Add residual cycle if any
            if current_cycle_failures:
                failure_times.append(current_cycle_failures)

            logger.debug("Raw extracted failure_times (pre-merge/filter): %s", failure_times)

            # If only 0 or 1 overhaul event, merge all cycles into one dataset
            if overhaul_count <= 1:
                merged: List[float] = []
                for cycle in failure_times:
                    merged.extend(cycle)
                failure_times = [merged] if merged else []

            # Remove empty cycles and remove duplicates inside each cycle
            cleaned_failure_times: List[List[float]] = []
            for cycle in failure_times:
                # remove falsy values and duplicates; sort ascending
                cleaned = sorted(set([float(x) for x in cycle if x and float(x) > 0]))
                if cleaned:
                    cleaned_failure_times.append(cleaned)

            failure_times = cleaned_failure_times

            logger.info("Final cleaned failure_times for component %s: %s", component_id, failure_times)

            # If no valid failures -> nothing to compute
            if not failure_times:
                logger.info(
                    "No valid failure times available for component %s. Skipping Weibull MLE.",
                    component_id,
                )
                # Do NOT update alphabeta in DB; return None to indicate no result
                return None, None

            # At this point failure_times is a list of one or more non-empty lists of floats
            # Call the MLE routine (assumed to accept list-of-cycles)
            alpha, beta = Reliability._calculate_mle_parameters(failure_times)

            # Defensive checks on output
            alpha = float(alpha)
            beta = float(beta)
            logger.info("Calculated alpha=%s, beta=%s for component %s", alpha, beta, component_id)

            # Update DB with computed values
            update_data = AlphaBetaUpdate(alpha=alpha, beta=beta)
            await alphabeta_repo.upsert_alphabeta_by_component_id(component_id, update_data)
            logger.debug("Updated AlphaBeta for component %s", component_id)

            return alpha, beta

        except Exception as exc:
            # Log full exception and re-raise so caller can capture it in pipeline if needed
            logger.exception("Failed to estimate alpha/beta for %s: %s", component_id, exc)
            raise
    
    @staticmethod
    def _calculate_mle_parameters(
        failure_times: List[List[float]]
    ) -> Tuple[Decimal, Decimal]:
        """
        Calculate alpha and beta using Maximum Likelihood Estimation
        
        Args:
            failure_times: List of lists containing failure times for each cycle
        
        Returns:
            Tuple[Decimal, Decimal]: (ALPHA, BETA)
        """
        getcontext().prec = 28  # Set precision for Decimal calculations
        
        # Calculate T for each cycle (max failure time * 1.05)
        T = [Decimal(max(failures)) * Decimal('1.05') for failures in failure_times]
        
        # Calculate sum of ln(T/Xiq) for each cycle
        sum_ln_T_Xiq = [
            sum(Decimal(math.log(ti / Decimal(x))) for x in failures) 
            for ti, failures in zip(T, failure_times)
        ]
        
        # Total number of failures across all cycles
        total_failures = sum(Decimal(len(failures)) for failures in failure_times)
        
        # Calculate BETA (shape parameter)
        BETA = total_failures / sum(sum_ln_T_Xiq)
        
        # Calculate ALPHA (scale parameter)
        ALPHA = total_failures / sum(ti ** BETA for ti in T)
        
        return ALPHA, BETA
    
    @staticmethod
    def reliability_eta_beta(duration, eta, beta, initial_age=0):
        """
        Weibull (eta, beta) reliability formula.
        R = exp(-(((initial_age + duration)/eta) ** beta)) / exp(-((initial_age/eta) ** beta))
        """
        rel_num = np.exp(-(((initial_age + float(duration)) / eta) ** beta))
        rel_deno = np.exp(-((initial_age / eta) ** beta))
        return rel_num / rel_deno

    @staticmethod
    async def reliability_alpha_beta(duration, alpha, beta, current_age=0):
        """
        Power Law (alpha, beta) reliability formula.
        N_currentAge = alpha * (current_age ** beta)
        N_mission = alpha * ((current_age + duration) ** beta)
        N = N_mission - N_currentAge
        R = exp(-N)
        """
        N_currentAge = alpha * (current_age ** beta)
        mission_age = current_age + duration
        N_mission = alpha * (mission_age ** beta)
        N = N_mission - N_currentAge
        rel = np.exp(-N)
        return rel

    @staticmethod
    def _convert_to_native_type(value):
        """Convert numpy types to native Python types for JSON serialization."""
        if hasattr(value, '__float__'):
            value = float(value)
        if hasattr(value, 'item'):  # NumPy scalar
            value = value.item()
        return value

    @staticmethod
    async def _calculate_reliability_for_component(
        component_id: int, 
        nomenclature: str, 
        duration: float,
        ship: str = None,
        explain: bool = False
    ) -> Dict[str, Any]:
        """Calculate reliability for a single component using available data."""
        alpha_beta_repo = AlphaBetaRepository()
        eta_beta_repo = EtaBetaRepository()
        Monthlyutlization_repo=get_monthly_utilization_repository()
        
        result = {
            "component_id": component_id,
            "nomenclature": nomenclature,
            "ship": ship,
            "reliability": None,
            "method": None,
            "error": None
        }
        
        if explain:
            result["explanation"] = {
                "duration": duration,
                "data_sources_checked": [],
                "calculation_details": {}
            }
        
        if explain:
            print(f"Processing component_id: {component_id} for nomenclature: {nomenclature} on ship: {ship}")
        
        try:
            # Try AlphaBeta first
            overhaul_metadata=get_overhaul_metadata_repo()
            overhaul_readings=get_overhaul_readings_repo()
            metadata=await overhaul_metadata.get_by_component_id(component_id)
            print("**************metadata**********",metadata)
            readings=await overhaul_readings.get_by_component_id(component_id)
            print("readings",readings)
            reestimate=await Reliability.estimate_alpha_beta(readings,metadata,component_id=component_id)
            print("*"*100)
            print("reestimate",reestimate)
            alpha_beta_records = await alpha_beta_repo.get_alphabeta_by_component_id(component_id)
            if explain:
                result["explanation"]["data_sources_checked"].append("AlphaBeta")
                print(f"AlphaBeta records for {component_id}: {alpha_beta_records}")
            
            if alpha_beta_records:
                record = alpha_beta_records[0]
                alpha = record.alpha
                beta = record.beta
                age = await Monthlyutlization_repo.get_age_since_last_overhaul(component_id)
                print(age,"age")
                reliability = await Reliability.reliability_alpha_beta(duration, alpha, beta, current_age=age)
                
                result.update({
                    "reliability": Reliability._convert_to_native_type(reliability),
                    "method": "alpha_beta"
                })
                
                if explain:
                    result["explanation"]["calculation_details"] = {
                        "method": "Power Law (Alpha-Beta)",
                        "parameters": {"alpha": alpha, "beta": beta, "current_age": age},
                        "formula": "R = exp(-N) where N = alpha * ((current_age + duration)^beta - current_age^beta)"
                    }
                    print(f"Successfully calculated AlphaBeta reliability for {component_id}: {reliability}")
                
                return result

            # Try EtaBeta if AlphaBeta not found
            eta_beta_records = await eta_beta_repo.get_by_component_id(component_id)
            if explain:
                result["explanation"]["data_sources_checked"].append("EtaBeta")
                print(f"EtaBeta records for {component_id}: {eta_beta_records}")
            
            if eta_beta_records:
                record = eta_beta_records[0]
                eta = record.eta
                beta = record.beta
                reliability = Reliability.reliability_eta_beta(duration, eta, beta, initial_age=0)
                
                result.update({
                    "reliability": Reliability._convert_to_native_type(reliability),
                    "method": "eta_beta"
                })
                
                if explain:
                    result["explanation"]["calculation_details"] = {
                        "method": "Weibull (Eta-Beta)",
                        "parameters": {"eta": eta, "beta": beta, "initial_age": 0},
                        "formula": "R = exp(-(((initial_age + duration)/eta)^beta)) / exp(-((initial_age/eta)^beta))"
                    }
                    print(f"Successfully calculated EtaBeta reliability for {component_id}: {reliability}")
                
                return result
                
            # No records found
            error_msg = f"No AlphaBeta or EtaBeta record found for component {component_id}"
            result["error"] = error_msg
            
            if explain:
                result["explanation"]["error_details"] = "No reliability parameters found in either AlphaBeta or EtaBeta tables"
                print(f"No records found for component_id: {component_id}")
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            result["error"] = error_msg
            
            if explain:
                result["explanation"]["error_details"] = f"Exception during calculation: {error_msg}"
                print(f"Exception occurred for component_id {component_id}: {error_msg}")
            
            return result

    @staticmethod
    async def _handle_component_calculation(
        name: str, 
        duration: float, 
        filter_config: ReliabilityFilter
    ) -> List[Dict[str, Any]]:
        """Handle reliability calculation for multiple nomenclatures under a component."""
        sys_repo = get_system_config_repository()
        nomenclatures = await sys_repo.get_nomenclatures_wrt_component_name(name)
        
        if filter_config.explain:
            print("nomenclatures--->>", nomenclatures)
        
        reliability_results = []
        for nomenclature_data in nomenclatures:
            component_id = nomenclature_data["id"]
            nomenclature = nomenclature_data["nomenclature"]
            ship = nomenclature_data.get("ship", "Unknown")  # Assuming ship info is in nomenclature_data
            
            # Apply ship filter
            # if not filter_config.should_include_ship(ship):
            #     if filter_config.explain:
            #         print(f"Skipping component {component_id} on ship {ship} due to filter")
            #     continue
            
            result = await Reliability._calculate_reliability_for_component(
                component_id, nomenclature, duration, ship, filter_config.explain
            )
            reliability_results.append(result)
        
        return reliability_results

    @staticmethod
    async def _handle_nomenclature_calculation(
        name: str, 
        duration: float, 
        filter_config: ReliabilityFilter
    ) -> List[Dict[str, Any]]:
        """Handle reliability calculation for a single nomenclature (which may have multiple component IDs)."""
        sys_repo = get_system_config_repository()
        bk=await sys_repo.get_user_selection_data()
        print("bk",bk)
        component_data = await sys_repo.get_component_id_and_ship_name_by_nomenclature(name)
        
        if filter_config.explain:
            print("component_data--->>", component_data)
        
        if not component_data:
            raise HTTPException(
                status_code=404,
                detail=f"No component data found for nomenclature: {name}"
            )
        
        reliability_results = []
        filtered_count = 0
        
        for component_id, ship_name in component_data:
            # Apply ship filter
            if not filter_config.should_include_ship(ship_name):
                filtered_count += 1
                if filter_config.explain:
                    print(f"Skipping component {component_id} on ship {ship_name} due to filter")
                continue
            
            if filter_config.explain:
                print(f"Processing component_id: {component_id}, ship: {ship_name}")
            
            result = await Reliability._calculate_reliability_for_component(
                component_id, name, duration, ship_name, filter_config.explain
            )
            
            if filter_config.explain:
                print(f"Result for {component_id}: {result}")
            
            reliability_results.append(result)
        
        if filter_config.explain:
            print(f"Final reliability_results: {len(reliability_results)} items")
            print(f"Filtered out: {filtered_count} items")
        
        # If no results after filtering, provide informative message
        if not reliability_results and filtered_count > 0:
            raise HTTPException(
                status_code=404,
                detail=f"No components found for nomenclature '{name}' on the specified ships: {filter_config.ships}"
            )
        elif not reliability_results:
            raise HTTPException(
                status_code=404,
                detail=f"No component data found for nomenclature: {name}"
            )
        
        return reliability_results
    
    @staticmethod
    async def reliability(duration: float, name: Union[str, List[str]], filter_config: Dict[str, Any] = None):
        """
        Main reliability calculation method with filtering support.
        
        Args:
            duration: Mission duration
            name: Component name/nomenclature (str) or list of component names/nomenclatures (List[str])
            filter_config: Dictionary containing filter parameters
                - ships: List[str] - Filter by specific ships
                - explain: bool - Include detailed explanations
                - Additional filter parameters can be added
            
        Returns:
            List of reliability results with optional filtering applied
        """
        print("//////////////",name)
        # Create filter configuration
        if filter_config is None:
            filter_config = {}
        
        reliability_filter = ReliabilityFilter(**filter_config)
        print("from rel formulas", filter_config)
        sys_repo = get_system_config_repository()
        
        # Handle both single string and list of strings
        if isinstance(name, str):
            names = [name]
        else:
            names = name
        
        # Process names concurrently for better performance
        async def process_single_name(single_name: str):
            is_component = await sys_repo.is_component(single_name)
            print(is_component,"is_component",single_name)
            if is_component:
                return await Reliability._handle_component_calculation(single_name, duration, reliability_filter)
            else:
                return await Reliability._handle_nomenclature_calculation(single_name, duration, reliability_filter)
        
        # Execute all calculations concurrently
        results = await asyncio.gather(*[process_single_name(single_name) for single_name in names])
        
        # Flatten results
        all_results = []
        for result in results:
            if isinstance(result, list):
                all_results.extend(result)
            else:
                all_results.append(result)
        
        return all_results