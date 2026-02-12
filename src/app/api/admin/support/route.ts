export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth/roles'

export async function GET() {
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

    // Fetch all support messages using admin client
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('support_messages')
      .select('id, user_id, workspace_id, subject, message, status, priority, category, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error('[Admin] Support messages fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support messages' },
      { status: 500 }
    )
  }
}
