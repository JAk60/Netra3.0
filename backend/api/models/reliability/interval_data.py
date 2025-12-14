from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime, date
from typing import Optional, TYPE_CHECKING
from .actual_data import FailureStatusEnum

if TYPE_CHECKING:
    from api.models.systemconfiguration import SystemConfiguration


class IntervalDataBase(SQLModel):
    """Base model for interval data points (when exact dates are unknown)"""
    component_id: UUID = Field(foreign_key="system_configuration.component_id", index=True)
    installation_start_date: date = Field(description="Installation interval start")
    installation_end_date: date = Field(description="Installation interval end")
    removal_start_date: date = Field(description="Removal interval start")
    removal_end_date: date = Field(description="Removal interval end")
    f_s: FailureStatusEnum = Field(description="Failure or Suspension status")


class IntervalData(IntervalDataBase, table=True):
    __tablename__ = "EB_interval_data"

    id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship()


class IntervalDataCreate(IntervalDataBase):
    """Schema for creating interval data records"""
    pass


class IntervalDataRead(IntervalDataBase):
    """Schema for reading interval data records"""
    id: UUID
    created_date: datetime
    modified_date: datetime


class IntervalDataUpdate(SQLModel):
    """Schema for updating interval data records"""
    installation_start_date: Optional[date] = None
    installation_end_date: Optional[date] = None
    removal_start_date: Optional[date] = None
    removal_end_date: Optional[date] = None
    f_s: Optional[FailureStatusEnum] = None