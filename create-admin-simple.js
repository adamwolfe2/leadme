#!/usr/bin/env node

// SIMPLE VERSION: Provide credentials as arguments
// Usage: node create-admin-simple.js <SUPABASE_URL> <SERVICE_ROLE_KEY>
//
// Get these from: https://supabase.com/dashboard/project/_/settings/api
//
// Example:
// node create-admin-simple.js "https://abc.supabase.co" "eyJhbGc..."

const { createClient } = require('@supabase/supabase-js')

const ADMIN_EMAIL = 'adam@meetcursive.com'
const ADMIN_PASSWORD = 'AdminPass123'

const supabaseUrl = process.argv[2]
const supabaseServiceKey = process.argv[3]

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Usage: node create-admin-simple.js <SUPABASE_URL> <SERVICE_ROLE_KEY>')
  console.error('\n📖 Get credentials from:')
  console.error('   https://supabase.com/dashboard/project/_/settings/api')
  console.error('\n   1. Copy "Project URL" (NEXT_PUBLIC_SUPABASE_URL)')
  console.error('   2. Copy "service_role" key (SUPABASE_SERVICE_ROLE_KEY)')
  console.error('\n💡 Example:')
  console.error('   node create-admin-simple.js "https://abc.supabase.co" "eyJhbGc..."')
  process.exit(1)
}

async function createAdmin() {
  console.log('🔧 Creating admin account...\n')

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    console.log('📧 Setting up auth user...')
    const { data: users } = await admin.auth.admin.listUsers()
    let authUser = users.users.find(u => u.email === ADMIN_EMAIL)

    if (authUser) {
      console.log('✅ Updating existing user...')
      await admin.auth.admin.updateUserById(authUser.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true
      })
    } else {
      console.log('✅ Creating new user...')
      const { data } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Adam Wolfe' }
      })
      authUser = data.user
    }

    console.log(`✅ Auth user: ${authUser.id}\n`)

    console.log('👤 Setting up user record...')
    const { data: userRecord } = await admin
      .from('users')
      .select('id, workspace_id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle()

    let workspaceId

    if (userRecord?.workspace_id) {
      console.log('✅ User has workspace\n')
      workspaceId = userRecord.workspace_id
    } else {
      console.log('🏢 Creating workspace...')
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

      workspaceId = ws.id
      console.log(`✅ Workspace: ${workspaceId}\n`)

      console.log('💾 Linking user to workspace...')
      if (userRecord) {
        await admin.from('users').update({
          workspace_id: workspaceId,
          role: 'owner',
          is_platform_admin: true,
          plan: 'pro'
        }).eq('id', userRecord.id)
      } else {
        await admin.from('users').insert({
          auth_user_id: authUser.id,
          workspace_id: workspaceId,
          email: ADMIN_EMAIL,
          full_name: 'Adam Wolfe',
          role: 'owner',
          is_platform_admin: true,
          plan: 'pro',
          daily_credit_limit: 999999
        })
      }
      console.log('✅ User linked\n')

      console.log('💰 Setting up credits...')
      await admin.from('workspace_credits').upsert({
        workspace_id: workspaceId,
        balance: 999999,
        total_purchased: 999999
      }, { onConflict: 'workspace_id' })
      console.log('✅ Credits ready\n')
    }

    console.log('🎉 SUCCESS!\n')
    console.log('📋 Login at: https://leads.meetcursive.com/login')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}\n`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

createAdmin()
