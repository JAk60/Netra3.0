// components/etl/glass-card.tsx
import { cn } from '@/lib/utils'
import type { GlowColor } from '@/types/etl'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: GlowColor
  hover?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  glow = 'none',
  hover = true 
}: GlassCardProps) {
  const glowStyles = {
    blue: 'shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-500/30',
    emerald: 'shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/30',
    purple: 'shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-500/30',
    none: 'shadow-2xl border-slate-800'
  }

  return (
    <div className={cn(
      // Glassmorphism base
      'bg-slate-900/50 backdrop-blur-xl',
      'border rounded-xl',
      
      // Glow effect
      glowStyles[glow],
      
      // Hover effect
      hover && 'transition-all duration-300 hover:bg-slate-900/60',
      
      className
    )}>
      {children}
    </div>
  )
}