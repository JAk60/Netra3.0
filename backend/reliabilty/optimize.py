from fastapi import HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Tuple, Optional
import asyncio
import math
import scipy.integrate as integrate
from scipy.optimize import minimize, OptimizeResult
from scipy.stats import weibull_min
import numpy as np
import sympy as sp
from dataclasses import dataclass
from enum import Enum

# Constants
MIN_BOUND = 1.0
MAX_ITERATIONS = 1000
INTEGRATION_TOLERANCE = 1e-8
MAX_COMPONENTS = 100
NUMERICAL_EPSILON = 1e-10

class OptimizationMethod(Enum):
    AGE_BASED = 'age_based'
    DOWNTIME_BASED = 'downtime_based'
    COMPONENT_GROUP = 'component_group'
    DOWNTIME_COMPONENT_GROUP = 'downtime_component_group'
    CALENDAR_TIME = 'calendar_time'
    RISK_TARGET = 'risk_target'
    CALENDAR_DOWNTIME = 'calender_downtime'

class ValidationError(Exception):
    pass

class OptimizationError(Exception):
    pass

@dataclass
class WeibullParams:
    beta: float
    eta: float
    
    def __post_init__(self):
        if self.beta <= 0:
            raise ValidationError(f"Beta must be positive, got {self.beta}")
        if self.eta <= 0:
            raise ValidationError(f"Eta must be positive, got {self.eta}")

class WeibullCalculator:
    def __init__(self, beta: float, eta: float):
        self.beta = beta
        self.eta = eta
    
    def reliability(self, t: float) -> float:
        if t < 0:
            raise ValidationError(f"Time must be non-negative, got {t}")
        exponent = -(t / self.eta) ** self.beta
        if exponent < -700:
            return 0.0
        return math.exp(exponent)
    
    def failure_prob(self, t: float) -> float:
        return 1 - self.reliability(t)
    
    def pdf(self, t: float) -> float:
        if t <= 0:
            return 0.0
        return (self.beta / self.eta) * ((t / self.eta) ** (self.beta - 1)) * self.reliability(t)
    
    def expected_value(self) -> float:
        weibull_dist = weibull_min(self.beta, scale=self.eta)
        return weibull_dist.expect(lambda x: x)
    
    def reliability_integral(self, t: float) -> float:
        if t <= 0:
            return 0.0
        result, error = integrate.quad(self.reliability, 0, t, limit=MAX_ITERATIONS, epsabs=INTEGRATION_TOLERANCE)
        if error > INTEGRATION_TOLERANCE:
            raise OptimizationError(f"Integration error too large: {error}")
        return result
    
    def renewal_integral(self, t: float) -> float:
        if t <= NUMERICAL_EPSILON:
            return 0.0
        
        def integrand(x):
            if x >= t or x < 0:
                return 0.0
            failure_val = self.failure_prob(t - x)
            denominator = 1 - (0.5 * failure_val)
            if abs(denominator) < NUMERICAL_EPSILON:
                return 0.0
            return (failure_val / denominator) * self.pdf(x)
        
        result, error = integrate.quad(integrand, 0, t, limit=MAX_ITERATIONS, epsabs=INTEGRATION_TOLERANCE)
        if error > INTEGRATION_TOLERANCE:
            raise OptimizationError(f"Renewal integration error too large: {error}")
        return result

class SystemComponent:
    def __init__(self, eta: float, beta: float, cost: float = 0.0, repair_time: float = 0.0, component_id: Optional[str] = None):
        self.calc = WeibullCalculator(beta, eta)
        self.cost = cost
        self.repair_time = repair_time
        self.component_id = component_id
        
        if cost < 0:
            raise ValidationError(f"Cost must be non-negative, got {cost}")
        if repair_time < 0:
            raise ValidationError(f"Repair time must be non-negative, got {repair_time}")

class InputValidator:
    @staticmethod
    def validate_positive(value: float, name: str) -> float:
        if value is None:
            raise ValidationError(f"{name} is required")
        if value <= 0:
            raise ValidationError(f"{name} must be positive, got {value}")
        return value
    
    @staticmethod
    def validate_non_negative(value: float, name: str) -> float:
        if value is None:
            raise ValidationError(f"{name} is required")
        if value < 0:
            raise ValidationError(f"{name} must be non-negative, got {value}")
        return value
    
    @staticmethod
    def validate_weibull_params(data: Dict[str, Any]) -> WeibullParams:
        beta = data.get('beta')
        eta = data.get('eeta') or data.get('eta')
        
        if beta is None or eta is None:
            raise ValidationError("Both beta and eta are required")
        
        try:
            beta = float(beta)
            eta = float(eta)
        except (ValueError, TypeError):
            raise ValidationError("Beta and eta must be numeric values")
        
        return WeibullParams(beta, eta)
    
    @staticmethod
    def validate_component_count(n: int) -> int:
        if n is None:
            raise ValidationError("Number of components (n) is required")
        try:
            n = int(n)
        except (ValueError, TypeError):
            raise ValidationError("Number of components must be an integer")
        
        if n <= 0:
            raise ValidationError(f"Number of components must be positive, got {n}")
        if n > MAX_COMPONENTS:
            raise ValidationError(f"Number of components exceeds maximum ({MAX_COMPONENTS}), got {n}")
        return n

class OptimizerService:
    def __init__(self, eta_beta_repo=None):
        self.eta_beta_repo = eta_beta_repo
    
    async def _get_weibull_params(self, data: Dict[str, Any]) -> WeibullParams:
        asset_id = data.get('asset_id')
        if self.eta_beta_repo and asset_id:
            params = await self.eta_beta_repo.get_by_component_id(asset_id)
            if not params:
                raise ValidationError(f"No Weibull parameters found for asset_id: {asset_id}")
            return WeibullParams(params.beta, params.eta)
        
        return InputValidator.validate_weibull_params(data)
    
    async def _parse_components(self, data: Dict[str, Any]) -> List[SystemComponent]:
        """Parse components from request data - supports both formats"""
        components = []
        
        # Format 1: List of components (new format)
        if 'components' in data:
            component_list = data.get('components', [])
            if not isinstance(component_list, list):
                raise ValidationError("Components must be a list")
            
            if len(component_list) > MAX_COMPONENTS:
                raise ValidationError(f"Number of components exceeds maximum ({MAX_COMPONENTS}), got {len(component_list)}")
            
            for idx, comp_data in enumerate(component_list, 1):
                # Support both component_id and asset_id
                identifier = comp_data.get('component_id') or comp_data.get('asset_id')
                
                # Fetch from repository using identifier
                if self.eta_beta_repo and identifier:
                    # Try component_id first
                    params_list = await self.eta_beta_repo.get_by_component_id(identifier)
                    
                    # If not found, try asset_id
                    if not params_list or len(params_list) == 0:
                        single_param = await self.eta_beta_repo.get_by_component_id(identifier)
                        if single_param:
                            params_list = [single_param]
                    
                    if not params_list or len(params_list) == 0:
                        raise ValidationError(f"No Weibull parameters found for component {idx} with id: {identifier}")
                    
                    # Use the highest priority parameter (priority field exists in schema)
                    if hasattr(params_list[0], 'priority'):
                        params = max(params_list, key=lambda p: p.priority)
                    else:
                        params = params_list[0]
                        
                    eta, beta = params.eta, params.beta
                else:
                    # Fallback: Get from direct input (for testing or when repo unavailable)
                    eta = comp_data.get('eeta') or comp_data.get('eta')
                    beta = comp_data.get('beta')
                    
                    if eta is None or beta is None:
                        raise ValidationError(f"Component {idx} missing component_id/asset_id or eta/beta")
                    
                    try:
                        eta = float(eta)
                        beta = float(beta)
                    except (ValueError, TypeError):
                        raise ValidationError(f"Component {idx} eta and beta must be numeric")
                
                cost = float(comp_data.get('cost', 0) or comp_data.get('c', 0))
                repair_time = float(comp_data.get('repair_time', 0) or comp_data.get('rt', 0))
                
                components.append(SystemComponent(eta, beta, cost, repair_time, identifier))
        
        # Format 2: Legacy numbered format (component_1_component_id, component_2_component_id, etc.)
        elif 'n' in data:
            n = InputValidator.validate_component_count(data.get('n'))
            
            for i in range(n):
                prefix = f'component_{i+1}'
                identifier = data.get(f'{prefix}_component_id') or data.get(f'{prefix}_asset_id')
                
                # Try to fetch from repository if identifier provided
                if self.eta_beta_repo and identifier:
                    # Try component_id first
                    params_list = await self.eta_beta_repo.get_by_component_id(identifier)
                    
                    # If not found, try asset_id
                    if not params_list or len(params_list) == 0:
                        single_param = await self.eta_beta_repo.get_by_component_id(identifier)
                        if single_param:
                            params_list = [single_param]
                    
                    if not params_list or len(params_list) == 0:
                        raise ValidationError(f"No Weibull parameters found for component {i+1} id: {identifier}")
                    
                    # Use highest priority parameter
                    if hasattr(params_list[0], 'priority'):
                        params = max(params_list, key=lambda p: p.priority)
                    else:
                        params = params_list[0]
                        
                    eta, beta = params.eta, params.beta
                else:
                    eta = data.get(f'{prefix}_eeta') or data.get(f'{prefix}_eta')
                    beta = data.get(f'{prefix}_beta')
                    
                    if eta is None or beta is None:
                        raise ValidationError(f"Missing component_id/asset_id or eta/beta for component {i+1}")
                    
                    try:
                        eta = float(eta)
                        beta = float(beta)
                    except (ValueError, TypeError):
                        raise ValidationError(f"Component {i+1} eta and beta must be numeric")
                
                cost = float(data.get(f'{prefix}_c', 0))
                repair_time = float(data.get(f'{prefix}_rt', 0))
                
                components.append(SystemComponent(eta, beta, cost, repair_time, identifier))
        
        else:
            raise ValidationError("Either 'components' list or 'n' with component_N_* parameters required")
        
        if not components:
            raise ValidationError("No components provided")
        
        return components
    
    async def _safe_minimize(self, objective, t_initial: float, bounds: List[Tuple[float, float]]) -> OptimizeResult:
        if bounds[0][0] >= bounds[0][1]:
            raise ValidationError(f"Invalid bounds: lower bound {bounds[0][0]} >= upper bound {bounds[0][1]}")
        
        loop = asyncio.get_event_loop()
        
        try:
            result = await loop.run_in_executor(
                None,
                lambda: minimize(objective, t_initial, bounds=bounds, method='L-BFGS-B', options={'maxiter': MAX_ITERATIONS})
            )
            
            if not result.success:
                raise OptimizationError(f"Optimization failed: {result.message}")
            
            if abs(result.x[0] - bounds[0][0]) < NUMERICAL_EPSILON:
                raise OptimizationError("Optimization converged to lower bound")
            if abs(result.x[0] - bounds[0][1]) < NUMERICAL_EPSILON:
                raise OptimizationError("Optimization converged to upper bound")
            
            if not np.isfinite(result.fun) or not np.isfinite(result.x[0]):
                raise OptimizationError("Optimization resulted in non-finite values")
            
            return result
        except Exception as e:
            if isinstance(e, (ValidationError, OptimizationError)):
                raise
            raise OptimizationError(f"Optimization error: {str(e)}")
    
    async def optimize_age_based(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Age-based replacement - now supports multiple components"""
        cf = InputValidator.validate_positive(float(data.get('cf')), 'cf')
        cp = InputValidator.validate_positive(float(data.get('cp')), 'cp')
        
        # Support single component (legacy) or multiple components
        if 'components' in data or 'n' in data:
            components = await self._parse_components(data)
            
            def objective(t):
                t = t[0] if isinstance(t, np.ndarray) else t
                total_cost = 0
                total_integral = 0
                
                for comp in components:
                    rel = comp.calc.reliability(t)
                    if rel <= NUMERICAL_EPSILON:
                        return float('inf')
                    integral = comp.calc.reliability_integral(t)
                    if integral <= NUMERICAL_EPSILON:
                        return float('inf')
                    
                    total_cost += cf * (1 - rel) + cp * rel
                    total_integral += integral
                
                return total_cost / total_integral
            
            max_expected = max(c.calc.expected_value() for c in components)
            max_eta = max(c.calc.eta for c in components)
            bounds = [(MIN_BOUND, min(10 * max_eta, 10 * max_expected))]
            result = await self._safe_minimize(objective, max_expected / 2, bounds)
            
            return {
                't': result.x[0], 
                'objective_value': result.fun,
                'components': [
                    {
                        'component_id': comp.component_id,
                        'eta': comp.calc.eta,
                        'beta': comp.calc.beta,
                        't': result.x[0],
                        'objective_value': result.fun
                    }
                    for comp in components
                ]
            }
        else:
            # Single component (legacy format)
            params = await self._get_weibull_params(data)
            calc = WeibullCalculator(params.beta, params.eta)
            
            def objective(t):
                t = t[0] if isinstance(t, np.ndarray) else t
                rel = calc.reliability(t)
                if rel <= NUMERICAL_EPSILON:
                    return float('inf')
                integral = calc.reliability_integral(t)
                if integral <= NUMERICAL_EPSILON:
                    return float('inf')
                return (cf * (1 - rel) + cp * rel) / integral
            
            expected = calc.expected_value()
            bounds = [(MIN_BOUND, min(10 * params.eta, 10 * expected))]
            result = await self._safe_minimize(objective, expected / 2, bounds)
            
            return {
                't': result.x[0], 
                'objective_value': result.fun,
                'eta': params.eta,
                'beta': params.beta
            }
    
    async def optimize_downtime_based(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Downtime-based replacement - now supports multiple components"""
        df = InputValidator.validate_positive(float(data.get('df')), 'df')
        dp = InputValidator.validate_positive(float(data.get('dp')), 'dp')
        
        if 'components' in data or 'n' in data:
            components = await self._parse_components(data)
            
            def objective(t):
                t = t[0] if isinstance(t, np.ndarray) else t
                total_downtime = 0
                total_integral = 0
                
                for comp in components:
                    rel = comp.calc.reliability(t)
                    integral = comp.calc.reliability_integral(t)
                    if integral <= NUMERICAL_EPSILON:
                        return float('inf')
                    
                    total_downtime += df * (1 - rel) + dp * rel
                    total_integral += integral
                
                return total_downtime / total_integral
            
            max_expected = max(c.calc.expected_value() for c in components)
            max_eta = max(c.calc.eta for c in components)
            bounds = [(MIN_BOUND, min(10 * max_eta, 10 * max_expected))]
            result = await self._safe_minimize(objective, max_expected / 2, bounds)
            
            return {
                't': result.x[0], 
                'objective_value': result.fun,
                'components': [
                    {
                        'component_id': comp.component_id,
                        'eta': comp.calc.eta,
                        'beta': comp.calc.beta,
                        't': result.x[0],
                        'objective_value': result.fun
                    }
                    for comp in components
                ]
            }
        else:
            params = await self._get_weibull_params(data)
            calc = WeibullCalculator(params.beta, params.eta)
            
            def objective(t):
                t = t[0] if isinstance(t, np.ndarray) else t
                rel = calc.reliability(t)
                integral = calc.reliability_integral(t)
                if integral <= NUMERICAL_EPSILON:
                    return float('inf')
                return (df * (1 - rel) + dp * rel) / integral
            
            expected = calc.expected_value()
            bounds = [(MIN_BOUND, min(10 * params.eta, 10 * expected))]
            result = await self._safe_minimize(objective, expected / 2, bounds)
            
            return {
                't': result.x[0], 
                'objective_value': result.fun,
                'eta': params.eta,
                'beta': params.beta
            }
    
    async def optimize_component_group(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Component group optimization"""
        pmdt = InputValidator.validate_non_negative(float(data.get('pmdt')), 'pmdt')
        cpm = InputValidator.validate_non_negative(float(data.get('cpm')), 'cpm')
        cf = InputValidator.validate_positive(float(data.get('cf')), 'cf')
        
        components = await self._parse_components(data)
        
        def objective(t):
            t = t[0] if isinstance(t, np.ndarray) else t
            if t <= NUMERICAL_EPSILON:
                return float('inf')
            
            total = pmdt * cpm + sum(c.cost for c in components)
            for comp in components:
                failure = comp.calc.failure_prob(t)
                renewal = comp.calc.renewal_integral(t)
                total += (failure + renewal) * (comp.cost + comp.repair_time * cf)
            
            return total / t
        
        max_expected = max(c.calc.expected_value() for c in components)
        bounds = [(MIN_BOUND, max_expected)]
        result = await self._safe_minimize(objective, max_expected / 2, bounds)
        
        return {
            't': result.x[0], 
            'objective_value': result.fun,
            'components': [
                {
                    'component_id': comp.component_id,
                    'eta': comp.calc.eta,
                    'beta': comp.calc.beta,
                    't': result.x[0],
                    'objective_value': result.fun
                }
                for comp in components
            ]
        }
    
    async def optimize_downtime_component_group(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Downtime component group optimization"""
        pmdt = InputValidator.validate_non_negative(float(data.get('pmdt')), 'pmdt')
        
        components = await self._parse_components(data)
        
        def objective(t):
            t = t[0] if isinstance(t, np.ndarray) else t
            if t <= NUMERICAL_EPSILON:
                return float('inf')
            
            total = pmdt
            for comp in components:
                failure = comp.calc.failure_prob(t)
                renewal = comp.calc.renewal_integral(t)
                total += (failure + renewal) * comp.repair_time
            
            return total / t
        
        max_expected = max(c.calc.expected_value() for c in components)
        bounds = [(MIN_BOUND, min(max_expected, 10000))]
        result = await self._safe_minimize(objective, max_expected / 2, bounds)
        
        return {
            't': result.x[0], 
            'objective_value': result.fun,
            'components': [
                {
                    'component_id': comp.component_id,
                    'eta': comp.calc.eta,
                    'beta': comp.calc.beta,
                    't': result.x[0],
                    'objective_value': result.fun
                }
                for comp in components
            ]
        }
    
    async def optimize_calendar_time(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calendar time-based optimization - now supports multiple components"""
        cf = InputValidator.validate_positive(float(data.get('cf')), 'cf')
        cp = InputValidator.validate_positive(float(data.get('cp')), 'cp')
        
        if 'components' in data or 'n' in data:
            components = await self._parse_components(data)
            
            def objective(t):
                t = t[0] if isinstance(t, np.ndarray) else t
                if t <= NUMERICAL_EPSILON:
                    return float('inf')
                
                total_cost = 0
                for comp in components:
                    failure = comp.calc.failure_prob(t)
                    renewal = comp.calc.renewal_integral(t)
                    total_cost += cp + cf * (failure + renewal)
                
                return total_cost / t
            
            max_expected = max(c.calc.expected_value() for c in components)
            bounds = [(MIN_BOUND, max_expected)]
            result = await self._safe_minimize(objective, max_expected / 2, bounds)
            
            return {
                't': result.x[0], 
                'objective_value': result.fun,
                'components': [
                    {
                        'component_id': comp.component_id,
                        'eta': comp.calc.eta,
                        'beta': comp.calc.beta,
                        't': result.x[0],
                        'objective_value': result.fun
                    }
                    for comp in components
                ]
            }
        else:
            params = await self._get_weibull_params(data)
            calc = WeibullCalculator(params.beta, params.eta)
            expected = calc.expected_value()
            
            def objective(t):
                t = t[0] if isinstance(t, np.ndarray) else t
                if t <= NUMERICAL_EPSILON:
                    return float('inf')
                
                failure = calc.failure_prob(t)
                renewal = calc.renewal_integral(t)
                return (cp + cf * (failure + renewal)) / t
            
            bounds = [(MIN_BOUND, expected)]
            result = await self._safe_minimize(objective, expected / 2, bounds)
            
            return {
                't': result.x[0], 
                'objective_value': result.fun,
                'eta': params.eta,
                'beta': params.beta
            }
    
    async def optimize_calendar_downtime(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calendar downtime-based optimization - now supports multiple components"""
        df = InputValidator.validate_positive(float(data.get('df')), 'df')
        dp = InputValidator.validate_positive(float(data.get('dp')), 'dp')
        
        if 'components' in data or 'n' in data:
            components = await self._parse_components(data)
            
            def objective(t):
                t = t[0] if isinstance(t, np.ndarray) else t
                if t <= NUMERICAL_EPSILON:
                    return float('inf')
                
                total_downtime = 0
                for comp in components:
                    failure = comp.calc.failure_prob(t)
                    renewal = comp.calc.renewal_integral(t)
                    total_downtime += dp + df * (failure + renewal)
                
                return total_downtime / t
            
            max_expected = max(c.calc.expected_value() for c in components)
            bounds = [(MIN_BOUND, max_expected)]
            result = await self._safe_minimize(objective, max_expected / 2, bounds)
            
            return {
                't': result.x[0], 
                'objective_value': result.fun,
                'components': [
                    {
                        'component_id': comp.component_id,
                        'eta': comp.calc.eta,
                        'beta': comp.calc.beta,
                        't': result.x[0],
                        'objective_value': result.fun
                    }
                    for comp in components
                ]
            }
        else:
            params = await self._get_weibull_params(data)
            calc = WeibullCalculator(params.beta, params.eta)
            expected = calc.expected_value()
            
            def objective(t):
                t = t[0] if isinstance(t, np.ndarray) else t
                if t <= NUMERICAL_EPSILON:
                    return float('inf')
                
                failure = calc.failure_prob(t)
                renewal = calc.renewal_integral(t)
                return (dp + df * (failure + renewal)) / t
            
            bounds = [(MIN_BOUND, expected)]
            result = await self._safe_minimize(objective, expected / 2, bounds)
            
            return {
                't': result.x[0], 
                'objective_value': result.fun,
                'eta': params.eta,
                'beta': params.beta
            }
    
    async def calculate_risk_target(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate time values for given risk probabilities - supports multiple components"""
        p_values = data.get('p_values', [0.8, 0.85, 0.9, 0.95])
        
        for p in p_values:
            if not 0 < p < 1:
                raise ValidationError(f"Probability must be between 0 and 1, got {p}")
        
        if 'components' in data or 'n' in data:
            components = await self._parse_components(data)
            results = []
            
            for comp in components:
                loop = asyncio.get_event_loop()
                
                async def solve_for_p(p: float, component: SystemComponent) -> float:
                    def _solve():
                        t = sp.Symbol('t', positive=True, real=True)
                        equation = sp.Eq(1 - sp.exp(-((t / component.calc.eta) ** component.calc.beta)) - p, 0)
                        initial_guess = component.calc.eta * (-math.log(1 - p)) ** (1 / component.calc.beta)
                        return float(sp.nsolve(equation, t, initial_guess, solver='mnewton'))
                    
                    try:
                        return await loop.run_in_executor(None, _solve)
                    except Exception as e:
                        raise OptimizationError(f"Failed to solve for p={p}: {str(e)}")
                
                t_values = await asyncio.gather(*[solve_for_p(p, comp) for p in p_values])
                results.append({
                    'component_id': comp.component_id,
                    'eta': comp.calc.eta,
                    'beta': comp.calc.beta,
                    't_values': list(t_values),
                    'p_values': p_values
                })
            
            return {'components': results}
        else:
            params = await self._get_weibull_params(data)
            loop = asyncio.get_event_loop()
            
            async def solve_for_p(p: float) -> float:
                def _solve():
                    t = sp.Symbol('t', positive=True, real=True)
                    equation = sp.Eq(1 - sp.exp(-((t / params.eta) ** params.beta)) - p, 0)
                    initial_guess = params.eta * (-math.log(1 - p)) ** (1 / params.beta)
                    return float(sp.nsolve(equation, t, initial_guess, solver='mnewton'))
                
                try:
                    return await loop.run_in_executor(None, _solve)
                except Exception as e:
                    raise OptimizationError(f"Failed to solve for p={p}: {str(e)}")
            
            t_values = await asyncio.gather(*[solve_for_p(p) for p in p_values])
            
            return {
                'eta': params.eta,
                'beta': params.beta,
                't': list(t_values), 
                'p_values': p_values
            }

async def optimizer(data: Dict[str, Any], eta_beta_repo=None):
    try:
        if not data:
            raise HTTPException(status_code=400, detail='No data provided')
        
        method = data.get('method')
        if not method:
            raise HTTPException(status_code=400, detail='Method is required')
        
        try:
            opt_method = OptimizationMethod(method)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f'Invalid method. Must be one of: {[m.value for m in OptimizationMethod]}'
            )
        
        service = OptimizerService(eta_beta_repo)
        
        if opt_method == OptimizationMethod.AGE_BASED:
            result = await service.optimize_age_based(data)
        elif opt_method == OptimizationMethod.DOWNTIME_BASED:
            result = await service.optimize_downtime_based(data)
        elif opt_method == OptimizationMethod.COMPONENT_GROUP:
            result = await service.optimize_component_group(data)
        elif opt_method == OptimizationMethod.DOWNTIME_COMPONENT_GROUP:
            result = await service.optimize_downtime_component_group(data)
        elif opt_method == OptimizationMethod.CALENDAR_TIME:
            result = await service.optimize_calendar_time(data)
        elif opt_method == OptimizationMethod.CALENDAR_DOWNTIME:
            result = await service.optimize_calendar_downtime(data)
        elif opt_method == OptimizationMethod.RISK_TARGET:
            result = await service.calculate_risk_target(data)
        
        return JSONResponse(content=result, status_code=200)
        
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f'Validation error: {str(e)}')
    except OptimizationError as e:
        raise HTTPException(status_code=422, detail=f'Optimization error: {str(e)}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Internal server error: {str(e)}')