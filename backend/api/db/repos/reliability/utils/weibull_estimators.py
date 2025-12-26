# ==================== reliability/utils/weibull_estimators.py ====================

"""
Pure Weibull distribution calculation functions.
All functions are stateless and have no side effects.
No database or async operations - just math.
"""

import numpy as np
from scipy.optimize import fsolve
from scipy import integrate
from scipy.stats import weibull_min
from typing import Tuple, List, Optional
import logging

logger = logging.getLogger(__name__)


class WeibullEstimationError(Exception):
    """Custom exception for Weibull estimation errors"""
    pass


def mle_estimation(ttf_values: List[float]) -> Tuple[float, float]:
    """
    Maximum Likelihood Estimation for Weibull parameters.
    Pure function - no side effects, no database access.
    
    Uses the MLE equations for Weibull distribution:
    - Equation 1: derivative w.r.t. beta = 0
    - Equation 2: derivative w.r.t. eta = 0
    
    Args:
        ttf_values: List of time-to-failure values in hours
        
    Returns:
        Tuple of (eta, beta) where:
        - eta: scale parameter (characteristic life)
        - beta: shape parameter
        
    Raises:
        WeibullEstimationError: If calculation fails or parameters are invalid
        
    Example:
        >>> ttf = [100, 150, 200, 250, 300]
        >>> eta, beta = mle_estimation(ttf)
        >>> print(f"eta={eta:.2f}, beta={beta:.2f}")
    """
    try:
        if len(ttf_values) < 2:
            raise ValueError("Need at least 2 TTF values for MLE estimation")

        data = np.array(ttf_values)
        
        # Check for non-positive values
        if np.any(data <= 0):
            raise ValueError("TTF values must be positive")

        # Initial guesses
        beta_guess = 2.0  # Common starting point
        eta_guess = np.mean(data)  # Mean as initial eta

        def equations(params):
            beta, eta = params
            n = len(data)
            
            # Avoid overflow/underflow
            with np.errstate(over='raise', invalid='raise'):
                sum_t_beta = np.sum(data ** beta)
                sum_t_beta_ln = np.sum((data ** beta) * np.log(data))
                
                # MLE equation 1: derivative w.r.t. beta
                eq1 = n / beta + np.sum(np.log(data)) - (n * sum_t_beta_ln) / sum_t_beta
                
                # MLE equation 2: derivative w.r.t. eta
                eq2 = eta - (sum_t_beta / n) ** (1 / beta)
                
            return [eq1, eq2]

        # Solve the system of equations
        beta, eta = fsolve(equations, (beta_guess, eta_guess))

        # Validate results
        if eta <= 0 or beta <= 0:
            raise ValueError(f"Invalid parameter values: eta={eta}, beta={beta}")
            
        if not np.isfinite(eta) or not np.isfinite(beta):
            raise ValueError("Non-finite parameter values obtained")

        logger.info(f"MLE estimation successful: eta={eta:.2f}, beta={beta:.2f}")
        return float(eta), float(beta)

    except Exception as e:
        logger.error(f"MLE estimation failed: {e}")
        raise WeibullEstimationError(f"MLE error: {str(e)}")


def solve_oem_life_estimates(
    l1: float,
    l2: float,
    l1_name: str,
    l2_name: str
) -> Tuple[float, float]:
    """
    Solve for eta and beta given two life estimates from OEM data.
    Pure function - no side effects.
    
    Common OEM reliability data provides two percentile points:
    - L10: 10% of units will have failed by this time
    - L90: 90% of units will have failed by this time
    
    Uses Weibull CDF: F(t) = 1 - exp(-(t/eta)^beta)
    Rearranged: ln(1/(1-F)) = (t/eta)^beta
    
    Args:
        l1: First life estimate value (e.g., 1000 hours for L10)
        l2: Second life estimate value (e.g., 5000 hours for L90)
        l1_name: First life estimate name (e.g., "L10")
        l2_name: Second life estimate name (e.g., "L90")
        
    Returns:
        Tuple of (eta, beta)
        
    Raises:
        WeibullEstimationError: If calculation fails
        
    Example:
        >>> eta, beta = solve_oem_life_estimates(1000, 5000, "L10", "L90")
    """
    try:
        # Extract percentile from name (e.g., "L10" -> 0.10)
        p1 = float(l1_name.replace("L", "").replace("B", "")) / 100
        p2 = float(l2_name.replace("L", "").replace("B", "")) / 100
        
        # Validate inputs
        if not (0 < p1 < 1 and 0 < p2 < 1):
            raise ValueError(f"Invalid percentiles: p1={p1}, p2={p2}")
        if p1 >= p2:
            raise ValueError(f"First percentile must be less than second: p1={p1}, p2={p2}")
        if l1 <= 0 or l2 <= 0:
            raise ValueError(f"Life estimates must be positive: l1={l1}, l2={l2}")
        if l1 >= l2:
            raise ValueError(f"First life estimate should be less than second: l1={l1}, l2={l2}")

        def equations(params):
            eta, beta = params
            # From Weibull CDF: -ln(1-F) = (t/eta)^beta
            # Rearranged: ln(-ln(1-F)) = beta*ln(t) - beta*ln(eta)
            eq1 = -((l1 / eta) ** beta) - np.log(1 - p1)
            eq2 = -((l2 / eta) ** beta) - np.log(1 - p2)
            return [eq1, eq2]

        # Initial guess based on data
        eta_guess = (l1 + l2) / 2
        beta_guess = 1.5
        
        eta, beta = fsolve(equations, (eta_guess, beta_guess))

        if eta <= 0 or beta <= 0:
            raise ValueError(f"Negative parameters obtained: eta={eta}, beta={beta}")
            
        if not np.isfinite(eta) or not np.isfinite(beta):
            raise ValueError("Non-finite parameter values obtained")

        logger.info(f"OEM calculation successful: eta={eta:.2f}, beta={beta:.2f}")
        return float(eta), float(beta)

    except Exception as e:
        logger.error(f"OEM calculation failed: {e}")
        raise WeibullEstimationError(f"OEM calculation error: {str(e)}")


def solve_expert_judgement(
    most_likely: float,
    min_life: float,
    max_life: float,
    life_estimate_val: Optional[float] = None,
    life_estimate_name: Optional[str] = None,
    num_components: Optional[int] = None,
    time_wo_failure: Optional[float] = None
) -> Tuple[float, float]:
    """
    Solve for eta/beta using expert judgement constraints.
    Pure function - no side effects.
    
    Expert judgement provides qualitative estimates that can be
    converted to Weibull parameters using various constraints:
    
    Constraints used:
    1. Life estimate: If provided (e.g., L10=1000)
    2. Min life: F(t_min) = 0.01 (99% will survive past this)
    3. Max life: F(t_max) = 0.99 (only 1% will survive past this)
    4. Most likely: Mode of Weibull distribution
    5. Zero-failure data: If components operated without failure
    
    Args:
        most_likely: Most likely failure time (mode)
        min_life: Minimum expected life
        max_life: Maximum expected life
        life_estimate_val: Optional life estimate value
        life_estimate_name: Optional life estimate name (e.g., "L10")
        num_components: Number of components in zero-failure test
        time_wo_failure: Time operated without failure
        
    Returns:
        Tuple of (eta, beta)
        
    Raises:
        WeibullEstimationError: If insufficient constraints or calculation fails
        
    Example:
        >>> eta, beta = solve_expert_judgement(
        ...     most_likely=2000,
        ...     min_life=500,
        ...     max_life=5000
        ... )
    """
    try:
        constraints = []

        # Constraint 1: From life estimate (if provided)
        if life_estimate_val and life_estimate_name:
            p = float(life_estimate_name.replace("L", "").replace("B", "")) / 100
            if 0 < p < 1:
                constraints.append(('life_estimate', life_estimate_val, p))

        # Constraint 2: Min life (99% survival)
        if min_life and min_life > 0:
            constraints.append(('min_life', min_life))

        # Constraint 3: Max life (1% survival)
        if max_life and max_life > 0:
            constraints.append(('max_life', max_life))

        # Constraint 4: Most likely (mode)
        if most_likely and most_likely > 0:
            constraints.append(('most_likely', most_likely))

        # Constraint 5: Zero failure data
        if num_components and time_wo_failure and num_components > 0 and time_wo_failure > 0:
            constraints.append(('zero_failure', num_components, time_wo_failure))

        # Need at least 2 constraints to solve for 2 unknowns
        if len(constraints) < 2:
            raise ValueError(f"Insufficient constraints for estimation. Got {len(constraints)}, need at least 2")

        # Select best 2 constraints (prioritize life_estimate and most_likely)
        selected = constraints[:2]
        logger.info(f"Using constraints: {[c[0] for c in selected]}")

        def equations(params):
            eta, beta = params
            eqs = []

            for constraint in selected:
                if constraint[0] == 'life_estimate':
                    _, val, p = constraint
                    # From Weibull CDF
                    eqs.append(-((val / eta) ** beta) - np.log(1 - p))

                elif constraint[0] == 'min_life':
                    _, val = constraint
                    # F(t_min) = 0.01 => R(t_min) = 0.99
                    eqs.append(0.99 - np.exp(-((val / eta) ** beta)))

                elif constraint[0] == 'max_life':
                    _, val = constraint
                    # F(t_max) = 0.99 => R(t_max) = 0.01
                    eqs.append(0.01 - np.exp(-((val / eta) ** beta)))

                elif constraint[0] == 'most_likely':
                    _, val = constraint
                    # Mode of Weibull: eta * ((beta-1)/beta)^(1/beta) for beta > 1
                    if beta > 1:
                        mode = eta * (((beta - 1) / beta) ** (1 / beta))
                        eqs.append(mode - val)
                    else:
                        # For beta <= 1, mode is at t=0, use eta as fallback
                        eqs.append(eta - val)

                elif constraint[0] == 'zero_failure':
                    _, n, t = constraint
                    # Zero-failure reliability constraint
                    # Using 90% confidence level
                    cl = 0.9
                    P = (1 - cl) ** (1 / n)
                    R_calc = np.exp(-((t / eta) ** beta))
                    eqs.append(R_calc - P)

            return eqs

        # Initial guess based on most_likely or average of min/max
        if most_likely:
            eta_guess = most_likely
        else:
            eta_guess = (min_life + max_life) / 2 if min_life and max_life else 1000.0
        
        beta_guess = 2.0  # Common shape parameter

        eta, beta = fsolve(equations, (eta_guess, beta_guess))

        # Validate results
        if eta <= 0 or beta <= 0:
            raise ValueError(f"Invalid parameter values: eta={eta}, beta={beta}")
            
        if not np.isfinite(eta) or not np.isfinite(beta):
            raise ValueError("Non-finite parameter values obtained")

        logger.info(f"Expert estimation successful: eta={eta:.2f}, beta={beta:.2f}")
        return float(eta), float(beta)

    except Exception as e:
        logger.error(f"Expert calculation failed: {e}")
        raise WeibullEstimationError(f"Expert calculation error: {str(e)}")


def solve_probability_failure(
    time_probability_pairs: List[Tuple[float, float]]
) -> Tuple[float, float]:
    """
    Linear regression method for Weibull parameter estimation.
    Pure function - no side effects.
    
    Uses Weibull probability plotting method:
    Transform: F(t) = 1 - exp(-(t/eta)^beta)
    Taking double logarithm: ln(ln(1/(1-F))) = beta * ln(t) - beta * ln(eta)
    
    This creates a linear relationship:
    y = mx + c where:
    - y = ln(ln(1/(1-F)))
    - x = ln(t)
    - m = beta (slope)
    - c = -beta * ln(eta) (intercept)
    
    Args:
        time_probability_pairs: List of (time, failure_probability_percent) tuples
                               e.g., [(100, 10.5), (200, 25.3), (300, 45.8)]
        
    Returns:
        Tuple of (eta, beta)
        
    Raises:
        WeibullEstimationError: If insufficient data or calculation fails
        
    Example:
        >>> data = [(100, 10), (200, 30), (300, 50), (400, 70), (500, 85)]
        >>> eta, beta = solve_probability_failure(data)
    """
    try:
        if len(time_probability_pairs) < 2:
            raise ValueError(f"Need at least 2 data points, got {len(time_probability_pairs)}")

        x_data = []  # ln(time)
        y_data = []  # ln(ln(1/(1-F)))

        for t, failure_p in time_probability_pairs:
            # Convert percentage to decimal
            F = failure_p / 100.0

            # Validate probability
            if F <= 0 or F >= 1:
                logger.warning(f"Skipping invalid probability: F={F} (must be 0 < F < 1)")
                continue
                
            # Validate time
            if t <= 0:
                logger.warning(f"Skipping invalid time: t={t} (must be positive)")
                continue

            # Calculate transformed values
            x_data.append(np.log(t))
            y_data.append(np.log(-np.log(1 - F)))

        if len(x_data) < 2:
            raise ValueError(f"Insufficient valid data points after filtering: {len(x_data)}")

        # Convert to numpy arrays for linear regression
        x_arr = np.array(x_data)
        y_arr = np.array(y_data)

        # Linear regression: y = mx + c
        # Calculate slope (beta) and intercept using least squares
        n = len(x_arr)
        sum_x = np.sum(x_arr)
        sum_y = np.sum(y_arr)
        sum_xy = np.sum(x_arr * y_arr)
        sum_x2 = np.sum(x_arr ** 2)

        # Slope (beta)
        denominator = n * sum_x2 - sum_x ** 2
        if abs(denominator) < 1e-10:
            raise ValueError("Cannot perform linear regression - degenerate case")
            
        beta = (n * sum_xy - sum_x * sum_y) / denominator
        
        # Intercept
        intercept = (sum_y - beta * sum_x) / n

        # Calculate eta from intercept: c = -beta * ln(eta)
        # Therefore: eta = exp(-c / beta)
        eta = np.exp(-intercept / beta)

        # Validate results
        if eta <= 0 or beta <= 0:
            raise ValueError(f"Invalid parameter values: eta={eta}, beta={beta}")
            
        if not np.isfinite(eta) or not np.isfinite(beta):
            raise ValueError("Non-finite parameter values obtained")

        logger.info(f"Probability failure estimation successful: eta={eta:.2f}, beta={beta:.2f}")
        return float(eta), float(beta)

    except Exception as e:
        logger.error(f"Probability failure calculation failed: {e}")
        raise WeibullEstimationError(f"Probability calculation error: {str(e)}")


def solve_nprd(failure_rate: float, beta: float) -> float:
    """
    Calculate eta from NPRD failure rate with known beta.
    Pure function - no side effects.
    
    NPRD (Nonelectronic Parts Reliability Data) provides failure rates.
    Relationship between failure rate (lambda) and Weibull parameters:
    
    MTTF = eta * Gamma(1 + 1/beta)
    Also: MTTF = 1 / lambda
    Therefore: eta = 1 / (lambda * Gamma(1 + 1/beta))
    
    Args:
        failure_rate: NPRD failure rate (lambda) in failures per hour
        beta: Known shape parameter (typically from similar components)
        
    Returns:
        Calculated eta value (scale parameter)
        
    Raises:
        WeibullEstimationError: If calculation fails
        
    Example:
        >>> eta = solve_nprd(failure_rate=0.0001, beta=2.5)
        >>> print(f"eta={eta:.2f} hours")
    """
    try:
        # Validate inputs
        if failure_rate <= 0:
            raise ValueError(f"Failure rate must be positive: {failure_rate}")
        if beta <= 0:
            raise ValueError(f"Beta must be positive: {beta}")

        # Calculate gamma function parameter
        gamma_param = (1.0 / beta) + 1.0

        # Calculate gamma function using numerical integration
        def integrand(x):
            return np.exp(-x) * (x ** (gamma_param - 1))

        gamma_value, error = integrate.quad(integrand, 0, np.inf)
        
        if error > 0.01 * gamma_value:  # Check integration accuracy
            logger.warning(f"Gamma function integration may be inaccurate. Error: {error}")

        # Calculate eta
        eta = 1.0 / (failure_rate * gamma_value)

        # Validate result
        if eta <= 0:
            raise ValueError(f"Invalid eta value: {eta}")
            
        if not np.isfinite(eta):
            raise ValueError("Non-finite eta value obtained")

        logger.info(f"NPRD calculation successful: eta={eta:.2f}, beta={beta:.2f}")
        return float(eta)

    except Exception as e:
        logger.error(f"NPRD calculation failed: {e}")
        raise WeibullEstimationError(f"NPRD calculation error: {str(e)}")


def generate_ttf_points(
    eta: float,
    beta: float,
    num_points: int = 15,
    random_seed: Optional[int] = None
) -> List[float]:
    """
    Generate synthetic time-to-failure points from Weibull distribution.
    Pure function - deterministic if seed is provided.
    
    Useful for:
    - Testing reliability models
    - Generating training data
    - Monte Carlo simulations
    - Visualizing Weibull distributions
    
    Args:
        eta: Scale parameter (characteristic life)
        beta: Shape parameter
        num_points: Number of points to generate
        random_seed: Optional seed for reproducibility
        
    Returns:
        List of TTF values in ascending order
        
    Raises:
        WeibullEstimationError: If generation fails
        
    Example:
        >>> ttf = generate_ttf_points(eta=1000, beta=2.5, num_points=10, random_seed=42)
        >>> print(f"Generated {len(ttf)} TTF points")
    """
    try:
        # Validate inputs
        if eta <= 0 or beta <= 0:
            raise ValueError(f"Parameters must be positive: eta={eta}, beta={beta}")
        if num_points <= 0:
            raise ValueError(f"Number of points must be positive: {num_points}")

        # Set random seed for reproducibility if provided
        if random_seed is not None:
            np.random.seed(random_seed)

        # Generate random variates from Weibull distribution
        # scipy.stats.weibull_min uses: F(x) = 1 - exp(-(x/scale)^shape)
        points = weibull_min.rvs(
            c=beta,        # shape parameter
            loc=0,         # location (always 0 for standard Weibull)
            scale=eta,     # scale parameter
            size=num_points
        )

        # Sort points for easier visualization
        points_sorted = np.sort(points)
        
        # Validate generated points
        if np.any(points_sorted <= 0):
            raise ValueError("Generated non-positive TTF values")
        if not np.all(np.isfinite(points_sorted)):
            raise ValueError("Generated non-finite TTF values")

        logger.info(f"Generated {num_points} TTF points: min={points_sorted[0]:.2f}, max={points_sorted[-1]:.2f}")
        return points_sorted.tolist()

    except Exception as e:
        logger.error(f"TTF generation failed: {e}")
        raise WeibullEstimationError(f"TTF generation error: {str(e)}")

