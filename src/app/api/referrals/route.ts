// Referrals API
// Get referral stats and manage referral codes


import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { handleApiError, unauthorized } from '@/lib/utils/api-error-handler'
import {
  getWorkspaceReferralStats,
  assignWorkspaceReferralCode,
} from '@/lib/services/referral.service'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const stats = await getWorkspaceReferralStats(user.workspace_id)

    // Generate referral code if not exists
    if (!stats.referralCode) {
      stats.referralCode = await assignWorkspaceReferralCode(user.workspace_id)
    }

    return NextResponse.json(stats)
  } catch (error) {
    return handleApiError(error)
  }
}
