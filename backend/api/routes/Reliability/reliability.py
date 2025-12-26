
import sys

from fastapi.params import Depends

from api.db.repos.reliability.rcm import RcmRepository
from api.models.Rcm import RCM, RCMCreate, RCMUpdate
from api.db.repos.reliability.alpha_beta import AlphaBetaRepository
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository
from reliabilty.optimize import optimizer
sys.path.append('..')
sys.path.append('../../')
from backend.api.db.dependencies import get_eta_beta_repository, get_rcm_repo, get_system_config_repository
from backend.reliabilty.relformulas import Reliability
from utils.logging_config import logger
from fastapi import APIRouter, Body, HTTPException, Query
from typing import Any, Dict, List
import uuid

from api.models.reliability.params import (
    AlphaBetaCreate, AlphaBetaRead,
    EtaBetaCreate, EtaBetaRead,EtaBeta,AlphaBeta
)


from pydantic import BaseModel, Field
from typing import Optional, Union

class ReliabilityResult(BaseModel):
    component_id: uuid.UUID
    nomenclature: str
    reliability: Optional[float]
    method: Optional[str] = None
    error: Optional[str] = None
router = APIRouter(prefix="", tags=["Reliability"])


@router.post("/eta-beta", response_model=EtaBeta, status_code=201)
async def create_eta_beta(data: EtaBetaCreate):
    repo = EtaBetaRepository()
    new_record = EtaBeta(**data.dict())
    return await repo.create(new_record)


@router.get("/eta-beta", response_model=List[EtaBeta])
async def get_all_eta_beta():
    repo = EtaBetaRepository()
    return await repo.get_all()


@router.get("/eta-beta/{component_id}", response_model=List[EtaBetaRead])
async def get_eta_beta_by_component(component_id: uuid.UUID):
    repo = EtaBetaRepository()
    result = await repo.get_by_component_id(component_id)
    return result


@router.post("/alpha-beta", response_model=AlphaBeta, status_code=201)
async def create_alpha_beta(data: AlphaBetaCreate):
    repo = AlphaBetaRepository()
    new_record = AlphaBeta(**data.dict())
    return await repo.create(new_record)


@router.get("/alpha-beta", response_model=List[AlphaBeta])
async def get_all_alpha_beta():
    repo = AlphaBetaRepository()
    return await repo.get_all()


@router.get("/alpha-beta/{component_id}", response_model=List[AlphaBetaRead])
async def get_alpha_beta_by_component(component_id: uuid.UUID):
    repo = AlphaBetaRepository()
    result = await repo.get_alphabeta_by_component_id(component_id)
    logger.info(
        f"Retrieved AlphaBeta records for component {component_id}: {result}")
    return result


@router.get("/reliability/{component_id}", response_model=float)
async def get_reliability_by_component(
    component_id: uuid.UUID,
    duration: float = Query(..., gt=0,
                            description="Duration to calculate reliability for"),
):
    alpha_beta_repo = AlphaBetaRepository()
    eta_beta_repo = EtaBetaRepository()

    # Try AlphaBeta first
    alpha_beta_records = await alpha_beta_repo.get_by_component_id(component_id)
    if alpha_beta_records:
        record = alpha_beta_records[0]
        alpha = record.alpha
        beta = record.beta
        age = getattr(record, "current_age", 0) or 0
        reliability = Reliability.reliability_alpha_beta(
            duration, alpha, beta, current_age=age)
        return reliability

    # Try EtaBeta if AlphaBeta not found
    eta_beta_records = await eta_beta_repo.get_by_component_id(component_id)
    if eta_beta_records:
        record = eta_beta_records[0]
        eta = record.eta
        beta = record.beta
        # EtaBeta doesn't store current_age → default to 0
        reliability = Reliability.reliability_eta_beta(
            duration, eta, beta, initial_age=0)
        return reliability

    raise HTTPException(
        status_code=404, detail=f"No AlphaBeta or EtaBeta record found for component {component_id}")

@router.get("/reliability/test/{nomenclature}", response_model=float)
async def get_reliability_by_component(
    nomenclature:str,
    duration: float = Query(..., gt=0,
                            description="Duration to calculate reliability for"),
):
    alpha_beta_repo = AlphaBetaRepository()
    eta_beta_repo = EtaBetaRepository()
    sys_repo = get_system_config_repository()
  
    component_id= await sys_repo.get_component_id_by_nomenclature(nomenclature)
    # Try AlphaBeta first
    alpha_beta_records = await alpha_beta_repo.get_by_component_id(component_id)
    if alpha_beta_records:
        record = alpha_beta_records[0]
        alpha = record.alpha
        beta = record.beta
        age = getattr(record, "current_age", 0) or 0
        reliability = Reliability.reliability_alpha_beta(
            duration, alpha, beta, current_age=age)
        return reliability

    # Try EtaBeta if AlphaBeta not found
    eta_beta_records = await eta_beta_repo.get_by_component_id(component_id)
    if eta_beta_records:
        record = eta_beta_records[0]
        eta = record.eta
        beta = record.beta
        # EtaBeta doesn't store current_age → default to 0
        reliability = Reliability.reliability_eta_beta(
            duration, eta, beta, initial_age=0)
        return reliability

    raise HTTPException(
        status_code=404, detail=f"No AlphaBeta or EtaBeta record found for component {component_id}")

@router.get("/reliability/test/{name}", response_model=Union[List[ReliabilityResult], ReliabilityResult])
async def get_reliability_by_component(
    name: str,
    duration: float = Query(..., gt=0,
                            description="Duration to calculate reliability for"),
):
    # Call the async method and await the result
    result = await Reliability.reliability(duration, name)
    return result




rcm_router = APIRouter(prefix="/rcm", tags=["RCM"])



# ==================== CREATE ====================
@rcm_router.post("/", response_model=RCM, status_code=201)
async def create_rcm(
    rcm_data: RCMCreate,
    repo: RcmRepository = Depends(get_rcm_repo)
):
    """
    Create a new RCM record.
    
    Args:
        rcm_data: RCM creation data
        
    Returns:
        Created RCM record
    """
    try:
        rcm = await repo.create(rcm_data)
        return rcm
    except Exception as e:
        logger.error(f"Error creating RCM: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create RCM record: {str(e)}")
    
@rcm_router.post("/bulk_create", response_model=List[RCM], status_code=201)
async def create_rcm_bulk(
    rcm_data_list: List[RCMCreate],
    repo: RcmRepository = Depends(get_rcm_repo)
):
    """
    Create multiple RCM records in bulk (all-or-nothing).
    
    Args:
        rcm_data_list: List of RCM creation data
        
    Returns:
        List of created RCM records
        
    Raises:
        HTTPException: If any record fails to create
    """
    try:
        # If your repo supports bulk operations
        if hasattr(repo, 'create_bulk'):
            rcms = await repo.create_bulk(rcm_data_list)
        else:
            # Sequential creation within transaction
            rcms = []
            for rcm_data in rcm_data_list:
                rcm = await repo.create(rcm_data)
                rcms.append(rcm)
        
        return rcms
        
    except Exception as e:
        logger.error(f"Error in bulk RCM creation: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create RCM records in bulk: {str(e)}"
        )

# ==================== READ ====================
@rcm_router.get("/", response_model=List[Dict[str, Any]])
async def get_all_rcm(
    ship_id: Optional[str] = Query(None, description="Filter by ship ID"),
    component_id: Optional[str] = Query(None, description="Filter by component ID"),
    repo: RcmRepository = Depends(get_rcm_repo)
):
    """
    Get all RCM records with optional filtering.
    
    Args:
        ship_id: Optional ship ID to filter records
        component_id: Optional component ID to filter records
        
    Returns:
        List of RCM records with component details
    """
    try:
        rcm_records = await repo.get_all(ship_id=ship_id, component_id=component_id)
        return rcm_records
    except Exception as e:
        logger.error(f"Error retrieving RCM records: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve RCM records: {str(e)}")


@rcm_router.get("/{rcm_id}", response_model=Dict[str, Any])
async def get_rcm_by_id(
    rcm_id: str,
    repo: RcmRepository = Depends(get_rcm_repo)
):
    """
    Get a specific RCM record by ID.
    
    Args:
        rcm_id: RCM record ID
        
    Returns:
        RCM record with component details
        
    Raises:
        HTTPException: 404 if RCM record not found
    """
    try:
        rcm = await repo.get_by_id(rcm_id)
        if not rcm:
            raise HTTPException(status_code=404, detail=f"RCM record not found: {rcm_id}")
        return rcm
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving RCM record {rcm_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve RCM record: {str(e)}")


@rcm_router.get("/component/{component_id}", response_model=Dict[str, Any])
async def get_rcm_by_component(
    component_id: str,
    repo: RcmRepository = Depends(get_rcm_repo)
):
    """
    Get RCM record by component ID.
    
    Args:
        component_id: Component ID
        
    Returns:
        RCM record with component details
        
    Raises:
        HTTPException: 404 if RCM record not found for component
    """
    try:
        rcm = await repo.get_by_component(component_id)
        if not rcm:
            raise HTTPException(
                status_code=404, 
                detail=f"RCM record not found for component: {component_id}"
            )
        return rcm
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving RCM for component {component_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve RCM record: {str(e)}")


# ==================== UPDATE ====================
@rcm_router.put("/{rcm_id}", response_model=RCM)
async def update_rcm(
    rcm_id: str,
    rcm_data: RCMUpdate,
    repo: RcmRepository = Depends(get_rcm_repo)
):
    """
    Update an existing RCM record.
    
    Args:
        rcm_id: RCM record ID
        rcm_data: Updated RCM data
        
    Returns:
        Updated RCM record
        
    Raises:
        HTTPException: 404 if RCM record not found
    """
    try:
        rcm = await repo.update(rcm_id, rcm_data)
        if not rcm:
            raise HTTPException(status_code=404, detail=f"RCM record not found: {rcm_id}")
        return rcm
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating RCM {rcm_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update RCM record: {str(e)}")


@rcm_router.patch("/{rcm_id}", response_model=RCM)
async def partial_update_rcm(
    rcm_id: str,
    rcm_data: RCMUpdate,
    repo: RcmRepository = Depends(get_rcm_repo)
):
    """
    Partially update an existing RCM record.
    
    Args:
        rcm_id: RCM record ID
        rcm_data: Partial RCM data to update
        
    Returns:
        Updated RCM record
        
    Raises:
        HTTPException: 404 if RCM record not found
    """
    try:
        rcm = await repo.update(rcm_id, rcm_data)
        if not rcm:
            raise HTTPException(status_code=404, detail=f"RCM record not found: {rcm_id}")
        return rcm
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error partially updating RCM {rcm_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update RCM record: {str(e)}")


# ==================== DELETE ====================
@rcm_router.delete("/{rcm_id}", status_code=204)
async def delete_rcm(
    rcm_id: str,
    repo: RcmRepository = Depends(get_rcm_repo)
):
    """
    Delete an RCM record.
    
    Args:
        rcm_id: RCM record ID
        
    Returns:
        No content on successful deletion
        
    Raises:
        HTTPException: 404 if RCM record not found
    """
    try:
        deleted = await repo.delete(rcm_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"RCM record not found: {rcm_id}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting RCM {rcm_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete RCM record: {str(e)}")
    

class ComponentInput(BaseModel):
    """Component input - supports both asset_id lookup and direct parameters"""
    asset_id: Optional[str] = Field(None, description="Asset ID to fetch eta/beta from repository")
    component_id: Optional[str] = Field(None, description="Component ID to fetch eta/beta from repository")  # ADD THIS
    eta: Optional[float] = Field(None, description="Eta parameter (scale)", gt=0)
    eeta: Optional[float] = Field(None, description="Eta parameter (alternative spelling)", gt=0)
    beta: Optional[float] = Field(None, description="Beta parameter (shape)", gt=0)
    cost: Optional[float] = Field(0, description="Component cost", ge=0, alias="c")
    repair_time: Optional[float] = Field(0, description="Repair time", ge=0, alias="rt")
    
    class Config:
        populate_by_name = True

class OptimizeRequest(BaseModel):
    """Optimization request - supports single or multiple components"""
    method: str = Field(..., description="Optimization method")
    
    # Single component (legacy format)
    asset_id: Optional[str] = Field(None, description="Single asset ID")
    beta: Optional[float] = Field(None, description="Single component beta", gt=0)
    eta: Optional[float] = Field(None, description="Single component eta", gt=0)
    eeta: Optional[float] = Field(None, description="Single component eta (alternative)", gt=0)
    
    # Multiple components (new format)
    components: Optional[List[ComponentInput]] = Field(None, description="List of components")
    
    # Legacy numbered format support
    n: Optional[int] = Field(None, description="Number of components (legacy format)", gt=0, le=100)
    
    # Method-specific parameters
    cf: Optional[float] = Field(None, description="Corrective failure cost", gt=0)
    cp: Optional[float] = Field(None, description="Preventive cost", gt=0)
    df: Optional[float] = Field(None, description="Downtime failure", gt=0)
    dp: Optional[float] = Field(None, description="Downtime preventive", gt=0)
    pmdt: Optional[float] = Field(None, description="Preventive maintenance downtime", ge=0)
    cpm: Optional[float] = Field(None, description="Cost per maintenance", ge=0)
    p_values: Optional[List[float]] = Field(None, description="Risk probability values for risk_target method")
    
    class Config:
        # Allow extra fields for legacy numbered format (component_1_eta, component_2_beta, etc.)
        extra = "allow"

@rcm_router.post("/optimize")
async def optimize_endpoint(
    request: OptimizeRequest = Body(...),
    eta_beta_repo: EtaBetaRepository = Depends(get_eta_beta_repository)
):
    """
    Optimize maintenance strategy using various methods.
    
    **Supports both single and multiple components:**
    
    **Format 1: Single Component (Legacy)**
    ```json
    {
        "method": "age_based",
        "asset_id": "asset_123",  // OR provide beta/eta directly
        "beta": 2.5,
        "eta": 1000,
        "cf": 100,
        "cp": 50
    }
    ```
    
    **Format 2: Multiple Components (New - List)**
    ```json
    {
        "method": "age_based",
        "cf": 100,
        "cp": 50,
        "components": [
            {"asset_id": "asset_1"},
            {"beta": 2.5, "eta": 1000, "cost": 500, "repair_time": 4},
            {"asset_id": "asset_2", "cost": 300, "repair_time": 2}
        ]
    }
    ```
    
    **Format 3: Multiple Components (Legacy - Numbered)**
    ```json
    {
        "method": "component_group",
        "n": 2,
        "component_1_asset_id": "asset_1",
        "component_2_beta": 2.5,
        "component_2_eta": 1000,
        "component_2_c": 300,
        "component_2_rt": 2,
        "pmdt": 10,
        "cpm": 5,
        "cf": 100
    }
    ```
    
    **Available Methods:**
    - age_based: Age-based replacement optimization
    - downtime_based: Downtime-based replacement
    - component_group: Component group with costs
    - downtime_component_group: Component group downtime
    - calendar_time: Calendar time-based optimization
    - calender_downtime: Calendar downtime optimization (note: typo kept for compatibility)
    - risk_target: Calculate time for risk probabilities
    """
    # Convert Pydantic model to dict for optimizer function
    data = request.model_dump(exclude_none=True, by_alias=True)
    
    return await optimizer(data, eta_beta_repo)