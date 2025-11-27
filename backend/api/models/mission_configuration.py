# models/Mission_configuration.py
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

class MissionConfigurationBase(SQLModel):
    config_name: str
    ship_id: UUID = Field(foreign_key="ships.ship_id")
    ship_name: str
    configuration: dict = {}  # Default empty dict

class MissionConfiguration(MissionConfigurationBase, table=True):
    __tablename__ = "Mission_configurations"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)
    configuration: dict = Field(default={}, sa_column=Column(JSON))

class MissionConfigurationCreate(MissionConfigurationBase):
    pass

class MissionConfigurationUpdate(SQLModel):
    config_name: Optional[str] = None
    configuration: Optional[dict] = None

class MissionConfigurationRead(MissionConfigurationBase):
    """Response model for API endpoints"""
    id: str
    created_date: datetime
    modified_date: datetime
    
    class Config:
        from_attributes = True  # Allows conversion from ORM models