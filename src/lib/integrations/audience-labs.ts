/**
 * Audience Labs Integration
 *
 * AL is a CDP/Activation + SuperPixel platform — NOT a traditional REST API.
 * Data flows INTO Cursive via three channels:
 *   1. Real-time SuperPixel events → /api/webhooks/audiencelab/superpixel
 *   2. AudienceSync HTTP destination → /api/webhooks/audiencelab/audiencesync
 *   3. Batch export imports → /api/audiencelab/import
 *
 * This module provides shared utilities and future API client methods.
 * Webhook handlers and processing logic live in their respective route files
 * and src/inngest/functions/audiencelab-processor.ts.
 *
 * Schemas: src/lib/audiencelab/schemas.ts
 * Field normalization: src/lib/audiencelab/field-map.ts
 */

import crypto from 'crypto'

// Re-export schemas and field-map for convenience
export { SuperPixelEventSchema, AudienceSyncEventSchema, ExportRowSchema } from '@/lib/audiencelab/schemas'
export { normalizeALPayload, computeDeliverabilityScore } from '@/lib/audiencelab/field-map'

/**
 * Verify AL webhook secret (shared secret or HMAC signature).
 * Used by both superpixel and audiencesync webhook handlers.
 */
export function verifyAudienceLabWebhook(
  rawBody: string,
  headers: {
    secret?: string | null
    signature?: string | null
  }
): boolean {
  const webhookSecret = process.env.AUDIENCELAB_WEBHOOK_SECRET
  if (!webhookSecret) return false

  // Check shared secret header
  if (headers.secret) {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(headers.secret),
        Buffer.from(webhookSecret)
      )
    } catch {
      return false
    }
  }

  // Check HMAC signature
  if (headers.signature) {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')
    const provided = headers.signature.replace(/^sha256=/, '')
    try {
      return crypto.timingSafeEqual(
        Buffer.from(provided),
        Buffer.from(expected)
      )
    } catch {
      return false
    }
  }

  return false
}

/**
 * Get the configured AL pixel ID (optional — can also be derived from events).
 */
export function getPixelId(): string | null {
  return process.env.AUDIENCELAB_PIXEL_ID || null
}

/**
 * Get the AL account API key (for future API use).
 * Not yet confirmed which REST endpoints exist outside the dashboard.
 */
export function getAccountApiKey(): string | null {
  return process.env.AUDIENCELAB_ACCOUNT_API_KEY || null
}
