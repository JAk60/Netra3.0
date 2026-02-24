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

/**
 * Attempts to refresh the access token using the refresh token
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
      body: JSON.stringify({ refresh_token: refreshToken }),  // ✅ snake_case
    })

    if (!response.ok) {
      console.log('❌ Refresh failed:', response.status, response.statusText)
      return { success: false }
    }

    const data = await response.json()
    
    console.log('✅ Token refresh successful')
    
    return {
      accessToken: data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token,
      success: true,
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error)
    return { success: false }
  }
}

/**
 * Sets authentication cookies on the response
 */
function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string
) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Set access token (short-lived)
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  })

  // Set refresh token if provided (long-lived)
  if (refreshToken) {
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
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
    // Special case: If logged in and trying to access /login, redirect to dashboard
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
    // If we have a refresh token, try to use it
    if (refreshToken) {
      console.log('🔄 No access token, but refresh token exists. Attempting refresh...')
      
      const refreshResult = await refreshAccessToken(refreshToken)
      
      if (refreshResult.success && refreshResult.accessToken) {
        // Successfully refreshed! Set new tokens and continue
        const response = NextResponse.next()
        setAuthCookies(
          response,
          refreshResult.accessToken,
          refreshResult.refreshToken || refreshToken
        )
        
        console.log('✅ Token refreshed, continuing to:', pathname)
        
        // Decode the new token for role checks below
        const payload = decodeJWT(refreshResult.accessToken)
        
        if (payload) {
          // Check role-based access with new token
          const allowedRoles = getAllowedRoles(pathname)
          
          if (allowedRoles && !hasRole(payload.role, allowedRoles)) {
            console.log('❌ Access denied after refresh:', { userRole: payload.role, allowedRoles })
            const redirectUrl = getUnauthorizedRedirect(pathname)
            return NextResponse.redirect(new URL(redirectUrl, request.url))
          }
          
          return response
        }
      }
      
      // Refresh failed - fall through to redirect to login
      console.log('❌ Refresh failed, redirecting to login')
    }

    // No token or refresh failed - redirect to login
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
      // Successfully refreshed!
      const response = NextResponse.next()
      setAuthCookies(
        response,
        refreshResult.accessToken,
        refreshResult.refreshToken || refreshToken
      )
      
      console.log('✅ Token refreshed successfully')
      
      // Decode the new token
      payload = decodeJWT(refreshResult.accessToken)
      
      if (!payload) {
        // This shouldn't happen, but handle it
        console.error('❌ New token is invalid!')
        const loginUrl = new URL(authConfig.loginRoute, request.url)
        loginUrl.searchParams.set('reason', 'session_expired')
        const redirectResponse = NextResponse.redirect(loginUrl)
        clearAuthCookies(redirectResponse)
        return redirectResponse
      }
      
      // Continue with role checks below
    } else {
      // Refresh failed - logout
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

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handle auth separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
}