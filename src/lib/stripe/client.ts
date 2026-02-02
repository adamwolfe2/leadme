// Stripe Client
// Lazy initialization to avoid build-time errors

import Stripe from 'stripe'

let stripeClient: Stripe | null = null

/**
 * Get Stripe client instance (lazy initialization)
 * Throws error if STRIPE_SECRET_KEY is not set
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripeClient = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia',
    })
  }
  return stripeClient
}

/**
 * Reset Stripe client (useful for testing)
 */
export function resetStripeClient() {
  stripeClient = null
}
