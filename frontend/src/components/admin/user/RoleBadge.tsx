'use client'

import { Crown, Shield, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserRole } from "@/types/user"

interface RoleBadgeProps {
  role: UserRole
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function RoleBadge({ 
  role, 
  showIcon = true,
  size = 'md' 
}: RoleBadgeProps) {
  const config = {
    superuser: {
      label: 'Superuser',
      icon: Crown,
      className: 'bg-purple-950/40 text-purple-300 border-purple-800/50',
    },
    admin: {
      label: 'Admin',
      icon: Shield,
      className: 'bg-blue-950/40 text-blue-300 border-blue-800/50',
    },
    user: {
      label: 'User',
      icon: User,
      className: 'bg-gray-800/40 text-gray-300 border-gray-700/50',
    },
  }

  const roleConfig = config[role as keyof typeof config]
  const Icon = roleConfig.icon

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

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium capitalize",
        roleConfig.className,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {roleConfig.label}
    </span>
  )
}