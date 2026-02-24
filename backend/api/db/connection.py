import sys
sys.path.append('..')
sys.path.append('../../')
# database.py
from config import settings
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine import Engine
from sqlalchemy import text
import asyncio
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
import threading
import logging
from typing import Generator, Optional
from urllib.parse import urlparse, parse_qs, unquote_plus
import pyodbc

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Centralized database management"""

    def __init__(self):
        self._engine: Optional[Engine] = None
        self._thread_pool: Optional[ThreadPoolExecutor] = None
        self._lock = threading.Lock()
        self._pyodbc_conn_str: Optional[str] = None

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
            echo=settings.db_echo,
            pool_pre_ping=True,
            pool_recycle=300,
            poolclass=QueuePool,
            pool_size=settings.db_pool_size,
            max_overflow=settings.db_max_overflow,
            pool_timeout=settings.db_pool_timeout,
            connect_args={
                "timeout": 30,
                "check_same_thread": False,
            }
        )

        logger.info(
            f"Database engine created with pool_size={settings.db_pool_size}")
        return engine
    
    def _build_connection_string(self) -> str:
        """Build connection string from settings"""
        return (
            f"mssql+pyodbc://{settings.db_username}:{settings.db_password}"
            f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
            f"?driver={settings.db_driver}"
            f"&TrustServerCertificate=yes"
            f"&timeout=300"
        )

    def get_pyodbc_connection_string(self) -> str:
        """
        Convert SQLAlchemy URL to raw pyodbc connection string
        This is needed for direct pyodbc connections (stored procedures)
        """
        if self._pyodbc_conn_str:
            return self._pyodbc_conn_str
        
        with self._lock:
            if self._pyodbc_conn_str:
                return self._pyodbc_conn_str
            
            database_url = settings.DATABASE_URL or self._build_connection_string()
            
            if not database_url.startswith('mssql+pyodbc://'):
                # If it's already a raw connection string, use it
                logger.info("DATABASE_URL appears to be already in pyodbc format")
                self._pyodbc_conn_str = database_url
                return database_url
            
            # Parse the SQLAlchemy URL
            # Format: mssql+pyodbc://[user:pass@]host[:port]/database?params
            parsed = urlparse(database_url)
            
            # Extract components
            host = parsed.hostname or 'localhost'
            port = parsed.port or 1433
            database = parsed.path.lstrip('/')
            
            # Parse query parameters
            params = parse_qs(parsed.query)
            
            # Build pyodbc connection string
            conn_parts = []
            
            # Driver
            driver = params.get('driver', ['ODBC Driver 17 for SQL Server'])[0]
            conn_parts.append(f"DRIVER={{{unquote_plus(driver)}}}")
            
            # Server
            conn_parts.append(f"SERVER={host},{port}")
            
            # Database
            if database:
                conn_parts.append(f"DATABASE={database}")
            
            # Authentication
            trusted_conn = params.get('Trusted_Connection', ['no'])[0]
            if trusted_conn.lower() in ('yes', 'true', '1'):
                # Windows Authentication
                conn_parts.append("Trusted_Connection=yes")
                logger.info("Using Windows Authentication")
            else:
                # SQL Server Authentication
                if parsed.username:
                    conn_parts.append(f"UID={unquote_plus(parsed.username)}")
                if parsed.password:
                    conn_parts.append(f"PWD={unquote_plus(parsed.password)}")
                logger.info(f"Using SQL Authentication with user: {parsed.username}")
            
            # Optional parameters
            if 'TrustServerCertificate' in params:
                conn_parts.append(f"TrustServerCertificate={params['TrustServerCertificate'][0]}")
            
            if 'timeout' in params:
                conn_parts.append(f"Connection Timeout={params['timeout'][0]}")
            
            # Encryption
            if 'Encrypt' in params:
                conn_parts.append(f"Encrypt={params['Encrypt'][0]}")
            else:
                # Default to no encryption for local connections
                conn_parts.append("Encrypt=no")
            
            self._pyodbc_conn_str = ";".join(conn_parts)
            
            # Log without sensitive info
            safe_log = self._pyodbc_conn_str
            if parsed.password:
                safe_log = safe_log.replace(parsed.password, '***')
            logger.info(f"Converted to pyodbc connection string: {safe_log}")
            
            return self._pyodbc_conn_str

    def get_raw_pyodbc_connection(self):
        """
        Get a raw pyodbc connection for stored procedures
        """
        conn_str = self.get_pyodbc_connection_string()
        
        try:
            connection = pyodbc.connect(conn_str, timeout=30)
            logger.debug("Raw pyodbc connection established")
            return connection
        except Exception as e:
            logger.error(f"Failed to create raw pyodbc connection: {e}")
            logger.error(f"Connection string used: {conn_str}")
            raise

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


def get_raw_connection():
    """
    Get a raw pyodbc connection
    Use this for stored procedures and direct SQL execution
    """
    return db_manager.get_raw_pyodbc_connection()


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
                except Exception:
                    session.rollback()
                    raise

        return await self.run_in_thread(_execute_transaction)


def get_async_db_service() -> AsyncDatabaseService:
    """Get async database service instance"""
    return AsyncDatabaseService(db_manager)


def check_database_health() -> bool:
    """Check if database is healthy"""
    try:
        with get_session_context() as session:
            session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False

def get_srcdb_pointer() -> str:
    """Get the raw connection string for srcdb"""
    src = pyodbc.connect(
        driver='{ODBC Driver 18 for SQL Server}',  # Updated driver name
        server='localhost',
        database='CMMSOFFLINE',
        uid='sa',  # SQL Server username
        pwd='Camlab110',  # SQL Server password
        port=1433,
        TrustServerCertificate='yes'  # Often needed for local/self-signed certs
    )
    pointer = src.cursor()
    return pointer