"""
Models for deleting specific table data for a component
File: backend/models/delete_specific.py
"""
from sqlmodel import SQLModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from enum import Enum


class TableType(str, Enum):
    """Available tables for selective deletion"""
    SENSOR_READINGS = "sensor_readings"
    SENSOR_METADATA = "sensor_metadata"
    FAILURE_MODES = "failure_modes"
    ETL_EXECUTION_LOGS = "etl_execution_logs"
    ETL_EXECUTION_PROGRESS = "etl_execution_progress"
    ETL_SCHEDULES = "etl_schedules"
    ETL_AUDIT_LOGS = "etl_audit_logs"
    WATCHMAN_AUDIT_LOGS = "watchman_audit_logs"
    OVERHAUL_READINGS = "overhaul_readings"
    OVERHAUL_METADATA = "overhaul_metadata"
    RCM_RECORDS = "rcm_records"
    ETA_BETA_RECORDS = "eta_beta_records"
    ALPHA_BETA_RECORDS = "alpha_beta_records"


class DeleteSpecificInfoRequest(SQLModel):
    """Request model for deleting specific table data"""
    component_id: UUID
    table_type: TableType
    confirm_deletion: bool = False


class DeleteSpecificInfoResult(SQLModel):
    """Response model for specific deletion"""
    component_id: UUID
    component_name: str
    ship_name: str
    department_name: str
    table_type: str
    records_deleted: int
    deleted: bool
    warnings: List[str] = []
    timestamp: datetime


class AvailableTablesResponse(SQLModel):
    """Response model listing available tables with record counts"""
    component_id: UUID
    component_name: str
    tables: dict  # TableType -> record count