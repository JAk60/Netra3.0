# models/ship_configuration.py

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime
from uuid import uuid4

class ShipConfigurationBase(SQLModel):
    config_name: str
    ship_id: str
    ship_name: str
    configuration: dict  # Will be JSON in DB

class ShipConfiguration(ShipConfigurationBase, table=True):
    __tablename__ = "ship_configurations"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    created_date: datetime = Field(default_factory=datetime.utcnow)
    modified_date: datetime = Field(default_factory=datetime.utcnow)
    configuration: dict = Field(sa_column=Column(JSON))

class ShipConfigurationCreate(ShipConfigurationBase):
    pass

class ShipConfigurationUpdate(SQLModel):
    config_name: str | None = None
    configuration: dict | None = None