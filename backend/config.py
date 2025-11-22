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
        default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Async/thread settings
    thread_pool_size: int = Field(default=10, env="THREAD_POOL_SIZE")

    model_config = SettingsConfigDict(
        env_file="/home/user/IITB/netra/.env",
        extra="ignore"
    )


settings = Settings()
