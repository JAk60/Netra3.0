from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from api.models import User, UserRead, UserRole, UserUpdate
from auth.security import get_current_active_user, require_role
from api.db.dependencies import get_user_repository
from api.middleware import limiter, RateLimits
from api.db.repos.auth.user import UserRepository


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserRead])
@limiter.limit(RateLimits.USER_READ)  # 100 requests per minute
async def get_users(
    request: Request,  # Required by limiter
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.SUPERUSER)),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Get list of all users (Admin/Superuser only)
    Rate limit: 100 requests per minute
    """
    users = await user_repo.get_users(skip, limit)
    return users


@router.get("/{user_id}", response_model=UserRead)
@limiter.limit(RateLimits.USER_READ)  # 100 requests per minute
async def get_user(
    request: Request,  # Required by limiter
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Get user by ID
    Users can only view their own profile unless they're admin/superuser
    Rate limit: 100 requests per minute
    """
    # Users can only view their own profile unless they're admin/superuser
    if current_user.id != user_id and current_user.role not in [UserRole.ADMIN, UserRole.SUPERUSER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await user_repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/{user_id}", response_model=UserRead)
@limiter.limit(RateLimits.USER_WRITE)  # 20 requests per minute
async def update_user(
    request: Request,  # Required by limiter
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Update user
    Users can only update their own profile unless they're admin/superuser
    Rate limit: 20 requests per minute
    """
    # Users can only update their own profile unless they're admin/superuser
    if current_user.id != user_id and current_user.role not in [UserRole.ADMIN, UserRole.SUPERUSER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await user_repo.update_user(user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.delete("/{user_id}")
@limiter.limit(RateLimits.USER_WRITE)  # 20 requests per minute
async def delete_user(
    request: Request,  # Required by limiter
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.SUPERUSER)),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Delete user (Admin/Superuser only)
    Rate limit: 20 requests per minute
    """
    success = await user_repo.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully"}