// Admin API: Manually Trigger Lead Generation
// Used for testing and manual runs

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
    const { query_id } = body

    if (query_id) {
      // Inngest disabled (Node.js runtime not available on this deployment)
      // Original: await inngest.send({ name: 'lead/generate', data: { query_id, workspace_id } })
      console.log(`[Admin Trigger Lead Generation] Generation requested for query ${query_id} (Inngest disabled - Edge runtime)`)

      return NextResponse.json({
        success: true,
        message: `Lead generation requested for query ${query_id} (Note: Inngest background processing unavailable)`,
      })
    } else {
      // Trigger daily generation for all queries
      // Note: This would normally be triggered by cron
      // For testing, we can manually invoke it
      return NextResponse.json({
        success: true,
        message: 'Lead generation will run on next cron schedule (2 AM daily)',
        note: 'Use Inngest dashboard to manually invoke the daily-lead-generation function',
      })
    }
  } catch (error: any) {
    console.error('[Admin Trigger Lead Generation] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
