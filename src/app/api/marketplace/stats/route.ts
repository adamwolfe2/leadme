// API endpoint for marketplace statistics

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { handleApiError, unauthorized } from '@/lib/utils/api-error-handler'
import { safeError } from '@/lib/utils/log-sanitizer'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return unauthorized()
    }

    if (!user.workspace_id) {
      return NextResponse.json(
        { error: 'User workspace not found' },
        { status: 404 }
      )
    }

    const workspaceId = user.workspace_id
    const supabase = await createClient()

    // Get available leads count (leads not purchased by this workspace)
    const { count: availableCount, error: availableError } = await supabase
      .from('leads')
      .select('*', { count: 'estimated', head: true })
      .neq('workspace_id', workspaceId)
      .eq('status', 'available')

    if (availableError) {
      throw availableError
    }

    // Get credits balance
    const { data: creditsData, error: creditsError } = await supabase
      .from('workspace_credits')
      .select('balance')
      .eq('workspace_id', workspaceId)
      .maybeSingle()

    if (creditsError) {
      throw creditsError
    }

    const credits = creditsData?.balance || 0

    // Get purchase history count
    const { count: purchaseCount, error: purchaseError } = await supabase
      .from('lead_purchases')
      .select('*', { count: 'estimated', head: true })
      .eq('buyer_workspace_id', workspaceId)

    if (purchaseError) {
      throw purchaseError
    }

    // Get recent purchases for trend
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentPurchases, error: recentError } = await supabase
      .from('lead_purchases')
      .select('purchased_at, price_paid')
      .eq('buyer_workspace_id', workspaceId)
      .gte('purchased_at', thirtyDaysAgo.toISOString())

    if (recentError) {
      throw recentError
    }

    // Calculate total spent
    const totalSpent = recentPurchases?.reduce(
      (sum, p) => sum + (p.price_paid || 0),
      0
    ) || 0

    // Get average lead price
    const { data: avgPriceData, error: avgError } = await supabase
      .from('leads')
      .select('price')
      .neq('workspace_id', workspaceId)
      .eq('status', 'available')

    if (avgError) {
      throw avgError
    }

    const avgPrice = avgPriceData?.length
      ? avgPriceData.reduce((sum, l) => sum + (l.price || 0), 0) /
        avgPriceData.length
      : 0

    return NextResponse.json({
      availableLeads: availableCount || 0,
      credits: credits,
      totalPurchased: purchaseCount || 0,
      totalSpent: totalSpent,
      averagePrice: avgPrice,
      recentPurchases: recentPurchases?.length || 0,
    })
  } catch (error) {
    safeError('Error fetching marketplace stats:', error)
    return handleApiError(error)
  }
}
