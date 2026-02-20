/**
 * Partner Leaderboard API
 * GET /api/partner/leaderboard
 *
 * Returns top 10 partners for the current calendar month ranked by leads sold,
 * plus the current user's own entry (even if outside the top 10).
 * Other partners' names are obscured for privacy (first name + last initial).
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPartnerTier } from '@/lib/services/partner-tier.service'
import { safeError } from '@/lib/utils/log-sanitizer'

export const dynamic = 'force-dynamic'

export interface LeaderboardEntry {
  rank: number
  partner_name: string
  tier: 'Bronze' | 'Silver' | 'Gold'
  leads_sold_this_month: number
  earnings_this_month: number
  is_current_user: boolean
}

/**
 * Obscure a partner name to "First L." format for privacy.
 */
function obscureName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'Partner'

  const parts = trimmed.split(/\s+/)
  const firstName = parts[0]
  const lastName = parts.length > 1 ? parts[parts.length - 1] : null

  if (lastName) {
    return `${firstName} ${lastName.charAt(0)}.`
  }
  // Single word name: show first 3 chars + "."
  if (firstName.length > 3) {
    return `${firstName.slice(0, 3)}...`
  }
  return firstName
}

export async function GET() {
  try {
    // 1. Auth: verify the caller is a logged-in partner
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, role, partner_approved, linked_partner_id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle()

    if (!user || user.role !== 'partner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const currentPartnerId = user.linked_partner_id

    // 2. Build current-month date range
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartIso = monthStart.toISOString()

    // 3. Use admin client to query across all partners
    const adminClient = createAdminClient()

    // Aggregate lead_purchases this month grouped by partner_id
    const { data: purchaseRows, error: purchaseError } = await adminClient
      .from('lead_purchases')
      .select('partner_id, partner_commission')
      .gte('purchased_at', monthStartIso)
      .not('partner_id', 'is', null)

    if (purchaseError) {
      safeError('[Leaderboard] Failed to query lead_purchases:', purchaseError)
      return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
    }

    // Aggregate by partner_id
    const partnerMap: Record<string, { leads_sold: number; earnings: number }> = {}
    for (const row of purchaseRows ?? []) {
      if (!row.partner_id) continue
      if (!partnerMap[row.partner_id]) {
        partnerMap[row.partner_id] = { leads_sold: 0, earnings: 0 }
      }
      partnerMap[row.partner_id].leads_sold += 1
      partnerMap[row.partner_id].earnings += row.partner_commission ?? 0
    }

    // 4. Ensure current partner is included even with 0 activity
    if (currentPartnerId && !partnerMap[currentPartnerId]) {
      partnerMap[currentPartnerId] = { leads_sold: 0, earnings: 0 }
    }

    // Collect all partner IDs we need to look up
    const allPartnerIds = Object.keys(partnerMap)

    if (allPartnerIds.length === 0) {
      // No activity this month; return empty top 10 with current user at rank 1
      const noActivityEntry: LeaderboardEntry[] = []

      // Still show current user if we can look them up
      if (currentPartnerId) {
        const { data: selfPartner } = await adminClient
          .from('partners')
          .select('id, name, total_leads_uploaded')
          .eq('id', currentPartnerId)
          .maybeSingle()

        if (selfPartner) {
          const tier = getPartnerTier(selfPartner.total_leads_uploaded ?? 0)
          noActivityEntry.push({
            rank: 1,
            partner_name: selfPartner.name,
            tier: tier.name,
            leads_sold_this_month: 0,
            earnings_this_month: 0,
            is_current_user: true,
          })
        }
      }

      return NextResponse.json({ leaderboard: noActivityEntry, month: now.toISOString() })
    }

    // 5. Fetch partner profiles for name + total_leads_uploaded (for tier calculation)
    const { data: partners, error: partnersError } = await adminClient
      .from('partners')
      .select('id, name, total_leads_uploaded')
      .in('id', allPartnerIds)

    if (partnersError) {
      safeError('[Leaderboard] Failed to query partners:', partnersError)
      return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
    }

    // Build a lookup map
    const partnerProfiles: Record<string, { name: string; total_leads_uploaded: number }> = {}
    for (const p of partners ?? []) {
      partnerProfiles[p.id] = {
        name: p.name,
        total_leads_uploaded: p.total_leads_uploaded ?? 0,
      }
    }

    // 6. Compose sorted list
    const ranked = allPartnerIds
      .map((pid) => {
        const stats = partnerMap[pid]
        const profile = partnerProfiles[pid]
        const tierObj = getPartnerTier(profile?.total_leads_uploaded ?? 0)
        return {
          partner_id: pid,
          partner_name: profile?.name ?? 'Partner',
          tier: tierObj.name as 'Bronze' | 'Silver' | 'Gold',
          leads_sold_this_month: stats.leads_sold,
          earnings_this_month: Math.round(stats.earnings * 100) / 100,
          is_current_user: pid === currentPartnerId,
        }
      })
      // Sort descending by leads sold, then earnings as tiebreaker
      .sort((a, b) =>
        b.leads_sold_this_month - a.leads_sold_this_month ||
        b.earnings_this_month - a.earnings_this_month
      )

    // Assign ranks (ties get the same rank)
    let currentRank = 1
    for (let i = 0; i < ranked.length; i++) {
      if (
        i > 0 &&
        ranked[i].leads_sold_this_month === ranked[i - 1].leads_sold_this_month &&
        ranked[i].earnings_this_month === ranked[i - 1].earnings_this_month
      ) {
        // Same rank as previous
      } else {
        currentRank = i + 1
      }
      ;(ranked[i] as any).rank = currentRank
    }

    // 7. Build response: top 10 always shown; current user appended if outside top 10
    const top10 = ranked.slice(0, 10)
    const currentUserEntry = ranked.find((e) => e.is_current_user)
    const currentUserInTop10 = top10.some((e) => e.is_current_user)

    const leaderboard: LeaderboardEntry[] = top10.map((e) => ({
      rank: (e as any).rank,
      partner_name: e.is_current_user ? e.partner_name : obscureName(e.partner_name),
      tier: e.tier,
      leads_sold_this_month: e.leads_sold_this_month,
      earnings_this_month: e.earnings_this_month,
      is_current_user: e.is_current_user,
    }))

    if (!currentUserInTop10 && currentUserEntry) {
      leaderboard.push({
        rank: (currentUserEntry as any).rank,
        partner_name: currentUserEntry.partner_name,
        tier: currentUserEntry.tier,
        leads_sold_this_month: currentUserEntry.leads_sold_this_month,
        earnings_this_month: currentUserEntry.earnings_this_month,
        is_current_user: true,
      })
    }

    return NextResponse.json({ leaderboard, month: now.toISOString() })
  } catch (error) {
    safeError('[Leaderboard] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
