from fastapi import APIRouter, Depends, Request
from api.models.settings import SystemSettingsRead, SystemSettingsUpdate
from api.models.users import User, UserRole
from api.db.repos.settings import SettingsRepository

from auth.security import get_current_active_user, require_role
from api.middleware import limiter, RateLimits
from api.db.dependencies import get_settings_repository

settings_router = APIRouter(prefix="/settings", tags=["Settings"])


@settings_router.get("", response_model=SystemSettingsRead)
@limiter.limit(RateLimits.USER_READ)
async def get_settings(
    request: Request,
    current_user: User = Depends(get_current_active_user),  # any authenticated user
    settings_repo: SettingsRepository = Depends(get_settings_repository),
):
    """
    Get current system settings.
    Any authenticated user can read — needed for inactivity timeout on all roles.
    """
    return settings_repo.get_settings()


@settings_router.put("", response_model=SystemSettingsRead)
@limiter.limit(RateLimits.USER_WRITE)
async def update_settings(
    request: Request,
    data: SystemSettingsUpdate,
    current_user: User = Depends(require_role(UserRole.SUPERUSER)),  # superuser only
    settings_repo: SettingsRepository = Depends(get_settings_repository),
):
    """
    Update system settings.
    Superuser only — these are system-wide security policies.
    """
    return settings_repo.update_settings(data, updated_by=current_user.username)