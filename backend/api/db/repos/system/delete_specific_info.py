"""
Service for deleting specific table data for a component
File: backend/services/delete_specific_info_service.py
"""
import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import Session, select, delete, func
from sqlalchemy.exc import SQLAlchemyError

from api.models.systemconfiguration import SystemConfiguration, Ship, Department
from api.models.sensor import SensorReading, SensorMetadata, FailureMode
from api.models.Overhaul import Overhaul_metadata, Overhaul_Readings

from api.models.reliability import EtaBeta, AlphaBeta
from api.models.etl import (
    ETLSchedule, ETLExecutionProgress, ETLExecutionLog,
    ETLAuditLog, WatchmanAuditLog
)
from api.models.delete_specific import (
    TableType, DeleteSpecificInfoResult, AvailableTablesResponse
)
from api.db.connection import get_async_db_service, get_session_context
from api.models.Rcm import RCM


logger = logging.getLogger(__name__)


class DeleteSpecificInfoService:
    """Service for selective table data deletion"""

    def __init__(self, session: Session, async_service=None):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _get_component_info(
        self, session: Session, component_id: UUID
    ) -> Optional[dict]:
        """Get component details"""
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

    def _delete_from_table_sync(
        self, session: Session, component_id: UUID, table_type: TableType
    ) -> int:
        """Delete data from specific table"""
        
        deleted_count = 0
        
        try:
            if table_type == TableType.SENSOR_READINGS:
                result = session.exec(
                    delete(SensorReading).where(
                        SensorReading.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.SENSOR_METADATA:
                result = session.exec(
                    delete(SensorMetadata).where(
                        SensorMetadata.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.FAILURE_MODES:
                result = session.exec(
                    delete(FailureMode).where(
                        FailureMode.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.ETL_EXECUTION_LOGS:
                # Get execution IDs first
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
                    deleted_count = result.rowcount

            elif table_type == TableType.ETL_EXECUTION_PROGRESS:
                result = session.exec(
                    delete(ETLExecutionProgress).where(
                        ETLExecutionProgress.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.ETL_SCHEDULES:
                result = session.exec(
                    delete(ETLSchedule).where(
                        ETLSchedule.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.ETL_AUDIT_LOGS:
                result = session.exec(
                    delete(ETLAuditLog).where(
                        ETLAuditLog.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.WATCHMAN_AUDIT_LOGS:
                result = session.exec(
                    delete(WatchmanAuditLog).where(
                        WatchmanAuditLog.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.OVERHAUL_READINGS:
                result = session.exec(
                    delete(Overhaul_Readings).where(
                        Overhaul_Readings.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.OVERHAUL_METADATA:
                result = session.exec(
                    delete(Overhaul_metadata).where(
                        Overhaul_metadata.component_id == component_id
                    )
                )
                deleted_count = result.rowcount

            elif table_type == TableType.RCM_RECORDS:
                result = session.exec(
                    delete(RCM).where(RCM.component_id == component_id)
                )
                deleted_count = result.rowcount

            elif table_type == TableType.ETA_BETA_RECORDS:
                result = session.exec(
                    delete(EtaBeta).where(EtaBeta.component_id == component_id)
                )
                deleted_count = result.rowcount

            elif table_type == TableType.ALPHA_BETA_RECORDS:
                result = session.exec(
                    delete(AlphaBeta).where(AlphaBeta.component_id == component_id)
                )
                deleted_count = result.rowcount

            logger.info(
                f"Deleted {deleted_count} records from {table_type} "
                f"for component {component_id}"
            )
            return deleted_count

        except Exception as e:
            logger.error(f"Error deleting from {table_type}: {e}")
            raise

    def _delete_specific_info_sync(
        self, session: Session, component_id: UUID, table_type: TableType
    ) -> DeleteSpecificInfoResult:
        """Synchronously delete specific table data"""
        warnings = []
        
        try:
            # Get component info
            info = self._get_component_info(session, component_id)
            if not info:
                raise ValueError(f"Component {component_id} not found")
            
            component = info["component"]
            ship_name = info["ship_name"]
            department_name = info["department_name"]
            component_name = component.component_name

            logger.info(
                f"Starting deletion of {table_type} data for component: "
                f"{component_name} (ID: {component_id})"
            )

            # Delete from specific table
            deleted_count = self._delete_from_table_sync(
                session, component_id, table_type
            )

            # Commit transaction
            session.commit()
            logger.info(
                f"Successfully deleted {deleted_count} records from {table_type} "
                f"for {component_name}"
            )

            return DeleteSpecificInfoResult(
                component_id=component_id,
                component_name=component_name,
                ship_name=ship_name,
                department_name=department_name,
                table_type=table_type.value,
                records_deleted=deleted_count,
                deleted=True,
                warnings=warnings,
                timestamp=datetime.utcnow()
            )

        except ValueError as e:
            session.rollback()
            logger.error(f"Validation error: {e}")
            raise
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Database error during deletion: {e}")
            raise
        except Exception as e:
            session.rollback()
            logger.error(f"Unexpected error during deletion: {e}")
            raise

    def _get_table_counts_sync(
        self, session: Session, component_id: UUID
    ) -> dict:
        """Get record counts for all tables"""
        counts = {}
        
        try:
            # Sensor Readings
            counts[TableType.SENSOR_READINGS.value] = session.exec(
                select(func.count()).select_from(SensorReading).where(
                    SensorReading.component_id == component_id
                )
            ).one()

            # Sensor Metadata
            counts[TableType.SENSOR_METADATA.value] = session.exec(
                select(func.count()).select_from(SensorMetadata).where(
                    SensorMetadata.component_id == component_id
                )
            ).one()

            # Failure Modes
            counts[TableType.FAILURE_MODES.value] = session.exec(
                select(func.count()).select_from(FailureMode).where(
                    FailureMode.component_id == component_id
                )
            ).one()

            # ETL Execution Progress
            counts[TableType.ETL_EXECUTION_PROGRESS.value] = session.exec(
                select(func.count()).select_from(ETLExecutionProgress).where(
                    ETLExecutionProgress.component_id == component_id
                )
            ).one()

            # ETL Schedules
            counts[TableType.ETL_SCHEDULES.value] = session.exec(
                select(func.count()).select_from(ETLSchedule).where(
                    ETLSchedule.component_id == component_id
                )
            ).one()

            # ETL Audit Logs
            counts[TableType.ETL_AUDIT_LOGS.value] = session.exec(
                select(func.count()).select_from(ETLAuditLog).where(
                    ETLAuditLog.component_id == component_id
                )
            ).one()

            # Watchman Audit Logs
            counts[TableType.WATCHMAN_AUDIT_LOGS.value] = session.exec(
                select(func.count()).select_from(WatchmanAuditLog).where(
                    WatchmanAuditLog.component_id == component_id
                )
            ).one()

            # Overhaul Readings
            counts[TableType.OVERHAUL_READINGS.value] = session.exec(
                select(func.count()).select_from(Overhaul_Readings).where(
                    Overhaul_Readings.component_id == component_id
                )
            ).one()

            # Overhaul Metadata
            counts[TableType.OVERHAUL_METADATA.value] = session.exec(
                select(func.count()).select_from(Overhaul_metadata).where(
                    Overhaul_metadata.component_id == component_id
                )
            ).one()

            # RCM Records
            counts[TableType.RCM_RECORDS.value] = session.exec(
                select(func.count()).select_from(RCM).where(
                    RCM.component_id == component_id
                )
            ).one()

            # EtaBeta Records
            counts[TableType.ETA_BETA_RECORDS.value] = session.exec(
                select(func.count()).select_from(EtaBeta).where(
                    EtaBeta.component_id == component_id
                )
            ).one()

            # AlphaBeta Records
            counts[TableType.ALPHA_BETA_RECORDS.value] = session.exec(
                select(func.count()).select_from(AlphaBeta).where(
                    AlphaBeta.component_id == component_id
                )
            ).one()

            return counts

        except Exception as e:
            logger.error(f"Error getting table counts: {e}")
            raise

    async def delete_specific_info(
        self, component_id: UUID, table_type: TableType
    ) -> DeleteSpecificInfoResult:
        """Async wrapper for specific table deletion"""
        def _delete():
            with get_session_context() as session:
                return self._delete_specific_info_sync(
                    session, component_id, table_type
                )

        return await self.async_service.run_in_thread(_delete)

    async def get_available_tables(
        self, component_id: UUID
    ) -> AvailableTablesResponse:
        """Get available tables with record counts"""
        def _get_counts():
            with get_session_context() as session:
                info = self._get_component_info(session, component_id)
                if not info:
                    raise ValueError(f"Component {component_id} not found")
                
                counts = self._get_table_counts_sync(session, component_id)
                
                return AvailableTablesResponse(
                    component_id=component_id,
                    component_name=info["component"].component_name,
                    tables=counts
                )

        return await self.async_service.run_in_thread(_get_counts)


# Singleton instance
delete_specific_info_service = DeleteSpecificInfoService()