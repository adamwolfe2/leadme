# Phase 5: Lead Management UI Documentation

## Overview

The Lead Management UI provides a powerful data table interface built with TanStack Table for viewing, filtering, searching, and exporting leads. The interface includes real-time stats, intent score filtering, and a slide-out detail panel for in-depth lead inspection.

## Architecture

### Tech Stack

- **TanStack Table v8**: Headless table library for React
- **TanStack Query**: Server state management and caching
- **Headless UI**: Accessible dialog/modal components
- **Tailwind CSS**: Styling
- **Repository Pattern**: Database access abstraction

### Components Structure

```
src/
├── app/
│   ├── api/leads/
│   │   ├── route.ts                 # GET leads with filters & pagination
│   │   ├── export/route.ts          # POST CSV export
│   │   ├── stats/route.ts           # GET intent breakdown & platform stats
│   │   └── [id]/route.ts            # GET/DELETE single lead
│   └── (dashboard)/data/
│       └── page.tsx                 # Lead data page
├── components/leads/
│   ├── leads-table.tsx              # Main TanStack Table component
│   ├── leads-table-toolbar.tsx      # Filters, search, export button
│   ├── lead-detail-panel.tsx        # Slide-out detail view
│   └── lead-stats.tsx               # Intent breakdown stats
└── lib/repositories/
    └── lead.repository.ts           # Lead database access layer
```

## Features

### 1. Data Table

**Columns:**
- Company (name + domain)
- Intent Score (🔥 Hot / ⚡ Warm / ❄️ Cold)
- Industry
- Primary Contact (name, title, email)
- Enrichment Status (completed/pending/failed)
- Created Date
- Actions (View button)

**Features:**
- Server-side pagination (50 per page)
- Sorting by any column
- Real-time data with TanStack Query
- Row click opens detail panel
- Responsive design

### 2. Filtering & Search

**Filters:**
- **Global Search**: Search by company name or domain
- **Intent Score**: Filter by hot/warm/cold
- **Enrichment Status**: Filter by completed/pending/failed
- **Query ID**: Filter by specific query (via URL param)
- **Date Range**: Filter by creation date (via URL param)

**Clear Filters Button**: One-click reset of all filters

### 3. Lead Detail Panel

Slide-out panel from the right showing complete lead information:

**Company Information:**
- Name, domain, website
- Industry, employee count, revenue
- Location (city, state, country)
- Company description
- Link to visit website

**Contacts (up to 5 shown):**
- Full name, title
- Email address (with mailto link)
- LinkedIn profile link
- Email verification status badge
- Seniority and department

**Intent Signals:**
- Signal type and description
- Signal strength (high/medium/low)
- Detection date
- Source (DataShopper)

**Query Details:**
- Topic being tracked
- Category
- Query name

**Metadata:**
- Enrichment status
- Delivery status
- Created date
- Enriched date

### 4. Lead Statistics

**Intent Breakdown:**
- 🔥 Hot Leads count and percentage
- ⚡ Warm Leads count and percentage
- ❄️ Cold Leads count
- Total Leads count

**Platform Upload Stats:**
- Platform name (tech-platform, finance-platform, etc.)
- Hot leads uploaded
- Warm leads uploaded
- Total leads uploaded
- Last upload date

### 5. CSV Export

**Features:**
- Exports all leads matching current filters
- Background processing (doesn't block UI)
- Automatic file download
- Filename with date: `leads-export-2026-01-22.csv`

**CSV Columns:**
```csv
Company Name,Domain,Industry,Employee Count,Location,Intent Score,
Contact Name,Contact Email,Contact Title,Enrichment Status,Created Date,Query
```

**Export Button:**
- Located in toolbar
- Shows "Exporting..." state
- Respects all active filters

## API Endpoints

### GET /api/leads

List leads with filters and pagination.

**Query Parameters:**
```typescript
{
  query_id?: string          // Filter by query
  enrichment_status?: string // completed|pending|failed
  delivery_status?: string   // delivered|pending|failed
  intent_score?: string      // hot|warm|cold
  date_from?: string         // ISO date
  date_to?: string           // ISO date
  search?: string            // Company name or domain
  page?: string              // Page number (default: 1)
  per_page?: string          // Results per page (default: 50)
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company_data": {
        "name": "Acme Corp",
        "domain": "acme.com",
        "industry": "Technology",
        "employee_count": 250,
        "location": { "city": "SF", "state": "CA" }
      },
      "intent_data": {
        "score": "hot",
        "signals": [...]
      },
      "contact_data": {
        "primary_contact": {...},
        "contacts": [...]
      },
      "enrichment_status": "completed",
      "delivery_status": "delivered",
      "created_at": "2026-01-22T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 50,
    "total_pages": 3
  }
}
```

### GET /api/leads/stats

Get intent breakdown and platform upload statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "intent_breakdown": {
      "hot_count": 25,
      "warm_count": 50,
      "cold_count": 75,
      "total_count": 150,
      "hot_percentage": 16.7,
      "warm_percentage": 33.3
    },
    "platform_uploads": [
      {
        "platform_name": "tech-platform",
        "hot_leads": 20,
        "warm_leads": 35,
        "total_leads": 55,
        "last_upload": "2026-01-22T02:30:00Z"
      }
    ]
  }
}
```

### POST /api/leads/export

Export leads to CSV.

**Request Body:**
```json
{
  "filters": {
    "intent_score": "hot",
    "enrichment_status": "completed"
  }
}
```

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="leads-export-2026-01-22.csv"`
- Body: CSV file data

### GET /api/leads/[id]

Get single lead by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_data": {...},
    "contact_data": {...},
    "intent_data": {...},
    "queries": {
      "name": "AI automation tools",
      "global_topics": {
        "topic": "AI automation",
        "category": "Technology"
      }
    },
    ...
  }
}
```

### DELETE /api/leads/[id]

Delete lead by ID.

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

## Repository Methods

### LeadRepository

```typescript
class LeadRepository {
  // List leads with filters and pagination
  async findByWorkspace(
    workspaceId: string,
    filters: LeadFilters,
    page: number,
    perPage: number
  ): Promise<LeadListResult>

  // Get single lead by ID
  async findById(id: string, workspaceId: string): Promise<Lead | null>

  // Get leads by intent score
  async findByIntentScore(
    workspaceId: string,
    score: 'hot' | 'warm' | 'cold'
  ): Promise<Lead[]>

  // Get leads ready for platform upload
  async findReadyForUpload(
    workspaceId: string,
    minScore: 'warm' | 'hot'
  ): Promise<Lead[]>

  // Get intent breakdown statistics
  async getIntentBreakdown(workspaceId: string): Promise<IntentBreakdown>

  // Get platform upload statistics
  async getPlatformUploadStats(workspaceId: string): Promise<PlatformStats[]>

  // Export leads to CSV
  async exportToCSV(
    workspaceId: string,
    filters: LeadFilters
  ): Promise<string>

  // Create lead
  async create(lead: LeadInsert): Promise<Lead>

  // Update lead
  async update(
    id: string,
    workspaceId: string,
    lead: LeadUpdate
  ): Promise<Lead>

  // Delete lead
  async delete(id: string, workspaceId: string): Promise<void>
}
```

## Database Queries

### Filter Patterns

**Intent Score Filter:**
```sql
WHERE intent_data->>'score' = 'hot'
```

**Company Search:**
```sql
WHERE company_data->>'name' ILIKE '%search%'
   OR company_data->>'domain' ILIKE '%search%'
```

**Date Range:**
```sql
WHERE created_at >= '2026-01-01'
  AND created_at <= '2026-01-31'
```

### Database Functions Used

```sql
-- Get leads by intent score
SELECT * FROM get_leads_by_intent_score('workspace-id', 'hot');

-- Get leads ready for upload
SELECT * FROM get_leads_ready_for_upload('workspace-id', 'warm');

-- Get intent breakdown
SELECT * FROM lead_intent_breakdown WHERE workspace_id = 'workspace-id';

-- Get platform upload stats
SELECT * FROM get_platform_upload_stats('workspace-id');
```

## Performance Optimizations

### 1. Server-Side Pagination
- Only fetch 50 results at a time
- Total count calculated efficiently with Supabase `count: 'exact'`

### 2. TanStack Query Caching
- Automatic caching of lead lists
- Invalidation on mutations
- Stale-while-revalidate pattern

### 3. Database Indexes
```sql
-- Already exists from Phase 4 migration
CREATE INDEX idx_leads_intent_score ON leads ((intent_data->>'score'));
CREATE INDEX idx_leads_platform_uploaded ON leads (platform_uploaded, platform_uploaded_at);
```

### 4. JSONB Queries
- Use `->>` operator for text comparisons
- GIN indexes on JSONB columns for fast lookups

### 5. Select Only Needed Data
```typescript
// Include related data in single query
.select('*, queries(name, global_topics(topic, category))')
```

## User Experience

### Loading States
- Skeleton loading for stats cards
- "Loading leads..." message in table
- "Exporting..." button state during export

### Empty States
- "No leads found" message when filters return no results
- Clear instructions on how to create first query

### Error Handling
- API errors caught and displayed
- Export failures show alert
- Failed queries automatically retry (TanStack Query)

### Responsive Design
- Table scrolls horizontally on mobile
- Stats cards stack vertically on small screens
- Detail panel full-width on mobile

## Usage Examples

### Basic Lead Listing

```typescript
// In page component
<LeadsTable />
```

### Filtered Lead Listing

```typescript
// Filter by query from URL
const searchParams = await searchParams
<LeadsTable initialFilters={{
  query_id: searchParams.query_id
}} />
```

### Programmatic Export

```typescript
const handleExport = async () => {
  const response = await fetch('/api/leads/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters: {
        intent_score: 'hot',
        enrichment_status: 'completed'
      }
    })
  })

  const blob = await response.blob()
  // Download file...
}
```

### Get Lead Statistics

```typescript
const { data } = useQuery({
  queryKey: ['lead-stats'],
  queryFn: async () => {
    const res = await fetch('/api/leads/stats')
    return res.json()
  }
})

console.log(data.data.intent_breakdown.hot_count)
```

## Testing Checklist

- [ ] Table renders with leads
- [ ] Pagination works (next/previous)
- [ ] Sorting works on all columns
- [ ] Global search filters results
- [ ] Intent score filter works
- [ ] Enrichment status filter works
- [ ] Clear filters resets all filters
- [ ] Row click opens detail panel
- [ ] Detail panel shows all data correctly
- [ ] Contact list displays properly
- [ ] Intent signals render correctly
- [ ] CSV export downloads file
- [ ] Export respects active filters
- [ ] Stats cards show correct numbers
- [ ] Platform upload stats display
- [ ] Real-time updates work (TanStack Query)
- [ ] Mobile responsive layout
- [ ] Loading states appear correctly
- [ ] Error states handled gracefully

## Next Steps

1. **Real-time Updates**: Add Supabase real-time subscriptions for live lead updates
2. **Bulk Actions**: Add checkboxes for bulk delete/export
3. **Advanced Filters**: Add more filter options (location, employee count range)
4. **Lead Notes**: Allow users to add notes to leads
5. **Lead Assignment**: Assign leads to team members
6. **Lead Status**: Add custom lead statuses (contacted, qualified, closed)
7. **Activity Timeline**: Track all actions on a lead

## Performance Metrics

**Target Metrics:**
- Table render: < 100ms
- API response: < 500ms
- Export generation: < 5s for 1000 leads
- Detail panel open: < 50ms
- Filter application: < 200ms

**Monitoring:**
- TanStack Query devtools for cache inspection
- Network tab for API timing
- React DevTools Profiler for component performance

---

**Last Updated**: 2026-01-22
**Phase Status**: ✅ Complete
