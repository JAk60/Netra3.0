"""
Utility to create default superuser on startup
"""
import logging
from api.models.users import UserCreate, UserRole

from config import settings
from api.db.repos.auth.user import UserRepository

logger = logging.getLogger(__name__)


async def ensure_default_superuser():
    """
    Creates default superuser if it doesn't exist
    Only runs if CREATE_DEFAULT_SUPERUSER=true in environment
    """
    if not settings.create_default_superuser:
        logger.info("Default superuser creation disabled (CREATE_DEFAULT_SUPERUSER=false)")
        return
    
    try:
        user_repo = UserRepository()
        
        # Check if superuser already exists
        existing_user = await user_repo.get_user_by_username(
            settings.default_superuser_username
        )
        
        if existing_user:
            logger.info(
                f"Default superuser already exists: {settings.default_superuser_username}"
            )
            return
        
        # Create superuser
        superuser_data = UserCreate(
            username=settings.default_superuser_username,
            email=settings.default_superuser_email,
            password=settings.default_superuser_password,
            full_name=settings.default_superuser_fullname,
            role=UserRole.SUPERUSER
        )
        
        user = await user_repo.create_user(superuser_data)
        
        logger.info("=" * 70)
        logger.info("✓ DEFAULT SUPERUSER CREATED SUCCESSFULLY")
        logger.info("=" * 70)
        logger.info(f"Username: {user.username}")
        logger.info(f"Email: {user.email}")
        logger.info(f"Role: {user.role.value}")
        logger.info(f"User ID: {user.id}")
        logger.info("=" * 70)
        logger.warning("⚠️  IMPORTANT: Change the password immediately after first login!")
        logger.warning("⚠️  IMPORTANT: Set CREATE_DEFAULT_SUPERUSER=false in .env after verification")
        logger.info("=" * 70)
        
    except ValueError as e:
        # User already exists with that email
        logger.warning(f"Default superuser creation skipped: {str(e)}")
        
    except Exception as e:
        logger.error(f"Failed to create default superuser: {str(e)}", exc_info=True)
        # Don't raise - app should still start even if superuser creation fails