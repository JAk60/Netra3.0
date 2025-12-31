// frontend/src/actions/auth/admin-action.ts
'use server'

import { cookies } from 'next/headers'
import { 
  ActionResponse, 
  UserListItem, 
  UserDetails, 
  UserStats,
  PaginatedResponse,
  UserFilters,
  CreateUserData,
  UpdateUserData
} from '@/types/user'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('access_token')?.value || null
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getAccessToken()
  
  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }

  return response.json()
}

/**
 * Get all users with filters - Uses GET /users with query params
 */
export async function getAllUsers(
  filters?: UserFilters,
  page: number = 1,
  limit: number = 10
): Promise<ActionResponse<PaginatedResponse<UserListItem>>> {
  try {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role)
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters?.sortBy) params.append('sort_by', filters.sortBy)
    if (filters?.sortOrder) params.append('sort_order', filters.sortOrder)
    
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    const queryString = params.toString()
    const url = `/users${queryString ? `?${queryString}` : ''}`

    const data = await authFetch(url)

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    }
  }
}

/**
 * Get user by ID - Uses GET /users/{id}
 */
export async function getUserById(id: number): Promise<ActionResponse<UserDetails>> {
  try {
    const data = await authFetch(`/users/${id}`)

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
    }
  }
}

/**
 * Create new user - Uses POST /auth/register
 */
export async function createUser(
  userData: CreateUserData
): Promise<ActionResponse<UserDetails>> {
  try {
    const token = await getAccessToken()
    
    if (!token) {
      throw new Error('Not authenticated')
    }

    // Remove confirmPassword before sending
    const { confirmPassword, ...dataToSend } = userData

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create user' }))
      throw new Error(error.detail || 'Failed to create user')
    }

    const data = await response.json()

    return {
      success: true,
      data,
      message: 'User created successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    }
  }
}

/**
 * Update user - Uses PUT /users/{id}
 */
export async function updateUser(
  id: number,
  userData: UpdateUserData
): Promise<ActionResponse<UserDetails>> {
  try {
    const data = await authFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })

    return {
      success: true,
      data,
      message: 'User updated successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    }
  }
}

/**
 * Delete user - Uses DELETE /users/{id}
 */
export async function deleteUser(id: number): Promise<ActionResponse> {
  try {
    await authFetch(`/users/${id}`, {
      method: 'DELETE',
    })

    return {
      success: true,
      message: 'User deleted successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    }
  }
}

/**
 * Unlock user account - Uses POST /users/{id}/unlock
 */
export async function unlockUserAccount(id: number): Promise<ActionResponse> {
  try {
    await authFetch(`/users/${id}/unlock`, {
      method: 'POST',
    })

    return {
      success: true,
      message: 'Account unlocked successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unlock account',
    }
  }
}

/**
 * Toggle user active status - Uses PUT /users/{id}
 */
export async function toggleUserStatus(
  id: number,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await authFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    })

    return {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user status',
    }
  }
}

/**
 * Get dashboard statistics - Uses GET /users/stats
 */
export async function getUserStats(): Promise<ActionResponse<UserStats>> {
  try {
    const data = await authFetch('/users/stats')
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    }
  }
}

/**
 * Get recent users (for dashboard)
 */
export async function getRecentUsers(limit: number = 10): Promise<ActionResponse<UserListItem[]>> {
  try {
    const response = await getAllUsers(
      { sortBy: 'created_at', sortOrder: 'desc' },
      1,
      limit
    )

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch recent users')
    }

    return {
      success: true,
      data: response.data.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent users',
    }
  }
}