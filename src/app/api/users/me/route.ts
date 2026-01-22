// User Info API
// GET /api/users/me - Get current user info including credits

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate credits remaining
    const creditsRemaining = user.daily_credit_limit - user.daily_credits_used

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        workspace_id: user.workspace_id,
        role: user.role,
        plan: user.plan,
        daily_credit_limit: user.daily_credit_limit,
        daily_credits_used: user.daily_credits_used,
        credits_remaining: Math.max(0, creditsRemaining),
      },
    })
  } catch (error: any) {
    console.error('[API] Get user info error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
