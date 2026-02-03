import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth/roles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await isAdmin(session.user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

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
          .eq('auth_user_id', session.user.id)
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
      .eq('id', params.id)
      .select()
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
