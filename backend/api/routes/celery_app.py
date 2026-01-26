# backend/api/routes/celery_app.py

from celery import Celery
from config import settings
import logging

logger = logging.getLogger(__name__)

# Create Celery app instance
celery_app = Celery(
    'etl_jobs',
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

# Celery configuration (keep your existing config)
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
    
    broker_transport_options={
        'priority_steps': list(range(10)),
        'sep': ':',
        'queue_order_strategy': 'priority',
    },
    
    beat_schedule={},
)

# ⚡ CRITICAL: Import tasks AFTER celery_app is created
# This ensures tasks can reference celery_app during their definition
try:
    from api.jobs import task
    from api.jobs import token_tasks
    logger.info("✅ Successfully imported task modules")
except ImportError as e:
    logger.error(f"❌ Failed to import tasks: {e}")
    raise


def setup_beat_schedule():
    """Setup periodic tasks"""
    try:
        beat_schedule = {}
        
        # ════════════════════════════════════════════════════════
        # 📊 MONTHLY UTILIZATION WATCHMAN
        # ════════════════════════════════════════════════════════
        beat_schedule['watchman_patrol'] = {
            'task': 'jobs.task.watchman_patrol',
            'schedule': 300.0,  # 5 minutes
            'options': {
                'expires': 240,
                'priority': 9,
            }
        }
        
        # ════════════════════════════════════════════════════════
        # 🔧 OVERHAUL WATCHMAN
        # ════════════════════════════════════════════════════════
        beat_schedule['watchman_overhaul_patrol'] = {
            'task': 'jobs.task.watchman_overhaul_patrol',
            'schedule': 120.0,  # 2 minutes
            'options': {
                'expires': 3000,
                'priority': 7,
            }
        }
        
        # ════════════════════════════════════════════════════════
        # 🗑️ TOKEN CLEANUP
        # ════════════════════════════════════════════════════════
        beat_schedule['cleanup_expired_tokens'] = {
            'task': 'cleanup_expired_tokens',
            'schedule': 86400.0,  # Daily
            'options': {
                'expires': 3600,
                'priority': 1,
            }
        }
        
        celery_app.conf.beat_schedule = beat_schedule
        
        logger.info(
            f"✅ Celery Beat schedule loaded | "
            f"Tasks: {len(beat_schedule)} | "
            f"Monthly Util Watchman: ENABLED (5min) | "
            f"Overhaul Watchman: ENABLED (2min)"
        )
        
    except Exception as e:
        logger.error(f"Failed to setup beat schedule: {e}")
        raise


@celery_app.on_after_finalize.connect
def setup_beat_tasks(sender, **kwargs):
    """Called when Beat is ready"""
    if sender.conf.task_always_eager:
        return
    
    logger.info("🚀 Setting up Celery Beat schedule with Watchman...")
    setup_beat_schedule()
    logger.info("✅ Celery Beat ready with Watchman patrol enabled")