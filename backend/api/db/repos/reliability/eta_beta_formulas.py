import sys

from api.models.reliability.params import EtaBeta
sys.path.append('..')
from typing import List, Optional, Tuple
import uuid
from uuid import uuid4
from sqlmodel import Session, select
from datetime import datetime
import numpy as np
from scipy.optimize import fsolve
from scipy.stats import weibull_min
from scipy import integrate
import logging

# Import models
from api.models.reliability import (
    ActualData, ActualDataCreate,
    IntervalData, IntervalDataCreate,
    OEMData, OEMDataCreate,
    OEMExpertData, OEMExpertDataCreate,
    ExpertJudgement, ExpertJudgementCreate,
    ProbabilityFailure, ProbabilityFailureCreate,
    NPRDData, NPRDDataCreate,
    TTFData, FailureStatusEnum
)
from api.db.connection import get_session_context, get_async_db_service

logger = logging.getLogger(__name__)


class EtaBetaCalculationError(Exception):
    """Custom exception for eta/beta calculation errors"""
    pass


class EtaBetaCalcRepository:
    """
    Repository for Eta/Beta parameter estimation and storage.
    Handles all reliability calculations for replaceable components.
    """

    def __init__(
        self,
        session: Optional[Session] = None,
        async_service=None
    ):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    # ==================== CORE SAVE/RETRIEVE ====================

    def _save_eta_beta_sync(
        self,
        session: Session,
        eta: float,
        beta: float,
        component_id: uuid.UUID,
        priority: int
    ) -> EtaBeta:
        """
        Save or update eta/beta parameters for a component at given priority.
        Uses MERGE logic: updates if exists, inserts if not.
        """
        try:
            # Check if record exists
            statement = select(EtaBeta).where(
                EtaBeta.component_id == component_id,
                EtaBeta.priority == priority
            )
            existing = session.exec(statement).first()

            if existing:
                # Update existing
                existing.eta = eta
                existing.beta = beta
                existing.modified_date = datetime.utcnow()
                session.add(existing)
                logger.info(
                    f"Updated eta/beta for component {component_id}, priority {priority}")
                record = existing
            else:
                # Insert new
                record = EtaBeta(
                    id=uuid4(),
                    eta=eta,
                    beta=beta,
                    component_id=component_id,
                    priority=priority
                )
                session.add(record)
                logger.info(
                    f"Created new eta/beta for component {component_id}, priority {priority}")

            session.commit()
            session.refresh(record)
            return record

        except Exception as e:
            session.rollback()
            logger.error(f"Failed to save eta/beta: {e}")
            raise EtaBetaCalculationError(f"Database error: {str(e)}")

    async def save_eta_beta(
        self,
        eta: float,
        beta: float,
        component_id: uuid.UUID,
        priority: int
    ) -> EtaBeta:
        """Async wrapper for saving eta/beta"""
        def _save():
            with get_session_context() as session:
                return self._save_eta_beta_sync(session, eta, beta, component_id, priority)
        return await self.async_service.run_in_thread(_save)

    def _get_eta_beta_sync(
        self,
        session: Session,
        component_id: uuid.UUID,
        priority: Optional[int] = None
    ) -> Optional[EtaBeta]:
        """Get eta/beta for component, optionally filtered by priority"""
        try:
            statement = select(EtaBeta).where(
                EtaBeta.component_id == component_id)

            if priority is not None:
                statement = statement.where(EtaBeta.priority == priority)
            else:
                # Get highest priority (lowest number)
                statement = statement.order_by(EtaBeta.priority)

            return session.exec(statement).first()

        except Exception as e:
            logger.error(f"Failed to retrieve eta/beta: {e}")
            return None

    async def get_eta_beta(
        self,
        component_id: uuid.UUID,
        priority: Optional[int] = None
    ) -> Optional[EtaBeta]:
        """Async wrapper for retrieving eta/beta"""
        def _get():
            with get_session_context() as session:
                return self._get_eta_beta_sync(session, component_id, priority)
        return await self.async_service.run_in_thread(_get)

    # ==================== PRIORITY 1: ACTUAL DATA ====================

    async def calculate_from_actual_data(
        self,
        component_id: uuid.UUID,
        data_list: List[ActualDataCreate]
    ) -> Tuple[float, float]:
        """
        Calculate eta/beta from actual field data (exact installation/removal dates).
        Priority: 1
        """
        def _calculate():
            with get_session_context() as session:
                # Save actual data records
                for data in data_list:
                    record = ActualData(**data.model_dump(), id=uuid4())
                    session.add(record)

                session.commit()

                # Get TTF values and calculate
                ttf_values = self._extract_ttf_from_actual_data_sync(
                    session, component_id)

                if len(ttf_values) < 2:
                    raise EtaBetaCalculationError(
                        "Insufficient data points for calculation")

                # Use MLE to estimate parameters
                eta, beta = self._mle_estimation(ttf_values)

                # Save eta/beta with priority 1
                self._save_eta_beta_sync(session, eta, beta, component_id, 1)

                return eta, beta

        return await self.async_service.run_in_thread(_calculate)

    # ==================== PRIORITY 2: INTERVAL DATA ====================

    async def calculate_from_interval_data(
        self,
        component_id: uuid.UUID,
        data_list: List[IntervalDataCreate]
    ) -> Tuple[float, float]:
        """
        Calculate eta/beta from interval data (date ranges).
        Priority: 2
        """
        def _calculate():
            with get_session_context() as session:
                # Save interval data records
                for data in data_list:
                    record = IntervalData(**data.model_dump(), id=uuid4())
                    session.add(record)

                session.commit()

                # Get TTF values using mean dates
                ttf_values = self._extract_ttf_from_interval_data_sync(
                    session, component_id)

                if len(ttf_values) < 2:
                    raise EtaBetaCalculationError(
                        "Insufficient data points for calculation")

                eta, beta = self._mle_estimation(ttf_values)
                self._save_eta_beta_sync(session, eta, beta, component_id, 2)

                return eta, beta

        return await self.async_service.run_in_thread(_calculate)

    # ==================== PRIORITY 3: OEM DATA ====================

    async def calculate_from_oem_data(
        self,
        component_id: uuid.UUID,
        data: OEMDataCreate
    ) -> Tuple[float, float]:
        """
        Calculate eta/beta from OEM reliability data (L10/L90 estimates).
        Priority: 3
        """
        def _calculate():
            with get_session_context() as session:
                # Save OEM data
                record = OEMData(**data.model_dump(), id=uuid4())
                session.add(record)
                session.commit()

                # Calculate eta/beta
                eta, beta = self._solve_eta_beta_oem(
                    data.life_estimate1_val,
                    data.life_estimate2_val,
                    data.life_estimate1_name,
                    data.life_estimate2_name
                )

                self._save_eta_beta_sync(session, eta, beta, component_id, 3)
                return eta, beta

        return await self.async_service.run_in_thread(_calculate)

    def _solve_eta_beta_oem(
        self,
        l1: float,
        l2: float,
        l1_name: str,
        l2_name: str
    ) -> Tuple[float, float]:
        """
        Solve for eta and beta given two life estimates (e.g., L10 and L90).
        
        L_x means x% of units will have failed by that time.
        For Weibull: F(t) = 1 - exp(-(t/eta)^beta)
        So: ln(1/(1-p)) = (t/eta)^beta
        """
        try:
            # Extract percentile from name (e.g., "L10" -> 0.10)
            p1 = float(l1_name[1:]) / 100  # L10 -> 0.10
            p2 = float(l2_name[1:]) / 100  # L90 -> 0.90

            def equations(params):
                eta, beta = params
                eq1 = -((l1 / eta) ** beta) - np.log(1 - p1)
                eq2 = -((l2 / eta) ** beta) - np.log(1 - p2)
                return [eq1, eq2]

            eta, beta = fsolve(equations, (1.0, 1.0))

            if eta <= 0 or beta <= 0:
                raise ValueError("Negative parameters obtained")

            logger.info(f"OEM calculation: eta={eta:.2f}, beta={beta:.2f}")
            return float(eta), float(beta)

        except Exception as e:
            logger.error(f"OEM calculation failed: {e}")
            raise EtaBetaCalculationError(f"OEM calculation error: {str(e)}")

    # ==================== PRIORITY 4: OEM + EXPERT ====================

    async def calculate_from_oem_expert(
        self,
        component_id: uuid.UUID,
        data: OEMExpertDataCreate
    ) -> Tuple[float, float]:
        """
        Calculate eta/beta from OEM data combined with expert judgement.
        Priority: 4
        """
        def _calculate():
            with get_session_context() as session:
                record = OEMExpertData(**data.model_dump(), id=uuid4())
                session.add(record)
                session.commit()

                eta, beta = self._solve_eta_beta_expert(
                    most_likely=data.most_likely_life,
                    min_life=data.min_life,
                    max_life=data.max_life,
                    life_estimate_val=data.life_estimate_val,
                    life_estimate_name=data.life_estimate_name,
                    num_components=data.num_component_wo_failure,
                    time_wo_failure=data.time_wo_failure
                )

                self._save_eta_beta_sync(session, eta, beta, component_id, 4)
                return eta, beta

        return await self.async_service.run_in_thread(_calculate)

    # ==================== PRIORITY 5: EXPERT JUDGEMENT ====================

    async def calculate_from_expert_judgement(
        self,
        component_id: uuid.UUID,
        data: ExpertJudgementCreate
    ) -> Tuple[float, float]:
        """
        Calculate eta/beta from pure expert judgement (min/likely/max).
        Priority: 5
        """
        def _calculate():
            with get_session_context() as session:
                record = ExpertJudgement(**data.model_dump(), id=uuid4())
                session.add(record)
                session.commit()

                eta, beta = self._solve_eta_beta_expert(
                    most_likely=data.most_likely_life,
                    min_life=data.min_life,
                    max_life=data.max_life,
                    num_components=data.num_component_wo_failure,
                    time_wo_failure=data.time_wo_failure
                )

                self._save_eta_beta_sync(session, eta, beta, component_id, 5)
                return eta, beta

        return await self.async_service.run_in_thread(_calculate)

    def _solve_eta_beta_expert(
        self,
        most_likely: float,
        min_life: float,
        max_life: float,
        life_estimate_val: Optional[float] = None,
        life_estimate_name: Optional[str] = None,
        num_components: Optional[int] = None,
        time_wo_failure: Optional[float] = None
    ) -> Tuple[float, float]:
        """
        Solve for eta/beta using expert judgement constraints:
        - Min life: F(t_min) = 0.99 (99% will survive past this)
        - Max life: F(t_max) = 0.01 (only 1% will survive past this)
        - Most likely: Mode of distribution
        - Zero-failure data: if provided
        """
        try:
            # Build list of available constraints
            constraints = []

            # Constraint 1: from life estimate (if provided)
            if life_estimate_val and life_estimate_name:
                p = float(life_estimate_name[1:]) / 100
                constraints.append(('life_estimate', life_estimate_val, p))

            # Constraint 2: min life
            if min_life:
                constraints.append(('min_life', min_life))

            # Constraint 3: max life
            if max_life:
                constraints.append(('max_life', max_life))

            # Constraint 4: most likely
            if most_likely:
                constraints.append(('most_likely', most_likely))

            # Constraint 5: zero failure data
            if num_components and time_wo_failure:
                constraints.append(
                    ('zero_failure', num_components, time_wo_failure))

            # Need at least 2 constraints
            if len(constraints) < 2:
                raise ValueError("Insufficient constraints for estimation")

            # Select best 2 constraints
            selected = constraints[:2]

            def equations(params):
                eta, beta = params
                eqs = []

                for constraint in selected:
                    if constraint[0] == 'life_estimate':
                        _, val, p = constraint
                        eqs.append(-((val / eta) ** beta) - np.log(1 - p))

                    elif constraint[0] == 'min_life':
                        _, val = constraint
                        eqs.append(0.99 - np.exp(-((val / eta) ** beta)))

                    elif constraint[0] == 'max_life':
                        _, val = constraint
                        eqs.append(0.01 - np.exp(-((val / eta) ** beta)))

                    elif constraint[0] == 'most_likely':
                        _, val = constraint
                        # Mode of Weibull: eta * ((beta-1)/beta)^(1/beta)
                        if beta > 1:
                            mode = eta * (((beta - 1) / beta) ** (1 / beta))
                            eqs.append(mode - val)
                        else:
                            eqs.append(eta - val)  # Fallback

                    elif constraint[0] == 'zero_failure':
                        _, n, t = constraint
                        # Zero-failure reliability constraint
                        cl = 0.9
                        P = (1 - cl) ** (1 / n)
                        R_calc = np.exp(-((t / eta) ** beta))
                        eqs.append(R_calc - P)

                return eqs

            eta, beta = fsolve(equations, (most_likely or 1.0, 2.0))

            if eta <= 0 or beta <= 0:
                raise ValueError("Invalid parameter values")

            logger.info(
                f"Expert estimation: eta={eta:.2f}, beta={beta:.2f}")
            return float(eta), float(beta)

        except Exception as e:
            logger.error(f"Expert calculation failed: {e}")
            raise EtaBetaCalculationError(
                f"Expert calculation error: {str(e)}")

    # ==================== PRIORITY 6: PROBABILITY FAILURE ====================

    async def calculate_from_probability_failure(
        self,
        component_id: uuid.UUID,
        data_list: List[ProbabilityFailureCreate]
    ) -> Tuple[float, float]:
        """
        Calculate eta/beta from known failure probabilities at specific times.
        Priority: 6
        
        Uses linear regression on: ln(ln(1/(1-F))) vs ln(t)
        """
        def _calculate():
            with get_session_context() as session:
                # Save probability data
                for data in data_list:
                    record = ProbabilityFailure(
                        **data.model_dump(), id=uuid4())
                    session.add(record)
                session.commit()

                # Calculate using regression
                eta, beta = self._solve_probability_failure(data_list)
                self._save_eta_beta_sync(session, eta, beta, component_id, 6)
                return eta, beta

        return await self.async_service.run_in_thread(_calculate)

    def _solve_probability_failure(
        self,
        data_list: List[ProbabilityFailureCreate]
    ) -> Tuple[float, float]:
        """
        Linear regression method for Weibull parameter estimation.
        
        Transform: F(t) = 1 - exp(-(t/eta)^beta)
        ln(ln(1/(1-F))) = beta * ln(t) - beta * ln(eta)
        
        This is linear: y = mx + c where:
        y = ln(ln(1/(1-F)))
        x = ln(t)
        m = beta (slope)
        c = -beta * ln(eta) (intercept)
        """
        try:
            if len(data_list) < 2:
                raise ValueError("Need at least 2 data points")

            x_data = []  # ln(time)
            y_data = []  # ln(ln(1/(1-F)))

            for data in data_list:
                t = data.p_time
                F = data.failure_p / 100.0  # Convert percentage to decimal

                if F <= 0 or F >= 1:
                    logger.warning(f"Skipping invalid probability: {F}")
                    continue

                x_data.append(np.log(t))
                y_data.append(np.log(-np.log(1 - F)))

            if len(x_data) < 2:
                raise ValueError("Insufficient valid data points")

            # Linear regression
            x_arr = np.array(x_data)
            y_arr = np.array(y_data)

            # Calculate slope (beta) and intercept
            n = len(x_arr)
            sum_x = np.sum(x_arr)
            sum_y = np.sum(y_arr)
            sum_xy = np.sum(x_arr * y_arr)
            sum_x2 = np.sum(x_arr ** 2)

            beta = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
            intercept = (sum_y - beta * sum_x) / n

            # Calculate eta from intercept: c = -beta * ln(eta)
            eta = np.exp(-intercept / beta)

            if eta <= 0 or beta <= 0:
                raise ValueError("Invalid parameter values")

            logger.info(
                f"Probability failure estimation: eta={eta:.2f}, beta={beta:.2f}")
            return float(eta), float(beta)

        except Exception as e:
            logger.error(f"Probability failure calculation failed: {e}")
            raise EtaBetaCalculationError(
                f"Probability calculation error: {str(e)}")

    # ==================== PRIORITY 7: NPRD ====================

    async def calculate_from_nprd(
        self,
        component_id: uuid.UUID,
        data: NPRDDataCreate
    ) -> Tuple[float, float]:
        """
        Calculate eta from NPRD failure rate data with known beta.
        Priority: 7
        
        Relationship: eta = 1 / (lambda * Gamma(1 + 1/beta))
        """
        def _calculate():
            with get_session_context() as session:
                record = NPRDData(**data.model_dump(), id=uuid4())
                session.add(record)
                session.commit()

                eta = self._solve_nprd(data.failure_rate, data.beta)
                self._save_eta_beta_sync(
                    session, eta, data.beta, component_id, 7)
                return eta, data.beta

        return await self.async_service.run_in_thread(_calculate)

    def _solve_nprd(self, failure_rate: float, beta: float) -> float:
        """
        Calculate eta from failure rate using gamma function.
        
        For Weibull distribution:
        MTTF = eta * Gamma(1 + 1/beta)
        Also: MTTF = 1 / lambda (failure rate)
        Therefore: eta = 1 / (lambda * Gamma(1 + 1/beta))
        """
        try:
            gamma_param = (1.0 / beta) + 1.0

            # Calculate gamma function using scipy
            def integrand(x):
                return np.exp(-x) * (x ** (gamma_param - 1))

            gamma_value, _ = integrate.quad(integrand, 0, np.inf)

            eta = 1.0 / (failure_rate * gamma_value)

            if eta <= 0:
                raise ValueError("Invalid eta value")

            logger.info(f"NPRD calculation: eta={eta:.2f}, beta={beta:.2f}")
            return float(eta)

        except Exception as e:
            logger.error(f"NPRD calculation failed: {e}")
            raise EtaBetaCalculationError(f"NPRD calculation error: {str(e)}")

    # ==================== MLE ESTIMATION ====================

    def _mle_estimation(self, ttf_values: List[float]) -> Tuple[float, float]:
        """
        Maximum Likelihood Estimation for Weibull parameters.
        
        Used when we have actual TTF data points.
        """
        try:
            if len(ttf_values) < 2:
                raise ValueError("Need at least 2 TTF values")

            # Convert to numpy array
            data = np.array(ttf_values)

            # Initial guess
            beta_guess = 2.0
            eta_guess = np.mean(data)

            # MLE equations for Weibull
            def equations(params):
                beta, eta = params
                n = len(data)

                # Equation 1: derivative w.r.t. beta
                sum_t_beta = np.sum(data ** beta)
                sum_t_beta_ln = np.sum((data ** beta) * np.log(data))

                eq1 = n / beta + np.sum(np.log(data)) - \
                    (n * sum_t_beta_ln) / sum_t_beta

                # Equation 2: derivative w.r.t. eta
                eq2 = eta - (sum_t_beta / n) ** (1 / beta)

                return [eq1, eq2]

            # Solve
            beta, eta = fsolve(equations, (beta_guess, eta_guess))

            if eta <= 0 or beta <= 0:
                raise ValueError("Invalid parameter values from MLE")

            logger.info(f"MLE estimation: eta={eta:.2f}, beta={beta:.2f}")
            return float(eta), float(beta)

        except Exception as e:
            logger.error(f"MLE estimation failed: {e}")
            raise EtaBetaCalculationError(f"MLE error: {str(e)}")

    # ==================== TTF GENERATION ====================

    def _generate_ttf_points(
        self,
        eta: float,
        beta: float,
        num_points: int = 15
    ) -> List[float]:
        """Generate synthetic TTF points from Weibull distribution"""
        try:
            points = weibull_min.rvs(beta, loc=0, scale=eta, size=num_points)
            return points.tolist()
        except Exception as e:
            logger.error(f"TTF generation failed: {e}")
            return []

    async def save_ttf_data(
        self,
        component_id: uuid.UUID,
        ttf_values: List[float],
        priority: int,
        status: FailureStatusEnum = FailureStatusEnum.FAILURE
    ) -> List[TTFData]:
        """Save TTF data points to database"""
        def _save():
            with get_session_context() as session:
                records = []
                for hours in ttf_values:
                    record = TTFData(
                        id=uuid4(),
                        component_id=component_id,
                        hours=hours,
                        f_s=status,
                        priority=priority
                    )
                    session.add(record)
                    records.append(record)

                session.commit()
                logger.info(
                    f"Saved {len(records)} TTF points for component {component_id}")
                return records

        return await self.async_service.run_in_thread(_save)

    # ==================== HELPER METHODS ====================

    def _extract_ttf_from_actual_data_sync(
        self,
        session: Session,
        component_id: uuid.UUID
    ) -> List[float]:
        """Extract TTF values from actual data records"""
        statement = select(ActualData).where(
            ActualData.component_id == component_id
        )
        records = session.exec(statement).all()

        ttf_values = []
        for record in records:
            # Calculate time difference in hours (you may need to adjust based on your operational data)
            days = (record.interval_end_date -
                    record.interval_start_date).days
            # Assuming 24 hours/day operation
            hours = days * 24.0
            if hours > 0:
                ttf_values.append(hours)

        return ttf_values

    def _extract_ttf_from_interval_data_sync(
        self,
        session: Session,
        component_id: uuid.UUID
    ) -> List[float]:
        """Extract TTF values from interval data using mean dates"""
        statement = select(IntervalData).where(
            IntervalData.component_id == component_id
        )
        records = session.exec(statement).all()

        ttf_values = []
        for record in records:
            # Calculate mean installation date
            install_days = (record.installation_end_date -
                            record.installation_start_date).days
            mean_install = record.installation_start_date + \
                (install_days / 2)

            # Calculate mean removal date
            removal_days = (record.removal_end_date -
                            record.removal_start_date).days
            mean_removal = record.removal_start_date + (removal_days / 2)

            # Calculate TTF
            days = (mean_removal - mean_install).days
            hours = days * 24.0
            if hours > 0:
                ttf_values.append(hours)

        return ttf_values