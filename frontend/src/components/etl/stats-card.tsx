// components/etl/stats-card.tsx
import { LucideIcon } from 'lucide-react'
import { GlassCard } from './glass-card'
import type { GlowColor } from '@/types/etl'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  glow?: GlowColor
  trend?: string
  iconColor?: string
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  glow = 'none',
  trend,
  iconColor = 'text-slate-400'
}: StatsCardProps) {
  return (
    <GlassCard glow={glow}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            {trend && (
              <p className="text-xs text-emerald-400 font-medium mt-2">{trend}</p>
            )}
          </div>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
      </div>
    </GlassCard>
  )
}