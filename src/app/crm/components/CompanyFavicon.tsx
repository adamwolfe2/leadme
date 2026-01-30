// Company Favicon Component
// Displays tiny company logos/favicons (Twenty-style)

'use client'

import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanyFaviconProps {
  domain?: string | null
  companyName?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function CompanyFavicon({
  domain,
  companyName,
  size = 'sm',
  className,
}: CompanyFaviconProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  // If no domain or image failed, show fallback icon
  if (!domain || imageError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded bg-muted/50',
          sizeClass,
          className
        )}
      >
        <Building2 className="h-2.5 w-2.5 text-muted-foreground" />
      </div>
    )
  }

  // Use Google's favicon service (most reliable)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  return (
    <img
      src={faviconUrl}
      alt={`${companyName || domain} logo`}
      className={cn('rounded object-cover', sizeClass, className)}
      loading="lazy"
      onError={() => setImageError(true)}
    />
  )
}
