// Lead Data Page

import { getCurrentUser } from '@/lib/auth/helpers'
import { redirect } from 'next/navigation'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadStats } from '@/components/leads/lead-stats'

export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Extract initial filters from query params
  const initialFilters = {
    query_id: typeof params.query_id === 'string' ? params.query_id : undefined,
    enrichment_status:
      typeof params.enrichment_status === 'string'
        ? params.enrichment_status
        : undefined,
    delivery_status:
      typeof params.delivery_status === 'string'
        ? params.delivery_status
        : undefined,
    intent_score:
      typeof params.intent_score === 'string' ? params.intent_score : undefined,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lead Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all discovered leads
        </p>
      </div>

      {/* Stats */}
      <LeadStats />

      {/* Table */}
      <LeadsTable initialFilters={initialFilters} />
    </div>
  )
}
