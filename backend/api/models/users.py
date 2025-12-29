from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """
    User roles - easily extensible
    To add new roles: just add them here and update ROLE_HIERARCHY in security.py
    """
    SUPERUSER = "superuser"
    ADMIN = "admin"
    USER = "user"


class UserBase(SQLModel):
    email: str = Field(index=True, sa_column_kwargs={"unique": True}, max_length=255)
    username: str = Field(index=True, sa_column_kwargs={"unique": True}, max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    role: UserRole = Field(default=UserRole.USER)
    is_active: bool = Field(default=True)


class User(UserBase, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    # Account lockout fields (NEW)
    failed_login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = Field(default=None)

    # Relationships
    tokens: List["RefreshToken"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=255)


class UserUpdate(SQLModel):
    email: Optional[str] = Field(default=None, max_length=255)
    username: Optional[str] = Field(default=None, max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=255)


class UserRead(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None


class UserLogin(SQLModel):
    username: str = Field(max_length=255)  # can be email or username
    password: str = Field(min_length=8, max_length=255)

class UserInternal(SQLModel):
    id: int
    email: str
    username: str
    role: UserRole
    locked_until: Optional[datetime]
    failed_login_attempts: int


class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(index=True, sa_column_kwargs={"unique": True}, max_length=512)
    user_id: int = Field(foreign_key="users.id")
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_revoked: bool = Field(default=False)
    
    # Relationships
    user: User = Relationship(back_populates="tokens")