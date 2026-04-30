from sqlmodel import Column, SQLModel, Field, Relationship, JSON
from uuid import UUID, uuid4
from datetime import datetime
from typing import Any, Dict, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from api.models.systemconfiguration import SystemConfiguration

from sqlmodel import SQLModel, Field
from datetime import datetime

class RCM(SQLModel, table=True):
    __tablename__ = "rcm"

    rcm_id: UUID = Field(default_factory=uuid4, primary_key=True)
    component_id: UUID = Field(foreign_key="system_configuration.component_id")  # must match type
    decision_path: dict = Field(default={},sa_column=Column(JSON))
    maintenance_policy: str | None = None
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    component: Optional["SystemConfiguration"] = Relationship(
        back_populates="rcm_records"
    )

    # Pydantic models for request/response


class RCMCreate(SQLModel):
    component_id: str
    decision_path: Dict[str, Any] = {}
    maintenance_policy: Optional[str] = None


class RCMUpdate(SQLModel):
    decision_path: Optional[Dict[str, Any]] = None
    maintenance_policy: Optional[str] = None


class RCMRead(SQLModel):
    rcm_id: str
    component_id: str
    decision_path: Dict[str, Any]
    maintenance_policy: Optional[str]
    created_date: datetime
    modified_date: datetime
    nomenclature: Optional[str] = None
    component_name: Optional[str] = None

    class Config:
        from_attributes = True
