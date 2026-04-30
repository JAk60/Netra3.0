// frontend/src/actions/auth/auth.ts
'use server'

import { setAuthCookies, getAccessToken, getRefreshToken, clearAuthCookies } from './cookies'
import { AuthResult, User, FastAPIError } from '@/types/auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/config/auth.config'
import { decodeJWT } from '@/lib/jwt.utils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Helper to parse FastAPI error
function parseFastAPIError(error: FastAPIError): string {
  if (typeof error.detail === 'string') {
    return error.detail
  }
  if (Array.isArray(error.detail) && error.detail.length > 0) {
    return error.detail[0].msg
  }
  return 'An error occurred'
}

export async function loginAction(
  username: string, 
  password: string, 
  redirectUrl?: string
): Promise<AuthResult> {
  try {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: parseFastAPIError(data),
      }
    }

    // Set cookies
    await setAuthCookies(data.access_token, data.refresh_token)

    // Decode token to get role
    const payload = decodeJWT(data.access_token)
    
    if (!payload) {
      await clearAuthCookies()
      return {
        success: false,
        error: 'Invalid token received',
      }
    }

    // Always compute the role-based default destination
    const defaultRedirect = authConfig.defaultRedirects[payload.role]

    // Only honour the saved redirectUrl if it makes sense for the user's role.
    // e.g. a superuser/admin whose session expired on '/' should go to '/admin',
    // not back to '/'.
    if (redirectUrl && redirectUrl !== '/' && redirectUrl.startsWith(defaultRedirect)) {
      redirect(redirectUrl)
    } else {
      redirect(defaultRedirect)
    }
  } catch (error) {
    // NEXT_REDIRECT is not an error
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    }
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        return getCurrentUser() // Retry with new token
      }
      
      await clearAuthCookies()
      return { success: false, error: 'Session expired' }
    }

    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        error: parseFastAPIError(data),
      }
    }

    const user: User = await response.json()
    return { success: true, user }
  } catch (error) {
    console.error('Get user error:', error)
    return {
      success: false,
      error: 'Failed to fetch user data',
    }
  }
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
      return false
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      await clearAuthCookies()
      return false
    }

    const data = await response.json()
    await setAuthCookies(data.access_token, data.refresh_token)
    return true
  } catch (error) {
    console.error('Refresh token error:', error)
    await clearAuthCookies()
    return false
  }
}

// Logout action
export async function logoutAction(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken()
    const accessToken = await getAccessToken()

    if (refreshToken && accessToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    await clearAuthCookies()
    redirect(authConfig.loginRoute)
  }
}

// Check if user is authenticated (for server components)
export async function checkAuth(): Promise<boolean> {
  const result = await getCurrentUser()
  return result.success
}


// frontend/src/actions/auth/auth.ts - add this new action

export async function inactivityLogoutAction(): Promise<void> {
  await clearAuthCookies()
  redirect(`${authConfig.loginRoute}?reason=inactivity`)
}