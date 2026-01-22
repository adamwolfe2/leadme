# Phase 6: People Search Documentation

## Overview

The People Search feature allows users to find and connect with decision-makers at target companies. Emails are hidden by default and cost 1 credit to reveal, creating a sustainable credit-based monetization model.

## Architecture

### Credit System

**Free Plan:**
- 3 credits per day
- Resets at midnight UTC
- Enough to reveal 3 emails per day

**Pro Plan ($50/mo):**
- 1000 credits per day
- Resets at midnight UTC
- Enough for high-volume prospecting

**Credit Costs:**
- Email reveal: **1 credit**
- Search: **Free** (unlimited searches)
- Export: **1 credit per result**

### Data Flow

```
User fills search form (company domain + filters)
    ↓
POST /api/people-search
    ↓
PeopleSearchService.searchPeople()
    → Calls Clay API with filters
    → Returns contacts with emails masked
    ↓
Save results to people_search_results table
    → person_data.email_revealed = false
    → Store original email (encrypted)
    ↓
Display results with masked emails (jo**@ac**.com)
    ↓
User clicks "Reveal (1 credit)" button
    ↓
Check if user has credits available
    ↓
POST /api/people-search/reveal
    → Call reveal_person_email() database function
    → Atomically deduct 1 credit
    → Update person_data.email_revealed = true
    → Log to credit_usage table
    ↓
Return real email to frontend
    ↓
Display revealed email with mailto link
```

## Components Structure

```
src/
├── app/
│   ├── api/
│   │   ├── people-search/
│   │   │   ├── route.ts              # POST search, GET saved searches
│   │   │   └── reveal/route.ts       # POST reveal email (costs credit)
│   │   └── users/me/
│   │       └── route.ts              # GET current user + credits
│   └── (dashboard)/people-search/
│       └── page.tsx                  # Main people search page
├── components/people-search/
│   ├── search-form.tsx               # Search filters sidebar
│   ├── search-results.tsx            # Results table with reveal buttons
│   └── email-reveal-button.tsx       # Credit-based reveal button
├── lib/
│   ├── repositories/
│   │   └── people-search.repository.ts  # Database access layer
│   └── services/
│       └── people-search.service.ts     # Clay API integration
```

## Features

### 1. Search Form

**Required Filters:**
- Company Domain (e.g., acme.com) **OR** Company Name

**Optional Filters:**
- Job Title (e.g., VP of Engineering)
- Seniority Level (Entry Level, Manager, Director, VP, C-Level, Executive)
- Department (Engineering, Sales, Marketing, Product, etc.)
- Location (e.g., San Francisco, CA)

**Additional Options:**
- Save Search checkbox
- Search name input (when saving)

**Info Box:**
- Explains how search works
- Clarifies credit cost (1 credit per email reveal)
- Notes that search itself is free

### 2. Search Results Table

**Columns:**
- Name (full name + seniority badge)
- Title (job title + department)
- Company (company name)
- Location (city, state)
- Email (masked until revealed)
- Actions (LinkedIn link)

**Features:**
- Results count display
- Credits remaining indicator
- Empty state for no results
- LinkedIn profile links
- Hover effects on rows

### 3. Email Reveal System

**States:**
- **Hidden**: Email masked (jo**@ac**.com) with "Reveal (1 credit)" button
- **Revealing**: "Revealing..." loading state
- **Revealed**: Full email with mailto link + "Revealed" badge
- **No Credits**: Email masked with "No credits" badge (button disabled)

**Behavior:**
- Button only clickable if credits available
- Atomic credit deduction (database-level)
- Error handling for insufficient credits
- Local state update for instant UI feedback

### 4. Credits Display

**Header Banner:**
- Shows credits remaining today
- Links to pricing page
- Blue info box styling

**No Credits Warning:**
- Yellow warning box below results
- Explains credit reset at midnight
- Upgrade link to Pro plan

### 5. Saved Searches (Future Enhancement)

Planned features:
- Save searches with custom names
- Quick-access dropdown
- Re-run saved searches
- Delete saved searches

## API Endpoints

### POST /api/people-search

Search for people with filters.

**Request:**
```json
{
  "filters": {
    "domain": "acme.com",
    "job_title": "VP of Engineering",
    "seniority": "executive",
    "department": "engineering",
    "location": "San Francisco"
  },
  "save_search": true,
  "search_name": "Acme VPs"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "workspace_id": "uuid",
        "person_data": {
          "full_name": "John Smith",
          "email": "jo**@ac**.com",
          "email_revealed": false,
          "title": "VP of Engineering",
          "seniority": "executive",
          "department": "Engineering",
          "company_name": "Acme Corp",
          "location": "San Francisco, CA",
          "linkedin_url": "https://linkedin.com/in/johnsmith"
        },
        "search_filters": {...},
        "created_at": "2026-01-22T10:30:00Z"
      }
    ],
    "count": 1
  }
}
```

### GET /api/people-search

Get saved searches.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "name": "Acme VPs",
      "filters": {...},
      "created_at": "2026-01-22T10:00:00Z"
    }
  ]
}
```

### POST /api/people-search/reveal

Reveal email (costs 1 credit).

**Request:**
```json
{
  "result_id": "uuid"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "email": "john@acme.com",
    "credits_remaining": 99
  },
  "message": "Email revealed. 99 credits remaining today."
}
```

**Response (Insufficient Credits):**
```json
{
  "error": "Insufficient credits",
  "message": "You have reached your daily credit limit. Upgrade to Pro for more credits or wait for the daily reset at midnight."
}
```

### GET /api/users/me

Get current user info including credits.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "workspace_id": "uuid",
    "role": "owner",
    "plan": "free",
    "daily_credit_limit": 3,
    "daily_credits_used": 1,
    "credits_remaining": 2
  }
}
```

## Database Schema

### people_search_results Table

```sql
CREATE TABLE people_search_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  person_data JSONB NOT NULL,
  search_filters JSONB NOT NULL,
  revealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**person_data JSONB Structure:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "full_name": "John Smith",
  "email": "john@acme.com",
  "email_revealed": false,
  "phone": "+1-555-0123",
  "title": "VP of Engineering",
  "seniority": "executive",
  "department": "Engineering",
  "company_name": "Acme Corp",
  "company_domain": "acme.com",
  "location": "San Francisco, CA",
  "linkedin_url": "https://linkedin.com/in/johnsmith"
}
```

### saved_searches Table

```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### credit_usage Table

```sql
CREATE TABLE credit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  user_id UUID NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Action Types:**
- `email_reveal`
- `export_people`
- `export_leads`

## Database Functions

### reveal_person_email()

Atomically reveals email and deducts 1 credit.

```sql
CREATE FUNCTION reveal_person_email(
  p_result_id UUID,
  p_user_id UUID
) RETURNS JSONB;
```

**Behavior:**
1. Check if user has credits available
2. If no credits, throw error
3. Update person_data.email_revealed = true
4. Increment user.daily_credits_used by 1
5. Insert into credit_usage table
6. Return email and credits_remaining

**Error Handling:**
- Throws "Insufficient credits" if user at limit
- Transaction ensures atomicity

### check_credits_available()

Checks if user has sufficient credits.

```sql
CREATE FUNCTION check_credits_available(
  p_user_id UUID,
  p_credits_needed INTEGER DEFAULT 1
) RETURNS BOOLEAN;
```

## Clay API Integration

### People Search Service

```typescript
class PeopleSearchService {
  async searchPeople(
    filters: PeopleSearchFilters,
    limit: number = 50
  ): Promise<PersonResult[]>

  async verifyEmail(email: string): Promise<boolean>

  maskEmail(email: string): string
  // "john@acme.com" → "jo**@ac**.com"

  calculateExportCost(resultsCount: number): number
  // Returns number of credits needed for export
}
```

### Clay API Methods Used

```typescript
// Find contacts at a company
clayClient.findContacts(domain: string, filters?: {
  job_titles?: string[]
  seniority_levels?: string[]
  departments?: string[]
  locations?: string[]
}): Promise<ClayContact[]>

// Verify email address
clayClient.verifyEmail(email: string): Promise<{
  valid: boolean
  reason?: string
}>
```

## Email Masking Algorithm

```typescript
function maskEmail(email: string): string {
  const [username, domain] = email.split('@')

  // Show first 2 chars of username
  const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2)

  // Show first char of domain
  const [domainName, tld] = domain.split('.')
  const maskedDomain = domainName.charAt(0) + '*'.repeat(domainName.length - 1)

  return `${maskedUsername}@${maskedDomain}.${tld}`
}

// Examples:
// "john@acme.com" → "jo**@a***.com"
// "jane.doe@example.org" → "ja******@e******.org"
// "ceo@xyz.com" → "ce*@x**.com"
```

## Security Considerations

### 1. Credit System Integrity

**Atomic Operations:**
- All credit deductions use database functions
- Transactions ensure consistency
- No race conditions possible

**Validation:**
- Check credits before reveal
- Verify workspace access
- Validate result ownership

### 2. Email Protection

**Before Reveal:**
- Emails stored but never sent to frontend
- Masked version generated server-side
- No client-side access to real email

**After Reveal:**
- Marked as revealed in database
- Credit deducted atomically
- Logged in credit_usage table

### 3. Rate Limiting

**API Protection:**
- Credit system naturally rate-limits
- Additional rate limiting on search endpoint
- Prevent abuse of free searches

### 4. Multi-Tenant Isolation

**RLS Policies:**
- All queries filtered by workspace_id
- No cross-workspace data leakage
- User access validated on every request

## Performance Optimizations

### 1. Search Performance

**Clay API:**
- Limit results to 50 per search
- Cache common company searches
- Batch API requests when possible

### 2. Database Queries

**Indexes:**
```sql
CREATE INDEX idx_people_search_workspace ON people_search_results(workspace_id);
CREATE INDEX idx_people_search_revealed ON people_search_results(revealed_at);
CREATE INDEX idx_credit_usage_workspace ON credit_usage(workspace_id, created_at);
```

### 3. Frontend Performance

**React Optimizations:**
- Lazy loading of search results
- Optimistic UI updates on reveal
- Local state for revealed emails
- Debounced credit refetch

## User Experience

### 1. Loading States

- "Searching..." during API call
- "Revealing..." during email reveal
- Skeleton loaders for initial credits fetch

### 2. Error Handling

- Clear error messages for API failures
- Credit limit warnings
- Network error retry prompts

### 3. Empty States

- "No results yet" before first search
- Instructions on how to search
- Tips for better results

### 4. Success Feedback

- "Email revealed" toast notification
- Credits remaining update
- Green "Revealed" badge on button

## Testing Checklist

- [ ] Search returns results from Clay API
- [ ] Emails are masked in results
- [ ] Reveal button costs 1 credit
- [ ] Revealed email shows with mailto link
- [ ] Credits remaining updates after reveal
- [ ] No credits state disables reveal buttons
- [ ] Insufficient credits error displays
- [ ] Search form validation works
- [ ] Save search functionality works
- [ ] Saved searches list displays
- [ ] LinkedIn links open in new tab
- [ ] Mobile responsive layout
- [ ] Credits fetch on page load
- [ ] Error states display correctly
- [ ] Empty state shows before search

## Next Steps

1. **Saved Searches UI**: Add dropdown to quick-access saved searches
2. **Export Feature**: CSV export of search results (costs credits)
3. **Search History**: Track all past searches
4. **Bulk Reveal**: Reveal multiple emails at once (with credit preview)
5. **Email Verification**: Show verification badge on revealed emails
6. **Advanced Filters**: Company size, revenue, industry
7. **Real-time Updates**: Supabase real-time for credit changes

---

**Last Updated**: 2026-01-22
**Phase Status**: ✅ Complete
