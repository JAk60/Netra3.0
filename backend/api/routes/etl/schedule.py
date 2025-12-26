from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from uuid import UUID
from typing import List


import logging

from api.db.connection import get_session
from api.models.etl import ETLSchedule, ETLScheduleRead, ETLScheduleUpdate
from api.routes.celery_app import setup_beat_schedule

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/schedule", tags=["Schedule Management"])


@router.get("", response_model=List[ETLScheduleRead])
async def get_all_schedules(
    session: Session = Depends(get_session)
):
    """Get all component schedules"""
    try:
        statement = select(ETLSchedule)
        schedules = session.exec(statement).all()
        
        return [ETLScheduleRead.from_orm(s) for s in schedules]
    
    except Exception as e:
        logger.error(f"Failed to get schedules: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{component_id}", response_model=ETLScheduleRead)
async def get_schedule(
    component_id: UUID,
    session: Session = Depends(get_session)
):
    """Get schedule for specific component"""
    try:
        statement = select(ETLSchedule).where(
            ETLSchedule.component_id == component_id
        )
        schedule = session.exec(statement).first()
        
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        return ETLScheduleRead.from_orm(schedule)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{component_id}", response_model=ETLScheduleRead)
async def update_schedule(
    component_id: UUID,
    update_data: ETLScheduleUpdate,
    session: Session = Depends(get_session)
):
    """
    Update schedule configuration
    
    - **frequency_minutes**: Update execution frequency
    - **max_retries**: Update max retry attempts
    - **status**: Pause/resume (use pause/resume endpoints instead)
    """
    try:
        statement = select(ETLSchedule).where(
            ETLSchedule.component_id == component_id
        )
        schedule = session.exec(statement).first()
        
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        # Update fields
        if update_data.frequency_minutes is not None:
            schedule.frequency_minutes = update_data.frequency_minutes
        
        if update_data.max_retries is not None:
            schedule.max_retries = update_data.max_retries
        
        session.add(schedule)
        session.commit()
        session.refresh(schedule)
        
        # Reload Celery Beat schedule
        setup_beat_schedule()
        
        logger.info(f"Updated schedule for component {component_id}")
        
        return ETLScheduleRead.from_orm(schedule)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{component_id}/pause")
async def pause_schedule(
    component_id: UUID,
    session: Session = Depends(get_session)
):
    """Pause scheduled execution for component"""
    try:
        statement = select(ETLSchedule).where(
            ETLSchedule.component_id == component_id
        )
        schedule = session.exec(statement).first()
        
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        schedule.status = 'paused'
        session.add(schedule)
        session.commit()
        
        # Reload Celery Beat (will skip paused jobs)
        setup_beat_schedule()
        
        logger.info(f"Paused schedule for component {component_id}")
        
        return {"status": "paused", "component_id": str(component_id)}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to pause schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{component_id}/resume")
async def resume_schedule(
    component_id: UUID,
    session: Session = Depends(get_session)
):
    """Resume scheduled execution for component"""
    try:
        statement = select(ETLSchedule).where(
            ETLSchedule.component_id == component_id
        )
        schedule = session.exec(statement).first()
        
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        schedule.status = 'idle'
        session.add(schedule)
        session.commit()
        
        # Reload Celery Beat
        setup_beat_schedule()
        
        logger.info(f"Resumed schedule for component {component_id}")
        
        return {"status": "idle", "component_id": str(component_id)}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resume schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))