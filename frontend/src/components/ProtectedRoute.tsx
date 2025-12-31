// frontend/src/components/ProtectedRoute.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isAdmin, hasInitialized, isLoading } = useAuthStore()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Wait for initialization to complete
    if (!hasInitialized || isLoading) {
      return
    }

    // Prevent multiple redirects
    if (hasRedirected.current) {
      return
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      hasRedirected.current = true
      router.replace('/login')
      return
    }

    // Authenticated but is admin/superuser - redirect to admin panel
    if (isAdmin) {
      hasRedirected.current = true
      router.replace('/admin')
      return
    }
  }, [hasInitialized, isLoading, isAuthenticated, isAdmin, router])

  // Show loading spinner while initializing
  if (!hasInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if redirecting
  if (!isAuthenticated || isAdmin) {
    return null
  }

  // Render children only for authenticated regular users
  return <>{children}</>
}