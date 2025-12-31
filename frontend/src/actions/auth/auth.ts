// frontend/src/actions/auth/auth.ts
'use server'

import { setAuthCookies, getAccessToken, getRefreshToken, clearAuthCookies } from './cookies'
import { AuthResult, User, FastAPIError } from '@/types/auth'
import { redirect } from 'next/navigation'

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

export async function loginAction(username: string, password: string, redirectUrl?: string): Promise<AuthResult> {
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

    await setAuthCookies(data.access_token, data.refresh_token)

    const userResult = await getCurrentUser()
    
    if (!userResult.success || !userResult.user) {
      await clearAuthCookies()
      return {
        success: false,
        error: 'Failed to fetch user information',
      }
    }

    // ✅ SERVER-SIDE REDIRECT BASED ON ROLE
    if (redirectUrl) {
      redirect(redirectUrl)
    } else if (userResult.user.role === 'superuser' || userResult.user.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/')
    }
  } catch (error) {
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
      
      // Session expired - clear cookies
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

// Logout action with optional redirect reason
export async function logoutAction(reason?: 'manual' | 'session_expired'): Promise<void> {
  try {
    const refreshToken = await getRefreshToken()
    const accessToken = await getAccessToken()

    if (refreshToken && accessToken) {
      // Call backend logout endpoint
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
    // Always clear cookies
    await clearAuthCookies()
    
    // Redirect with reason
    if (reason === 'session_expired') {
      redirect('/login?reason=session_expired')
    } else {
      redirect('/login')
    }
  }
}

// Check if user is authenticated (for server components)
export async function checkAuth(): Promise<boolean> {
  const result = await getCurrentUser()
  return result.success
}