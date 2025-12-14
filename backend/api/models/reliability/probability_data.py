from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from api.models.systemconfiguration import SystemConfiguration


class ProbabilityFailureBase(SQLModel):
    """Base model for probability of failure data"""
    component_id: UUID = Field(foreign_key="system_configuration.component_id", index=True)
    p_time: float = Field(gt=0, description="Time at which probability is measured (hours)")
    failure_p: float = Field(ge=0, le=100, description="Failure probability percentage (0-100)")


class ProbabilityFailure(ProbabilityFailureBase, table=True):
    __tablename__ = "EB_prob_failure"

    id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship()


class ProbabilityFailureCreate(ProbabilityFailureBase):
    """Schema for creating probability failure records"""
    pass


class ProbabilityFailureRead(ProbabilityFailureBase):
    """Schema for reading probability failure records"""
    id: UUID
    created_date: datetime
    modified_date: datetime


class ProbabilityFailureUpdate(SQLModel):
    """Schema for updating probability failure records"""
    p_time: Optional[float] = None
    failure_p: Optional[float] = None