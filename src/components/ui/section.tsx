// Section Component
// Consistent content section with header and body

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SectionProps {
  title?: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  variant?: 'default' | 'bordered' | 'card'
}

export function Section({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
  variant = 'default',
}: SectionProps) {
  const hasHeader = title || description || actions

  const variants = {
    default: '',
    bordered: 'border-t border-zinc-200',
    card: 'rounded-lg border border-zinc-200 bg-white',
  }

  return (
    <section className={cn(variants[variant], className)}>
      {hasHeader && (
        <div
          className={cn(
            'flex items-start justify-between gap-4',
            variant === 'card' ? 'px-6 pt-6 pb-4' : 'py-6'
          )}
        >
          <div className="flex-1 min-w-0">
            {title && (
              <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="h-5 w-5 text-zinc-400" />}
                <h2 className="text-base font-semibold text-zinc-900">
                  {title}
                </h2>
              </div>
            )}
            {description && (
              <p className="text-[13px] text-zinc-600 max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          variant === 'card' ? 'px-6 pb-6' : '',
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}
