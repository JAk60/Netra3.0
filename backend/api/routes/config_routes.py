import uuid
from fastapi import APIRouter, Depends, HTTPException, status
import logging
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

from api.models.mission_configuration import MissionConfiguration, MissionConfigurationCreate
from backend.api.db.dependencies import get_mission_conifg_repository
from backend.api.db.dependencies import get_alpha_beta_repository, get_monthly_utilization_repository
from mission_configuration.mission_configuration import MissionReliabilityCalculator
from reliabilty.relformulas import Reliability

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
    
    # Equipment per system (optional systems)
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
    """
    Create a new Mission configuration.
    
    Args:
        config_data: Mission configuration data
        
    Returns:
        Created Mission configuration
        
    Raises:
        HTTPException: If configuration creation fails
    """
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
    """
    List all Mission configurations.
    
    Returns:
        List of Mission configurations
        
    Raises:
        HTTPException: If listing fails
    """
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
    """
    Get a Mission configuration by ID.
    
    Args:
        config_id: Configuration ID
        
    Returns:
        Mission configuration
        
    Raises:
        HTTPException: If configuration not found
    """
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
    """
    Update a Mission configuration.
    
    Args:
        config_id: Configuration ID
        config_data: Updated configuration data
        
    Returns:
        Updated Mission configuration
        
    Raises:
        HTTPException: If configuration not found or update fails
    """
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
    """
    Delete a Mission configuration.
    
    Args:
        config_id: Configuration ID
        
    Raises:
        HTTPException: If configuration not found or deletion fails
    """
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
    Calculate mission reliability based on provided configuration.
    
    This endpoint accepts a complete mission configuration including:
    - Ship information
    - Mission phases with durations and system K/N requirements
    - System configurations with selected equipment
    
    Returns detailed reliability analysis including:
    - Overall mission reliability
    - Phase-by-phase reliability breakdown
    - Critical equipment identification
    - Equipment operating hours after mission
    """
    try:
        # Log the incoming request
        print("📥 Received mission reliability calculation request:")
        print(f"   Config: {mission_config.config_name}")
        print(f"   Ship: {mission_config.ship_name}")
        print(f"   Duration: {mission_config.total_duration}h")
        print(f"   Phases: {len(mission_config.phases)}")
        
        # Convert Pydantic model to dict for calculator
        mission_dict = mission_config.model_dump()
        
        # Calculate mission reliability
        print("🔄 Starting reliability calculation...")
        result = await calculator.calculate(mission_dict)
        
        # Check if calculation was successful
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
            raise HTTPException(
                status_code=400, 
                detail=f"Calculation failed: {error_msg}"
            )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        print(f"💥 Internal server error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )


@reliability_router.get("/calculate-dummy")
async def calculate_mission_reliability_dummy():
    """
    Calculate mission reliability using predefined dummy data.
    This is useful for testing without sending a full configuration.
    
    Simply hit this endpoint to get a sample mission reliability result.
    """
    try:
        print("📥 Using dummy mission configuration...")
        
        # Hardcoded mission config (dummy data for testing)
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
                        {
                            "component_id": "5358d044-9f4f-44cf-a975-341221f7189d",
                            "name": "Gas Turbine",
                            "nomenclature": "GT 1"
                        },
                        {
                            "component_id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
                            "name": "Gas Turbine",
                            "nomenclature": "GT 3"
                        }
                    ]
                },
                "power_generation": {
                    "system_id": "017bdf6b-d9f2-4f31-869d-842ad61a9627",
                    "selected_equipment": [
                        {
                            "component_id": "443360a0-6218-486b-a34c-1813963177b7",
                            "name": "Generator",
                            "nomenclature": "GTG 1"
                        },
                        {
                            "component_id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
                            "name": "Generator",
                            "nomenclature": "GTG 3"
                        }
                    ]
                },
                "support": {
                    "system_id": "6b3a59eb-4cc2-4480-b512-9357aed35540",
                    "selected_equipment": [
                        {
                            "component_id": "308804ec-bca2-45e9-b665-515de88ffa70",
                            "name": "Air Conditioner",
                            "nomenclature": "AC 6"
                        },
                        {
                            "component_id": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
                            "name": "Air Conditioner",
                            "nomenclature": "AC 4"
                        },
                        {
                            "component_id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
                            "name": "Air Conditioner",
                            "nomenclature": "AC 5"
                        },
                        {
                            "component_id": "73c2a73c-0e92-4742-9775-af95e89e1841",
                            "name": "Air Conditioner",
                            "nomenclature": "AC 3"
                        }
                    ]
                },
                "firing": {
                    "system_id": "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
                    "selected_equipment": [
                        {
                            "component_id": "1c16dacf-69cd-4061-b004-113d85948c61",
                            "name": "Missile",
                            "nomenclature": "BrahMos"
                        },
                        {
                            "component_id": "db30946a-2baf-49e4-9ceb-ec72365089b4",
                            "name": "Super Rapid Gun Mount",
                            "nomenclature": "SRGM 1"
                        }
                    ]
                }
            }
        }
        
        # Calculate mission reliability
        print("🔄 Starting reliability calculation with dummy data...")
        result = await calculator.calculate(mission_config)
        
        # Return the result
        if result['success']:
            print("✅ Dummy mission reliability calculated successfully")
            return {
                "success": True,
                "message": "Mission reliability calculated successfully (using dummy data)",
                "data": result['data']
            }
        else:
            error_msg = result.get('error', 'Unknown error')
            print(f"❌ Calculation failed: {error_msg}")
            raise HTTPException(
                status_code=400, 
                detail=f"Calculation failed: {error_msg}"
            )
    
    except Exception as e:
        print(f"💥 Internal server error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )


@reliability_router.post("/compare")
async def compare_mission_configurations(
    original_config: MissionConfigRequest,
    alternative_equipment: Dict[str, List[str]]
):
    """
    Compare mission reliability with alternative equipment selections.
    
    Parameters:
    - original_config: The base mission configuration
    - alternative_equipment: Dict mapping phase indices to alternative equipment nomenclatures
      Example: {"phase_0": ["GT 2", "GTG 2"], "phase_1": ["AC 1", "AC 2"]}
    
    Returns comparison of reliabilities between original and alternative configurations.
    """
    try:
        print("📥 Received comparison request")
        print(f"   Original Config: {original_config.config_name}")
        print(f"   Alternative Equipment: {alternative_equipment}")
        
        # Calculate original configuration reliability
        original_dict = original_config.model_dump()
        original_result = await calculator.calculate(original_dict)
        
        if not original_result['success']:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to calculate original configuration: {original_result.get('error')}"
            )
        
        # TODO: Implement logic to swap equipment and recalculate
        # This would require:
        # 1. Parse alternative_equipment selections
        # 2. Map nomenclatures to component_ids
        # 3. Replace equipment in systems for specified phases
        # 4. Recalculate reliability with new configuration
        
        # For now, return the original calculation
        # You'll need to implement the equipment swap logic based on your requirements
        
        return {
            "success": True,
            "message": "Comparison calculation placeholder - implement equipment swap logic",
            "original": original_result['data'],
            "alternative": None  # Will contain alternative calculation results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Error in comparison: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@reliability_router.get("/health")
async def health_check():
    """
    Simple health check endpoint to verify the service is running.
    """
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
    Fetch alpha, beta, and current age for equipment
    
    Returns:
        (alpha, beta, current_age)
    """
    try:
        # Fetch alpha/beta
        results = await alpha_beta_repo.get_alphabeta_by_component_id(
            uuid.UUID(component_id)
        )
        
        if not results:
            raise ValueError(f"No alpha/beta found for component {component_id}")
        
        alpha_beta = results[0]
        alpha = alpha_beta.alpha
        beta = alpha_beta.beta
        
        # Fetch current age
        current_age = await utilization_repo.get_curr_age(component_id)
        
        return (alpha, beta, current_age)
    
    except Exception as e:
        logger.error(f"Failed to fetch parameters for {component_id}: {e}")
        raise
@reliability_router.post("/compare-batch", response_model=BatchComparisonResponse)
async def compare_batch_missions(
    batch_request: BatchComparisonRequest,
    alpha_beta_repo = Depends(get_alpha_beta_repository),  # Replace with actual dependency
    utilization_repo = Depends(get_monthly_utilization_repository)  # Replace with actual dependency
):
    """
    Calculate reliability for multiple mission configurations using series system
    
    - No k-of-n redundancy logic
    - Simple multiplication of all equipment reliabilities
    - Equipment ages accumulate across phases if reused
    """
    try:
        logger.info(f"Starting batch comparison for {len(batch_request.comparisons)} configurations")
        
        results = []
        
        for comparison in batch_request.comparisons:
            logger.info(f"Processing comparison: {comparison.config_name}")
            
            # Track equipment ages across phases
            equipment_ages: Dict[str, float] = {}
            equipment_used_in_phases: Dict[str, List[int]] = {}
            
            mission_reliability = 1.0
            phase_results = []
            
            # Sort phases by sequence
            sorted_phases = sorted(comparison.phases, key=lambda p: p.sequence_order)
            
            for phase in sorted_phases:
                logger.info(f"  Phase {phase.sequence_order}: {phase.phase_name} ({phase.duration_hours}h)")
                
                phase_reliability = 1.0
                equipment_details = []
                
                # Collect all equipment in this phase
                all_equipment = []
                
                # Helper to add equipment from system
                def add_system_equipment(system_name: str, equipment_list: List[EquipmentSelection]):
                    for equip in equipment_list:
                        all_equipment.append({
                            'system': system_name,
                            'component_id': equip.component_id,
                            'name': equip.name,
                            'nomenclature': equip.nomenclature
                        })
                
                # Add equipment from each system
                if phase.propulsion:
                    add_system_equipment('propulsion', phase.propulsion)
                if phase.power_generation:
                    add_system_equipment('power_generation', phase.power_generation)
                if phase.support:
                    add_system_equipment('support', phase.support)
                if phase.firing:
                    add_system_equipment('firing', phase.firing)
                
                # Calculate reliability for each equipment
                for equip in all_equipment:
                    equip_id = equip['component_id']
                    
                    # Fetch parameters if not already fetched
                    if equip_id not in equipment_ages:
                        alpha, beta, current_age = await fetch_equipment_parameters(
                            equip_id,
                            alpha_beta_repo,
                            utilization_repo
                        )
                        equipment_ages[equip_id] = current_age
                        equipment_used_in_phases[equip_id] = []
                        
                        # Store alpha/beta for this equipment
                        equipment_ages[f"{equip_id}_alpha"] = alpha
                        equipment_ages[f"{equip_id}_beta"] = beta
                    
                    # Get current parameters
                    current_age = equipment_ages[equip_id]
                    alpha = equipment_ages[f"{equip_id}_alpha"]
                    beta = equipment_ages[f"{equip_id}_beta"]
                    
                    # Check if reused
                    is_reused = len(equipment_used_in_phases[equip_id]) > 0
                    
                    # Calculate Weibull reliability
                    equip_rel, _ = Reliability.reliability_alpha_beta(
                        alpha=alpha,
                        beta=beta,
                        current_age=current_age,
                        duration=phase.duration_hours
                    )
                    
                    # Multiply into phase reliability
                    phase_reliability *= equip_rel
                    
                    # Age the equipment
                    new_age = current_age + phase.duration_hours
                    equipment_ages[equip_id] = new_age
                    equipment_used_in_phases[equip_id].append(phase.sequence_order)
                    
                    # Store equipment details
                    equipment_details.append(EquipmentResult(
                        nomenclature=equip['nomenclature'],
                        system=equip['system'],
                        reliability=round(equip_rel, 6),
                        alpha=round(alpha, 8),
                        beta=round(beta, 4),
                        age_before=round(current_age, 2),
                        age_after=round(new_age, 2),
                        duration=round(phase.duration_hours, 2),
                        is_reused=is_reused
                    ))
                    
                    logger.debug(f"    {equip['nomenclature']}: rel={equip_rel:.6f}, "
                               f"age {current_age:.1f}h → {new_age:.1f}h")
                
                # Store phase result
                phase_results.append(PhaseResult(
                    phase_name=phase.phase_name,
                    sequence=phase.sequence_order,
                    duration_hours=phase.duration_hours,
                    phase_reliability=round(phase_reliability, 6),
                    equipment=equipment_details
                ))
                
                # Multiply into mission reliability
                mission_reliability *= phase_reliability
                
                logger.info(f"  Phase reliability: {phase_reliability:.6f}")
            
            # Extract final ages (only numeric ages, not alpha/beta)
            equipment_final_ages = {
                nomenclature: round(age, 2)
                for key, age in equipment_ages.items()
                if not key.endswith('_alpha') and not key.endswith('_beta')
                for equip in all_equipment
                if equip['component_id'] == key
                for nomenclature in [equip['nomenclature']]
            }
            
            # Store comparison result
            results.append(ComparisonResult(
                comparison_id=comparison.id,
                config_name=comparison.config_name,
                ship_name=comparison.ship_name,
                mission_reliability=round(mission_reliability, 6),
                total_duration=comparison.total_duration,
                phases=phase_results,
                equipment_final_ages=equipment_final_ages
            ))
            
            logger.info(f"Completed {comparison.config_name}: "
                       f"mission_reliability={mission_reliability:.6f}")
        
        logger.info("Batch comparison completed successfully")
        
        return BatchComparisonResponse(
            success=True,
            results=results
        )
    
    except Exception as e:
        logger.error(f"Batch comparison failed: {str(e)}", exc_info=True)
        return BatchComparisonResponse(
            success=False,
            results=[],
            error=str(e)
        )
