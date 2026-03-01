// frontend/src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJWT, hasRole, JWTPayload } from '@/lib/jwt.utils'
import { 
  authConfig, 
  isPublicRoute, 
  getAllowedRoles, 
  getUnauthorizedRedirect 
} from '@/config/auth.config'

// Must match backend settings.access_token_expire_minutes (default 30)
const ACCESS_TOKEN_COOKIE_MAX_AGE = 30 * 60 // 30 minutes in seconds
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

/**
 * Attempts to refresh the access token using the refresh token.
 * Returns new tokens on success — both access AND refresh (rolling window).
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken?: string
  refreshToken?: string
  success: boolean
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    console.log('🔄 Attempting token refresh...')
    
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      console.log('❌ Refresh failed:', response.status, response.statusText)
      return { success: false }
    }

    const data = await response.json()
    
    console.log('✅ Token refresh successful — new rolling 7-day window issued')
    
    return {
      // Backend returns snake_case
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      success: true,
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error)
    return { success: false }
  }
}

/**
 * Sets authentication cookies on the response.
 * Access token: matches backend JWT expiry (30 min).
 * Refresh token: rolling 7-day window — renewed on every refresh call.
 */
function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string
) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Access token cookie lifespan must match backend JWT expiry.
  // Previously this was 15 min here but 30 min in cookies.ts — that mismatch
  // caused the cookie to die before the JWT, triggering phantom logouts.
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE, // 30 min — aligned with JWT
    path: '/',
  })

  // Refresh token: always renew the cookie window when we issue a new token.
  // This creates a rolling session — user stays logged in as long as they're
  // active at least once every 7 days. Inactivity timeout will log them out
  // before this ever becomes an issue for normal users.
  if (refreshToken) {
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE, // Rolling 7-day window
      path: '/',
    })
  }
}

/**
 * Clears all authentication cookies
 */
function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  console.log('🔐 Middleware:', { pathname, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken })

  // ============================================
  // 1. PUBLIC ROUTES - Always allow
  // ============================================
  if (isPublicRoute(pathname)) {
    // If logged in and trying to access /login, redirect to dashboard
    if (pathname === authConfig.loginRoute && accessToken) {
      const payload = decodeJWT(accessToken)
      if (payload) {
        const redirectUrl = authConfig.defaultRedirects[payload.role]
        console.log('↪️ Logged in user accessing login page, redirecting to:', redirectUrl)
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    return NextResponse.next()
  }

  // ============================================
  // 2. NO ACCESS TOKEN - Check for refresh token
  // ============================================
  if (!accessToken) {
    if (refreshToken) {
      console.log('🔄 No access token, but refresh token exists. Attempting refresh...')
      
      const refreshResult = await refreshAccessToken(refreshToken)
      
      if (refreshResult.success && refreshResult.accessToken) {
        const response = NextResponse.next()
        // Use the new refresh token from the response (rolling window)
        setAuthCookies(
          response,
          refreshResult.accessToken,
          refreshResult.refreshToken ?? refreshToken
        )
        
        console.log('✅ Token refreshed, continuing to:', pathname)
        
        const payload = decodeJWT(refreshResult.accessToken)
        
        if (payload) {
          const allowedRoles = getAllowedRoles(pathname)
          
          if (allowedRoles && !hasRole(payload.role, allowedRoles)) {
            console.log('❌ Access denied after refresh:', { userRole: payload.role, allowedRoles })
            const redirectUrl = getUnauthorizedRedirect(pathname)
            return NextResponse.redirect(new URL(redirectUrl, request.url))
          }
          
          return response
        }
      }
      
      console.log('❌ Refresh failed, redirecting to login')
    }

    const loginUrl = new URL(authConfig.loginRoute, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    
    const response = NextResponse.redirect(loginUrl)
    clearAuthCookies(response)
    
    return response
  }

  // ============================================
  // 3. DECODE ACCESS TOKEN
  // ============================================
  let payload = decodeJWT(accessToken)
  
  // ============================================
  // 4. TOKEN EXPIRED - Try to refresh
  // ============================================
  if (!payload && refreshToken) {
    console.log('🔄 Access token expired, attempting refresh...')
    
    const refreshResult = await refreshAccessToken(refreshToken)
    
    if (refreshResult.success && refreshResult.accessToken) {
      const response = NextResponse.next()
      // Always use the newly issued refresh token — this is the rolling window
      setAuthCookies(
        response,
        refreshResult.accessToken,
        refreshResult.refreshToken ?? refreshToken
      )
      
      console.log('✅ Token refreshed successfully — session continues')
      
      payload = decodeJWT(refreshResult.accessToken)
      
      if (!payload) {
        console.error('❌ New token is invalid!')
        const loginUrl = new URL(authConfig.loginRoute, request.url)
        loginUrl.searchParams.set('reason', 'session_expired')
        const redirectResponse = NextResponse.redirect(loginUrl)
        clearAuthCookies(redirectResponse)
        return redirectResponse
      }
      
      // Fall through to role checks with the new payload
    } else {
      console.log('❌ Token refresh failed, logging out')
      const loginUrl = new URL(authConfig.loginRoute, request.url)
      loginUrl.searchParams.set('reason', 'session_expired')
      const response = NextResponse.redirect(loginUrl)
      clearAuthCookies(response)
      return response
    }
  }

  // ============================================
  // 5. NO VALID TOKEN - Logout
  // ============================================
  if (!payload) {
    console.log('❌ No valid token, logging out')
    const loginUrl = new URL(authConfig.loginRoute, request.url)
    loginUrl.searchParams.set('reason', 'session_expired')
    const response = NextResponse.redirect(loginUrl)
    clearAuthCookies(response)
    return response
  }

  // ============================================
  // 6. CHECK ROLE-BASED ACCESS
  // ============================================
  console.log('👤 User:', {
    username: payload.sub,
    role: payload.role,
    pathname
  })

  const allowedRoles = getAllowedRoles(pathname)
  
  if (allowedRoles) {
    console.log('🔒 Role check:', {
      userRole: payload.role,
      allowedRoles,
      hasAccess: hasRole(payload.role, allowedRoles)
    })
    
    if (!hasRole(payload.role, allowedRoles)) {
      console.log('❌ Access DENIED - Insufficient permissions')
      const redirectUrl = getUnauthorizedRedirect(pathname)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    
    console.log('✅ Access GRANTED')
  }

  // ============================================
  // 7. ALL CHECKS PASSED - Allow access
  // ============================================
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
}