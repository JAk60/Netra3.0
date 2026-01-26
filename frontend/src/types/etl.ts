// types/etl.d.ts

export type GlowColor = 'blue' | 'emerald' | 'purple' | 'none'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JOB TYPE STATUS (Nested in WatchmanStatus)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface JobTypeStatus {
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused'
  sync_status: 'up_to_date' | 'pending_sync' | 'first_run' | 'error'
  needs_sync: boolean
  changed_rows: number | null
  risk_score: number
  last_check: string | null
  last_sync: string | null
  next_run: string | null
  source_watermark: string | null
  error_message: string | null
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WATCHMAN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface WatchmanStatus {
  component_id: string
  component_name: string
  ship_name: string
  nomenclature: string | null
  
  // ⚡ ENHANCED: Nested job type statuses
  monthly_utilization: JobTypeStatus
  overhaul_readings: JobTypeStatus
}

export interface WatchmanStats {
  monthly_util: {
    total: number
    synced: number
    skipped: number
    efficiency: number
  }
  overhaul: {
    total: number
    synced: number
    skipped: number
    efficiency: number
  }
}

export interface WatchmanAuditLog {
  audit_id: string
  component_id: string
  check_timestamp: string
  needs_sync: boolean
  decision_reason: string
  source_row_count: number | null
  target_row_count: number | null
  changed_rows_count: number | null
  check_duration_ms: number | null
  job_queued: boolean
  execution_id: string | null
}

export interface WatchmanDashboardStats {
  checks_today: number
  syncs_today: number
  skips_today: number
  skip_rate_today: number
  time_saved_today_seconds: number
  time_saved_today_minutes: number
  avg_check_duration_ms: number
  components_pending_sync: number
  components_up_to_date: number
  highest_risk_score: number
  false_positives_today: number
  accuracy_today: number
}

export interface WatchmanStatistics {
  stat_date: string
  total_checks: number
  syncs_triggered: number
  syncs_skipped: number
  skip_rate_percent: number
  avg_check_duration_ms: number
  total_time_saved_seconds: number
  total_rows_synced: number
  accuracy_percent: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Component {
  id: string
  name: string
  ship: string
  monthly_util: {
    status: 'idle' | 'running' | 'completed' | 'error' | 'paused'
    next_run: string
    risk: number
    changed_rows: number
    last_sync?: string
  }
  overhaul: {
    status: 'idle' | 'running' | 'completed' | 'error' | 'paused'
    next_run: string
    risk: number
    changed_rows: number
    last_sync?: string
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JOBS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface ExecutionStatus {
  execution_id: string
  job_name: string
  component_id: string | null
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress_percent: number
  current_step: string | null
  start_time: string
  end_time: string | null
  duration_seconds: number | null
  rows_processed: number
  rows_inserted: number
  rows_updated: number
  error_count: number
  error_message: string | null
  triggered_by: string
}

export interface RecentJob {
  id: string
  type: 'monthly_utilization' | 'overhaul_readings'
  component: string
  status: string
  duration: string
  rows: number
  time: string
}

export interface JobTriggerRequest {
  component_id?: string
  force?: boolean
  skip_watchman?: boolean
}

export interface JobTriggerResponse {
  execution_id: string
  status: string
  message: string
  component_id: string | null
  job_name: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEDULES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface ETLSchedule {
  component_id: string
  etl_type: 'monthly_utilization' | 'overhaul_readings'
  frequency_minutes: number
  last_run_time: string | null
  next_run_time: string | null
  status: string
  retry_count: number
  max_retries: number
  error_message: string | null
  session_id: number | null
  current_execution_id: string | null
  cancellation_requested: boolean
  last_trigger_type: string | null
  source_watermark: string | null
  target_watermark: string | null
  rows_changed_since_last_check: number | null
  sync_risk_score: number
  created_at: string
  updated_at: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface DashboardStats {
  total_components: number
  active_components: number
  currently_running: number
  idle: number
  in_error: number
  paused: number
  total_runs_today: number
  successful_runs_today: number
  failed_runs_today: number
  success_rate_today: number
  avg_duration_seconds: number | null
  total_rows_processed_today: number
  next_scheduled_run: string | null
}

// Add these to types/etl.d.ts

export interface Ship {
  ship_id: number
  ship_name: string
}

export interface Department {
  department_id: number
  department_name: string
  ship_id: number
}

export interface ComponentETLInfo {
  component_id: string
  component_name: string
  ship_name: string
  department_name: string
  etl_enabled: boolean
  
  // Monthly Utilization
  monthly_last_sync: string | null
  monthly_next_sync: string | null
  monthly_status: string
  
  // Overhaul Readings
  overhaul_last_sync: string | null
  overhaul_next_sync: string | null
  overhaul_status: string
}




interface Equipment {
  component_name: string;
  CMMS_EquipmentCode: string;
  ship_name: string;
  ship_category: string;
  ship_class: string;
  command: string;
  department: string;
  nomenclature: string;
}

interface SourceDataResponse {
  success: boolean;
  data: Equipment[];
}

interface CreateComponentPayload {
  component_name: string;
  system_id: string | null;
  ship_id: string | null;
  department_id: string | null;
  parent_id: string | null;
  CMMS_EquipmentCode: string;
  is_lmu: number;
  parent_name: string | null;
  nomenclature: string;
  etl: boolean;
  RepairType: 'repairable' | 'non-repairable';
}

type SyncStatus = 'loading' | 'success' | 'error';

interface Stats {
  total: number;
  synced: number;
  failed: number;
  pending: number;
}