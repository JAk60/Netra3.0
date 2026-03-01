import logging
import math
from dataclasses import dataclass, field
from typing import List, Dict, Optional
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


# 1. Add field to dataclass
@dataclass
class SystemReliabilityResult:
    system_name: str
    reliability: Optional[float]
    critical_equipment: List[str]
    k_of_n: str
    required: bool
    failure_rates: List[float] = field(default_factory=list)
    equipment_reliabilities: List[float] = field(default_factory=list)  # ← add this line


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
    def equipment_reliability(alpha, beta, current_age, duration):
        NT1 = alpha * (current_age ** beta)
        NT2 = alpha * ((current_age + duration) ** beta)
        NT  = NT2 - NT1

        FR  = NT / duration if duration > 0 else 0.0
        rel = math.e ** (-FR * duration)   # ← match old code: math.e** instead of math.exp

        return (rel, FR)

    @staticmethod
    def kofn_reliability(reliabilities: List[float], failure_rates: List[float], k: int, duration: float) -> float:
        n = len(reliabilities)

        if k == 0:
            return 1.0
        if k > n:
            return 0.0
        if k == n:
            result = 1.0
            for r in reliabilities:
                result *= r
            return result

        # Pair and sort by reliability descending
        paired = sorted(zip(reliabilities, failure_rates), key=lambda x: x[0], reverse=True)
        top_k_FR = [fr for _, fr in paired[:k]]
        not_k_count = n - k

        FR_sum = sum(top_k_FR)
        lamda_max = FR_sum / k
        kLD = k * lamda_max * duration  # exact match to old code

        rel = math.e ** (-kLD) * sum(
            (kLD ** i) / math.factorial(i)
            for i in range(not_k_count)
        )

        return rel


# ============================================================================
# MISSION RELIABILITY CALCULATOR
# ============================================================================

class MissionReliabilityCalculator:
    """Main calculator for mission reliability analysis"""

    def __init__(self, alpha_beta_repo, utilization_repo):
        """
        Initialize calculator with repository dependencies.

        Args:
            alpha_beta_repo:  Repository for fetching alpha/beta parameters
            utilization_repo: Repository for fetching equipment age
        """
        self.alpha_beta_repo  = alpha_beta_repo
        self.utilization_repo = utilization_repo
        self.reliability_calc = ReliabilityCalculator()

        logger.info("MissionReliabilityCalculator initialized")

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    async def calculate(self, mission_config: dict) -> dict:
        """
        Calculate mission reliability from a configuration dictionary.

        Args:
            mission_config: Mission configuration dict (matches MissionConfigRequest schema)

        Returns:
            {"success": True,  "data": {...}}   on success
            {"success": False, "error": "..."}  on failure
        """
        try:
            logger.info(f"Starting calculation for: {mission_config.get('config_name')}")

            mission_data = self._parse_mission(mission_config)
            await self._fetch_equipment_parameters(mission_data['systems'])

            result = self._simulate_mission(
                config_id=mission_data['config_id'],
                config_name=mission_data['config_name'],
                ship_name=mission_data['ship_name'],
                total_duration=mission_data['total_duration'],
                phases=mission_data['phases'],
                systems=mission_data['systems'],
            )

            output = self._format_output(result)
            logger.info(f"Calculation complete. Mission reliability: {result.mission_reliability:.6f}")

            return {"success": True, "data": output}

        except Exception as e:
            logger.error(f"Calculation failed: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}

    # ------------------------------------------------------------------
    # Parsing
    # ------------------------------------------------------------------

    def _parse_mission(self, config: dict) -> dict:
        """Parse raw mission configuration dict into structured objects."""
        logger.debug("Parsing mission configuration")

        config_id     = config.get('config_id', '')
        config_name   = config.get('config_name', '')
        ship_name     = config.get('ship_name', '')
        total_duration = config.get('total_duration', 0)

        # --- Systems ---
        systems: Dict[str, System] = {}
        for system_name, system_data in config.get('systems', {}).items():
            equipment_list = [
                Equipment(
                    id=equip_data['component_id'],
                    name=equip_data['name'],
                    nomenclature=equip_data['nomenclature'],
                )
                for equip_data in system_data.get('selected_equipment', [])
            ]
            systems[system_name] = System(
                system_id=system_data.get('system_id', ''),
                name=system_name,
                equipment=equipment_list,
            )

        # --- Phases ---
        phases: List[Phase] = []
        for phase_data in config.get('phases', []):
            requirements = {
                system_name: PhaseRequirement(
                    k=phase_data.get(system_name, {}).get('k', 0),
                    n=phase_data.get(system_name, {}).get('n', 0),
                )
                for system_name in systems
            }
            phases.append(Phase(
                phase_name=phase_data['phase_name'],
                duration_hours=phase_data['duration_hours'],
                sequence_order=phase_data['sequence_order'],
                requirements=requirements,
            ))

        phases.sort(key=lambda p: p.sequence_order)

        logger.debug(f"Parsed {len(phases)} phases and {len(systems)} systems")

        return {
            'config_id':      config_id,
            'config_name':    config_name,
            'ship_name':      ship_name,
            'total_duration': total_duration,
            'phases':         phases,
            'systems':        systems,
        }

    # ------------------------------------------------------------------
    # Data fetching
    # ------------------------------------------------------------------

    async def _fetch_equipment_parameters(self, systems: Dict[str, System]) -> None:
        """Fetch alpha, beta, and current age for every equipment unit."""
        logger.info("Fetching equipment parameters from repositories")

        total_equipment = sum(len(s.equipment) for s in systems.values())
        fetched = 0

        for system_name, system in systems.items():
            for equipment in system.equipment:
                try:
                    results = await self.alpha_beta_repo.get_alphabeta_by_component_id(
                        uuid.UUID(equipment.id)
                    )

                    if not results:
                        raise ValueError(
                            f"No alpha/beta record found for {equipment.nomenclature} "
                            f"(id={equipment.id})"
                        )

                    alpha_beta = results[0]
                    equipment.alpha = alpha_beta.alpha
                    equipment.beta  = alpha_beta.beta

                    equipment.current_age = await self.utilization_repo.get_current_age(
                        equipment.id
                    )

                    fetched += 1
                    logger.debug(
                        f"  {equipment.nomenclature}: α={equipment.alpha}, "
                        f"β={equipment.beta}, age={equipment.current_age:.1f}h"
                    )

                except Exception as e:
                    logger.error(
                        f"Failed to fetch parameters for {equipment.nomenclature} "
                        f"(id={equipment.id}): {e}"
                    )
                    raise

        logger.info(f"Fetched parameters for {fetched}/{total_equipment} equipment")

    # ------------------------------------------------------------------
    # Mission simulation
    # ------------------------------------------------------------------

    def _simulate_mission(
        self,
        config_id: str,
        config_name: str,
        ship_name: str,
        total_duration: float,
        phases: List[Phase],
        systems: Dict[str, System],
    ) -> MissionResult:
        """Run through all phases sequentially, accumulating reliability."""
        logger.info(f"Simulating mission with {len(phases)} phases")

        total_reliability = 1.0
        phase_results: List[PhaseResult] = []

        for phase in phases:
            logger.info(
                f"Phase {phase.sequence_order}: {phase.phase_name} "
                f"({phase.duration_hours}h)"
            )
            phase_result = self._simulate_phase(phase, systems)
            phase_results.append(phase_result)

            total_reliability *= phase_result.phase_reliability

            logger.info(
                f"  Phase reliability: {phase_result.phase_reliability:.6f}  "
                f"(running mission: {total_reliability:.6f})"
            )

        # Collect final ages after all phases
        equipment_final_ages = {
            equip.nomenclature: equip.current_age
            for system in systems.values()
            for equip in system.equipment
        }

        return MissionResult(
            config_id=config_id,
            config_name=config_name,
            ship_name=ship_name,
            total_duration=total_duration,
            mission_reliability=total_reliability,
            phases=phase_results,
            equipment_final_ages=equipment_final_ages,
        )

    def _simulate_phase(
        self,
        phase: Phase,
        systems: Dict[str, System],
    ) -> PhaseResult:
        """Calculate reliability for one phase across all systems."""
        phase_reliability = 1.0
        system_results: Dict[str, SystemReliabilityResult] = {}

        for system_name, system in systems.items():
            requirement = phase.requirements.get(system_name)

            # System not needed in this phase (k = 0)
            if not requirement or not requirement.is_required:
                logger.debug(f"  {system_name}: not required in {phase.phase_name}")
                system_results[system_name] = SystemReliabilityResult(
                    system_name=system_name,
                    reliability=None,
                    critical_equipment=[],
                    k_of_n=requirement.notation if requirement else "0-of-0",
                    required=False,
                )
                continue

            sys_result = self._calculate_system_reliability(
                system=system,
                k=requirement.k,
                n=requirement.n,
                duration=phase.duration_hours,
            )
            system_results[system_name] = sys_result
            phase_reliability *= sys_result.reliability

            # Age only the critical (selected) equipment
            self._age_critical_equipment(
                system=system,
                critical_nomenclatures=sys_result.critical_equipment,
                duration=phase.duration_hours,
            )

            logger.debug(
                f"  {system_name} ({requirement.notation}): "
                f"rel={sys_result.reliability:.6f}, "
                f"critical={sys_result.critical_equipment}"
            )

        return PhaseResult(
            phase_name=phase.phase_name,
            sequence=phase.sequence_order,
            duration_hours=phase.duration_hours,
            phase_reliability=phase_reliability,
            systems=system_results,
        )

    def _calculate_system_reliability(
        self,
        system: System,
        k: int,
        n: int,
        duration: float,
    ) -> SystemReliabilityResult:
        """
        Calculate reliability for one system in one phase.

        Steps:
          1. Compute individual reliability and failure rate per unit.
          2. Sort units by reliability (best first) — best units are
             preferred for the critical k slots.
          3. Apply exact k-of-n formula over all n unit reliabilities.
          4. Mark the top-k units as 'critical' (they will be aged).
        """
        # Step 1: calculate per-unit reliability
        unit_results = []
        for equip in system.equipment:
            rel, fr = self.reliability_calc.equipment_reliability(
                alpha=equip.alpha,
                beta=equip.beta,
                current_age=equip.current_age,
                duration=duration,
            )
            unit_results.append({
                'equipment':    equip,
                'reliability':  rel,
                'failure_rate': fr,
            })

        # Step 2: sort best-first so critical_equipment = highest-reliability k units
        unit_results.sort(key=lambda x: x['reliability'], reverse=True)

        # Step 3: exact k-of-n reliability over ALL n units
        # Step 3: pass failure_rates into kofn to match old code exactly
        all_reliabilities = [u['reliability'] for u in unit_results]
        all_failure_rates = [u['failure_rate'] for u in unit_results]

        system_reliability = self.reliability_calc.kofn_reliability(
            all_reliabilities, all_failure_rates, k, duration
        )

        # Step 4: top-k units are the "critical" / selected ones
        top_k = unit_results[:k]
        critical_equipment = [u['equipment'].nomenclature for u in top_k]
        failure_rates      = [u['failure_rate']           for u in top_k]

        top_k_reliabilities = [u['reliability'] for u in top_k]  # ← add this line

        return SystemReliabilityResult(
            system_name=system.name,
            reliability=system_reliability,
            critical_equipment=critical_equipment,
            k_of_n=f"{k}-of-{n}",
            required=True,
            failure_rates=failure_rates,
            equipment_reliabilities=top_k_reliabilities,  # ← add this line
        )
    
    def _age_critical_equipment(
        self,
        system: System,
        critical_nomenclatures: List[str],
        duration: float,
    ) -> None:
        """Advance the age of every unit that was active in this phase."""
        for equip in system.equipment:
            if equip.nomenclature in critical_nomenclatures:
                old_age = equip.current_age
                equip.current_age += duration
                logger.debug(
                    f"    Aged {equip.nomenclature}: "
                    f"{old_age:.1f}h → {equip.current_age:.1f}h (+{duration}h)"
                )

    # ------------------------------------------------------------------
    # Output formatting
    # ------------------------------------------------------------------

    def _format_output(self, result: MissionResult) -> dict:
        """Serialize MissionResult to a JSON-safe dictionary."""
        return {
            'config_id':          result.config_id,
            'config_name':        result.config_name,
            'ship_name':          result.ship_name,
            'total_duration':     result.total_duration,
            'mission_reliability': round(result.mission_reliability, 6),
            'phases': [
                {
                    'phase_name':        phase.phase_name,
                    'sequence':          phase.sequence,
                    'duration_hours':    phase.duration_hours,
                    'phase_reliability': round(phase.phase_reliability, 6),
                    'systems': {
                        
                        sys_name: {
                            'reliability':       round(sr.reliability, 6) if sr.reliability is not None else None,
                            'critical_equipment': sr.critical_equipment,
                            'k_of_n':            sr.k_of_n,
                           # 3. In _format_output, add to systems dict
                            'required': sr.required,
                            'equipment_reliabilities': dict(zip(sr.critical_equipment, [round(r, 6) for r in sr.equipment_reliabilities])),  # ← add this line
                        }
                        for sys_name, sr in phase.systems.items()
                    },
                }
                for phase in result.phases
            ],
            'equipment_final_ages': {
                nom: round(age, 2)
                for nom, age in result.equipment_final_ages.items()
            },
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

# if __name__ == "__main__":
#
#     calculator = MissionReliabilityCalculator(
#         alpha_beta_repo=get_alphabeta_by_component_id_repository,
#         utilization_repo=get_monthly_utilization_repository,
#     )
#
#     mission_config = {
#         "config_id":      "a76d41ec-72db-4829-b4e4-6f3234de89ef",
#         "config_name":    "HAction",
#         "ship_id":        "33f13701-849f-4030-8d71-a0f65eac992e",
#         "ship_name":      "INS ONE",
#         "total_duration": 70,
#         "phases": [
#             {
#                 "phase_name":     "Harbour",
#                 "duration_hours": 10,
#                 "sequence_order": 0,
#                 "propulsion":        {"k": 1, "n": 2},
#                 "power_generation":  {"k": 1, "n": 2},
#                 "support":           {"k": 2, "n": 4},
#                 "firing":            {"k": 0, "n": 2},
#             },
#             {
#                 "phase_name":     "Action",
#                 "duration_hours": 50,
#                 "sequence_order": 1,
#                 "propulsion":        {"k": 1, "n": 2},
#                 "power_generation":  {"k": 1, "n": 2},
#                 "support":           {"k": 1, "n": 4},
#                 "firing":            {"k": 1, "n": 2},
#             },
#         ],
#         "systems": {
#             "propulsion": {
#                 "system_id": "64044bde-5b46-4ab3-b44d-2d140833284b",
#                 "selected_equipment": [
#                     {"component_id": "5358d044-...", "name": "Gas Turbine", "nomenclature": "GT 1"},
#                     {"component_id": "ab055ca1-...", "name": "Gas Turbine", "nomenclature": "GT 3"},
#                 ],
#             },
#             "power_generation": {
#                 "system_id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
#                 "selected_equipment": [
#                     {"component_id": "443360a0-...", "name": "Generator",    "nomenclature": "GTG 1"},
#                     {"component_id": "5eefd3c9-...", "name": "Generator",    "nomenclature": "GTG 3"},
#                 ],
#             },
#             "support": {
#                 "system_id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
#                 "selected_equipment": [
#                     {"component_id": "308804ec-...", "name": "Air Conditioner", "nomenclature": "AC 6"},
#                     {"component_id": "38093be3-...", "name": "Air Conditioner", "nomenclature": "AC 4"},
#                     {"component_id": "6493cf2d-...", "name": "Air Conditioner", "nomenclature": "AC 5"},
#                     {"component_id": "73c2a73c-...", "name": "Air Conditioner", "nomenclature": "AC 3"},
#                 ],
#             },
#             "firing": {
#                 "system_id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
#                 "selected_equipment": [
#                     {"component_id": "1c16dacf-...", "name": "Missile",              "nomenclature": "BrahMos"},
#                     {"component_id": "db30946a-...", "name": "Super Rapid Gun Mount", "nomenclature": "SRGM 1"},
#                 ],
#             },
#         },
#     }
#
#     import asyncio
#     result = asyncio.run(calculator.calculate(mission_config))
#     print(f"Success: {result['success']}")
#     if result['success']:
#         print(f"Mission Reliability: {result['data']['mission_reliability']:.6f}")
#     else:
#         print(f"Error: {result['error']}")