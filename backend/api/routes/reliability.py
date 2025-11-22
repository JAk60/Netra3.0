import sys
sys.path.append('..')
sys.path.append('../../')
from backend.api.db.dependencies import get_system_config_repository
from backend.reliabilty.relformulas import Reliability
from utils.logging_config import logger
from fastapi import APIRouter, HTTPException, Query
from typing import List
import uuid

from api.models.reliability import (
    AlphaBetaCreate, AlphaBetaRead,
    EtaBetaCreate, EtaBetaRead,EtaBeta,AlphaBeta
)

from backend.api.db.repositories import EtaBetaRepository, AlphaBetaRepository
from pydantic import BaseModel
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
    result = await repo.get_by_component_id(component_id)
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