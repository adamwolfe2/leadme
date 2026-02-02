import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendPurchaseConfirmationEmail,
  sendCreditPurchaseConfirmationEmail,
  sendPaymentFailedEmail,
  sendPayoutCompletedEmail,
  sendPayoutFailedEmail
} from '@/lib/email/service'

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeClient()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // IDEMPOTENCY CHECK: Prevent duplicate processing of same event
    const eventId = event.id
    const { data: existingEvent } = await supabase
      .from('processed_webhook_events')
      .select('id, processed_at')
      .eq('event_id', eventId)
      .eq('source', 'stripe')
      .single()

    if (existingEvent) {
      console.log(`[Stripe Webhook] Event ${eventId} already processed at ${existingEvent.processed_at}, skipping`)
      return NextResponse.json({ received: true, duplicate: true })
    }

    // Record event as being processed (before actual processing)
    await supabase.from('processed_webhook_events').insert({
      event_id: eventId,
      source: 'stripe',
      stripe_event_id: eventId, // Keep for backwards compatibility
      event_type: event.type,
      processed_at: new Date().toISOString(),
      payload_summary: {
        event_type: event.type,
        created: event.created,
      },
    })

    // WEBHOOK RETRY LOGIC: Wrap event processing in try-catch
    try {
      await processWebhookEvent(event, supabase)
      return NextResponse.json({ received: true })
    } catch (processingError: any) {
      console.error(`[Webhook] Failed to process ${event.type}:`, processingError)

      // Queue for retry with exponential backoff
      try {
        const { data: queueId } = await supabase.rpc('queue_webhook_retry', {
          p_stripe_event_id: event.id,
          p_event_type: event.type,
          p_event_data: event as unknown as Record<string, unknown>,
          p_error: processingError.message || 'Unknown error',
        })

        console.log(`[Webhook] Queued for retry: ${event.id}, queue_id: ${queueId}`)
      } catch (queueError) {
        console.error(`[Webhook] Failed to queue retry:`, queueError)
      }

      // Still return 500 to inform Stripe of failure
      return NextResponse.json(
        { error: 'Webhook processing failed, queued for retry' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Extract event processing logic into separate function for reuse in retry processor
async function processWebhookEvent(event: Stripe.Event, supabase: any) {
  console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`)

  // ============================================================================
  // CHECKOUT & PAYMENT EVENTS
  // ============================================================================

  // Handle payment success
  if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const purchaseType = session.metadata?.type

      // Handle marketplace lead purchase
      if (purchaseType === 'lead_purchase') {
        const purchaseId = session.metadata?.purchase_id
        const workspaceId = session.metadata?.workspace_id

        if (!purchaseId || !workspaceId) {
          console.error('Missing metadata for lead purchase')
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
        }

        // Check if purchase already completed (extra idempotency check)
        const { data: existingPurchase } = await supabase
          .from('marketplace_purchases')
          .select('status')
          .eq('id', purchaseId)
          .single()

        if (existingPurchase?.status === 'completed') {
          console.log(`Lead purchase ${purchaseId} already completed, skipping`)
          return NextResponse.json({ received: true, duplicate: true })
        }

        // Complete the marketplace purchase
        await supabase
          .from('marketplace_purchases')
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent as string,
            completed_at: new Date().toISOString(),
          })
          .eq('id', purchaseId)

        // Get purchase items to mark leads as sold
        const { data: items } = await supabase
          .from('marketplace_purchase_items')
          .select('lead_id, partner_id, commission_amount')
          .eq('purchase_id', purchaseId)

        if (items && items.length > 0) {
          // Mark leads as sold
          const leadIds = items.map(item => item.lead_id)
          for (const leadId of leadIds) {
            await supabase.rpc('mark_lead_sold', { p_lead_id: leadId })
          }

          // Update partner pending balances for commissions
          const partnerCommissions = items.reduce<Record<string, number>>((acc, item) => {
            if (item.partner_id && item.commission_amount) {
              acc[item.partner_id] = (acc[item.partner_id] || 0) + item.commission_amount
            }
            return acc
          }, {})

          for (const [partnerId, amount] of Object.entries(partnerCommissions)) {
            const { data: partner } = await supabase
              .from('partners')
              .select('pending_balance, total_earnings')
              .eq('id', partnerId)
              .single()

            if (partner) {
              await supabase
                .from('partners')
                .update({
                  pending_balance: (partner.pending_balance || 0) + amount,
                  total_earnings: (partner.total_earnings || 0) + amount,
                  total_leads_sold: supabase.sql`COALESCE(total_leads_sold, 0) + 1`,
                  updated_at: new Date().toISOString(),
                } as never)
                .eq('id', partnerId)
            }
          }
        }

        // Send purchase confirmation email
        try {
          const { data: purchase } = await supabase
            .from('marketplace_purchases')
            .select('buyer_user_id, total_price')
            .eq('id', purchaseId)
            .single()

          if (purchase?.buyer_user_id) {
            const { data: user } = await supabase
              .from('users')
              .select('email, full_name')
              .eq('id', purchase.buyer_user_id)
              .single()

            if (user) {
              const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace/download/${purchaseId}`
              const downloadExpiresAt = new Date()
              downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 90)

              await sendPurchaseConfirmationEmail(
                user.email,
                user.full_name || 'Valued Customer',
                {
                  totalLeads: items?.length || 0,
                  totalPrice: purchase.total_price,
                  purchaseId,
                  downloadUrl,
                  downloadExpiresAt,
                }
              )
            }
          }
        } catch (emailError) {
          console.error('[Stripe Webhook] Failed to send purchase confirmation:', emailError)
          // Don't fail the webhook if email fails
        }

        console.log(`✅ Lead purchase completed: ${purchaseId} for workspace ${workspaceId}`)
        return NextResponse.json({ received: true })
      }

      // Handle marketplace credit purchase
      if (purchaseType === 'credit_purchase') {
        const creditPurchaseId = session.metadata?.credit_purchase_id
        const workspaceId = session.metadata?.workspace_id
        const credits = parseInt(session.metadata?.credits || '0', 10)

        if (!creditPurchaseId || !workspaceId || !credits) {
          console.error('Missing metadata for credit purchase')
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
        }

        // Complete the credit purchase
        await supabase
          .from('credit_purchases')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', creditPurchaseId)

        // Add credits to workspace
        const { data: existingCredits } = await supabase
          .from('workspace_credits')
          .select('*')
          .eq('workspace_id', workspaceId)
          .single()

        if (existingCredits) {
          await supabase
            .from('workspace_credits')
            .update({
              balance: existingCredits.balance + credits,
              total_purchased: existingCredits.total_purchased + credits,
              updated_at: new Date().toISOString(),
            })
            .eq('workspace_id', workspaceId)
        } else {
          await supabase
            .from('workspace_credits')
            .insert({
              workspace_id: workspaceId,
              balance: credits,
              total_purchased: credits,
              total_used: 0,
              total_earned: 0,
            })
        }

        // Send credit purchase confirmation email
        try {
          const { data: creditPurchase } = await supabase
            .from('credit_purchases')
            .select('user_id, amount, package_name')
            .eq('id', creditPurchaseId)
            .single()

          if (creditPurchase?.user_id) {
            const { data: user } = await supabase
              .from('users')
              .select('email, full_name')
              .eq('id', creditPurchase.user_id)
              .single()

            if (user) {
              // Get new balance
              const { data: updatedCredits } = await supabase
                .from('workspace_credits')
                .select('balance')
                .eq('workspace_id', workspaceId)
                .single()

              await sendCreditPurchaseConfirmationEmail(
                user.email,
                user.full_name || 'Valued Customer',
                {
                  creditsAmount: credits,
                  totalPrice: creditPurchase.amount,
                  packageName: creditPurchase.package_name || `${credits} Credits`,
                  newBalance: updatedCredits?.balance || credits,
                }
              )
            }
          }
        } catch (emailError) {
          console.error('[Stripe Webhook] Failed to send credit confirmation:', emailError)
          // Don't fail the webhook if email fails
        }

        console.log(`✅ Credit purchase completed: ${credits} credits for workspace ${workspaceId}`)
        return NextResponse.json({ received: true })
      }

      // Handle subscription checkout
      if (purchaseType === 'subscription') {
        const userId = session.metadata?.user_id
        const workspaceId = session.metadata?.workspace_id
        const customerId = session.customer as string

        if (!userId || !workspaceId || !customerId) {
          console.error('[Stripe Webhook] Missing metadata for subscription checkout')
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
        }

        // Update workspace with Stripe customer ID
        // This allows customer.subscription.created/updated events to find the workspace
        const { error: workspaceError } = await supabase
          .from('workspaces')
          .update({
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workspaceId)

        if (workspaceError) {
          console.error('[Stripe Webhook] Failed to update workspace with customer ID:', workspaceError)
          return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 })
        }

        console.log(`✅ Subscription checkout completed: Customer ${customerId} linked to workspace ${workspaceId}`)
        console.log('   → Subscription will be created by customer.subscription.created event')
        return NextResponse.json({ received: true })
      }

      // Handle legacy lead purchase
      const leadId = session.metadata?.lead_id
      const buyerEmail = session.metadata?.buyer_email
      const companyName = session.metadata?.company_name

      if (!leadId || !buyerEmail) {
        // Not a lead purchase or credit purchase - might be another type
        console.log('Checkout session without lead/credit metadata - skipping')
        return NextResponse.json({ received: true })
      }

      // Get or create buyer
      const { data: buyer, error: buyerError } = await supabase
        .from('buyers')
        .upsert({
          email: buyerEmail,
          company_name: companyName || 'Unknown',
          stripe_customer_id: session.customer as string,
          workspace_id: 'default'
        }, { onConflict: 'email' })
        .select()
        .single()

      if (buyerError) {
        console.error('Failed to create buyer:', buyerError)
        return NextResponse.json({ error: 'Failed to create buyer' }, { status: 500 })
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('lead_purchases')
        .insert({
          lead_id: leadId,
          buyer_id: buyer.id,
          price_paid: (session.amount_total || 0) / 100,
          stripe_payment_intent: session.payment_intent as string,
          stripe_session_id: session.id
        })

      if (purchaseError) {
        console.error('Failed to create purchase:', purchaseError)
        return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
      }

      // Update lead status to delivered
      await supabase
        .from('leads')
        .update({ delivery_status: 'delivered' })
        .eq('id', leadId)

      console.log(`✅ Payment successful for lead ${leadId}`)
    }

  // ============================================================================
  // PAYMENT_INTENT EVENTS
  // ============================================================================

  // Handle payment intent succeeded (for direct charges, not checkout)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log(`[Stripe Webhook] Payment intent succeeded: ${paymentIntent.id}`)

    // Check if this is for a marketplace purchase
    const { data: marketplacePurchase } = await supabase
      .from('marketplace_purchases')
      .select('id, status, buyer_workspace_id, buyer_user_id, total_leads')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (marketplacePurchase && marketplacePurchase.status === 'pending') {
      // Complete the purchase (idempotency handled by status check)
      await supabase
        .from('marketplace_purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', marketplacePurchase.id)

      console.log(`✅ Marketplace purchase ${marketplacePurchase.id} marked completed via payment_intent.succeeded`)
    }

    // Check if this is for a credit purchase
    const { data: creditPurchase } = await supabase
      .from('credit_purchases')
      .select('id, status, workspace_id, credits')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (creditPurchase && creditPurchase.status === 'pending') {
      // Complete the credit purchase
      await supabase
        .from('credit_purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', creditPurchase.id)

      console.log(`✅ Credit purchase ${creditPurchase.id} marked completed via payment_intent.succeeded`)
    }

    return
  }

  // Handle payment failures (one-time payments)
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const errorMessage = paymentIntent.last_payment_error?.message || 'Unknown error'
    console.error(`[Stripe Webhook] Payment failed: ${paymentIntent.id} - ${errorMessage}`)

    // Check if this is for a marketplace purchase
    const { data: marketplacePurchase } = await supabase
      .from('marketplace_purchases')
      .select('id, status, buyer_user_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (marketplacePurchase) {
      // Update purchase status to failed
      await supabase
        .from('marketplace_purchases')
        .update({
          status: 'failed',
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', marketplacePurchase.id)

      console.log(`✅ Marketplace purchase ${marketplacePurchase.id} marked as failed`)
    }

    // Check if this is for a credit purchase
    const { data: creditPurchase } = await supabase
      .from('credit_purchases')
      .select('id, status, user_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (creditPurchase) {
      // Update credit purchase status to failed
      await supabase
        .from('credit_purchases')
        .update({
          status: 'failed',
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creditPurchase.id)

      console.log(`✅ Credit purchase ${creditPurchase.id} marked as failed`)
    }

    return
  }

  // ============================================================================
  // SUBSCRIPTION EVENTS
  // ============================================================================

  // Handle invoice payment failures (subscriptions)
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const subscriptionId = invoice.subscription as string

      console.error('[Stripe Webhook] Invoice payment failed:', invoice.id)

      // Find workspace by customer ID
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id, name, owner_user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!workspace) {
        console.error('[Stripe Webhook] Workspace not found for customer:', customerId)
        return NextResponse.json({ received: true })
      }

      // Get subscription to check attempt count
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id, failed_payment_count, status')
        .eq('stripe_subscription_id', subscriptionId)
        .single()

      const failedCount = (subscription?.failed_payment_count || 0) + 1

      // Update subscription status and failed payment count
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          failed_payment_count: failedCount,
          last_payment_failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId)

      // After 3 failed attempts, disable workspace access
      if (failedCount >= 3) {
        console.log(`[Stripe Webhook] Disabling workspace ${workspace.id} after ${failedCount} failed payments`)

        await supabase
          .from('workspaces')
          .update({
            access_disabled: true,
            access_disabled_reason: 'subscription_payment_failed',
            access_disabled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', workspace.id)
      }

      // Send payment failure notification email
      try {
        const { data: user } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', workspace.owner_user_id)
          .single()

        if (user) {
          await sendPaymentFailedEmail(
            user.email,
            user.full_name || 'User',
            {
              workspaceName: workspace.name,
              attemptNumber: failedCount,
              invoiceUrl: invoice.hosted_invoice_url || '',
              remainingAttempts: 3 - failedCount,
              isDisabled: failedCount >= 3,
            }
          )
          console.log(`✅ Payment failure email sent to ${user.email} (attempt ${failedCount}/3)`)
        }
      } catch (emailError) {
        console.error('[Stripe Webhook] Failed to send payment failure email:', emailError)
        // Don't fail the webhook if email fails
      }

      console.log(`✅ Invoice payment failure handled: ${invoice.id}, attempt ${failedCount}/3`)
      return NextResponse.json({ received: true })
    }

    // Handle refunds
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = charge.payment_intent as string

      if (!paymentIntentId) {
        console.error('Charge refunded but no payment_intent found')
        return NextResponse.json({ received: true })
      }

      // Check if this is a credit purchase refund
      const { data: creditPurchase } = await supabase
        .from('credit_purchases')
        .select('id, workspace_id, credits, user_id, package_name')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (creditPurchase) {
        // Mark credit purchase as refunded
        await supabase
          .from('credit_purchases')
          .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
          })
          .eq('id', creditPurchase.id)

        // Deduct credits from workspace balance
        const { data: workspaceCredits } = await supabase
          .from('workspace_credits')
          .select('balance, total_purchased')
          .eq('workspace_id', creditPurchase.workspace_id)
          .single()

        if (workspaceCredits) {
          await supabase
            .from('workspace_credits')
            .update({
              balance: Math.max(0, workspaceCredits.balance - creditPurchase.credits),
              total_purchased: Math.max(0, workspaceCredits.total_purchased - creditPurchase.credits),
              updated_at: new Date().toISOString(),
            })
            .eq('workspace_id', creditPurchase.workspace_id)
        }

        // Send refund confirmation email
        try {
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', creditPurchase.user_id)
            .single()

          if (user) {
            // Note: sendCreditRefundEmail would need to be created in email service
            console.log(`Credit refund for user ${user.email}: ${creditPurchase.credits} credits`)
          }
        } catch (emailError) {
          console.error('[Stripe Webhook] Failed to send refund notification:', emailError)
        }

        console.log(`✅ Credit refund processed: ${creditPurchase.credits} credits for workspace ${creditPurchase.workspace_id}`)
        return NextResponse.json({ received: true })
      }

      // Check if this is a marketplace purchase refund
      const { data: marketplacePurchase } = await supabase
        .from('marketplace_purchases')
        .select('id, buyer_workspace_id, credits_used, buyer_user_id, total_leads')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (marketplacePurchase) {
        // Mark purchase as refunded
        await supabase
          .from('marketplace_purchases')
          .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
          })
          .eq('id', marketplacePurchase.id)

        // Get purchase items to reverse operations
        const { data: items } = await supabase
          .from('marketplace_purchase_items')
          .select('lead_id, partner_id, commission_amount')
          .eq('purchase_id', marketplacePurchase.id)

        if (items && items.length > 0) {
          // Return leads to marketplace (make available again)
          const leadIds = items.map(item => item.lead_id)
          await supabase
            .from('leads')
            .update({
              is_marketplace_listed: true,
              marketplace_status: 'listed',
              updated_at: new Date().toISOString(),
            })
            .in('id', leadIds)

          // Reverse partner commissions
          const partnerCommissions = items.reduce<Record<string, number>>((acc, item) => {
            if (item.partner_id && item.commission_amount) {
              acc[item.partner_id] = (acc[item.partner_id] || 0) + item.commission_amount
            }
            return acc
          }, {})

          for (const [partnerId, amount] of Object.entries(partnerCommissions)) {
            const { data: partner } = await supabase
              .from('partners')
              .select('pending_balance, total_earnings, total_leads_sold')
              .eq('id', partnerId)
              .single()

            if (partner) {
              await supabase
                .from('partners')
                .update({
                  pending_balance: Math.max(0, (partner.pending_balance || 0) - amount),
                  total_earnings: Math.max(0, (partner.total_earnings || 0) - amount),
                  total_leads_sold: Math.max(0, (partner.total_leads_sold || 0) - 1),
                  updated_at: new Date().toISOString(),
                } as never)
                .eq('id', partnerId)
            }
          }
        }

        // Return credits to workspace (if purchase used credits)
        if (marketplacePurchase.credits_used > 0) {
          const { data: workspaceCredits } = await supabase
            .from('workspace_credits')
            .select('balance')
            .eq('workspace_id', marketplacePurchase.buyer_workspace_id)
            .single()

          if (workspaceCredits) {
            await supabase
              .from('workspace_credits')
              .update({
                balance: workspaceCredits.balance + marketplacePurchase.credits_used,
                updated_at: new Date().toISOString(),
              })
              .eq('workspace_id', marketplacePurchase.buyer_workspace_id)
          }
        }

        // Send refund confirmation email
        try {
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', marketplacePurchase.buyer_user_id)
            .single()

          if (user) {
            console.log(`Lead purchase refund for user ${user.email}: ${marketplacePurchase.total_leads} leads`)
          }
        } catch (emailError) {
          console.error('[Stripe Webhook] Failed to send refund notification:', emailError)
        }

        console.log(`✅ Marketplace purchase refund processed: ${marketplacePurchase.total_leads} leads for workspace ${marketplacePurchase.buyer_workspace_id}`)
        return NextResponse.json({ received: true })
      }

      // Refund doesn't match any known purchase type
      console.log(`Refund for payment_intent ${paymentIntentId} - no matching purchase found`)
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const newStatus = subscription.status

      // Find workspace by customer ID
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id, access_disabled')
        .eq('stripe_customer_id', customerId)
        .single()

      if (workspace) {
        // Get plan from price ID
        const priceId = subscription.items.data[0]?.price.id
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('id, name')
          .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
          .single()

        // Get existing subscription to check status change
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        const previousStatus = existingSubscription?.status

        // Update subscription
        const subscriptionUpdate: any = {
          workspace_id: workspace.id,
          plan_id: plan?.id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          status: newStatus,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }

        // Reset failed payment count if payment succeeds
        if (newStatus === 'active' && previousStatus !== 'active') {
          subscriptionUpdate.failed_payment_count = 0
          subscriptionUpdate.last_payment_failed_at = null
        }

        await supabase
          .from('subscriptions')
          .upsert(subscriptionUpdate, { onConflict: 'workspace_id' })

        // Handle status transitions
        if (newStatus === 'active' && previousStatus !== 'active') {
          // Subscription reactivated - re-enable workspace access
          if (workspace.access_disabled) {
            await supabase
              .from('workspaces')
              .update({
                access_disabled: false,
                access_disabled_reason: null,
                access_disabled_at: null,
                plan: plan?.name,
                updated_at: new Date().toISOString(),
              })
              .eq('id', workspace.id)

            console.log(`✅ Workspace ${workspace.id} access re-enabled (subscription active)`)
          }

          // Enable marketplace access for all business users in workspace
          await supabase
            .from('users')
            .update({
              active_subscription: true,
              subscription_plan_id: subscription.id,
              subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('workspace_id', workspace.id)
            .in('role', ['owner', 'admin', 'member'])

          console.log(`✅ Marketplace access enabled for workspace ${workspace.id} users`)
        } else if (['past_due', 'unpaid'].includes(newStatus)) {
          // Subscription payment issues - log but don't disable yet (handled by invoice.payment_failed)
          console.log(`⚠️ Subscription ${subscription.id} status changed to ${newStatus}`)
        } else if (newStatus === 'canceled') {
          // Subscription canceled - downgrade to free
          await supabase
            .from('workspaces')
            .update({ plan: 'free' })
            .eq('id', workspace.id)

          // Disable marketplace access for all business users in workspace
          await supabase
            .from('users')
            .update({
              active_subscription: false,
              subscription_end_date: new Date().toISOString(),
            })
            .eq('workspace_id', workspace.id)
            .in('role', ['owner', 'admin', 'member'])

          console.log(`✅ Workspace ${workspace.id} downgraded to free (subscription canceled)`)
        }

        // Update workspace plan if not already handled
        if (plan && (newStatus === 'active' || newStatus === 'trialing')) {
          await supabase
            .from('workspaces')
            .update({ plan: plan.name })
            .eq('id', workspace.id)

          // Enable marketplace access for trialing subscriptions too
          if (newStatus === 'trialing' && previousStatus !== 'trialing') {
            await supabase
              .from('users')
              .update({
                active_subscription: true,
                subscription_plan_id: subscription.id,
                subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
                subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('workspace_id', workspace.id)
              .in('role', ['owner', 'admin', 'member'])

            console.log(`✅ Marketplace access enabled for workspace ${workspace.id} users (trial started)`)
          }
        }
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

      // Find and downgrade workspace
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('workspace_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (sub) {
        await supabase
          .from('workspaces')
          .update({ plan: 'free' })
          .eq('id', sub.workspace_id)

        // Disable marketplace access for all business users in workspace
        await supabase
          .from('users')
          .update({
            active_subscription: false,
            subscription_end_date: new Date().toISOString(),
          })
          .eq('workspace_id', sub.workspace_id)
          .in('role', ['owner', 'admin', 'member'])

        console.log(`✅ Marketplace access disabled for workspace ${sub.workspace_id} users (subscription deleted)`)
      }
    }

  // Handle invoice paid
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (workspace) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('workspace_id', workspace.id)
        .single()

      await supabase.from('invoices').insert({
        workspace_id: workspace.id,
        subscription_id: subscription?.id,
        stripe_invoice_id: invoice.id,
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency,
        status: 'paid',
        invoice_number: invoice.number,
        invoice_pdf_url: invoice.invoice_pdf,
        paid_at: new Date().toISOString(),
      })
    }

    return
  }

  // ============================================================================
  // PARTNER PAYOUT EVENTS (Stripe Connect Transfers)
  // ============================================================================

  // Handle transfer created (payout initiated to partner)
  if (event.type === 'transfer.created') {
    const transfer = event.data.object as Stripe.Transfer
    console.log(`[Stripe Webhook] Transfer created: ${transfer.id} - ${transfer.amount / 100} ${transfer.currency}`)

    // Get partner from Stripe account ID
    const { data: partner } = await supabase
      .from('partners')
      .select('id, email, company_name, pending_balance')
      .eq('stripe_account_id', transfer.destination)
      .single()

    if (!partner) {
      console.error(`[Stripe Webhook] Partner not found for Stripe account: ${transfer.destination}`)
      return
    }

    // Create or update payout request record
    const payoutAmount = transfer.amount / 100
    const { data: existingPayout } = await supabase
      .from('payout_requests')
      .select('id')
      .eq('stripe_payout_id', transfer.id)
      .single()

    if (!existingPayout) {
      // Create new payout request
      await supabase
        .from('payout_requests')
        .insert({
          partner_id: partner.id,
          amount: payoutAmount,
          status: 'processing',
          stripe_payout_id: transfer.id,
          requested_at: new Date(transfer.created * 1000).toISOString(),
        })

      console.log(`✅ Payout request created for partner ${partner.id}: $${payoutAmount}`)
    } else {
      // Update existing payout to processing
      await supabase
        .from('payout_requests')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPayout.id)

      console.log(`✅ Payout request ${existingPayout.id} updated to processing`)
    }

    return
  }

  // Handle transfer paid (payout completed)
  if (event.type === 'transfer.paid') {
    const transfer = event.data.object as Stripe.Transfer
    console.log(`[Stripe Webhook] Transfer paid: ${transfer.id}`)

    // Get partner from Stripe account ID
    const { data: partner } = await supabase
      .from('partners')
      .select('id, email, company_name, pending_balance, available_balance')
      .eq('stripe_account_id', transfer.destination)
      .single()

    if (!partner) {
      console.error(`[Stripe Webhook] Partner not found for Stripe account: ${transfer.destination}`)
      return
    }

    const payoutAmount = transfer.amount / 100

    // Update payout request to completed
    const { data: payout } = await supabase
      .from('payout_requests')
      .select('id, amount')
      .eq('stripe_payout_id', transfer.id)
      .single()

    if (payout) {
      await supabase
        .from('payout_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payout.id)

      console.log(`✅ Payout request ${payout.id} marked as completed`)
    }

    // Update partner balances - move from available to paid
    await supabase
      .from('partners')
      .update({
        available_balance: Math.max(0, (partner.available_balance || 0) - payoutAmount),
        updated_at: new Date().toISOString(),
      })
      .eq('id', partner.id)

    // Update partner earnings to paid_out status
    await supabase
      .from('partner_earnings')
      .update({
        status: 'paid_out',
      })
      .eq('partner_id', partner.id)
      .eq('status', 'available')
      .lte('created_at', new Date().toISOString()) // Only earnings created before this payout

    console.log(`✅ Partner ${partner.id} balance updated: $${payoutAmount} transferred`)

    // Send payout completed email
    try {
      // Get leads count from earnings
      const { count: leadsCount } = await supabase
        .from('partner_earnings')
        .select('*', { count: 'exact', head: true })
        .eq('partner_id', partner.id)
        .eq('status', 'paid_out')

      await sendPayoutCompletedEmail(
        partner.email,
        partner.company_name,
        {
          amount: payoutAmount,
          currency: transfer.currency.toUpperCase(),
          leadsCount: leadsCount || 0,
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Approximate 30 days ago
          periodEnd: new Date(),
          payoutId: transfer.id,
        }
      )

      console.log(`✅ Payout completion email sent to ${partner.email}`)
    } catch (emailError) {
      console.error('[Stripe Webhook] Failed to send payout email:', emailError)
      // Don't fail the webhook if email fails
    }

    return
  }

  // Handle transfer failed (payout failed)
  if (event.type === 'transfer.failed') {
    const transfer = event.data.object as Stripe.Transfer
    const failureMessage = transfer.failure_message || 'Unknown error'
    console.error(`[Stripe Webhook] Transfer failed: ${transfer.id} - ${failureMessage}`)

    // Get partner from Stripe account ID
    const { data: partner } = await supabase
      .from('partners')
      .select('id, email, company_name, available_balance')
      .eq('stripe_account_id', transfer.destination)
      .single()

    if (!partner) {
      console.error(`[Stripe Webhook] Partner not found for Stripe account: ${transfer.destination}`)
      return
    }

    const payoutAmount = transfer.amount / 100

    // Update payout request to rejected/failed
    await supabase
      .from('payout_requests')
      .update({
        status: 'rejected',
        rejection_reason: `Transfer failed: ${failureMessage}`,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payout_id', transfer.id)

    // Funds should remain in available_balance since transfer failed
    console.log(`✅ Payout request marked as failed for partner ${partner.id}`)

    // Send payout failed notification email
    try {
      await sendPayoutFailedEmail(partner.email, partner.company_name, {
        amount: payoutAmount,
        currency: transfer.currency.toUpperCase(),
        reason: failureMessage,
        payoutId: transfer.id,
      })

      console.log(`✅ Payout failure email sent to ${partner.email}`)
    } catch (emailError) {
      console.error('[Stripe Webhook] Failed to send payout failure email:', emailError)
      // Don't fail the webhook if email fails
    }

    return
  }

  // ============================================================================
  // UNHANDLED EVENT TYPES
  // ============================================================================

  // Log unhandled events but return 200 so Stripe doesn't retry
  console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
}
