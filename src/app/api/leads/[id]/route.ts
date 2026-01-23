// Lead Detail API
// GET /api/leads/[id] - Get single lead
// DELETE /api/leads/[id] - Delete lead

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { handleApiError, unauthorized, notFound, success } from '@/lib/utils/api-error-handler'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // 1. Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized()
    }

    // 2. Fetch lead with workspace filtering
    const leadRepo = new LeadRepository()
    const lead = await leadRepo.findById(id, user.workspace_id)

    if (!lead) {
      return notFound('Lead not found')
    }

    // 3. Return response
    return success(lead)
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // 1. Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized()
    }

    // 2. Delete lead with workspace filtering
    const leadRepo = new LeadRepository()
    await leadRepo.delete(id, user.workspace_id)

    // 3. Return response
    return success({ message: 'Lead deleted successfully' })
  } catch (error: any) {
    return handleApiError(error)
  }
}
