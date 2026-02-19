'use client'

import { memo } from 'react'
import { cn } from '@/lib/design-system'

export const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  progress,
  accent = false,
  href,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  progress?: number
  accent?: boolean
  href?: string
}) {
  const content = (
    <div className={cn(
      'bg-white rounded-xl border p-5 transition-all',
      accent ? 'border-primary/30 bg-primary/5 hover:border-primary/50' : 'border-gray-200 hover:border-gray-300',
      href && 'cursor-pointer'
    )}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('p-1.5 rounded-lg', accent ? 'bg-primary/15' : 'bg-gray-100')}>
          <Icon className={cn('h-4 w-4', accent ? 'text-primary' : 'text-gray-600')} />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className={cn('text-2xl font-bold', accent ? 'text-primary' : 'text-gray-900')}>{value}</div>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
      {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
    </div>
  )
  return href ? <a href={href}>{content}</a> : content
})
