// Stat Card Component
// Displays a metric with optional trend and icon

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number // Percentage change
    direction: 'up' | 'down'
    label?: string
  }
  subtitle?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  subtitle,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-white border-zinc-200',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-200',
  }

  const iconStyles = {
    default: 'bg-zinc-100 text-zinc-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-6',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[13px] font-medium text-zinc-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-zinc-900">{value}</p>

          {subtitle && (
            <p className="text-[12px] text-zinc-500 mt-1">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              )}
              <span
                className={cn(
                  'text-[12px] font-medium',
                  trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-[12px] text-zinc-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              iconStyles[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}
