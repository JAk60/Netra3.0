from typing import List, Dict
from uuid import UUID
from decimal import Decimal, getcontext
import math
import logging
from backend.api.db.dependencies import (
    get_alpha_beta_repository,
    get_overhaul_metadata_repo,
    get_overhaul_readings_repo,
)

logger = logging.getLogger(__name__)


class OverhaulsAlgos:
    """Overhauls Algorithm Implementation"""

    @staticmethod
    async def estimate_alpha_beta(component_id: UUID):
        """Re-estimate Alpha Beta parameters for a component"""

        overhaul_metadata_repo = get_overhaul_metadata_repo()
        overhaul_readings_repo = get_overhaul_readings_repo()
        alpha_beta_repo = get_alpha_beta_repository()

        try:
            # Fetch overhaul metadata (subData equivalent)
            metadata = await overhaul_metadata_repo.get_by_component_id(component_id)
            if not metadata:
                raise ValueError(
                    f"Overhaul metadata not found for component_id: {component_id}"
                )

            # Format metadata as subData
            subData = [
                {
                    "id": metadata["id"],
                    "component_id": metadata["component_id"],
                    "overhaulNum": metadata.get("total_overhaul_events", 0),
                    "runAge": metadata.get("overhaul_frequency_hours", 0),
                    "numMaint": metadata.get("total_overhaul_events", 0),
                }
            ]

            # Fetch overhaul readings (mainData equivalent)
            readings = await overhaul_readings_repo.get_by_component_id(component_id)
            if not readings:
                logger.warning(
                    f"No overhaul readings found for component_id: {component_id}"
                )
                # Try to get existing alpha/beta from database
                existing_alpha_beta = await alpha_beta_repo.get_by_component_id(
                    component_id
                )
                if existing_alpha_beta:
                    return {
                        "alpha": existing_alpha_beta["alpha"],
                        "beta": existing_alpha_beta["beta"],
                        "message": "Using existing alpha/beta values",
                    }
                raise ValueError(
                    f"No readings or existing alpha/beta found for component_id: {component_id}"
                )

            # Format readings as mainData and sort by cmms_running_age
            mainData = [
                {
                    "id": reading["id"],
                    "component_id": reading["component_id"],
                    "date": reading["defect_date"],
                    "maintenanceType": reading["maintenance_type"],
                    "totalRunAge": reading["cmms_running_age"],
                    "runningAge": reading["running_age"],
                }
                for reading in readings
            ]
            mainData.sort(key=lambda x: x["totalRunAge"])

            # Calculate alpha and beta
            alpha, beta = await OverhaulsAlgos.alpha_beta_calculation(
                mainData, subData, component_id
            )

            logger.info(
                f"Successfully estimated alpha={alpha}, beta={beta} for component_id: {component_id}"
            )

            return {
                "alpha": alpha,
                "beta": beta,
                "component_id": component_id,
                "message": "Alpha and Beta estimated successfully",
            }

        except Exception as e:
            logger.error(
                f"Failed to estimate alpha/beta for component_id {component_id}: {e}"
            )
            raise

    @staticmethod
    async def alpha_beta_calculation(
        mainData: List[Dict], subData: List[Dict], component_id: UUID
    ):
        """Calculate alpha and beta parameters"""

        alpha_beta_repo = get_alpha_beta_repository()

        # Extract failure times from mainData
        failure_times = OverhaulsAlgos.equipment_failure_times(mainData)

        # Extract running ages T from subData
        T = OverhaulsAlgos.extract_running_ages(
            sub_data=subData, failure_times=failure_times
        )

        # Remove T from failure_times if it matches any sublist
        for sublist in failure_times[
            :
        ]:  # Use slice to avoid modification during iteration
            if sublist == T:
                failure_times.remove(sublist)

        # Calculate N (number of failures in each subarray)
        N = [len(subarray) for subarray in failure_times]

        logger.info(f"Failure times for component {component_id}: {failure_times}")
        logger.info(f"N values: {N}")
        logger.info(f"T values: {T}")

        # If no failure times, try to get existing alpha/beta
        if not failure_times:
            existing_alpha_beta = await alpha_beta_repo.get_by_component_id(
                component_id
            )
            if existing_alpha_beta:
                alpha = existing_alpha_beta["alpha"]
                beta = existing_alpha_beta["beta"]
                logger.info(
                    f"Using existing alpha={alpha}, beta={beta} for component {component_id}"
                )
                return alpha, beta
            else:
                raise ValueError(
                    f"No failure times and no existing alpha/beta for component {component_id}"
                )

        # Calculate alpha and beta using MLE
        alpha, beta = OverhaulsAlgos.calculate_parameters(failure_times)

        # Save or update alpha/beta in database
        await alpha_beta_repo.upsert(
            component_id=component_id, alpha=float(alpha), beta=float(beta)
        )

        logger.info(f"Saved alpha={alpha}, beta={beta} for component {component_id}")

        return alpha, beta

    @staticmethod
    def calculate_parameters(system_failures_list: List[List[float]]):
        """Calculate alpha and beta parameters using Maximum Likelihood Estimation"""
        getcontext().prec = 28  # Set precision for Decimal calculations

        # Calculate T for each system (max failure time * 1.05)
        T = [
            Decimal(max(failures)) * Decimal("1.05")
            for failures in system_failures_list
        ]

        # Calculate sum of ln(T/Xiq) for each system
        sum_ln_T_Xiq = [
            sum(Decimal(math.log(ti / Decimal(x))) for x in failures)
            for ti, failures in zip(T, system_failures_list)
        ]

        # Calculate BETA
        total_failures = sum(
            Decimal(len(failures)) for failures in system_failures_list
        )
        BETA = total_failures / sum(sum_ln_T_Xiq)

        # Calculate ALPHA
        ALPHA = total_failures / sum(ti**BETA for ti in T)

        return ALPHA, BETA

    @staticmethod
    def equipment_failure_times(mainData: List[Dict]) -> List[List[float]]:
        """Extract equipment failure times from maintenance data"""
        failure_times = []
        current_overhaul_failures = []

        for item in mainData:
            if item["maintenanceType"].lower() in ["corrective", "cm"]:
                current_overhaul_failures.append(float(item["runningAge"]))
            elif item["maintenanceType"].lower() in ["overhaul", "oh"]:
                if current_overhaul_failures:
                    failure_times.append(current_overhaul_failures)
                    current_overhaul_failures = []

        # Add any remaining failures
        if current_overhaul_failures:
            failure_times.append(current_overhaul_failures)

        return failure_times

    @staticmethod
    def extract_running_ages(
        sub_data: List[Dict], failure_times: List[List[float]]
    ) -> List[float]:
        """Extract running ages from subData"""
        if not sub_data:
            return []

        # Get the runAge from the first item in subData
        run_age = float(sub_data[0].get("runAge", 0))

        # Return a list matching the structure of failure_times
        # This represents the running age at each overhaul interval
        return [run_age] * len(failure_times) if failure_times else [run_age]
