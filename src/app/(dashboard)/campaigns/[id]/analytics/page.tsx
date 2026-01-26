'use client'

import { use } from 'react'
import { CampaignAnalytics } from '@/components/campaigns/campaign-analytics'

interface CampaignAnalyticsPageProps {
  params: Promise<{ id: string }>
}

export default function CampaignAnalyticsPage({ params }: CampaignAnalyticsPageProps) {
  const { id: campaignId } = use(params)

  return <CampaignAnalytics campaignId={campaignId} />
}
