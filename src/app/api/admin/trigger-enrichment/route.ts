// Admin API: Manually Trigger Lead Enrichment
// Used for testing and manual enrichment

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
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

    // Inngest disabled (Node.js runtime not available on this deployment)
    // Original: await inngest.send({ name: 'lead/enrich', data: { lead_id, workspace_id } })
    console.log(`[Admin Trigger Enrichment] Enrichment requested for lead ${lead_id} (Inngest disabled - Edge runtime)`)

    return NextResponse.json({
      success: true,
      message: `Enrichment requested for lead ${lead_id} (Note: Inngest background processing unavailable)`,
    })
  } catch (error: any) {
    console.error('[Admin Trigger Enrichment] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
