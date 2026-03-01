'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getSettings } from '@/actions/auth/settings'


const InactivityWarningToast = dynamic(
  () => import('./Inactivitywarningtoast'),
  { ssr: false }
)

const FALLBACK_TIMEOUT = 10

// Public routes where inactivity timer should NOT run
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/unauthorized']

export default function InactivityProvider() {
  const pathname = usePathname()
  const [timeoutMinutes, setTimeoutMinutes] = useState<number | null>(null)
  const isMountedRef = useRef(false)

  // Don't run on public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route))

  useEffect(() => {
    if (isPublicRoute) return

    isMountedRef.current = true

    getSettings()
      .then((res) => {
        if (!isMountedRef.current) return
        if (res.success && res.data) {
          setTimeoutMinutes(res.data.inactivity_timeout_minutes)
        } else {
          setTimeoutMinutes(FALLBACK_TIMEOUT)
        }
      })
      .catch(() => {
        if (isMountedRef.current) setTimeoutMinutes(FALLBACK_TIMEOUT)
      })

    return () => {
      isMountedRef.current = false
      setTimeoutMinutes(null) // reset when navigating away
    }
  }, [isPublicRoute, pathname])

  // Don't render on public routes or while loading
  if (isPublicRoute || timeoutMinutes === null) return null

  return <InactivityWarningToast timeoutMinutes={timeoutMinutes} warningSeconds={60} />
}