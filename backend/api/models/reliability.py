# backend/api/models/reliabilty.py
from pydantic import BaseModel
from typing import List, Optional, Union
from enum import Enum

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
import uuid

if TYPE_CHECKING:
    from .systemconfiguration import SystemConfiguration


class EtaBeta(SQLModel, table=True):
    __tablename__ = "etabeta"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    eta: float
    beta: float
    component_id: uuid.UUID = Field(foreign_key="system_configuration.component_id")
    priority: int

    component: Optional["SystemConfiguration"] = Relationship(back_populates="eta_beta_records")


class AlphaBeta(SQLModel, table=True):
    __tablename__ = "alphabeta"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    alpha: float
    beta: float
    component_id: uuid.UUID = Field(foreign_key="system_configuration.component_id")

    component: Optional["SystemConfiguration"] = Relationship(back_populates="alpha_beta_records")



# EtaBeta
class EtaBetaCreate(SQLModel):
    eta: float
    beta: float
    component_id: uuid.UUID
    priority: int


class EtaBetaRead(SQLModel):
    id: uuid.UUID
    eta: float
    beta: float
    component_id: uuid.UUID
    priority: int


# AlphaBeta
class AlphaBetaCreate(SQLModel):
    alpha: float
    beta: float
    component_id: uuid.UUID


class AlphaBetaRead(SQLModel):
    id: uuid.UUID
    alpha: float
    beta: float
    component_id: uuid.UUID


class MonthlyUtilization(SQLModel, table=True):
    __tablename__ = "monthly_utilization"
    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    operation_date: datetime
    utlization: Decimal
    component_id: uuid.UUID = Field(foreign_key="system_configuration.component_id")

    

class ComponentType(str, Enum):
    STANDARD = "standard"
    NOMENCLATURE = "nomenclature"

class ComponentRequest(BaseModel):
    name: str
    type: Optional[ComponentType] = None

class NomenclatureSelection(BaseModel):
    selected: Union[str, List[str]]  # Single nomenclature or "all"
    standard_name: str

class ReliabilityRequest(BaseModel):
    nomenclature: str
    parameters: Optional[dict] = {}

class ReliabilityResponse(BaseModel):
    nomenclature: str
    reliability_score: float
    mtbf: Optional[float] = None
    mttr: Optional[float] = None
    availability: Optional[float] = None
    calculation_details: Optional[dict] = None

class ComponentLookupResponse(BaseModel):
    standard_name: str
    nomenclatures: List[str]
    total_count: int