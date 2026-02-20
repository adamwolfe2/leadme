'use client'

/**
 * EnrichmentHistory
 * Cursive Platform — Billing > Usage
 *
 * Displays the last 50 enrichment events for the current workspace.
 * Columns: Date, Lead, Fields Enriched, Credits
 */

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

// ---- Types ----

interface EnrichmentHistoryEntry {
  id: string
  created_at: string
  lead_id: string | null
  lead_name: string | null
  lead_email: string | null
  fields_enriched: string[] | null
  credits_charged: number
  enrichment_source: string | null
}

interface EnrichmentHistoryResponse {
  entries: EnrichmentHistoryEntry[]
}

// ---- Helpers ----

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatLeadLabel(entry: EnrichmentHistoryEntry): string {
  if (entry.lead_name) return entry.lead_name
  if (entry.lead_email) return entry.lead_email
  if (entry.lead_id) return `Lead ${entry.lead_id.slice(0, 8)}`
  return '—'
}

function formatFields(fields: string[] | null): string {
  if (!fields || fields.length === 0) return '—'
  return fields.join(', ')
}

// ---- Component ----

export default function EnrichmentHistory() {
  const { data, isLoading, isError } = useQuery<EnrichmentHistoryResponse>({
    queryKey: ['enrichment-history'],
    queryFn: async () => {
      const res = await fetch('/api/billing/enrichment-history')
      if (!res.ok) throw new Error('Failed to fetch enrichment history')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-[13px] text-red-500">Failed to load enrichment history.</p>
    )
  }

  const entries = data?.entries ?? []

  if (entries.length === 0) {
    return (
      <p className="text-[13px] text-zinc-400">No enrichment events yet.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left py-2 pr-4 font-medium text-zinc-500 whitespace-nowrap">Date</th>
            <th className="text-left py-2 pr-4 font-medium text-zinc-500 whitespace-nowrap">Lead</th>
            <th className="text-left py-2 pr-4 font-medium text-zinc-500">Fields Enriched</th>
            <th className="text-right py-2 font-medium text-zinc-500 whitespace-nowrap">Credits</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <td className="py-2 pr-4 text-zinc-400 whitespace-nowrap">
                {formatDate(entry.created_at)}
              </td>
              <td className="py-2 pr-4 text-zinc-900 whitespace-nowrap">
                {formatLeadLabel(entry)}
              </td>
              <td className="py-2 pr-4 text-zinc-600">
                {formatFields(entry.fields_enriched)}
              </td>
              <td className="py-2 text-right text-zinc-900 font-medium">
                {entry.credits_charged}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[12px] text-zinc-400">Showing last 50 enrichment events.</p>
    </div>
  )
}
