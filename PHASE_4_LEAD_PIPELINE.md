# Phase 4: Lead Pipeline Documentation

## Overview

The Lead Pipeline automatically discovers, enriches, and delivers warm/hot leads to industry-specific platforms. The system runs daily background jobs to:

1. **Discover** companies with intent signals (via DataShopper)
2. **Score** leads as Hot, Warm, or Cold based on intent strength
3. **Enrich** leads with contact data (via Clay)
4. **Deliver** leads via email, Slack, webhooks
5. **Upload** hot/warm leads to industry-specific platforms

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DAILY CRON (2 AM)                            │
│                  Daily Lead Generation                           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Fetch Active Queries                                         │
│  2. Call DataShopper API with filters                            │
│  3. Calculate Intent Score (Hot/Warm/Cold)                       │
│  4. Insert Leads into Database                                   │
│  5. Trigger Enrichment Events                                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT: lead/enrich                            │
│                    Lead Enrichment                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Fetch Lead from Database                                     │
│  2. Call Clay API to Find Contacts                               │
│  3. Update Lead with Contact Data                                │
│  4. Trigger Delivery Event                                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EVENT: lead/deliver                            │
│                   Lead Delivery                                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Send Email (Resend)                                          │
│  2. Post to Slack (if configured)                                │
│  3. Send Webhook (if configured)                                 │
│  4. Trigger Platform Upload (Hot/Warm only)                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              EVENT: lead/upload-to-platform                      │
│                  Platform Upload                                 │
└─────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Group Leads by Intent Score                                  │
│  2. Format for Platform API                                      │
│  3. Upload to Industry Platform                                  │
│     - tech-platform (Salesforce, HubSpot)                        │
│     - finance-platform (Custom CRMs)                             │
│     - healthcare-platform (Industry-specific)                    │
│     - retail-platform (E-commerce systems)                       │
│     - marketing-platform (Marketing automation)                  │
│  4. Record Upload in Database                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Intent Scoring

### Score Levels

- **🔥 Hot**: 3+ high signals OR 2+ high + 3+ medium signals
- **⚡ Warm**: 1+ high signals OR 4+ medium signals
- **❄️ Cold**: Everything else

### Intent Signals (from DataShopper)

Examples of signals and their strengths:

| Signal Type | Strength | Description |
|------------|----------|-------------|
| Company researching topic | High | Direct indication of interest |
| Visited competitor website | High | Evaluating alternatives |
| Downloaded whitepaper | Medium | Learning about solutions |
| Attended webinar | Medium | Educating themselves |
| Social media engagement | Low | Passive interest |
| Job posting related to topic | Medium | Building capability |

### Scoring Logic

```typescript
function calculateIntentScore(signals: IntentSignal[]): 'hot' | 'warm' | 'cold' {
  const highSignals = signals.filter(s => s.signal_strength === 'high').length
  const mediumSignals = signals.filter(s => s.signal_strength === 'medium').length

  if (highSignals >= 3 || (highSignals >= 2 && mediumSignals >= 3)) {
    return 'hot'
  }

  if (highSignals >= 1 || mediumSignals >= 4) {
    return 'warm'
  }

  return 'cold'
}
```

## Platform Upload Strategy

### When to Upload

- **Hot Leads**: Immediately after enrichment
- **Warm Leads**: Immediately after enrichment
- **Cold Leads**: NOT uploaded (kept in database for nurturing)

### Platform Selection by Industry

```typescript
const platformMapping = {
  'Technology': 'tech-platform',        // Salesforce, HubSpot
  'Finance': 'finance-platform',        // Custom financial CRMs
  'Healthcare': 'healthcare-platform',  // HIPAA-compliant systems
  'Retail': 'retail-platform',          // E-commerce integrations
  'Marketing': 'marketing-platform',    // Marketing automation
  'Default': 'general-platform'         // Generic webhook
}
```

### Platform Upload Format

```json
{
  "id": "lead-uuid",
  "company_name": "Acme Corp",
  "domain": "acme.com",
  "industry": "Technology",
  "employee_count": 250,
  "revenue": 10000000,
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "United States"
  },
  "intent_score": "hot",
  "intent_signals": [
    {
      "signal_type": "Company researching AI tools",
      "signal_strength": "high",
      "detected_at": "2026-01-22T10:30:00Z",
      "source": "DataShopper"
    }
  ],
  "contacts": [
    {
      "full_name": "John Smith",
      "email": "john@acme.com",
      "title": "VP of Engineering",
      "seniority": "executive",
      "department": "Engineering"
    }
  ],
  "primary_contact": {
    "full_name": "John Smith",
    "email": "john@acme.com",
    "title": "VP of Engineering"
  },
  "created_at": "2026-01-22T02:15:00Z",
  "enriched_at": "2026-01-22T02:16:30Z"
}
```

## Inngest Functions

### 1. Daily Lead Generation

**Schedule**: Every day at 2 AM
**Function**: `daily-lead-generation`

```typescript
// Triggered by cron
{ cron: '0 2 * * *' }

// Process:
1. Fetch all active queries
2. For each query:
   - Build search params from filters
   - Call DataShopper API
   - Calculate intent scores
   - Insert leads
   - Trigger enrichment events
3. Update query.last_run_at
```

### 2. Lead Enrichment

**Trigger**: Event `lead/enrich`
**Function**: `lead-enrichment`

```typescript
// Triggered by event
{ event: 'lead/enrich' }

// Process:
1. Fetch lead from database
2. Call Clay API to find contacts
3. Update lead with contact_data
4. Mark enrichment_status = 'completed'
5. Trigger delivery event
```

### 3. Lead Delivery

**Trigger**: Event `lead/deliver`
**Function**: `lead-delivery`

```typescript
// Triggered by event
{ event: 'lead/deliver' }

// Process:
1. Fetch lead and workspace details
2. Send email via Resend
3. Post to Slack (if configured)
4. Send webhook (if configured)
5. Trigger platform upload (hot/warm only)
6. Mark delivery_status = 'delivered'
```

### 4. Platform Upload

**Trigger**: Event `lead/upload-to-platform`
**Function**: `platform-upload`

```typescript
// Triggered by event
{ event: 'lead/upload-to-platform' }

// Process:
1. Fetch leads with full data
2. Get platform credentials
3. Group leads by intent score
4. Format for platform API
5. Upload to industry platform
6. Record upload in database
7. Log billing event
```

### 5. Credit Reset

**Schedule**: Every day at midnight
**Function**: `credit-reset`

```typescript
// Triggered by cron
{ cron: '0 0 * * *' }

// Process:
Reset all users' daily_credits_used to 0
```

### 6. Weekly Trends

**Schedule**: Every Sunday at 3 AM
**Function**: `weekly-trends`

```typescript
// Triggered by cron
{ cron: '0 3 * * 0' }

// Process:
1. Calculate week start date
2. For each topic:
   - Get previous week volume
   - Calculate change percentage
   - Determine trend direction (up/down/stable)
   - Insert trend record
   - Update topic.trend_direction
```

## Database Schema Updates

### New Columns in `leads` Table

```sql
-- Intent data
intent_data JSONB DEFAULT NULL

-- Platform upload tracking
platform_uploaded BOOLEAN DEFAULT FALSE
platform_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
platform_name TEXT DEFAULT NULL
```

### Intent Data Structure

```json
{
  "score": "hot",
  "signals": [
    {
      "signal_type": "Company researching topic",
      "signal_strength": "high",
      "detected_at": "2026-01-22T10:30:00Z",
      "source": "DataShopper"
    }
  ],
  "last_updated": "2026-01-22T02:15:00Z"
}
```

### New Database Functions

```sql
-- Get leads by intent score
get_leads_by_intent_score(workspace_id, score)

-- Get platform upload stats
get_platform_upload_stats(workspace_id)

-- Get leads ready for upload
get_leads_ready_for_upload(workspace_id, min_score)
```

### New Views

```sql
-- Intent breakdown per workspace
lead_intent_breakdown
- workspace_id
- hot_count
- warm_count
- cold_count
- total_count
- hot_percentage
- warm_percentage
```

## API Integration

### DataShopper Client

```typescript
const dataShopperClient = new DataShopperClient()

// Search for companies with intent signals
const response = await dataShopperClient.searchCompanies({
  topic: 'AI automation tools',
  location: { country: 'United States', state: 'California' },
  companySize: { min: 50, max: 500 },
  industry: ['Technology'],
  limit: 50
})

// Calculate intent score
const intentScore = dataShopperClient.calculateIntentScore(
  company.intent_signals
)
```

### Clay Client

```typescript
const clayClient = new ClayClient()

// Enrich company with contacts
const result = await clayClient.enrichCompany({
  domain: 'acme.com',
  company_name: 'Acme Corp',
  filters: {
    job_titles: ['CEO', 'CTO', 'VP', 'Director'],
    seniority_levels: ['executive', 'director']
  },
  limit: 5
})

// Verify email
const verification = await clayClient.verifyEmail('john@acme.com')
```

## Testing

### Manual Triggers

Use admin API endpoints for testing:

```bash
# Trigger lead generation
curl -X POST http://localhost:3000/api/admin/trigger-lead-generation \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"query_id": "query-uuid"}'

# Trigger enrichment
curl -X POST http://localhost:3000/api/admin/trigger-enrichment \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"lead_id": "lead-uuid"}'
```

### Inngest Dashboard

1. Visit Inngest dashboard at `https://app.inngest.com`
2. View function execution history
3. Manually invoke functions for testing
4. Monitor retries and failures
5. Inspect event payloads

## Environment Variables

```bash
# DataShopper
DATASHOPPER_API_KEY=your_key
DATASHOPPER_API_URL=https://api.datashopper.com/v1

# Clay
CLAY_API_KEY=your_key
CLAY_API_URL=https://api.clay.com/v1

# Resend
RESEND_API_KEY=your_key

# Inngest
INNGEST_EVENT_KEY=your_key
INNGEST_SIGNING_KEY=your_key
```

## Monitoring & Alerts

### Key Metrics

1. **Lead Generation**
   - Total leads created per day
   - Leads per query
   - DataShopper API failures

2. **Enrichment**
   - Enrichment success rate
   - Average enrichment time
   - Clay API failures
   - Contacts found per lead

3. **Intent Scoring**
   - Hot lead percentage
   - Warm lead percentage
   - Cold lead percentage

4. **Platform Uploads**
   - Leads uploaded per platform
   - Upload success rate
   - Platform API failures

5. **Delivery**
   - Email delivery rate
   - Slack notification success
   - Webhook success rate

### Error Handling

All Inngest functions have:
- **Retries**: 3 attempts with exponential backoff
- **Error logging**: Full error details in Inngest dashboard
- **Graceful degradation**: Continue processing even if one channel fails

## Cost Optimization

### DataShopper

- Limit: 50 companies per query per day
- Annual cost estimate: Depends on active queries

### Clay

- Limit: 5 contacts per company
- Only enrich leads with valid domains
- Skip enrichment if company_data is incomplete

### Platform Uploads

- Only upload hot and warm leads (skip cold)
- Batch uploads when possible
- Rate limiting per platform

## Next Steps

1. Configure DataShopper and Clay API keys
2. Deploy database migration `20260101000007_add_intent_and_platform_fields.sql`
3. Register Inngest functions via `/api/inngest` endpoint
4. Configure platform integrations in workspace settings
5. Test with manual triggers
6. Monitor first automated run at 2 AM

---

**Last Updated**: 2026-01-22
**Phase Status**: ✅ Complete
