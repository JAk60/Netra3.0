import sys
sys.path.append('..')
sys.path.append('../../')
# database.py
from config import settings
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine import Engine
from sqlalchemy import text  # Add this import
import asyncio
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
import threading
import logging
from typing import Generator, Optional

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Centralized database management"""

    def __init__(self):
        self._engine: Optional[Engine] = None
        self._thread_pool: Optional[ThreadPoolExecutor] = None
        self._lock = threading.Lock()

    @property
    def engine(self) -> Engine:
        """Get database engine (lazy initialization)"""
        if self._engine is None:
            with self._lock:
                if self._engine is None:
                    self._engine = self._create_engine()
        return self._engine

    @property
    def thread_pool(self) -> ThreadPoolExecutor:
        """Get thread pool (lazy initialization)"""
        if self._thread_pool is None:
            with self._lock:
                if self._thread_pool is None:
                    self._thread_pool = ThreadPoolExecutor(
                        max_workers=settings.thread_pool_size
                    )
        return self._thread_pool

    def _create_engine(self) -> Engine:
        """Create database engine with proper configuration"""
        # Build connection string from settings
        connection_string = settings.DATABASE_URL or self._build_connection_string()

        engine = create_engine(
            url=connection_string,
            echo=settings.db_echo,  # Use config instead of hardcoded True
            pool_pre_ping=True,
            pool_recycle=300,
            poolclass=QueuePool,
            pool_size=settings.db_pool_size,
            max_overflow=settings.db_max_overflow,
            pool_timeout=settings.db_pool_timeout,
            connect_args={
                "timeout": 30,
                "check_same_thread": False,  # For SQLite compatibility
            }
        )

        logger.info(
            f"Database engine created with pool_size={settings.db_pool_size}")
        return engine
    
    def _build_connection_string(self) -> str:
        """Build connection string from settings"""
        # Use environment variables or config instead of hardcoded values
        return (
            f"mssql+pyodbc://{settings.db_username}:{settings.db_password}"
            f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
            f"?driver={settings.db_driver}"
            f"&TrustServerCertificate=yes"
            f"&timeout=300"
        )

    def create_db_and_tables(self):
        """Create database tables"""
        try:
            SQLModel.metadata.create_all(self.engine)
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
            raise

    def close(self):
        """Close database connections and thread pool"""
        if self._engine:
            self._engine.dispose()
            logger.info("Database engine disposed")

        if self._thread_pool:
            self._thread_pool.shutdown(wait=True)
            logger.info("Thread pool shutdown")


# Global database manager instance
db_manager = DatabaseManager()

# Context manager for database sessions


@contextmanager
def get_session_context():
    """Context manager for database sessions"""
    session = Session(db_manager.engine)
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        session.close()

# FastAPI dependency


def get_session() -> Generator[Session, None, None]:
    """Dependency for FastAPI - yields database session"""
    session = Session(db_manager.engine)
    try:
        yield session
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error in FastAPI dependency: {e}")
        raise
    finally:
        session.close()

# Async database service


class AsyncDatabaseService:
    """Service for async database operations"""

    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager

    async def run_in_thread(self, func, *args, **kwargs):
        """Run synchronous database operation in thread pool"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.db_manager.thread_pool,
            func,
            *args,
            **kwargs
        )

    async def execute_query(self, query_func, *args, **kwargs):
        """Execute database query asynchronously"""
        def _execute():
            with get_session_context() as session:
                return query_func(session, *args, **kwargs)

        return await self.run_in_thread(_execute)

    async def execute_transaction(self, transaction_func, *args, **kwargs):
        """Execute database transaction asynchronously"""
        def _execute_transaction():
            with get_session_context() as session:
                try:
                    result = transaction_func(session, *args, **kwargs)
                    session.commit()
                    return result
                except Exception as e:
                    session.rollback()
                    raise

        return await self.run_in_thread(_execute_transaction)

# Dependency for async database service


def get_async_db_service() -> AsyncDatabaseService:
    """Get async database service instance"""
    return AsyncDatabaseService(db_manager)

# Health check function


def check_database_health() -> bool:
    """Check if database is healthy"""
    try:
        with get_session_context() as session:
            # Simple query to check connection - wrapped with text()
            session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False

# Startup and shutdown events


async def startup_database():
    """Initialize database on startup"""
    try:
        # Create tables
        db_manager.create_eta_alpha_tables()
        db_manager.create_db_and_tables()

        # Check health
        if not check_database_health():
            raise Exception("Database health check failed")

        logger.info("Database startup completed successfully")
    except Exception as e:
        logger.error(f"Database startup failed: {e}")
        raise


async def shutdown_database():
    """Cleanup database on shutdown"""
    try:
        db_manager.close()
        logger.info("Database shutdown completed")
    except Exception as e:
        logger.error(f"Database shutdown error: {e}")
