from celery import Task
from celery.exceptions import SoftTimeLimitExceeded
from api.routes.celery_app import celery_app  # Fixed import
from api.db.connection import get_session_context
from api.models.etl import ETLExecutionProgress, ETLSchedule
from utils.sql_executor import SQLExecutor, SPExecutionHelper  # You'll need to create this
from uuid import uuid4, UUID
from datetime import datetime, timedelta
import logging
from sqlmodel import select

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
    
    logger.info(f"Starting monthly utilization task for component {component_id}")
    
    try:
        with get_session_context() as session:
            # Check if already running
            schedule_stmt = select(ETLSchedule).where(
                ETLSchedule.component_id == component_uuid
            )
            schedule = session.exec(schedule_stmt).first()
            
            if not schedule:
                raise ValueError(f"No schedule found for component {component_id}")
            
            if schedule.status == 'running' and triggered_by == 'auto':
                logger.warning(f"Component {component_id} already running, skipping")
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
            
            # Execute stored procedure
            executor = SQLExecutor(session)
            
            result = SPExecutionHelper.execute_monthly_utilization(
                executor=executor,
                execution_id=execution_id,
                component_id=component_uuid
            )
            
            session_id = result['session_id']
            
            # Update execution with results
            execution.status = 'completed'
            execution.end_time = datetime.utcnow()
            execution.duration_seconds = int((execution.end_time - execution.start_time).total_seconds())
            execution.rows_processed = result.get('rows_affected', 0)
            execution.session_id = session_id
            execution.progress_percent = 100
            session.add(execution)
            
            # Update schedule for next run
            schedule.status = 'idle'
            schedule.last_run_time = datetime.utcnow()
            schedule.next_run_time = datetime.utcnow() + timedelta(minutes=schedule.frequency_minutes)
            schedule.retry_count = 0
            schedule.error_message = None
            schedule.current_execution_id = None
            schedule.session_id = None
            session.add(schedule)
            
            session.commit()
            
            logger.info(f"Monthly utilization completed for {component_id}")
            
            return {
                'execution_id': str(execution_id),
                'status': 'completed',
                'rows_processed': result.get('rows_affected', 0)
            }
    
    except SoftTimeLimitExceeded:
        logger.error(f"Task timeout for component {component_id}")
        self._mark_failed(str(execution_id), "Task timeout exceeded")
        raise
    
    except Exception as exc:
        logger.error(f"Task failed for component {component_id}: {exc}")
        
        # Update schedule for retry
        try:
            with get_session_context() as session:
                schedule_stmt = select(ETLSchedule).where(
                    ETLSchedule.component_id == component_uuid
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


@celery_app.task(
    bind=True,
    base=ETLBaseTask,
    name='jobs.task.run_overhaul_readings_task',
    max_retries=3,
    default_retry_delay=120
)
def run_overhaul_readings_task(self, triggered_by: str = 'auto'):
    """
    Celery task for overhaul readings ETL (processes all components)
    """
    execution_id = uuid4()
    
    logger.info("Starting overhaul readings task")
    
    try:
        with get_session_context() as session:
            execution = ETLExecutionProgress(
                execution_id=execution_id,
                component_id=None,
                job_name='overhaul_readings',
                status='running',
                triggered_by=triggered_by,
                start_time=datetime.utcnow()
            )
            session.add(execution)
            session.commit()
            
            executor = SQLExecutor(session)
            
            result = SPExecutionHelper.execute_overhaul_readings(
                executor=executor,
                execution_id=execution_id
            )
            
            execution.status = 'completed'
            execution.end_time = datetime.utcnow()
            execution.duration_seconds = int((execution.end_time - execution.start_time).total_seconds())
            execution.rows_processed = result.get('rows_affected', 0)
            execution.session_id = result['session_id']
            execution.progress_percent = 100
            session.add(execution)
            session.commit()
            
            logger.info("Overhaul readings completed")
            
            return {
                'execution_id': str(execution_id),
                'status': 'completed',
                'rows_processed': result.get('rows_affected', 0)
            }
    
    except SoftTimeLimitExceeded:
        logger.error("Overhaul readings task timeout")
        self._mark_failed(str(execution_id), "Task timeout exceeded")
        raise
    
    except Exception as exc:
        logger.error(f"Overhaul readings failed: {exc}")
        raise self.retry(exc=exc, countdown=120)