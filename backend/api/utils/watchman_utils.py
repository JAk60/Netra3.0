"""
Watchman Utility Functions
Provides Python interface to watchman stored procedures
"""

from sqlmodel import Session, select, text
from typing import Dict, List, Optional, Any
from uuid import UUID
from datetime import datetime
import logging

from api.models.etl import (
    WatchmanCheckResult,
    WatchmanBatchSummary,
    WatchmanAuditLog,
    WatchmanStatistics,
    ETLSchedule
)

logger = logging.getLogger(__name__)


class WatchmanExecutor:
    """Execute watchman stored procedures and parse results"""
    
    @staticmethod
    def check_component(
        session: Session,
        component_id: UUID,
        triggered_by: str = "manual_api"
    ) -> WatchmanCheckResult:
        """
        Check single component for changes
        
        Args:
            session: Database session
            component_id: Component to check
            triggered_by: Source of check (manual_api, beat_schedule)
            
        Returns:
            WatchmanCheckResult with check details
        """
        try:
            # Execute stored procedure
            query = text("""
                EXEC usp_watchman_check_component 
                    @component_id = :component_id,
                    @triggered_by = :triggered_by
            """)
            
            result = session.execute(
                query,
                {
                    "component_id": str(component_id),
                    "triggered_by": triggered_by
                }
            ).first()
            
            if not result:
                raise ValueError(f"No result returned for component {component_id}")
            
            # Parse result
            return WatchmanCheckResult(
                component_id=UUID(result.component_id),
                needs_sync=bool(result.needs_sync),
                decision_reason=result.decision_reason,
                changed_rows=result.changed_rows or 0,
                source_count=result.source_count,
                target_count=result.target_count,
                source_watermark=result.source_watermark,
                last_watermark=result.last_watermark,
                risk_score=result.risk_score or 0,
                check_duration_ms=result.check_duration_ms
            )
            
        except Exception as e:
            logger.error(f"Watchman check failed for component {component_id}: {e}")
            raise
    
    @staticmethod
    def check_batch(
        session: Session,
        triggered_by: str = "beat_schedule"
    ) -> Dict[str, Any]:
        """
        Check all components for changes
        
        Commits existing transaction then uses raw connection
        """
        try:
            # Commit any pending transaction to allow connection reuse
            session.commit()
            
            # Now get a fresh connection from the engine
            raw_conn = session.connection().connection
            cursor = raw_conn.cursor()
            
            try:
                # Execute SP with autocommit behavior
                cursor.execute(
                    "EXEC usp_watchman_check_batch @triggered_by = ?",
                    (triggered_by,)
                )
                
                # Fetch first result set (components needing sync)
                components_to_sync = []
                if cursor.description:
                    columns = [column[0] for column in cursor.description]
                    
                    for row in cursor.fetchall():
                        row_dict = dict(zip(columns, row))
                        components_to_sync.append({
                            "component_id": UUID(row_dict['component_id']) if row_dict.get('component_id') else None,
                            "component_name": row_dict.get('component_name'),
                            "ship_name": row_dict.get('ship_name'),
                            "needs_sync": bool(row_dict.get('needs_sync', 0)),
                            "decision_reason": row_dict.get('decision_reason'),
                            "changed_rows": row_dict.get('changed_rows', 0) or 0,
                            "source_count": row_dict.get('source_count'),
                            "target_count": row_dict.get('target_count'),
                            "source_watermark": row_dict.get('source_watermark'),
                            "risk_score": row_dict.get('risk_score', 0) or 0,
                            "check_duration_ms": row_dict.get('check_duration_ms'),
                            "error_message": row_dict.get('error_message'),
                            "last_run_time": row_dict.get('last_run_time'),
                            "next_run_time": row_dict.get('next_run_time')
                        })
                
                # Move to second result set (batch summary)
                summary = None
                if cursor.nextset() and cursor.description:
                    summary_columns = [column[0] for column in cursor.description]
                    summary_row = cursor.fetchone()
                    
                    if summary_row:
                        summary_dict = dict(zip(summary_columns, summary_row))
                        summary = WatchmanBatchSummary(
                            total_components=summary_dict.get('total_components', 0),
                            needs_sync=summary_dict.get('needs_sync', 0),
                            up_to_date=summary_dict.get('up_to_date', 0),
                            total_changed_rows=summary_dict.get('total_changed_rows', 0) or 0,
                            avg_check_duration_ms=float(summary_dict.get('avg_check_duration_ms', 0) or 0),
                            max_risk_score=max([c["risk_score"] for c in components_to_sync], default=0),
                            check_timestamp=summary_dict.get('check_timestamp', datetime.utcnow())
                        )
                
                # Fallback summary if not returned
                if not summary:
                    summary = WatchmanBatchSummary(
                        total_components=1,
                        needs_sync=len([c for c in components_to_sync if c["needs_sync"]]),
                        up_to_date=1 if not components_to_sync or not any(c["needs_sync"] for c in components_to_sync) else 0,
                        total_changed_rows=sum(c["changed_rows"] for c in components_to_sync),
                        avg_check_duration_ms=0,
                        max_risk_score=max([c["risk_score"] for c in components_to_sync], default=0),
                        check_timestamp=datetime.utcnow()
                    )
                
                # Commit the cursor operations
                raw_conn.commit()
                
                logger.info(
                    f"Watchman batch check complete | "
                    f"Total: {summary.total_components} | "
                    f"Sync needed: {summary.needs_sync} | "
                    f"Up to date: {summary.up_to_date}"
                )
                
                return {
                    "components": components_to_sync,
                    "summary": summary
                }
                
            finally:
                cursor.close()
                
        except Exception as e:
            logger.error(f"Watchman batch check failed: {e}")
            # Rollback on error
            try:
                session.rollback()
            except:
                pass
            raise
    @staticmethod
    def update_watermark(
        session: Session,
        component_id: UUID,
        execution_id: Optional[UUID] = None,
        rows_synced: int = 0
    ) -> Dict[str, Any]:
        """
        Update watermark after successful sync
        
        Args:
            session: Database session
            component_id: Component that was synced
            execution_id: ETL execution ID
            rows_synced: Number of rows synced
            
        Returns:
            Dict with update confirmation
        """
        try:
            query = text("""
                EXEC usp_watchman_update_watermark
                    @component_id = :component_id,
                    @execution_id = :execution_id,
                    @rows_synced = :rows_synced
            """)
            
            result = session.execute(
                query,
                {
                    "component_id": str(component_id),
                    "execution_id": str(execution_id) if execution_id else None,
                    "rows_synced": rows_synced
                }
            ).first()
            
            if result and result.watermark_updated:
                logger.info(
                    f"Watermark updated for component {component_id} | "
                    f"New watermark: {result.new_watermark} | "
                    f"Rows: {rows_synced}"
                )
                
                return {
                    "component_id": component_id,
                    "watermark_updated": True,
                    "new_watermark": result.new_watermark,
                    "target_watermark": result.target_watermark,
                    "rows_synced": rows_synced
                }
            else:
                logger.warning(f"Watermark update failed for component {component_id}")
                return {
                    "component_id": component_id,
                    "watermark_updated": False,
                    "error_message": result.error_message if result else "No result returned"
                }
                
        except Exception as e:
            logger.error(f"Failed to update watermark for {component_id}: {e}")
            # Don't raise - watermark update failure shouldn't break the ETL
            return {
                "component_id": component_id,
                "watermark_updated": False,
                "error_message": str(e)
            }
    
    
    @staticmethod
    def get_component_status(
        session: Session,
        component_id: UUID
    ) -> Optional[Dict[str, Any]]:
        """
        Get current watchman status for a component
        
        Args:
            session: Database session
            component_id: Component ID
            
        Returns:
            Dict with component status details
        """
        try:
            # Get schedule info
            schedule_stmt = select(ETLSchedule).where(
                ETLSchedule.component_id == component_id
            )
            schedule = session.exec(schedule_stmt).first()
            
            if not schedule:
                return None
            
            # Determine sync status
            if schedule.source_watermark is None:
                sync_status = "first_run"
            elif schedule.rows_changed_since_last_check and schedule.rows_changed_since_last_check > 0:
                sync_status = "pending_sync"
            elif schedule.status == "error":
                sync_status = "error"
            else:
                sync_status = "up_to_date"
            
            return {
                "component_id": component_id,
                "sync_status": sync_status,
                "needs_sync": schedule.rows_changed_since_last_check > 0 if schedule.rows_changed_since_last_check else False,
                "changed_rows": schedule.rows_changed_since_last_check,
                "risk_score": schedule.sync_risk_score,
                "source_watermark": schedule.source_watermark,
                "target_watermark": schedule.target_watermark,
                "last_change_detected": schedule.last_change_detected,
                "last_sync_start": schedule.last_sync_start,
                "last_sync_duration_seconds": schedule.last_sync_duration_seconds,
                "last_run_time": schedule.last_run_time,
                "next_run_time": schedule.next_run_time,
                "status": schedule.status
            }
            
        except Exception as e:
            logger.error(f"Failed to get status for component {component_id}: {e}")
            return None
    
    
    @staticmethod
    def get_audit_history(
        session: Session,
        component_id: Optional[UUID] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get watchman check history
        
        Args:
            session: Database session
            component_id: Filter by component (optional)
            limit: Max records to return
            
        Returns:
            List of audit log entries
        """
        try:
            statement = select(WatchmanAuditLog)
            
            if component_id:
                statement = statement.where(
                    WatchmanAuditLog.component_id == component_id
                )
            
            statement = statement.order_by(
                WatchmanAuditLog.check_timestamp.desc()
            ).limit(limit)
            
            logs = session.exec(statement).all()
            
            return [
                {
                    "audit_id": log.audit_id,
                    "component_id": log.component_id,
                    "check_timestamp": log.check_timestamp,
                    "needs_sync": log.needs_sync,
                    "decision_reason": log.decision_reason,
                    "source_row_count": log.source_row_count,
                    "target_row_count": log.target_row_count,
                    "changed_rows_count": log.changed_rows_count,
                    "check_duration_ms": log.check_duration_ms,
                    "job_queued": log.job_queued,
                    "execution_id": log.execution_id
                }
                for log in logs
            ]
            
        except Exception as e:
            logger.error(f"Failed to get audit history: {e}")
            return []
    
    
    @staticmethod
    def get_daily_statistics(
        session: Session,
        days: int = 7
    ) -> List[Dict[str, Any]]:
        """
        Get watchman statistics for last N days
        
        Args:
            session: Database session
            days: Number of days to retrieve
            
        Returns:
            List of daily stats
        """
        try:
            statement = select(WatchmanStatistics).order_by(
                WatchmanStatistics.stat_date.desc()
            ).limit(days)
            
            stats = session.exec(statement).all()
            
            return [
                {
                    "stat_date": stat.stat_date,
                    "total_checks": stat.total_checks,
                    "syncs_triggered": stat.syncs_triggered,
                    "syncs_skipped": stat.syncs_skipped,
                    "skip_rate_percent": stat.skip_rate_percent,
                    "avg_check_duration_ms": stat.avg_check_duration_ms,
                    "total_time_saved_seconds": stat.total_time_saved_seconds,
                    "total_rows_synced": stat.total_rows_synced,
                    "accuracy_percent": stat.accuracy_percent
                }
                for stat in stats
            ]
            
        except Exception as e:
            logger.error(f"Failed to get daily statistics: {e}")
            return []