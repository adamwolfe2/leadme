'use client'

import { useEffect } from 'react'
import { trackServicePageView } from '@/lib/analytics/service-tier-events'

interface ServicePageTrackerProps {
  page: 'hub' | 'detail' | 'success'
  tierSlug?: string
  tierName?: string
  tierPrice?: number
}

/**
 * Client component to track service page views
 * Use in server components to enable analytics tracking
 */
export function ServicePageTracker({ page, tierSlug, tierName, tierPrice }: ServicePageTrackerProps) {
  useEffect(() => {
    trackServicePageView(page, {
      tier_slug: tierSlug,
      tier_name: tierName,
      tier_price: tierPrice,
    })
  }, [page, tierSlug, tierName, tierPrice])

  return null
}
