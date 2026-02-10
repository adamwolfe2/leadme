/**
 * Audience Labs Zod Schemas
 *
 * Validates inbound payloads from three AL data flows:
 * 1. SuperPixel V3 events (real-time visitor identification)
 * 2. AudienceSync HTTP destination posts (CDP activation rows)
 * 3. Batch export JSON bundles (downloadable audience files)
 */

import { z } from 'zod'

// ============ SuperPixel Event Schema ============

/**
 * SuperPixel events arrive in two flavors:
 * - Authentication events (user submits form / logs in)
 * - Enriched events (server-side identity resolution completed)
 *
 * This schema accepts both. Fields present depend on resolution stage.
 */
export const SuperPixelEventSchema = z.object({
  // Identity resolution layers
  pixel_id: z.string().optional(),
  cookie_id: z.string().optional(),
  maid_id: z.string().optional(),
  hem_sha256: z.string().optional(),
  hem: z.string().optional(), // alias used in auth events
  uid: z.string().optional(),
  profile_id: z.string().optional(),

  // Event metadata
  event: z.string().optional(), // e.g. 'authentication', 'page_view'
  event_type: z.string().optional(), // alternate key
  event_timestamp: z.string().optional(),
  ip: z.string().optional(),
  ip_address: z.string().optional(), // enriched events use this key
  user_agent: z.string().optional(),

  // Auth event fields
  email_raw: z.string().email().optional(),

  // Activity window (enriched events)
  activity_start_date: z.string().optional(),
  activity_end_date: z.string().optional(),

  // Enriched PII fields (UPPER_CASE from AL resolution)
  FIRST_NAME: z.string().optional(),
  LAST_NAME: z.string().optional(),
  PERSONAL_EMAILS: z.string().optional(), // may be comma-separated
  BUSINESS_EMAILS: z.string().optional(), // may be comma-separated
  PERSONAL_PHONE: z.string().optional(),
  MOBILE_PHONE_DNC: z.string().optional(),
  PERSONAL_ADDRESS: z.string().optional(),
  PERSONAL_CITY: z.string().optional(),
  STATE: z.string().optional(),
  ZIP: z.string().optional(),

  // Email validation
  PERSONAL_EMAIL_VALIDATION_STATUS: z.string().optional(),
  BUSINESS_EMAIL_VALIDATION_STATUS: z.string().optional(),
  PERSONAL_EMAIL_LAST_SEEN_BY_ESP_DATE: z.string().optional(),
  BUSINESS_EMAIL_LAST_SEEN_BY_ESP_DATE: z.string().optional(),

  // Skiptrace
  SKIPTRACE_MATCH_BY: z.string().optional(),

  // Demographics
  GENDER: z.string().optional(),
  AGE: z.string().optional(),
  INCOME_RANGE: z.string().optional(),
  NET_WORTH: z.string().optional(),
  HOMEOWNER: z.string().optional(),
  MARRIED: z.string().optional(),
  CHILDREN: z.string().optional(),

  // Company
  COMPANY_NAME: z.string().optional(),
  COMPANY_DOMAIN: z.string().optional(),
  JOB_TITLE: z.string().optional(),

  // Page context
  landing_url: z.string().optional(),
  referrer: z.string().optional(),
  page_url: z.string().optional(),
  page_title: z.string().optional(),
}).passthrough() // Allow unknown fields from AL

export type SuperPixelEvent = z.infer<typeof SuperPixelEventSchema>

// ============ AudienceSync Event Schema ============

/**
 * AudienceSync HTTP destination sends templated JSON rows.
 * The template is user-defined in AL dashboard (Mustache syntax).
 * We accept any JSON and normalize known keys.
 */
export const AudienceSyncEventSchema = z.object({
  // Common templated fields (lowercase, user-defined names)
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  company_name: z.string().optional(),
  company_domain: z.string().optional(),
  job_title: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  address: z.string().optional(),
  timestamp: z.string().optional(),
  audience_id: z.string().optional(),
  profile_id: z.string().optional(),
  uid: z.string().optional(),
  hem_sha256: z.string().optional(),
}).passthrough() // Template is user-defined, accept anything

export type AudienceSyncEvent = z.infer<typeof AudienceSyncEventSchema>

// ============ Export Row Schema ============

/**
 * Rows from JSON bundle exports downloaded from AL.
 * Uses the same UPPER_CASE field names as enriched SuperPixel events.
 */
export const ExportRowSchema = z.object({
  // Identity
  profile_id: z.string().optional(),
  uid: z.string().optional(),
  hem_sha256: z.string().optional(),

  // PII (UPPER_CASE)
  FIRST_NAME: z.string().optional(),
  LAST_NAME: z.string().optional(),
  PERSONAL_EMAILS: z.string().optional(),
  BUSINESS_EMAILS: z.string().optional(),
  PERSONAL_PHONE: z.string().optional(),
  MOBILE_PHONE_DNC: z.string().optional(),
  PERSONAL_ADDRESS: z.string().optional(),
  PERSONAL_CITY: z.string().optional(),
  STATE: z.string().optional(),
  ZIP: z.string().optional(),

  // Validation
  PERSONAL_EMAIL_VALIDATION_STATUS: z.string().optional(),
  BUSINESS_EMAIL_VALIDATION_STATUS: z.string().optional(),
  PERSONAL_EMAIL_LAST_SEEN_BY_ESP_DATE: z.string().optional(),
  BUSINESS_EMAIL_LAST_SEEN_BY_ESP_DATE: z.string().optional(),
  SKIPTRACE_MATCH_BY: z.string().optional(),

  // Demographics
  GENDER: z.string().optional(),
  AGE: z.string().optional(),
  INCOME_RANGE: z.string().optional(),
  NET_WORTH: z.string().optional(),
  HOMEOWNER: z.string().optional(),
  MARRIED: z.string().optional(),
  CHILDREN: z.string().optional(),

  // Company
  COMPANY_NAME: z.string().optional(),
  COMPANY_DOMAIN: z.string().optional(),
  JOB_TITLE: z.string().optional(),

  // Page context (may be present in export)
  landing_url: z.string().optional(),
  referrer: z.string().optional(),
}).passthrough()

export type ExportRow = z.infer<typeof ExportRowSchema>

// ============ Webhook Wrapper Schema ============

/**
 * Some AL webhooks wrap the payload in a `result` array.
 * This schema handles both wrapped and unwrapped payloads.
 */
export const SuperPixelWebhookPayloadSchema = z.union([
  // Wrapped: { result: [...events] }
  z.object({
    result: z.array(SuperPixelEventSchema),
  }).passthrough(),
  // Single event object
  SuperPixelEventSchema,
  // Array of events
  z.array(SuperPixelEventSchema),
])

export type SuperPixelWebhookPayload = z.infer<typeof SuperPixelWebhookPayloadSchema>

// ============ Import Request Schema ============

export const ImportRequestSchema = z.object({
  fileUrl: z.string().url(),
  format: z.enum(['json']).default('json'),
  source: z.literal('audiencelab_export').default('audiencelab_export'),
  audienceId: z.string().optional(),
  workspaceId: z.string().uuid().optional(),
})

export type ImportRequest = z.infer<typeof ImportRequestSchema>
