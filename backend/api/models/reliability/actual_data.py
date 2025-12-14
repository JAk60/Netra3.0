from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime, date
from typing import Optional, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from api.models.systemconfiguration import SystemConfiguration


class FailureStatusEnum(str, Enum):
    """Enum for failure/suspension status"""
    FAILURE = "Failure"
    SUSPENSION = "Suspension"


class ActualDataBase(SQLModel):
    """Base model for actual field data points"""
    component_id: UUID = Field(foreign_key="system_configuration.component_id", index=True)
    interval_start_date: date = Field(description="Installation date")
    interval_end_date: date = Field(description="Removal date")
    f_s: FailureStatusEnum = Field(description="Failure or Suspension status")


class ActualData(ActualDataBase, table=True):
    __tablename__ = "EB_actual_data"

    id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship()


class ActualDataCreate(ActualDataBase):
    """Schema for creating actual data records"""
    pass


class ActualDataRead(ActualDataBase):
    """Schema for reading actual data records"""
    id: UUID
    created_date: datetime
    modified_date: datetime


class ActualDataUpdate(SQLModel):
    """Schema for updating actual data records"""
    interval_start_date: Optional[date] = None
    interval_end_date: Optional[date] = None
    f_s: Optional[FailureStatusEnum] = None