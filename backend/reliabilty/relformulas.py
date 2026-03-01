import asyncio
from decimal import Decimal, getcontext
import math
import uuid
import numpy as np
from fastapi import HTTPException
from typing import List, Dict, Any, Optional, Tuple, Union
import logging
import re

from sqlmodel import SQLModel
from backend.api.db.dependencies import get_monthly_utilization_repository, get_overhaul_metadata_repo, get_overhaul_readings_repo, get_system_config_repository
from api.db.repos.reliability.alpha_beta import AlphaBetaRepository
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository

logger = logging.getLogger(__name__)


class AlphaBetaUpdate(SQLModel):
    alpha: Optional[float] = None
    beta: Optional[float] = None
    component_id: Optional[uuid.UUID] = None


def _normalise(s: str) -> str:
    """Collapse whitespace and lowercase for fuzzy ship comparison."""
    return re.sub(r'\s+', '', s.lower())


class ReliabilityFilter:
    """
    Filter configuration for reliability calculations.

    FIX #8: Added nom_ship_pairings — maps each nomenclature to its specific
    ship so that "GT 1 on INS ONE and GT 2 on INS TWO" only evaluates:
        GT 1 → INS ONE
        GT 2 → INS TWO
    instead of all (nom, ship) combos.
    """
    def __init__(
        self,
        ships: List[str] = None,
        explain: bool = False,
        nom_ship_pairings: Dict[str, str] = None,
        **kwargs
    ):
        self.ships = ships or []
        self.explain = explain
        # FIX #8: {nomenclature_name: ship_name}
        self.nom_ship_pairings = nom_ship_pairings or {}
        self.additional_filters = kwargs

    def should_include_ship(self, ship_name: str) -> bool:
        """Check if a ship should be included based on filter criteria."""
        if not self.ships:
            return True
        return ship_name in self.ships

    def should_include_nom_ship(self, nom_name: str, ship_name: str) -> bool:
        """
        FIX #8: Check if this (nom, ship) combo should be included.

        If nom_ship_pairings has an entry for this nom, only allow its
        paired ship. Otherwise fall back to the ships list filter.
        """
        if self.nom_ship_pairings:
            paired_ship = self.nom_ship_pairings.get(nom_name)
            if paired_ship:
                return _normalise(ship_name) == _normalise(paired_ship)
        # No pairing — use normal ship filter
        return self.should_include_ship(ship_name)


class Reliability:
    @staticmethod
    async def estimate_alpha_beta(
        overhaul_readings: List[Dict],
        overhaul_metadata: Dict,
        component_id: uuid.UUID
    ) -> Tuple[Optional[float], Optional[float]]:
        """Estimate Alpha and Beta using Weibull MLE from overhaul readings."""
        try:
            alphabeta_repo = AlphaBetaRepository()

            if not isinstance(overhaul_readings, list):
                logger.warning("overhaul_readings is not a list; treating as empty")
                overhaul_readings = []

            sorted_readings = sorted(
                overhaul_readings,
                key=lambda x: x.get("defect_date", "") or ""
            )

            failure_times: List[List[float]] = []
            current_cycle_failures: List[float] = []
            actual_overhaul_count = 0

            for reading in sorted_readings:
                if reading is None:
                    continue

                raw_mt = reading.get("maintenance_type", "")
                maint_type = (raw_mt or "").strip().lower()

                try:
                    running_age = float(reading.get("running_age", 0) or 0)
                except (TypeError, ValueError):
                    continue

                if maint_type == "overhaul":
                    actual_overhaul_count += 1
                    failure_times.append(current_cycle_failures)
                    current_cycle_failures = []
                elif maint_type == "corrective maintenance":
                    if running_age > 0:
                        current_cycle_failures.append(running_age)
                else:
                    logger.warning("Unknown maintenance_type ignored: raw='%s'", raw_mt)

            if len(current_cycle_failures) != 0:
                failure_times.append(current_cycle_failures)

            cleaned_failure_times: List[List[float]] = []
            for cycle in failure_times:
                cleaned = sorted(set([float(x) for x in cycle if x and float(x) > 0]))
                if cleaned:
                    cleaned_failure_times.append(cleaned)
            failure_times = cleaned_failure_times

            if not failure_times:
                return None, None

            alpha, beta = Reliability._calculate_mle_parameters(failure_times)
            alpha = float(alpha)
            beta = float(beta)

            update_data = AlphaBetaUpdate(alpha=alpha, beta=beta)
            await alphabeta_repo.upsert_alphabeta_by_component_id(component_id, update_data)

            return alpha, beta

        except Exception as exc:
            logger.exception("Failed to estimate alpha/beta for %s: %s", component_id, exc)
            raise

    @staticmethod
    def _calculate_mle_parameters(
        failure_times: List[List[float]]
    ) -> Tuple[Decimal, Decimal]:
        getcontext().prec = 28

        T = [Decimal(max(failures)) * Decimal('1.05') for failures in failure_times]

        sum_ln_T_Xiq = [
            sum(Decimal(math.log(ti / Decimal(x))) for x in failures)
            for ti, failures in zip(T, failure_times)
        ]

        total_failures = sum(Decimal(len(failures)) for failures in failure_times)
        BETA  = total_failures / sum(sum_ln_T_Xiq)
        ALPHA = total_failures / sum(ti ** BETA for ti in T)

        return ALPHA, BETA

    @staticmethod
    def reliability_eta_beta(duration, eta, beta, initial_age=0):
        rel_num   = np.exp(-(((initial_age + float(duration)) / eta) ** beta))
        rel_deno  = np.exp(-((initial_age / eta) ** beta))
        return rel_num / rel_deno

    @staticmethod
    async def reliability_alpha_beta(duration, alpha, beta, current_age=0):
        N_currentAge = alpha * (current_age ** beta)
        mission_age  = current_age + duration
        N_mission    = alpha * (mission_age ** beta)
        N            = N_mission - N_currentAge
        return np.exp(-N)

    @staticmethod
    def _convert_to_native_type(value):
        if hasattr(value, '__float__'):
            value = float(value)
        if hasattr(value, 'item'):
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
        alpha_beta_repo      = AlphaBetaRepository()
        eta_beta_repo        = EtaBetaRepository()
        Monthlyutlization_repo = get_monthly_utilization_repository()

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

        try:
            overhaul_metadata = get_overhaul_metadata_repo()
            overhaul_readings = get_overhaul_readings_repo()
            metadata  = await overhaul_metadata.get_by_component_id(component_id)
            readings  = await overhaul_readings.get_by_component_id(component_id)
            await Reliability.estimate_alpha_beta(readings, metadata, component_id=component_id)

            alpha_beta_records = await alpha_beta_repo.get_alphabeta_by_component_id(component_id)
            if explain:
                result["explanation"]["data_sources_checked"].append("AlphaBeta")

            if alpha_beta_records:
                record      = alpha_beta_records[0]
                alpha       = record.alpha
                beta        = record.beta
                age         = await Monthlyutlization_repo.get_current_age(component_id)
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
                return result

            eta_beta_records = await eta_beta_repo.get_by_component_id(component_id)
            if explain:
                result["explanation"]["data_sources_checked"].append("EtaBeta")

            if eta_beta_records:
                record      = eta_beta_records[0]
                eta         = record.eta
                beta        = record.beta
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
                return result

            result["error"] = f"No AlphaBeta or EtaBeta record found for component {component_id}"
            return result

        except Exception as e:
            result["error"] = str(e)
            if explain:
                result["explanation"]["error_details"] = f"Exception: {str(e)}"
            return result

    @staticmethod
    async def _handle_component_calculation(
        name: str,
        duration: float,
        filter_config: "ReliabilityFilter"
    ) -> List[Dict[str, Any]]:
        """Handle reliability for multiple nomenclatures under a component."""
        sys_repo     = get_system_config_repository()
        nomenclatures = await sys_repo.get_nomenclatures_wrt_component_name(name)

        reliability_results = []
        for nomenclature_data in nomenclatures:
            component_id = nomenclature_data["id"]
            nomenclature = nomenclature_data["nomenclature"]
            ship         = nomenclature_data.get("ship", "Unknown")

            # FIX #8: use should_include_nom_ship for pairing-aware filtering
            if not filter_config.should_include_nom_ship(nomenclature, ship):
                if filter_config.explain:
                    logger.info(f"Skipping {nomenclature} on {ship} due to nom-ship filter")
                continue

            result = await Reliability._calculate_reliability_for_component(
                component_id, nomenclature, duration, ship, filter_config.explain
            )
            reliability_results.append(result)

        return reliability_results

    @staticmethod
    async def _handle_nomenclature_calculation(
        name: str,
        duration: float,
        filter_config: "ReliabilityFilter"
    ) -> List[Dict[str, Any]]:
        """Handle reliability for a single nomenclature across ships."""
        sys_repo       = get_system_config_repository()
        component_data = await sys_repo.get_component_id_and_ship_name_by_nomenclature(name)

        if not component_data:
            raise HTTPException(
                status_code=404,
                detail=f"No component data found for nomenclature: {name}"
            )

        reliability_results = []
        filtered_count = 0

        for component_id, ship_name in component_data:
            # FIX #8: use should_include_nom_ship for pairing-aware filtering
            if not filter_config.should_include_nom_ship(name, ship_name):
                filtered_count += 1
                if filter_config.explain:
                    logger.info(f"Skipping {name} on {ship_name} due to nom-ship filter")
                continue

            result = await Reliability._calculate_reliability_for_component(
                component_id, name, duration, ship_name, filter_config.explain
            )
            reliability_results.append(result)

        if not reliability_results and filtered_count > 0:
            raise HTTPException(
                status_code=404,
                detail=f"No components found for nomenclature '{name}' matching the ship filter"
            )
        elif not reliability_results:
            raise HTTPException(
                status_code=404,
                detail=f"No component data found for nomenclature: {name}"
            )

        return reliability_results

    @staticmethod
    async def reliability(
        duration: float,
        name: Union[str, List[str]],
        filter_config: Dict[str, Any] = None
    ):
        """
        Main reliability calculation method with filtering support.

        FIX #8: filter_config now accepts 'nom_ship_pairings' key:
            {
                "ships": ["INS ONE", "INS TWO"],
                "explain": True,
                "nom_ship_pairings": {"GT 1": "INS ONE", "GT 2": "INS TWO"}
            }
        When nom_ship_pairings is provided, each nomenclature is only
        evaluated against its paired ship, giving exact 1:1 results.
        """
        if filter_config is None:
            filter_config = {}

        reliability_filter = ReliabilityFilter(**filter_config)
        sys_repo = get_system_config_repository()

        if isinstance(name, str):
            names = [name]
        else:
            names = name

        async def process_single_name(single_name: str):
            is_component = await sys_repo.is_component(single_name)
            if is_component:
                return await Reliability._handle_component_calculation(
                    single_name, duration, reliability_filter
                )
            else:
                return await Reliability._handle_nomenclature_calculation(
                    single_name, duration, reliability_filter
                )

        results = await asyncio.gather(
            *[process_single_name(single_name) for single_name in names]
        )

        all_results = []
        for result in results:
            if isinstance(result, list):
                all_results.extend(result)
            else:
                all_results.append(result)

        return all_results