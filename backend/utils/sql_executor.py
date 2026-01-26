"""
SQL Executor with proper pyodbc connection handling
"""

import random
from sqlmodel import select
import pyodbc
import logging
from typing import Dict, Any, Optional, List
from uuid import UUID
import time

from api.db.connection import get_session_context
from api.models.systemconfiguration import Ship, SystemConfiguration

logger = logging.getLogger(__name__)


class SQLExecutor:
    """
    Execute raw SQL and stored procedures using pyodbc.
    One executor = one connection.
    """

    def __init__(self, session=None):
        self.session = session
        self._connection = None

    def get_connection(self):
        """Get or create pyodbc connection"""
        if self._connection is None:
            from api.db.connection import get_raw_connection
            self._connection = get_raw_connection()
            self._connection.autocommit = False  # 🔒 explicit transaction control
        return self._connection

    def execute_sp(self, sp_name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute stored procedure safely.
        ALWAYS rolls back on failure.
        """
        params = params or {}
        conn = self.get_connection()
        cursor = None

        try:
            cursor = conn.cursor()

            if params:
                placeholders = ", ".join([f"@{k} = ?" for k in params.keys()])
                query = f"EXEC {sp_name} {placeholders}"
                values = list(params.values())
            else:
                query = f"EXEC {sp_name}"
                values = []

            logger.debug(f"Executing SP: {query}")
            logger.debug(f"Params: {params}")

            cursor.execute(query, values)

            results = []
            if cursor.description:
                columns = [col[0] for col in cursor.description]
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))

            rows_affected = cursor.rowcount
            conn.commit()

            return {
                "success": True,
                "results": results,
                "rows_affected": rows_affected
            }

        except pyodbc.Error as e:
            logger.error(f"Database error executing {sp_name}: {e}")
            logger.error(f"Query: {query if 'query' in locals() else 'N/A'}")
            logger.error(f"Params: {params}")

            # 🔥 CRITICAL FIX: rollback poisoned transaction
            try:
                conn.rollback()
            except Exception:
                pass

            raise

        except Exception as e:
            logger.error(f"Unexpected error executing {sp_name}: {e}")
            try:
                conn.rollback()
            except Exception:
                pass
            raise

        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass

    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a raw SQL query safely"""
        conn = self.get_connection()
        cursor = None

        try:
            cursor = conn.cursor()
            cursor.execute(query, params or ())
            results = []

            if cursor.description:
                columns = [col[0] for col in cursor.description]
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))

            return results

        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            try:
                conn.rollback()
            except Exception:
                pass
            raise

        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass

    def close(self):
        """Close underlying connection"""
        if self._connection:
            try:
                self._connection.close()
            except Exception:
                pass
            self._connection = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

class SPExecutionHelper:
    """Helper methods for common stored procedures"""
    
    @staticmethod
    def execute_monthly_utilization(
        executor: SQLExecutor,
        execution_id: UUID,
        component_id: UUID
    ) -> Dict[str, Any]:
        """
        Execute monthly utilization SP
        
        Args:
            executor: SQLExecutor instance
            execution_id: Execution tracking ID (not used by SP, kept for compatibility)
            component_id: Component UUID
            
        Returns:
            Dict with session_id and rows_affected
        """
        
        # Extract data INSIDE the session context to avoid detached instance errors
        with get_session_context() as session:
            config_stmt = select(SystemConfiguration).where(
                SystemConfiguration.component_id == component_id
            )
            config = session.exec(config_stmt).first()
            
            if not config:
                raise ValueError(f"Component {component_id} not found")
            
            ship_stmt = select(Ship).where(Ship.ship_id == config.ship_id)
            ship = session.exec(ship_stmt).first()
            
            if not ship:
                raise ValueError(f"Ship for component {component_id} not found")
            
            # ✅ Extract values while session is still active
            ship_name = ship.ship_name
            nomenclature = config.nomenclature
        
        # Generate session ID - MUST fit in SQL Server INT (-2,147,483,648 to 2,147,483,647)
        # Use a simple incremental or random approach
        import random
        session_id = random.randint(100000, 2147483647)
        
        # CRITICAL: Match SP parameter order exactly
        # SP expects: @ship_name, @nomenclature, @session_id, @component_id
        params = {
            "ship_name": ship_name,
            "nomenclature": nomenclature,
            "session_id": session_id,
            "component_id": str(component_id)
        }
        
        logger.info(
            f"Executing sp_process_monthly_utilization_single | "
            f"Component: {component_id} | "
            f"Ship: {ship_name} | "
            f"Nomenclature: {nomenclature}"
        )
        
        # Execute the SP
        result = executor.execute_sp(
            "sp_process_monthly_utilization_single",
            params
        )
        
        logger.info(f"SP Result: {result}")
        logger.info(f"SP Results array: {result.get('results')}")
        
        # Extract session_id from results if returned by SP
        returned_session_id = session_id
        rows_affected = 0
        
        if result.get('results') and len(result['results']) > 0:
            first_row = result['results'][0]
            logger.info(f"First result row: {first_row}")
            returned_session_id = first_row.get('session_id', session_id)
            rows_affected = first_row.get('rows_affected', 0)
        else:
            logger.warning("SP returned no result rows!")
            rows_affected = result.get('rows_affected', 0)
        
        logger.info(f"Final rows_affected: {rows_affected}")
        
        return {
            "session_id": returned_session_id,
            "rows_affected": rows_affected
        }
    
    @staticmethod
    def execute_overhaul_readings(
        executor,  # SQLExecutor instance
        execution_id: UUID,
        component_id: UUID  # ⚡ NEW PARAMETER - process ONE component
    ) -> Dict[str, Any]:
        """
        Execute overhaul readings SP for ONE component
        
        Args:
            executor: SQLExecutor instance
            execution_id: Execution tracking ID
            component_id: Component UUID to process
            
        Returns:
            Dict with session_id and rows_affected
        """
        
        # Extract data INSIDE the session context
        with get_session_context() as session:
            config_stmt = select(SystemConfiguration).where(
                SystemConfiguration.component_id == component_id
            )
            config = session.exec(config_stmt).first()
            
            if not config:
                raise ValueError(f"Component {component_id} not found")
            
            ship_stmt = select(Ship).where(Ship.ship_id == config.ship_id)
            ship = session.exec(ship_stmt).first()
            
            if not ship:
                raise ValueError(f"Ship for component {component_id} not found")
            
            # ✅ Extract values while session is still active
            ship_name = ship.ship_name
            nomenclature = config.nomenclature
        
        # Generate session ID - MUST fit in SQL Server INT
        session_id = random.randint(100000, 2147483647)
        
        # CRITICAL: Match SP parameter order exactly
        # SP expects: @ship_name, @nomenclature, @session_id, @component_id
        params = {
            "ship_name": ship_name,
            "nomenclature": nomenclature,
            "session_id": session_id,
            "component_id": str(component_id)
        }
        
        logger.info(
            f"Executing sp_oh_main | "
            f"Component: {component_id} | "
            f"Ship: {ship_name} | "
            f"Nomenclature: {nomenclature}"
        )
        
        # Execute the SP
        result = executor.execute_sp("sp_oh_main", params)
        
        logger.info(f"Overhaul SP Result: {result}")
        
        # Extract session_id from results if returned by SP
        returned_session_id = session_id
        rows_affected = 0
        
        if result.get('results') and len(result['results']) > 0:
            first_row = result['results'][0]
            logger.info(f"First result row: {first_row}")
            returned_session_id = first_row.get('session_id', session_id)
            rows_affected = first_row.get('rows_affected', 0)
        else:
            logger.warning("Overhaul SP returned no result rows!")
            rows_affected = result.get('rows_affected', 0)
        
        logger.info(f"Final rows_affected: {rows_affected}")
        
        return {
            "session_id": returned_session_id,
            "rows_affected": rows_affected
        }