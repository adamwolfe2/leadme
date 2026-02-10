#!/usr/bin/env node

// RUN THIS ONCE: node create-admin-now.js
// DELETE AFTER USE

const { createClient } = require('@supabase/supabase-js')

const ADMIN_EMAIL = 'adam@meetcursive.com'
const ADMIN_PASSWORD = 'AdminPass123'

async function createAdmin() {
  console.log('🔧 Creating admin account...\n')

  // Read from .env.local
  require('dotenv').config({ path: '.env.local' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Check if auth user exists
    console.log('📧 Checking for existing auth user...')
    const { data: users } = await admin.auth.admin.listUsers()
    let authUser = users.users.find(u => u.email === ADMIN_EMAIL)

    if (authUser) {
      console.log('✅ Auth user exists, updating password...')
      await admin.auth.admin.updateUserById(authUser.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true
      })
    } else {
      console.log('➕ Creating new auth user...')
      const { data, error } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: 'Adam Wolfe'
        }
      })
      if (error) throw error
      authUser = data.user
    }

    console.log(`✅ Auth user ready: ${authUser.id}`)

    // 2. Check if user record exists
    console.log('\n👤 Checking for user record...')
    const { data: userRecord } = await admin
      .from('users')
      .select('id, workspace_id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle()

    let workspaceId

    if (userRecord?.workspace_id) {
      console.log('✅ User already has workspace')
      workspaceId = userRecord.workspace_id
    } else {
      // 3. Create or find workspace
      console.log('\n🏢 Creating workspace...')
      const { data: existingWs } = await admin
        .from('workspaces')
        .select('id')
        .eq('slug', 'cursive-admin')
        .maybeSingle()

      if (existingWs) {
        workspaceId = existingWs.id
        console.log('✅ Workspace exists')
      } else {
        const { data: newWs, error } = await admin
          .from('workspaces')
          .insert({
            name: 'Cursive Admin',
            slug: 'cursive-admin',
            subdomain: 'admin',
            industry_vertical: 'Software',
            allowed_industries: ['All'],
            allowed_regions: ['US'],
            onboarding_status: 'completed'
          })
          .select('id')
          .single()

        if (error) throw error
        workspaceId = newWs.id
        console.log('✅ Workspace created')
      }

      // 4. Create or update user record
      console.log('\n💾 Creating user record...')
      if (userRecord) {
        await admin
          .from('users')
          .update({
            workspace_id: workspaceId,
            role: 'owner',
            is_platform_admin: true,
            plan: 'pro',
            partner_approved: true,
            active_subscription: true
          })
          .eq('id', userRecord.id)
        console.log('✅ User record updated')
      } else {
        await admin
          .from('users')
          .insert({
            auth_user_id: authUser.id,
            workspace_id: workspaceId,
            email: ADMIN_EMAIL,
            full_name: 'Adam Wolfe',
            role: 'owner',
            is_platform_admin: true,
            plan: 'pro',
            partner_approved: true,
            active_subscription: true,
            daily_credit_limit: 999999,
            daily_credits_used: 0
          })
        console.log('✅ User record created')
      }

      // 5. Initialize credits
      console.log('\n💰 Setting up credits...')
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
            total_earned: 0
          })
        console.log('✅ Credits initialized')
      } else {
        console.log('✅ Credits already exist')
      }
    }

    console.log('\n🎉 SUCCESS! Admin account ready!')
    console.log('\n📋 Login Details:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log('\n🌐 Log in at: https://leads.meetcursive.com/login')
    console.log('\n⚠️  DELETE THIS FILE AFTER USE: rm create-admin-now.js')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

createAdmin()
