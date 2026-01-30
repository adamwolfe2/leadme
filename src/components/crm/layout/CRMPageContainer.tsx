'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CRMPageContainerProps {
  children: ReactNode
  className?: string
}

/**
 * Main container for CRM pages
 * Inspired by Twenty CRM's PageContainer pattern
 */
export function CRMPageContainer({ children, className }: CRMPageContainerProps) {
  return (
    <div
      className={cn(
        'flex h-screen flex-col overflow-hidden bg-gray-50',
        className
      )}
    >
      {children}
    </div>
  )
}
