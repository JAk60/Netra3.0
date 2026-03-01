from datetime import datetime
from typing import Optional
from sqlmodel import Session

from api.models.settings import SystemSettings, SystemSettingsUpdate
from config import settings as app_settings


class SettingsRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_settings(self) -> SystemSettings:
        """
        Always returns the singleton settings row (id=1).
        If missing for any reason, re-seeds it.
        """
        row = self.session.get(SystemSettings, 1)
        if not row:
            row = self._create_defaults()
        return row

    def update_settings(
        self,
        data: SystemSettingsUpdate,
        updated_by: Optional[str] = None
    ) -> SystemSettings:
        """
        Partial update — only fields explicitly provided are changed.
        """
        row = self.get_settings()

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(row, field, value)

        row.updated_at = datetime.utcnow()
        row.updated_by = updated_by

        self.session.add(row)
        self.session.commit()
        self.session.refresh(row)
        return row

    def seed_defaults(self) -> None:
        """
        Called on app startup. Creates the singleton row from config.py
        defaults if it doesn't exist yet. Safe to call multiple times.
        """
        existing = self.session.get(SystemSettings, 1)
        if existing:
            return  # Already seeded — do nothing

        self._create_defaults()

    def _create_defaults(self) -> SystemSettings:
        """Creates the singleton row using config.py as source of truth for defaults."""
        row = SystemSettings(
            id=1,
            inactivity_timeout_minutes=10,  # new field — hardcoded sensible default
            session_timeout_minutes=app_settings.access_token_expire_minutes,
            max_login_attempts=app_settings.max_login_attempts,
            lockout_duration_minutes=app_settings.account_lockout_duration_minutes,
            password_min_length=8,
        )
        self.session.add(row)
        self.session.commit()
        self.session.refresh(row)
        return row