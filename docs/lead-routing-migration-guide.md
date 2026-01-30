# Lead Routing Migration Guide

**Migration**: `20260131000001_lead_routing_fixes.sql`
**Status**: Ready for deployment
**Risk Level**: Medium (requires database migration + service restart)
**Estimated Downtime**: 0 minutes (rolling deployment)

---

## Executive Summary

This migration implements atomic lead routing with retry queue and deduplication to fix 7 critical P0 security vulnerabilities:

1. ✅ Non-atomic rule evaluation (race conditions)
2. ✅ Missing retry mechanism for failed routing
3. ✅ No cross-partner deduplication
4. ✅ Double attribution bugs
5. ✅ No lead lifecycle management (timeouts)
6. ✅ RLS compliance gaps
7. ✅ No routing state tracking

**Key Changes**:
- New state machine: `pending → routing → routed → failed → expired`
- Atomic PostgreSQL functions using `FOR UPDATE SKIP LOCKED`
- Retry queue with exponential backoff (1min, 5min, 15min, 1hr)
- Cross-partner deduplication using SHA256 hashing
- 90-day lead TTL with auto-expiration
- Comprehensive audit logging

---

## Pre-Deployment Checklist

### 1. Database Backup

```bash
# Create full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_*.sql

# Test restore on staging
psql $STAGING_DATABASE_URL < backup_*.sql
```

### 2. Environment Variables

Verify these are set:

```bash
# Required
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Optional (monitoring)
DATADOG_API_KEY=...
SENTRY_DSN=...
```

### 3. Verify Migration File

```bash
# Check migration exists
ls -l supabase/migrations/20260131000001_lead_routing_fixes.sql

# Validate SQL syntax
psql $DATABASE_URL --dry-run < supabase/migrations/20260131000001_lead_routing_fixes.sql
```

### 4. Verify Test Coverage

```bash
# Run unit tests
pnpm test src/lib/services/__tests__/lead-routing.test.ts

# Run integration tests (requires test database)
SUPABASE_TEST_URL=$TEST_DATABASE_URL pnpm test:integration src/lib/services/__tests__/lead-routing.integration.test.ts
```

### 5. Stop Inngest Workers (Graceful Shutdown)

```bash
# Signal Inngest to stop accepting new jobs
curl -X POST https://api.inngest.com/v1/apps/$APP_ID/pause \
  -H "Authorization: Bearer $INNGEST_API_KEY"

# Wait for in-flight jobs to complete (max 5 minutes)
sleep 300
```

---

## Deployment Steps

### Step 1: Apply Database Migration (5 minutes)

```bash
# Connect to production database
psql $DATABASE_URL

-- Verify current state
SELECT COUNT(*) FROM leads WHERE routing_status IS NULL;

-- Apply migration
\i supabase/migrations/20260131000001_lead_routing_fixes.sql

-- Verify migration applied
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'leads' AND column_name = 'routing_status';

-- Verify functions created
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%routing%';

-- Verify RLS policies
SELECT policyname FROM pg_policies WHERE tablename IN ('lead_routing_queue', 'lead_routing_logs');

-- Verify data migration completed
SELECT routing_status, COUNT(*) FROM leads GROUP BY routing_status;
```

**Expected Output**:
```
 routing_status | count
----------------+-------
 routed         | 12450
 pending        |   123
```

### Step 2: Deploy Application Code (10 minutes)

```bash
# Build application
pnpm build

# Verify build succeeded
ls -l .next/

# Deploy to Vercel (or your platform)
vercel deploy --prod

# Or deploy via git push
git push origin main
```

### Step 3: Restart Inngest Workers (2 minutes)

```bash
# Resume Inngest job processing
curl -X POST https://api.inngest.com/v1/apps/$APP_ID/resume \
  -H "Authorization: Bearer $INNGEST_API_KEY"

# Verify new functions registered
curl https://api.inngest.com/v1/apps/$APP_ID/functions \
  -H "Authorization: Bearer $INNGEST_API_KEY" | jq '.functions[] | select(.name | contains("routing"))'
```

**Expected New Functions**:
- `processLeadRoutingRetryQueue` (cron: */5 * * * *)
- `cleanupStaleRoutingLocks` (cron: */10 * * * *)
- `markExpiredLeads` (cron: 0 2 * * *)
- `leadRoutingHealthCheck` (cron: 0 * * * *)
- `triggerLeadRoutingRetry` (event: lead/routing.retry.trigger)

### Step 4: Verify Deployment (5 minutes)

```bash
# 1. Health check
curl https://your-domain.com/api/health | jq '.routing'

# Expected:
# {
#   "status": "healthy",
#   "pendingCount": 123,
#   "routingCount": 5,
#   "failedCount": 2,
#   "retryQueueCount": 10
# }

# 2. Test atomic routing
curl -X POST https://your-domain.com/api/leads/route \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"leadId": "test-lead-id"}'

# 3. Verify retry queue processing
psql $DATABASE_URL -c "SELECT COUNT(*) FROM lead_routing_queue WHERE next_retry_at <= NOW();"

# 4. Check Inngest dashboard
# Visit: https://app.inngest.com/apps/$APP_ID/functions
# Verify: processLeadRoutingRetryQueue shows successful runs
```

---

## Rollback Procedures

### Quick Rollback (< 5 minutes)

If critical issues arise, rollback using this script:

```sql
-- rollback_20260131000001.sql

BEGIN;

-- 1. Drop new tables
DROP TABLE IF EXISTS lead_routing_logs CASCADE;
DROP TABLE IF EXISTS lead_routing_queue CASCADE;

-- 2. Drop new functions
DROP FUNCTION IF EXISTS acquire_routing_lock(UUID, UUID);
DROP FUNCTION IF EXISTS complete_routing(UUID, UUID, UUID, UUID);
DROP FUNCTION IF EXISTS fail_routing(UUID, TEXT, UUID, INTEGER);
DROP FUNCTION IF EXISTS release_stale_routing_locks();
DROP FUNCTION IF EXISTS generate_dedupe_hash(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS check_cross_partner_duplicate(VARCHAR, UUID);
DROP FUNCTION IF EXISTS mark_expired_leads();

-- 3. Remove columns from leads table
ALTER TABLE leads
  DROP COLUMN IF EXISTS routing_status,
  DROP COLUMN IF EXISTS routing_locked_by,
  DROP COLUMN IF EXISTS routing_locked_at,
  DROP COLUMN IF EXISTS routing_attempts,
  DROP COLUMN IF EXISTS routing_error,
  DROP COLUMN IF EXISTS routing_last_attempted_at,
  DROP COLUMN IF EXISTS dedupe_hash,
  DROP COLUMN IF EXISTS lead_expires_at;

-- 4. Drop enum
DROP TYPE IF EXISTS lead_routing_status;

-- 5. Drop indexes
DROP INDEX IF EXISTS idx_leads_routing_status;
DROP INDEX IF EXISTS idx_leads_routing_locked;
DROP INDEX IF EXISTS idx_leads_dedupe_hash;
DROP INDEX IF EXISTS idx_leads_expires_at;
DROP INDEX IF EXISTS idx_routing_queue_retry;
DROP INDEX IF EXISTS idx_routing_logs_lead;
DROP INDEX IF EXISTS idx_routing_logs_workspace;

COMMIT;
```

**Execute Rollback**:

```bash
# Backup current state first
pg_dump $DATABASE_URL > pre_rollback_backup_$(date +%Y%m%d_%H%M%S).sql

# Apply rollback
psql $DATABASE_URL < rollback_20260131000001.sql

# Verify rollback
psql $DATABASE_URL -c "\d leads"
# Should NOT show routing_status column

# Redeploy previous code version
git revert HEAD~2..HEAD  # Revert last 3 commits
git push origin main
vercel deploy --prod
```

### Application Rollback Only (No Database Changes)

If the issue is in application code, not the database:

```bash
# Revert to previous commit
git log --oneline -n 5
# Identify last good commit (before ef48bc3)

git revert ef48bc3 9f34d9f 5277db2
git push origin main

# Or use Vercel rollback
vercel rollback
```

### Partial Rollback (Keep Database, Disable Inngest)

If you want to keep the migration but pause retry processing:

```bash
# Pause Inngest workers
curl -X POST https://api.inngest.com/v1/apps/$APP_ID/pause \
  -H "Authorization: Bearer $INNGEST_API_KEY"

# Disable retry queue processing in code
# Set environment variable
DISABLE_ROUTING_RETRY=true

# Redeploy
vercel deploy --prod
```

---

## Post-Deployment Verification

### 1. Monitor Routing Health (First Hour)

```bash
# Watch retry queue
watch -n 30 'psql $DATABASE_URL -c "SELECT routing_status, COUNT(*) FROM leads GROUP BY routing_status;"'

# Monitor error rate
psql $DATABASE_URL -c "
SELECT
  DATE_TRUNC('minute', created_at) AS minute,
  routing_result,
  COUNT(*)
FROM lead_routing_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY minute, routing_result
ORDER BY minute DESC
LIMIT 10;
"
```

**Expected Results**:
- 95%+ success rate on `routing_result = 'success'`
- Retry queue processing every 5 minutes
- No stale locks (cleaned up every 10 minutes)

### 2. Verify Deduplication Working

```bash
# Test cross-partner duplicate detection
psql $DATABASE_URL -c "
SELECT
  dedupe_hash,
  COUNT(DISTINCT workspace_id) AS workspace_count,
  COUNT(*) AS lead_count
FROM leads
WHERE dedupe_hash IS NOT NULL
GROUP BY dedupe_hash
HAVING COUNT(DISTINCT workspace_id) > 1
LIMIT 10;
"
```

**Expected**: Should return duplicate leads flagged across workspaces

### 3. Check Inngest Execution Logs

Visit Inngest dashboard:
- https://app.inngest.com/apps/$APP_ID/functions/processLeadRoutingRetryQueue
- Verify: Runs every 5 minutes with 0 errors
- Check: Processed leads count > 0 if retry queue has items

### 4. Verify RLS Policies

```bash
# Test workspace isolation
psql $DATABASE_URL -c "
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'test-user-id';

-- Should only see leads from user's workspace
SELECT COUNT(*) FROM lead_routing_queue;
SELECT COUNT(*) FROM lead_routing_logs;
"
```

### 5. Load Test (Optional, Staging Only)

```bash
# Generate 1000 test leads
for i in {1..1000}; do
  curl -X POST https://staging.your-domain.com/api/leads \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test$i@example.com\", \"company\": \"Test $i\"}" &
done

# Wait for completion
wait

# Verify routing performance
psql $STAGING_DATABASE_URL -c "
SELECT
  routing_status,
  COUNT(*),
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) AS avg_seconds
FROM leads
WHERE created_at > NOW() - INTERVAL '10 minutes'
GROUP BY routing_status;
"
```

**Expected Performance**:
- Avg routing time: < 2 seconds
- 0 lock timeouts
- 0 duplicate workspace assignments

---

## Monitoring & Alerts

### Datadog Dashboards

Create dashboard with these queries:

```sql
-- Lead routing status distribution
SELECT routing_status, COUNT(*) FROM leads
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY routing_status;

-- Retry queue depth
SELECT COUNT(*) FROM lead_routing_queue WHERE next_retry_at <= NOW();

-- Stale lock count
SELECT COUNT(*) FROM leads
WHERE routing_locked_at < NOW() - INTERVAL '5 minutes'
AND routing_status = 'routing';

-- Routing success rate
SELECT
  routing_result,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS percentage
FROM lead_routing_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY routing_result;
```

### Alerts

Configure these alerts in Datadog/Sentry:

1. **Retry Queue Backlog** (WARNING)
   - Condition: `retry_queue_count > 100`
   - Action: Page on-call engineer

2. **Routing Failure Rate** (CRITICAL)
   - Condition: `routing_failure_rate > 10%` for 5 minutes
   - Action: Page on-call + auto-rollback trigger

3. **Stale Lock Count** (WARNING)
   - Condition: `stale_lock_count > 10`
   - Action: Slack notification to #engineering

4. **Expired Leads Spike** (INFO)
   - Condition: `expired_count > 50` in 1 hour
   - Action: Email to ops team

---

## Troubleshooting

### Issue 1: Migration Fails to Apply

**Symptoms**:
```
ERROR: column "routing_status" of relation "leads" already exists
```

**Solution**:
```sql
-- Check if partially applied
SELECT column_name FROM information_schema.columns
WHERE table_name = 'leads' AND column_name LIKE 'routing%';

-- If columns exist but functions don't, reapply functions only
-- Extract function creation from migration and run separately
```

### Issue 2: High Retry Queue Backlog

**Symptoms**: Retry queue count > 100 and not decreasing

**Solution**:
```bash
# Check Inngest function status
curl https://api.inngest.com/v1/apps/$APP_ID/functions/processLeadRoutingRetryQueue \
  -H "Authorization: Bearer $INNGEST_API_KEY"

# If paused, resume
curl -X POST https://api.inngest.com/v1/apps/$APP_ID/resume \
  -H "Authorization: Bearer $INNGEST_API_KEY"

# Manually trigger retry processing
curl -X POST https://your-domain.com/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "lead/routing.retry.trigger", "data": {"limit": 100}}'
```

### Issue 3: Duplicate Leads Across Workspaces

**Symptoms**: Same lead appearing in multiple partner workspaces

**Diagnosis**:
```sql
-- Find duplicates
SELECT
  dedupe_hash,
  ARRAY_AGG(id) AS lead_ids,
  ARRAY_AGG(workspace_id) AS workspace_ids,
  COUNT(DISTINCT workspace_id) AS workspace_count
FROM leads
WHERE dedupe_hash IS NOT NULL
GROUP BY dedupe_hash
HAVING COUNT(DISTINCT workspace_id) > 1;
```

**Solution**:
```sql
-- Verify duplicate detection function works
SELECT * FROM check_cross_partner_duplicate(
  'a1b2c3d4e5f6...',  -- test dedupe_hash
  'workspace-id'
);

-- If function returns results, check why routing didn't catch it
SELECT * FROM lead_routing_logs
WHERE lead_id IN (SELECT id FROM leads WHERE dedupe_hash = 'a1b2c3d4e5f6...')
ORDER BY created_at DESC;
```

### Issue 4: Stale Locks Not Cleaning Up

**Symptoms**: `stale_lock_count` stays > 0

**Solution**:
```sql
-- Manually release stale locks
SELECT release_stale_routing_locks();

-- Check cleanup cron status
SELECT * FROM cron.job WHERE jobname LIKE '%stale%';

-- Force run cleanup Inngest function
-- (via Inngest dashboard or API trigger)
```

---

## Success Criteria

✅ **Migration successful if**:
- All 7 PostgreSQL functions created
- All 3 tables created with RLS policies
- 100% of existing leads backfilled with `routing_status = 'routed'`
- Retry queue processing every 5 minutes
- Stale lock cleanup every 10 minutes
- Routing success rate > 95%
- No horizontal privilege escalation (RLS enforced)
- Integration tests pass 100%

---

## Contacts

**On-Call Engineers**:
- Primary: @adam (Slack: @adamwolfe)
- Secondary: @engineering-team

**Escalation**:
- Database issues: #db-oncall
- Inngest issues: support@inngest.com
- Security issues: #security-team

---

**Migration Created**: 2026-01-31
**Last Updated**: 2026-01-31
**Next Review**: After deployment
