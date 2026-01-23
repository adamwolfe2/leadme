// User Info API
// GET /api/users/me - Get current user info including credits

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { handleApiError, unauthorized, success } from '@/lib/utils/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized()
    }

    // 2. Calculate credits remaining
    const creditsRemaining = user.daily_credit_limit - user.daily_credits_used

    // 3. Return response
    return success({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      workspace_id: user.workspace_id,
      role: user.role,
      plan: user.plan,
      daily_credit_limit: user.daily_credit_limit,
      daily_credits_used: user.daily_credits_used,
      credits_remaining: Math.max(0, creditsRemaining),
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}
