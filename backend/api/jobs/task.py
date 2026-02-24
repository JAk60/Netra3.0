from celery import Task
from celery.exceptions import SoftTimeLimitExceeded
from api.routes.celery_app import celery_app
from api.db.connection import get_session_context
from api.models.etl import ETLExecutionProgress, ETLSchedule

from api.utils.watchman_utils import WatchmanExecutor
from uuid import uuid4, UUID
from datetime import datetime, timedelta
import logging
from sqlmodel import select

from api.models.systemconfiguration import Ship, SystemConfiguration
from utils.sql_executor import SPExecutionHelper, SQLExecutor

logger = logging.getLogger(__name__)


class ETLBaseTask(Task):
    """Base task class with common ETL logic"""
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Called when task fails"""
        logger.error(f"Task {task_id} failed: {exc}")
        self._mark_failed(task_id, str(exc))
    
    def on_success(self, retval, task_id, args, kwargs):
        """Called when task succeeds"""
        logger.info(f"Task {task_id} completed successfully")
    
    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Called when task is retried"""
        logger.warning(f"Task {task_id} retrying: {exc}")
    
    def _mark_failed(self, execution_id: str, error_message: str):
        """Mark execution as failed"""
        try:
            with get_session_context() as session:
                statement = select(ETLExecutionProgress).where(
                    ETLExecutionProgress.execution_id == UUID(execution_id)
                )
                execution = session.exec(statement).first()
                
                if execution:
                    execution.status = 'failed'
                    execution.end_time = datetime.utcnow()
                    execution.error_message = error_message
                    session.add(execution)
                    session.commit()
        except Exception as e:
            logger.error(f"Failed to mark execution as failed: {e}")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚡ MONTHLY UTILIZATION WATCHMAN PATROL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@celery_app.task(
    bind=True,
    base=ETLBaseTask,
    name='jobs.task.watchman_patrol',
    max_retries=0
)
def watchman_patrol(self):
    """
    Monthly Utilization Watchman - checks all components for monthly util changes
    """
    logger.info("🔍 Monthly Utilization Watchman patrol starting...")
    patrol_start = datetime.utcnow()
    
    try:
        with get_session_context() as session:
            # Get all components with ETL enabled
            components_stmt = select(SystemConfiguration).where(
                SystemConfiguration.etl == True
            )
            components = session.exec(components_stmt).all()
            
            total_components = len(components)
            components_to_sync = []
            
            # Check each component individually
            for config in components:
                try:
                    result = WatchmanExecutor.check_component(
                        session=session,
                        component_id=config.component_id,
                        triggered_by="beat_schedule"
                    )
                    
                    if result.needs_sync:
                        # Get component details
                        ship_stmt = select(Ship).where(Ship.ship_id == config.ship_id)
                        ship = session.exec(ship_stmt).first()
                        
                        components_to_sync.append({
                            "component_id": result.component_id,
                            "component_name": config.nomenclature,
                            "ship_name": ship.ship_name if ship else "Unknown",
                            "needs_sync": result.needs_sync,
                            "decision_reason": result.decision_reason,
                            "changed_rows": result.changed_rows,
                            "risk_score": result.risk_score
                        })
                except Exception as e:
                    logger.error(f"Failed to check component {config.component_id}: {e}")
                    continue
            
            session.commit()
            
            needs_sync_count = len(components_to_sync)
            up_to_date = total_components - needs_sync_count
            
            logger.info(
                f"🔍 Monthly Util Watchman batch check complete | "
                f"Total: {total_components} | "
                f"Need sync: {needs_sync_count} | "
                f"Up to date: {up_to_date}"
            )
            
            # Queue jobs for components needing sync
            queued_count = 0
            for component in components_to_sync:
                if component["needs_sync"]:
                    try:
                        task = run_monthly_utilization_task.apply_async(
                            args=[str(component["component_id"]), 'watchman_auto'],
                            priority=component["risk_score"]
                        )
                        
                        queued_count += 1
                        logger.info(
                            f"⚡ Queued monthly util sync for {component['component_name']} | "
                            f"Task: {task.id} | "
                            f"Risk: {component['risk_score']}"
                        )
                    except Exception as e:
                        logger.error(f"Failed to queue sync: {e}")
            
            patrol_duration = (datetime.utcnow() - patrol_start).total_seconds()
            
            logger.info(
                f"✅ Monthly Util Watchman patrol complete | "
                f"Queued: {queued_count} jobs | "
                f"Skipped: {up_to_date} components | "
                f"Total duration: {patrol_duration:.2f}s"
            )
            
            return {
                "status": "completed",
                "total_components": total_components,
                "queued_jobs": queued_count,
                "skipped": up_to_date,
                "duration_seconds": patrol_duration
            }
            
    except Exception as e:
        logger.error(f"❌ Monthly Util Watchman patrol failed: {e}")
        raise


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚡ OVERHAUL WATCHMAN PATROL (NEW)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@celery_app.task(
    bind=True,
    base=ETLBaseTask,
    name='jobs.task.watchman_overhaul_patrol',
    max_retries=0
)
def watchman_overhaul_patrol(self):
    """
    Overhaul Watchman - checks all components for overhaul data changes
    Uses sp_oh_watchman_batch stored procedure
    """
    logger.info("🔧 Overhaul Watchman patrol starting...")
    patrol_start = datetime.utcnow()
    
    try:
        # 🔥 Use context manager - connections automatically returned to pool
        with SQLExecutor() as executor:
            result = executor.execute_sp('sp_oh_watchman_batch', {
                'triggered_by': 'beat_schedule'
            })
            
            # Parse results - first result set has components needing sync
            components_to_sync = result.get('results', [])
            
            total_components = 0
            queued_count = 0
            
            # Queue jobs for components needing sync
            for component in components_to_sync:
                try:
                    task = run_overhaul_readings_task.apply_async(
                        args=[str(component['component_id']), 'watchman_auto'],
                        priority=component.get('risk_score', 50)
                    )
                    
                    queued_count += 1
                    logger.info(
                        f"⚡ Queued overhaul sync | "
                        f"Component: {component.get('component_name')} | "
                        f"Ship: {component.get('ship_name')} | "
                        f"Task: {task.id} | "
                        f"Risk: {component.get('risk_score', 0)}"
                    )
                except Exception as e:
                    logger.error(f"Failed to queue overhaul sync: {e}")
            
            patrol_duration = (datetime.utcnow() - patrol_start).total_seconds()
            
            logger.info(
                f"✅ Overhaul Watchman patrol complete | "
                f"Queued: {queued_count} jobs | "
                f"Duration: {patrol_duration:.2f}s"
            )
            
            return {
                "status": "completed",
                "queued_jobs": queued_count,
                "duration_seconds": patrol_duration
            }
            
    except Exception as e:
        logger.error(f"❌ Overhaul Watchman patrol failed: {e}")
        raise


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📊 MONTHLY UTILIZATION TASK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@celery_app.task(
    bind=True,
    base=ETLBaseTask,
    name='jobs.task.run_monthly_utilization_task',
    max_retries=3,
    default_retry_delay=60
)
def run_monthly_utilization_task(self, component_id: str, triggered_by: str = 'auto'):
    """
    Celery task for monthly utilization ETL
    """
    execution_id = uuid4()
    component_uuid = UUID(component_id)
    session_id = None
    
    logger.info(f"📊 Starting monthly utilization task for component {component_id}")
    
    try:
        with get_session_context() as session:
            # Check if schedule exists, create if not
            schedule_stmt = select(ETLSchedule).where(
                ETLSchedule.component_id == component_uuid,
                ETLSchedule.etl_type == 'monthly_utilization'
            )
            schedule = session.exec(schedule_stmt).first()
            
            if not schedule:
                logger.info(f"Creating monthly util schedule for component {component_id} (first run)")
                schedule = ETLSchedule(
                    component_id=component_uuid,
                    etl_type='monthly_utilization',
                    frequency_minutes=5,
                    status='idle',
                    retry_count=0,
                    max_retries=3,
                    next_run_time=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(schedule)
                session.commit()
                schedule = session.exec(schedule_stmt).first()
            
            # Check if already running
            if schedule.status == 'running' and triggered_by == 'auto':
                logger.warning(f"Component {component_id} monthly util already running, skipping")
                return {'status': 'skipped', 'reason': 'already_running'}
            
            if schedule.cancellation_requested:
                logger.info(f"Cancellation requested for {component_id}, aborting")
                schedule.cancellation_requested = False
                session.add(schedule)
                session.commit()
                return {'status': 'cancelled', 'reason': 'cancellation_requested'}
            
            # Create execution record
            execution = ETLExecutionProgress(
                execution_id=execution_id,
                component_id=component_uuid,
                job_name='monthly_utilization',
                status='running',
                triggered_by=triggered_by,
                start_time=datetime.utcnow()
            )
            session.add(execution)
            
            # Update schedule
            schedule.status = 'running'
            schedule.current_execution_id = execution_id
            schedule.last_trigger_type = 'manual' if 'manual' in triggered_by else 'auto'
            session.add(schedule)
            
            session.commit()
        
        # 🔥 Execute SP with context manager - no manual cleanup needed
        with SQLExecutor() as executor:
            result = SPExecutionHelper.execute_monthly_utilization(
                executor=executor,
                execution_id=execution_id,
                component_id=component_uuid
            )
            
            session_id = result['session_id']
            rows_processed = result.get('rows_affected', 0)
        
        # Update records
        with get_session_context() as session:
            # Update execution with results
            execution = session.exec(
                select(ETLExecutionProgress).where(
                    ETLExecutionProgress.execution_id == execution_id
                )
            ).first()
            
            if execution:
                execution.status = 'completed'
                execution.end_time = datetime.utcnow()
                execution.duration_seconds = int((execution.end_time - execution.start_time).total_seconds())
                execution.rows_processed = rows_processed
                execution.session_id = session_id
                execution.progress_percent = 100
                session.add(execution)
            
            # Update schedule for next run
            schedule = session.exec(
                select(ETLSchedule).where(
                    ETLSchedule.component_id == component_uuid,
                    ETLSchedule.etl_type == 'monthly_utilization'
                )
            ).first()
            
            if schedule:
                schedule.status = 'idle'
                schedule.last_run_time = datetime.utcnow()
                schedule.next_run_time = datetime.utcnow() + timedelta(minutes=schedule.frequency_minutes)
                schedule.retry_count = 0
                schedule.error_message = None
                schedule.current_execution_id = None
                schedule.session_id = None
                session.add(schedule)
            
            session.commit()
            
            # Update watchman watermark after successful sync
            try:
                watermark_result = WatchmanExecutor.update_watermark(
                    session=session,
                    component_id=component_uuid,
                    execution_id=execution_id,
                    rows_synced=rows_processed
                )
                session.commit()
                
                if watermark_result["watermark_updated"]:
                    logger.info(
                        f"✅ Monthly util watermark updated for {component_id} | "
                        f"New: {watermark_result['new_watermark']}"
                    )
                else:
                    logger.warning(
                        f"⚠️ Monthly util watermark update failed for {component_id}: "
                        f"{watermark_result.get('error_message', 'Unknown error')}"
                    )
            except Exception as e:
                logger.error(f"Failed to update monthly util watermark: {e}")
        
        logger.info(f"📊 Monthly utilization completed for {component_id}")
        
        return {
            'execution_id': str(execution_id),
            'status': 'completed',
            'rows_processed': rows_processed
        }
    
    except SoftTimeLimitExceeded:
        logger.error(f"Task timeout for component {component_id}")
        self._mark_failed(str(execution_id), "Task timeout exceeded")
        raise
    
    except Exception as exc:
        logger.error(f"Monthly util task failed for component {component_id}: {exc}")
        
        # Update schedule for retry
        try:
            with get_session_context() as session:
                schedule_stmt = select(ETLSchedule).where(
                    ETLSchedule.component_id == component_uuid,
                    ETLSchedule.etl_type == 'monthly_utilization'
                )
                schedule = session.exec(schedule_stmt).first()
                
                if schedule:
                    schedule.status = 'error'
                    schedule.retry_count += 1
                    schedule.error_message = str(exc)
                    schedule.current_execution_id = None
                    
                    if schedule.retry_count < schedule.max_retries:
                        backoff_minutes = 2 ** schedule.retry_count
                        schedule.next_run_time = datetime.utcnow() + timedelta(minutes=backoff_minutes)
                        logger.info(f"Scheduling retry #{schedule.retry_count} in {backoff_minutes} minutes")
                    else:
                        schedule.next_run_time = None
                        logger.error(f"Max retries exceeded for {component_id}")
                    
                    session.add(schedule)
                    session.commit()
        except Exception as e:
            logger.error(f"Failed to update schedule after error: {e}")
        
        raise self.retry(exc=exc, countdown=60)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔧 OVERHAUL READINGS TASK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@celery_app.task(
    bind=True,
    base=ETLBaseTask,
    name='jobs.task.run_overhaul_readings_task',
    max_retries=3,
    default_retry_delay=120
)
def run_overhaul_readings_task(self, component_id: str, triggered_by: str = 'auto'):
    """
    Celery task for overhaul readings ETL - processes ONE component
    """
    execution_id = uuid4()
    component_uuid = UUID(component_id)
    session_id = None
    
    logger.info(f"🔧 Starting overhaul readings task for component {component_id}")
    
    try:
        with get_session_context() as session:
            # CHECK FOR OVERHAUL SCHEDULE (etl_type = 'overhaul_readings')
            schedule_stmt = select(ETLSchedule).where(
                ETLSchedule.component_id == component_uuid,
                ETLSchedule.etl_type == 'overhaul_readings'
            )
            schedule = session.exec(schedule_stmt).first()
            
            if not schedule:
                logger.info(f"Creating overhaul schedule for component {component_id} (first run)")
                schedule = ETLSchedule(
                    component_id=component_uuid,
                    etl_type='overhaul_readings',
                    frequency_minutes=60,
                    status='idle',
                    retry_count=0,
                    max_retries=3,
                    next_run_time=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(schedule)
                session.commit()
                schedule = session.exec(schedule_stmt).first()
            
            # Check if already running
            if schedule.status == 'running' and triggered_by == 'auto':
                logger.warning(f"Component {component_id} overhaul already running, skipping")
                return {'status': 'skipped', 'reason': 'already_running'}
            
            if schedule.cancellation_requested:
                logger.info(f"Cancellation requested for {component_id}, aborting")
                schedule.cancellation_requested = False
                session.add(schedule)
                session.commit()
                return {'status': 'cancelled', 'reason': 'cancellation_requested'}
            
            # Create execution record
            execution = ETLExecutionProgress(
                execution_id=execution_id,
                component_id=component_uuid,
                job_name='overhaul_readings',
                status='running',
                triggered_by=triggered_by,
                start_time=datetime.utcnow()
            )
            session.add(execution)
            
            # Update schedule
            schedule.status = 'running'
            schedule.current_execution_id = execution_id
            schedule.last_trigger_type = 'manual' if 'manual' in triggered_by else 'auto'
            session.add(schedule)
            
            session.commit()
        
        # 🔥 Execute SP with context manager - no manual cleanup needed
        with SQLExecutor() as executor:
            result = SPExecutionHelper.execute_overhaul_readings(
                executor=executor,
                execution_id=execution_id,
                component_id=component_uuid
            )
            
            session_id = result['session_id']
            rows_processed = result.get('rows_affected', 0)
        
        # Update records
        with get_session_context() as session:
            # Update execution with results
            execution = session.exec(
                select(ETLExecutionProgress).where(
                    ETLExecutionProgress.execution_id == execution_id
                )
            ).first()
            
            if execution:
                execution.status = 'completed'
                execution.end_time = datetime.utcnow()
                execution.duration_seconds = int((execution.end_time - execution.start_time).total_seconds())
                execution.rows_processed = rows_processed
                execution.session_id = session_id
                execution.progress_percent = 100
                session.add(execution)
            
            # Update schedule for next run
            schedule = session.exec(
                select(ETLSchedule).where(
                    ETLSchedule.component_id == component_uuid,
                    ETLSchedule.etl_type == 'overhaul_readings'
                )
            ).first()
            
            if schedule:
                schedule.status = 'idle'
                schedule.last_run_time = datetime.utcnow()
                schedule.next_run_time = datetime.utcnow() + timedelta(minutes=schedule.frequency_minutes)
                schedule.retry_count = 0
                schedule.error_message = None
                schedule.current_execution_id = None
                schedule.session_id = None
                session.add(schedule)
            
            session.commit()
            
            # Update watermark after successful sync
            try:
                with SQLExecutor() as watermark_executor:
                    watermark_result = watermark_executor.execute_sp(
                        'sp_oh_update_watermark',
                        params={
                            'component_id': str(component_uuid),
                            'execution_id': str(execution_id),
                            'rows_synced': rows_processed
                        }
                    )
                
                if watermark_result.get('results') and len(watermark_result['results']) > 0:
                    watermark_data = watermark_result['results'][0]
                    if watermark_data.get('watermark_updated'):
                        logger.info(
                            f"✅ Overhaul watermark updated for {component_id} | "
                            f"New: {watermark_data.get('new_watermark')}"
                        )
                    else:
                        logger.warning(
                            f"⚠️ Overhaul watermark update failed for {component_id}: "
                            f"{watermark_data.get('error_message', 'Unknown error')}"
                        )
            except Exception as e:
                logger.error(f"Failed to update overhaul watermark: {e}")
        
        logger.info(
            f"🔧 Overhaul readings completed for {component_id} | "
            f"Rows: {rows_processed}"
        )
        
        return {
            'execution_id': str(execution_id),
            'status': 'completed',
            'rows_processed': rows_processed
        }
    
    except SoftTimeLimitExceeded:
        logger.error(f"❌ Overhaul readings task timeout for {component_id}")
        self._mark_failed(str(execution_id), "Task timeout exceeded")
        raise
    
    except Exception as exc:
        logger.error(f"❌ Overhaul readings failed for {component_id}: {exc}")
        
        # Update schedule for retry
        try:
            with get_session_context() as session:
                schedule_stmt = select(ETLSchedule).where(
                    ETLSchedule.component_id == component_uuid,
                    ETLSchedule.etl_type == 'overhaul_readings'
                )
                schedule = session.exec(schedule_stmt).first()
                
                if schedule:
                    schedule.status = 'error'
                    schedule.retry_count += 1
                    schedule.error_message = str(exc)
                    schedule.current_execution_id = None
                    
                    if schedule.retry_count < schedule.max_retries:
                        backoff_minutes = 2 ** schedule.retry_count
                        schedule.next_run_time = datetime.utcnow() + timedelta(minutes=backoff_minutes)
                        logger.info(f"Scheduling retry #{schedule.retry_count} in {backoff_minutes} minutes")
                    else:
                        schedule.next_run_time = None
                        logger.error(f"Max retries exceeded for {component_id}")
                    
                    session.add(schedule)
                    session.commit()
        except Exception as e:
            logger.error(f"Failed to update schedule after error: {e}")
        
        raise self.retry(exc=exc, countdown=120)