from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from api.models.systemconfiguration import SystemConfiguration


class NPRDDataBase(SQLModel):
    """Base model for Navy Parts Reliability Data (NPRD)"""
    component_id: UUID = Field(foreign_key="system_configuration.component_id", index=True)
    failure_rate: float = Field(gt=0, description="Failure rate (λ)")
    beta: float = Field(gt=0, description="Shape parameter (β) - typically 1.5 or 2.5")


class NPRDData(NPRDDataBase, table=True):
    __tablename__ = "EB_nprd"

    id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship()


class NPRDDataCreate(NPRDDataBase):
    """Schema for creating NPRD records"""
    pass


class NPRDDataRead(NPRDDataBase):
    """Schema for reading NPRD records"""
    id: UUID
    created_date: datetime
    modified_date: datetime


class NPRDDataUpdate(SQLModel):
    """Schema for updating NPRD records"""
    failure_rate: Optional[float] = None
    beta: Optional[float] = None