// Leads Stats API
// GET /api/leads/stats - Get lead statistics


import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { handleApiError, unauthorized, success } from '@/lib/utils/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized()
    }

    // 2. Fetch stats with workspace filtering
    const leadRepo = new LeadRepository()
    const [intentBreakdown, platformStats] = await Promise.all([
      leadRepo.getIntentBreakdown(user.workspace_id),
      leadRepo.getPlatformUploadStats(user.workspace_id),
    ])

    // 3. Return response
    return success({
      intent_breakdown: intentBreakdown,
      platform_uploads: platformStats,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
