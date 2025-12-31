// frontend/src/lib/jwt.utils.ts

import { UserRole } from '@/config/auth.config'

export interface JWTPayload {
  sub: string  // user id
  username: string
  email: string
  role: UserRole
  exp: number  // expiration timestamp
  iat: number  // issued at timestamp
}

/**
 * Decode JWT without verification (verification happens on backend)
 * This is safe for middleware because:
 * 1. Token is httpOnly - client can't modify it
 * 2. Backend validates on every API call
 * 3. We're just reading claims for routing decisions
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    
    if (parts.length !== 3) {
      console.error('❌ JWT decode: Invalid format, not 3 parts')
      return null
    }

    // Decode the payload (base64url)
    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8')
    const parsed = JSON.parse(decoded)
    
    // DEBUG: Log the raw decoded payload
    console.log('🔓 Decoded JWT payload:', JSON.stringify(parsed, null, 2))

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (parsed.exp && parsed.exp < now) {
      console.error('❌ JWT decode: Token expired')
      return null // Token expired
    }

    return parsed as JWTPayload
  } catch (error) {
    console.error('❌ JWT decode error:', error)
    return null
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Get user role from token
 */
export function getRoleFromToken(token: string): UserRole | null {
  const payload = decodeJWT(token)
  return payload?.role || null
}