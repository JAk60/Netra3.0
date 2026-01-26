"""
Watchman API Endpoints
Provides REST API for watchman monitoring and control
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from uuid import UUID
from typing import List, Optional
import logging

from api.db.connection import get_session
from api.utils.watchman_utils import WatchmanExecutor
from api.models.etl import (
    WatchmanCheckResult,
    WatchmanStatusResponse,
    WatchmanAuditLogRead,
    WatchmanStatisticsRead,
    WatchmanDashboardStats,
    ETLSchedule,
    JobTypeStatus
)
from api.models.systemconfiguration import Ship, SystemConfiguration

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/watchman", tags=["Watchman"])


def _build_job_type_status(schedule: Optional[ETLSchedule]) -> JobTypeStatus:
    """Helper to build JobTypeStatus from schedule"""
    if not schedule:
        return JobTypeStatus(
            status="idle",
            sync_status="first_run",
            needs_sync=True,
            changed_rows=None,
            risk_score=0,
            last_check=None,
            last_sync=None,
            next_run=None,
            source_watermark=None,
            error_message=None
        )
    
    # Determine sync_status
    if schedule.source_watermark is None:
        sync_status = "first_run"
        needs_sync = True
    elif schedule.rows_changed_since_last_check and schedule.rows_changed_since_last_check > 0:
        sync_status = "pending_sync"
        needs_sync = True
    elif schedule.status == "error":
        sync_status = "error"
        needs_sync = False
    else:
        sync_status = "up_to_date"
        needs_sync = False
    
    return JobTypeStatus(
        status=schedule.status,
        sync_status=sync_status,
        needs_sync=needs_sync,
        changed_rows=schedule.rows_changed_since_last_check,
        risk_score=schedule.sync_risk_score,
        last_check=schedule.last_change_detected,
        last_sync=schedule.last_run_time,
        next_run=schedule.next_run_time,
        source_watermark=schedule.source_watermark,
        error_message=schedule.error_message
    )


@router.get("/status", response_model=List[WatchmanStatusResponse])
async def get_all_watchman_status(
    session: Session = Depends(get_session)
):
    """
    Get watchman status for all components
    
    Returns sync status for BOTH monthly_utilization and overhaul_readings per component
    """
    try:
        # Get all components with ETL enabled
        config_stmt = select(
            SystemConfiguration,
            Ship
        ).join(
            Ship, SystemConfiguration.ship_id == Ship.ship_id
        ).where(
            SystemConfiguration.etl == True
        )
        
        configs = session.exec(config_stmt).all()
        
        statuses = []
        
        for config, ship in configs:
            # Get BOTH schedule types for this component
            schedule_stmt = select(ETLSchedule).where(
                ETLSchedule.component_id == config.component_id
            )
            schedules = session.exec(schedule_stmt).all()
            
            # Create a map of etl_type -> schedule
            schedule_map = {s.etl_type: s for s in schedules}
            
            # Get both schedules
            monthly_schedule = schedule_map.get('monthly_utilization')
            overhaul_schedule = schedule_map.get('overhaul_readings')
            
            # Build nested job statuses
            monthly_status = _build_job_type_status(monthly_schedule)
            overhaul_status = _build_job_type_status(overhaul_schedule)
            
            statuses.append(WatchmanStatusResponse(
                component_id=config.component_id,
                component_name=config.nomenclature or "Unknown",
                ship_name=ship.ship_name,
                nomenclature=config.nomenclature,
                monthly_utilization=monthly_status,
                overhaul_readings=overhaul_status
            ))
        
        return statuses
        
    except Exception as e:
        logger.error(f"Failed to get watchman status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{component_id}", response_model=WatchmanStatusResponse)
async def get_component_watchman_status(
    component_id: UUID,
    session: Session = Depends(get_session)
):
    """
    Get detailed watchman status for a specific component
    
    - **component_id**: Component UUID to check
    """
    try:
        # Get component info
        config_stmt = select(
            SystemConfiguration,
            Ship
        ).join(
            Ship, SystemConfiguration.ship_id == Ship.ship_id
        ).where(
            SystemConfiguration.component_id == component_id
        )
        
        result = session.exec(config_stmt).first()
        if not result:
            raise HTTPException(status_code=404, detail="Component not found")
        
        config, ship = result
        
        # Get both schedules
        schedule_stmt = select(ETLSchedule).where(
            ETLSchedule.component_id == component_id
        )
        schedules = session.exec(schedule_stmt).all()
        schedule_map = {s.etl_type: s for s in schedules}
        
        monthly_schedule = schedule_map.get('monthly_utilization')
        overhaul_schedule = schedule_map.get('overhaul_readings')
        
        # Build nested statuses
        monthly_status = _build_job_type_status(monthly_schedule)
        overhaul_status = _build_job_type_status(overhaul_schedule)
        
        return WatchmanStatusResponse(
            component_id=component_id,
            component_name=config.nomenclature or "Unknown",
            ship_name=ship.ship_name,
            nomenclature=config.nomenclature,
            monthly_utilization=monthly_status,
            overhaul_readings=overhaul_status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get component status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{component_id}/force-check", response_model=WatchmanCheckResult)
async def force_watchman_check(
    component_id: UUID,
    session: Session = Depends(get_session)
):
    """
    Manually trigger a watchman check for a component
    
    - **component_id**: Component UUID to check
    
    Useful for testing or forcing a check outside the normal schedule
    """
    try:
        # Verify component exists
        config_stmt = select(SystemConfiguration).where(
            SystemConfiguration.component_id == component_id,
            SystemConfiguration.etl == True
        )
        config = session.exec(config_stmt).first()
        
        if not config:
            raise HTTPException(
                status_code=404,
                detail="Component not found or ETL not enabled"
            )
        
        # Execute watchman check
        result = WatchmanExecutor.check_component(
            session=session,
            component_id=component_id,
            triggered_by="manual_api"
        )
        
        session.commit()
        
        logger.info(
            f"Manual watchman check for {component_id} | "
            f"Needs sync: {result.needs_sync} | "
            f"Changed rows: {result.changed_rows}"
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to force check component {component_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audit/history", response_model=List[WatchmanAuditLogRead])
async def get_watchman_audit_history(
    component_id: Optional[UUID] = None,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """
    Get watchman check history
    
    - **component_id**: Filter by component (optional)
    - **limit**: Max records to return (default: 100)
    
    Returns audit trail of all watchman checks
    """
    try:
        logs = WatchmanExecutor.get_audit_history(
            session=session,
            component_id=component_id,
            limit=limit
        )
        
        return [
            WatchmanAuditLogRead(
                audit_id=log["audit_id"],
                component_id=log["component_id"],
                check_timestamp=log["check_timestamp"],
                needs_sync=log["needs_sync"],
                decision_reason=log["decision_reason"],
                source_row_count=log["source_row_count"],
                target_row_count=log["target_row_count"],
                changed_rows_count=log["changed_rows_count"],
                check_duration_ms=log["check_duration_ms"],
                job_queued=log["job_queued"],
                execution_id=log["execution_id"]
            )
            for log in logs
        ]
        
    except Exception as e:
        logger.error(f"Failed to get audit history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics/daily", response_model=List[WatchmanStatisticsRead])
async def get_watchman_statistics(
    days: int = 7,
    session: Session = Depends(get_session)
):
    """
    Get daily watchman statistics
    
    - **days**: Number of days to retrieve (default: 7)
    
    Returns aggregated metrics: checks, syncs, skips, efficiency, etc.
    """
    try:
        stats = WatchmanExecutor.get_daily_statistics(
            session=session,
            days=days
        )
        
        return [
            WatchmanStatisticsRead(
                stat_date=stat["stat_date"],
                total_checks=stat["total_checks"],
                syncs_triggered=stat["syncs_triggered"],
                syncs_skipped=stat["syncs_skipped"],
                skip_rate_percent=stat["skip_rate_percent"],
                avg_check_duration_ms=stat["avg_check_duration_ms"],
                total_time_saved_seconds=stat["total_time_saved_seconds"],
                total_rows_synced=stat["total_rows_synced"],
                accuracy_percent=stat["accuracy_percent"]
            )
            for stat in stats
        ]
        
    except Exception as e:
        logger.error(f"Failed to get statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics/dashboard", response_model=WatchmanDashboardStats)
async def get_watchman_dashboard(
    session: Session = Depends(get_session)
):
    """
    Get watchman dashboard overview
    
    Returns today's metrics and current system state
    """
    try:
        from datetime import date
        
        # Get today's stats
        today = date.today()
        today_stats = WatchmanExecutor.get_daily_statistics(session, days=1)
        
        if today_stats and len(today_stats) > 0:
            stats = today_stats[0]
        else:
            stats = {
                "total_checks": 0,
                "syncs_triggered": 0,
                "syncs_skipped": 0,
                "skip_rate_percent": 0,
                "avg_check_duration_ms": 0,
                "total_time_saved_seconds": 0,
                "total_rows_synced": 0
            }
        
        # Get current state (components pending sync)
        schedule_stmt = select(ETLSchedule).where(
            ETLSchedule.rows_changed_since_last_check > 0
        )
        pending_components = session.exec(schedule_stmt).all()
        
        up_to_date_stmt = select(ETLSchedule).where(
            ETLSchedule.rows_changed_since_last_check == 0
        )
        up_to_date_components = session.exec(up_to_date_stmt).all()
        
        # Get highest risk score
        highest_risk = max(
            [c.sync_risk_score for c in pending_components],
            default=0
        )
        
        # Calculate efficiency
        skip_rate = stats["skip_rate_percent"] or 0
        time_saved_minutes = stats["total_time_saved_seconds"] / 60.0
        
        return WatchmanDashboardStats(
            checks_today=stats["total_checks"],
            syncs_today=stats["syncs_triggered"],
            skips_today=stats["syncs_skipped"],
            skip_rate_today=skip_rate,
            time_saved_today_seconds=stats["total_time_saved_seconds"],
            time_saved_today_minutes=time_saved_minutes,
            avg_check_duration_ms=stats["avg_check_duration_ms"] or 0,
            components_pending_sync=len(pending_components),
            components_up_to_date=len(up_to_date_components),
            highest_risk_score=highest_risk,
            false_positives_today=0,
            accuracy_today=stats.get("accuracy_percent", 100.0) or 100.0
        )
        
    except Exception as e:
        logger.error(f"Failed to get dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))