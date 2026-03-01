import sqlalchemy as sa
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class SystemSettings(SQLModel, table=True):
    __tablename__ = "system_settings"

    # sa_column already declares primary_key — don't also pass primary_key=True to Field()
    id: int = Field(
        default=1,
        sa_column=sa.Column(sa.Integer, primary_key=True, autoincrement=False)
    )

    # Inactivity / session
    inactivity_timeout_minutes: int = Field(default=10)
    session_timeout_minutes: int = Field(default=30)

    # Account lockout
    max_login_attempts: int = Field(default=5)
    lockout_duration_minutes: int = Field(default=30)

    # Password policy
    password_min_length: int = Field(default=8)

    # Audit
    updated_at: Optional[datetime] = Field(default=None)
    updated_by: Optional[str] = Field(default=None, max_length=255)


class SystemSettingsRead(SQLModel):
    id: int
    inactivity_timeout_minutes: int
    session_timeout_minutes: int
    max_login_attempts: int
    lockout_duration_minutes: int
    password_min_length: int
    updated_at: Optional[datetime]
    updated_by: Optional[str]

    model_config = {"from_attributes": True}


class SystemSettingsUpdate(SQLModel):
    inactivity_timeout_minutes: Optional[int] = Field(default=None, ge=1, le=120)
    session_timeout_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    max_login_attempts: Optional[int] = Field(default=None, ge=1, le=20)
    lockout_duration_minutes: Optional[int] = Field(default=None, ge=1, le=1440)
    password_min_length: Optional[int] = Field(default=None, ge=6, le=128)