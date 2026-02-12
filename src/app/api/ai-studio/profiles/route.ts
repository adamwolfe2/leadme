/**
 * Customer Profiles API Routes
 * GET /api/ai-studio/profiles - List customer profiles for a workspace
 */

export const runtime = 'edge'

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

    // Fetch customer profiles for the workspace
    const { data: profiles, error } = await supabase
      .from('customer_profiles')
      .select('id, brand_workspace_id, name, email, phone, demographics, preferences, purchase_history, engagement_score, tags, created_at, updated_at')
      .eq('brand_workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Profiles] Database error:', error)
      throw new Error('Failed to fetch profiles')
    }

    return NextResponse.json({ profiles: profiles || [] })
  } catch (error: any) {
    console.error('[Profiles] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
