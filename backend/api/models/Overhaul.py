from datetime import date
from typing import TYPE_CHECKING, Optional
import uuid
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .systemconfiguration import SystemConfiguration

class Overhaul_metadata(SQLModel, table=True):
    __tablename__ = "Overhaul_metadata"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    component_id: uuid.UUID = Field(foreign_key="system_configuration.component_id")
    overhaul_frequency_hours: int  # Hours between overhauls
    total_overhaul_events: int     # Total overhauls performed
    last_overhaul_date: Optional[str] = None  # Date of the last overhaul in ISO format
    component: Optional["SystemConfiguration"] = Relationship(back_populates="overhaul_metadata_records")


class Overhaul_Readings(SQLModel, table=True):
    __tablename__ = "Overhaul_Readings"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    component_id: uuid.UUID = Field(foreign_key="system_configuration.component_id")
    maintenance_type: str  
    defect_date: date    
    cmms_running_age: float  
    running_age: float 
    component: Optional["SystemConfiguration"] = Relationship(back_populates="overhaul_readings_records")


# Overhaul Metadata Models
class OverhaulMetadataCreate(SQLModel):
    component_id: uuid.UUID
    overhaul_frequency_hours: int
    total_overhaul_events: Optional[int] = 0
    last_overhaul_date: Optional[str] = None

class OverhaulMetadataUpdate(SQLModel):
    component_id: Optional[uuid.UUID] = None
    overhaul_frequency_hours: Optional[int] = None
    total_overhaul_events: Optional[int] = None
    last_overhaul_date: Optional[str] = None

class OverhaulMetadataResponse(SQLModel):
    id: uuid.UUID
    component_id: uuid.UUID
    overhaul_frequency_hours: int
    total_overhaul_events: int
    last_overhaul_date: Optional[str] = None

    class Config:
        from_attributes = True


# Overhaul Readings Models
class OverhaulReadingsCreate(SQLModel):
    component_id: uuid.UUID
    maintenance_type: str
    defect_date: date
    cmms_running_age: float
    running_age: float

class OverhaulReadingsUpdate(SQLModel):
    component_id: Optional[uuid.UUID] = None
    maintenance_type: Optional[str] = None
    defect_date: Optional[date] = None
    cmms_running_age: Optional[float] = None
    running_age: Optional[float] = None

class OverhaulReadingsResponse(SQLModel):
    id: uuid.UUID
    component_id: uuid.UUID
    maintenance_type: str
    defect_date: date
    cmms_running_age: float
    running_age: float

    class Config:
        from_attributes = True