"""
Models for equipment unregistration (deletion with cascade)
File: backend/models/unregister.py
"""
from sqlmodel import SQLModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional


class ComponentDeletionSummary(SQLModel):
    """Summary of records deleted per table"""
    sensor_readings: int = 0
    sensor_metadata: int = 0
    failure_modes: int = 0
    etl_execution_logs: int = 0
    etl_execution_progress: int = 0
    etl_schedules: int = 0
    etl_audit_logs: int = 0
    watchman_audit_logs: int = 0
    overhaul_readings: int = 0
    overhaul_metadata: int = 0
    rcm_records: int = 0
    eta_beta_records: int = 0
    alpha_beta_records: int = 0
    child_components: int = 0
    total_records_deleted: int = 0


class UnregisterEquipmentResult(SQLModel):
    """Response model for equipment unregistration"""
    component_id: UUID
    component_name: str
    ship_name: str
    department_name: str
    deleted: bool
    deletion_summary: ComponentDeletionSummary
    warnings: List[str] = []
    deleted_children: List[str] = []  # Names of deleted child components
    timestamp: datetime


class UnregisterEquipmentRequest(SQLModel):
    """Request model for equipment unregistration"""
    component_id: UUID
    confirm_deletion: bool = False  # Safety flag to prevent accidental deletion