"use client"

import { ViewProvider } from '@/lib/view-context'
import { Suspense } from 'react'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ViewProvider>{children}</ViewProvider>
    </Suspense>
  )
}
