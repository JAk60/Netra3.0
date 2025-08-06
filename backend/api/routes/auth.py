from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from auth.security import auth_service, get_current_active_user
from api.models.users import User, UserCreate, UserRead, UserLogin, RefreshToken
from db.dependencies import get_user_repository, get_token_repository
from db.repositories import UserRepository, TokenRepository
from pydantic import BaseModel
import asyncio

router = APIRouter(prefix="/auth", tags=["Authentication"])

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenRefresh(BaseModel):
    refresh_token: str

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    user_repo: UserRepository = Depends(get_user_repository)
):
    try:
        user = await user_repo.create_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repo: UserRepository = Depends(get_user_repository)
):
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token (synchronous operation)
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    # Create refresh token and update last login (async operations)
    refresh_token, _ = await asyncio.gather(
        auth_service.create_refresh_token(user.id),
        user_repo.update_last_login(user.id)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    user_repo: UserRepository = Depends(get_user_repository),
    token_repo: TokenRepository = Depends(get_token_repository)
):
    # Get refresh token
    refresh_token = await token_repo.get_refresh_token(token_data.refresh_token)
    
    if not refresh_token or refresh_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Get user
    user = await user_repo.get_user_by_id(refresh_token.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens and revoke old one concurrently
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    
    access_token_task = asyncio.get_event_loop().run_in_executor(
        None,
        auth_service.create_access_token,
        {"sub": user.username},
        access_token_expires
    )
    new_refresh_token_task = auth_service.create_refresh_token(user.id)
    revoke_task = token_repo.revoke_refresh_token(token_data.refresh_token, user.id)
    
    access_token, new_refresh_token, _ = await asyncio.gather(
        access_token_task,
        new_refresh_token_task,
        revoke_task
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(
    token_data: TokenRefresh,
    current_user: User = Depends(get_current_active_user),
    token_repo: TokenRepository = Depends(get_token_repository)
):
    await token_repo.revoke_refresh_token(token_data.refresh_token, current_user.id)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user