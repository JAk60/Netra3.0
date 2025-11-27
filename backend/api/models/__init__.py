# models/__init__.py
from sqlmodel import SQLModel
# Import all models here in the correct order
from api.models.systemconfiguration import SystemConfiguration, Department, Ship,System
from api.models.sensor import SensorMetadata, SensorReading, FailureMode
from api.models.users import User, UserRead, UserRole, UserUpdate, RefreshToken
from api.models.reliability import AlphaBeta, EtaBeta
from api.models.etl import ETLSchedule, ETLAuditLog
from api.models.mission_configuration import MissionConfiguration
from api.models.Overhaul import Overhaul_metadata, Overhaul_Readings
__all__ = [
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