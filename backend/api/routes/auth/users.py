# backend/api/routes/auth/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from typing import List, Optional
from api.models import User, UserRead, UserRole, UserUpdate
from auth.security import get_current_active_user, require_role
from api.db.dependencies import get_user_repository
from api.middleware import limiter, RateLimits
from api.db.repos.auth.user import UserRepository
from pydantic import BaseModel


router = APIRouter(prefix="/users", tags=["Users"])


class PaginatedUserResponse(BaseModel):
    data: List[UserRead]
    total: int
    page: int
    limit: int
    totalPages: int


class UserStatsResponse(BaseModel):
    totalUsers: int
    activeUsers: int
    inactiveUsers: int
    lockedUsers: int
    superusers: int
    admins: int
    regularUsers: int


@router.get("/stats", response_model=UserStatsResponse)
@limiter.limit(RateLimits.USER_READ)
async def get_user_statistics(
    request: Request,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.SUPERUSER)),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Get user statistics for dashboard
    Admin/Superuser only
    """
    stats = await user_repo.get_user_stats()
    
    return UserStatsResponse(
        totalUsers=stats["total_users"],
        activeUsers=stats["active_users"],
        inactiveUsers=stats["inactive_users"],
        lockedUsers=stats["locked_users"],
        superusers=stats["superusers"],
        admins=stats["admins"],
        regularUsers=stats["regular_users"]
    )


@router.get("/", response_model=PaginatedUserResponse)
@limiter.limit(RateLimits.USER_READ)
async def get_users_filtered(
    request: Request,
    search: Optional[str] = Query(None, description="Search by username, email, or name"),
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.SUPERUSER)),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Get list of users with filters and pagination
    Admin/Superuser only
    """
    skip = (page - 1) * limit
    
    user_dicts, total = await user_repo.get_users_with_filters(
        search=search,
        role=role,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit
    )
    
    total_pages = (total + limit - 1) // limit
    
    return PaginatedUserResponse(
        data=user_dicts,
        total=total,
        page=page,
        limit=limit,
        totalPages=total_pages
    )


@router.get("/{user_id}", response_model=UserRead)
@limiter.limit(RateLimits.USER_READ)
async def get_user(
    request: Request,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Get user by ID
    Users can only view their own profile unless they're admin/superuser
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
@limiter.limit(RateLimits.USER_WRITE)
async def update_user(
    request: Request,
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Update user
    Users can only update their own profile unless they're admin/superuser
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
@limiter.limit(RateLimits.USER_WRITE)
async def delete_user(
    request: Request,
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.SUPERUSER)),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Delete user (Admin/Superuser only)
    """
    success = await user_repo.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully"}


@router.post("/{user_id}/unlock")
@limiter.limit(RateLimits.USER_WRITE)
async def unlock_user_account(
    request: Request,
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.SUPERUSER)),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Unlock user account and reset failed login attempts
    Admin/Superuser only
    """
    success = await user_repo.unlock_user_account(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Account unlocked successfully"}