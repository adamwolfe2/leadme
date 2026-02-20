// Auto-Recharge Settings API
// GET: returns current auto-recharge settings for the workspace
// POST: saves auto-recharge settings (enabled, threshold, recharge_amount)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeLog, safeError } from '@/lib/utils/log-sanitizer'

const autoRechargeSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number().int().min(1).max(500),
  recharge_amount: z.enum(['starter', 'growth', 'scale', 'enterprise']),
})

export async function GET() {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace
    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!userData?.workspace_id) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    // Fetch workspace settings via admin client
    const adminClient = createAdminClient()
    const { data: workspace } = await adminClient
      .from('workspaces')
      .select('settings')
      .eq('id', userData.workspace_id)
      .maybeSingle()

    const autoRecharge = workspace?.settings?.auto_recharge ?? {
      enabled: false,
      threshold: 10,
      recharge_amount: 'starter',
    }

    safeLog('[Auto-Recharge] Fetched settings for workspace', { workspace_id: userData.workspace_id })

    return NextResponse.json({ data: autoRecharge })
  } catch (error) {
    safeError('[Auto-Recharge] Failed to fetch settings', error)
    return NextResponse.json({ error: 'Failed to fetch auto-recharge settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace
    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!userData?.workspace_id) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const body = await request.json()
    const validated = autoRechargeSchema.parse(body)

    // Fetch existing settings to merge (preserve other settings keys)
    const adminClient = createAdminClient()
    const { data: workspace } = await adminClient
      .from('workspaces')
      .select('settings')
      .eq('id', userData.workspace_id)
      .maybeSingle()

    const existingSettings = workspace?.settings ?? {}

    // Merge auto_recharge into settings JSONB
    const updatedSettings = {
      ...existingSettings,
      auto_recharge: {
        enabled: validated.enabled,
        threshold: validated.threshold,
        recharge_amount: validated.recharge_amount,
        updated_at: new Date().toISOString(),
      },
    }

    const { error: updateError } = await adminClient
      .from('workspaces')
      .update({ settings: updatedSettings })
      .eq('id', userData.workspace_id)

    if (updateError) {
      safeError('[Auto-Recharge] Failed to save settings', updateError)
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    safeLog('[Auto-Recharge] Saved settings for workspace', {
      workspace_id: userData.workspace_id,
      enabled: validated.enabled,
      threshold: validated.threshold,
      recharge_amount: validated.recharge_amount,
    })

    return NextResponse.json({ success: true, data: updatedSettings.auto_recharge })
  } catch (error) {
    safeError('[Auto-Recharge] Failed to save settings', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to save auto-recharge settings' }, { status: 500 })
  }
}
