import logging
import math
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
import uuid



# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class Equipment:
    """Represents a single piece of equipment"""
    id: str
    name: str
    nomenclature: str
    alpha: Optional[float] = None
    beta: Optional[float] = None
    current_age: float = 0.0
    
    def __repr__(self):
        return f"Equipment({self.nomenclature}, age={self.current_age:.1f}h)"


@dataclass
class System:
    """Represents a ship system (propulsion, power, support, firing)"""
    system_id: str
    name: str
    equipment: List[Equipment] = field(default_factory=list)
    
    def __repr__(self):
        return f"System({self.name}, {len(self.equipment)} equipment)"


@dataclass
class PhaseRequirement:
    """K-out-of-N requirement for a system in a specific phase"""
    k: int  # Minimum required
    n: int  # Total available
    
    @property
    def is_required(self) -> bool:
        return self.k > 0
    
    @property
    def notation(self) -> str:
        return f"{self.k}-of-{self.n}"
    
    def __repr__(self):
        return f"PhaseReq({self.notation})"


@dataclass
class Phase:
    """Represents a mission phase"""
    phase_name: str
    duration_hours: float
    sequence_order: int
    requirements: Dict[str, PhaseRequirement] = field(default_factory=dict)
    
    def __repr__(self):
        return f"Phase({self.phase_name}, {self.duration_hours}h, seq={self.sequence_order})"


@dataclass
class SystemReliabilityResult:
    """Result of system reliability calculation"""
    system_name: str
    reliability: Optional[float]
    critical_equipment: List[str]  # Nomenclatures
    k_of_n: str
    required: bool
    failure_rates: List[float] = field(default_factory=list)


@dataclass
class PhaseResult:
    """Result of phase simulation"""
    phase_name: str
    sequence: int
    duration_hours: float
    phase_reliability: float
    systems: Dict[str, SystemReliabilityResult] = field(default_factory=dict)


@dataclass
class MissionResult:
    """Final mission reliability result"""
    config_id: str
    config_name: str
    ship_name: str
    total_duration: float
    mission_reliability: float
    phases: List[PhaseResult] = field(default_factory=list)
    equipment_final_ages: Dict[str, float] = field(default_factory=dict)


# ============================================================================
# RELIABILITY CALCULATOR
# ============================================================================

class ReliabilityCalculator:
    """Core reliability calculation engine"""
    
    @staticmethod
    def equipment_reliability(alpha: float, beta: float, current_age: float, duration: float) -> Tuple[float, float]:
        """
        Calculate equipment reliability using Weibull distribution
        
        Args:
            alpha: Scale parameter
            beta: Shape parameter
            current_age: Current operating hours
            duration: Duration of operation (hours)
            
        Returns:
            (reliability, failure_rate)
        """
        try:
            # Cumulative failures
            NT1 = alpha * (current_age ** beta)
            NT2 = alpha * ((current_age + duration) ** beta)
            NT = NT2 - NT1
            
            # Failure rate
            FR = NT / duration if duration > 0 else 0
            
            # Reliability
            rel = math.exp(-FR * duration)
            
            return (rel, FR)
        
        except (OverflowError, ValueError) as e:
            logger.error(f"Math error in reliability calculation: {e}")
            return (0.0, float('inf'))
    
    @staticmethod
    def kofn_reliability(k: int, n: int, avg_failure_rate: float, duration: float) -> float:
        """
        Calculate k-out-of-n system reliability using Poisson approximation
        
        Args:
            k: Minimum required working equipment
            n: Total equipment available
            avg_failure_rate: Average failure rate of top k equipment
            duration: Duration of operation
            
        Returns:
            System reliability
        """
        try:
            lambda_param = k * avg_failure_rate * duration
            exp_term = math.exp(-lambda_param)
            
            # Sum Poisson terms for i = 0 to (n-k-1)
            poisson_sum = sum(
                (lambda_param ** i) / math.factorial(i) 
                for i in range(n - k)
            )
            
            reliability = exp_term * poisson_sum
            return reliability
        
        except (OverflowError, ValueError) as e:
            logger.error(f"Math error in k-of-n calculation: {e}")
            return 0.0


# ============================================================================
# MISSION RELIABILITY CALCULATOR
# ============================================================================

class MissionReliabilityCalculator:
    """Main calculator for mission reliability analysis"""
    
    def __init__(self, alpha_beta_repo, utilization_repo):
        """
        Initialize calculator with repository dependencies
        
        Args:
            alpha_beta_repo: Repository for fetching alpha/beta parameters
            utilization_repo: Repository for fetching equipment age
        """
        self.alpha_beta_repo = alpha_beta_repo
        self.utilization_repo = utilization_repo
        self.reliability_calc = ReliabilityCalculator()
        
        logger.info("MissionReliabilityCalculator initialized")
    
    async def calculate(self, mission_config: dict) -> dict:
        """
        Calculate mission reliability from configuration
        
        Args:
            mission_config: Mission configuration dictionary
            
        Returns:
            Mission reliability results as dictionary
        """
        try:
            logger.info(f"Starting calculation for mission: {mission_config.get('config_name')}")
            
            # Parse input
            mission_data = self._parse_mission(mission_config)
            
            # Fetch equipment parameters
            await self._fetch_equipment_parameters(mission_data['systems'])
            
            # Simulate mission
            result = self._simulate_mission(
                config_id=mission_data['config_id'],
                config_name=mission_data['config_name'],
                ship_name=mission_data['ship_name'],
                total_duration=mission_data['total_duration'],
                phases=mission_data['phases'],
                systems=mission_data['systems']
            )
            
            # Convert to dictionary
            output = self._format_output(result)
            
            logger.info(f"Calculation complete. Mission reliability: {result.mission_reliability:.6f}")
            
            return {"success": True, "data": output}
        
        except Exception as e:
            logger.error(f"Calculation failed: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}
    
    def _parse_mission(self, config: dict) -> dict:
        """Parse mission configuration into structured data"""
        logger.debug("Parsing mission configuration")
        
        # Extract metadata
        config_id = config.get('config_id', '')
        config_name = config.get('config_name', '')
        ship_name = config.get('ship_name', '')
        total_duration = config.get('total_duration', 0)
        
        # Parse systems
        systems = {}
        for system_name, system_data in config.get('systems', {}).items():
            equipment_list = []
            for equip_data in system_data.get('selected_equipment', []):
                equipment = Equipment(
                    id=equip_data['component_id'],  # ✅ Changed from 'id' to 'component_id'
                    name=equip_data['name'],
                    nomenclature=equip_data['nomenclature']
                )
                equipment_list.append(equipment)
            
            systems[system_name] = System(
                system_id=system_data.get('system_id', ''),
                name=system_name,
                equipment=equipment_list
            )
        
        # Parse phases
        phases = []
        for phase_data in config.get('phases', []):
            requirements = {}
            for system_name in systems.keys():
                req_data = phase_data.get(system_name, {})
                requirements[system_name] = PhaseRequirement(
                    k=req_data.get('k', 0),
                    n=req_data.get('n', 0)
                )
            
            phase = Phase(
                phase_name=phase_data['phase_name'],
                duration_hours=phase_data['duration_hours'],
                sequence_order=phase_data['sequence_order'],
                requirements=requirements
            )
            phases.append(phase)
        
        # Sort phases by sequence
        phases.sort(key=lambda p: p.sequence_order)
        
        logger.debug(f"Parsed {len(phases)} phases and {len(systems)} systems")
        
        return {
            'config_id': config_id,
            'config_name': config_name,
            'ship_name': ship_name,
            'total_duration': total_duration,
            'phases': phases,
            'systems': systems
        }

    async def _fetch_equipment_parameters(self, systems: Dict[str, System]) -> None:
        """Fetch alpha, beta, and age for all equipment"""
        logger.info("Fetching equipment parameters from repositories")
        
        total_equipment = sum(len(system.equipment) for system in systems.values())
        fetched = 0
        
        for system_name, system in systems.items():
            for equipment in system.equipment:
                try:
                    # Fetch alpha and beta - returns a list of AlphaBetaRead objects
                    results = await self.alpha_beta_repo.get_alphabeta_by_component_id(
                        uuid.UUID(equipment.id)  # Convert string to UUID
                    )
                    
                    if not results:
                        raise ValueError(f"No alpha/beta found for {equipment.nomenclature}")
                    
                    # Take the first result
                    alpha_beta = results[0]
                    equipment.alpha = alpha_beta.alpha
                    equipment.beta = alpha_beta.beta
                    
                    # Fetch current age
                    age = await self.utilization_repo.get_curr_age(equipment.id)
                    equipment.current_age = age
                    
                    fetched += 1
                    logger.debug(f"Fetched params for {equipment.nomenclature}: "
                            f"α={equipment.alpha}, β={equipment.beta}, age={age}h")
                
                except Exception as e:
                    logger.error(f"Failed to fetch parameters for {equipment.nomenclature} "
                            f"(ID: {equipment.id}): {e}")
                    raise
        
        logger.info(f"Successfully fetched parameters for {fetched}/{total_equipment} equipment")

    def _simulate_mission(
        self,
        config_id: str,
        config_name: str,
        ship_name: str,
        total_duration: float,
        phases: List[Phase],
        systems: Dict[str, System]
    ) -> MissionResult:
        """Simulate mission and calculate reliability"""
        logger.info(f"Simulating mission with {len(phases)} phases")
        
        total_reliability = 1.0
        phase_results = []
        
        for phase in phases:
            logger.info(f"Processing Phase {phase.sequence_order}: {phase.phase_name} "
                       f"({phase.duration_hours}h)")
            
            phase_result = self._simulate_phase(phase, systems)
            phase_results.append(phase_result)
            
            # Multiply into total reliability
            total_reliability *= phase_result.phase_reliability
            
            logger.info(f"Phase {phase.sequence_order} reliability: "
                       f"{phase_result.phase_reliability:.6f}")
        
        # Collect final equipment ages
        equipment_final_ages = {}
        for system in systems.values():
            for equip in system.equipment:
                equipment_final_ages[equip.nomenclature] = equip.current_age
        
        return MissionResult(
            config_id=config_id,
            config_name=config_name,
            ship_name=ship_name,
            total_duration=total_duration,
            mission_reliability=total_reliability,
            phases=phase_results,
            equipment_final_ages=equipment_final_ages
        )
    
    def _simulate_phase(self, phase: Phase, systems: Dict[str, System]) -> PhaseResult:
        """Simulate a single phase"""
        phase_reliability = 1.0
        system_results = {}
        
        for system_name, system in systems.items():
            requirement = phase.requirements.get(system_name)
            
            if not requirement or not requirement.is_required:
                # System not required in this phase (k=0)
                logger.debug(f"System {system_name} not required in {phase.phase_name}")
                system_results[system_name] = SystemReliabilityResult(
                    system_name=system_name,
                    reliability=None,
                    critical_equipment=[],
                    k_of_n=requirement.notation if requirement else "0-of-0",
                    required=False
                )
                continue
            
            # Calculate system reliability
            sys_result = self._calculate_system_reliability(
                system=system,
                k=requirement.k,
                n=requirement.n,
                duration=phase.duration_hours
            )
            
            system_results[system_name] = sys_result
            phase_reliability *= sys_result.reliability
            
            # Age critical equipment
            self._age_critical_equipment(
                system=system,
                critical_nomenclatures=sys_result.critical_equipment,
                duration=phase.duration_hours
            )
            
            logger.debug(f"System {system_name} reliability: {sys_result.reliability:.6f}, "
                        f"critical: {sys_result.critical_equipment}")
        
        return PhaseResult(
            phase_name=phase.phase_name,
            sequence=phase.sequence_order,
            duration_hours=phase.duration_hours,
            phase_reliability=phase_reliability,
            systems=system_results
        )
    
    def _calculate_system_reliability(
        self,
        system: System,
        k: int,
        n: int,
        duration: float
    ) -> SystemReliabilityResult:
        """Calculate reliability for a single system"""
        
        # Calculate reliability for each equipment
        equipment_reliabilities = []
        for equip in system.equipment:
            rel, fr = self.reliability_calc.equipment_reliability(
                alpha=equip.alpha,
                beta=equip.beta,
                current_age=equip.current_age,
                duration=duration
            )
            equipment_reliabilities.append({
                'equipment': equip,
                'reliability': rel,
                'failure_rate': fr
            })
        
        # Sort by reliability (highest first)
        equipment_reliabilities.sort(key=lambda x: x['reliability'], reverse=True)
        
        # Select top k equipment
        top_k = equipment_reliabilities[:k]
        
        # Calculate system reliability
        if k < n:
            # K-out-of-N system (redundancy)
            avg_failure_rate = sum(e['failure_rate'] for e in top_k) / k
            system_reliability = self.reliability_calc.kofn_reliability(
                k=k,
                n=n,
                avg_failure_rate=avg_failure_rate,
                duration=duration
            )
        else:
            # Series system (k == n, all must work)
            system_reliability = 1.0
            for e in top_k:
                system_reliability *= e['reliability']
        
        # Get critical equipment nomenclatures
        critical_equipment = [e['equipment'].nomenclature for e in top_k]
        failure_rates = [e['failure_rate'] for e in top_k]
        
        return SystemReliabilityResult(
            system_name=system.name,
            reliability=system_reliability,
            critical_equipment=critical_equipment,
            k_of_n=f"{k}-of-{n}",
            required=True,
            failure_rates=failure_rates
        )
    
    def _age_critical_equipment(
        self,
        system: System,
        critical_nomenclatures: List[str],
        duration: float
    ) -> None:
        """Update age of critical equipment used in this phase"""
        for equip in system.equipment:
            if equip.nomenclature in critical_nomenclatures:
                old_age = equip.current_age
                equip.current_age += duration
                logger.debug(f"Aged {equip.nomenclature}: {old_age:.1f}h → "
                           f"{equip.current_age:.1f}h (+{duration}h)")
    
    def _format_output(self, result: MissionResult) -> dict:
        """Format result into output dictionary"""
        return {
            'config_id': result.config_id,
            'config_name': result.config_name,
            'ship_name': result.ship_name,
            'total_duration': result.total_duration,
            'mission_reliability': round(result.mission_reliability, 6),
            'phases': [
                {
                    'phase_name': phase.phase_name,
                    'sequence': phase.sequence,
                    'duration_hours': phase.duration_hours,
                    'phase_reliability': round(phase.phase_reliability, 6),
                    'systems': {
                        sys_name: {
                            'reliability': round(sys_result.reliability, 6) if sys_result.reliability is not None else None,
                            'critical_equipment': sys_result.critical_equipment,
                            'k_of_n': sys_result.k_of_n,
                            'required': sys_result.required
                        }
                        for sys_name, sys_result in phase.systems.items()
                    }
                }
                for phase in result.phases
            ],
            'equipment_final_ages': {
                nomenclature: round(age, 2)
                for nomenclature, age in result.equipment_final_ages.items()
            }
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

# if __name__ == "__main__":
    
#     calculator = MissionReliabilityCalculator(get_alphabeta_by_component_id_repository, get_monthly_utilization_repository)
    
#     # Sample mission config
#     mission_config = {
#         "config_id": "a76d41ec-72db-4829-b4e4-6f3234de89ef",
#         "config_name": "HAction",
#         "ship_id": "33f13701-849f-4030-8d71-a0f65eac992e",
#         "ship_name": "INS ONE",
#         "total_duration": 70,
#         "phases": [
#             {
#                 "phase_name": "Harbour",
#                 "duration_hours": 10,
#                 "sequence_order": 0,
#                 "propulsion": {"k": 1, "n": 2},
#                 "power_generation": {"k": 1, "n": 2},
#                 "support": {"k": 2, "n": 4},
#                 "firing": {"k": 0, "n": 2}
#             }
#         ],
#         "systems": {
#             "propulsion": {
#                 "system_id": "64044bde-5b46-4ab3-b44d-2d140833284b",
#                 "selected_equipment": [
#                     {"id": "gt1", "name": "Gas Turbine", "nomenclature": "GT 1", "alpha": 0, "beta": 0},
#                     {"id": "gt3", "name": "Gas Turbine", "nomenclature": "GT 3", "alpha": 0, "beta": 0}
#                 ]
#             },
#             "power_generation": {
#                 "system_id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
#                 "selected_equipment": [
#                     {"id": "gtg1", "name": "Generator", "nomenclature": "GTG 1", "alpha": 0, "beta": 0},
#                     {"id": "gtg3", "name": "Generator", "nomenclature": "GTG 3", "alpha": 0, "beta": 0}
#                 ]
#             },
#             "support": {
#                 "system_id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
#                 "selected_equipment": [
#                     {"id": "ac3", "name": "Air Conditioner", "nomenclature": "AC 3", "alpha": 0, "beta": 0},
#                     {"id": "ac4", "name": "Air Conditioner", "nomenclature": "AC 4", "alpha": 0, "beta": 0},
#                     {"id": "ac5", "name": "Air Conditioner", "nomenclature": "AC 5", "alpha": 0, "beta": 0},
#                     {"id": "ac6", "name": "Air Conditioner", "nomenclature": "AC 6", "alpha": 0, "beta": 0}
#                 ]
#             },
#             "firing": {
#                 "system_id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
#                 "selected_equipment": [
#                     {"id": "brahmos", "name": "Missile", "nomenclature": "BrahMos", "alpha": 0, "beta": 0},
#                     {"id": "srgm1", "name": "Super Rapid Gun Mount", "nomenclature": "SRGM 1", "alpha": 0, "beta": 0}
#                 ]
#             }
#         }
#     }
    
#     result = calculator.calculate(mission_config)
#     print("\n=== MISSION RELIABILITY RESULT ===")
#     print(f"Success: {result['success']}")
#     if result['success']:
#         print(f"Mission Reliability: {result['data']['mission_reliability']}")
#     else:
#         print(f"Error: {result['error']}")