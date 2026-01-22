// Admin API: Manually Trigger Lead Enrichment
// Used for testing and manual enrichment

import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '@/inngest/client'
import { getCurrentUser } from '@/lib/auth/helpers'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to trigger (check role)
    if (user.role !== 'admin' && user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { lead_id } = body

    if (!lead_id) {
      return NextResponse.json(
        { error: 'lead_id is required' },
        { status: 400 }
      )
    }

    // Trigger enrichment
    await inngest.send({
      name: 'lead/enrich',
      data: {
        lead_id,
        workspace_id: user.workspace_id,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Enrichment triggered for lead ${lead_id}`,
    })
  } catch (error: any) {
    console.error('[Admin] Enrichment trigger error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
