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

// TODO: Replace with your actual API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Get access token from cookies
 */
async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  
return cookieStore.get('access_token')?.value || null
}

/**
 * Make authenticated API request
 */
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
 * Get all users with filters
 * Note: This assumes GET /users endpoint exists in your backend
 * If it doesn't, mark as TODO
 */
export async function getAllUsers(
  filters?: UserFilters,
  page: number = 1,
  limit: number = 10
): Promise<ActionResponse<PaginatedResponse<UserListItem>>> {
  try {
    // Build query params
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

    // TODO: This endpoint might not exist yet - add to FastAPI backend
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
 * Get user by ID
 * Note: This assumes GET /users/{id} endpoint exists
 */
export async function getUserById(id: number): Promise<ActionResponse<UserDetails>> {
  try {
    // TODO: This endpoint might not exist yet - add to FastAPI backend
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
 * Create new user (admin creating account)
 * Uses existing POST /auth/register endpoint
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
 * Update user
 * Note: This assumes PUT /users/{id} endpoint exists
 */
export async function updateUser(
  id: number,
  userData: UpdateUserData
): Promise<ActionResponse<UserDetails>> {
  try {
    // TODO: This endpoint doesn't exist yet - add to FastAPI backend
    // PUT /users/{id} - Update user details
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
 * Delete user
 * Note: This assumes DELETE /users/{id} endpoint exists
 */
export async function deleteUser(id: number): Promise<ActionResponse> {
  try {
    // TODO: This endpoint doesn't exist yet - add to FastAPI backend
    // DELETE /users/{id} - Delete user
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
 * Unlock user account
 * Note: This assumes POST /users/{id}/unlock endpoint exists
 */
export async function unlockUserAccount(id: number): Promise<ActionResponse> {
  try {
    // TODO: This endpoint doesn't exist yet - add to FastAPI backend
    // POST /users/{id}/unlock - Unlock account and reset failed attempts
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
 * Toggle user active status
 * Note: Uses PUT /users/{id} endpoint
 */
export async function toggleUserStatus(
  id: number,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    // TODO: This uses PUT /users/{id} - add to FastAPI backend
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
 * Get dashboard statistics
 * Note: This calculates stats from GET /users endpoint
 * Alternatively, add GET /users/stats endpoint to FastAPI for efficiency
 */
export async function getUserStats(): Promise<ActionResponse<UserStats>> {
  try {
    // TODO: Option 1 - Add dedicated endpoint GET /users/stats to FastAPI
    // TODO: Option 2 - Fetch all users and calculate (less efficient)
    
    // For now, using placeholder calculation
    const response = await getAllUsers({}, 1, 1000) // Fetch all users
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch users for stats')
    }

    const users = response.data.data
    
    const stats: UserStats = {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.is_active).length,
      inactiveUsers: users.filter((u) => !u.is_active).length,
      lockedUsers: users.filter((u) => u.locked_until && new Date(u.locked_until) > new Date()).length,
      superusers: users.filter((u) => u.role === 'superuser').length,
      admins: users.filter((u) => u.role === 'admin').length,
      regularUsers: users.filter((u) => u.role === 'user').length,
    }

    return {
      success: true,
      data: stats,
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