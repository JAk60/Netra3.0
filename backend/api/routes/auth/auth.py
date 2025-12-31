from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from auth.security import auth_service, get_current_active_user
from api.models.users import User, UserCreate, UserRead
from api.db.dependencies import get_user_repository, get_token_repository
from api.middleware import limiter, RateLimits

from pydantic import BaseModel
from config import settings
import asyncio

from api.db.repos.auth.user import TokenRepository, UserRepository
from utils.logging_config import get_auth_logger

# Use dedicated auth logger
auth_logger = get_auth_logger()

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenRefresh(BaseModel):
    refresh_token: str


@auth_router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(RateLimits.AUTH_REGISTER)
async def register(
    request: Request,
    user_data: UserCreate,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Register a new user
    Rate limit: 3 requests per minute per IP
    """
    try:
        user = await user_repo.create_user(user_data)
        auth_logger.info(
            f"✓ REGISTRATION SUCCESS | Username: {user.username} | "
            f"Email: {user.email} | Role: {user.role.value} | ID: {user.id} | "
            f"IP: {request.client.host if request.client else 'unknown'}"
        )
        return user
    except ValueError as e:
        auth_logger.warning(
            f"✗ REGISTRATION FAILED | Username: {user_data.username} | "
            f"Email: {user_data.email} | Reason: {str(e)} | "
            f"IP: {request.client.host if request.client else 'unknown'}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@auth_router.post("/login", response_model=Token)
@limiter.limit(RateLimits.AUTH_LOGIN)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Login and get access/refresh tokens
    Rate limit: 5 requests per minute per IP
    Implements account lockout after failed attempts
    """
    client_ip = request.client.host if request.client else 'unknown'
    
    # Check if account is locked
    is_locked = await user_repo.is_account_locked(form_data.username)
    if is_locked:
        auth_logger.warning(
            f"🔒 LOGIN BLOCKED - ACCOUNT LOCKED | Username: {form_data.username} | "
            f"IP: {client_ip}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is temporarily locked due to too many failed login attempts. Please try again later."
        )
    
    # Authenticate user
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        # Increment failed login attempts
        await user_repo.increment_failed_login(form_data.username)
        
        # Check if we need to lock the account
        user_obj = await user_repo.get_user_by_username(form_data.username)
        if user_obj and user_obj.failed_login_attempts >= settings.max_login_attempts:
            await user_repo.lock_account(
                form_data.username, 
                settings.account_lockout_duration_minutes
            )
            auth_logger.error(
                f"🔒 ACCOUNT LOCKED | Username: {form_data.username} | "
                f"Failed Attempts: {user_obj.failed_login_attempts} | "
                f"Locked For: {settings.account_lockout_duration_minutes} minutes | "
                f"IP: {client_ip}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account locked due to too many failed login attempts. Please try again after {settings.account_lockout_duration_minutes} minutes."
            )
        
        auth_logger.warning(
            f"✗ LOGIN FAILED - INVALID CREDENTIALS | Username: {form_data.username} | "
            f"IP: {client_ip}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        auth_logger.warning(
            f"✗ LOGIN FAILED - INACTIVE USER | Username: {form_data.username} | "
            f"IP: {client_ip}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Successful login - reset failed attempts
    user_obj = await user_repo.get_user_by_username(form_data.username)
    if user_obj:
        await user_repo.reset_failed_login(user_obj.id)
    
    # Create access token with enhanced payload
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value,  # Convert enum to string
            "full_name": user.full_name
        }, 
        expires_delta=access_token_expires
    )
    
    # Create refresh token and update last login
    refresh_token, _ = await asyncio.gather(
        auth_service.create_refresh_token(user.id),
        user_repo.update_last_login(user.id)
    )
    
    auth_logger.info(
        f"✓ LOGIN SUCCESS | Username: {user.username} | Role: {user.role.value} | "
        f"ID: {user.id} | IP: {client_ip}"
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@auth_router.post("/refresh", response_model=Token)
@limiter.limit(RateLimits.AUTH_REFRESH)
async def refresh_token(
    request: Request,
    token_data: TokenRefresh,
    user_repo: UserRepository = Depends(get_user_repository),
    token_repo: TokenRepository = Depends(get_token_repository)
):
    """
    Refresh access token using refresh token
    Rate limit: 10 requests per minute per IP
    """
    client_ip = request.client.host if request.client else 'unknown'
    
    # Get refresh token
    refresh_token = await token_repo.get_refresh_token(token_data.refresh_token)
    
    if not refresh_token or refresh_token.expires_at < datetime.utcnow():
        auth_logger.warning(
            f"✗ TOKEN REFRESH FAILED - INVALID TOKEN | IP: {client_ip}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Get user
    user = await user_repo.get_user_by_id(refresh_token.user_id)
    if not user or not user.is_active:
        auth_logger.warning(
            f"✗ TOKEN REFRESH FAILED - USER NOT FOUND/INACTIVE | "
            f"UserID: {refresh_token.user_id} | IP: {client_ip}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens with enhanced payload
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    
    # Create new access token synchronously with enhanced data
    access_token = auth_service.create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value,
            "full_name": user.full_name
        },
        expires_delta=access_token_expires
    )
    
    # Create new refresh token and revoke old one concurrently
    new_refresh_token, _ = await asyncio.gather(
        auth_service.create_refresh_token(user.id),
        token_repo.revoke_refresh_token(token_data.refresh_token, user.id)
    )
    
    auth_logger.info(
        f"✓ TOKEN REFRESHED | Username: {user.username} | ID: {user.id} | "
        f"IP: {client_ip}"
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@auth_router.post("/logout")
@limiter.limit(RateLimits.AUTH_LOGOUT)
async def logout(
    request: Request,
    token_data: TokenRefresh,
    current_user: User = Depends(get_current_active_user),
    token_repo: TokenRepository = Depends(get_token_repository)
):
    """
    Logout and revoke refresh token
    Rate limit: 10 requests per minute per user
    """
    client_ip = request.client.host if request.client else 'unknown'
    
    await token_repo.revoke_refresh_token(token_data.refresh_token, current_user.id)
    auth_logger.info(
        f"✓ LOGOUT | Username: {current_user.username} | ID: {current_user.id} | "
        f"IP: {client_ip}"
    )
    return {"message": "Successfully logged out"}


@auth_router.get("/me", response_model=UserRead)
@limiter.limit(RateLimits.GENERAL)
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user information
    Rate limit: 200 requests per minute per user
    """
    return current_user