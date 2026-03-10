'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { inactivityLogoutAction, logoutAction } from '@/actions/auth/auth'

interface UseInactivityTimerOptions {
  timeoutMinutes: number
  warningSeconds?: number
}

interface UseInactivityTimerReturn {
  isWarning: boolean
  secondsLeft: number
  stayLoggedIn: () => void
}

export function useInactivityTimer({
  timeoutMinutes,
  warningSeconds = 60,
}: UseInactivityTimerOptions): UseInactivityTimerReturn {
  const [isWarning, setIsWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(warningSeconds)

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Store latest values in refs so callbacks never go stale
  const timeoutMinutesRef = useRef(timeoutMinutes)
  const warningSecondsRef = useRef(warningSeconds)
  useEffect(() => {
    timeoutMinutesRef.current = timeoutMinutes
    warningSecondsRef.current = warningSeconds
  }, [timeoutMinutes, warningSeconds])

  // Stable ref to the reset function — never changes, safe to use in event listeners
  const resetTimersRef = useRef<() => void>(null as any)

  const clearAllTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    logoutTimerRef.current = null
    warningTimerRef.current = null
    countdownIntervalRef.current = null
  }, [])

  useEffect(() => {
    // Define reset inside effect so it always reads fresh ref values
    // but the function identity passed to event listeners never changes
    resetTimersRef.current = () => {
      const tMs = timeoutMinutesRef.current * 60 * 1000
      const wMs = warningSecondsRef.current * 1000
      const wSec = warningSecondsRef.current

      // Clear everything
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      logoutTimerRef.current = null
      warningTimerRef.current = null
      countdownIntervalRef.current = null

      setIsWarning(false)
      setSecondsLeft(wSec)

      const warningDelay = tMs - wMs

      // Warning timer
      warningTimerRef.current = setTimeout(() => {
        setSecondsLeft(wSec)
        setIsWarning(true)

        countdownIntervalRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
              countdownIntervalRef.current = null
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }, warningDelay > 0 ? warningDelay : 0)

      // Logout timer
     logoutTimerRef.current = setTimeout(async () => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
        await inactivityLogoutAction()
}, tMs)
    }
  }) // runs every render to keep ref fresh — but event listener stays stable

  useEffect(() => {
    // Stable handler — always calls the latest version via ref
    const handleActivity = () => resetTimersRef.current()

    window.addEventListener('click', handleActivity)
    window.addEventListener('keypress', handleActivity)

    // Kick off on mount
    resetTimersRef.current()

    return () => {
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keypress', handleActivity)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, []) // empty deps — runs once, never re-registers listeners

  const stayLoggedIn = useCallback(() => {
    resetTimersRef.current()
  }, [])

  return { isWarning, secondsLeft, stayLoggedIn }
}