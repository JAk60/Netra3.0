# ==================== api/routers/reliability_calculations.py ====================

"""
FastAPI Router for Reliability Calculations

Each endpoint:
1. Accepts input data from frontend
2. Saves data to appropriate table
3. Calculates eta/beta
4. Saves/updates eta/beta table
5. Returns calculated parameters

Frontend only needs to send data - all processing happens server-side.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid
import logging


# Import models
from api.models.reliability import (
    ActualDataCreate,
    IntervalDataCreate,
    OEMDataCreate,
    OEMExpertDataCreate,
    ExpertJudgementCreate,
    ProbabilityFailureCreate,
    NPRDDataCreate
)

# Import service

# Import response models
from pydantic import BaseModel, Field

from reliabilty.eta_beta_calc import Reliability_via_eta_beta_CalculationService, ReliabilityCalculationError

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="",
    tags=["Assembly level Reliability Calculations"]
)

# Initialize service
service = Reliability_via_eta_beta_CalculationService()


# ==================== RESPONSE MODELS ====================

class EtaBetaResponse(BaseModel):
    """Response model for eta/beta calculations"""
    component_id: uuid.UUID
    eta: float = Field(..., description="Scale parameter (characteristic life)")
    beta: float = Field(..., description="Shape parameter")
    priority: int = Field(..., description="Data priority level (1-7)")
    message: str = Field(..., description="Success message")

    class Config:
        json_schema_extra = {
            "example": {
                "component_id": "123e4567-e89b-12d3-a456-426614174000",
                "eta": 2500.50,
                "beta": 2.35,
                "priority": 1,
                "message": "Successfully calculated eta/beta from actual data"
            }
        }


class BestEtaBetaResponse(BaseModel):
    """Response model for best eta/beta query"""
    component_id: uuid.UUID
    eta: float
    beta: float
    priority: int
    message: str


class AllEtaBetaResponse(BaseModel):
    """Response model for all eta/beta calculations"""
    component_id: uuid.UUID
    calculations: List[dict]
    count: int
    message: str


# ==================== PRIORITY 1: ACTUAL DATA ====================

@router.post(
    "/actual-data",
    response_model=EtaBetaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate from Actual Data (Priority 1)",
    description="""
    Calculate eta/beta from actual field data with exact dates.
    
    **Process:**
    1. Saves actual data records to database
    2. Extracts TTF (Time-To-Failure) values
    3. Applies Maximum Likelihood Estimation
    4. Saves/updates eta/beta in database
    5. Returns calculated parameters
    
    **Priority:** 1 (Highest - most reliable)
    **Method:** MLE (Maximum Likelihood Estimation)
    **Data Required:** Exact installation and removal dates
    """
)
async def calculate_from_actual_data(
    component_id: uuid.UUID,
    data: List[ActualDataCreate]
) -> EtaBetaResponse:
    """
    Priority 1: Calculate eta/beta from actual field data.
    Frontend sends: component_id + list of actual data records
    Backend handles: Everything else
    """
    try:
        logger.info(f"Received actual data calculation request for component {component_id}")
        
        # Service handles everything: save data, calculate, save results
        eta, beta = await service.calculate_from_actual_data(component_id, data)
        
        return EtaBetaResponse(
            component_id=component_id,
            eta=eta,
            beta=beta,
            priority=1,
            message=f"Successfully calculated eta/beta from {len(data)} actual data records"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during calculation"
        )


# ==================== PRIORITY 2: INTERVAL DATA ====================

@router.post(
    "/interval-data",
    response_model=EtaBetaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate from Interval Data (Priority 2)",
    description="""
    Calculate eta/beta from interval data with date ranges.
    
    **Process:**
    1. Saves interval data records to database
    2. Uses mean dates to calculate TTF values
    3. Applies Maximum Likelihood Estimation
    4. Saves/updates eta/beta in database
    5. Returns calculated parameters
    
    **Priority:** 2
    **Method:** MLE on mean dates
    **Data Required:** Date ranges for installation and removal
    """
)
async def calculate_from_interval_data(
    component_id: uuid.UUID,
    data: List[IntervalDataCreate]
) -> EtaBetaResponse:
    """
    Priority 2: Calculate eta/beta from interval data.
    Frontend sends: component_id + list of interval data records
    Backend handles: Everything else
    """
    try:
        logger.info(f"Received interval data calculation request for component {component_id}")
        
        eta, beta = await service.calculate_from_interval_data(component_id, data)
        
        return EtaBetaResponse(
            component_id=component_id,
            eta=eta,
            beta=beta,
            priority=2,
            message=f"Successfully calculated eta/beta from {len(data)} interval data records"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during calculation"
        )


# ==================== PRIORITY 3: OEM DATA ====================

@router.post(
    "/oem-data",
    response_model=EtaBetaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate from OEM Data (Priority 3)",
    description="""
    Calculate eta/beta from OEM reliability data (L10/L90 estimates).
    
    **Process:**
    1. Saves OEM data to database
    2. Solves Weibull equations from two life estimates
    3. Saves/updates eta/beta in database
    4. Generates synthetic TTF points
    5. Returns calculated parameters
    
    **Priority:** 3
    **Method:** System of equations from percentile data
    **Data Required:** Two life estimates (e.g., L10=1000, L90=5000)
    """
)
async def calculate_from_oem_data(
    component_id: uuid.UUID,
    data: OEMDataCreate
) -> EtaBetaResponse:
    """
    Priority 3: Calculate eta/beta from OEM data.
    Frontend sends: component_id + OEM life estimates
    Backend handles: Everything else
    """
    try:
        logger.info(f"Received OEM data calculation request for component {component_id}")
        
        eta, beta = await service.calculate_from_oem_data(component_id, data)
        
        return EtaBetaResponse(
            component_id=component_id,
            eta=eta,
            beta=beta,
            priority=3,
            message=f"Successfully calculated eta/beta from OEM data ({data.life_estimate1_name}, {data.life_estimate2_name})"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during calculation"
        )


# ==================== PRIORITY 4: OEM + EXPERT DATA ====================

@router.post(
    "/oem-expert-data",
    response_model=EtaBetaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate from OEM + Expert Data (Priority 4)",
    description="""
    Calculate eta/beta from OEM data combined with expert judgement.
    
    **Process:**
    1. Saves OEM expert data to database
    2. Applies expert judgement constraints with OEM data
    3. Saves/updates eta/beta in database
    4. Generates synthetic TTF points
    5. Returns calculated parameters
    
    **Priority:** 4
    **Method:** Expert judgement with OEM constraints
    **Data Required:** OEM life estimate + expert min/max/likely estimates
    """
)
async def calculate_from_oem_expert(
    component_id: uuid.UUID,
    data: OEMExpertDataCreate
) -> EtaBetaResponse:
    """
    Priority 4: Calculate eta/beta from OEM + expert data.
    Frontend sends: component_id + OEM expert data
    Backend handles: Everything else
    """
    try:
        logger.info(f"Received OEM expert calculation request for component {component_id}")
        
        eta, beta = await service.calculate_from_oem_expert(component_id, data)
        
        return EtaBetaResponse(
            component_id=component_id,
            eta=eta,
            beta=beta,
            priority=4,
            message="Successfully calculated eta/beta from OEM expert data"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during calculation"
        )


# ==================== PRIORITY 5: EXPERT JUDGEMENT ====================

@router.post(
    "/expert-judgement",
    response_model=EtaBetaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate from Expert Judgement (Priority 5)",
    description="""
    Calculate eta/beta from pure expert judgement.
    
    **Process:**
    1. Saves expert judgement data to database
    2. Applies expert constraints (min, most likely, max)
    3. Saves/updates eta/beta in database
    4. Generates synthetic TTF points
    5. Returns calculated parameters
    
    **Priority:** 5
    **Method:** Expert judgement constraints
    **Data Required:** Expert estimates (min, most likely, max life)
    """
)
async def calculate_from_expert_judgement(
    component_id: uuid.UUID,
    data: ExpertJudgementCreate
) -> EtaBetaResponse:
    """
    Priority 5: Calculate eta/beta from expert judgement.
    Frontend sends: component_id + expert judgement data
    Backend handles: Everything else
    """
    try:
        logger.info(f"Received expert judgement calculation request for component {component_id}")
        
        eta, beta = await service.calculate_from_expert_judgement(component_id, data)
        
        return EtaBetaResponse(
            component_id=component_id,
            eta=eta,
            beta=beta,
            priority=5,
            message="Successfully calculated eta/beta from expert judgement"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during calculation"
        )


# ==================== PRIORITY 6: PROBABILITY FAILURE ====================

@router.post(
    "/probability-failure",
    response_model=EtaBetaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate from Probability Failure Data (Priority 6)",
    description="""
    Calculate eta/beta from known failure probabilities at specific times.
    
    **Process:**
    1. Saves probability failure data to database
    2. Applies linear regression (Weibull probability plotting)
    3. Saves/updates eta/beta in database
    4. Generates synthetic TTF points
    5. Returns calculated parameters
    
    **Priority:** 6
    **Method:** Linear regression on transformed data
    **Data Required:** Time-probability pairs (e.g., at 100h: 10% failed, at 200h: 30% failed)
    """
)
async def calculate_from_probability_failure(
    component_id: uuid.UUID,
    data: List[ProbabilityFailureCreate]
) -> EtaBetaResponse:
    """
    Priority 6: Calculate eta/beta from probability failure data.
    Frontend sends: component_id + list of time-probability pairs
    Backend handles: Everything else
    """
    try:
        logger.info(f"Received probability failure calculation request for component {component_id}")
        
        eta, beta = await service.calculate_from_probability_failure(component_id, data)
        
        return EtaBetaResponse(
            component_id=component_id,
            eta=eta,
            beta=beta,
            priority=6,
            message=f"Successfully calculated eta/beta from {len(data)} probability data points"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during calculation"
        )


# ==================== PRIORITY 7: NPRD DATA ====================

@router.post(
    "/nprd-data",
    response_model=EtaBetaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate from NPRD Data (Priority 7)",
    description="""
    Calculate eta from NPRD failure rate data with known beta.
    
    **Process:**
    1. Saves NPRD data to database
    2. Calculates eta from failure rate and beta
    3. Saves/updates eta/beta in database
    4. Generates synthetic TTF points
    5. Returns calculated parameters
    
    **Priority:** 7 (Lowest)
    **Method:** Eta calculation from failure rate
    **Data Required:** NPRD failure rate and known beta value
    
    **Example Request:**
    ```json
    {
      "component_id": "123e4567-e89b-12d3-a456-426614174000",
      "failure_rate": 0.0001,
      "beta": 2.5
    }
    ```
    """
)
async def calculate_from_nprd(
    component_id: uuid.UUID,
    data: NPRDDataCreate
) -> EtaBetaResponse:
    """
    Priority 7: Calculate eta/beta from NPRD data.
    Frontend sends: component_id + NPRD failure rate + beta
    Backend handles: 
    - Insert into NPRD table
    - Calculate eta from failure rate
    - Insert/update in eta_beta table
    - Return results
    """
    try:
        logger.info(f"Received NPRD calculation request for component {component_id}")
        
        # Service handles:
        # 1. Insert into nprd table
        # 2. Calculate eta (beta is provided)
        # 3. Insert/update eta_beta table
        eta, beta = await service.calculate_from_nprd(component_id, data)
        
        return EtaBetaResponse(
            component_id=component_id,
            eta=eta,
            beta=beta,
            priority=7,
            message=f"Successfully calculated eta from NPRD data (failure_rate={data.failure_rate})"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during calculation"
        )


# ==================== QUERY ENDPOINTS ====================

@router.get(
    "/best/{component_id}",
    response_model=BestEtaBetaResponse,
    summary="Get Best Eta/Beta for Component",
    description="""
    Retrieve the best (highest priority) eta/beta calculation for a component.
    Returns the calculation with the lowest priority number (most reliable).
    """
)
async def get_best_eta_beta(component_id: uuid.UUID) -> BestEtaBetaResponse:
    """
    Get the best available eta/beta for a component.
    Returns highest priority (lowest number) calculation.
    """
    try:
        logger.info(f"Retrieving best eta/beta for component {component_id}")
        
        eta, beta = await service.get_best_eta_beta(component_id)
        
        # Get the priority from the record
        result = await service.eta_beta_repo.get_by_priority(component_id)
        
        return BestEtaBetaResponse(
            component_id=component_id,
            eta=eta,
            beta=beta,
            priority=result.priority,
            message=f"Best eta/beta retrieved (Priority {result.priority})"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Failed to retrieve eta/beta: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get(
    "/all/{component_id}",
    response_model=AllEtaBetaResponse,
    summary="Get All Eta/Beta Calculations for Component",
    description="""
    Retrieve all eta/beta calculations for a component across all priority levels.
    Useful for comparison or audit trail.
    """
)
async def get_all_eta_beta(component_id: uuid.UUID) -> AllEtaBetaResponse:
    """
    Get all eta/beta calculations for a component (all priorities).
    """
    try:
        logger.info(f"Retrieving all eta/beta calculations for component {component_id}")
        
        results = await service.get_all_eta_beta_for_component(component_id)
        
        calculations = [
            {
                "eta": r.eta,
                "beta": r.beta,
                "priority": r.priority,
                "created_date": r.created_date.isoformat() if hasattr(r, 'created_date') else None,
                "modified_date": r.modified_date.isoformat() if hasattr(r, 'modified_date') else None
            }
            for r in results
        ]
        
        return AllEtaBetaResponse(
            component_id=component_id,
            calculations=calculations,
            count=len(calculations),
            message=f"Retrieved {len(calculations)} eta/beta calculations"
        )
        
    except ReliabilityCalculationError as e:
        logger.error(f"Failed to retrieve eta/beta: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# ==================== HEALTH CHECK ====================

@router.get(
    "/health",
    summary="Health Check",
    description="Check if the reliability calculation service is running"
)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "reliability_calculations",
        "endpoints": [
            "POST /actual-data",
            "POST /interval-data",
            "POST /oem-data",
            "POST /oem-expert-data",
            "POST /expert-judgement",
            "POST /probability-failure",
            "POST /nprd-data",
            "GET /best/{component_id}",
            "GET /all/{component_id}"
        ]
    }