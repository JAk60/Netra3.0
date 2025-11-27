from sqlmodel import Column, SQLModel, Field
from sqlalchemy import Text
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


# ETL Schedule Table
class ETLSchedule(SQLModel, table=True):
    __tablename__ = "etl_schedule"

    component_id: UUID = Field(
        primary_key=True,
        foreign_key="system_configuration.component_id"
    )
    frequency_minutes: int = Field(default=5)
    last_run_time: Optional[datetime] = None
    next_run_time: Optional[datetime] = None
    status: str = Field(default="idle", max_length=20)  # idle, running, error, paused
    retry_count: int = Field(default=0)
    max_retries: int = Field(default=3)
    error_message: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ETL Audit Log Table
class ETLAuditLog(SQLModel, table=True):
    __tablename__ = "etl_audit_log"

    log_id: UUID = Field(default_factory=uuid4, primary_key=True)
    run_id: UUID = Field(default_factory=uuid4)
    component_id: UUID = Field(foreign_key="system_configuration.component_id")
    ship_name: Optional[str] = Field(default=None, max_length=255)
    nomenclature: Optional[str] = Field(default=None, sa_column=Column(Text))
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_ms: Optional[int] = None
    rows_processed: int = Field(default=0)
    rows_inserted: int = Field(default=0)
    rows_updated: int = Field(default=0)
    status: str = Field(max_length=20)
    error_details: Optional[str] = Field(default=None, sa_column=Column(Text))
    retry_attempt: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Read-only models for API responses
class ETLScheduleRead(SQLModel):
    component_id: UUID
    frequency_minutes: int
    last_run_time: Optional[datetime]
    next_run_time: Optional[datetime]
    status: str
    retry_count: int
    max_retries: int
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime


class ETLScheduleUpdate(SQLModel):
    frequency_minutes: Optional[int] = None
    max_retries: Optional[int] = None


class ETLAuditLogRead(SQLModel):
    log_id: UUID
    run_id: UUID
    component_id: UUID
    ship_name: Optional[str]
    nomenclature: Optional[str]
    start_time: datetime
    end_time: Optional[datetime]
    duration_ms: Optional[int]
    rows_processed: int
    rows_inserted: int
    rows_updated: int
    status: str
    error_details: Optional[str]
    retry_attempt: int
    created_at: datetime


class ETLDashboardStats(SQLModel):
    total_active: int
    currently_running: int
    in_error: int
    idle: int
    paused: int
    total_runs_today: int
    success_rate_today: float


class ETLComponentStatus(SQLModel):
    component_id: UUID
    component_name: str
    ship_name: str
    nomenclature: Optional[str]
    etl_enabled: bool
    frequency_minutes: int
    status: str
    last_run_time: Optional[datetime]
    next_run_time: Optional[datetime]
    retry_count: int
    error_message: Optional[str]
    last_success_time: Optional[datetime]
    total_rows_last_run: Optional[int]