import pyodbc
import logging
from typing import Optional, Callable, Dict, Any, List
from uuid import UUID
from datetime import datetime
from contextlib import contextmanager
from config import settings
from sqlmodel import Session

from api.models.etl import ETLExecutionLog

logger = logging.getLogger(__name__)


class SQLExecutor:
    """Execute stored procedures with PRINT statement capture"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.connection_string = self._build_pyodbc_connection_string()
    
    def _build_pyodbc_connection_string(self) -> str:
        """Build pyodbc connection string (not SQLAlchemy format)"""
        # Extract connection details from DATABASE_URL or use settings
        return (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={self._extract_server()};"
            f"DATABASE={settings.db_name};"
            f"UID={settings.db_username};"
            f"PWD={settings.db_password};"
            f"TrustServerCertificate=yes;"
            f"Connection Timeout=300;"
        )
    
    def _extract_server(self) -> str:
        """Extract server from DATABASE_URL"""
        # Parse: mssql+pyodbc://user:pass@SERVER/dbname?...
        try:
            url = settings.DATABASE_URL
            # Simple extraction (you may need to adjust based on your URL format)
            if "@" in url and "/" in url:
                server_part = url.split("@")[1].split("/")[0]
                return server_part
            return "localhost"  # Fallback
        except Exception as e:
            logger.debug(f"Failed to extract server from DATABASE_URL: {e}")
            return "localhost"
    
    @contextmanager
    def get_connection(self):
        """Get pyodbc connection with InfoMessage handler"""
        conn = None
        try:
            conn = pyodbc.connect(self.connection_string)
            conn.autocommit = False
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    def execute_sp(
        self,
        sp_name: str,
        execution_id: UUID,
        params: Optional[Dict[str, Any]] = None,
        log_callback: Optional[Callable[[str, str], None]] = None
    ) -> Dict[str, Any]:
        """
        Execute stored procedure with PRINT capture
        
        Args:
            sp_name: Stored procedure name
            execution_id: Current execution ID for logging
            params: SP parameters (if any)
            log_callback: Optional callback for each log message
        
        Returns:
            Dict with session_id, rows_affected, output_params
        """
        logs: List[Dict[str, str]] = []
        session_id = None
        rows_affected = 0
        
        def message_handler(sqlstate, msg):
            """Capture SQL PRINT statements"""
            if sqlstate == '01000':  # Informational message
                log_message = msg.message if hasattr(msg, 'message') else str(msg)
                
                # Determine log level from message content
                log_level = self._determine_log_level(log_message)
                
                # Store log
                logs.append({
                    'level': log_level,
                    'message': log_message
                })
                
                # Callback for real-time processing
                if log_callback:
                    log_callback(log_level, log_message)
                
                logger.info(f"[SQL PRINT] {log_message}")
        
        try:
            with self.get_connection() as conn:
                # Add message handler for PRINT statements
                if settings.enable_sql_print_capture:
                    conn.add_output_converter(-1, message_handler)
                
                cursor = conn.cursor()
                
                # Get session ID for cancellation
                cursor.execute("SELECT @@SPID")
                session_id = cursor.fetchone()[0]
                
                # Build EXEC statement
                if params:
                    param_string = ', '.join([f"@{k}=?" for k in params.keys()])
                    exec_sql = f"EXEC {sp_name} {param_string}"
                    cursor.execute(exec_sql, list(params.values()))
                else:
                    cursor.execute(f"EXEC {sp_name}")
                
                # Get rows affected
                rows_affected = cursor.rowcount if cursor.rowcount > 0 else 0
                
                # Commit
                conn.commit()
                
                # Persist logs to database
                self._persist_logs(execution_id, logs)
                
                return {
                    'session_id': session_id,
                    'rows_affected': rows_affected,
                    'success': True,
                    'logs_captured': len(logs)
                }
        
        except pyodbc.Error as e:
            error_msg = str(e)
            logger.error(f"SP execution failed: {error_msg}")
            
            # Log error
            self._log_error(execution_id, error_msg)
            
            raise
        
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            self._log_error(execution_id, error_msg)
            raise
    
    def _determine_log_level(self, message: str) -> str:
        """Determine log level from message content"""
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in ['error', 'failed', 'exception']):
            return 'ERROR'
        elif any(keyword in message_lower for keyword in ['warning', 'warn', 'skipped']):
            return 'WARNING'
        elif any(keyword in message_lower for keyword in ['debug', 'trace']):
            return 'DEBUG'
        else:
            return 'INFO'
    
    def _persist_logs(self, execution_id: UUID, logs: List[Dict[str, str]]):
        """Persist captured logs to database"""
        try:
            for log in logs:
                log_entry = ETLExecutionLog(
                    execution_id=execution_id,
                    log_level=log['level'],
                    message=log['message'],
                    source='sql_print',
                    logged_at=datetime.utcnow()
                )
                self.db_session.add(log_entry)
            
            self.db_session.commit()
            
        except Exception as e:
            logger.error(f"Failed to persist logs: {e}")
            # Don't fail the job if logging fails
    
    def _log_error(self, execution_id: UUID, error_message: str):
        """Log error to database"""
        try:
            log_entry = ETLExecutionLog(
                execution_id=execution_id,
                log_level='ERROR',
                message=error_message,
                source='sql_error',
                logged_at=datetime.utcnow()
            )
            self.db_session.add(log_entry)
            self.db_session.commit()
        except Exception as e:
            logger.error(f"Failed to log error: {e}")
    
    def kill_session(self, session_id: int) -> bool:
        """Kill a SQL Server session (for cancellation)"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(f"KILL {session_id}")
                conn.commit()
                logger.warning(f"Killed session {session_id}")
                return True
        except Exception as e:
            logger.error(f"Failed to kill session {session_id}: {e}")
            return False


class SPExecutionHelper:
    """Helper methods for common SP execution patterns"""
    
    @staticmethod
    def execute_monthly_utilization(
        executor: SQLExecutor,
        execution_id: UUID,
        component_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Execute monthly utilization ETL SP"""
        
        # Your SP processes all components internally based on etl_schedule
        # If we want to pass component_id in future, modify SP to accept parameter
        
        return executor.execute_sp(
            sp_name='sp_process_monthly_utilization_etl',
            execution_id=execution_id,
            params=None  # SP handles component selection internally
        )
    
    @staticmethod
    def execute_overhaul_readings(
        executor: SQLExecutor,
        execution_id: UUID
    ) -> Dict[str, Any]:
        """Execute overhaul readings ETL SP"""
        
        return executor.execute_sp(
            sp_name='usp_ETL_Overhaul_Readings',
            execution_id=execution_id,
            params=None
        )