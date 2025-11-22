import sys
sys.path.append('..')
from typing import List, Optional
import uuid
from sqlmodel import Session, select
from api.models import (
    AlphaBeta, EtaBeta, User, RefreshToken
)
from api.models.reliability import AlphaBetaRead, EtaBetaRead
from api.models.users import User, UserCreate, UserUpdate, RefreshToken
from api.db.connection import get_session_context, get_async_db_service
from auth.security import auth_service
from datetime import datetime
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime
import logging

# Import your naval ship models (adjust import path as needed)

logger = logging.getLogger(__name__)


class UserRepository:
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

        return await get_async_db_service.run_in_thread(_create)

    def _get_users_sync(self, session: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Synchronous user listing"""
        statement = select(User).offset(skip).limit(limit)
        return session.exec(statement).all()

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Async user listing"""
        def _get():
            with get_session_context() as session:
                return self._get_users_sync(session, skip, limit)

        return await get_async_db_service.run_in_thread(_get)

    def _get_user_by_id_sync(self, session: Session, user_id: int) -> Optional[User]:
        """Synchronous user retrieval by ID"""
        return session.get(User, user_id)

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Async user retrieval by ID"""
        def _get():
            with get_session_context() as session:
                return self._get_user_by_id_sync(session, user_id)

        return await get_async_db_service.run_in_thread(_get)

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

        return await get_async_db_service.run_in_thread(_update)

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

        return await get_async_db_service.run_in_thread(_delete)

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

        await get_async_db_service.run_in_thread(_update)


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

        return await get_async_db_service.run_in_thread(_get)

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

        return await get_async_db_service.run_in_thread(_revoke)





class EtaBetaRepository:
    """Repository for EtaBeta operations"""

    def __init__(
        self,
        session: Optional[Session] = None,
        async_service=None
    ):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, data: EtaBeta) -> EtaBeta:
        try:
            session.add(data)
            session.commit()
            session.refresh(data)
            logger.info(
                f"Created EtaBeta record for component: {data.component_id}")
            return data
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create EtaBeta: {e}")
            raise

    async def create(self, data: EtaBeta) -> EtaBeta:
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, data)
        return await self.async_service.run_in_thread(_create)

    def _get_all_sync(self, session: Session) -> List[EtaBeta]:
        return session.exec(select(EtaBeta)).all()

    async def get_all(self) -> List[EtaBeta]:
        def _fetch():
            with get_session_context() as session:
                return self._get_all_sync(session)
        return await self.async_service.run_in_thread(_fetch)

    def _get_by_component_id_sync(self, session: Session, component_id: uuid.UUID) -> List[EtaBetaRead]:
        statement = select(EtaBeta).where(EtaBeta.component_id == component_id)
        results=session.exec(statement).all()
        return [EtaBetaRead.model_validate(r) for r in results]

    async def get_by_component_id(self, component_id: uuid.UUID) -> List[EtaBeta]:
        def _fetch():
            with get_session_context() as session:
                return self._get_by_component_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_fetch)


class AlphaBetaRepository:
    """Repository for AlphaBeta operations"""

    def __init__(
        self,
        session: Optional[Session] = None,
        async_service=None
    ):
        self.session = session
        self.async_service = async_service or get_async_db_service()

    def _create_sync(self, session: Session, data: AlphaBeta) -> AlphaBeta:
        try:
            session.add(data)
            session.commit()
            session.refresh(data)
            logger.info(
                f"Created AlphaBeta record for component: {data.component_id}")
            return data
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create AlphaBeta: {e}")
            raise

    async def create(self, data: AlphaBeta) -> AlphaBeta:
        def _create():
            with get_session_context() as session:
                return self._create_sync(session, data)
        return await self.async_service.run_in_thread(_create)

    def _get_all_sync(self, session: Session) -> List[AlphaBeta]:
        return session.exec(select(AlphaBeta)).all()

    async def get_all(self) -> List[AlphaBeta]:
        def _fetch():
            with get_session_context() as session:
                return self._get_all_sync(session)
        return await self.async_service.run_in_thread(_fetch)

    def _get_by_component_id_sync(self, session: Session, component_id: uuid.UUID) -> List[AlphaBetaRead]:
        statement = select(AlphaBeta).where(
            AlphaBeta.component_id == component_id)
        results = session.exec(statement).all()
        # 👈 serialize before session closes
        return [AlphaBetaRead.model_validate(r) for r in results]

    async def get_by_component_id(self, component_id: uuid.UUID) -> List[AlphaBetaRead]:
        def _fetch():
            with get_session_context() as session:
                return self._get_by_component_id_sync(session, component_id)
        return await self.async_service.run_in_thread(_fetch)
