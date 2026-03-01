# models/__init__.py
from sqlmodel import SQLModel
# Import all models here in the correct order
from api.models.systemconfiguration import SystemConfiguration, Department, Ship,System
from api.models.sensor import SensorMetadata, SensorReading, FailureMode
from api.models.users import User, UserRead, UserRole, UserUpdate, RefreshToken
from api.models.reliability.params import AlphaBeta, EtaBeta
from api.models.etl import ETLSchedule, ETLAuditLog
from api.models.mission_configuration import MissionConfiguration
from api.models.Overhaul import Overhaul_metadata, Overhaul_Readings
from api.models.Rcm import RCM
from api.models.settings import SystemSettings
from api.models.additional_info_tables import (
    MaintenanceConfigurationData,
    RedundancyData,
    DataManagerMaintenanceData,
    SystemConfigAdditionalInfo,
)
__all__ = [
    "MaintenanceConfigurationData",
    "RedundancyData",
    "DataManagerMaintenanceData",
    "SystemConfigAdditionalInfo",
    "SystemSettings",
    "RCM",
    "Overhaul_metadata",
    "Overhaul_Readings",
    "MissionConfiguration",
    "ETLSchedule",
    "ETLAuditLog",
    "SQLModel",
    "AlphaBeta", 
    "EtaBeta",
    "System",
    "SystemConfiguration",
    "System", 
    "Department", 
    "Ship", 
    "SensorMetadata", 
    "SensorReading", 
    "FailureMode",
    "User",
    "UserRead",
    "UserRole",
    "UserUpdate",
    "RefreshToken",
]