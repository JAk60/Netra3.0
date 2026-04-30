from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    # Database settings
    db_driver: str = Field(default="mssql+pyodbc", env="DB_DRIVER")
    db_username: str = Field(default="sa", env="DB_USERNAME")
    db_name: str = Field(default="NetraKoshx", env="DB_NAME")
    db_password: Optional[str] = Field(default=None, env="DB_PASSWORD")
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    db_pool_size: int = Field(default=10, env="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=20, env="DB_MAX_OVERFLOW")
    db_pool_timeout: int = Field(default=30, env="DB_POOL_TIMEOUT")
    db_echo: bool = Field(default=False, env="DB_ECHO")
    
    # JWT settings
    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=1440, env="ACCESS_TOKEN_EXPIRE_MINUTES")  # 24 hours — inactivity timer is the real session boundary
    
    # Async/thread settings
    thread_pool_size: int = Field(default=10, env="THREAD_POOL_SIZE")
    
    # ============================================
    # CELERY SETTINGS
    # ============================================
    
    # Redis connection
    redis_host: str = Field(default="localhost", env="REDIS_HOST")
    redis_port: int = Field(default=6379, env="REDIS_PORT")
    redis_db: int = Field(default=0, env="REDIS_DB")
    redis_password: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    
    # Celery broker & backend
    celery_broker_url: str = Field(
        default="redis://localhost:6379/0", 
        env="CELERY_BROKER_URL"
    )
    celery_result_backend: str = Field(
        default="redis://localhost:6379/1", 
        env="CELERY_RESULT_BACKEND"
    )
    
    # Celery worker settings
    celery_worker_concurrency: int = Field(default=3, env="CELERY_WORKER_CONCURRENCY")
    celery_task_time_limit: int = Field(default=3600, env="CELERY_TASK_TIME_LIMIT")  # 1 hour
    celery_task_soft_time_limit: int = Field(default=3300, env="CELERY_TASK_SOFT_TIME_LIMIT")  # 55 min
    
    # ============================================
    # ETL JOB SETTINGS
    # ============================================
    
    # Concurrency control (handled by Celery now)
    max_concurrent_components: int = Field(default=3, env="MAX_CONCURRENT_COMPONENTS")
    
    # Scheduler behavior (Celery Beat)
    catch_up_missed_runs: bool = Field(default=False, env="CATCH_UP_MISSED_RUNS")
    overhaul_readings_frequency_minutes: int = Field(default=30, env="OVERHAUL_READINGS_FREQUENCY_MINUTES")
    
    # Retry configuration (Celery handles this)
    default_max_retries: int = Field(default=3, env="DEFAULT_MAX_RETRIES")
    exponential_backoff_base: int = Field(default=2, env="EXPONENTIAL_BACKOFF_BASE")
    
    # Cancellation behavior
    graceful_shutdown_timeout_seconds: int = Field(default=30, env="GRACEFUL_SHUTDOWN_TIMEOUT_SECONDS")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    enable_sql_print_capture: bool = Field(default=True, env="ENABLE_SQL_PRINT_CAPTURE")
        # ===== NEW: Default Superuser Settings =====
    create_default_superuser: bool = True  # Set to False after first run
    default_superuser_username: str = "admin"
    default_superuser_email: str = "admin@netra.local"
    default_superuser_password: str = "Amogh@2025"  # CHANGE THIS!
    default_superuser_fullname: str = "System Administrator"
    # Source database
    source_db_name: str = Field(default="CMMSOFFLINE", env="SOURCE_DB_NAME")
    # Account Lockout Settings (NEW - with type annotations!)
    max_login_attempts: int = 5
    account_lockout_duration_minutes: int = 30
    token_cleanup_days: int = 30
    model_config = SettingsConfigDict(
        env_file="/home/cdtis/IITB/Netra3.0/.env",
        extra="ignore"
    )


settings = Settings()