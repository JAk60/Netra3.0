# File: backend/models/etl.py
# Status: COMPLETE REWRITE - All existing + new watchman tables

from sqlmodel import Column, SQLModel, Field
from sqlalchemy import Text
from datetime import datetime, date
from typing import Optional
from uuid import UUID, uuid4


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXISTING TABLE - MODIFIED WITH WATCHMAN FIELDS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class ETLSchedule(SQLModel, table=True):
    """Job scheduling configuration + Watchman tracking"""
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
    
    # Execution control fields
    session_id: Optional[int] = None
    current_execution_id: Optional[UUID] = None
    cancellation_requested: bool = Field(default=False)
    last_trigger_type: Optional[str] = Field(default=None, max_length=20)  # 'auto', 'manual'
    
    # ⚡ WATCHMAN FIELDS (NEW)
    source_watermark: Optional[datetime] = None              # Last updatedate synced from source
    target_watermark: Optional[datetime] = None              # When sync completed
    rows_changed_since_last_check: Optional[int] = None      # Count of changed rows
    last_change_detected: Optional[datetime] = None          # When changes last found
    sync_risk_score: int = Field(default=0)                  # 0-100, higher = more urgent
    last_sync_start: Optional[datetime] = None               # Sync start time
    last_sync_duration_seconds: Optional[int] = None         # How long sync took
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXISTING TABLES (NO CHANGES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class ETLExecutionProgress(SQLModel, table=True):
    """Tracks real-time job execution progress"""
    __tablename__ = "etl_execution_progress"
    
    execution_id: UUID = Field(default_factory=uuid4, primary_key=True)
    component_id: Optional[UUID] = Field(default=None, foreign_key="system_configuration.component_id")
    job_name: str = Field(max_length=100)  # 'monthly_utilization' or 'overhaul_readings'
    status: str = Field(default="queued", max_length=20)  # queued, running, completed, failed, cancelled
    
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
    triggered_by: str = Field(max_length=100)  # 'auto', 'manual:user@email.com'
    session_id: Optional[int] = None
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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚡ NEW WATCHMAN TABLES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class WatchmanAuditLog(SQLModel, table=True):
    """History of all watchman checks"""
    __tablename__ = "watchman_audit_log"
    
    audit_id: UUID = Field(default_factory=uuid4, primary_key=True)
    component_id: UUID = Field(foreign_key="system_configuration.component_id")
    check_timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Check results
    needs_sync: bool = Field(default=False)
    decision_reason: str = Field(max_length=100)  # 'row_count_mismatch', 'data_changed', 'no_changes'
    
    # Metrics at check time
    source_row_count: Optional[int] = None
    target_row_count: Optional[int] = None
    changed_rows_count: Optional[int] = None
    source_watermark: Optional[datetime] = None
    check_duration_ms: Optional[int] = None
    
    # Actions taken
    job_queued: bool = Field(default=False)
    execution_id: Optional[UUID] = Field(default=None, foreign_key="etl_execution_progress.execution_id")
    
    # Context
    triggered_by: Optional[str] = Field(default=None, max_length=50)  # 'beat_schedule', 'manual_api'


class WatchmanStatistics(SQLModel, table=True):
    """Aggregated daily watchman metrics"""
    __tablename__ = "watchman_statistics"
    
    stat_id: UUID = Field(default_factory=uuid4, primary_key=True)
    stat_date: date = Field(index=True)
    
    # Overall metrics
    total_checks: int = Field(default=0)
    syncs_triggered: int = Field(default=0)
    syncs_skipped: int = Field(default=0)
    false_positives: int = Field(default=0)  # Syncs that found no actual changes
    
    # Performance
    avg_check_duration_ms: Optional[float] = None
    total_time_saved_seconds: int = Field(default=0)
    total_rows_synced: int = Field(default=0)
    
    # Efficiency
    skip_rate_percent: Optional[float] = None
    accuracy_percent: Optional[float] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API REQUEST MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class JobExecutionRequest(SQLModel):
    """Request to execute a job"""
    component_id: Optional[UUID] = None  # None for overhaul_readings (all components)
    force: bool = False                  # Override running check
    skip_watchman: bool = False          # ⚡ NEW: Bypass watchman check


class ETLScheduleUpdate(SQLModel):
    """Update schedule configuration"""
    frequency_minutes: Optional[int] = None
    max_retries: Optional[int] = None
    status: Optional[str] = None  # For pause/resume


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API RESPONSE MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    
    # ⚡ Watchman fields
    source_watermark: Optional[datetime]
    target_watermark: Optional[datetime]
    rows_changed_since_last_check: Optional[int]
    sync_risk_score: int
    
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


class JobExecutionResponse(SQLModel):
    """Response when job is triggered"""
    execution_id: UUID
    status: str  # 'queued', 'running', 'skipped'
    message: str
    component_id: Optional[UUID]
    job_name: str


class ActiveJobsResponse(SQLModel):
    """List of currently running jobs"""
    total: int
    jobs: list[ExecutionStatusResponse]


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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚡ WATCHMAN-SPECIFIC RESPONSE MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class WatchmanCheckResult(SQLModel):
    """Response from watchman check"""
    component_id: UUID
    needs_sync: bool
    decision_reason: str                    # 'row_count_mismatch', 'data_changed', 'no_changes'
    changed_rows: int
    source_count: Optional[int]
    target_count: Optional[int]
    source_watermark: Optional[datetime]
    last_watermark: Optional[datetime]
    risk_score: int                         # 0-100
    check_duration_ms: Optional[int]


class WatchmanStatusResponse(SQLModel):
    """API response for watchman status"""
    component_id: UUID
    component_name: str
    ship_name: str
    nomenclature: Optional[str]
    
    # Sync status
    needs_sync: bool
    sync_status: str                        # 'up_to_date', 'pending_sync', 'first_run', 'error'
    decision_reason: Optional[str]
    
    # Metrics
    changed_rows: Optional[int]
    source_count: Optional[int]
    target_count: Optional[int]
    risk_score: int
    
    # Timing
    last_check: Optional[datetime]
    last_sync: Optional[datetime]
    source_watermark: Optional[datetime]
    next_scheduled_sync: Optional[datetime]


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
    # Today's metrics
    checks_today: int
    syncs_today: int
    skips_today: int
    skip_rate_today: float
    
    # Efficiency
    time_saved_today_seconds: int
    time_saved_today_minutes: float
    avg_check_duration_ms: float
    
    # Current state
    components_pending_sync: int
    components_up_to_date: int
    highest_risk_score: int
    
    # Accuracy
    false_positives_today: int
    accuracy_today: float