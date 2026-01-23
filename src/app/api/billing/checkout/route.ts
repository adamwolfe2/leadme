// Billing Checkout API Route
// POST /api/billing/checkout - Create Stripe Checkout session

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { createCheckoutSession, STRIPE_PRICES } from '@/lib/stripe/client'
import { handleApiError, unauthorized, badRequest } from '@/lib/utils/api-error-handler'
import { z } from 'zod'

const checkoutSchema = z.object({
  priceId: z.string().optional(),
  billingPeriod: z.enum(['monthly', 'yearly']).default('monthly'),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized()
    }

    // Check if user already has active subscription
    if (user.plan === 'pro' && user.subscription_status === 'active') {
      return badRequest('You already have an active Pro subscription')
    }

    // 2. Validate input with Zod
    const body = await request.json()
    const { priceId, billingPeriod } = checkoutSchema.parse(body)

    // Determine price ID based on billing period
    const finalPriceId =
      priceId ||
      (billingPeriod === 'yearly'
        ? STRIPE_PRICES.PRO_YEARLY
        : STRIPE_PRICES.PRO_MONTHLY)

    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      )
    }

    // 3. Create checkout session
    const baseUrl = request.nextUrl.origin
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      workspaceId: user.workspace_id,
      priceId: finalPriceId,
      successUrl: `${baseUrl}/dashboard?checkout=success`,
      cancelUrl: `${baseUrl}/pricing?checkout=cancelled`,
    })

    // 4. Return response
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}
