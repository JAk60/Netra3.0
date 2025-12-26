from sqlmodel import Column, SQLModel, Field
from sqlalchemy import Text
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


# ============================================
# TABLE MODELS
# ============================================

class ETLSchedule(SQLModel, table=True):
    """Job scheduling configuration"""
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
    
    # NEW: Execution control fields
    session_id: Optional[int] = None
    current_execution_id: Optional[UUID] = None
    cancellation_requested: bool = Field(default=False)
    last_trigger_type: Optional[str] = Field(default=None, max_length=20)  # 'auto', 'manual'
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ETLExecutionProgress(SQLModel, table=True):
    """Tracks real-time job execution progress"""
    __tablename__ = "etl_execution_progress"
    
    execution_id: UUID = Field(default_factory=uuid4, primary_key=True)
    component_id: Optional[UUID] = Field(default=None, foreign_key="system_configuration.component_id")
    job_name: str = Field(max_length=100)  # 'monthly_utilization' or 'overhaul_readings'
    status: str = Field(default="queued", max_length=20)  # queued, running, completed, failed, cancelled, completed_with_errors
    
    # Progress tracking
    total_items: int = Field(default=0)
    processed_items: int = Field(default=0)
    progress_percent: int = Field(default=0)
    current_step: Optional[str] = Field(default=None, max_length=255)
    
    # Timing
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Metrics
    rows_processed: int = Field(default=0)
    rows_inserted: int = Field(default=0)
    rows_updated: int = Field(default=0)
    error_count: int = Field(default=0)
    
    # Execution context
    triggered_by: str = Field(max_length=100)  # 'auto', 'manual:user@email.com', 'auto_retry:1'
    session_id: Optional[int] = None  # SQL session for cancellation
    error_message: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ETLExecutionLog(SQLModel, table=True):
    """Real-time log entries for job execution"""
    __tablename__ = "etl_execution_logs"
    
    log_id: UUID = Field(default_factory=uuid4, primary_key=True)
    execution_id: UUID = Field(foreign_key="etl_execution_progress.execution_id")
    
    log_level: str = Field(max_length=20)  # DEBUG, INFO, WARNING, ERROR
    message: str = Field(sa_column=Column(Text))
    source: str = Field(max_length=100, default="sql")  # 'fastapi', 'sql_print', 'sql_error'
    
    logged_at: datetime = Field(default_factory=datetime.utcnow)


class ETLAuditLog(SQLModel, table=True):
    """Historical audit log for completed jobs"""
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


# ============================================
# API REQUEST MODELS
# ============================================

class JobExecutionRequest(SQLModel):
    """Request to execute a job"""
    component_id: Optional[UUID] = None  # None for overhaul_readings (all components)
    force: bool = False  # Override running check


class ETLScheduleUpdate(SQLModel):
    """Update schedule configuration"""
    frequency_minutes: Optional[int] = None
    max_retries: Optional[int] = None
    status: Optional[str] = None  # For pause/resume


# ============================================
# API RESPONSE MODELS
# ============================================

class ETLScheduleRead(SQLModel):
    """Schedule configuration details"""
    component_id: UUID
    frequency_minutes: int
    last_run_time: Optional[datetime]
    next_run_time: Optional[datetime]
    status: str
    retry_count: int
    max_retries: int
    error_message: Optional[str]
    session_id: Optional[int]
    current_execution_id: Optional[UUID]
    cancellation_requested: bool
    last_trigger_type: Optional[str]
    created_at: datetime
    updated_at: datetime


class ExecutionStatusResponse(SQLModel):
    """Job execution status"""
    execution_id: UUID
    job_name: str
    component_id: Optional[UUID]
    status: str
    progress_percent: int
    current_step: Optional[str]
    
    start_time: datetime
    end_time: Optional[datetime]
    duration_seconds: Optional[int]
    
    rows_processed: int
    rows_inserted: int
    rows_updated: int
    error_count: int
    error_message: Optional[str]
    
    triggered_by: str


class LogEntry(SQLModel):
    """Single log entry"""
    log_id: UUID
    execution_id: UUID
    log_level: str
    message: str
    source: str
    logged_at: datetime


class ETLAuditLogRead(SQLModel):
    """Audit log entry"""
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
    """Dashboard statistics"""
    total_components: int
    active_components: int
    currently_running: int
    idle: int
    in_error: int
    paused: int
    
    total_runs_today: int
    successful_runs_today: int
    failed_runs_today: int
    success_rate_today: float
    
    avg_duration_seconds: Optional[float]
    total_rows_processed_today: int
    
    next_scheduled_run: Optional[datetime]


class ETLComponentStatus(SQLModel):
    """Detailed component status"""
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
    current_execution_id: Optional[UUID]


class JobExecutionResponse(SQLModel):
    """Response when job is triggered"""
    execution_id: UUID
    status: str  # 'queued', 'running'
    message: str
    component_id: Optional[UUID]
    job_name: str


class ActiveJobsResponse(SQLModel):
    """List of currently running jobs"""
    total: int
    jobs: list[ExecutionStatusResponse]