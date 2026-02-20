// Marketplace Saved Searches — Delete by ID
// DELETE /api/marketplace/saved-searches/[id]

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/utils/log-sanitizer'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing saved search ID' }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve the internal user record to verify ownership
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (userError || !userData) {
      safeError('[SavedSearches DELETE] Failed to fetch user data:', userError)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    const admin = createAdminClient()

    // Delete only if the record belongs to this user (ownership check)
    const { error: deleteError, count } = await admin
      .from('saved_filters')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', userData.id)
      .eq('filter_type', 'marketplace')

    if (deleteError) {
      safeError('[SavedSearches DELETE] Failed to delete saved search:', deleteError)
      return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 })
    }

    if (count === 0) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    safeError('[SavedSearches DELETE] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 })
  }
}
