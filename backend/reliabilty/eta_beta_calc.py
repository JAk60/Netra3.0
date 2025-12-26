# ==================== reliability/services/reliability_calculation_service.py ====================

"""
Reliability Calculation Service - Orchestration Layer

This service coordinates:
1. Data repositories (saving/retrieving data)
2. Pure calculation functions (Weibull math)
3. Data transformers (converting records to TTF)

Each method follows the pattern:
1. Save input data to database
2. Retrieve and transform data
3. Perform calculations (pure functions)
4. Save results to database
5. Return calculated parameters
"""

import sys

from sqlmodel import Session

from api.db.connection import get_async_db_service, get_session_context
from api.models.reliability.actual_data import ActualData
from api.models.reliability.interval_data import IntervalData
sys.path.append('..')
from typing import List, Optional, Tuple
import uuid
import logging

# Import repositories
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository
from api.db.repos.reliability.assemblies.actual_data import ActualDataRepository
from api.db.repos.reliability.assemblies.interval_data import IntervalDataRepository
from api.db.repos.reliability.assemblies.oem import OEMDataRepository
from api.db.repos.reliability.assemblies.oem_expert import OEMExpertDataRepository
from api.db.repos.reliability.assemblies.expert_judgement import ExpertJudgementRepository
from api.db.repos.reliability.assemblies.prob_failure import ProbabilityFailureRepository
from api.db.repos.reliability.assemblies.nprd import NPRDDataRepository
from api.db.repos.reliability.assemblies.ttf import TTFDataRepository

# Import models
from api.models.reliability import (
    ActualDataCreate,
    IntervalDataCreate,
    OEMDataCreate,
    OEMExpertDataCreate,
    ExpertJudgementCreate,
    ProbabilityFailureCreate,
    NPRDDataCreate,
    FailureStatusEnum
)

# Import utilities
from api.db.repos.reliability.utils import (
    mle_estimation,
    solve_oem_life_estimates,
    solve_expert_judgement,
    solve_probability_failure,
    solve_nprd,
    generate_ttf_points,
    WeibullEstimationError
)

logger = logging.getLogger(__name__)


class ReliabilityCalculationError(Exception):
    """Custom exception for reliability calculation service errors"""
    pass


class Reliability_via_eta_beta_CalculationService:
    """
    Service for orchestrating reliability calculations.
    
    This service handles all 7 priority levels of eta/beta calculations:
    Priority 1: Actual Data (exact dates)
    Priority 2: Interval Data (date ranges)
    Priority 3: OEM Data (L10/L90 estimates)
    Priority 4: OEM + Expert Data (combined)
    Priority 5: Expert Judgement (subjective estimates)
    Priority 6: Probability Failure (known failure percentages)
    Priority 7: NPRD Data (failure rate database)
    """
    def __init__(self, session: Optional[Session] = None, async_service=None):
        """Initialize all repositories"""
        self.session = session
        self.async_service = async_service or get_async_db_service()
        self.eta_beta_repo = EtaBetaRepository()
        self.actual_data_repo = ActualDataRepository()
        self.interval_data_repo = IntervalDataRepository()
        self.oem_data_repo = OEMDataRepository()
        self.oem_expert_data_repo = OEMExpertDataRepository()
        self.expert_judgement_repo = ExpertJudgementRepository()
        self.prob_failure_repo = ProbabilityFailureRepository()
        self.nprd_data_repo = NPRDDataRepository()
        self.ttf_data_repo = TTFDataRepository()

    # ==================== PRIORITY 1: ACTUAL DATA ====================

    async def calculate_from_actual_data(
        self,
        component_id: uuid.UUID,
        data_list: List[ActualDataCreate]
    ) -> Tuple[float, float]:
        """
        Priority 1: Calculate eta/beta from actual field data.
        
        Uses exact installation and removal dates to calculate TTF,
        then applies Maximum Likelihood Estimation.
        
        Steps:
        1. Save actual data records to database
        2. Retrieve records and extract TTF values (in same session)
        3. Calculate eta/beta using MLE
        4. Save calculated parameters with priority=1
        5. Optionally save TTF data points
        
        Args:
            component_id: UUID of the component
            data_list: List of ActualDataCreate objects with exact dates
            
        Returns:
            Tuple of (eta, beta)
            
        Raises:
            ReliabilityCalculationError: If calculation fails
            
        Example:
            >>> service = ReliabilityCalculationService()
            >>> data = [
            ...     ActualDataCreate(
            ...         component_id=comp_id,
            ...         interval_start_date=date(2023, 1, 1),
            ...         interval_end_date=date(2023, 6, 1)
            ...     )
            ... ]
            >>> eta, beta = await service.calculate_from_actual_data(comp_id, data)
        """
        try:
            logger.info(f"Starting Priority 1 calculation for component {component_id}")
            
            # Step 1 & 2: Save data and extract TTF in one operation
            def _save_and_extract():
                with get_session_context() as session:
                    # Save actual data to database
                    for data in data_list:
                        record = ActualData(**data.model_dump(), id=uuid.uuid4())
                        session.add(record)
                    session.commit()
                    logger.info(f"Saved {len(data_list)} actual data records")
                    
                    # Retrieve records in same session
                    from sqlmodel import select
                    statement = select(ActualData).where(ActualData.component_id == component_id)
                    records = session.exec(statement).all()
                    
                    # Extract TTF while still in session
                    ttf_values = []
                    for record in records:
                        start_date = record.interval_start_date
                        end_date = record.interval_end_date
                        
                        if start_date and end_date:
                            days = (end_date - start_date).days
                            hours = days * 24.0
                            if hours > 0:
                                ttf_values.append(hours)
                    
                    return ttf_values
            
            ttf_values = await self.async_service.run_in_thread(_save_and_extract)

            if len(ttf_values) < 2:
                raise ReliabilityCalculationError(
                    f"Insufficient data points for calculation. Got {len(ttf_values)}, need at least 2"
                )

            logger.info(f"Extracted {len(ttf_values)} TTF values")

            # Step 3: Calculate eta/beta using MLE (pure function)
            eta, beta = mle_estimation(ttf_values)
            logger.info(f"MLE calculation: eta={eta:.2f}, beta={beta:.2f}")

            # Step 4: Save results with priority=1
            await self.eta_beta_repo.save_or_update(eta, beta, component_id, priority=1)
            logger.info(f"Saved eta/beta for component {component_id} with priority 1")

            # Step 5: Optionally save TTF data points for reference
            await self.ttf_data_repo.create_bulk(
                component_id=component_id,
                ttf_values=ttf_values,
                priority=1,
                status=FailureStatusEnum.FAILURE
            )
            logger.info(f"Saved {len(ttf_values)} TTF data points")

            return eta, beta

        except WeibullEstimationError as e:
            logger.error(f"Weibull calculation failed: {e}")
            raise ReliabilityCalculationError(f"Calculation error: {str(e)}")
        except Exception as e:
            logger.error(f"Priority 1 calculation failed: {e}")
            raise ReliabilityCalculationError(f"Failed to calculate from actual data: {str(e)}")

    # ==================== PRIORITY 2: INTERVAL DATA ====================

    async def calculate_from_interval_data(
        self,
        component_id: uuid.UUID,
        data_list: List[IntervalDataCreate]
    ) -> Tuple[float, float]:
        """
        Priority 2: Calculate eta/beta from interval data.
        
        Uses date ranges (not exact dates) to estimate TTF,
        then applies Maximum Likelihood Estimation.
        
        Steps:
        1. Save interval data records to database
        2. Retrieve records and extract TTF values (using mean dates, in same session)
        3. Calculate eta/beta using MLE
        4. Save calculated parameters with priority=2
        5. Optionally save TTF data points
        
        Args:
            component_id: UUID of the component
            data_list: List of IntervalDataCreate objects with date ranges
            
        Returns:
            Tuple of (eta, beta)
            
        Raises:
            ReliabilityCalculationError: If calculation fails
            
        Example:
            >>> data = [
            ...     IntervalDataCreate(
            ...         component_id=comp_id,
            ...         installation_start_date=date(2023, 1, 1),
            ...         installation_end_date=date(2023, 1, 15),
            ...         removal_start_date=date(2023, 6, 1),
            ...         removal_end_date=date(2023, 6, 15)
            ...     )
            ... ]
            >>> eta, beta = await service.calculate_from_interval_data(comp_id, data)
        """
        try:
            logger.info(f"Starting Priority 2 calculation for component {component_id}")
            
            # Step 1 & 2: Save data and extract TTF in one operation
            def _save_and_extract():
                with get_session_context() as session:
                    from datetime import timedelta
                    from sqlmodel import select
                    
                    # Save interval data to database
                    for data in data_list:
                        record = IntervalData(**data.model_dump(), id=uuid.uuid4())
                        session.add(record)
                    session.commit()
                    logger.info(f"Saved {len(data_list)} interval data records")
                    
                    # Retrieve records in same session
                    statement = select(IntervalData).where(IntervalData.component_id == component_id)
                    records = session.exec(statement).all()
                    
                    # Extract TTF while still in session
                    ttf_values = []
                    for record in records:
                        install_start = record.installation_start_date
                        install_end = record.installation_end_date
                        removal_start = record.removal_start_date
                        removal_end = record.removal_end_date
                        
                        if all([install_start, install_end, removal_start, removal_end]):
                            # Calculate mean dates
                            install_days = (install_end - install_start).days
                            mean_install = install_start + timedelta(days=install_days / 2)
                            
                            removal_days = (removal_end - removal_start).days
                            mean_removal = removal_start + timedelta(days=removal_days / 2)
                            
                            # Calculate TTF
                            days = (mean_removal - mean_install).days
                            hours = days * 24.0
                            if hours > 0:
                                ttf_values.append(hours)
                    
                    return ttf_values
            
            ttf_values = await self.async_service.run_in_thread(_save_and_extract)

            if len(ttf_values) < 2:
                raise ReliabilityCalculationError(
                    f"Insufficient data points for calculation. Got {len(ttf_values)}, need at least 2"
                )

            logger.info(f"Extracted {len(ttf_values)} TTF values from interval data")

            # Step 3: Calculate eta/beta using MLE (pure function)
            eta, beta = mle_estimation(ttf_values)
            logger.info(f"MLE calculation: eta={eta:.2f}, beta={beta:.2f}")

            # Step 4: Save results with priority=2
            await self.eta_beta_repo.save_or_update(eta, beta, component_id, priority=2)
            logger.info(f"Saved eta/beta for component {component_id} with priority 2")

            # Step 5: Save TTF data points
            await self.ttf_data_repo.create_bulk(
                component_id=component_id,
                ttf_values=ttf_values,
                priority=2,
                status=FailureStatusEnum.FAILURE
            )
            logger.info(f"Saved {len(ttf_values)} TTF data points")

            return eta, beta

        except WeibullEstimationError as e:
            logger.error(f"Weibull calculation failed: {e}")
            raise ReliabilityCalculationError(f"Calculation error: {str(e)}")
        except Exception as e:
            logger.error(f"Priority 2 calculation failed: {e}")
            raise ReliabilityCalculationError(f"Failed to calculate from interval data: {str(e)}")

    # ==================== PRIORITY 3: OEM DATA ====================

    async def calculate_from_oem_data(
        self,
        component_id: uuid.UUID,
        data: OEMDataCreate
    ) -> Tuple[float, float]:
        """
        Priority 3: Calculate eta/beta from OEM reliability data.
        
        Uses manufacturer-provided life estimates (e.g., L10, L90)
        to solve for Weibull parameters.
        
        Steps:
        1. Save OEM data to database
        2. Calculate eta/beta from two life estimates
        3. Save calculated parameters with priority=3
        4. Generate and save synthetic TTF points
        
        Args:
            component_id: UUID of the component
            data: OEMDataCreate object with life estimates
                  e.g., life_estimate1_name="L10", life_estimate1_val=1000
                        life_estimate2_name="L90", life_estimate2_val=5000
            
        Returns:
            Tuple of (eta, beta)
            
        Raises:
            ReliabilityCalculationError: If calculation fails
            
        Example:
            >>> data = OEMDataCreate(
            ...     component_id=comp_id,
            ...     life_estimate1_name="L10",
            ...     life_estimate1_val=1000,
            ...     life_estimate2_name="L90",
            ...     life_estimate2_val=5000
            ... )
            >>> eta, beta = await service.calculate_from_oem_data(comp_id, data)
        """
        try:
            logger.info(f"Starting Priority 3 calculation for component {component_id}")
            
            # Step 1: Save OEM data to database
            await self.oem_data_repo.create(data)
            logger.info("Saved OEM data record")

            # Step 2: Calculate eta/beta from life estimates (pure function)
            eta, beta = solve_oem_life_estimates(
                l1=data.life_estimate1_val,
                l2=data.life_estimate2_val,
                l1_name=data.life_estimate1_name,
                l2_name=data.life_estimate2_name
            )
            logger.info(f"OEM calculation: eta={eta:.2f}, beta={beta:.2f}")

            # Step 3: Save results with priority=3
            await self.eta_beta_repo.save_or_update(eta, beta, component_id, priority=3)
            logger.info(f"Saved eta/beta for component {component_id} with priority 3")

            # Step 4: Generate synthetic TTF points for visualization
            ttf_values = generate_ttf_points(eta, beta, num_points=15)
            await self.ttf_data_repo.create_bulk(
                component_id=component_id,
                ttf_values=ttf_values,
                priority=3,
                status=FailureStatusEnum.FAILURE
            )
            logger.info(f"Generated and saved {len(ttf_values)} synthetic TTF points")

            return eta, beta

        except WeibullEstimationError as e:
            logger.error(f"Weibull calculation failed: {e}")
            raise ReliabilityCalculationError(f"Calculation error: {str(e)}")
        except Exception as e:
            logger.error(f"Priority 3 calculation failed: {e}")
            raise ReliabilityCalculationError(f"Failed to calculate from OEM data: {str(e)}")

    # ==================== PRIORITY 4: OEM + EXPERT DATA ====================

    async def calculate_from_oem_expert(
        self,
        component_id: uuid.UUID,
        data: OEMExpertDataCreate
    ) -> Tuple[float, float]:
        """
        Priority 4: Calculate eta/beta from OEM data combined with expert judgement.
        
        Combines manufacturer data with expert opinions to improve estimates
        when OEM data alone is insufficient.
        
        Steps:
        1. Save OEM expert data to database
        2. Calculate eta/beta using expert judgement constraints
        3. Save calculated parameters with priority=4
        4. Generate and save synthetic TTF points
        
        Args:
            component_id: UUID of the component
            data: OEMExpertDataCreate object with:
                  - Life estimate (from OEM)
                  - Expert judgement (min, most likely, max life)
                  - Optional zero-failure data
            
        Returns:
            Tuple of (eta, beta)
            
        Raises:
            ReliabilityCalculationError: If calculation fails
            
        Example:
            >>> data = OEMExpertDataCreate(
            ...     component_id=comp_id,
            ...     life_estimate_name="L10",
            ...     life_estimate_val=1000,
            ...     most_likely_life=2000,
            ...     min_life=500,
            ...     max_life=5000
            ... )
            >>> eta, beta = await service.calculate_from_oem_expert(comp_id, data)
        """
        try:
            logger.info(f"Starting Priority 4 calculation for component {component_id}")
            
            # Step 1: Save OEM expert data to database
            await self.oem_expert_data_repo.create(data)
            logger.info("Saved OEM expert data record")

            # Step 2: Calculate eta/beta using expert judgement (pure function)
            eta, beta = solve_expert_judgement(
                most_likely=data.most_likely_life,
                min_life=data.min_life,
                max_life=data.max_life,
                life_estimate_val=data.life_estimate_val,
                life_estimate_name=data.life_estimate_name,
                num_components=data.num_component_wo_failure,
                time_wo_failure=data.time_wo_failure
            )
            logger.info(f"OEM+Expert calculation: eta={eta:.2f}, beta={beta:.2f}")

            # Step 3: Save results with priority=4
            await self.eta_beta_repo.save_or_update(eta, beta, component_id, priority=4)
            logger.info(f"Saved eta/beta for component {component_id} with priority 4")

            # Step 4: Generate synthetic TTF points
            ttf_values = generate_ttf_points(eta, beta, num_points=15)
            await self.ttf_data_repo.create_bulk(
                component_id=component_id,
                ttf_values=ttf_values,
                priority=4,
                status=FailureStatusEnum.FAILURE
            )
            logger.info(f"Generated and saved {len(ttf_values)} synthetic TTF points")

            return eta, beta

        except WeibullEstimationError as e:
            logger.error(f"Weibull calculation failed: {e}")
            raise ReliabilityCalculationError(f"Calculation error: {str(e)}")
        except Exception as e:
            logger.error(f"Priority 4 calculation failed: {e}")
            raise ReliabilityCalculationError(f"Failed to calculate from OEM expert data: {str(e)}")

    # ==================== PRIORITY 5: EXPERT JUDGEMENT ====================

    async def calculate_from_expert_judgement(
        self,
        component_id: uuid.UUID,
        data: ExpertJudgementCreate
    ) -> Tuple[float, float]:
        """
        Priority 5: Calculate eta/beta from pure expert judgement.
        
        Uses subjective expert estimates when no hard data is available.
        Requires min, most likely, and max life estimates.
        
        Steps:
        1. Save expert judgement data to database
        2. Calculate eta/beta using expert constraints
        3. Save calculated parameters with priority=5
        4. Generate and save synthetic TTF points
        
        Args:
            component_id: UUID of the component
            data: ExpertJudgementCreate object with:
                  - most_likely_life: Expert's best estimate
                  - min_life: Minimum expected life
                  - max_life: Maximum expected life
                  - Optional zero-failure data
            
        Returns:
            Tuple of (eta, beta)
            
        Raises:
            ReliabilityCalculationError: If calculation fails
            
        Example:
            >>> data = ExpertJudgementCreate(
            ...     component_id=comp_id,
            ...     most_likely_life=2000,
            ...     min_life=500,
            ...     max_life=5000,
            ...     num_component_wo_failure=10,
            ...     time_wo_failure=1500
            ... )
            >>> eta, beta = await service.calculate_from_expert_judgement(comp_id, data)
        """
        try:
            logger.info(f"Starting Priority 5 calculation for component {component_id}")
            
            # Step 1: Save expert judgement data to database
            await self.expert_judgement_repo.create(data)
            logger.info("Saved expert judgement data record")

            # Step 2: Calculate eta/beta using expert judgement (pure function)
            eta, beta = solve_expert_judgement(
                most_likely=data.most_likely_life,
                min_life=data.min_life,
                max_life=data.max_life,
                num_components=data.num_component_wo_failure,
                time_wo_failure=data.time_wo_failure
            )
            logger.info(f"Expert judgement calculation: eta={eta:.2f}, beta={beta:.2f}")

            # Step 3: Save results with priority=5
            await self.eta_beta_repo.save_or_update(eta, beta, component_id, priority=5)
            logger.info(f"Saved eta/beta for component {component_id} with priority 5")

            # Step 4: Generate synthetic TTF points
            ttf_values = generate_ttf_points(eta, beta, num_points=15)
            await self.ttf_data_repo.create_bulk(
                component_id=component_id,
                ttf_values=ttf_values,
                priority=5,
                status=FailureStatusEnum.FAILURE
            )
            logger.info(f"Generated and saved {len(ttf_values)} synthetic TTF points")

            return eta, beta

        except WeibullEstimationError as e:
            logger.error(f"Weibull calculation failed: {e}")
            raise ReliabilityCalculationError(f"Calculation error: {str(e)}")
        except Exception as e:
            logger.error(f"Priority 5 calculation failed: {e}")
            raise ReliabilityCalculationError(f"Failed to calculate from expert judgement: {str(e)}")

    # ==================== PRIORITY 6: PROBABILITY FAILURE ====================

    async def calculate_from_probability_failure(
        self,
        component_id: uuid.UUID,
        data_list: List[ProbabilityFailureCreate]
    ) -> Tuple[float, float]:
        """
        Priority 6: Calculate eta/beta from known failure probabilities.
        
        Uses Weibull probability plotting (linear regression method)
        when failure percentages at specific times are known.
        
        Steps:
        1. Save probability failure data to database
        2. Extract time-probability pairs
        3. Calculate eta/beta using linear regression
        4. Save calculated parameters with priority=6
        5. Generate and save synthetic TTF points
        
        Args:
            component_id: UUID of the component
            data_list: List of ProbabilityFailureCreate objects with:
                      - p_time: Time value
                      - failure_p: Failure percentage at that time
            
        Returns:
            Tuple of (eta, beta)
            
        Raises:
            ReliabilityCalculationError: If calculation fails
            
        Example:
            >>> data = [
            ...     ProbabilityFailureCreate(component_id=comp_id, p_time=100, failure_p=10),
            ...     ProbabilityFailureCreate(component_id=comp_id, p_time=200, failure_p=30),
            ...     ProbabilityFailureCreate(component_id=comp_id, p_time=300, failure_p=50)
            ... ]
            >>> eta, beta = await service.calculate_from_probability_failure(comp_id, data)
        """
        try:
            logger.info(f"Starting Priority 6 calculation for component {component_id}")
            
            # Step 1: Save probability failure data to database
            await self.prob_failure_repo.create_bulk(data_list)
            logger.info(f"Saved {len(data_list)} probability failure records")

            # Step 2: Extract time-probability pairs
            time_prob_pairs = [(d.p_time, d.failure_p) for d in data_list]

            if len(time_prob_pairs) < 2:
                raise ReliabilityCalculationError(
                    f"Insufficient data points for calculation. Got {len(time_prob_pairs)}, need at least 2"
                )

            # Step 3: Calculate eta/beta using linear regression (pure function)
            eta, beta = solve_probability_failure(time_prob_pairs)
            logger.info(f"Probability failure calculation: eta={eta:.2f}, beta={beta:.2f}")

            # Step 4: Save results with priority=6
            await self.eta_beta_repo.save_or_update(eta, beta, component_id, priority=6)
            logger.info(f"Saved eta/beta for component {component_id} with priority 6")

            # Step 5: Generate synthetic TTF points
            ttf_values = generate_ttf_points(eta, beta, num_points=15)
            await self.ttf_data_repo.create_bulk(
                component_id=component_id,
                ttf_values=ttf_values,
                priority=6,
                status=FailureStatusEnum.FAILURE
            )
            logger.info(f"Generated and saved {len(ttf_values)} synthetic TTF points")

            return eta, beta

        except WeibullEstimationError as e:
            logger.error(f"Weibull calculation failed: {e}")
            raise ReliabilityCalculationError(f"Calculation error: {str(e)}")
        except Exception as e:
            logger.error(f"Priority 6 calculation failed: {e}")
            raise ReliabilityCalculationError(f"Failed to calculate from probability failure: {str(e)}")

    # ==================== PRIORITY 7: NPRD DATA ====================

    async def calculate_from_nprd(
        self,
        component_id: uuid.UUID,
        data: NPRDDataCreate
    ) -> Tuple[float, float]:
        """
        Priority 7: Calculate eta from NPRD failure rate data.
        
        Uses NPRD (Nonelectronic Parts Reliability Data) failure rates
        with a known beta to calculate eta.
        
        Steps:
        1. Save NPRD data to database
        2. Calculate eta from failure rate and beta
        3. Save calculated parameters with priority=7
        4. Generate and save synthetic TTF points
        
        Args:
            component_id: UUID of the component
            data: NPRDDataCreate object with:
                  - failure_rate: NPRD failure rate (lambda)
                  - beta: Known shape parameter
            
        Returns:
            Tuple of (eta, beta)
            
        Raises:
            ReliabilityCalculationError: If calculation fails
            
        Example:
            >>> data = NPRDDataCreate(
            ...     component_id=comp_id,
            ...     failure_rate=0.0001,
            ...     beta=2.5
            ... )
            >>> eta, beta = await service.calculate_from_nprd(comp_id, data)
        """
        try:
            logger.info(f"Starting Priority 7 calculation for component {component_id}")
            
            # Step 1: Save NPRD data to database
            await self.nprd_data_repo.create(data)
            logger.info("Saved NPRD data record")

            # Step 2: Calculate eta from failure rate (pure function)
            # Note: beta is provided, we only calculate eta
            eta = solve_nprd(data.failure_rate, data.beta)
            beta = data.beta
            logger.info(f"NPRD calculation: eta={eta:.2f}, beta={beta:.2f}")

            # Step 3: Save results with priority=7
            await self.eta_beta_repo.save_or_update(eta, beta, component_id, priority=7)
            logger.info(f"Saved eta/beta for component {component_id} with priority 7")

            # Step 4: Generate synthetic TTF points
            ttf_values = generate_ttf_points(eta, beta, num_points=15)
            await self.ttf_data_repo.create_bulk(
                component_id=component_id,
                ttf_values=ttf_values,
                priority=7,
                status=FailureStatusEnum.FAILURE
            )
            logger.info(f"Generated and saved {len(ttf_values)} synthetic TTF points")

            return eta, beta

        except WeibullEstimationError as e:
            logger.error(f"Weibull calculation failed: {e}")
            raise ReliabilityCalculationError(f"Calculation error: {str(e)}")
        except Exception as e:
            logger.error(f"Priority 7 calculation failed: {e}")
            raise ReliabilityCalculationError(f"Failed to calculate from NPRD data: {str(e)}")

    # ==================== HELPER METHODS ====================

    async def get_best_eta_beta(self, component_id: uuid.UUID) -> Tuple[float, float]:
        """
        Get the best available eta/beta for a component.
        Returns the parameters with the highest priority (lowest number).
        
        Args:
            component_id: UUID of the component
            
        Returns:
            Tuple of (eta, beta) from highest priority calculation
            
        Raises:
            ReliabilityCalculationError: If no calculations exist for component
        """
        try:
            result = await self.eta_beta_repo.get_by_priority(component_id)
            
            if not result:
                raise ReliabilityCalculationError(
                    f"No eta/beta calculations found for component {component_id}"
                )
            
            logger.info(
                f"Retrieved best eta/beta for component {component_id}: "
                f"eta={result.eta:.2f}, beta={result.beta:.2f}, priority={result.priority}"
            )
            
            return result.eta, result.beta
            
        except Exception as e:
            logger.error(f"Failed to retrieve best eta/beta: {e}")
            raise ReliabilityCalculationError(f"Failed to retrieve eta/beta: {str(e)}")

    async def get_all_eta_beta_for_component(self, component_id: uuid.UUID) -> List:
        """
        Get all eta/beta calculations for a component across all priorities.
        
        Args:
            component_id: UUID of the component
            
        Returns:
            List of EtaBeta records
        """
        try:
            results = await self.eta_beta_repo.get_by_component_id(component_id)
            logger.info(f"Retrieved {len(results)} eta/beta calculations for component {component_id}")
            return results
        except Exception as e:
            logger.error(f"Failed to retrieve eta/beta records: {e}")
            raise ReliabilityCalculationError(f"Failed to retrieve eta/beta records: {str(e)}")