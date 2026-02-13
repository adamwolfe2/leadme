# Tier 2 Audit Report - Critical Bugs Found

## 🔴 CRITICAL ISSUES (Must Fix Before Launch)

### 1. **Wrong Filter Type Used**
**File:** `src/app/api/audiencelab/database/search/route.ts:20`
**Issue:** Using `ALEnrichFilter` instead of `ALAudienceFilter`

```typescript
// ❌ WRONG
import { type ALEnrichFilter } from '@/lib/audiencelab/api-client'

// ✅ CORRECT
import { type ALAudienceFilter } from '@/lib/audiencelab/api-client'
```

**Impact:** ALEnrichFilter only has: email, first_name, last_name, company, phone, address
ALAudienceFilter has: industries, departments, seniority, sic, city, state (what we need!)

---

### 2. **fetchAudienceRecords Called Incorrectly**
**File:** `src/app/api/audiencelab/database/search/route.ts:122-126`
**Issue:** Function signature mismatch

```typescript
// ❌ CURRENT (WRONG)
const records = await fetchAudienceRecords({
  filters: audienceQuery,
  limit: maxRecords,
  offset: (params.page - 1) * params.limit,
})

// ✅ CORRECT
// Step 1: Create audience
const audience = await createAudience({
  filters: audienceQuery,
  name: `db-search-${Date.now()}`
})

// Step 2: Fetch records
const recordsResponse = await fetchAudienceRecords(
  audience.audienceId,
  params.page,
  maxRecords
)
const records = recordsResponse.data
```

**Impact:** Current code will fail with TypeScript error. Function expects (audienceId: string, page: number, pageSize: number) but we're passing an object.

---

### 3. **buildAudienceQuery() Is Empty**
**File:** `src/app/api/audiencelab/database/search/route.ts:250-263`
**Issue:** Function only handles `search` field, ignores all filter arrays

```typescript
// ❌ CURRENT (BROKEN)
function buildAudienceQuery(params: z.infer<typeof searchSchema>): ALEnrichFilter {
  const query: ALEnrichFilter = {}
  if (params.search) {
    query.company = params.search
  }
  return query
}

// ✅ CORRECT
function buildAudienceQuery(params: z.infer<typeof searchSchema>): ALAudienceFilter {
  const query: ALAudienceFilter = {}

  if (params.industries && params.industries.length > 0) {
    query.industries = params.industries
  }

  if (params.states && params.states.length > 0) {
    query.state = params.states
  }

  if (params.seniority_levels && params.seniority_levels.length > 0) {
    query.seniority = params.seniority_levels
  }

  if (params.job_titles && params.job_titles.length > 0) {
    query.departments = params.job_titles  // Map to departments
  }

  // Note: company_sizes not supported by ALAudienceFilter
  // Could use SIC codes instead

  return query
}
```

**Impact:** All filter selections are ignored! Users filter by industry/state but get random results.

---

### 4. **Preview Cost Calculation Wrong**
**File:** `src/app/api/audiencelab/database/search/route.ts:82`
**Issue:** Calculates cost for ALL matching leads, not just 25 being pulled

```typescript
// ❌ CURRENT (WRONG)
const totalCost = preview.count * creditCostPerLead
// If preview.count = 10,000, shows 5,000 credits!

// ✅ CORRECT
const maxPullable = Math.min(preview.count, 25)
const totalCost = maxPullable * creditCostPerLead
```

**Impact:** Shows incorrect (massive) credit cost, scares users away

---

### 5. **Credit Refund Doesn't Work**
**File:** `src/app/api/audiencelab/database/search/route.ts:183-188`
**Issue:** Refund restores original balance instead of adding credits back

```typescript
// ❌ CURRENT (WRONG)
await supabase
  .from('workspaces')
  .update({
    credits_balance: workspace.credits_balance, // Original balance (before deduction)
  })
  .eq('id', workspace.id)

// ✅ CORRECT
await supabase
  .from('workspaces')
  .update({
    credits_balance: workspace.credits_balance + actualCost, // Add back
  })
  .eq('id', workspace.id)
```

**Impact:** If lead insert fails, credits are lost forever (not refunded)

---

## 🟡 HIGH PRIORITY ISSUES

### 6. **No Duplicate Lead Check**
**File:** `src/app/api/audiencelab/database/search/route.ts:176-179`
**Issue:** Doesn't check if leads already exist before inserting

**Fix:** Add duplicate check by email + workspace_id
```typescript
// Before insert, filter out existing leads
const emails = records.map(r => r.BUSINESS_EMAIL || r.PERSONAL_EMAILS?.split(',')[0]).filter(Boolean)
const { data: existingLeads } = await supabase
  .from('leads')
  .select('email')
  .eq('workspace_id', workspace.id)
  .in('email', emails)

const existingEmails = new Set(existingLeads?.map(l => l.email))
const newRecords = records.filter(r => {
  const email = r.BUSINESS_EMAIL || r.PERSONAL_EMAILS?.split(',')[0]
  return email && !existingEmails.has(email)
})
```

**Impact:** Users can pay credits for leads they already own

---

### 7. **Race Condition on Credit Deduction**
**File:** `src/app/api/audiencelab/database/search/route.ts:108-146`
**Issue:** Between checking balance and deducting, another request could deplete credits

**Fix:** Use Postgres RPC with atomic transaction
```sql
CREATE OR REPLACE FUNCTION deduct_credits(
  p_workspace_id UUID,
  p_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_new_balance DECIMAL;
BEGIN
  UPDATE workspaces
  SET credits_balance = credits_balance - p_amount
  WHERE id = p_workspace_id AND credits_balance >= p_amount
  RETURNING credits_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;
```

**Impact:** Two concurrent requests could overdraw credits

---

### 8. **Fake Lead Score Shown**
**File:** `src/app/(app)/lead-database/page.tsx:289`
**Issue:** Shows random score (misleading)

```typescript
// ❌ CURRENT
<Badge variant="outline">
  Score: {Math.floor(Math.random() * 40) + 60}
</Badge>

// ✅ REMOVE or use real deliverability score
<Badge variant="outline">
  Verified
</Badge>
```

**Impact:** Misleading users with fake data

---

### 9. **Saved Segments Not Persisted**
**File:** `src/app/(app)/segment-builder/page.tsx:107`
**Issue:** Segments stored in component state, lost on page refresh

**Fix:** Create API endpoint + database table for saved segments
```sql
CREATE TABLE saved_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  last_count INTEGER,
  last_run TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Impact:** Users lose their work on page refresh

---

## 🟢 MEDIUM PRIORITY ISSUES

### 10. **Dollar Sign vs Credits**
**File:** `src/app/(app)/lead-database/page.tsx:248`
**Issue:** Shows "$" for credits (wrong currency)

```typescript
// ❌ CURRENT
<div className="text-xs text-muted-foreground">
  ${preview.credit_cost_per_lead}/lead × 25 leads
</div>

// ✅ CORRECT
<div className="text-xs text-muted-foreground">
  {preview.credit_cost_per_lead} credits/lead × 25 leads
</div>
```

---

### 11. **No Error Handling for AL API Structure**
**File:** `src/app/api/audiencelab/database/search/route.ts:75-93`
**Issue:** Assumes preview.count and preview.sample exist

**Fix:** Add validation
```typescript
const preview = await previewAudience({
  filters: audienceQuery,
})

if (!preview || typeof preview.count !== 'number') {
  throw new Error('Invalid AL API response')
}
```

---

## ✅ WORKSPACE ISOLATION VERIFIED

All database queries correctly use `user.workspace_id`:
- Line 59-63: Fetches workspace by user.workspace_id ✅
- Line 157-174: Sets workspace_id on inserted leads ✅
- Line 198-207: Logs credit_usage with workspace_id ✅
- RLS policies will enforce isolation ✅

**No cross-tenant issues found.**

---

## 📋 FIX PRIORITY ORDER

1. **Fix buildAudienceQuery()** - Filters currently do nothing
2. **Fix fetchAudienceRecords() call** - Code currently fails
3. **Fix preview cost calculation** - Shows wrong amounts
4. **Fix credit refund logic** - Credits lost on failure
5. **Add duplicate check** - Prevent paying for owned leads
6. **Remove fake scores** - Misleading data
7. **Fix $ to credits** - Clarity issue
8. **Persist saved segments** - UX improvement
9. **Add race condition protection** - Edge case safety

---

## ESTIMATED FIX TIME

- Critical fixes (1-5): ~2 hours
- High priority (6-9): ~3 hours
- Medium priority (10-11): ~1 hour

**Total: ~6 hours to production-ready**
