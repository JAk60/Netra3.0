"""
SQLModel models for additional info tables.
All tables reference system_configuration.component_id as FK.
"""

import uuid
from datetime import date
from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


# ─────────────────────────────────────────────────────────────
# 1. Maintenance Configuration
# ─────────────────────────────────────────────────────────────

class MaintenanceConfigurationBase(SQLModel):
    component_id: UUID = Field(
        foreign_key="system_configuration.component_id",
        index=True,
    )
    pm_applicable: Optional[str] = Field(default=None, max_length=20)
    can_be_replaced_by_ship_staff: Optional[str] = Field(default=None, max_length=20)
    is_system_param_recorded: Optional[str] = Field(default=None, max_length=20)


class MaintenanceConfigurationData(MaintenanceConfigurationBase, table=True):
    __tablename__ = "maintenance_configuration_data"

    maintenance_id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )


class MaintenanceConfigurationCreate(MaintenanceConfigurationBase):
    pass


class MaintenanceConfigurationRead(MaintenanceConfigurationBase):
    maintenance_id: UUID


# ─────────────────────────────────────────────────────────────
# 2. Redundancy Data
# ─────────────────────────────────────────────────────────────

class RedundancyDataBase(SQLModel):
    component_id: UUID = Field(
        foreign_key="system_configuration.component_id",
        index=True,
    )
    k: Optional[str] = Field(default=None, max_length=1)
    n: Optional[int] = Field(default=None)
    redundancy_type: Optional[str] = Field(default=None)
    system_name: Optional[str] = Field(default=None)
    system_parent_name: Optional[str] = Field(default=None)


class RedundancyData(RedundancyDataBase, table=True):
    __tablename__ = "redundancy_data"

    redundancy_id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )


class RedundancyDataCreate(RedundancyDataBase):
    pass


class RedundancyDataRead(RedundancyDataBase):
    redundancy_id: UUID


# ─────────────────────────────────────────────────────────────
# 3. Maintenance Data
# ─────────────────────────────────────────────────────────────

class MaintenanceDataBase(SQLModel):
    component_id: UUID = Field(
        foreign_key="system_configuration.component_id",
        index=True,
    )
    event_type: Optional[str] = Field(default=None, max_length=200)
    maint_date: Optional[date] = Field(default=None)
    maintenance_type: Optional[str] = Field(default=None, max_length=200)
    replaced_component_type: Optional[str] = Field(default=None, max_length=200)
    cannabalised_age: Optional[str] = Field(default=None, max_length=100)
    maintenance_duration: Optional[float] = Field(default=None)
    failure_mode: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)


class DataManagerMaintenanceData(MaintenanceDataBase, table=True):
    __tablename__ = "data_manager_maintenance_data"

    id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )


class MaintenanceDataCreate(MaintenanceDataBase):
    pass


class MaintenanceDataRead(MaintenanceDataBase):
    id: UUID


# ─────────────────────────────────────────────────────────────
# 4. System Config Additional Info
# ─────────────────────────────────────────────────────────────

class SystemConfigAdditionalInfoBase(SQLModel):
    component_id: Optional[UUID] = Field(
        default=None,
        foreign_key="system_configuration.component_id",
        index=True,
    )
    component_name: Optional[str] = Field(default=None)
    num_cycle_or_runtime: Optional[float] = Field(default=None)
    installation_date: Optional[date] = Field(default=None)
    unit: Optional[str] = Field(default=None)


class SystemConfigAdditionalInfo(SystemConfigAdditionalInfoBase, table=True):
    __tablename__ = "system_config_additional_info"

    id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )


class SystemConfigAdditionalInfoCreate(SystemConfigAdditionalInfoBase):
    pass


class SystemConfigAdditionalInfoRead(SystemConfigAdditionalInfoBase):
    id: UUID