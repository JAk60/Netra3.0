

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import * as Icons from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: string // Changed from LucideIcon to string
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  isLoading?: boolean
}

export default function StatsCard({
  title,
  value,
  icon: iconName,
  description,
  trend,
  variant = 'default',
  isLoading = false,
}: StatsCardProps) {
  // Get icon component dynamically
  const Icon = (Icons as any)[iconName] as LucideIcon
  
  const variantStyles = {
    default: 'border-gray-800 bg-[#0f1d31]/40',
    success: 'border-green-800/50 bg-green-950/20',
    warning: 'border-yellow-800/50 bg-yellow-950/20',
    danger: 'border-red-800/50 bg-red-950/20',
  }

  const iconBgStyles = {
    default: 'bg-[#25547e]/20 text-[#3B82F6]',
    success: 'bg-green-900/20 text-green-400',
    warning: 'bg-yellow-900/20 text-yellow-400',
    danger: 'bg-red-900/20 text-red-400',
  }

  if (isLoading) {
    return (
      <div className="relative rounded-xl border border-gray-800 bg-[#0f1d31]/40 backdrop-blur-sm p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-gray-800 rounded"></div>
            <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
          </div>
          <div className="h-8 w-16 bg-gray-800 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative rounded-xl border backdrop-blur-sm p-6 transition-all hover:shadow-lg hover:shadow-gray-900/20",
      variantStyles[variant]
    )}>
      {/* Decorative Glow */}
      <div className="absolute -inset-0.5 bg-linear-to-r from-[#3B82F6]/10 to-[#25547e]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">
            {title}
          </h3>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            iconBgStyles[variant]
          )}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className="text-3xl font-bold text-white">
            {value}
          </p>
        </div>

        {/* Description & Trend */}
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-gray-500">
              {description}
            </p>
          )}
          
          {trend && (
            <div className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
}