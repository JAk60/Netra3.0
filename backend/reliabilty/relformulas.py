import asyncio
import numpy as np
from fastapi import HTTPException
from typing import List, Dict, Any, Optional, Union

from backend.api.db.dependencies import get_system_config_repository
from backend.api.db.repositories import AlphaBetaRepository, EtaBetaRepository

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
    def reliability_eta_beta(duration, eta, beta, initial_age=0):
        """
        Weibull (eta, beta) reliability formula.
        R = exp(-(((initial_age + duration)/eta) ** beta)) / exp(-((initial_age/eta) ** beta))
        """
        rel_num = np.exp(-(((initial_age + float(duration)) / eta) ** beta))
        rel_deno = np.exp(-((initial_age / eta) ** beta))
        return rel_num / rel_deno

    @staticmethod
    def reliability_alpha_beta(duration, alpha, beta, current_age=0):
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
            alpha_beta_records = await alpha_beta_repo.get_by_component_id(component_id)
            if explain:
                result["explanation"]["data_sources_checked"].append("AlphaBeta")
                print(f"AlphaBeta records for {component_id}: {alpha_beta_records}")
            
            if alpha_beta_records:
                record = alpha_beta_records[0]
                alpha = record.alpha
                beta = record.beta
                age = getattr(record, "current_age", 0) or 0
                reliability = Reliability.reliability_alpha_beta(duration, alpha, beta, current_age=age)
                
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
            print(is_component,"is_component")
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