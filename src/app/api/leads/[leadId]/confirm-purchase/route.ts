/**
 * Lead Purchase Confirmation API
 * POST /api/leads/[leadId]/confirm-purchase
 * Called after successful Stripe payment to record purchase and credit partner
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'
import { PartnerRepository } from '@/lib/db/repositories/partner.repository'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId: resolvedLeadId } = await params

    // Authenticate user
    const supabaseAuth = await createClient()
    const { data: { user: authUser } } = await supabaseAuth.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const stripe = getStripeClient()
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    // Verify payment succeeded with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      )
    }

    // Verify metadata matches
    const leadId = paymentIntent.metadata.lead_id
    const partnerId = paymentIntent.metadata.partner_id
    const buyerId = paymentIntent.metadata.buyer_user_id

    if (leadId !== resolvedLeadId) {
      return NextResponse.json(
        { error: 'Lead ID mismatch' },
        { status: 400 }
      )
    }

    // Verify the authenticated user matches the buyer in the Stripe metadata
    const { data: buyerProfile } = await supabaseAuth
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!buyerProfile || buyerProfile.id !== buyerId) {
      return NextResponse.json(
        { error: 'Authenticated user does not match buyer' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Check if already recorded (idempotency)
    const { data: existingPurchase } = await supabase
      .from('lead_purchases')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    if (existingPurchase) {
      return NextResponse.json({ success: true, alreadyRecorded: true })
    }

    // Record purchase using repository
    // This automatically credits the partner via credit_partner_for_sale() database function
    const partnerRepo = new PartnerRepository()
    const purchase = await partnerRepo.recordLeadPurchase({
      lead_id: leadId,
      buyer_user_id: buyerId,
      partner_id: partnerId !== 'none' ? partnerId : null,
      purchase_price: 20.0,
      partner_commission: 14.0, // 70% commission
      platform_fee: 6.0, // 30% platform fee
      stripe_payment_intent_id: paymentIntentId,
    })

    // Get buyer's workspace to assign lead
    const { data: buyer } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('id', buyerId)
      .single()

    if (!buyer) {
      throw new Error('Buyer not found')
    }

    // Get the lead data needed for existence check
    const { data: leadData } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .single()

    if (!leadData) {
      throw new Error('Lead not found')
    }

    // Update lead: assign to buyer's workspace and mark as "new" in CRM
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        workspace_id: buyer.workspace_id, // Assign to buyer's workspace
        status: 'new', // Set as new lead in CRM
        assigned_user_id: buyerId, // Assign to the purchaser
        sold_at: new Date().toISOString(),
        // Preserve all other lead data
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('[Confirm Purchase] Failed to update lead:', updateError)
      throw new Error('Failed to assign purchased lead to buyer')
    }

    return NextResponse.json({ success: true, purchaseId: purchase.id })
  } catch (error) {
    console.error('[Confirm Purchase] Error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm purchase' },
      { status: 500 }
    )
  }
}
