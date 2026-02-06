// Verify Stripe Connect Onboarding
// GET /api/partner/connect/verify?partner_id=xxx

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripeClient } from '@/lib/stripe/client'

export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stripe = getStripeClient()
    const partnerId = request.nextUrl.searchParams.get('partner_id')

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Missing partner_id parameter' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get partner with Stripe account ID
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, stripe_account_id, stripe_onboarding_complete')
      .eq('id', partnerId)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    if (!partner.stripe_account_id) {
      return NextResponse.json({
        onboardingComplete: false,
        message: 'Stripe account not connected',
      })
    }

    const account = await stripe.accounts.retrieve(partner.stripe_account_id)

    // Check if onboarding is complete - require all three conditions from Stripe
    const onboardingComplete =
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled

    // Only activate partner if Stripe confirms the account is fully onboarded
    if (onboardingComplete && !partner.stripe_onboarding_complete) {
      await supabase
        .from('partners')
        .update({
          stripe_onboarding_complete: true,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', partner.id)
    }

    // If onboarding is not complete, return status without activating
    if (!onboardingComplete) {
      return NextResponse.json({
        onboardingComplete: false,
        accountId: partner.stripe_account_id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        message: 'Stripe onboarding is incomplete. Please complete all required steps in Stripe before your account can be activated.',
      })
    }

    return NextResponse.json({
      onboardingComplete,
      accountId: partner.stripe_account_id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    })
  } catch (error: any) {
    console.error('[Verify Connect] Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify account' },
      { status: 500 }
    )
  }
}
