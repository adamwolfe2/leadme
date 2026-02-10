/**
 * Onboarding Setup API
 * Creates workspace + user profile using admin client (bypasses RLS)
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSlackAlert } from '@/lib/monitoring/alerts'
import { inngest } from '@/inngest/client'
import { FREE_TRIAL_CREDITS } from '@/lib/constants/credit-packages'
import { z } from 'zod'

const businessSchema = z.object({
  role: z.literal('business'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().min(1),
  industry: z.string().min(1),
  targetLocations: z.string().optional(),
  monthlyLeadNeed: z.string().min(1),
})

const partnerSchema = z.object({
  role: z.literal('partner'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().min(1),
  partnerType: z.string().min(1),
  primaryVerticals: z.string().min(1),
  databaseSize: z.string().min(1),
  enrichmentMethods: z.string().optional(),
  linkedin: z.string().min(1),
  website: z.string().optional(),
})

const setupSchema = z.discriminatedUnion('role', [businessSchema, partnerSchema])

export async function POST(request: NextRequest) {
  try {
    console.log('[Onboarding] Starting POST request')

    // 1. Verify auth session server-side
    const supabase = await createClient()
    console.log('[Onboarding] Created Supabase client')

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    console.log('[Onboarding] Auth check:', { hasUser: !!authUser, authError: authError?.message })

    if (!authUser) {
      console.log('[Onboarding] No auth user - returning 401')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Parse and validate body
    const body = await request.json()
    console.log('[Onboarding] Received body:', { role: body.role, email: body.email })

    const validated = setupSchema.parse(body)
    console.log('[Onboarding] Validation passed')

    // 3. Use admin client (service role) to bypass RLS
    const admin = createAdminClient()

    // 4. Check if user already has a workspace
    const { data: existingUser } = await admin
      .from('users')
      .select('workspace_id')
      .eq('auth_user_id', authUser.id)
      .single()

    if (existingUser?.workspace_id) {
      return NextResponse.json(
        { error: 'User already has a workspace', workspace_id: existingUser.workspace_id },
        { status: 409 }
      )
    }

    if (validated.role === 'business') {
      const slug = validated.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check slug availability
      const { data: existing } = await admin
        .from('workspaces')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'Company name is taken. Please try another.' },
          { status: 409 }
        )
      }

      // Create workspace
      const { data: workspace, error: workspaceError } = await admin
        .from('workspaces')
        .insert({
          name: validated.companyName,
          slug,
          subdomain: slug,
          industry_vertical: validated.industry,
          allowed_industries: [validated.industry],
          allowed_regions: validated.targetLocations ? [validated.targetLocations] : ['US'],
          onboarding_status: 'completed',
        })
        .select('id')
        .single()

      if (workspaceError) {
        console.error('[Onboarding] Workspace creation failed:', workspaceError)
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
      }

      // Create user profile
      const fullName = `${validated.firstName} ${validated.lastName}`
      const { data: userProfile, error: userError } = await admin
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          workspace_id: workspace.id,
          email: validated.email,
          full_name: fullName,
          role: 'owner',
          plan: 'free',
          daily_credit_limit: 3,
          daily_credits_used: 0,
          active_subscription: false,
          partner_approved: false,
        })
        .select('id')
        .single()

      if (userError) {
        // Rollback workspace
        await admin.from('workspaces').delete().eq('id', workspace.id)
        console.error('[Onboarding] User creation failed:', userError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }

      // Grant free trial credits (transactional with workspace creation)
      try {
        // Create workspace_credits record with free trial balance
        const { error: creditsError } = await admin
          .from('workspace_credits')
          .insert({
            workspace_id: workspace.id,
            balance: FREE_TRIAL_CREDITS.credits,
            total_purchased: 0,
            total_used: 0,
            total_earned: FREE_TRIAL_CREDITS.credits,
          })

        if (creditsError) {
          throw new Error(`Failed to initialize credits: ${creditsError.message}`)
        }

        // Record the free credit grant
        const { error: grantError } = await admin
          .from('free_credit_grants')
          .insert({
            workspace_id: workspace.id,
            user_id: userProfile.id,
            credits_granted: FREE_TRIAL_CREDITS.credits,
          })

        if (grantError) {
          throw new Error(`Failed to record credit grant: ${grantError.message}`)
        }
      } catch (creditError) {
        // Rollback workspace and user on credit grant failure
        await admin.from('users').delete().eq('id', userProfile.id)
        await admin.from('workspaces').delete().eq('id', workspace.id)
        console.error('[Onboarding] Credit grant failed:', creditError)
        return NextResponse.json(
          { error: 'Failed to grant free credits' },
          { status: 500 }
        )
      }

      // Non-blocking Slack notification
      sendSlackAlert({
        type: 'new_signup',
        severity: 'info',
        message: `New business signup: ${validated.companyName} (${FREE_TRIAL_CREDITS.credits} free credits granted)`,
        metadata: {
          email: validated.email,
          name: fullName,
          company: validated.companyName,
          industry: validated.industry,
          target_locations: validated.targetLocations || 'Not specified',
          monthly_lead_need: validated.monthlyLeadNeed,
          workspace_id: workspace.id,
          free_credits: FREE_TRIAL_CREDITS.credits,
        },
      }).catch(() => {})

      // Non-blocking GHL onboard (creates contact in Cursive's GHL CRM)
      inngest.send({
        name: 'ghl-admin/onboard-customer',
        data: {
          user_id: authUser.id,
          user_email: authUser.email!,
          user_name: authUser.user_metadata.full_name || authUser.user_metadata.name || 'Customer',
          workspace_id: workspace.id,
          purchase_type: 'free_signup',
          amount: 0,
        },
      }).catch(() => {})

      return NextResponse.json({ workspace_id: workspace.id })

    } else {
      // Partner flow
      const slug = validated.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Create workspace
      const { data: workspace, error: workspaceError } = await admin
        .from('workspaces')
        .insert({
          name: validated.companyName,
          slug,
          subdomain: slug,
          onboarding_status: 'completed',
        })
        .select('id')
        .single()

      if (workspaceError) {
        console.error('[Onboarding] Partner workspace creation failed:', workspaceError)
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
      }

      // Create partner user
      const fullName = `${validated.firstName} ${validated.lastName}`
      const { data: userProfile, error: userError } = await admin
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          workspace_id: workspace.id,
          email: validated.email,
          full_name: fullName,
          role: 'partner',
          plan: 'free',
          partner_approved: false,
          active_subscription: true,
        })
        .select('id')
        .single()

      if (userError) {
        // Rollback workspace
        await admin.from('workspaces').delete().eq('id', workspace.id)
        console.error('[Onboarding] Partner user creation failed:', userError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }

      // Grant free trial credits (transactional with workspace creation)
      try {
        // Create workspace_credits record with free trial balance
        const { error: creditsError } = await admin
          .from('workspace_credits')
          .insert({
            workspace_id: workspace.id,
            balance: FREE_TRIAL_CREDITS.credits,
            total_purchased: 0,
            total_used: 0,
            total_earned: FREE_TRIAL_CREDITS.credits,
          })

        if (creditsError) {
          throw new Error(`Failed to initialize credits: ${creditsError.message}`)
        }

        // Record the free credit grant
        const { error: grantError } = await admin
          .from('free_credit_grants')
          .insert({
            workspace_id: workspace.id,
            user_id: userProfile.id,
            credits_granted: FREE_TRIAL_CREDITS.credits,
          })

        if (grantError) {
          throw new Error(`Failed to record credit grant: ${grantError.message}`)
        }
      } catch (creditError) {
        // Rollback workspace and user on credit grant failure
        await admin.from('users').delete().eq('id', userProfile.id)
        await admin.from('workspaces').delete().eq('id', workspace.id)
        console.error('[Onboarding] Credit grant failed:', creditError)
        return NextResponse.json(
          { error: 'Failed to grant free credits' },
          { status: 500 }
        )
      }

      // Non-blocking Slack notification
      sendSlackAlert({
        type: 'new_signup',
        severity: 'info',
        message: `New partner signup: ${validated.companyName} (${FREE_TRIAL_CREDITS.credits} free credits granted)`,
        metadata: {
          email: validated.email,
          name: fullName,
          company: validated.companyName,
          partner_type: validated.partnerType,
          verticals: validated.primaryVerticals,
          database_size: validated.databaseSize,
          enrichment: validated.enrichmentMethods || 'Not specified',
          linkedin: validated.linkedin,
          website: validated.website || 'Not specified',
          workspace_id: workspace.id,
          free_credits: FREE_TRIAL_CREDITS.credits,
        },
      }).catch(() => {})

      // Non-blocking GHL onboard (creates contact in Cursive's GHL CRM)
      inngest.send({
        name: 'ghl-admin/onboard-customer',
        data: {
          user_id: authUser.id,
          user_email: authUser.email!,
          user_name: authUser.user_metadata.full_name || authUser.user_metadata.name || 'Partner',
          workspace_id: workspace.id,
          purchase_type: 'partner_signup',
          amount: 0,
        },
      }).catch(() => {})

      return NextResponse.json({ workspace_id: workspace.id })
    }
  } catch (error) {
    console.error('[Onboarding] Caught error:', error)

    if (error instanceof z.ZodError) {
      console.error('[Onboarding] Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[Onboarding] Unexpected error:', error)
    console.error('[Onboarding] Error stack:', error instanceof Error ? error.stack : 'no stack')
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
