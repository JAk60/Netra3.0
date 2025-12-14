from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from .actual_data import FailureStatusEnum

if TYPE_CHECKING:
    from api.models.systemconfiguration import SystemConfiguration

class TTFDataBase(SQLModel):
    """Base model for Time To Failure (TTF) data points"""
    component_id: UUID = Field(foreign_key="system_configuration.component_id", index=True)
    hours: float = Field(gt=0, description="Time to failure in hours")
    f_s: FailureStatusEnum = Field(description="Failure or Suspension status")
    priority: int = Field(
        ge=1, 
        le=7, 
        description="Priority level (1-7): indicates data source quality"
    )


class TTFData(TTFDataBase, table=True):
    __tablename__ = "EB_TTF_data"

    id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship()


class TTFDataCreate(TTFDataBase):
    """Schema for creating TTF records"""
    pass


class TTFDataRead(TTFDataBase):
    """Schema for reading TTF records"""
    id: UUID
    created_date: datetime
    modified_date: datetime


class TTFDataUpdate(SQLModel):
    """Schema for updating TTF records"""
    hours: Optional[float] = None
    f_s: Optional[FailureStatusEnum] = None
    priority: Optional[int] = None