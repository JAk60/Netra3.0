from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import JSON
from typing import Optional

class MissionConfigurationBase(SQLModel):
    config_name: str
    ship_id: UUID = Field(foreign_key="ships.ship_id")
    ship_name: str
    configuration: dict = {}  # Default empty dict

class MissionConfiguration(MissionConfigurationBase, table=True, extend_existing=True):
    __tablename__ = "Mission_configurations"

    # Use Field() for UUID without sa_column
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True  # Let SQLModel handle it automatically
    )
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)
    configuration: dict = Field(default={}, sa_column=Column(JSON))

# No need for sa_column in the primary key `id`

class MissionConfigurationCreate(MissionConfigurationBase):
    pass

class MissionConfigurationUpdate(SQLModel):
    config_name: Optional[str] = None
    configuration: Optional[dict] = None


class MissionConfigurationRead(MissionConfigurationBase):
    id: UUID   # ← FIX HERE
    created_date: datetime
    modified_date: datetime

    class Config:
        from_attributes = True