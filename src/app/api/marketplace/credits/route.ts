// Marketplace Credits API
// Get current workspace credit balance

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { handleApiError, unauthorized } from '@/lib/utils/api-error-handler'
import { MarketplaceRepository } from '@/lib/repositories/marketplace.repository'
import { safeError } from '@/lib/utils/log-sanitizer'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return unauthorized()
    }

    if (!user.workspace_id) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const repo = new MarketplaceRepository()
    const credits = await repo.getWorkspaceCredits(user.workspace_id)

    return NextResponse.json({
      balance: credits?.balance || 0,
      totalPurchased: credits?.total_purchased || 0,
      totalUsed: credits?.total_used || 0,
      totalEarned: credits?.total_earned || 0,
    })
  } catch (error) {
    safeError('Failed to get credits:', error)
    return handleApiError(error)
  }
}
