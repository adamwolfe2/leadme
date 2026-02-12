export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth/roles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await isAdmin(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, admin_notes } = body

    // Update message using admin client
    const adminSupabase = createAdminClient()
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
      if (status === 'responded') {
        updateData.responded_at = new Date().toISOString()
        // Get user from users table
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()

        if (userData) {
          updateData.responded_by = userData.id
        }
      }
    }

    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes
    }

    const { data, error } = await adminSupabase
      .from('support_messages')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, subject, message, status, priority, source, admin_notes, responded_at, responded_by, created_at, updated_at')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ message: data })
  } catch (error) {
    console.error('[Admin] Support message update error:', error)
    return NextResponse.json(
      { error: 'Failed to update support message' },
      { status: 500 }
    )
  }
}
