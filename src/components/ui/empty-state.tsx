// Empty State Component
// Displays when no data is available

import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
          <Icon className="h-6 w-6 text-zinc-400" />
        </div>
      )}

      <h3 className="text-base font-medium text-zinc-900 mb-1">{title}</h3>
      <p className="text-[13px] text-zinc-600 max-w-sm mb-6">{description}</p>

      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex h-9 items-center rounded-lg bg-zinc-900 px-4 text-[13px] font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex h-9 items-center rounded-lg bg-zinc-900 px-4 text-[13px] font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              {action.label}
            </button>
          )}
        </>
      )}

      {children}
    </div>
  )
}
