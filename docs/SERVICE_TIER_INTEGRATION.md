# Service Tier Backend Integration

**Date:** 2026-02-03
**Author:** Claude Sonnet 4.5
**Status:** ✅ Implemented

## Overview

This document describes the complete integration of service subscriptions into the backend tier checking system (`src/lib/tier/server.ts`).

## Problem Solved

**Before:** Backend API protection only checked legacy `workspace_tiers` → `product_tiers` system. Users with service subscriptions (Cursive Data, Outbound, Pipeline, Studio) could be denied access to features they paid for.

**After:** Backend now checks both systems with proper precedence, ensuring service subscription customers get correct feature access.

---

## Architecture

### Tier Precedence (Priority Order)

```
1. Service Subscriptions (service_subscriptions → service_tiers)
   ↓ If not found
2. Product Tiers (workspace_tiers → product_tiers)
   ↓ If not found
3. Free Tier (default)
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  API Route (e.g., POST /api/campaigns)                  │
│  await requireFeature(workspaceId, 'campaigns')         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  getWorkspaceTier(workspaceId)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Query service_subscriptions (status = 'active')    │
│     JOIN service_tiers                                 │
│     → Extract platform_features                        │
│                                                         │
│  2. If not found, query workspace_tiers                │
│     JOIN product_tiers                                 │
│     → Extract features                                 │
│                                                         │
│  3. If not found, return free tier defaults           │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Return WorkspaceTierInfo                               │
│  {                                                      │
│    tierSlug: 'cursive-outbound'                        │
│    tierName: 'Cursive Outbound'                        │
│    features: { campaigns: true, ... }                  │
│    dailyLeadLimit: 200                                 │
│    source: 'service_tier' ← for debugging             │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Feature Mapping

### Service Tier `platform_features` → `ProductTierFeatures`

The system maps service tier features to the existing `ProductTierFeatures` interface for compatibility:

| platform_features | Maps To | Logic |
|-------------------|---------|-------|
| `campaigns: true` | `campaigns: true`<br>`templates: true`<br>`max_campaigns: -1`<br>`max_templates: -1` | Templates always enabled with campaigns<br>Unlimited = -1 |
| `ai_agents: true` | `ai_agents: true` | Direct mapping |
| `api_access: true` | `api_access: true`<br>`integrations: true` | Integrations enabled with API |
| `team_seats: 5` | `team_members: 5` | Direct mapping (-1 = unlimited) |
| `daily_lead_limit: 200` | `dailyLeadLimit: 200` | -1 = unlimited (converted to 999999) |
| `white_label: true` | `white_label: true` | Enterprise feature |
| `custom_integrations: true` | `custom_domains: true` | Enterprise feature |
| (any service tier) | `dedicated_support: true` | All service tiers get support |

### Example: Cursive Outbound

**Input** (from `service_tiers.platform_features`):
```json
{
  "campaigns": true,
  "ai_agents": true,
  "api_access": false,
  "team_seats": 5,
  "lead_downloads": true,
  "daily_lead_limit": 200
}
```

**Output** (`ProductTierFeatures`):
```typescript
{
  campaigns: true,
  templates: true,        // Auto-enabled with campaigns
  ai_agents: true,
  api_access: false,
  integrations: false,    // Follows api_access
  team_members: 5,
  max_campaigns: -1,      // Unlimited
  max_templates: -1,      // Unlimited
  max_email_accounts: -1, // Unlimited with campaigns
  white_label: false,
  custom_domains: false,
  dedicated_support: true, // All service tiers
  people_search: true      // Always available
}
```

---

## Code Changes

### Updated Functions

#### `getWorkspaceTier(workspaceId: string)`
- **Before:** Only queried `workspace_tiers` → `product_tiers`
- **After:** Queries both systems with precedence logic
- **New:** Returns `source` field for debugging ('service_tier' | 'product_tier' | 'free')

#### `WorkspaceTierInfo` Interface
**Added fields:**
```typescript
interface WorkspaceTierInfo {
  // ... existing fields
  source: 'service_tier' | 'product_tier' | 'free' // NEW: Which system provided tier
  serviceTierId?: string  // NEW: Service tier ID if active
  productTierId?: string  // NEW: Product tier ID if active
}
```

#### `mapServiceTierFeatures(platformFeatures)`
**New helper function** that maps service tier `platform_features` JSONB to `ProductTierFeatures` using the same logic as `/api/workspace/tier` for consistency.

---

## Testing

### Automated Test Suite

**File:** `scripts/test-tier-integration.ts`

**Run:** `npx tsx scripts/test-tier-integration.ts`

**Tests:**
1. ✅ Cursive Data tier features are correct
2. ✅ Cursive Outbound tier enables campaigns + AI agents
3. ✅ Cursive Pipeline tier has unlimited leads
4. ✅ No subscription defaults to free tier
5. ✅ Service tier takes precedence over product tier

### Manual Testing

**Test Case 1: Service Subscription Customer**
```bash
# Create test subscription in database
INSERT INTO service_subscriptions (workspace_id, service_tier_id, status, monthly_price)
VALUES ('[workspace-id]', '[tier-id]', 'active', 2500);

# Test API route
curl -X POST https://leads.meetcursive.com/api/campaigns \
  -H "Authorization: Bearer [token]" \
  -d '{"name": "Test Campaign"}'

# Expected: 200 OK (campaigns enabled for Cursive Outbound)
```

**Test Case 2: Free Tier User**
```bash
# Test without subscription
curl -X POST https://leads.meetcursive.com/api/campaigns \
  -H "Authorization: Bearer [token]" \
  -d '{"name": "Test Campaign"}'

# Expected: 403 Forbidden
# Response: { "error": "This feature requires an upgrade...", "code": "FEATURE_NOT_AVAILABLE" }
```

---

## Logging & Debugging

### Console Logs

The system now logs tier checking operations:

```typescript
// When service tier found
[TierCheck] Workspace abc123 using SERVICE TIER: cursive-outbound

// When product tier found (fallback)
[TierCheck] Workspace abc123 using PRODUCT TIER: pro

// When no tier found
[TierCheck] Workspace abc123 using FREE TIER (no subscription found)

// Feature granted
[TierCheck] Feature 'campaigns' granted for workspace abc123

// Feature denied
[TierCheck] Feature 'campaigns' denied for workspace abc123 (tier: free, source: free)

// Limit exceeded
[TierCheck] Limit exceeded for workspace abc123: campaigns (used: 5, limit: 3)
```

### Debugging Tips

1. **Check which tier system is active:**
   ```typescript
   const tier = await getWorkspaceTier(workspaceId)
   console.log(tier.source) // 'service_tier', 'product_tier', or 'free'
   ```

2. **Verify service subscription:**
   ```sql
   SELECT ss.*, st.name, st.platform_features
   FROM service_subscriptions ss
   JOIN service_tiers st ON st.id = ss.service_tier_id
   WHERE ss.workspace_id = '[workspace-id]'
   AND ss.status = 'active';
   ```

3. **Check feature mapping:**
   - Service tier features are in `service_tiers.platform_features` (JSONB)
   - Product tier features are in `product_tiers.features` (JSONB)
   - Both get mapped to `ProductTierFeatures` interface

---

## Migration Guide

### For Existing Customers

**Scenario 1: User has both product tier AND service subscription**
- ✅ Service subscription takes precedence
- ✅ Gets all features from service tier
- ✅ Product tier is ignored (but not deleted)

**Scenario 2: User has only product tier (legacy)**
- ✅ Product tier continues to work
- ✅ No migration needed
- ✅ Can upgrade to service subscription later

**Scenario 3: User has only service subscription (new customer)**
- ✅ Service tier works immediately
- ✅ No workspace_tier entry needed

### Backward Compatibility

- ✅ All existing code continues to work
- ✅ No breaking changes to API contracts
- ✅ Frontend `/api/workspace/tier` already handled both systems
- ✅ Backend now matches frontend behavior

---

## Performance Considerations

### Query Optimization

**Before:**
- 1 query: `workspace_tiers` JOIN `product_tiers`

**After:**
- 1 query: `service_subscriptions` JOIN `service_tiers` (if found, stop)
- 1 query: `workspace_tiers` JOIN `product_tiers` (only if service not found)

**Impact:** Minimal (adds 1 query only when service tier exists, which becomes primary system)

### Caching Recommendations

Consider caching `getWorkspaceTier()` results:
```typescript
// Cache for 5 minutes
const cacheKey = `tier:${workspaceId}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const tier = await getWorkspaceTier(workspaceId)
await redis.setex(cacheKey, 300, JSON.stringify(tier))
return tier
```

---

## Error Handling

### Custom Errors

Both errors include structured data for client-side handling:

**FeatureNotAvailableError:**
```typescript
{
  error: "This feature requires an upgrade from your Free plan.",
  code: "FEATURE_NOT_AVAILABLE",
  feature: "campaigns",
  currentTier: "free"
}
```

**LimitExceededError:**
```typescript
{
  error: "You've reached your limit of 5 campaigns.",
  code: "LIMIT_EXCEEDED",
  resource: "campaigns",
  used: 5,
  limit: 5
}
```

---

## Security Considerations

### Row-Level Security (RLS)

Service subscriptions are protected by RLS policies:

```sql
-- Users can only see their workspace's subscriptions
CREATE POLICY "Users can view their workspace subscriptions"
ON service_subscriptions FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM users
  WHERE auth_user_id = auth.uid()
));
```

### Authentication

All tier checking functions assume authenticated context:
- Called from API routes with `getCurrentUser()`
- Workspace ID verified against authenticated user
- No direct user input to tier checking

---

## Future Enhancements

### Possible Improvements

1. **Add caching layer** (Redis/in-memory)
2. **Add telemetry** for feature usage tracking
3. **Add tier change webhooks** (notify when subscription changes)
4. **Add feature usage analytics** (which features are used most)
5. **Implement soft limits** (warnings before hard limit)

### Feature Flag System

Consider migrating to feature flag system like LaunchDarkly for more granular control:
```typescript
// Instead of tier-based
if (await hasFeature('campaigns')) { ... }

// Use feature flags
if (await featureFlag('campaigns', workspaceId)) { ... }
```

---

## Support & Troubleshooting

### Common Issues

**Issue:** "User has service subscription but feature denied"
- Check subscription status is 'active'
- Verify `service_tiers.platform_features` JSON structure
- Check console logs for tier detection

**Issue:** "Service tier not taking precedence"
- Verify subscription status = 'active' (not 'onboarding' or 'pending_payment')
- Check database query order in `getWorkspaceTier()`

**Issue:** "Features not mapping correctly"
- Review `mapServiceTierFeatures()` logic
- Ensure consistency with `/api/workspace/tier`

### Customer Support Scripts

**Check customer's active tier:**
```sql
SELECT
  w.name as workspace_name,
  COALESCE(st.name, pt.name, 'Free') as tier_name,
  CASE
    WHEN ss.id IS NOT NULL THEN 'service_tier'
    WHEN wt.id IS NOT NULL THEN 'product_tier'
    ELSE 'free'
  END as source
FROM workspaces w
LEFT JOIN service_subscriptions ss ON ss.workspace_id = w.id AND ss.status = 'active'
LEFT JOIN service_tiers st ON st.id = ss.service_tier_id
LEFT JOIN workspace_tiers wt ON wt.workspace_id = w.id
LEFT JOIN product_tiers pt ON pt.id = wt.product_tier_id
WHERE w.id = '[workspace-id]';
```

---

## Conclusion

The service tier integration is now complete and production-ready. Backend feature gating now correctly handles service subscriptions with proper precedence and feature mapping.

**Status:** ✅ Implemented, Tested, Documented
**Deployment:** Ready for production
**Backward Compatible:** Yes
**Breaking Changes:** None
