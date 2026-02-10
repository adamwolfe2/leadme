import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PUBLIC route - no auth required
// DELETE AFTER USE

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = createAdminClient()
    const ADMIN_EMAIL = 'adam@meetcursive.com'
    const ADMIN_PASSWORD = 'AdminPass123'

    // List all users to find existing one
    const { data: listData } = await admin.auth.admin.listUsers()
    const existingUser = listData.users.find(u => u.email === ADMIN_EMAIL)

    let authUserId: string
    let action = ''

    if (existingUser) {
      authUserId = existingUser.id
      action = 'updating_existing_user'

      // Update password
      await admin.auth.admin.updateUserById(authUserId, {
        password: ADMIN_PASSWORD,
        email_confirm: true
      })
    } else {
      action = 'creating_new_user'

      const { data: newUser, error } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Adam Wolfe' }
      })

      if (error) throw error
      authUserId = newUser.user!.id
    }

    // Check user record
    const { data: userRecord } = await admin
      .from('users')
      .select('id, workspace_id')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    let workspaceId: string

    if (userRecord?.workspace_id) {
      workspaceId = userRecord.workspace_id
      action += '_workspace_exists'
    } else {
      // Create workspace
      const { data: ws } = await admin
        .from('workspaces')
        .upsert({
          name: 'Cursive Admin',
          slug: 'cursive-admin',
          subdomain: 'admin',
          onboarding_status: 'completed'
        }, { onConflict: 'slug' })
        .select('id')
        .single()

      workspaceId = ws!.id
      action += '_workspace_created'

      // Create or update user record
      if (userRecord) {
        await admin.from('users').update({
          workspace_id: workspaceId,
          is_platform_admin: true,
          role: 'owner'
        }).eq('id', userRecord.id)
      } else {
        await admin.from('users').insert({
          auth_user_id: authUserId,
          workspace_id: workspaceId,
          email: ADMIN_EMAIL,
          full_name: 'Adam Wolfe',
          role: 'owner',
          is_platform_admin: true,
          plan: 'pro'
        })
      }

      // Credits
      await admin.from('workspace_credits').upsert({
        workspace_id: workspaceId,
        balance: 999999,
        total_purchased: 999999
      }, { onConflict: 'workspace_id' })
    }

    return NextResponse.json({
      success: true,
      action,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      workspace_id: workspaceId,
      message: 'Now try logging in!'
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
