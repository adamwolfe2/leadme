export const runtime = 'nodejs'

/**
 * Billing: Enrichment History API
 * Cursive Platform
 *
 * Returns the last 50 enrichment_log entries for the current workspace,
 * joined with leads table for lead name. Requires authenticated user session.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/utils/log-sanitizer'

// ---- Types ----

export interface EnrichmentHistoryEntry {
  id: string
  created_at: string
  lead_id: string | null
  lead_name: string | null
  lead_email: string | null
  fields_enriched: string[] | null
  credits_charged: number
  enrichment_source: string | null
}

// ---- GET /api/billing/enrichment-history ----

export async function GET() {
  try {
    // Auth: verify user via JWT (server-side verification)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get workspace_id for the current user
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (userErr || !userData?.workspace_id) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const { workspace_id } = userData

    // Use admin client to bypass RLS for joined query
    const adminClient = createAdminClient()

    const { data: rows, error: queryErr } = await adminClient
      .from('enrichment_log')
      .select(`
        id,
        created_at,
        lead_id,
        fields_enriched,
        credits_charged,
        enrichment_source,
        leads(first_name, last_name, email)
      `)
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (queryErr) {
      safeError('[EnrichmentHistory] Query error:', queryErr)
      return NextResponse.json({ error: 'Failed to fetch enrichment history' }, { status: 500 })
    }

    const entries: EnrichmentHistoryEntry[] = (rows ?? []).map((row) => {
      const lead = row.leads as { first_name?: string; last_name?: string; email?: string } | null
      const leadName = (lead?.first_name || lead?.last_name)
        ? [lead?.first_name, lead?.last_name].filter(Boolean).join(' ')
        : null

      return {
        id: row.id,
        created_at: row.created_at,
        lead_id: row.lead_id ?? null,
        lead_name: leadName,
        lead_email: lead?.email ?? null,
        fields_enriched: row.fields_enriched ?? null,
        credits_charged: row.credits_charged ?? 1,
        enrichment_source: row.enrichment_source ?? null,
      }
    })

    return NextResponse.json({ entries })
  } catch (error: unknown) {
    safeError('[EnrichmentHistory] Route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
