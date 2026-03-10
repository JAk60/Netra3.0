import uuid
import math
from fastapi import APIRouter, Depends, HTTPException, status
import logging
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

from api.models.mission_configuration import MissionConfiguration, MissionConfigurationCreate
from backend.api.db.dependencies import get_mission_conifg_repository
from backend.api.db.dependencies import get_alpha_beta_repository, get_monthly_utilization_repository
from mission_configuration.mission_configuration import MissionReliabilityCalculator, ReliabilityCalculator

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class EquipmentSelection(BaseModel):
    """Equipment selected for comparison"""
    component_id: str
    name: str
    nomenclature: str


class PhaseEquipment(BaseModel):
    """Equipment configuration per phase"""
    phase_name: str
    duration_hours: float
    sequence_order: int

    # Equipment per system (optional systems) — for compare-batch, these hold
    # flat lists of EquipmentSelection (not k/n groups)
    propulsion: Optional[List[EquipmentSelection]] = Field(default_factory=list)
    power_generation: Optional[List[EquipmentSelection]] = Field(default_factory=list)
    support: Optional[List[EquipmentSelection]] = Field(default_factory=list)
    firing: Optional[List[EquipmentSelection]] = Field(default_factory=list)


class ComparisonConfig(BaseModel):
    """Single comparison configuration"""
    id: str  # comparison-123
    config_id: str
    config_name: str
    ship_id: str
    ship_name: str
    total_duration: float
    phases: List[PhaseEquipment]


class BatchComparisonRequest(BaseModel):
    """Batch comparison request"""
    comparisons: List[ComparisonConfig]


class EquipmentResult(BaseModel):
    """Equipment calculation result"""
    nomenclature: str
    system: str
    reliability: float
    alpha: float
    beta: float
    age_before: float
    age_after: float
    duration: float
    is_reused: bool


class PhaseResult(BaseModel):
    """Phase calculation result"""
    phase_name: str
    sequence: int
    duration_hours: float
    phase_reliability: float
    equipment: List[EquipmentResult]


class ComparisonResult(BaseModel):
    """Single comparison result"""
    comparison_id: str
    config_name: str
    ship_name: str
    mission_reliability: float
    total_duration: float
    phases: List[PhaseResult]
    equipment_final_ages: Dict[str, float]


class BatchComparisonResponse(BaseModel):
    """Batch comparison response"""
    success: bool
    results: List[ComparisonResult]
    error: Optional[str] = None

logger = logging.getLogger(__name__)

# FIRST ROUTER: Mission Configuration CRUD
mission_config_router = APIRouter(
    prefix="/Mission-configuration",
    tags=["Mission Configurations"]
)

# Initialize service
config_service = get_mission_conifg_repository()


@mission_config_router.post(
    "/create",
    response_model=MissionConfiguration,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Mission configuration",
    description="Create a new Mission configuration with the provided data"
)
async def create_Mission_configuration(
    config_data: MissionConfigurationCreate
) -> MissionConfiguration:
    try:
        config = await config_service.create(config_data)
        return config
    except Exception as e:
        logger.error(f"Error creating Mission configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Mission configuration: {str(e)}"
        )

@mission_config_router.get(
    "/get_all_mission_configs",
    response_model=list[MissionConfiguration],
    summary="List all Mission configurations",
    description="Retrieve all Mission configurations"
)
async def list_Mission_configurations() -> list[MissionConfiguration]:
    try:
        configs = await config_service.get_all()
        return configs
    except Exception as e:
        logger.error(f"Error listing Mission configurations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list Mission configurations: {str(e)}"
        )

@mission_config_router.get(
    "/{config_id}",
    response_model=MissionConfiguration,
    summary="Get Mission configuration by ID",
    description="Retrieve a specific Mission configuration by its ID"
)
async def get_Mission_configuration(config_id: str) -> MissionConfiguration:
    try:
        config = await config_service.get_by_id(config_id)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission configuration with ID {config_id} not found"
            )
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving Mission configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve Mission configuration: {str(e)}"
        )


@mission_config_router.put(
    "/{config_id}",
    response_model=MissionConfiguration,
    summary="Update Mission configuration",
    description="Update an existing Mission configuration"
)
async def update_Mission_configuration(
    config_id: str,
    config_data: MissionConfigurationCreate
) -> MissionConfiguration:
    try:
        config = await config_service.update(config_id, config_data)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission configuration with ID {config_id} not found"
            )
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating Mission configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update Mission configuration: {str(e)}"
        )


@mission_config_router.delete(
    "/{config_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Mission configuration",
    description="Delete a Mission configuration by ID"
)
async def delete_Mission_configuration(config_id: str) -> None:
    try:
        success = await config_service.delete(config_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission configuration with ID {config_id} not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Mission configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete Mission configuration: {str(e)}"
        )
    

# SECOND ROUTER: Mission Reliability Calculations
reliability_router = APIRouter(
    prefix="/api/mission-reliability", 
    tags=["Mission Reliability"]
)

alpha_beta_repo = get_alpha_beta_repository()
utilization_repo = get_monthly_utilization_repository()

calculator = MissionReliabilityCalculator(
    alpha_beta_repo,
    utilization_repo
)

# ==================== REQUEST MODELS ====================

class EquipmentItem(BaseModel):
    component_id: str
    name: str
    nomenclature: str

class SystemConfig(BaseModel):
    system_id: str
    selected_equipment: List[EquipmentItem]

class SystemKN(BaseModel):
    k: int
    n: int

class PhaseConfig(BaseModel):
    phase_name: str
    duration_hours: float
    sequence_order: int
    propulsion: Optional[SystemKN] = None
    power_generation: Optional[SystemKN] = None
    support: Optional[SystemKN] = None
    firing: Optional[SystemKN] = None

class MissionConfigRequest(BaseModel):
    config_id: str
    config_name: str
    ship_id: str
    ship_name: str
    total_duration: float
    created_at: str
    phases: List[PhaseConfig]
    systems: Dict[str, SystemConfig]
    
    class Config:
        json_schema_extra = {
            "example": {
                "config_id": "a76d41ec-72db-4829-b4e4-6f3234de89ef",
                "config_name": "HAction",
                "ship_id": "33f13701-849f-4030-8d71-a0f65eac992e",
                "ship_name": "INS ONE",
                "total_duration": 70,
                "created_at": "2025-11-29T13:43:09.790Z",
                "phases": [
                    {
                        "phase_name": "Harbour",
                        "duration_hours": 10,
                        "sequence_order": 0,
                        "propulsion": {"k": 1, "n": 2},
                        "power_generation": {"k": 1, "n": 2},
                        "support": {"k": 2, "n": 4},
                        "firing": {"k": 0, "n": 2}
                    }
                ],
                "systems": {
                    "propulsion": {
                        "system_id": "64044bde-5b46-4ab3-b44d-2d140833284b",
                        "selected_equipment": [
                            {
                                "component_id": "5358d044-9f4f-44cf-a975-341221f7189d",
                                "name": "Gas Turbine",
                                "nomenclature": "GT 1"
                            }
                        ]
                    }
                }
            }
        }

# ==================== ENDPOINTS ====================

@reliability_router.post("/calculate")
async def calculate_mission_reliability(
    mission_config: MissionConfigRequest
):
    """
    Calculate mission reliability based on provided configuration (NETRA recommendation).

    Uses power-law (alpha-beta) k-of-n formula:
      NT1 = alpha * t^beta
      NT2 = alpha * (t+D)^beta
      FR  = (NT2 - NT1) / D
      rel = e^(-FR * D)
    Then k-of-n applied across all n units, ageing only the top-k (best) units.
    """
    try:
        print("📥 Received mission reliability calculation request:")
        print(f"   Config: {mission_config.config_name}")
        print(f"   Ship: {mission_config.ship_name}")
        print(f"   Duration: {mission_config.total_duration}h")
        print(f"   Phases: {len(mission_config.phases)}")
        
        mission_dict = mission_config.model_dump()
        
        print("🔄 Starting reliability calculation...")
        result = await calculator.calculate(mission_dict)
        
        if result['success']:
            print("✅ Mission reliability calculated successfully")
            print(f"   Overall Reliability: {result['data']['mission_reliability']:.4f}")
            return {
                "success": True,
                "message": "Mission reliability calculated successfully",
                "data": result['data']
            }
        else:
            error_msg = result.get('error', 'Unknown error')
            print(f"❌ Calculation failed: {error_msg}")
            raise HTTPException(status_code=400, detail=f"Calculation failed: {error_msg}")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Internal server error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@reliability_router.get("/calculate-dummy")
async def calculate_mission_reliability_dummy():
    """
    Calculate mission reliability using predefined dummy data for testing.
    """
    try:
        print("📥 Using dummy mission configuration...")
        
        mission_config = {
            "config_id": "a76d41ec-72db-4829-b4e4-6f3234de89ef",
            "config_name": "HAction",
            "ship_id": "33f13701-849f-4030-8d71-a0f65eac992e",
            "ship_name": "INS ONE",
            "total_duration": 70,
            "created_at": "2025-11-29T13:43:09.790Z",
            "phases": [
                {
                    "phase_name": "Harbour",
                    "duration_hours": 10,
                    "sequence_order": 0,
                    "propulsion": {"k": 1, "n": 2},
                    "power_generation": {"k": 1, "n": 2},
                    "support": {"k": 2, "n": 4},
                    "firing": {"k": 0, "n": 2}
                },
                {
                    "phase_name": "Action",
                    "duration_hours": 50,
                    "sequence_order": 1,
                    "propulsion": {"k": 1, "n": 2},
                    "power_generation": {"k": 1, "n": 2},
                    "support": {"k": 1, "n": 4},
                    "firing": {"k": 1, "n": 2}
                },
                {
                    "phase_name": "Harbour",
                    "duration_hours": 10,
                    "sequence_order": 2,
                    "propulsion": {"k": 1, "n": 2},
                    "power_generation": {"k": 1, "n": 2},
                    "support": {"k": 2, "n": 4},
                    "firing": {"k": 0, "n": 2}
                }
            ],
            "systems": {
                "propulsion": {
                    "system_id": "64044bde-5b46-4ab3-b44d-2d140833284b",
                    "selected_equipment": [
                        {"component_id": "5358d044-9f4f-44cf-a975-341221f7189d", "name": "Gas Turbine", "nomenclature": "GT 1"},
                        {"component_id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131", "name": "Gas Turbine", "nomenclature": "GT 3"}
                    ]
                },
                "power_generation": {
                    "system_id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                    "selected_equipment": [
                        {"component_id": "443360a0-6218-486b-a34c-1813963177b7", "name": "Generator", "nomenclature": "GTG 1"},
                        {"component_id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a", "name": "Generator", "nomenclature": "GTG 3"}
                    ]
                },
                "support": {
                    "system_id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                    "selected_equipment": [
                        {"component_id": "308804ec-bca2-45e9-b665-515de88ffa70", "name": "Air Conditioner", "nomenclature": "AC 6"},
                        {"component_id": "38093be3-acb7-40db-80ec-542dfc8d5d7d", "name": "Air Conditioner", "nomenclature": "AC 4"},
                        {"component_id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0", "name": "Air Conditioner", "nomenclature": "AC 5"},
                        {"component_id": "73c2a73c-0e92-4742-9775-af95e89e1841", "name": "Air Conditioner", "nomenclature": "AC 3"}
                    ]
                },
                "firing": {
                    "system_id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
                    "selected_equipment": [
                        {"component_id": "1c16dacf-69cd-4061-b004-113d85948c61", "name": "Missile", "nomenclature": "BrahMos"},
                        {"component_id": "db30946a-2baf-49e4-9ceb-ec72365089b4", "name": "Super Rapid Gun Mount", "nomenclature": "SRGM 1"}
                    ]
                }
            }
        }
        
        print("🔄 Starting reliability calculation with dummy data...")
        result = await calculator.calculate(mission_config)
        
        if result['success']:
            print("✅ Dummy mission reliability calculated successfully")
            return {
                "success": True,
                "message": "Mission reliability calculated successfully (using dummy data)",
                "data": result['data']
            }
        else:
            error_msg = result.get('error', 'Unknown error')
            raise HTTPException(status_code=400, detail=f"Calculation failed: {error_msg}")
    
    except Exception as e:
        print(f"💥 Internal server error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@reliability_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Mission Reliability Calculator",
        "timestamp": datetime.utcnow().isoformat()
    }


async def fetch_equipment_parameters(
    component_id: str,
    alpha_beta_repo,
    utilization_repo
) -> tuple[float, float, float]:
    """
    Fetch alpha, beta, and current age for a piece of equipment.
    Returns (alpha, beta, current_age).
    """
    try:
        results = await alpha_beta_repo.get_alphabeta_by_component_id(
            uuid.UUID(component_id)
        )
        if not results:
            raise ValueError(f"No alpha/beta found for component {component_id}")
        
        alpha_beta = results[0]
        alpha = alpha_beta.alpha
        beta = alpha_beta.beta
        current_age = await utilization_repo.get_current_age(component_id)
        
        logger.info(f"Fetched parameters for {component_id}: alpha={alpha}, beta={beta}, current_age={current_age}")
        return (alpha, beta, current_age)
    
    except Exception as e:
        logger.error(f"Failed to fetch parameters for {component_id}: {e}")
        raise


# ============================================================================
# SHARED RELIABILITY ENGINE  (identical to mission_configuration.py)
# ============================================================================

# Single source of truth — we re-use the same ReliabilityCalculator that the
# /calculate endpoint uses, so NETRA and User-Selection are always comparable.
_rel_calc = ReliabilityCalculator()


def _compute_kofn_for_phase(
    equip_list: list[dict],   # [{'component_id', 'name', 'nomenclature', 'system'}]
    k: int,
    duration: float,
) -> tuple[float, list[dict]]:
    """
    Given a flat list of equipment with pre-fetched alpha/beta/age, apply the
    same k-of-n formula used in MissionReliabilityCalculator._calculate_system_reliability:

      1. Compute per-unit reliability + failure_rate via power-law formula
      2. Sort by reliability descending  (best units preferred)
      3. Apply kofn_reliability over ALL n units
      4. Return (system_reliability, top_k_equipment_details)

    This is intentionally extracted from ReliabilityCalculator so that the
    compare-batch endpoint produces results that are directly comparable to the
    /calculate endpoint (NETRA recommendation).
    """
    n = len(equip_list)
    if n == 0 or k == 0:
        return 1.0, []

    unit_results = []
    for eq in equip_list:
        rel, fr = _rel_calc.equipment_reliability(
            alpha=eq['alpha'],
            beta=eq['beta'],
            current_age=eq['current_age'],
            duration=duration,
        )
        unit_results.append({**eq, 'reliability': rel, 'failure_rate': fr})

    # Sort best-first (same as NETRA)
    unit_results.sort(key=lambda x: x['reliability'], reverse=True)

    all_reliabilities = [u['reliability'] for u in unit_results]
    all_failure_rates = [u['failure_rate'] for u in unit_results]

    system_reliability = _rel_calc.kofn_reliability(
        all_reliabilities, all_failure_rates, k, duration
    )

    top_k = unit_results[:k]
    return system_reliability, top_k


# ============================================================================
# compare-batch  —  User-Selection reliability
# ============================================================================

@reliability_router.post("/compare-batch", response_model=BatchComparisonResponse)
async def compare_batch_missions(
    batch_request: BatchComparisonRequest,
    alpha_beta_repo=Depends(get_alpha_beta_repository),
    utilization_repo=Depends(get_monthly_utilization_repository),
):
    """
    Calculate reliability for multiple user-selected equipment configurations.

    Uses the EXACT same power-law + k-of-n formula as the /calculate endpoint
    so that NETRA (original) and User-Selection (alternatives) are directly
    comparable.

    Key rules:
    - Per-unit reliability: power-law alpha-beta formula (identical to /calculate)
    - k-of-n: same kofn_reliability as MissionReliabilityCalculator
    - Top-k best units are aged after each phase (same as NETRA)
    - Equipment ages accumulate across phases if reused
    - k value: the number of equipment the user actually selected for that
      system/phase (len of the equipment list in that phase/system slot).
      i.e. all selected equipment must work → k == n for user selection.

    NOTE on k-of-n for user selection:
      The user explicitly picks which units to run.  There is no redundancy —
      every unit they selected is required.  So k = n = len(selected).
      This means the formula correctly collapses to simple series product
      (same as old compare code) but uses the identical engine as NETRA.
    """
    try:
        logger.info(f"Starting batch comparison for {len(batch_request.comparisons)} configurations")

        results = []

        for comparison in batch_request.comparisons:
            logger.info(f"Processing comparison: {comparison.config_name}")

            # Cache for fetched parameters keyed by component_id
            param_cache: Dict[str, dict] = {}

            # Track current age per component_id (ages across phases)
            running_ages: Dict[str, float] = {}

            mission_reliability = 1.0
            phase_results = []

            sorted_phases = sorted(comparison.phases, key=lambda p: p.sequence_order)

            for phase in sorted_phases:
                logger.info(
                    f"  Phase {phase.sequence_order}: {phase.phase_name} ({phase.duration_hours}h)"
                )

                phase_reliability = 1.0
                equipment_details: List[EquipmentResult] = []

                # Collect equipment per system for this phase
                system_map = {
                    'propulsion':      phase.propulsion      or [],
                    'power_generation': phase.power_generation or [],
                    'support':         phase.support         or [],
                    'firing':          phase.firing          or [],
                }

                for system_name, equip_selections in system_map.items():
                    if not equip_selections:
                        continue

                    # Fetch parameters for any unseen equipment
                    for sel in equip_selections:
                        cid = sel.component_id
                        if cid not in param_cache:
                            alpha, beta, init_age = await fetch_equipment_parameters(
                                cid, alpha_beta_repo, utilization_repo
                            )
                            param_cache[cid] = {
                                'alpha': alpha,
                                'beta': beta,
                                'nomenclature': sel.nomenclature,
                                'name': sel.name,
                            }
                            # Initialise running age from DB on first encounter
                            running_ages[cid] = init_age

                    # Build equipment list with current (possibly aged) ages
                    equip_list = [
                        {
                            'component_id': sel.component_id,
                            'name':         sel.name,
                            'nomenclature': sel.nomenclature,
                            'system':       system_name,
                            'alpha':        param_cache[sel.component_id]['alpha'],
                            'beta':         param_cache[sel.component_id]['beta'],
                            'current_age':  running_ages[sel.component_id],
                        }
                        for sel in equip_selections
                    ]

                    # User selected all of these → they all must work → k = n = len
                    k = len(equip_list)

                    # ── Same formula as /calculate ──────────────────────────
                    system_rel, top_k_units = _compute_kofn_for_phase(
                        equip_list, k, phase.duration_hours
                    )
                    # ────────────────────────────────────────────────────────

                    phase_reliability *= system_rel

                    # Record results and age only the top-k units (same as NETRA)
                    top_k_ids = {u['component_id'] for u in top_k_units}

                    for eq in equip_list:
                        cid       = eq['component_id']
                        age_before = running_ages[cid]
                        is_reused  = age_before > param_cache[cid].get('_init_age', age_before)

                        # Compute this unit's individual reliability for display
                        unit_rel, _ = _rel_calc.equipment_reliability(
                            alpha=eq['alpha'],
                            beta=eq['beta'],
                            current_age=age_before,
                            duration=phase.duration_hours,
                        )

                        # Age only active (top-k) units
                        age_after = age_before
                        if cid in top_k_ids:
                            age_after = age_before + phase.duration_hours
                            running_ages[cid] = age_after

                        equipment_details.append(EquipmentResult(
                            nomenclature=eq['nomenclature'],
                            system=system_name,
                            reliability=round(float(unit_rel), 6),
                            alpha=round(float(eq['alpha']), 8),
                            beta=round(float(eq['beta']), 4),
                            age_before=round(float(age_before), 2),
                            age_after=round(float(age_after), 2),
                            duration=round(float(phase.duration_hours), 2),
                            is_reused=is_reused,
                        ))

                    logger.debug(
                        f"    {system_name} (k={k}-of-{k}): rel={system_rel:.6f}"
                    )

                phase_results.append(PhaseResult(
                    phase_name=phase.phase_name,
                    sequence=phase.sequence_order,
                    duration_hours=phase.duration_hours,
                    phase_reliability=round(float(phase_reliability), 6),
                    equipment=equipment_details,
                ))

                mission_reliability *= phase_reliability
                logger.info(f"  Phase reliability: {phase_reliability:.6f}")

            # Final ages by nomenclature
            equipment_final_ages = {}
            for cid, age in running_ages.items():
                nom = param_cache[cid]['nomenclature']
                equipment_final_ages[nom] = round(float(age), 2)

            results.append(ComparisonResult(
                comparison_id=comparison.id,
                config_name=comparison.config_name,
                ship_name=comparison.ship_name,
                mission_reliability=round(float(mission_reliability), 6),
                total_duration=comparison.total_duration,
                phases=phase_results,
                equipment_final_ages=equipment_final_ages,
            ))

            logger.info(
                f"Completed {comparison.config_name}: "
                f"mission_reliability={mission_reliability:.6f}"
            )

        logger.info("Batch comparison completed successfully")
        return BatchComparisonResponse(success=True, results=results)

    except Exception as e:
        logger.error(f"Batch comparison failed: {str(e)}", exc_info=True)
        return BatchComparisonResponse(success=False, results=[], error=str(e))