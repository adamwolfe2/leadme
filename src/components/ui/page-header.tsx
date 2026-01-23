// Page Header Component
// Consistent header for all pages

import { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  backButton?: {
    href: string
    label?: string
  }
  actions?: ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  className?: string
}

export function PageHeader({
  title,
  description,
  backButton,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b border-zinc-200 bg-white', className)}>
      <div className="px-6 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-[13px]">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-zinc-400">/</span>
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-zinc-900 font-medium">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Back Button */}
        {backButton && (
          <Link
            href={backButton.href}
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-600 hover:text-zinc-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {backButton.label || 'Back'}
          </Link>
        )}

        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-zinc-900 truncate">
              {title}
            </h1>
            {description && (
              <p className="text-[13px] text-zinc-600 mt-1 max-w-2xl">
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
      </div>
    </div>
  )
}
