from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    DEVELOPER_MODE = "Developer Mode"
    SHIP_HOD = "Ship HoD"
    SHIP_CO = "Ship CO"
    FLEET_COMMAND_HQ = "Fleet/ Command HQ"
    NHQ = "NHQ"
    ADMIN_INSMA = "Admin/ INSMA"
    HANDHELD = "Handheld"


class UserBase(SQLModel):
    email: str = Field(index=True, sa_column_kwargs={"unique": True}, max_length=255)
    username: str = Field(index=True, sa_column_kwargs={"unique": True}, max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    role: UserRole = Field(default=UserRole.DEVELOPER_MODE)
    is_active: bool = Field(default=True)

class User(UserBase, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

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
