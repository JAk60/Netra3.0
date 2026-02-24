"""
SQL Executor using SQLAlchemy engine (no separate pyodbc connections)
"""

import random
from sqlmodel import select
import logging
from typing import Dict, Any, List
from uuid import UUID

from api.db.connection import get_session_context, db_manager
from api.models.systemconfiguration import Ship, SystemConfiguration

logger = logging.getLogger(__name__)


class SQLExecutor:
    """
    Execute raw SQL and stored procedures using SQLAlchemy engine
    Uses the existing connection pool - NO separate pyodbc connections
    """

    def __init__(self):
        """No connection needed - we'll use the engine's connection pool"""
        pass

    def execute_sp(self, sp_name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute stored procedure safely using SQLAlchemy connection
        """
        params = params or {}
        
        # Use the engine's raw connection from the pool
        connection = db_manager.engine.raw_connection()
        cursor = None

        try:
            cursor = connection.cursor()

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
            
            # Commit the transaction
            connection.commit()

            return {
                "success": True,
                "results": results,
                "rows_affected": rows_affected
            }

        except Exception as e:
            logger.error(f"Database error executing {sp_name}: {e}")
            logger.error(f"Query: {query if 'query' in locals() else 'N/A'}")
            logger.error(f"Params: {params}")

            # Rollback on error
            try:
                connection.rollback()
            except Exception:
                pass

            raise

        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
            
            # Return connection to pool
            if connection:
                try:
                    connection.close()  # Returns to pool
                except Exception:
                    pass

    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a raw SQL query safely"""
        connection = db_manager.engine.raw_connection()
        cursor = None

        try:
            cursor = connection.cursor()
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
                connection.rollback()
            except Exception:
                pass
            raise

        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception:
                    pass
            
            if connection:
                try:
                    connection.close()  # Returns to pool
                except Exception:
                    pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Nothing to clean up - connections are returned to pool in finally blocks
        pass


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
        executor: SQLExecutor,
        execution_id: UUID,
        component_id: UUID
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