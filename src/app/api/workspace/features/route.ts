
/**
 * Workspace Features API
 * Returns which premium features the workspace has access to
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { handleApiError, unauthorized } from '@/lib/utils/api-error-handler'
import { safeError } from '@/lib/utils/log-sanitizer'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const supabase = await createClient()

    // Get workspace premium features
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('has_pixel_access, has_whitelabel_access, has_extra_data_access, has_outbound_access, premium_features_updated_at')
      .eq('id', user.workspace_id)
      .maybeSingle()

    if (error) {
      safeError('[Workspace Features] Failed to fetch:', error)
      return NextResponse.json(
        { error: 'Failed to fetch workspace features' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      has_pixel_access: workspace?.has_pixel_access ?? false,
      has_whitelabel_access: workspace?.has_whitelabel_access ?? false,
      has_extra_data_access: workspace?.has_extra_data_access ?? false,
      has_outbound_access: workspace?.has_outbound_access ?? false,
      premium_features_updated_at: workspace?.premium_features_updated_at,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
