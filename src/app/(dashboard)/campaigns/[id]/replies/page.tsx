'use client'

import { use } from 'react'
import { ReplyInbox } from '@/components/campaigns/reply-inbox'

interface CampaignRepliesPageProps {
  params: Promise<{ id: string }>
}

export default function CampaignRepliesPage({ params }: CampaignRepliesPageProps) {
  const { id: campaignId } = use(params)

  return <ReplyInbox campaignId={campaignId} />
}
