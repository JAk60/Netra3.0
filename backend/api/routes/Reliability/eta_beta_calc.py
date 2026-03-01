# backend/api/routes/Reliability/reliability_data.py
from fastapi import APIRouter, HTTPException
from typing import List
import uuid

from api.models.reliability import (
    ActualData, ActualDataCreate,
    IntervalData, IntervalDataCreate,
    ExpertJudgement, ExpertJudgementCreate,
    NPRDData, NPRDDataCreate,
    OEMData, OEMDataCreate,
    OEMExpertData, OEMExpertDataCreate,
    ProbabilityFailure, ProbabilityFailureCreate,
    TTFData,
)
from api.models.reliability.params import EtaBeta, EtaBetaRead

from api.db.repos.reliability.assemblies.actual_data import ActualDataRepository
from api.db.repos.reliability.assemblies.interval_data import IntervalDataRepository
from api.db.repos.reliability.assemblies.expert_judgement import ExpertJudgementRepository
from api.db.repos.reliability.assemblies.nprd import NPRDDataRepository
from api.db.repos.reliability.assemblies.oem import OEMDataRepository
from api.db.repos.reliability.assemblies.oem_expert import OEMExpertDataRepository
from api.db.repos.reliability.assemblies.prob_failure import ProbabilityFailureRepository
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository

router = APIRouter(prefix="/api/reliability", tags=["Reliability Data"])

# ─── Actual Data ───────────────────────────────────────────────────────────────

@router.post("/actual-data", response_model=dict)
async def create_actual_data(data: ActualDataCreate):
    repo = ActualDataRepository()
    try:
        record = await repo.create(data)
        return {"id": str(record.id), "message": "Created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/actual-data/bulk", response_model=dict)
async def create_actual_data_bulk(data: List[ActualDataCreate]):
    repo = ActualDataRepository()
    try:
        records = await repo.create_bulk(data)
        return {"inserted": len(records), "message": f"Inserted {len(records)} records"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/actual-data/component/{component_id}")
async def get_actual_data_by_component(component_id: uuid.UUID):
    repo = ActualDataRepository()
    try:
        return await repo.get_by_component(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Interval Data ─────────────────────────────────────────────────────────────

@router.post("/interval-data", response_model=dict)
async def create_interval_data(data: IntervalDataCreate):
    repo = IntervalDataRepository()
    try:
        record = await repo.create(data)
        return {"id": str(record.id), "message": "Created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interval-data/bulk", response_model=dict)
async def create_interval_data_bulk(data: List[IntervalDataCreate]):
    repo = IntervalDataRepository()
    try:
        records = await repo.create_bulk(data)
        return {"inserted": len(records), "message": f"Inserted {len(records)} records"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/interval-data/component/{component_id}")
async def get_interval_data_by_component(component_id: uuid.UUID):
    repo = IntervalDataRepository()
    try:
        return await repo.get_by_component(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Expert Judgement ──────────────────────────────────────────────────────────

@router.post("/expert-judgement", response_model=dict)
async def create_expert_judgement(data: ExpertJudgementCreate):
    repo = ExpertJudgementRepository()
    try:
        record = await repo.create(data)
        return {"id": str(record.id), "message": "Created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/expert-judgement/component/{component_id}")
async def get_expert_judgement_by_component(component_id: uuid.UUID):
    repo = ExpertJudgementRepository()
    try:
        return await repo.get_by_component(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── NPRD Data ─────────────────────────────────────────────────────────────────

@router.post("/nprd-data", response_model=dict)
async def create_nprd_data(data: NPRDDataCreate):
    repo = NPRDDataRepository()
    try:
        record = await repo.create(data)
        return {"id": str(record.id), "message": "Created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/nprd-data/component/{component_id}")
async def get_nprd_data_by_component(component_id: uuid.UUID):
    repo = NPRDDataRepository()
    try:
        return await repo.get_by_component(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── OEM Data ──────────────────────────────────────────────────────────────────

@router.post("/oem-data", response_model=dict)
async def create_oem_data(data: OEMDataCreate):
    repo = OEMDataRepository()
    try:
        record = await repo.create(data)
        return {"id": str(record.id), "message": "Created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/oem-data/component/{component_id}")
async def get_oem_data_by_component(component_id: uuid.UUID):
    repo = OEMDataRepository()
    try:
        return await repo.get_by_component(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── OEM Expert Data ───────────────────────────────────────────────────────────

@router.post("/oem-expert-data", response_model=dict)
async def create_oem_expert_data(data: OEMExpertDataCreate):
    repo = OEMExpertDataRepository()
    try:
        record = await repo.create(data)
        return {"id": str(record.id), "message": "Created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/oem-expert-data/component/{component_id}")
async def get_oem_expert_data_by_component(component_id: uuid.UUID):
    repo = OEMExpertDataRepository()
    try:
        return await repo.get_by_component(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Probability Failure ───────────────────────────────────────────────────────

@router.post("/probability-failure", response_model=dict)
async def create_probability_failure(data: ProbabilityFailureCreate):
    repo = ProbabilityFailureRepository()
    try:
        record = await repo.create(data)
        return {"id": str(record.id), "message": "Created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/probability-failure/bulk", response_model=dict)
async def create_probability_failure_bulk(data: List[ProbabilityFailureCreate]):
    repo = ProbabilityFailureRepository()
    try:
        records = await repo.create_bulk(data)
        return {"inserted": len(records), "message": f"Inserted {len(records)} records"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/probability-failure/component/{component_id}")
async def get_probability_failure_by_component(component_id: uuid.UUID):
    repo = ProbabilityFailureRepository()
    try:
        return await repo.get_by_component(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Eta / Beta ────────────────────────────────────────────────────────────────

@router.post("/eta-beta/save-or-update", response_model=EtaBetaRead)
async def save_or_update_eta_beta(
    component_id: uuid.UUID,
    eta: float,
    beta: float,
    priority: int,
):
    repo = EtaBetaRepository()
    try:
        return await repo.save_or_update(eta=eta, beta=beta, component_id=component_id, priority=priority)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/eta-beta/component/{component_id}", response_model=List[EtaBetaRead])
async def get_eta_beta_by_component(component_id: uuid.UUID):
    repo = EtaBetaRepository()
    try:
        return await repo.get_by_component_id(component_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))