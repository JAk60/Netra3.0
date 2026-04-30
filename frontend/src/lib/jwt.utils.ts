// frontend/src/lib/jwt.utils.ts

import type { UserRole } from '@/config/auth.config'

export interface JWTPayload {
  sub: string;           // username
  user_id: number;       // user ID
  email: string;         // user email
  role: UserRole;         // user role (user, admin, superuser)
  full_name?: string;    // optional full name
  exp: number;           // expiration timestamp
  iat: number;           // issued at timestamp
  type: string;          // token type (access)
}

/**
 * Decode a JWT token without verification
 * This is safe for reading payload data since the backend verifies the signature
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 URL decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload) as JWTPayload;
    
    // Validate required fields
    if (!decoded.sub || !decoded.user_id || !decoded.email || !decoded.role || !decoded.exp) {
      console.error('JWT missing required fields:', decoded);
      return null;
    }

    // Log decoded payload for debugging
    console.log('Decoded JWT payload:', {
      username: decoded.sub,
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      full_name: decoded.full_name,
      exp: new Date(decoded.exp * 1000).toISOString()
    });

    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if the JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Check if user has any of the required roles
 * Superuser has access to everything
 */
export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  // Superuser always has access
  if (userRole === 'superuser') return true;
  
  // Check if user's role is in the allowed roles
  return allowedRoles.includes(userRole);
}

/**
 * Get user info from JWT token
 */
export function getUserFromToken(token: string): {
  userId: number;
  username: string;
  email: string;
  role: string;
  fullName?: string;
} | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    userId: payload.user_id,
    username: payload.sub,
    email: payload.email,
    role: payload.role,
    fullName: payload.full_name
  };
}