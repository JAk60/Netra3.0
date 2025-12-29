from celery import Celery
from config import settings
import logging

logger = logging.getLogger(__name__)

# Create Celery app instance
celery_app = Celery(
    'etl_jobs',
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        'jobs.task',
        'tasks.token_tasks'  # NEW: Include token tasks
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_track_started=True,
    
    task_time_limit=settings.celery_task_time_limit,
    task_soft_time_limit=settings.celery_task_soft_time_limit,
    
    task_default_max_retries=settings.default_max_retries,
    task_default_retry_delay=60,
    
    result_expires=86400,
    result_persistent=True,
    
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
    
    beat_schedule={},
)


def setup_beat_schedule():
    """Setup periodic tasks from etl_schedule table"""
    from db.connection import get_session_context
    from models.etl import ETLSchedule
    from sqlmodel import select
    
    try:
        with get_session_context() as session:
            statement = select(ETLSchedule).where(
                ETLSchedule.status != 'paused'
            )
            schedules = session.exec(statement).all()
            
            beat_schedule = {}
            
            for schedule in schedules:
                beat_schedule[f'monthly_util_{schedule.component_id}'] = {
                    'task': 'jobs.task.run_monthly_utilization_task',
                    'schedule': schedule.frequency_minutes * 60.0,
                    'args': (str(schedule.component_id),),
                    'options': {
                        'expires': schedule.frequency_minutes * 60 * 2,
                    }
                }
            
            beat_schedule['overhaul_readings'] = {
                'task': 'jobs.task.run_overhaul_readings_task',
                'schedule': settings.overhaul_readings_frequency_minutes * 60.0,
                'options': {
                    'expires': settings.overhaul_readings_frequency_minutes * 60 * 2,
                }
            }
            
            # ===== NEW: Token cleanup task - runs daily at 2 AM =====
            beat_schedule['cleanup_expired_tokens'] = {
                'task': 'cleanup_expired_tokens',
                'schedule': 86400.0,  # Every 24 hours (86400 seconds)
                'options': {
                    'expires': 3600,  # Task expires after 1 hour if not picked up
                }
            }
            
            celery_app.conf.beat_schedule = beat_schedule
            logger.info(f"Loaded {len(beat_schedule)} periodic tasks (including token cleanup)")
            
    except Exception as e:
        logger.error(f"Failed to setup beat schedule: {e}")
        raise


@celery_app.on_after_finalize.connect
def setup_beat_tasks(sender, **kwargs):
    """Called when Beat is ready"""
    if sender.conf.task_always_eager:
        return
    
    logger.info("Setting up Beat schedule from database...")
    setup_beat_schedule()