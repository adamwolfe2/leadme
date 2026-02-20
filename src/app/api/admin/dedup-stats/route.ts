export const runtime = 'nodejs'

/**
 * Admin Dedup Stats API
 * Cursive Platform
 *
 * Returns last 30 days of dedup_log data aggregated by workspace, reason, source,
 * and daily trend. Admin-only endpoint.
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/utils/log-sanitizer'

// ---- Types ----

interface WorkspaceRejectionRow {
  workspace_id: string
  workspace_name: string | null
  total: number
}

interface ReasonRow {
  rejection_reason: string
  total: number
}

interface SourceRow {
  source: string | null
  total: number
}

interface DailyRow {
  day: string
  total: number
}

// ---- GET /api/admin/dedup-stats ----

export async function GET() {
  try {
    await requireAdmin()

    const adminClient = createAdminClient()
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // 1. Top 10 workspaces by rejection count (join with workspaces for name)
    const { data: byWorkspaceRaw, error: workspaceErr } = await adminClient
      .from('dedup_log')
      .select('workspace_id, workspaces(name)')
      .gte('created_at', since)

    if (workspaceErr) {
      safeError('[AdminDedupStats] workspace query error:', workspaceErr)
      throw workspaceErr
    }

    // Aggregate in-memory (Supabase doesn't support GROUP BY in the JS client)
    const workspaceCounts = new Map<string, { name: string | null; total: number }>()
    for (const row of byWorkspaceRaw ?? []) {
      const id = row.workspace_id
      const existing = workspaceCounts.get(id)
      const name = (row.workspaces as { name?: string } | null)?.name ?? null
      if (existing) {
        existing.total += 1
      } else {
        workspaceCounts.set(id, { name, total: 1 })
      }
    }
    const byWorkspace: WorkspaceRejectionRow[] = Array.from(workspaceCounts.entries())
      .map(([workspace_id, v]) => ({ workspace_id, workspace_name: v.name, total: v.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // 2. Breakdown by rejection_reason
    const { data: byReasonRaw, error: reasonErr } = await adminClient
      .from('dedup_log')
      .select('rejection_reason')
      .gte('created_at', since)

    if (reasonErr) {
      safeError('[AdminDedupStats] reason query error:', reasonErr)
      throw reasonErr
    }

    const reasonCounts = new Map<string, number>()
    for (const row of byReasonRaw ?? []) {
      reasonCounts.set(row.rejection_reason, (reasonCounts.get(row.rejection_reason) ?? 0) + 1)
    }
    const byReason: ReasonRow[] = Array.from(reasonCounts.entries())
      .map(([rejection_reason, total]) => ({ rejection_reason, total }))
      .sort((a, b) => b.total - a.total)

    // 3. Breakdown by source
    const { data: bySourceRaw, error: sourceErr } = await adminClient
      .from('dedup_log')
      .select('source')
      .gte('created_at', since)

    if (sourceErr) {
      safeError('[AdminDedupStats] source query error:', sourceErr)
      throw sourceErr
    }

    const sourceCounts = new Map<string, number>()
    for (const row of bySourceRaw ?? []) {
      const src = row.source ?? '(unknown)'
      sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1)
    }
    const bySource: SourceRow[] = Array.from(sourceCounts.entries())
      .map(([source, total]) => ({ source, total }))
      .sort((a, b) => b.total - a.total)

    // 4. Daily trend (last 30 days)
    const { data: byDayRaw, error: dayErr } = await adminClient
      .from('dedup_log')
      .select('created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    if (dayErr) {
      safeError('[AdminDedupStats] daily trend query error:', dayErr)
      throw dayErr
    }

    const dayCounts = new Map<string, number>()
    for (const row of byDayRaw ?? []) {
      const day = row.created_at.slice(0, 10) // YYYY-MM-DD
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
    }
    const dailyTrend: DailyRow[] = Array.from(dayCounts.entries())
      .map(([day, total]) => ({ day, total }))
      .sort((a, b) => a.day.localeCompare(b.day))

    const totalRejections = (byReasonRaw ?? []).length

    return NextResponse.json({
      success: true,
      data: {
        total_rejections: totalRejections,
        period_days: 30,
        by_workspace: byWorkspace,
        by_reason: byReason,
        by_source: bySource,
        daily_trend: dailyTrend,
      },
    })
  } catch (error: unknown) {
    safeError('[AdminDedupStats] Route error:', error)

    const msg = error instanceof Error ? error.message : ''
    if (msg.includes('Unauthorized') || msg.includes('forbidden')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Failed to fetch dedup stats' }, { status: 500 })
  }
}
