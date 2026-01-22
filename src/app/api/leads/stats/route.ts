// Leads Stats API
// GET /api/leads/stats - Get lead statistics

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { LeadRepository } from '@/lib/repositories/lead.repository'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch stats
    const leadRepo = new LeadRepository()

    const [intentBreakdown, platformStats] = await Promise.all([
      leadRepo.getIntentBreakdown(user.workspace_id),
      leadRepo.getPlatformUploadStats(user.workspace_id),
    ])

    return NextResponse.json({
      success: true,
      data: {
        intent_breakdown: intentBreakdown,
        platform_uploads: platformStats,
      },
    })
  } catch (error: any) {
    console.error('[API] Leads stats error:', error)

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
