import sys
sys.path.append('..')
from typing import List, Optional
from sqlmodel import Session, select
from api.models import (
    User, RefreshToken
)
from api.models.users import User, UserCreate, UserInternal, UserUpdate, RefreshToken
from api.db.connection import get_session_context, get_async_db_service
from auth.security import auth_service
from datetime import datetime, timedelta
import logging
from utils.logging_config import get_auth_logger

logger = logging.getLogger(__name__)
auth_logger = get_auth_logger()


class UserRepository:
    def __init__(
        self,
        session: Optional[Session] = None,
        async_service=None
    ):
        self.session = session
        self.async_service = async_service or get_async_db_service()
        
    def _create_user_sync(self, session: Session, user_data: UserCreate) -> User:
        """Synchronous user creation"""
        # Check if user exists
        statement = select(User).where(
            (User.email == user_data.email) | (
                User.username == user_data.username)
        )
        existing_user = session.exec(statement).first()

        if existing_user:
            raise ValueError("User with this email or username already exists")

        # Create user
        hashed_password = auth_service.get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            role=user_data.role,
            hashed_password=hashed_password
        )

        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    async def create_user(self, user_data: UserCreate) -> User:
        """Async user creation"""
        def _create():
            with get_session_context() as session:
                return self._create_user_sync(session, user_data)

        return await self.async_service.run_in_thread(_create)

    def _get_users_sync(self, session: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Synchronous user listing"""
        statement = select(User).offset(skip).limit(limit)
        return session.exec(statement).all()

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Async user listing"""
        def _get():
            with get_session_context() as session:
                return self._get_users_sync(session, skip, limit)

        return await self.async_service.run_in_thread(_get)

    def _get_user_by_id_sync(self, session: Session, user_id: int) -> Optional[User]:
        """Synchronous user retrieval by ID"""
        return session.get(User, user_id)

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Async user retrieval by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_user_by_id_sync(session, user_id)

        return await self.async_service.run_in_thread(_get)

    def _update_user_sync(self, session: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Synchronous user update"""
        user = session.get(User, user_id)
        if not user:
            return None

        update_data = user_update.dict(exclude_unset=True)

        if "password" in update_data:
            update_data["hashed_password"] = auth_service.get_password_hash(
                update_data.pop("password"))

        update_data["updated_at"] = datetime.utcnow()

        for key, value in update_data.items():
            setattr(user, key, value)

        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    async def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Async user update"""
        def _update():
            with get_session_context() as session:
                return self._update_user_sync(session, user_id, user_update)

        return await self.async_service.run_in_thread(_update)

    def _delete_user_sync(self, session: Session, user_id: int) -> bool:
        """Synchronous user deletion"""
        user = session.get(User, user_id)
        if not user:
            return False

        session.delete(user)
        session.commit()
        return True

    async def delete_user(self, user_id: int) -> bool:
        """Async user deletion"""
        def _delete():
            with get_session_context() as session:
                return self._delete_user_sync(session, user_id)

        return await self.async_service.run_in_thread(_delete)

    def _update_last_login_sync(self, session: Session, user_id: int) -> None:
        """Synchronous last login update"""
        user = session.get(User, user_id)
        if user:
            user.last_login = datetime.utcnow()
            session.add(user)
            session.commit()

    async def update_last_login(self, user_id: int) -> None:
        """Async last login update"""
        def _update():
            with get_session_context() as session:
                return self._update_last_login_sync(session, user_id)

        return await self.async_service.run_in_thread(_update)

    # ===== LOCKOUT METHODS =====
    
    def _get_user_by_username_sync(self, session, username: str) -> Optional[UserInternal]:
        user = session.exec(
            select(User).where(
                (User.username == username) | (User.email == username)
            )
        ).first()

        if not user:
            return None

        return UserInternal(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role,
            locked_until=user.locked_until,
            failed_login_attempts=user.failed_login_attempts,
        )


    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Async user retrieval by username or email"""
        def _get():
            with get_session_context() as session:
                return self._get_user_by_username_sync(session, username)

        return await self.async_service.run_in_thread(_get)

    def _increment_failed_login_sync(self, session: Session, username: str) -> None:
        """Synchronous increment failed login attempts"""
        user = self._get_user_by_username_sync(session, username)
        if user:
            user.failed_login_attempts += 1
            session.add(user)
            session.commit()
            auth_logger.warning(
                f"Failed login attempt #{user.failed_login_attempts} for user: {username}"
            )

    async def increment_failed_login(self, username: str) -> None:
        """Async increment failed login attempts"""
        def _increment():
            with get_session_context() as session:
                return self._increment_failed_login_sync(session, username)

        return await self.async_service.run_in_thread(_increment)

    def _reset_failed_login_sync(self, session: Session, user_id: int) -> None:
        """Synchronous reset failed login attempts"""
        user = session.get(User, user_id)
        if user:
            user.failed_login_attempts = 0
            user.locked_until = None
            session.add(user)
            session.commit()

    async def reset_failed_login(self, user_id: int) -> None:
        """Async reset failed login attempts"""
        def _reset():
            with get_session_context() as session:
                return self._reset_failed_login_sync(session, user_id)

        return await self.async_service.run_in_thread(_reset)

    def _lock_account_sync(self, session: Session, username: str, duration_minutes: int) -> None:
        """Synchronous lock account"""
        user = self._get_user_by_username_sync(session, username)
        if user:
            user.locked_until = datetime.utcnow() + timedelta(minutes=duration_minutes)
            session.add(user)
            session.commit()
            auth_logger.warning(
                f"Account locked for user: {username} until {user.locked_until}"
            )

    async def lock_account(self, username: str, duration_minutes: int) -> None:
        """Async lock account"""
        def _lock():
            with get_session_context() as session:
                return self._lock_account_sync(session, username, duration_minutes)

        return await self.async_service.run_in_thread(_lock)

    def _is_account_locked_sync(self, session: Session, username: str) -> bool:
        """Synchronous check if account is locked"""
        user = self._get_user_by_username_sync(session, username)
        if not user:
            return False
        
        if user.locked_until and user.locked_until > datetime.utcnow():
            return True
        
        # If lock expired, clear it
        if user.locked_until and user.locked_until <= datetime.utcnow():
            user.locked_until = None
            user.failed_login_attempts = 0
            session.add(user)
            session.commit()
            auth_logger.info(f"Account lock expired and cleared for user: {username}")
        
        return False

    async def is_account_locked(self, username: str) -> bool:
        """Async check if account is locked"""
        def _check():
            with get_session_context() as session:
                return self._is_account_locked_sync(session, username)

        return await self.async_service.run_in_thread(_check)


class TokenRepository:
    def _get_refresh_token_sync(self, session: Session, token: str) -> Optional[RefreshToken]:
        """Synchronous refresh token retrieval"""
        statement = select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.is_revoked == False
        )
        return session.exec(statement).first()

    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        """Async refresh token retrieval"""
        def _get():
            with get_session_context() as session:
                return self._get_refresh_token_sync(session, token)

        return await self.async_service.run_in_thread(_get)

    def _revoke_refresh_token_sync(self, session: Session, token: str, user_id: int) -> bool:
        """Synchronous refresh token revocation"""
        statement = select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False
        )
        refresh_token = session.exec(statement).first()

        if refresh_token:
            refresh_token.is_revoked = True
            session.add(refresh_token)
            session.commit()
            return True
        return False

    async def revoke_refresh_token(self, token: str, user_id: int) -> bool:
        """Async refresh token revocation"""
        def _revoke():
            with get_session_context() as session:
                return self._revoke_refresh_token_sync(session, token, user_id)

        return await self.async_service.run_in_thread(_revoke)