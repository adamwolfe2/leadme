import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ONE-TIME admin account setup
// DELETE THIS FILE after running once for security

export async function POST() {
  try {
    const admin = createAdminClient()

    const ADMIN_EMAIL = 'adam@meetcursive.com'
    const ADMIN_PASSWORD = 'AdminPass123'

    // 1. Check if auth user already exists
    const { data: existingAuthUsers } = await admin.auth.admin.listUsers()
    const existingAuthUser = existingAuthUsers.users.find(u => u.email === ADMIN_EMAIL)

    let authUserId: string

    if (existingAuthUser) {
      console.log('Auth user already exists, using existing ID')
      authUserId = existingAuthUser.id

      // Update password in case it changed
      await admin.auth.admin.updateUserById(authUserId, {
        password: ADMIN_PASSWORD
      })
    } else {
      // Create new auth user
      const { data: newAuthUser, error: authError } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: 'Adam Wolfe',
          name: 'Adam Wolfe'
        }
      })

      if (authError || !newAuthUser.user) {
        throw new Error(`Failed to create auth user: ${authError?.message}`)
      }

      authUserId = newAuthUser.user.id
      console.log('Created new auth user:', authUserId)
    }

    // 2. Check if user record exists
    const { data: existingUser } = await admin
      .from('users')
      .select('id, workspace_id')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    if (existingUser?.workspace_id) {
      return NextResponse.json({
        success: true,
        message: 'Admin account already fully set up',
        email: ADMIN_EMAIL,
        workspace_id: existingUser.workspace_id,
        action: 'no_changes_needed'
      })
    }

    // 3. Create or find workspace
    let workspaceId: string

    if (existingUser?.workspace_id) {
      workspaceId = existingUser.workspace_id
    } else {
      // Check if workspace exists
      const { data: existingWorkspace } = await admin
        .from('workspaces')
        .select('id')
        .eq('slug', 'cursive-admin')
        .maybeSingle()

      if (existingWorkspace) {
        workspaceId = existingWorkspace.id
      } else {
        // Create new workspace
        const { data: newWorkspace, error: workspaceError } = await admin
          .from('workspaces')
          .insert({
            name: 'Cursive Admin',
            slug: 'cursive-admin',
            subdomain: 'admin',
            industry_vertical: 'Software',
            allowed_industries: ['All'],
            allowed_regions: ['US'],
            onboarding_status: 'completed',
          })
          .select('id')
          .single()

        if (workspaceError || !newWorkspace) {
          throw new Error(`Failed to create workspace: ${workspaceError?.message}`)
        }

        workspaceId = newWorkspace.id
        console.log('Created new workspace:', workspaceId)
      }
    }

    // 4. Create or update user record
    if (existingUser) {
      // Update existing user with workspace
      const { error: updateError } = await admin
        .from('users')
        .update({
          workspace_id: workspaceId,
          email: ADMIN_EMAIL,
          full_name: 'Adam Wolfe',
          role: 'owner',
          plan: 'pro',
          is_platform_admin: true,
          partner_approved: true,
          active_subscription: true,
          daily_credit_limit: 999999,
        })
        .eq('id', existingUser.id)

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`)
      }

      console.log('Updated existing user record')
    } else {
      // Create new user record
      const { error: userError } = await admin
        .from('users')
        .insert({
          auth_user_id: authUserId,
          workspace_id: workspaceId,
          email: ADMIN_EMAIL,
          full_name: 'Adam Wolfe',
          role: 'owner',
          plan: 'pro',
          is_platform_admin: true,
          partner_approved: true,
          active_subscription: true,
          daily_credit_limit: 999999,
          daily_credits_used: 0,
        })

      if (userError) {
        throw new Error(`Failed to create user: ${userError.message}`)
      }

      console.log('Created new user record')
    }

    // 5. Initialize workspace credits
    const { data: existingCredits } = await admin
      .from('workspace_credits')
      .select('id')
      .eq('workspace_id', workspaceId)
      .maybeSingle()

    if (!existingCredits) {
      await admin
        .from('workspace_credits')
        .insert({
          workspace_id: workspaceId,
          balance: 999999,
          total_purchased: 999999,
          total_used: 0,
          total_earned: 0,
        })
      console.log('Initialized workspace credits')
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      email: ADMIN_EMAIL,
      workspace_id: workspaceId,
      instructions: [
        '1. Log in at /login with your credentials',
        '2. You should now go directly to /dashboard',
        '3. DELETE this API file for security: src/app/api/admin/bootstrap/route.ts'
      ]
    })

  } catch (error: any) {
    console.error('Admin bootstrap error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create admin account' },
      { status: 500 }
    )
  }
}
