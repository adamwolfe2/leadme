// Alert Component
// Display informational, success, warning, or error alerts

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  onClose?: () => void
  className?: string
}

const variants: Record<
  AlertVariant,
  {
    container: string
    icon: React.ElementType
    iconColor: string
    closeButtonColor: string
  }
> = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600',
    closeButtonColor: 'text-blue-600 hover:bg-blue-100',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    closeButtonColor: 'text-emerald-600 hover:bg-emerald-100',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: AlertCircle,
    iconColor: 'text-amber-600',
    closeButtonColor: 'text-amber-600 hover:bg-amber-100',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
    closeButtonColor: 'text-red-600 hover:bg-red-100',
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const config = variants[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4',
        config.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-[13px] font-medium text-zinc-900 mb-1">
              {title}
            </h4>
          )}
          <div className="text-[13px] text-zinc-700">{children}</div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-md transition-colors',
              config.closeButtonColor
            )}
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
