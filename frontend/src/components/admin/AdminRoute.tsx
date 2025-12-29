// frontend/src/components/admin/AdminRoute.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'
import { checkAuth } from '@/actions/auth/auth'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      // Check authentication status
      if (!isAuthenticated) {
        await checkAuth()
      }
      setIsChecking(false)
    }

    verifyAuth()
  }, [isAuthenticated])

  useEffect(() => {
    // After checking, redirect if needed
    if (!isChecking && !isLoading) {
      if (!isAuthenticated) {
        // Not logged in - redirect to login
        router.push('/login?redirect=/admin')
      } else if (user && user.role !== 'superuser' && user.role !== 'admin') {
        // Logged in but not admin/superuser - redirect to unauthorized
        router.push('/unauthorized')
      }
    }
  }, [isChecking, isLoading, isAuthenticated, user, router])

  // Show loading spinner while checking
  if (isChecking || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a1525]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#3B82F6]" />
          <p className="text-lg text-gray-400">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not authorized
  if (!isAuthenticated || !user || (user.role !== 'superuser' && user.role !== 'admin')) {
    return null
  }

  // Render children if authorized
  return <>{children}</>
}