// Credit Transaction History API
// GET /api/marketplace/credits/history
// Returns combined credit transaction history (purchases + usage) for the workspace

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/utils/log-sanitizer'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check (server-verified)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      safeError('[Credit History] Auth error:', authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace
    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!userData?.workspace_id) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const workspaceId = userData.workspace_id

    // Parse query params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
    const days = parseInt(searchParams.get('days') || '0', 10) // 0 = all time
    const dateFilter = days > 0
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      : null

    const adminClient = createAdminClient()

    // Fetch credit purchases (credits in) — completed only
    const purchasesQuery = adminClient
      .from('credit_purchases')
      .select('id, credits, package_name, amount_paid, status, created_at, completed_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    // Apply date filter if requested
    const purchasesQueryFiltered = dateFilter
      ? purchasesQuery.gte('created_at', dateFilter)
      : purchasesQuery

    const { data: purchases, error: purchasesError } = await purchasesQueryFiltered

    if (purchasesError) {
      safeError('[Credit History] Failed to fetch purchases:', purchasesError)
      return NextResponse.json({ error: 'Failed to fetch credit history' }, { status: 500 })
    }

    // Fetch enrichment log (credits out)
    const enrichmentsQuery = adminClient
      .from('enrichment_log')
      .select('id, lead_id, status, credits_used, created_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })

    const enrichmentsQueryFiltered = dateFilter
      ? enrichmentsQuery.gte('created_at', dateFilter)
      : enrichmentsQuery

    const { data: enrichments, error: enrichmentsError } = await enrichmentsQueryFiltered

    if (enrichmentsError) {
      safeError('[Credit History] Failed to fetch enrichments:', enrichmentsError)
      // Non-fatal — proceed with just purchases
    }

    // Build combined transaction list
    type Transaction = {
      id: string
      date: string
      description: string
      credits_in: number
      credits_out: number
      type: 'purchase' | 'usage'
    }

    const transactions: Transaction[] = []

    // Add purchase transactions (credits in)
    for (const purchase of purchases || []) {
      transactions.push({
        id: `purchase-${purchase.id}`,
        date: purchase.completed_at || purchase.created_at,
        description: purchase.package_name
          ? `Credit purchase — ${purchase.package_name.replace(/-/g, ' ')}`
          : 'Credit purchase',
        credits_in: purchase.credits,
        credits_out: 0,
        type: 'purchase',
      })
    }

    // Add enrichment transactions (credits out)
    for (const enrichment of enrichments || []) {
      transactions.push({
        id: `enrichment-${enrichment.id}`,
        date: enrichment.created_at,
        description: `Lead enrichment`,
        credits_in: 0,
        credits_out: enrichment.credits_used || 1,
        type: 'usage',
      })
    }

    // Sort all transactions by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Compute running balance (forward pass, then reverse to attach to each row)
    // We need total credits purchased and total used to compute the current balance,
    // then walk backwards to assign per-row balance.
    const totalIn = transactions.reduce((sum, t) => sum + t.credits_in, 0)
    const totalOut = transactions.reduce((sum, t) => sum + t.credits_out, 0)
    let runningBalance = totalIn - totalOut

    type TransactionWithBalance = Transaction & { balance: number }
    const transactionsWithBalance: TransactionWithBalance[] = transactions.map((t) => {
      const entry = { ...t, balance: runningBalance }
      // Walk backwards: after this transaction the balance before it was:
      //   balance_before = runningBalance - credits_in + credits_out
      runningBalance = runningBalance - t.credits_in + t.credits_out
      return entry
    })

    // Apply pagination after computing balances
    const total = transactionsWithBalance.length
    const paginated = transactionsWithBalance.slice(offset, offset + limit)

    return NextResponse.json({
      transactions: paginated,
      total,
      offset,
      limit,
      summary: {
        totalIn,
        totalOut,
        currentBalance: totalIn - totalOut,
      },
    })
  } catch (error) {
    safeError('[Credit History] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch credit history' }, { status: 500 })
  }
}
