'use client'

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Lock, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface StatusBadgeProps {
  isActive: boolean
  lockedUntil?: string | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function StatusBadge({ 
  isActive, 
  lockedUntil,
  size = 'md',
  showLabel = true
}: StatusBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  
  // Check if account is currently locked
  const isLocked = lockedUntil && new Date(lockedUntil) > new Date()

  useEffect(() => {
    if (!isLocked) return

    const updateTime = () => {
      const lockTime = new Date(lockedUntil)
      const now = new Date()
      
      if (lockTime <= now) {
        setTimeRemaining('')
        
        return
      }

      try {
        const remaining = formatDistanceToNow(lockTime, { addSuffix: true })
        setTimeRemaining(remaining)
      } catch (error) {
        setTimeRemaining('soon')
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [lockedUntil, isLocked])

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  // Locked state
  if (isLocked) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-red-800/50 bg-red-950/40 text-red-300 font-medium",
          sizeClasses[size]
        )}
        title={`Locked until ${new Date(lockedUntil).toLocaleString()}`}
      >
        <Lock className={iconSizes[size]} />
        {showLabel && (
          <span className="flex items-center gap-1">
            Locked
            {timeRemaining && (
              <span className="text-xs opacity-75 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {timeRemaining}
              </span>
            )}
          </span>
        )}
      </span>
    )
  }

  // Active state
  if (isActive) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-green-800/50 bg-green-950/40 text-green-300 font-medium",
          sizeClasses[size]
        )}
      >
        <CheckCircle className={iconSizes[size]} />
        {showLabel && 'Active'}
      </span>
    )
  }

  // Inactive state
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gray-700/50 bg-gray-800/40 text-gray-400 font-medium",
        sizeClasses[size]
      )}
    >
      <XCircle className={iconSizes[size]} />
      {showLabel && 'Inactive'}
    </span>
  )
}