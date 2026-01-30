/**
 * Rollback Script for Migration 20260131000001
 *
 * EMERGENCY ROLLBACK ONLY - Use if critical issues arise
 *
 * WARNING: This will:
 * - Delete all routing queue entries
 * - Delete all routing logs (audit trail)
 * - Remove routing state from leads table
 * - Revert to previous non-atomic routing
 *
 * BEFORE RUNNING:
 * 1. Create backup: pg_dump $DATABASE_URL > pre_rollback_backup.sql
 * 2. Pause Inngest workers
 * 3. Notify engineering team
 * 4. Document reason for rollback
 */

BEGIN;

-- ============================================================
-- STEP 1: Drop RLS Policies
-- ============================================================

DROP POLICY IF EXISTS "workspace_isolation_queue_select" ON lead_routing_queue;
DROP POLICY IF EXISTS "workspace_isolation_queue_insert" ON lead_routing_queue;
DROP POLICY IF EXISTS "workspace_isolation_queue_update" ON lead_routing_queue;
DROP POLICY IF EXISTS "workspace_isolation_queue_delete" ON lead_routing_queue;

DROP POLICY IF EXISTS "workspace_isolation_logs_select" ON lead_routing_logs;
DROP POLICY IF EXISTS "workspace_isolation_logs_insert" ON lead_routing_logs;

-- ============================================================
-- STEP 2: Drop Tables (will delete all data)
-- ============================================================

-- Drop routing logs (audit trail - consider backing up first)
DROP TABLE IF EXISTS lead_routing_logs CASCADE;

-- Drop retry queue
DROP TABLE IF EXISTS lead_routing_queue CASCADE;

-- ============================================================
-- STEP 3: Drop Functions
-- ============================================================

DROP FUNCTION IF EXISTS acquire_routing_lock(UUID, UUID);
DROP FUNCTION IF EXISTS complete_routing(UUID, UUID, UUID, UUID);
DROP FUNCTION IF EXISTS fail_routing(UUID, TEXT, UUID, INTEGER);
DROP FUNCTION IF EXISTS release_stale_routing_locks();
DROP FUNCTION IF EXISTS generate_dedupe_hash(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS check_cross_partner_duplicate(VARCHAR, UUID);
DROP FUNCTION IF EXISTS mark_expired_leads();

-- ============================================================
-- STEP 4: Drop Indexes on Leads Table
-- ============================================================

DROP INDEX IF EXISTS idx_leads_routing_status;
DROP INDEX IF EXISTS idx_leads_routing_locked;
DROP INDEX IF EXISTS idx_leads_dedupe_hash;
DROP INDEX IF EXISTS idx_leads_expires_at;

-- ============================================================
-- STEP 5: Remove Columns from Leads Table
-- ============================================================

ALTER TABLE leads
  DROP COLUMN IF EXISTS routing_status,
  DROP COLUMN IF EXISTS routing_locked_by,
  DROP COLUMN IF EXISTS routing_locked_at,
  DROP COLUMN IF EXISTS routing_attempts,
  DROP COLUMN IF EXISTS routing_error,
  DROP COLUMN IF EXISTS routing_last_attempted_at,
  DROP COLUMN IF EXISTS dedupe_hash,
  DROP COLUMN IF EXISTS lead_expires_at;

-- ============================================================
-- STEP 6: Drop Enum Type
-- ============================================================

DROP TYPE IF EXISTS lead_routing_status;

-- ============================================================
-- STEP 7: Verify Rollback Successful
-- ============================================================

-- Check that routing columns are gone
DO $$
DECLARE
  v_column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_column_count
  FROM information_schema.columns
  WHERE table_name = 'leads'
    AND column_name IN ('routing_status', 'routing_locked_by', 'dedupe_hash');

  IF v_column_count > 0 THEN
    RAISE EXCEPTION 'Rollback verification failed: routing columns still exist';
  END IF;

  RAISE NOTICE 'Rollback verification successful: all routing columns removed';
END $$;

COMMIT;

-- ============================================================
-- POST-ROLLBACK CHECKLIST
-- ============================================================

/*

1. Verify tables dropped:
   SELECT tablename FROM pg_tables WHERE tablename LIKE '%routing%';
   -- Should return 0 rows

2. Verify columns removed:
   \d leads
   -- Should NOT show routing_status, routing_locked_by, etc.

3. Verify functions dropped:
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public' AND routine_name LIKE '%routing%';
   -- Should return 0 rows

4. Redeploy previous application version:
   git revert HEAD~2..HEAD
   vercel deploy --prod

5. Resume Inngest workers (previous functions):
   curl -X POST https://api.inngest.com/v1/apps/$APP_ID/resume

6. Monitor for errors:
   - Check Sentry for new errors
   - Verify lead creation still works
   - Confirm no database errors

7. Document incident:
   - What triggered the rollback?
   - What was the root cause?
   - What needs to be fixed before retrying migration?

*/
