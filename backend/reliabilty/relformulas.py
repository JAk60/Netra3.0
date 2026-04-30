"""
reliability/relformulas.py
---------------------------
Pure reliability math. No NLP. No catalog lookups. No filter logic.

All entity resolution is handled upstream by nlpLayer.entity_linker.
This module receives pre-validated ResolvedPair objects and runs Weibull math.

Component  (is_assembly=False) → Power Law  (alpha/beta)
Assembly   (is_assembly=True)  → Weibull    (eta/beta)
"""

import asyncio
import logging
import uuid
import numpy as np
from decimal import Decimal, getcontext
import math
from typing import Any, Dict, List, Optional, Tuple

from api.models.nlp.nlplayer import ResolvedPair
from api.db.repos.reliability.alpha_beta import AlphaBetaRepository, AlphaBetaUpdate
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository

logger = logging.getLogger(__name__)


class Reliability:

    def __init__(
        self,
        alpha_beta_repo: AlphaBetaRepository,
        eta_beta_repo: EtaBetaRepository,
        utilization_repo,
        overhaul_metadata_repo,
        overhaul_readings_repo,
    ):
        """
        Args:
            alpha_beta_repo:        Repo for component Power Law parameters.
            eta_beta_repo:          Repo for assembly Weibull parameters.
            utilization_repo:       Repo exposing get_current_age(component_id) -> float.
            overhaul_metadata_repo: Repo exposing get_by_component_id(component_id).
            overhaul_readings_repo: Repo exposing get_by_component_id(component_id).
        """
        self._alpha_beta_repo        = alpha_beta_repo
        self._eta_beta_repo          = eta_beta_repo
        self._utilization_repo       = utilization_repo
        self._overhaul_metadata_repo = overhaul_metadata_repo
        self._overhaul_readings_repo = overhaul_readings_repo

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    async def reliability(
        self,
        duration: float,
        pairs: List[ResolvedPair],
        explain: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        Calculate reliability for a list of pre-resolved component/assembly pairs.

        Args:
            duration: Mission duration in hours (from TemporalRange.duration_hours).
            pairs:    Resolved pairs from entity_linker — IDs are real DB values,
                      is_assembly flag already set.
            explain:  If True, include explanation block in each result (matches
                      old code's explain flag behaviour).

        Returns:
            List of result dicts, one per pair.
        """
        logger.info("[Reliability] %d pairs, duration=%.1fh", len(pairs), duration)

        tasks   = [self._calculate_reliability_for_component(pair, duration, explain) for pair in pairs]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        output = []
        for pair, result in zip(pairs, results):
            if isinstance(result, Exception):
                logger.error(
                    "[Reliability] Error for %s on %s: %s",
                    pair.nomenclature, pair.ship_name, result,
                )
                output.append({
                    "component_id": pair.component_id,
                    "nomenclature": pair.nomenclature,
                    "ship":         pair.ship_name,
                    "reliability":  None,
                    "method":       None,
                    "error":        str(result),
                })
            else:
                output.append(result)

        return output

    # ------------------------------------------------------------------
    # Per-pair dispatch
    # ------------------------------------------------------------------

    async def _calculate_reliability_for_component(
        self,
        pair: ResolvedPair,
        duration: float,
        explain: bool = False,
    ) -> Dict[str, Any]:

        result = {
            "component_id": pair.component_id,
            "nomenclature": pair.nomenclature,
            "ship":         pair.ship_name,
            "reliability":  None,
            "method":       None,
            "error":        None,
        }

        if explain:
            result["explanation"] = {
                "duration":             duration,
                "data_sources_checked": [],
                "calculation_details":  {},
            }

        try:
            if not pair.is_assembly:
                # ── Component → Power Law (alpha/beta) ──────────────────
                # Re-estimate from live overhaul readings before lookup
                metadata = await self._overhaul_metadata_repo.get_by_component_id(pair.component_id)
                readings = await self._overhaul_readings_repo.get_by_component_id(pair.component_id)
                await self.estimate_alpha_beta(readings, metadata, component_id=pair.component_id)

                records = await self._alpha_beta_repo.get_alphabeta_by_component_id(pair.component_id)

                if explain:
                    result["explanation"]["data_sources_checked"].append("AlphaBeta")

                if not records:
                    result["error"] = f"No alpha/beta record found for component {pair.component_id}"
                    return result

                record      = records[0]
                current_age = await self._utilization_repo.get_current_age(pair.component_id)
                reliability = await self.reliability_alpha_beta(
                    duration, record.alpha, record.beta, current_age=current_age
                )
                result.update({
                    "reliability": self._convert_to_native_type(reliability),
                    "method":      "alpha_beta",
                })
                if explain:
                    result["explanation"]["calculation_details"] = {
                        "method":     "Power Law (Alpha-Beta)",
                        "parameters": {
                            "alpha":       record.alpha,
                            "beta":        record.beta,
                            "current_age": current_age,
                        },
                        "formula": (
                            "R = exp(-N) where N = alpha * "
                            "((current_age + duration)^beta - current_age^beta)"
                        ),
                    }

            else:
                # ── Assembly → Weibull (eta/beta) ────────────────────────
                records = await self._eta_beta_repo.get_by_component_id(pair.component_id)

                if explain:
                    result["explanation"]["data_sources_checked"].append("EtaBeta")

                if not records:
                    result["error"] = f"No eta/beta record found for assembly {pair.component_id}"
                    return result

                record      = records[0]
                reliability = self.reliability_eta_beta(duration, record.eta, record.beta)
                result.update({
                    "reliability": self._convert_to_native_type(reliability),
                    "method":      "eta_beta",
                })
                if explain:
                    result["explanation"]["calculation_details"] = {
                        "method":     "Weibull (Eta-Beta)",
                        "parameters": {
                            "eta":         record.eta,
                            "beta":        record.beta,
                            "initial_age": 0,
                        },
                        "formula": (
                            "R = exp(-(((initial_age + duration)/eta)^beta)) "
                            "/ exp(-((initial_age/eta)^beta))"
                        ),
                    }

        except Exception as exc:
            logger.exception(
                "[Reliability] Failed for %s on %s: %s",
                pair.nomenclature, pair.ship_name, exc,
            )
            result["error"] = str(exc)
            if explain:
                result["explanation"]["error_details"] = f"Exception: {str(exc)}"

        return result

    # ------------------------------------------------------------------
    # Weibull formulas
    # ------------------------------------------------------------------

    @staticmethod
    def reliability_eta_beta(
        duration: float,
        eta: float,
        beta: float,
        initial_age: float = 0,
    ) -> float:
        """
        Conditional Weibull reliability for assemblies.
        R(t | initial_age) = exp(-((initial_age + t)/eta)^beta) / exp(-(initial_age/eta)^beta)
        """
        rel_num  = np.exp(-(((initial_age + duration) / eta) ** beta))
        rel_deno = np.exp(-((initial_age / eta) ** beta))
        return rel_num / rel_deno

    @staticmethod
    async def reliability_alpha_beta(
        duration: float,
        alpha: float,
        beta: float,
        current_age: float = 0,
    ) -> float:
        """
        Conditional Power Law reliability for components.
        R = exp(-(N(current_age + duration) - N(current_age)))
        where N(t) = alpha * t^beta
        """
        mission_age  = current_age + duration
        N_currentAge = alpha * (current_age ** beta)
        N_mission    = alpha * (mission_age  ** beta)
        return np.exp(-(N_mission - N_currentAge))

    # ------------------------------------------------------------------
    # Alpha/Beta estimation
    # ------------------------------------------------------------------

    @staticmethod
    async def estimate_alpha_beta(
        overhaul_readings: List[Dict],
        overhaul_metadata: Dict,
        component_id: uuid.UUID,
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Estimate Alpha and Beta using Weibull MLE from overhaul readings,
        then upsert the result into the alpha_beta table.
        """
        try:
            alphabeta_repo = AlphaBetaRepository()

            if not isinstance(overhaul_readings, list):
                logger.warning("overhaul_readings is not a list; treating as empty")
                overhaul_readings = []

            sorted_readings = sorted(
                overhaul_readings,
                key=lambda x: x.get("defect_date", "") or ""
            )
            print(sorted_readings)
            failure_times: List[List[float]]  = []
            current_cycle_failures: List[float] = []
            actual_overhaul_count = 0

            for reading in sorted_readings:
                if reading is None:
                    continue

                raw_mt     = reading.get("maintenance_type", "")
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

            if current_cycle_failures:
                failure_times.append(current_cycle_failures)

            # Clean: deduplicate, sort, drop non-positives
            cleaned_failure_times: List[List[float]] = []
            for cycle in failure_times:
                cleaned = sorted(set(float(x) for x in cycle if x and float(x) > 0))
                if cleaned:
                    cleaned_failure_times.append(cleaned)
            failure_times = cleaned_failure_times

            if not failure_times:
                logger.info(
                    "No usable failure times for component %s; skipping estimation",
                    component_id,
                )
                return None, None
            logger.info("Failure times: %s", failure_times)
            alpha, beta = Reliability._calculate_mle_parameters(failure_times)
            alpha = float(alpha)
            beta  = float(beta)

            update_data = AlphaBetaUpdate(alpha=alpha, beta=beta)
            await alphabeta_repo.upsert_alphabeta_by_component_id(component_id, update_data)

            logger.info(
                "Upserted alpha=%.6f beta=%.6f for component %s",
                alpha, beta, component_id,
            )
            return alpha, beta

        except Exception as exc:
            logger.exception("Failed to estimate alpha/beta for %s: %s", component_id, exc)
            raise

    @staticmethod
    def _calculate_mle_parameters(
        failure_times: List[List[float]],
    ) -> Tuple[Decimal, Decimal]:
        """MLE estimation of Power Law (alpha, beta) parameters."""
        getcontext().prec = 28

        # Observation window per cycle = max failure time * 1.05
        T = [Decimal(max(failures)) * Decimal('1.05') for failures in failure_times]

        sum_ln_T_Xiq = [
            sum(Decimal(math.log(float(ti) / x)) for x in failures)
            for ti, failures in zip(T, failure_times)
        ]

        total_failures = sum(Decimal(len(failures)) for failures in failure_times)
        BETA  = total_failures / sum(sum_ln_T_Xiq)
        ALPHA = total_failures / sum(ti ** BETA for ti in T)

        return ALPHA, BETA

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _convert_to_native_type(value: Any) -> Any:
        """Convert numpy scalars to native Python for JSON serialisation."""
        if hasattr(value, '__float__'):
            value = float(value)
        if hasattr(value, 'item'):
            value = value.item()
        return value