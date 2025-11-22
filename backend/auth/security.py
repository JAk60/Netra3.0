from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from api.models.users import UserRead
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from backend.api.db.connection import get_session_context, get_async_db_service
from backend.api.models import RefreshToken, User
from backend.config import settings

import secrets

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class AuthService:
    def __init__(self):
        self.secret_key = settings.secret_key
        self.algorithm = settings.algorithm
        self.access_token_expire_minutes = settings.access_token_expire_minutes

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def _create_refresh_token_sync(self, user_id: int, session: Session) -> str:
        """Synchronous version for thread execution"""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=7)

        refresh_token = RefreshToken(
            token=token,
            user_id=user_id,
            expires_at=expires_at
        )
        session.add(refresh_token)
        session.commit()

        return token

    async def create_refresh_token(self, user_id: int) -> str:
        """Async version using thread pool"""
        def _create_token():
            with get_session_context() as session:
                return self._create_refresh_token_sync(user_id, session)

        return await get_async_db_service.run_in_thread(_create_token)

    def verify_token(self, token: str, credentials_exception):
        try:
            payload = jwt.decode(token, self.secret_key,
                                 algorithms=[self.algorithm])
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
            return username
        except jwt.PyJWTError:
            raise credentials_exception

    def _authenticate_user_sync(self, session: Session, username: str, password: str) -> Optional[UserRead]:
        statement = select(User).where(
            (User.username == username) | (User.email == username)
        )
        user = session.exec(statement).first()

        if not user or not self.verify_password(password, user.hashed_password):
            return None

        # Convert to UserRead immediately while session is active
        return UserRead.from_orm(user)

    async def authenticate_user(self, username: str, password: str) -> Optional[UserRead]:
        """Async authentication using thread pool - returns UserRead to avoid detached instance"""
        def _auth():
            with get_session_context() as session:
                return self._authenticate_user_sync(session, username, password)

        return await get_async_db_service.run_in_thread(_auth)

    def _get_user_by_username_sync(self, session: Session, username: str) -> Optional[UserRead]:
        """Synchronous user retrieval - returns UserRead to avoid detached instance"""
        statement = select(User).where(User.username == username)
        user = session.exec(statement).first()

        if not user:
            return None

        # Convert to UserRead immediately while session is active
        return UserRead.from_orm(user)

    async def get_user_by_username(self, username: str) -> Optional[UserRead]:
        """Async user retrieval - returns UserRead to avoid detached instance"""
        def _get_user():
            with get_session_context() as session:
                return self._get_user_by_username_sync(session, username)

        return await get_async_db_service.run_in_thread(_get_user)


auth_service = AuthService()

# Async dependency to get current user


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserRead:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    username = auth_service.verify_token(token, credentials_exception)
    user = await auth_service.get_user_by_username(username)

    if user is None:
        raise credentials_exception

    return user  # Already converted to UserRead


async def get_current_active_user(current_user: UserRead = Depends(get_current_user)) -> UserRead:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based access control


def require_role(required_role: str):
    async def role_checker(current_user: UserRead = Depends(get_current_active_user)):
        if current_user.role != required_role and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker
