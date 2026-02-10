# Audience Labs Integration — Final Implementation Spec

> Generated: 2026-02-10 | Status: Complete (pending AL dashboard configuration)

---

## A) Patch Summary

### New Files Created (13)

| # | File | Purpose |
|---|------|---------|
| 1 | `supabase/migrations/20260210_audiencelab_schema.sql` | Core tables: audiencelab_events, audiencelab_identities + indexes + RLS |
| 2 | `supabase/migrations/20260210_audiencelab_hardening.sql` | audiencelab_pixels, audiencelab_import_jobs tables + raw_headers column |
| 3 | `src/lib/audiencelab/schemas.ts` | Zod schemas: SuperPixelEventSchema, AudienceSyncEventSchema, ExportRowSchema, ImportRequestSchema |
| 4 | `src/lib/audiencelab/field-map.ts` | Field normalization, deliverability scoring, lead-worthiness policy, flattenPayload |
| 5 | `src/app/api/webhooks/audiencelab/superpixel/route.ts` | SuperPixel real-time webhook receiver |
| 6 | `src/app/api/webhooks/audiencelab/audiencesync/route.ts` | AudienceSync HTTP destination receiver |
| 7 | `src/inngest/functions/audiencelab-processor.ts` | Inngest async processor: normalize → identity → lead → route → notify |
| 8 | `src/app/api/audiencelab/import/route.ts` | Batch export JSON importer (authenticated) |
| 9 | `src/app/api/audiencelab/events/route.ts` | Internal API: paginated event list |
| 10 | `src/app/api/audiencelab/leads/route.ts` | Internal API: AL-sourced leads list |
| 11 | `src/app/api/audiencelab/identities/route.ts` | Internal API: identity search |
| 12 | `src/app/api/audiencelab/replay/[eventId]/route.ts` | Re-process event (idempotent) |
| 13 | `docs/audiencelab-integration-spec.md` | This document |

### Modified Files (7)

| # | File | Change |
|---|------|--------|
| 1 | `src/inngest/client.ts` | Added `audiencelab/event-received` and `audiencelab/identity-updated` events |
| 2 | `src/inngest/functions/index.ts` | Registered `processAudienceLabEvent` export |
| 3 | `src/app/api/inngest/route.ts` | Added `functions.processAudienceLabEvent` to serve() |
| 4 | `src/lib/integrations/audience-labs.ts` | Rewritten: removed fake REST endpoints, re-exports schemas/field-map |
| 5 | `.env.example` | Added AUDIENCELAB_WEBHOOK_SECRET, AUDIENCELAB_PIXEL_ID, AUDIENCELAB_ACCOUNT_API_KEY |
| 6 | `src/lib/services/lead-provider.service.ts` | Removed AudienceLabsClient import, replaced with stubs |
| 7 | `src/app/api/admin/leads/search/route.ts` | Replaced AudienceLabsClient.searchLeads with empty result |

### Hardening Patches Applied

| # | Hardening Item | Status |
|---|---------------|--------|
| H1 | Nested payload paths (resolution.*, event_data.*, event.data.*) | Applied: `flattenPayload()` in field-map.ts |
| H2 | Event naming (check `type` key too) | Applied: `extractEventType()` updated |
| H3 | Deterministic workspace routing via audiencelab_pixels | Applied: `resolveWorkspace()` in superpixel/route.ts + migration |
| H4 | Content-Type enforcement + raw_headers capture | Applied: both webhook endpoints |
| H5 | 3MB body size limit | Applied: both webhook endpoints |
| H6 | updated_at trigger on audiencelab_identities | Already present in core migration |
| H7 | Slack notifications only for new leads (not identity-only) | Applied: processor only notifies when `is_new_lead=true` |
| H8 | Lead-worthiness policy (auth=always, others need score≥60 + biz email/phone) | Applied: `isLeadWorthy()` gate in processor |
| H9 | Import progress tracking via audiencelab_import_jobs | Applied: import/route.ts + hardening migration |
| H10 | Data normalization for multi-value fields | Already present in core field-map.ts |

---

## B) Final Implementation Spec

### Database Tables

#### `audiencelab_events` (append-only raw storage)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| received_at | TIMESTAMPTZ | DEFAULT now() |
| source | TEXT | CHECK: 'superpixel', 'audiencesync', 'export' |
| pixel_id | TEXT | From SuperPixel payloads |
| event_type | TEXT | page_view, authentication, etc. |
| hem_sha256 | TEXT | Hashed email (identity resolution key) |
| uid | TEXT | AL unique identifier |
| profile_id | TEXT | AL profile identifier |
| ip_address | TEXT | Visitor IP (SuperPixel only) |
| raw | JSONB NOT NULL | Complete original payload |
| raw_headers | JSONB | Captured inbound headers |
| processed | BOOLEAN | DEFAULT false |
| lead_id | UUID FK → leads | Set after processing |
| identity_id | UUID FK → identities | Set after processing |
| workspace_id | UUID FK → workspaces | |
| error | TEXT | Processing error message |

**Indexes**: (workspace_id, received_at), (hem_sha256), (source, processed)

#### `audiencelab_identities` (normalized identity profiles)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| uid | TEXT | AL unique identifier |
| profile_id | TEXT UNIQUE | AL profile identifier |
| hem_sha256 | TEXT | Hashed email |
| personal_emails | TEXT[] | Normalized email array |
| business_emails | TEXT[] | Normalized email array |
| phones | TEXT[] | Normalized phone array |
| primary_email | TEXT | Best email (by validation + freshness) |
| first_name | TEXT | |
| last_name | TEXT | |
| company_name | TEXT | |
| company_domain | TEXT | |
| job_title | TEXT | |
| address1 | TEXT | |
| city | TEXT | |
| state | TEXT | |
| zip | TEXT | |
| email_validation_status | TEXT | Best validation tier |
| email_last_seen | TIMESTAMPTZ | Most recent ESP sighting |
| skiptrace_match_by | TEXT | Phone verification source |
| deliverability_score | INTEGER | 0-100 computed score |
| raw_resolution | JSONB | Full resolution payload |
| first_seen_at | TIMESTAMPTZ | DEFAULT now() |
| last_seen_at | TIMESTAMPTZ | DEFAULT now() |
| visit_count | INTEGER | DEFAULT 1, incremented |
| lead_id | UUID FK → leads | Linked lead |
| workspace_id | UUID FK → workspaces | |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | Auto-trigger |

**Indexes**: (profile_id) UNIQUE, (hem_sha256), (workspace_id, last_seen_at), (primary_email), (lead_id)

#### `audiencelab_pixels` (pixel → workspace mapping)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| pixel_id | TEXT UNIQUE NOT NULL | AL pixel ID |
| workspace_id | UUID FK → workspaces | Target workspace |
| domain | TEXT | Domain for fallback routing |
| label | TEXT | Human-readable label |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

#### `audiencelab_import_jobs` (batch import tracking)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| workspace_id | UUID FK → workspaces | |
| audience_id | TEXT | AL audience identifier |
| file_url | TEXT | Source file URL |
| status | TEXT | CHECK: pending, processing, completed, failed |
| total_rows | INTEGER | DEFAULT 0 |
| processed_rows | INTEGER | DEFAULT 0 |
| failed_rows | INTEGER | DEFAULT 0 |
| error | TEXT | Error message |
| idempotency_hash | TEXT UNIQUE | SHA256(fileUrl|audienceId|workspaceId) |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**RLS**: All 4 tables have workspace_id-based isolation + service_role bypass.

---

### Endpoints

#### Webhook Endpoints (unauthenticated, secret-verified)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/webhooks/audiencelab/superpixel` | x-audiencelab-secret header | SuperPixel real-time events |
| POST | `/api/webhooks/audiencelab/audiencesync` | x-audiencelab-secret header | AudienceSync HTTP destination |

#### Authenticated Endpoints (Supabase session required)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/audiencelab/import` | Import batch export JSON file |
| GET | `/api/audiencelab/events` | Paginated event list (filters: start, end, source, processed, q) |
| GET | `/api/audiencelab/leads` | AL-sourced leads list (filters: start, end, q) |
| GET | `/api/audiencelab/identities` | Identity search (filter: q) |
| POST | `/api/audiencelab/replay/[eventId]` | Re-process a single event |

---

### Processing Pipeline

```
Inbound Event
  ↓
Webhook Handler (superpixel/audiencesync) OR Import Route
  ↓
Store raw → audiencelab_events (processed=false)
  ↓
Emit Inngest: audiencelab/event-received
  ↓
processAudienceLabEvent (async, throttle 50/min, retry 3x)
  ├── Step 1: Fetch raw event (skip if already processed)
  ├── Step 2: normalizeALPayload() → upsert audiencelab_identities
  │   └── Dedup priority: profile_id > uid > hem_sha256 > primary_email
  ├── Step 3: Lead upsert (with lead-worthiness gate)
  │   ├── If existing lead: update fields
  │   ├── If not lead-worthy: skip (return reason)
  │   ├── If duplicate: link identity to existing lead
  │   └── If new: insert lead, link identity
  ├── Step 4: Route lead (LeadRoutingService, new leads only)
  ├── Step 5: Notify (notifyNewLead, new leads only)
  └── Step 6: Mark processed, emit audiencelab/identity-updated
```

### Lead-Worthiness Policy

| Condition | Creates Lead? |
|-----------|:------------:|
| Event type: authentication, form_submission, all_form_submissions | Always |
| deliverability_score ≥ 60 AND (has business email OR has phone) | Yes |
| deliverability_score < 60 | No (identity-only) |
| No business email AND no phone (non-auth) | No (identity-only) |

### Deliverability Score (0-100)

| Component | Points | Rule |
|-----------|:------:|------|
| Validation status: Valid (ESP) | 40 | |
| Validation status: Valid | 30 | |
| Validation status: Catch-all | 15 | |
| Validation status: Unknown/Risky | 5 | |
| Validation status: Invalid/Bounce | 0 | |
| Last seen < 30 days | 30 | |
| Last seen < 90 days | 20 | |
| Last seen < 180 days | 10 | |
| Skiptrace match present | 15 | |
| Phone verified via skiptrace | 10 | |
| Has business email | 5 | |

### Workspace Resolution (SuperPixel)

Priority chain:
1. `pixel_id` → lookup in `audiencelab_pixels` table
2. Domain from `landing_url` → lookup in `audiencelab_pixels.domain`
3. Fallback → admin workspace (`workspaces.is_admin = true`)

---

### Env Vars Required

| Variable | Purpose | Where to Set |
|----------|---------|:------------:|
| `AUDIENCELAB_WEBHOOK_SECRET` | Verify inbound webhook authenticity | Vercel |
| `AUDIENCELAB_PIXEL_ID` | Optional default pixel ID | Vercel |
| `AUDIENCELAB_ACCOUNT_API_KEY` | Future API use (list audiences, export) | Vercel |

---

## C) Acceptance Tests

### Test 1: SuperPixel Authentication Event → Lead Created

```bash
curl -s -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/superpixel \
  -H "Content-Type: application/json" \
  -H "x-audiencelab-secret: $AUDIENCELAB_WEBHOOK_SECRET" \
  -d '{
    "pixel_id": "test-pixel",
    "event": "authentication",
    "email_raw": "jane@example.com",
    "hem_sha256": "abc123def456",
    "cookie_id": "cookie_001",
    "ip_address": "1.2.3.4",
    "landing_url": "https://meetcursive.com/pricing"
  }'
```

**Expected**: `{"success":true,"stored":1,"total":1}`
**Verify**: `audiencelab_events` has row with source='superpixel', processed=false. After Inngest runs: processed=true, identity created, lead created (auth events always create leads).

### Test 2: SuperPixel Enriched Page View → Identity Only (No Lead)

```bash
curl -s -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/superpixel \
  -H "Content-Type: application/json" \
  -H "x-audiencelab-secret: $AUDIENCELAB_WEBHOOK_SECRET" \
  -d '{
    "result": [{
      "pixel_id": "test-pixel",
      "event": "page_view",
      "hem_sha256": "xyz789",
      "uid": "user-001",
      "profile_id": "prof-001",
      "FIRST_NAME": "Bob",
      "LAST_NAME": "Smith",
      "PERSONAL_EMAILS": "bob@gmail.com",
      "PERSONAL_EMAIL_VALIDATION_STATUS": "unknown",
      "PERSONAL_CITY": "Austin",
      "STATE": "TX"
    }]
  }'
```

**Expected**: `{"success":true,"stored":1,"total":1}`
**Verify**: Identity created. No lead (deliverability_score < 60 for unknown status without skiptrace/business email). No Slack notification.

### Test 3: SuperPixel High-Quality Lead → Lead Created

```bash
curl -s -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/superpixel \
  -H "Content-Type: application/json" \
  -H "x-audiencelab-secret: $AUDIENCELAB_WEBHOOK_SECRET" \
  -d '{
    "result": [{
      "pixel_id": "test-pixel",
      "event": "deep_scroll",
      "hem_sha256": "highquality123",
      "profile_id": "prof-hq",
      "FIRST_NAME": "Alice",
      "LAST_NAME": "Johnson",
      "PERSONAL_EMAILS": "alice@gmail.com",
      "BUSINESS_EMAILS": "alice@acme.com",
      "PERSONAL_PHONE": "+15551234567",
      "PERSONAL_EMAIL_VALIDATION_STATUS": "Valid (Esp)",
      "PERSONAL_EMAIL_LAST_SEEN_BY_ESP_DATE": "2026-02-01",
      "SKIPTRACE_MATCH_BY": "phone",
      "COMPANY_NAME": "Acme Corp",
      "COMPANY_DOMAIN": "acme.com",
      "JOB_TITLE": "VP Marketing"
    }]
  }'
```

**Expected**: Deliverability score = 40 (Valid Esp) + 30 (seen <30d) + 15 (skiptrace) + 10 (phone verified) + 5 (business email) = 100. Lead-worthy (score≥60 + has business email). Lead created + Slack notification sent.

### Test 4: Duplicate Event → Idempotent

Send Test 3 payload again with same `profile_id: "prof-hq"`.

**Expected**: Identity updated (visit_count incremented, last_seen_at refreshed). Existing lead updated (not duplicated). No new Slack notification.

### Test 5: AudienceSync Row → Processed

```bash
curl -s -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/audiencesync \
  -H "Content-Type: application/json" \
  -H "x-audiencelab-secret: $AUDIENCELAB_WEBHOOK_SECRET" \
  -d '{
    "email": "sync@company.com",
    "first_name": "Sync",
    "last_name": "User",
    "company": "SyncCorp",
    "phone": "+15559876543"
  }'
```

**Expected**: `{"success":true,"stored":1,"total":1}`
**Verify**: Event stored with source='audiencesync'. Processor normalizes fields.

### Test 6: Invalid Secret → Rejected

```bash
curl -s -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/superpixel \
  -H "Content-Type: application/json" \
  -H "x-audiencelab-secret: wrong-secret" \
  -d '{"event":"test"}'
```

**Expected**: `{"error":"Unauthorized"}` with HTTP 401.

### Test 7: Wrong Content-Type → Rejected

```bash
curl -s -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/superpixel \
  -H "Content-Type: text/plain" \
  -H "x-audiencelab-secret: $AUDIENCELAB_WEBHOOK_SECRET" \
  -d '{"event":"test"}'
```

**Expected**: `{"error":"Content-Type must be application/json"}` with HTTP 415.

### Test 8: Batch Import → Events Stored + Processed

```bash
curl -s -X POST https://leads.meetcursive.com/api/audiencelab/import \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "fileUrl": "https://example.com/test-export.json",
    "audienceId": "aud-001"
  }'
```

**Expected**: `{"success":true,"job_id":"<uuid>","total_rows":<n>,"stored":<n>,...}`
**Verify**: `audiencelab_import_jobs` has row with status='completed'. Events inserted with source='export'.

---

## D) Smoke Runbook

### Prerequisites

1. **Env vars set in Vercel**:
   - `AUDIENCELAB_WEBHOOK_SECRET` — generate a random 32+ char string
   - `AUDIENCELAB_PIXEL_ID` — optional, get from AL dashboard
   - `AUDIENCELAB_ACCOUNT_API_KEY` — optional, for future API use

2. **Migrations applied**:
   ```bash
   # Run both migrations in order
   supabase db push
   # Or apply manually via Supabase dashboard SQL editor:
   # 1. 20260210_audiencelab_schema.sql
   # 2. 20260210_audiencelab_hardening.sql
   ```

3. **Deploy to Vercel**:
   ```bash
   git add -A && git commit -m "feat: Audience Labs integration" && git push
   ```

4. **Verify Inngest registration**:
   - Visit Inngest dashboard → Functions
   - Confirm `audiencelab-process-event` appears
   - Confirm it listens for `audiencelab/event-received`

### Smoke Test Sequence

#### Step 1: Verify webhook endpoint responds

```bash
# Should return 401 (no secret)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/superpixel \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 401
```

#### Step 2: Send test authentication event

```bash
curl -s -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/superpixel \
  -H "Content-Type: application/json" \
  -H "x-audiencelab-secret: $AUDIENCELAB_WEBHOOK_SECRET" \
  -d '{
    "pixel_id": "smoke-test",
    "event": "authentication",
    "email_raw": "smoketest@example.com",
    "cookie_id": "smoke-001",
    "ip_address": "127.0.0.1"
  }'
# Expected: {"success":true,"stored":1,"total":1}
```

#### Step 3: Verify event stored in DB

```sql
SELECT id, source, event_type, processed, workspace_id
FROM audiencelab_events
WHERE raw->>'email_raw' = 'smoketest@example.com'
ORDER BY received_at DESC
LIMIT 1;
-- Expected: source='superpixel', event_type='authentication', processed=false initially
```

#### Step 4: Wait for Inngest processing (~10-30s)

```sql
-- Check processing completed
SELECT id, processed, lead_id, identity_id, error
FROM audiencelab_events
WHERE raw->>'email_raw' = 'smoketest@example.com'
ORDER BY received_at DESC
LIMIT 1;
-- Expected: processed=true, lead_id IS NOT NULL (auth events always create leads)
```

#### Step 5: Verify identity created

```sql
SELECT id, primary_email, first_name, visit_count, lead_id
FROM audiencelab_identities
WHERE primary_email = 'smoketest@example.com'
LIMIT 1;
```

#### Step 6: Verify lead created

```sql
SELECT id, email, source, enrichment_status, delivery_status
FROM leads
WHERE email = 'smoketest@example.com' AND source = 'audiencelab'
LIMIT 1;
-- Expected: source='audiencelab', enrichment_status='completed'
```

#### Step 7: Test AudienceSync endpoint

```bash
curl -s -X POST https://leads.meetcursive.com/api/webhooks/audiencelab/audiencesync \
  -H "Content-Type: application/json" \
  -H "x-audiencelab-secret: $AUDIENCELAB_WEBHOOK_SECRET" \
  -d '{"email":"audisync-test@example.com","first_name":"Test"}'
# Expected: {"success":true,"stored":1,"total":1}
```

#### Step 8: Test internal API

```bash
# Requires authenticated session
curl -s https://leads.meetcursive.com/api/audiencelab/events?limit=5 \
  -H "Cookie: <session-cookie>"
# Expected: {"events":[...],"total":<n>,"page":1,"pageSize":5}
```

#### Step 9: Cleanup smoke test data

```sql
-- Optional: remove smoke test data
DELETE FROM audiencelab_events WHERE raw->>'email_raw' = 'smoketest@example.com';
DELETE FROM audiencelab_identities WHERE primary_email = 'smoketest@example.com';
DELETE FROM leads WHERE email = 'smoketest@example.com' AND source = 'audiencelab';
DELETE FROM audiencelab_events WHERE raw->>'email' = 'audisync-test@example.com';
```

### Audience Labs Dashboard Configuration

1. **SuperPixel webhook URL**:
   `https://leads.meetcursive.com/api/webhooks/audiencelab/superpixel`

2. **Webhook headers** (add in AL dashboard):
   - Key: `x-audiencelab-secret`
   - Value: (same value as `AUDIENCELAB_WEBHOOK_SECRET` env var)
   - Key: `Content-Type`
   - Value: `application/json`

3. **AudienceSync HTTP destination** (optional):
   - URL: `https://leads.meetcursive.com/api/webhooks/audiencelab/audiencesync`
   - Method: POST
   - Headers: same as above
   - Template: map AL fields to JSON keys (first_name, last_name, email, company, phone, etc.)

4. **Pixel-to-workspace mapping** (insert in DB):
   ```sql
   INSERT INTO audiencelab_pixels (pixel_id, workspace_id, domain, label)
   VALUES (
     'your-actual-pixel-id',        -- from AL dashboard
     'your-workspace-uuid',          -- from workspaces table
     'meetcursive.com',              -- domain where pixel is installed
     'Cursive Main Site'
   );
   ```

---

## E) Confirmed vs Discovery-Needed

### Confirmed (from docs + implementation)

| Item | Source | Notes |
|------|--------|-------|
| SuperPixel event types | AL docs | page_view, authentication, copy, exit_intent, deep_scroll, idle_user, video_engagement, all_clicks, file_downloads, all_form_submissions |
| Identity resolution chain | AL docs | cookie_id → maid_id → HEM (sha256) → uid → profile_id |
| Core data fields | AL docs | PERSONAL_EMAILS, BUSINESS_EMAILS, *_VALIDATION_STATUS, *_LAST_SEEN_BY_ESP_DATE, SKIPTRACE_MATCH_BY, PERSONAL_PHONE, MOBILE_PHONE_DNC |
| AudienceSync HTTP destination | AL docs | Mustache templated JSON with static headers |
| Enriched event payload nesting | Implementation | Handled: top-level, resolution.*, event_data.*, event.data.* |
| Multi-value fields are comma-separated | AL docs | PERSONAL_EMAILS, BUSINESS_EMAILS, phones |
| Webhook sends result[] wrapper | AL docs | SuperPixel wraps events in `{ result: [...] }` |
| API keys at app.audiencelab.io/account | AL docs | Write permission required |

### Discovery Needed (configure in AL dashboard / ask AL support)

| Item | Impact | Workaround |
|------|--------|------------|
| **Exact webhook signature mechanism** | We support both shared secret header AND HMAC signature fallback | Use `x-audiencelab-secret` shared secret for now |
| **Full enriched event field list** | We accept passthrough fields via `.passthrough()` Zod | Unknown fields stored in raw JSONB, accessible later |
| **Email validation status enum values** | We have: Valid (Esp), Valid, Catch-all, Unknown, Risky, Invalid, Bounce, Disposable | Unknown values default to score=5 (same as "unknown") |
| **List audiences / get file REST endpoints** | Batch importer accepts fileUrl — manual for now | User provides fileUrl from AL dashboard export |
| **Bundle export file format** | We handle: JSON array, `{ data: [...] }`, `{ results: [...] }` | Will adapt if new format discovered |
| **Programmatic pixel creation API** | Pixels must be manually created in AL dashboard + mapped in DB | Insert into `audiencelab_pixels` table manually |
| **AL webhook retry/delivery guarantees** | Our pipeline is idempotent (re-processing safe) | Replay endpoint available for manual re-processing |
| **Rate limits on AL side** | Our Inngest throttle is 50/min, webhook target is <250ms | Adjust throttle if AL sends higher volume |
| **Whether AL supports HMAC signatures** | We implement both patterns, active one depends on AL config | Shared secret header is the safe default |

---

## TypeScript Validation

All 13 new files pass TypeScript compilation with zero errors:
```
npx tsc --noEmit | grep audiencelab → (no output = no errors)
```

The only AL-related TS error is in the **old** `src/app/api/webhooks/audience-labs/route.ts` (pre-existing, not part of this integration). That file is superseded by the new webhook endpoints and can be removed when ready.
