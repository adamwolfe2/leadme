/**
 * Audience Labs Schema Validation Tests
 *
 * Tests Zod schemas for SuperPixel, AudienceSync, export, and import payloads.
 */

import { describe, it, expect } from 'vitest'
import {
  SuperPixelEventSchema,
  AudienceSyncEventSchema,
  ExportRowSchema,
  SuperPixelWebhookPayloadSchema,
  ImportRequestSchema,
} from '@/lib/audiencelab/schemas'

// ==========================================================================
// SUPERPIXEL EVENT SCHEMA
// ==========================================================================
describe('SuperPixelEventSchema', () => {
  it('should accept a minimal auth event', () => {
    const result = SuperPixelEventSchema.safeParse({
      event: 'authentication',
      email_raw: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should accept a fully enriched event', () => {
    const result = SuperPixelEventSchema.safeParse({
      pixel_id: '59aee3ac-1234',
      hem_sha256: 'abc123',
      event_timestamp: '2026-02-10T12:00:00Z',
      ip_address: '1.2.3.4',
      uid: 'uid-001',
      profile_id: 'prof-001',
      FIRST_NAME: 'John',
      LAST_NAME: 'Doe',
      PERSONAL_EMAILS: 'john@gmail.com',
      BUSINESS_EMAILS: 'john@acme.com',
      PERSONAL_PHONE: '+15551234567',
      COMPANY_NAME: 'Acme Corp',
    })
    expect(result.success).toBe(true)
  })

  it('should accept empty object (all fields optional)', () => {
    const result = SuperPixelEventSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should pass through unknown fields', () => {
    const result = SuperPixelEventSchema.safeParse({
      custom_field: 'custom_value',
      nested: { deep: true },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as any).custom_field).toBe('custom_value')
    }
  })

  it('should reject non-object payloads', () => {
    expect(SuperPixelEventSchema.safeParse('string').success).toBe(false)
    expect(SuperPixelEventSchema.safeParse(123).success).toBe(false)
    expect(SuperPixelEventSchema.safeParse(null).success).toBe(false)
  })
})

// ==========================================================================
// AUDIENCESYNC EVENT SCHEMA
// ==========================================================================
describe('AudienceSyncEventSchema', () => {
  it('should accept a typical audiencesync row', () => {
    const result = AudienceSyncEventSchema.safeParse({
      email: 'sync@example.com',
      first_name: 'Sync',
      last_name: 'User',
      company: 'SyncCo',
    })
    expect(result.success).toBe(true)
  })

  it('should accept minimal object', () => {
    const result = AudienceSyncEventSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should pass through arbitrary fields (user-defined template)', () => {
    const result = AudienceSyncEventSchema.safeParse({
      custom_column: 'value',
      revenue: 50000,
      employee_count: 200,
    })
    expect(result.success).toBe(true)
  })
})

// ==========================================================================
// EXPORT ROW SCHEMA
// ==========================================================================
describe('ExportRowSchema', () => {
  it('should accept UPPER_CASE export fields', () => {
    const result = ExportRowSchema.safeParse({
      FIRST_NAME: 'Alice',
      LAST_NAME: 'Johnson',
      PERSONAL_EMAILS: 'alice@gmail.com',
      BUSINESS_EMAILS: 'alice@acme.com',
      COMPANY_NAME: 'Acme Corp',
    })
    expect(result.success).toBe(true)
  })

  it('should accept lowercase export fields', () => {
    const result = ExportRowSchema.safeParse({
      first_name: 'Bob',
      email: 'bob@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should pass through unknown fields', () => {
    const result = ExportRowSchema.safeParse({
      INCOME_RANGE: '$100k-$150k',
      HOMEOWNER: 'Yes',
    })
    expect(result.success).toBe(true)
  })
})

// ==========================================================================
// SUPERPIXEL WEBHOOK PAYLOAD SCHEMA (wrapper)
// ==========================================================================
describe('SuperPixelWebhookPayloadSchema', () => {
  it('should accept { result: [...] } wrapper', () => {
    const result = SuperPixelWebhookPayloadSchema.safeParse({
      result: [
        { event: 'page_view', pixel_id: 'px-001' },
        { event: 'authentication', email_raw: 'test@example.com' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('should accept a single event object', () => {
    const result = SuperPixelWebhookPayloadSchema.safeParse({
      event: 'authentication',
      email_raw: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should accept an array of events', () => {
    const result = SuperPixelWebhookPayloadSchema.safeParse([
      { event: 'page_view' },
      { event: 'deep_scroll' },
    ])
    expect(result.success).toBe(true)
  })
})

// ==========================================================================
// IMPORT REQUEST SCHEMA
// ==========================================================================
describe('ImportRequestSchema', () => {
  it('should accept valid import request', () => {
    const result = ImportRequestSchema.safeParse({
      fileUrl: 'https://example.com/export.json',
    })
    expect(result.success).toBe(true)
  })

  it('should accept with optional fields', () => {
    const result = ImportRequestSchema.safeParse({
      fileUrl: 'https://example.com/export.json',
      audienceId: 'aud-001',
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing fileUrl', () => {
    const result = ImportRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should reject invalid URL', () => {
    const result = ImportRequestSchema.safeParse({
      fileUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })
})
