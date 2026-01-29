// Status Badge Component
// Displays status with appropriate colors

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

type StatusVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  icon?: LucideIcon
  size?: 'sm' | 'md'
  dot?: boolean
}

const variantStyles: Record<StatusVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700',
  success: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  pending: 'bg-zinc-100 text-zinc-500',
}

const dotStyles: Record<StatusVariant, string> = {
  default: 'bg-zinc-500',
  success: 'bg-blue-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  pending: 'bg-zinc-400',
}

export function StatusBadge({
  status,
  variant = 'default',
  icon: Icon,
  size = 'md',
  dot = false,
}: StatusBadgeProps) {
  const sizeStyles = {
    sm: 'h-5 px-2 text-[11px]',
    md: 'h-6 px-2.5 text-[12px]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            dotStyles[variant]
          )}
        />
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {status}
    </span>
  )
}

/**
 * Infer status variant from common status values
 */
export function inferStatusVariant(status: string): StatusVariant {
  const lowercaseStatus = status.toLowerCase()

  if (
    lowercaseStatus.includes('success') ||
    lowercaseStatus.includes('active') ||
    lowercaseStatus.includes('completed') ||
    lowercaseStatus.includes('approved') ||
    lowercaseStatus.includes('delivered')
  ) {
    return 'success'
  }

  if (
    lowercaseStatus.includes('pending') ||
    lowercaseStatus.includes('draft') ||
    lowercaseStatus.includes('scheduled')
  ) {
    return 'pending'
  }

  if (
    lowercaseStatus.includes('warning') ||
    lowercaseStatus.includes('attention') ||
    lowercaseStatus.includes('review')
  ) {
    return 'warning'
  }

  if (
    lowercaseStatus.includes('error') ||
    lowercaseStatus.includes('failed') ||
    lowercaseStatus.includes('rejected') ||
    lowercaseStatus.includes('cancelled')
  ) {
    return 'error'
  }

  if (
    lowercaseStatus.includes('info') ||
    lowercaseStatus.includes('processing')
  ) {
    return 'info'
  }

  return 'default'
}

/**
 * Smart status badge that infers variant
 */
export function SmartStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'variant'> & { variant?: StatusVariant }) {
  const variant = props.variant || inferStatusVariant(status)
  return <StatusBadge status={status} variant={variant} {...props} />
}
