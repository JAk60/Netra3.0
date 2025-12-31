// frontend/src/components/Drishti/auth/LoginRedirectHandler.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export default function LoginRedirectHandler() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, hasInitialized, isLoading } = useAuthStore()

  useEffect(() => {
    // Wait for initialization to complete
    if (!hasInitialized || isLoading) {
      return
    }

    // Only redirect if authenticated
    if (isAuthenticated) {
      if (isAdmin) {
        router.replace('/admin')
      } else {
        router.replace('/')
      }
    }
  }, [hasInitialized, isLoading, isAuthenticated, isAdmin, router])

  return null
}