# File: backend/models/etl.py
# ENHANCED: Added nested job type statuses

from sqlmodel import Column, SQLModel, Field
from sqlalchemy import Text
from datetime import datetime, date
from typing import Optional
from uuid import UUID, uuid4


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXISTING TABLES (NO CHANGES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class ETLSchedule(SQLModel, table=True):
    """Job scheduling configuration + Watchman tracking"""
    __tablename__ = "etl_schedule"
    
    component_id: UUID = Field(primary_key=True, foreign_key="system_configuration.component_id")
    etl_type: str = Field(primary_key=True, default="monthly_utilization", max_length=50)
    
    frequency_minutes: int = Field(default=5)
    last_run_time: Optional[datetime] = None
    next_run_time: Optional[datetime] = None
    status: str = Field(default="idle", max_length=20)
    retry_count: int = Field(default=0)
    max_retries: int = Field(default=3)
    error_message: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    session_id: Optional[int] = None
    current_execution_id: Optional[UUID] = None
    cancellation_requested: bool = Field(default=False)
    last_trigger_type: Optional[str] = Field(default=None, max_length=20)
    
    source_watermark: Optional[datetime] = None
    target_watermark: Optional[datetime] = None
    rows_changed_since_last_check: Optional[int] = None
    last_change_detected: Optional[datetime] = None
    sync_risk_score: int = Field(default=0)
    last_sync_start: Optional[datetime] = None
    last_sync_duration_seconds: Optional[int] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ETLExecutionProgress(SQLModel, table=True):
    """Tracks real-time job execution progress"""
    __tablename__ = "etl_execution_progress"
    
    execution_id: UUID = Field(default_factory=uuid4, primary_key=True)
    component_id: Optional[UUID] = Field(default=None, foreign_key="system_configuration.component_id")
    job_name: str = Field(max_length=100)
    status: str = Field(default="queued", max_length=20)
    
    total_items: int = Field(default=0)
    processed_items: int = Field(default=0)
    progress_percent: int = Field(default=0)
    current_step: Optional[str] = Field(default=None, max_length=255)
    
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    rows_processed: int = Field(default=0)
    rows_inserted: int = Field(default=0)
    rows_updated: int = Field(default=0)
    error_count: int = Field(default=0)
    
    triggered_by: str = Field(max_length=100)
    session_id: Optional[int] = None
    error_message: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ETLExecutionLog(SQLModel, table=True):
    """Real-time log entries for job execution"""
    __tablename__ = "etl_execution_logs"
    
    log_id: UUID = Field(default_factory=uuid4, primary_key=True)
    execution_id: UUID = Field(foreign_key="etl_execution_progress.execution_id")
    
    log_level: str = Field(max_length=20)
    message: str = Field(sa_column=Column(Text))
    source: str = Field(max_length=100, default="sql")
    
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


class WatchmanAuditLog(SQLModel, table=True):
    """History of all watchman checks"""
    __tablename__ = "watchman_audit_log"
    
    audit_id: UUID = Field(default_factory=uuid4, primary_key=True)
    component_id: UUID = Field(foreign_key="system_configuration.component_id")
    check_timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    needs_sync: bool = Field(default=False)
    decision_reason: str = Field(max_length=100)
    
    source_row_count: Optional[int] = None
    target_row_count: Optional[int] = None
    changed_rows_count: Optional[int] = None
    source_watermark: Optional[datetime] = None
    check_duration_ms: Optional[int] = None
    
    job_queued: bool = Field(default=False)
    execution_id: Optional[UUID] = Field(default=None, foreign_key="etl_execution_progress.execution_id")
    
    triggered_by: Optional[str] = Field(default=None, max_length=50)


class WatchmanStatistics(SQLModel, table=True):
    """Aggregated daily watchman metrics"""
    __tablename__ = "watchman_statistics"
    
    stat_id: UUID = Field(default_factory=uuid4, primary_key=True)
    stat_date: date = Field(index=True)
    
    total_checks: int = Field(default=0)
    syncs_triggered: int = Field(default=0)
    syncs_skipped: int = Field(default=0)
    false_positives: int = Field(default=0)
    
    avg_check_duration_ms: Optional[float] = None
    total_time_saved_seconds: int = Field(default=0)
    total_rows_synced: int = Field(default=0)
    
    skip_rate_percent: Optional[float] = None
    accuracy_percent: Optional[float] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚡ NEW: NESTED JOB TYPE STATUS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class JobTypeStatus(SQLModel):
    """Status for a specific job type (monthly_util or overhaul)"""
    status: str                           # 'idle', 'running', 'error', 'paused'
    sync_status: str                      # 'up_to_date', 'pending_sync', 'first_run', 'error'
    needs_sync: bool
    changed_rows: Optional[int]
    risk_score: int
    last_check: Optional[datetime]
    last_sync: Optional[datetime]
    next_run: Optional[datetime]
    source_watermark: Optional[datetime]
    error_message: Optional[str]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API REQUEST MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class JobExecutionRequest(SQLModel):
    """Request to execute a job"""
    component_id: Optional[UUID] = None
    force: bool = False
    skip_watchman: bool = False


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API RESPONSE MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class ETLScheduleRead(SQLModel):
    """Schedule configuration details"""
    component_id: UUID
    etl_type: str
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
    
    source_watermark: Optional[datetime]
    target_watermark: Optional[datetime]
    rows_changed_since_last_check: Optional[int]
    sync_risk_score: int
    
    created_at: datetime
    updated_at: datetime


class ETLScheduleUpdate(SQLModel):
    """Update schedule configuration"""
    frequency_minutes: Optional[int] = None
    max_retries: Optional[int] = None
    status: Optional[str] = None
    etl_type: Optional[str] = None


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


class JobExecutionResponse(SQLModel):
    """Response when job is triggered"""
    execution_id: UUID
    status: str
    message: str
    component_id: Optional[UUID]
    job_name: str


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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚡ ENHANCED: WATCHMAN RESPONSE WITH NESTED JOB STATUSES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class WatchmanStatusResponse(SQLModel):
    """API response for watchman status with separate job type statuses"""
    component_id: UUID
    component_name: str
    ship_name: str
    nomenclature: Optional[str]
    
    # ⚡ NEW: Nested job type statuses
    monthly_utilization: JobTypeStatus
    overhaul_readings: JobTypeStatus


class WatchmanCheckResult(SQLModel):
    """Response from watchman check"""
    component_id: UUID
    needs_sync: bool
    decision_reason: str
    changed_rows: int
    source_count: Optional[int]
    target_count: Optional[int]
    source_watermark: Optional[datetime]
    last_watermark: Optional[datetime]
    risk_score: int
    check_duration_ms: Optional[int]


class WatchmanBatchSummary(SQLModel):
    """Summary of batch watchman check"""
    total_components: int
    needs_sync: int
    up_to_date: int
    total_changed_rows: int
    avg_check_duration_ms: float
    max_risk_score: int
    check_timestamp: datetime


class WatchmanAuditLogRead(SQLModel):
    """Watchman audit log entry"""
    audit_id: UUID
    component_id: UUID
    check_timestamp: datetime
    needs_sync: bool
    decision_reason: str
    source_row_count: Optional[int]
    target_row_count: Optional[int]
    changed_rows_count: Optional[int]
    check_duration_ms: Optional[int]
    job_queued: bool
    execution_id: Optional[UUID]


class WatchmanStatisticsRead(SQLModel):
    """Daily watchman statistics"""
    stat_date: date
    total_checks: int
    syncs_triggered: int
    syncs_skipped: int
    skip_rate_percent: Optional[float]
    avg_check_duration_ms: Optional[float]
    total_time_saved_seconds: int
    total_rows_synced: int
    accuracy_percent: Optional[float]


class WatchmanDashboardStats(SQLModel):
    """Watchman dashboard overview"""
    checks_today: int
    syncs_today: int
    skips_today: int
    skip_rate_today: float
    
    time_saved_today_seconds: int
    time_saved_today_minutes: float
    avg_check_duration_ms: float
    
    components_pending_sync: int
    components_up_to_date: int
    highest_risk_score: int
    
    false_positives_today: int
    accuracy_today: float


class ComponentETLInfo(SQLModel):
    """Component ETL information for management UI"""
    component_id: UUID
    component_name: str
    nomenclature : str
    ship_name: str
    department_name: str
    etl_enabled: bool = False  # Default to False if NULL
    
    # Monthly Utilization
    monthly_last_sync: Optional[datetime]
    monthly_next_sync: Optional[datetime]
    monthly_status: str
    
    # Overhaul Readings
    overhaul_last_sync: Optional[datetime]
    overhaul_next_sync: Optional[datetime]
    overhaul_status: str