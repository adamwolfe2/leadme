'use client'

import { BrandThemeProvider } from '@/lib/contexts/brand-theme-context'
import type { ReactNode } from 'react'

export function BrandThemeWrapper({ children }: { children: ReactNode }) {
  return <BrandThemeProvider>{children}</BrandThemeProvider>
}
