// frontend/src/components/admin/AdminRoute.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isRegularUser, hasInitialized, isLoading } = useAuthStore()
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
      router.replace('/login?redirect=/admin')
      return
    }

    // Authenticated but is regular user - redirect to unauthorized
    if (isRegularUser) {
      hasRedirected.current = true
      router.replace('/unauthorized')
      return
    }
  }, [hasInitialized, isLoading, isAuthenticated, isAdmin, isRegularUser, router])

  // Show loading spinner while initializing
  if (!hasInitialized || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a1525]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#3B82F6]" />
          <p className="text-lg text-gray-400">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't render if redirecting
  if (!isAuthenticated || isRegularUser) {
    return null
  }

  // Render children only for authenticated admins/superusers
  return <>{children}</>
}