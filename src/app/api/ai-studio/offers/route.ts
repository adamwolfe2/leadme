/**
 * Offers API Routes
 * GET /api/ai-studio/offers - List offers for a workspace
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspace')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspace parameter required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify brand workspace belongs to user's workspace
    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: brandWorkspace } = await supabase
      .from('brand_workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('workspace_id', userData.workspace_id)
      .single()

    if (!brandWorkspace) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch offers for the workspace
    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .eq('brand_workspace_id', workspaceId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Offers] Database error:', error)
      throw new Error('Failed to fetch offers')
    }

    return NextResponse.json({ offers: offers || [] })
  } catch (error: any) {
    console.error('[Offers] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}
