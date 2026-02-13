// Marketplace Credits API
// Get current workspace credit balance

export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MarketplaceRepository } from '@/lib/repositories/marketplace.repository'
import { safeError } from '@/lib/utils/log-sanitizer'

export async function GET() {
  try {
    const supabase = await createClient()

    // Auth check (session-based for read-only perf)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      safeError('[Get Credits] Session error:', sessionError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    const user = session?.user ?? null

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError) {
      safeError('[Get Credits] Failed to fetch user data:', userError)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    if (!userData?.workspace_id) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const repo = new MarketplaceRepository()
    const credits = await repo.getWorkspaceCredits(userData.workspace_id)

    return NextResponse.json({
      balance: credits?.balance || 0,
      totalPurchased: credits?.total_purchased || 0,
      totalUsed: credits?.total_used || 0,
      totalEarned: credits?.total_earned || 0,
    })
  } catch (error) {
    safeError('Failed to get credits:', error)
    return NextResponse.json({ error: 'Failed to get credits' }, { status: 500 })
  }
}
