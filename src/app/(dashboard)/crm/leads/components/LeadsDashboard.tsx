'use client'

import { LeadStatsCards } from '@/components/dashboard-ui/lead-stats-cards'
import { LeadGrowthChart } from '@/components/dashboard-ui/lead-growth-chart'
import { LeadsByStatusChart } from '@/components/dashboard-ui/leads-by-status-chart'
import {
  useLeadStatsCards,
  useLeadStatusBreakdown,
  useLeadGrowthData,
} from '@/lib/hooks/use-lead-stats'

export function LeadsDashboard() {
  const { statsCards, isLoading: statsLoading } = useLeadStatsCards()
  const { statusData, isLoading: statusLoading } = useLeadStatusBreakdown()
  const { chartData, isLoading: chartLoading } = useLeadGrowthData()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <LeadStatsCards stats={statsCards} isLoading={statsLoading} />

      {/* Charts Row */}
      <div className="flex flex-col xl:flex-row gap-6">
        <LeadGrowthChart
          data={chartData}
          title="Lead Growth (Last 30 Days)"
          isLoading={chartLoading}
        />
        <LeadsByStatusChart
          data={statusData}
          isLoading={statusLoading}
        />
      </div>
    </div>
  )
}
