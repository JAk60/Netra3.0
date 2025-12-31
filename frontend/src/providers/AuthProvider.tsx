// frontend/src/providers/AuthProvider.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { getCurrentUser } from '@/actions/auth/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider - ONLY fetches user data for UI display
 * NO redirects - middleware handles all auth checks
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setInitialized, setLoading } = useAuthStore()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization
    if (hasInitialized.current) return
    hasInitialized.current = true
    
    const initAuth = async () => {
      setLoading(true)
      
      try {
        const result = await getCurrentUser()
        
        if (result.success && result.user) {
          setUser(result.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initAuth()
  }, [setUser, setInitialized, setLoading])

  return <>{children}</>
}