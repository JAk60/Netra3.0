'use client'

import { useInactivityTimer } from '@/hooks/ Useinactivitytimer'
import { useEffect } from 'react'
import { toast } from 'sonner'


interface InactivityWarningToastProps {
  timeoutMinutes: number
  warningSeconds?: number
}

export default function InactivityWarningToast({
  timeoutMinutes,
  warningSeconds = 60,
}: InactivityWarningToastProps) {
  const { isWarning, secondsLeft, stayLoggedIn } = useInactivityTimer({
    timeoutMinutes,
    warningSeconds,
  })

  useEffect(() => {
    if (isWarning) {
      toast.warning(`Session expiring in ${secondsLeft}s`, {
        id: 'inactivity-warning',
        duration: Infinity,
        dismissible: false,
        description: 'Click "Stay logged in" or keep working to reset.',
        action: {
          label: 'Stay logged in',
          onClick: stayLoggedIn,
        },
      })
    } else {
      toast.dismiss('inactivity-warning')
    }
  }, [isWarning, secondsLeft, stayLoggedIn])

  useEffect(() => {
    return () => {
      toast.dismiss('inactivity-warning')  // void return — dismiss result ignored
    }
  }, [])

  return null
}