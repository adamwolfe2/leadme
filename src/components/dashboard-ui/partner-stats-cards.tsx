'use client'

import { Upload, DollarSign, TrendingUp, Award } from 'lucide-react'
import { LeadStatsCards } from './lead-stats-cards'

interface PartnerStats {
  totalLeadsUploaded: number
  totalLeadsSold: number
  totalEarnings: number
  pendingBalance: number
  availableBalance: number
  verificationPassRate: number
  duplicateRate: number
  partnerScore: number
  partnerTier: string
  leadsUploadedThisMonth: number
  leadsSoldThisMonth: number
  earningsThisMonth: number
}

interface PartnerStatsCardsProps {
  stats: PartnerStats | null
  isLoading?: boolean
}

export function PartnerStatsCards({ stats, isLoading = false }: PartnerStatsCardsProps) {
  const statsCards = stats
    ? [
        {
          title: 'Leads Uploaded',
          value: stats.totalLeadsUploaded.toLocaleString(),
          change: stats.leadsUploadedThisMonth,
          changeValue: stats.leadsUploadedThisMonth,
          icon: Upload,
          trend: stats.leadsUploadedThisMonth > 0 ? 'up' as const : 'neutral' as const,
        },
        {
          title: 'Leads Sold',
          value: stats.totalLeadsSold.toLocaleString(),
          change: stats.leadsSoldThisMonth,
          changeValue: stats.leadsSoldThisMonth,
          icon: TrendingUp,
          trend: stats.leadsSoldThisMonth > 0 ? 'up' as const : 'neutral' as const,
        },
        {
          title: 'Total Earnings',
          value: `$${stats.totalEarnings.toFixed(2)}`,
          change: stats.earningsThisMonth > 0 ? 15 : 0,
          changeValue: `$${stats.earningsThisMonth.toFixed(2)}`,
          icon: DollarSign,
          trend: stats.earningsThisMonth > 0 ? 'up' as const : 'neutral' as const,
        },
        {
          title: 'Partner Score',
          value: `${stats.partnerScore}/100`,
          icon: Award,
          trend: stats.partnerScore >= 80
            ? 'up' as const
            : stats.partnerScore < 60
            ? 'down' as const
            : 'neutral' as const,
        },
      ]
    : []

  return <LeadStatsCards stats={statsCards} isLoading={isLoading} />
}
