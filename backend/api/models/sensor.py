from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from uuid import UUID, uuid4

# ======================
# Failure Mode Table
# ======================
class FailureModeBase(SQLModel):
    name: str = Field(max_length=100)
    severity: Optional[str] = Field(default=None, max_length=50)
    component_id: UUID = Field(foreign_key="system_configuration.component_id")


class FailureMode(FailureModeBase, table=True):
    __tablename__ = "failure_modes"

    failure_mode_id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Relationship to sensors that monitor this failure mode
    sensors: List["SensorMetadata"] = Relationship(back_populates="failure_mode")


class FailureModeCreate(FailureModeBase):
    pass


class FailureModeRead(FailureModeBase):
    failure_mode_id: UUID


class FailureModeUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=100)
    severity: Optional[str] = Field(default=None, max_length=50)
    component_id: Optional[UUID] = None


# ======================
# Sensor Metadata Table
# ======================
class SensorMetadataBase(SQLModel):
    sensor_name: str = Field(max_length=255)
    unit: Optional[str] = Field(default=None, max_length=50)
    min_value: float
    max_value: float
    frequency: Optional[int] = Field(default=None)
    P: Optional[float] = Field(default=None)
    F: Optional[float] = Field(default=None)
    component_id: UUID = Field(foreign_key="system_configuration.component_id")


class SensorMetadata(SensorMetadataBase, table=True):
    __tablename__ = "sensor_metadata"

    sensor_id: UUID = Field(default_factory=uuid4, primary_key=True)
    failure_mode_id: Optional[UUID] = Field(default=None, foreign_key="failure_modes.failure_mode_id")

    # Relationships
    readings: List["SensorReading"] = Relationship(back_populates="sensor")
    failure_mode: Optional["FailureMode"] = Relationship(back_populates="sensors")


class SensorMetadataCreate(SensorMetadataBase):
    failure_mode_id: Optional[UUID] = None


class SensorMetadataRead(SensorMetadataBase):
    sensor_id: UUID
    failure_mode_id: Optional[UUID]


class SensorMetadataUpdate(SQLModel):
    sensor_name: Optional[str] = Field(default=None, max_length=255)
    unit: Optional[str] = Field(default=None, max_length=50)
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    frequency: Optional[int] = None
    P: Optional[float] = None
    F: Optional[float] = None
    component_id: Optional[UUID] = None
    failure_mode_id: Optional[UUID] = None


# ======================
# Sensor Readings Table
# ======================
class SensorReadingBase(SQLModel):
    value: float
    operating_hours: Optional[int] = Field(default=None)
    alert: bool = Field(default=False)


class SensorReading(SensorReadingBase, table=True):
    __tablename__ = "sensor_readings"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    date: datetime = Field(default_factory=datetime.utcnow)
    component_id: UUID = Field(foreign_key="system_configuration.component_id")
    sensor_id: UUID = Field(foreign_key="sensor_metadata.sensor_id")

    # Relationship
    sensor: Optional["SensorMetadata"] = Relationship(back_populates="readings")

class SensorReadingResponse(BaseModel):
    id: UUID
    date: datetime
    value: float
    operating_hours: Optional[int]
    alert: bool
    component_id: UUID
    sensor_id: UUID
    
    class Config:
        from_attributes = True  # This allows creation from SQLModel objects

class SensorReadingCreate(SensorReadingBase):
    component_id: UUID
    sensor_id: UUID


class SensorReadingRead(SensorReadingBase):
    id: UUID
    date: datetime
    component_id: UUID
    sensor_id: UUID


class SensorReadingUpdate(SQLModel):
    value: Optional[float] = None
    operating_hours: Optional[int] = None
    alert: Optional[bool] = None


# ======================
# Composite Response Models
# ======================
class SensorWithReadings(SensorMetadataRead):
    readings: List[SensorReadingRead] = []


class SensorStats(SQLModel):
    sensor_id: UUID
    total_readings: int
    avg_value: float
    min_value: float
    max_value: float
    alert_count: int
    last_reading_date: Optional[datetime]