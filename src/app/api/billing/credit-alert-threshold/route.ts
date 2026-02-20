// Credit Alert Threshold API
// GET: return current threshold from workspaces.settings
// PATCH: validate threshold (int, 1-1000), merge into workspaces.settings JSON

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/helpers'
import { handleApiError, unauthorized } from '@/lib/utils/api-error-handler'
import { safeError } from '@/lib/utils/log-sanitizer'

const patchSchema = z.object({
  threshold: z.number().int('Threshold must be an integer').min(1, 'Minimum 1').max(1000, 'Maximum 1000'),
})

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return unauthorized()
    }

    if (!user.workspace_id) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const adminClient = createAdminClient()
    const { data: workspace } = await adminClient
      .from('workspaces')
      .select('settings')
      .eq('id', user.workspace_id)
      .maybeSingle()

    const threshold = (workspace?.settings as Record<string, unknown> | null)?.credit_alert_threshold ?? 10

    return NextResponse.json({ threshold })
  } catch (error) {
    safeError('[CreditAlertThreshold] GET failed:', error)
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return unauthorized()
    }

    if (!user.workspace_id) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const body = await request.json()
    const parseResult = patchSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid threshold', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { threshold } = parseResult.data

    const adminClient = createAdminClient()

    // Fetch existing settings to preserve other keys
    const { data: workspace } = await adminClient
      .from('workspaces')
      .select('settings')
      .eq('id', user.workspace_id)
      .maybeSingle()

    const existingSettings = (workspace?.settings as Record<string, unknown> | null) ?? {}

    const updatedSettings = {
      ...existingSettings,
      credit_alert_threshold: threshold,
    }

    const { error: updateError } = await adminClient
      .from('workspaces')
      .update({ settings: updatedSettings })
      .eq('id', user.workspace_id)

    if (updateError) {
      safeError('[CreditAlertThreshold] Failed to update:', updateError)
      return NextResponse.json({ error: 'Failed to save threshold' }, { status: 500 })
    }

    return NextResponse.json({ success: true, threshold })
  } catch (error) {
    safeError('[CreditAlertThreshold] PATCH failed:', error)
    return handleApiError(error)
  }
}
