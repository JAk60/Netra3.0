"""
Rate limiting middleware using slowapi
Protects endpoints from abuse and brute force attacks
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request


def get_user_identifier(request: Request) -> str:
    """
    Get identifier for rate limiting.
    Uses IP address for unauthenticated requests.
    Can be extended to use user_id for authenticated requests.
    """
    # Try to get user from request state (if authenticated)
    if hasattr(request.state, "user") and request.state.user:
        return f"user:{request.state.user.id}"
    
    # Fall back to IP address
    return get_remote_address(request)


# Initialize rate limiter
limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=["200/minute"],  # Global default limit
    storage_uri="memory://",  # Use in-memory storage (can be Redis in production)
    strategy="fixed-window",  # Rate limit strategy
)


# Custom rate limit decorators for common scenarios
class RateLimits:
    """Predefined rate limit strings for common use cases"""
    
    # Authentication endpoints (strict)
    AUTH_LOGIN = "5/minute"          # 5 login attempts per minute
    AUTH_REGISTER = "3/minute"        # 3 registration attempts per minute
    AUTH_REFRESH = "10/minute"        # 10 token refresh per minute
    AUTH_LOGOUT = "10/minute"         # 10 logout per minute
    
    # User management (moderate)
    USER_READ = "100/minute"          # 100 read operations per minute
    USER_WRITE = "20/minute"          # 20 write operations per minute
    
    # General API (lenient)
    GENERAL = "200/minute"            # 200 requests per minute
    
    # Heavy operations (very strict)
    HEAVY = "10/minute"               # 10 heavy operations per minute