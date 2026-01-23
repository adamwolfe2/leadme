'use client'

// Analytics Provider
// Initializes PostHog and provides analytics context

import { useEffect, type ReactNode } from 'react'
import { initAnalytics, useTrackPageViews } from './client'

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    initAnalytics()
  }, [])

  // Track page views on route changes
  useTrackPageViews()

  return <>{children}</>
}
