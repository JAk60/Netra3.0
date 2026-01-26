"""
Celery tasks for token management
Cleans up old/expired refresh tokens from database
"""

from sqlmodel import Session, select, delete
from api.models.users import RefreshToken
from api.db.connection import get_session_context
from datetime import datetime, timedelta
from config import settings
import logging

# Import Celery app from where it's actually defined
# Based on your error and code, it seems to be in the jobs module
from api.routes.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="cleanup_expired_tokens")
def cleanup_expired_tokens():
    """
    Celery task to delete expired and old refresh tokens
    Runs daily to prevent database bloat
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=settings.token_cleanup_days)
        
        with get_session_context() as session:
            # Delete tokens that are either:
            # 1. Expired (expires_at < now)
            # 2. Old and revoked (created_at < cutoff_date AND is_revoked = True)
            
            # Count before deletion
            expired_count = session.exec(
                select(RefreshToken).where(RefreshToken.expires_at < datetime.utcnow())
            ).all()
            
            old_revoked_count = session.exec(
                select(RefreshToken).where(
                    RefreshToken.created_at < cutoff_date,
                    RefreshToken.is_revoked == True
                )
            ).all()
            
            total_before = len(expired_count) + len(old_revoked_count)
            
            # Delete expired tokens
            session.exec(
                delete(RefreshToken).where(RefreshToken.expires_at < datetime.utcnow())
            )
            
            # Delete old revoked tokens
            session.exec(
                delete(RefreshToken).where(
                    RefreshToken.created_at < cutoff_date,
                    RefreshToken.is_revoked == True
                )
            )
            
            session.commit()
            
            logger.info(
                f"✓ Token cleanup completed | Deleted: {total_before} tokens | "
                f"Expired: {len(expired_count)} | Old Revoked: {len(old_revoked_count)}"
            )
            
            return {
                "status": "success",
                "deleted_count": total_before,
                "expired_count": len(expired_count),
                "old_revoked_count": len(old_revoked_count)
            }
    
    except Exception as e:
        logger.error(f"✗ Token cleanup failed: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "error": str(e)
        }


@celery_app.task(name="cleanup_old_tokens_by_user")
def cleanup_old_tokens_by_user(user_id: int, keep_last_n: int = 5):
    """
    Celery task to cleanup old tokens for a specific user
    Keeps only the last N tokens per user
    
    Args:
        user_id: User ID to cleanup tokens for
        keep_last_n: Number of most recent tokens to keep (default: 5)
    """
    try:
        with get_session_context() as session:
            # Get all tokens for user, ordered by creation date
            statement = select(RefreshToken).where(
                RefreshToken.user_id == user_id
            ).order_by(RefreshToken.created_at.desc())
            
            all_tokens = session.exec(statement).all()
            
            # Keep the most recent N tokens, delete the rest
            if len(all_tokens) > keep_last_n:
                tokens_to_delete = all_tokens[keep_last_n:]
                deleted_count = 0
                
                for token in tokens_to_delete:
                    session.delete(token)
                    deleted_count += 1
                
                session.commit()
                
                logger.info(
                    f"✓ User token cleanup completed | UserID: {user_id} | "
                    f"Deleted: {deleted_count} tokens | Kept: {keep_last_n}"
                )
                
                return {
                    "status": "success",
                    "user_id": user_id,
                    "deleted_count": deleted_count,
                    "kept_count": keep_last_n
                }
            else:
                logger.info(
                    f"No cleanup needed for UserID: {user_id} | "
                    f"Total tokens: {len(all_tokens)}"
                )
                return {
                    "status": "success",
                    "user_id": user_id,
                    "deleted_count": 0,
                    "message": "No cleanup needed"
                }
    
    except Exception as e:
        logger.error(
            f"✗ User token cleanup failed for UserID: {user_id} | Error: {str(e)}",
            exc_info=True
        )
        return {
            "status": "error",
            "user_id": user_id,
            "error": str(e)
        }