"""
Service for unregistering equipment with full cascade deletion
File: backend/services/unregister_equipment_service.py
"""
import logging
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select, delete
from sqlalchemy.exc import SQLAlchemyError

from api.models.systemconfiguration import SystemConfiguration, Ship, Department
from api.models.sensor import SensorReading, SensorMetadata, FailureMode
from api.models.Overhaul import Overhaul_metadata, Overhaul_Readings

from api.models.reliability import EtaBeta, AlphaBeta
from api.models.etl import (
    ETLSchedule, ETLExecutionProgress, ETLExecutionLog,
    ETLAuditLog, WatchmanAuditLog
)
from api.models.unregister import (
    UnregisterEquipmentResult, ComponentDeletionSummary
)
from api.db.connection import get_async_db_service, get_session_context
from models.Rcm import RCM


logger = logging.getLogger(__name__)


class UnregisterEquipmentService:
    """Service for unregistering equipment with cascade deletion"""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()


    def _get_component_info(
        self, session: Session, component_id: UUID
    ) -> Optional[dict]:
        """Get component details before deletion"""
        stmt = (
            select(
                SystemConfiguration,
                Ship.ship_name,
                Department.department_name
            )
            .join(Ship, SystemConfiguration.ship_id == Ship.ship_id)
            .join(Department, SystemConfiguration.department_id == Department.department_id)
            .where(SystemConfiguration.component_id == component_id)
        )
        result = session.exec(stmt).first()
        
        if not result:
            return None
        
        component, ship_name, dept_name = result
        return {
            "component": component,
            "ship_name": ship_name,
            "department_name": dept_name
        }

    def _get_all_child_component_ids(
        self, session: Session, parent_id: UUID
    ) -> List[tuple[UUID, str]]:
        """Recursively get all child component IDs and names"""
        children = []
        
        # Get immediate children
        stmt = select(SystemConfiguration).where(
            SystemConfiguration.parent_id == parent_id
        )
        immediate_children = session.exec(stmt).all()
        
        for child in immediate_children:
            children.append((child.component_id, child.component_name))
            # Recursively get children of this child
            children.extend(
                self._get_all_child_component_ids(session, child.component_id)
            )
        
        return children

    def _delete_component_data_sync(
        self, session: Session, component_id: UUID
    ) -> ComponentDeletionSummary:
        """
        Synchronously delete all data related to a component
        Follows proper FK dependency order
        """
        summary = ComponentDeletionSummary()
        
        try:
            # 1. Delete SensorReadings (depends on SensorMetadata)
            result = session.exec(
                delete(SensorReading).where(
                    SensorReading.component_id == component_id
                )
            )
            summary.sensor_readings = result.rowcount
            logger.info(f"Deleted {summary.sensor_readings} sensor readings")

            # 2. Delete SensorMetadata (depends on FailureMode)
            result = session.exec(
                delete(SensorMetadata).where(
                    SensorMetadata.component_id == component_id
                )
            )
            summary.sensor_metadata = result.rowcount
            logger.info(f"Deleted {summary.sensor_metadata} sensor metadata")

            # 3. Delete FailureModes (depends on component)
            result = session.exec(
                delete(FailureMode).where(
                    FailureMode.component_id == component_id
                )
            )
            summary.failure_modes = result.rowcount
            logger.info(f"Deleted {summary.failure_modes} failure modes")

            # 4. Delete ETLExecutionLogs (depends on ETLExecutionProgress)
            # First get execution IDs for this component
            exec_stmt = select(ETLExecutionProgress.execution_id).where(
                ETLExecutionProgress.component_id == component_id
            )
            execution_ids = session.exec(exec_stmt).all()
            
            if execution_ids:
                result = session.exec(
                    delete(ETLExecutionLog).where(
                        ETLExecutionLog.execution_id.in_(execution_ids)
                    )
                )
                summary.etl_execution_logs = result.rowcount
                logger.info(f"Deleted {summary.etl_execution_logs} ETL execution logs")

            # 5. Delete ETLExecutionProgress
            result = session.exec(
                delete(ETLExecutionProgress).where(
                    ETLExecutionProgress.component_id == component_id
                )
            )
            summary.etl_execution_progress = result.rowcount
            logger.info(f"Deleted {summary.etl_execution_progress} ETL execution progress")

            # 6. Delete ETLSchedule
            result = session.exec(
                delete(ETLSchedule).where(
                    ETLSchedule.component_id == component_id
                )
            )
            summary.etl_schedules = result.rowcount
            logger.info(f"Deleted {summary.etl_schedules} ETL schedules")

            # 7. Delete ETLAuditLog
            result = session.exec(
                delete(ETLAuditLog).where(
                    ETLAuditLog.component_id == component_id
                )
            )
            summary.etl_audit_logs = result.rowcount
            logger.info(f"Deleted {summary.etl_audit_logs} ETL audit logs")

            # 8. Delete WatchmanAuditLog
            result = session.exec(
                delete(WatchmanAuditLog).where(
                    WatchmanAuditLog.component_id == component_id
                )
            )
            summary.watchman_audit_logs = result.rowcount
            logger.info(f"Deleted {summary.watchman_audit_logs} watchman audit logs")

            # 9. Delete Overhaul_Readings
            result = session.exec(
                delete(Overhaul_Readings).where(
                    Overhaul_Readings.component_id == component_id
                )
            )
            summary.overhaul_readings = result.rowcount
            logger.info(f"Deleted {summary.overhaul_readings} overhaul readings")

            # 10. Delete Overhaul_metadata
            result = session.exec(
                delete(Overhaul_metadata).where(
                    Overhaul_metadata.component_id == component_id
                )
            )
            summary.overhaul_metadata = result.rowcount
            logger.info(f"Deleted {summary.overhaul_metadata} overhaul metadata")

            # 11. Delete RCM records
            result = session.exec(
                delete(RCM).where(RCM.component_id == component_id)
            )
            summary.rcm_records = result.rowcount
            logger.info(f"Deleted {summary.rcm_records} RCM records")

            # 12. Delete EtaBeta records
            result = session.exec(
                delete(EtaBeta).where(EtaBeta.component_id == component_id)
            )
            summary.eta_beta_records = result.rowcount
            logger.info(f"Deleted {summary.eta_beta_records} EtaBeta records")

            # 13. Delete AlphaBeta records
            result = session.exec(
                delete(AlphaBeta).where(AlphaBeta.component_id == component_id)
            )
            summary.alpha_beta_records = result.rowcount
            logger.info(f"Deleted {summary.alpha_beta_records} AlphaBeta records")

            # Calculate total
            summary.total_records_deleted = (
                summary.sensor_readings +
                summary.sensor_metadata +
                summary.failure_modes +
                summary.etl_execution_logs +
                summary.etl_execution_progress +
                summary.etl_schedules +
                summary.etl_audit_logs +
                summary.watchman_audit_logs +
                summary.overhaul_readings +
                summary.overhaul_metadata +
                summary.rcm_records +
                summary.eta_beta_records +
                summary.alpha_beta_records
            )

            return summary

        except Exception as e:
            logger.error(f"Error deleting component data: {e}")
            raise

    def _unregister_equipment_sync(
        self, session: Session, component_id: UUID
    ) -> UnregisterEquipmentResult:
        """
        Synchronous equipment unregistration with cascade delete
        """
        warnings = []
        deleted_children_names = []
        
        try:
            # 1. Get component info before deletion
            info = self._get_component_info(session, component_id)
            if not info:
                raise ValueError(f"Component {component_id} not found")
            
            component = info["component"]
            ship_name = info["ship_name"]
            department_name = info["department_name"]
            component_name = component.component_name

            logger.info(
                f"Starting unregistration of component: {component_name} "
                f"(ID: {component_id})"
            )

            # 2. Get all child components recursively
            all_children = self._get_all_child_component_ids(session, component_id)
            logger.info(f"Found {len(all_children)} child components to delete")

            # 3. Initialize summary
            total_summary = ComponentDeletionSummary()

            # 4. Delete all children (bottom-up, reverse order)
            for child_id, child_name in reversed(all_children):
                logger.info(f"Deleting child component: {child_name} (ID: {child_id})")
                child_summary = self._delete_component_data_sync(session, child_id)
                
                # Accumulate summaries
                total_summary.sensor_readings += child_summary.sensor_readings
                total_summary.sensor_metadata += child_summary.sensor_metadata
                total_summary.failure_modes += child_summary.failure_modes
                total_summary.etl_execution_logs += child_summary.etl_execution_logs
                total_summary.etl_execution_progress += child_summary.etl_execution_progress
                total_summary.etl_schedules += child_summary.etl_schedules
                total_summary.etl_audit_logs += child_summary.etl_audit_logs
                total_summary.watchman_audit_logs += child_summary.watchman_audit_logs
                total_summary.overhaul_readings += child_summary.overhaul_readings
                total_summary.overhaul_metadata += child_summary.overhaul_metadata
                total_summary.rcm_records += child_summary.rcm_records
                total_summary.eta_beta_records += child_summary.eta_beta_records
                total_summary.alpha_beta_records += child_summary.alpha_beta_records
                
                # Delete the child component itself
                session.exec(
                    delete(SystemConfiguration).where(
                        SystemConfiguration.component_id == child_id
                    )
                )
                total_summary.child_components += 1
                deleted_children_names.append(child_name)

            # 5. Delete parent component's data
            parent_summary = self._delete_component_data_sync(session, component_id)
            
            # Accumulate parent summary
            total_summary.sensor_readings += parent_summary.sensor_readings
            total_summary.sensor_metadata += parent_summary.sensor_metadata
            total_summary.failure_modes += parent_summary.failure_modes
            total_summary.etl_execution_logs += parent_summary.etl_execution_logs
            total_summary.etl_execution_progress += parent_summary.etl_execution_progress
            total_summary.etl_schedules += parent_summary.etl_schedules
            total_summary.etl_audit_logs += parent_summary.etl_audit_logs
            total_summary.watchman_audit_logs += parent_summary.watchman_audit_logs
            total_summary.overhaul_readings += parent_summary.overhaul_readings
            total_summary.overhaul_metadata += parent_summary.overhaul_metadata
            total_summary.rcm_records += parent_summary.rcm_records
            total_summary.eta_beta_records += parent_summary.eta_beta_records
            total_summary.alpha_beta_records += parent_summary.alpha_beta_records
            total_summary.total_records_deleted += parent_summary.total_records_deleted

            # 6. Finally delete the parent component itself
            session.exec(
                delete(SystemConfiguration).where(
                    SystemConfiguration.component_id == component_id
                )
            )
            logger.info(f"Deleted parent component: {component_name}")

            # 7. Commit transaction
            session.commit()
            logger.info(
                f"Successfully unregistered equipment {component_name} "
                f"with {total_summary.child_components} children"
            )

            return UnregisterEquipmentResult(
                component_id=component_id,
                component_name=component_name,
                ship_name=ship_name,
                department_name=department_name,
                deleted=True,
                deletion_summary=total_summary,
                warnings=warnings,
                deleted_children=deleted_children_names,
                timestamp=datetime.utcnow()
            )

        except ValueError as e:
            session.rollback()
            logger.error(f"Validation error: {e}")
            raise
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Database error during unregistration: {e}")
            raise
        except Exception as e:
            session.rollback()
            logger.error(f"Unexpected error during unregistration: {e}")
            raise

    async def unregister_equipment(
        self, component_id: UUID
    ) -> UnregisterEquipmentResult:
        """
        Async wrapper for equipment unregistration
        """
        def _unregister():
            with get_session_context() as session:
                return self._unregister_equipment_sync(session, component_id)

        return await self.async_service.run_in_thread(_unregister)


# Singleton instance
unregister_equipment_service = UnregisterEquipmentService()