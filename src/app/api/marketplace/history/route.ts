// Marketplace Purchase History API
// Get purchase history for the current workspace

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
    const { purchases, total } = await repo.getPurchaseHistory(user.workspace_id, {
      limit: 100,
    })

    const totalSpent = purchases.reduce((sum, p) => sum + (p.total_price || 0), 0)
    const totalLeads = purchases.reduce((sum, p) => sum + (p.total_leads || 0), 0)

    return NextResponse.json({
      purchases,
      total,
      totalSpent,
      totalLeads,
    })
  } catch (error) {
    safeError('Failed to get purchase history:', error)
    return handleApiError(error)
  }
}
