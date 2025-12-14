from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from api.models.systemconfiguration import SystemConfiguration


# ==================== OEM Data (L10/L90) ====================
class OEMDataBase(SQLModel):
    """Base model for OEM reliability data (L10/L90 estimates)"""
    component_id: UUID = Field(foreign_key="system_configuration.component_id", index=True)
    life_estimate1_name: str = Field(max_length=50, description="e.g., 'L10'")
    life_estimate1_val: float = Field(description="Life estimate value 1")
    life_estimate2_name: str = Field(max_length=50, description="e.g., 'L90'")
    life_estimate2_val: float = Field(description="Life estimate value 2")


class OEMData(OEMDataBase, table=True):
    __tablename__ = "EB_oem"

    id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship()


class OEMDataCreate(OEMDataBase):
    pass


class OEMDataRead(OEMDataBase):
    id: UUID
    created_date: datetime
    modified_date: datetime


# ==================== OEM + Expert Data ====================
class OEMExpertDataBase(SQLModel):
    """Base model for OEM data combined with expert judgement"""
    component_id: UUID = Field(foreign_key="system_configuration.component_id", index=True)
    most_likely_life: float = Field(description="Most likely life estimate")
    max_life: float = Field(description="Maximum life estimate")
    min_life: float = Field(description="Minimum life estimate")
    life_estimate_name: Optional[str] = Field(default=None, max_length=50, description="e.g., 'L50'")
    life_estimate_val: Optional[float] = Field(default=None, description="Additional life estimate value")
    num_component_wo_failure: int = Field(ge=0, description="Number of components seen without failure")
    time_wo_failure: float = Field(ge=0, description="Total time observed without failure")


class OEMExpertData(OEMExpertDataBase, table=True):
    __tablename__ = "EB_oem_expert"

    id: UUID = Field(primary_key=True, default_factory=uuid4)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship()


class OEMExpertDataCreate(OEMExpertDataBase):
    pass


class OEMExpertDataRead(OEMExpertDataBase):
    id: UUID
    created_date: datetime
    modified_date: datetime


class OEMExpertDataUpdate(SQLModel):
    most_likely_life: Optional[float] = None
    max_life: Optional[float] = None
    min_life: Optional[float] = None
    life_estimate_name: Optional[str] = None
    life_estimate_val: Optional[float] = None
    num_component_wo_failure: Optional[int] = None
    time_wo_failure: Optional[float] = None