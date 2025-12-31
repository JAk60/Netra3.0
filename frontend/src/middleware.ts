// frontend/src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJWT, hasRole } from '@/lib/jwt.utils'
import { 
  authConfig, 
  isPublicRoute, 
  getAllowedRoles, 
  getUnauthorizedRedirect 
} from '@/config/auth.config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value

  // 1. PUBLIC ROUTES - Always allow
  if (isPublicRoute(pathname)) {
    // Special case: If logged in and trying to access /login, redirect to appropriate dashboard
    if (pathname === authConfig.loginRoute && accessToken) {
      const payload = decodeJWT(accessToken)
      if (payload) {
        const redirectUrl = authConfig.defaultRedirects[payload.role]
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    return NextResponse.next()
  }

  // 2. NO TOKEN - Redirect to login
  if (!accessToken) {
    const loginUrl = new URL(authConfig.loginRoute, request.url)
    // Preserve the original URL to redirect back after login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. DECODE TOKEN
  const payload = decodeJWT(accessToken)
  
  if (!payload) {
    // Invalid or expired token - redirect to login
    const loginUrl = new URL(authConfig.loginRoute, request.url)
    loginUrl.searchParams.set('reason', 'session_expired')
    // Clear invalid cookies
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }

  // DEBUG: Log the role check
  console.log('🔍 Middleware Debug:', {
    pathname,
    userRole: payload.role,
    username: payload.username
  })

  // 4. CHECK ROLE-BASED ACCESS
  const allowedRoles = getAllowedRoles(pathname)
  
  if (allowedRoles) {
    // Route has role restrictions
    console.log('🔒 Role Check:', {
      pathname,
      userRole: payload.role,
      allowedRoles,
      hasAccess: hasRole(payload.role, allowedRoles)
    })
    
    if (!hasRole(payload.role, allowedRoles)) {
      // User doesn't have required role
      console.log('❌ Access DENIED')
      const redirectUrl = getUnauthorizedRedirect(pathname)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    
    console.log('✅ Access GRANTED')
  }

  // 5. ALL CHECKS PASSED - Allow access
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
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
}