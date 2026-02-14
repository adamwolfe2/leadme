export const runtime = 'edge'

/**
 * Admin Premium Request Rejection API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { handleApiError, unauthorized, forbidden, badRequest } from '@/lib/utils/api-error-handler'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return unauthorized()
    }

    // Check if user is admin/owner
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!userProfile || !['admin', 'owner'].includes(userProfile.role)) {
      return forbidden('Admin access required')
    }

    const body = await request.json()
    const { notes } = body

    // Update the request status
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('premium_feature_requests')
      .update({
        status: 'rejected',
        reviewed_by: userProfile.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || 'Rejected',
      })
      .eq('id', id)

    if (error) {
      console.error('[Admin] Failed to reject request:', error)
      return NextResponse.json(
        { error: 'Failed to update request status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Request rejected',
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}
