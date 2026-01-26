from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from uuid import UUID
from typing import Optional, List
from datetime import datetime
import logging

from api.db.connection import get_session
from api.jobs.task import run_monthly_utilization_task, run_overhaul_readings_task
from api.models.etl import ETLExecutionProgress, ETLSchedule, ExecutionStatusResponse, JobExecutionRequest, JobExecutionResponse
from api.routes.celery_app import celery_app
from api.utils.watchman_utils import WatchmanExecutor


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/jobs", tags=["Job Execution"])


@router.post("/monthly-utilization/run", response_model=JobExecutionResponse)
async def trigger_monthly_utilization(
    request: JobExecutionRequest,
    session: Session = Depends(get_session)
):
    """
    Trigger monthly utilization ETL for a specific component
    
    - **component_id**: Component to process (required)
    - **force**: Override running check (default: false)
    - **skip_watchman**: Skip watchman check and force sync (default: false)
    
    ⚡ NEW: Watchman check before queuing
    - If skip_watchman=false, checks if component actually needs sync
    - Prevents unnecessary jobs for unchanged data
    """
    if not request.component_id:
        raise HTTPException(status_code=400, detail="component_id is required")
    
    try:
        # Check if component exists and has schedule
        schedule_stmt = select(ETLSchedule).where(
            ETLSchedule.component_id == request.component_id,
            ETLSchedule.etl_type == 'monthly_utilization'
        )
        schedule = session.exec(schedule_stmt).first()
        
        if not schedule:
            raise HTTPException(
                status_code=404,
                detail=f"No schedule found for component {request.component_id}"
            )
        
        # Check if already running (unless force=true)
        if schedule.status == 'running' and not request.force:
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "Job already running",
                    "current_execution_id": str(schedule.current_execution_id),
                    "message": "Cannot start job while another is running. Use force=true to override (not recommended)"
                }
            )
        
        # ══════════════════════════════════════════════════════════════════
        # ⚡ NEW: WATCHMAN CHECK BEFORE QUEUING (unless skip_watchman=true)
        # ══════════════════════════════════════════════════════════════════
        if not request.skip_watchman:
            try:
                logger.info(f"🔍 Running watchman check for component {request.component_id}")
                
                watchman_result = WatchmanExecutor.check_component(
                    session=session,
                    component_id=request.component_id,
                    triggered_by="manual_api"
                )
                
                session.commit()
                
                if not watchman_result.needs_sync:
                    logger.info(
                        f"⏭️ Watchman: No sync needed for {request.component_id} | "
                        f"Reason: {watchman_result.decision_reason} | "
                        f"Changed rows: {watchman_result.changed_rows}"
                    )
                    
                    return JobExecutionResponse(
                        execution_id=UUID('00000000-0000-0000-0000-000000000000'),
                        status='skipped',
                        message=f'No sync needed - {watchman_result.decision_reason}. '
                                f'Changed rows: {watchman_result.changed_rows}. '
                                f'Use skip_watchman=true to force sync anyway.',
                        component_id=request.component_id,
                        job_name='monthly_utilization'
                    )
                
                logger.info(
                    f"⚡ Watchman: Sync needed for {request.component_id} | "
                    f"Reason: {watchman_result.decision_reason} | "
                    f"Changed rows: {watchman_result.changed_rows} | "
                    f"Risk score: {watchman_result.risk_score}"
                )
                
            except Exception as e:
                logger.warning(f"⚠️ Watchman check failed, proceeding with sync anyway: {e}")
                # If watchman fails, proceed with sync (fail-safe behavior)
        else:
            logger.info(f"⏭️ Skipping watchman check (skip_watchman=true)")
        
        # ══════════════════════════════════════════════════════════════════
        # DISPATCH CELERY TASK
        # ══════════════════════════════════════════════════════════════════
        task = run_monthly_utilization_task.apply_async(
            args=[str(request.component_id), 'manual'],
            task_id=None
        )
        
        logger.info(f"Dispatched monthly utilization task {task.id} for component {request.component_id}")
        
        return JobExecutionResponse(
            execution_id=UUID(task.id) if task.id else UUID('00000000-0000-0000-0000-000000000000'),
            status='queued',
            message='Job queued successfully',
            component_id=request.component_id,
            job_name='monthly_utilization'
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to trigger monthly utilization: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/overhaul-readings/run", response_model=JobExecutionResponse)
async def trigger_overhaul_readings(
    request: JobExecutionRequest,
    session: Session = Depends(get_session)
):
    """
    Trigger overhaul readings ETL (processes all components)
    
    - **force**: Override running check (default: false)
    
    Note: Watchman is not used for overhaul_readings as it processes all components
    """
    try:
        # Check if any overhaul job is running
        running_stmt = select(ETLExecutionProgress).where(
            ETLExecutionProgress.job_name == 'overhaul_readings',
            ETLExecutionProgress.status.in_(['queued', 'running'])
        )
        running_job = session.exec(running_stmt).first()
        
        if running_job and not request.force:
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "Overhaul readings job already running",
                    "current_execution_id": str(running_job.execution_id),
                    "message": "Cannot start job while another is running"
                }
            )
        
        # Dispatch Celery task
        task = run_overhaul_readings_task.apply_async(
            args=['manual']
        )
        
        logger.info(f"Dispatched overhaul readings task {task.id}")
        
        return JobExecutionResponse(
            execution_id=UUID(task.id) if task.id else UUID('00000000-0000-0000-0000-000000000000'),
            status='queued',
            message='Job queued successfully',
            component_id=None,
            job_name='overhaul_readings'
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to trigger overhaul readings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{execution_id}/status", response_model=ExecutionStatusResponse)
async def get_job_status(
    execution_id: UUID,
    session: Session = Depends(get_session)
):
    """
    Get status of a specific job execution
    
    Returns real-time progress, metrics, and current state
    """
    try:
        statement = select(ETLExecutionProgress).where(
            ETLExecutionProgress.execution_id == execution_id
        )
        execution = session.exec(statement).first()
        
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        return ExecutionStatusResponse(
            execution_id=execution.execution_id,
            job_name=execution.job_name,
            component_id=execution.component_id,
            status=execution.status,
            progress_percent=execution.progress_percent,
            current_step=execution.current_step,
            start_time=execution.start_time,
            end_time=execution.end_time,
            duration_seconds=execution.duration_seconds,
            rows_processed=execution.rows_processed,
            rows_inserted=execution.rows_inserted,
            rows_updated=execution.rows_updated,
            error_count=execution.error_count,
            error_message=execution.error_message,
            triggered_by=execution.triggered_by
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{execution_id}/cancel")
async def cancel_job(
    execution_id: UUID,
    session: Session = Depends(get_session)
):
    """
    Cancel a running job
    
    Attempts graceful cancellation first, then forceful if needed
    """
    try:
        statement = select(ETLExecutionProgress).where(
            ETLExecutionProgress.execution_id == execution_id
        )
        execution = session.exec(statement).first()
        
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        if execution.status not in ['queued', 'running']:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel job in status: {execution.status}"
            )
        
        # Revoke Celery task
        celery_app.control.revoke(str(execution_id), terminate=True)
        
        # Set cancellation flag if component_id exists
        if execution.component_id:
            schedule_stmt = select(ETLSchedule).where(
                ETLSchedule.component_id == execution.component_id
            )
            schedule = session.exec(schedule_stmt).first()
            
            if schedule:
                schedule.cancellation_requested = True
                session.add(schedule)
        
        # Update execution status
        execution.status = 'cancelled'
        execution.end_time = datetime.utcnow()
        execution.error_message = 'Cancelled by user'
        session.add(execution)
        session.commit()
        
        logger.info(f"Cancelled job {execution_id}")
        
        return {
            "status": "cancelled",
            "message": "Job cancellation requested. It will stop after current operation completes.",
            "execution_id": str(execution_id)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active", response_model=List[ExecutionStatusResponse])
async def get_active_jobs(
    session: Session = Depends(get_session)
):
    """
    Get all currently running jobs
    
    ⚡ FIXED: Returns direct array instead of wrapped object
    """
    try:
        statement = select(ETLExecutionProgress).where(
            ETLExecutionProgress.status.in_(['queued', 'running'])
        ).order_by(ETLExecutionProgress.start_time.desc())
        
        active_jobs = session.exec(statement).all()
        
        return [
            ExecutionStatusResponse(
                execution_id=job.execution_id,
                job_name=job.job_name,
                component_id=job.component_id,
                status=job.status,
                progress_percent=job.progress_percent,
                current_step=job.current_step,
                start_time=job.start_time,
                end_time=job.end_time,
                duration_seconds=job.duration_seconds,
                rows_processed=job.rows_processed,
                rows_inserted=job.rows_inserted,
                rows_updated=job.rows_updated,
                error_count=job.error_count,
                error_message=job.error_message,
                triggered_by=job.triggered_by
            )
            for job in active_jobs
        ]
    
    except Exception as e:
        logger.error(f"Failed to get active jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=List[ExecutionStatusResponse])
async def get_job_history(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    job_name: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """
    Get job execution history with pagination
    
    ⚡ FIXED: Returns direct array instead of wrapped object
    
    - **limit**: Number of records to return (default: 50)
    - **offset**: Number of records to skip (default: 0)
    - **status**: Filter by status (optional)
    - **job_name**: Filter by job name (optional)
    """
    try:
        statement = select(ETLExecutionProgress)
        
        # Apply filters
        if status:
            statement = statement.where(ETLExecutionProgress.status == status)
        if job_name:
            statement = statement.where(ETLExecutionProgress.job_name == job_name)
        
        # Order and paginate
        statement = statement.order_by(
            ETLExecutionProgress.start_time.desc()
        ).limit(limit).offset(offset)
        
        history = session.exec(statement).all()
        
        return [
            ExecutionStatusResponse(
                execution_id=job.execution_id,
                job_name=job.job_name,
                component_id=job.component_id,
                status=job.status,
                progress_percent=job.progress_percent,
                current_step=job.current_step,
                start_time=job.start_time,
                end_time=job.end_time,
                duration_seconds=job.duration_seconds,
                rows_processed=job.rows_processed,
                rows_inserted=job.rows_inserted,
                rows_updated=job.rows_updated,
                error_count=job.error_count,
                error_message=job.error_message,
                triggered_by=job.triggered_by
            )
            for job in history
        ]
    
    except Exception as e:
        logger.error(f"Failed to get job history: {e}")
        raise HTTPException(status_code=500, detail=str(e))