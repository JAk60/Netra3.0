'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface SystemSettings {
  id: number
  inactivity_timeout_minutes: number
  session_timeout_minutes: number
  max_login_attempts: number
  lockout_duration_minutes: number
  password_min_length: number
  updated_at: string | null
  updated_by: string | null
}

export interface UpdateSettingsData {
  inactivity_timeout_minutes?: number
  session_timeout_minutes?: number
  max_login_attempts?: number
  lockout_duration_minutes?: number
  password_min_length?: number
}

export interface SettingsActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('access_token')?.value || null
}

/**
 * Fetch current system settings from the backend.
 * Used both in the settings page and the admin layout (for inactivity timeout).
 */
export async function getSettings(): Promise<SettingsActionResponse<SystemSettings>> {
  try {
    const token = await getAccessToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch(`${API_URL}/settings`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Don't cache — settings should always be fresh
      cache: 'no-store',
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch settings' }))
      return { success: false, error: err.detail || 'Failed to fetch settings' }
    }

    const data: SystemSettings = await response.json()
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch settings',
    }
  }
}

/**
 * Update system settings.
 * Only superusers can call this — backend enforces it too.
 */
export async function updateSettings(
  data: UpdateSettingsData
): Promise<SettingsActionResponse<SystemSettings>> {
  try {
    const token = await getAccessToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to update settings' }))
      return { success: false, error: err.detail || 'Failed to update settings' }
    }

    const updated: SystemSettings = await response.json()
    return { success: true, data: updated }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings',
    }
  }
}