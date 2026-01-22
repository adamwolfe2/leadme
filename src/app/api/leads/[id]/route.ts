// Lead Detail API
// GET /api/leads/[id] - Get single lead
// DELETE /api/leads/[id] - Delete lead

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { LeadRepository } from '@/lib/repositories/lead.repository'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leadRepo = new LeadRepository()
    const lead = await leadRepo.findById(id, user.workspace_id)

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: lead })
  } catch (error: any) {
    console.error('[API] Lead detail error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leadRepo = new LeadRepository()
    await leadRepo.delete(id, user.workspace_id)

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    })
  } catch (error: any) {
    console.error('[API] Lead delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
