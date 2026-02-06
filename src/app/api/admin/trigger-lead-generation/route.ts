// Admin API: Manually Trigger Lead Generation
// Used for testing and manual runs

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
    const { query_id } = body

    if (query_id) {
      // Trigger for specific query
      await inngest.send({
        name: 'lead/generate',
        data: {
          query_id,
          workspace_id: user.workspace_id,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Lead generation triggered for query ${query_id}`,
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
