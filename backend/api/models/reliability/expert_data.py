from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from api.models.systemconfiguration import SystemConfiguration


class ExpertJudgementBase(SQLModel):
    """Base model for expert judgement reliability data"""
    component_id: UUID = Field(foreign_key="system_configuration.component_id", index=True)
    most_likely_life: float = Field(description="Most likely life estimate from expert")
    max_life: float = Field(description="Maximum life estimate from expert")
    min_life: float = Field(description="Minimum life estimate from expert")
    num_component_wo_failure: int = Field(ge=0, description="Number of components seen without failure")
    time_wo_failure: float = Field(ge=0, description="Total time observed without failure")


class ExpertJudgement(ExpertJudgementBase, table=True):
    __tablename__ = "EB_expert"

    id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship()


class ExpertJudgementCreate(ExpertJudgementBase):
    """Schema for creating expert judgement records"""
    pass


class ExpertJudgementRead(ExpertJudgementBase):
    """Schema for reading expert judgement records"""
    id: UUID
    created_date: datetime
    modified_date: datetime


class ExpertJudgementUpdate(SQLModel):
    """Schema for updating expert judgement records"""
    most_likely_life: Optional[float] = None
    max_life: Optional[float] = None
    min_life: Optional[float] = None
    num_component_wo_failure: Optional[int] = None
    time_wo_failure: Optional[float] = None