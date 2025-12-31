// frontend/src/providers/AuthProvider.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { getCurrentUser } from '@/actions/auth/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setInitialized, setLoading, setError, hasInitialized } = useAuthStore()
  const initializingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    // Prevent duplicate initialization
    if (hasInitialized || initializingRef.current) {
      return
    }

    initializingRef.current = true
    setLoading(true)

    const initializeAuth = async () => {
      try {
        const result = await getCurrentUser()
        
        // Only update state if component is still mounted
        if (!mountedRef.current) return
        
        if (result.success && result.user) {
          setUser(result.user)
        } else {
          setUser(null)
          // Don't set error for unauthenticated state
          if (result.error !== 'Not authenticated' && result.error !== 'Session expired') {
            setError(result.error || null)
          }
        }
      } catch (error) {
        if (!mountedRef.current) return
        
        console.error('Auth initialization error:', error)
        setUser(null)
        setError('Failed to initialize authentication')
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setInitialized(true)
        }
        initializingRef.current = false
      }
    }

    initializeAuth()

    return () => {
      mountedRef.current = false
    }
  }, []) // Empty deps - only run once on mount

  // Always render children - let route guards handle redirects
  return <>{children}</>
}