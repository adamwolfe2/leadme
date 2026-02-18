// Admin API: Manually Trigger Lead Enrichment
// Used for testing and manual enrichment


import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify platform admin access
    const { requireAdmin } = await import('@/lib/auth/admin')
    await requireAdmin()

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
