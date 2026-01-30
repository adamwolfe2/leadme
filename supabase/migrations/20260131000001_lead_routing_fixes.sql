-- ============================================================================
-- Lead Routing System Hardening (P0 Security Fixes)
-- ============================================================================
-- This migration addresses 7 critical lead routing vulnerabilities:
-- 1. Non-atomic rule evaluation (race conditions)
-- 2. Missing retry mechanism for failed routing
-- 3. No cross-partner deduplication
-- 4. Double attribution bugs
-- 5. No lead lifecycle management (timeouts)
-- 6. RLS compliance gaps
-- 7. No routing state tracking

-- ============================================================================
-- PHASE 1: LEAD STATE MACHINE
-- ============================================================================

-- Create routing status enum
CREATE TYPE lead_routing_status AS ENUM (
  'pending',      -- Initial state, not yet routed
  'routing',      -- Currently being processed
  'routed',       -- Successfully routed to workspace
  'failed',       -- Routing failed after all retries
  'expired'       -- Lead expired (TTL exceeded)
);

-- Add state machine fields to leads table
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS routing_status lead_routing_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS routing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS routing_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS routing_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS routing_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS routing_error TEXT,
  ADD COLUMN IF NOT EXISTS routing_locked_by UUID,
  ADD COLUMN IF NOT EXISTS routing_locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lead_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dedupe_hash VARCHAR(64);

-- Add index for routing status queries
CREATE INDEX IF NOT EXISTS idx_leads_routing_status
  ON leads(routing_status)
  WHERE routing_status IN ('pending', 'failed');

-- Add index for expired leads cleanup
CREATE INDEX IF NOT EXISTS idx_leads_expired
  ON leads(lead_expires_at)
  WHERE lead_expires_at IS NOT NULL AND routing_status != 'expired';

-- Add index for deduplication
CREATE INDEX IF NOT EXISTS idx_leads_dedupe_hash
  ON leads(dedupe_hash)
  WHERE dedupe_hash IS NOT NULL;

-- Add composite index for workspace routing queries
CREATE INDEX IF NOT EXISTS idx_leads_workspace_routing
  ON leads(workspace_id, routing_status, created_at DESC);

-- ============================================================================
-- PHASE 2: ROUTING QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_routing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Retry tracking
  attempt_number INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ NOT NULL,

  -- Error tracking
  last_error TEXT,
  error_count INTEGER DEFAULT 0,

  -- Routing context
  routing_context JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_attempt_number CHECK (attempt_number >= 0),
  CONSTRAINT valid_max_attempts CHECK (max_attempts > 0),
  CONSTRAINT attempt_within_max CHECK (attempt_number <= max_attempts)
);

-- Add indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_routing_queue_next_retry
  ON lead_routing_queue(next_retry_at)
  WHERE processed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_routing_queue_workspace
  ON lead_routing_queue(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_routing_queue_lead
  ON lead_routing_queue(lead_id);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_lead_routing_queue_updated_at
  BEFORE UPDATE ON lead_routing_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PHASE 3: ATOMIC ROUTING FUNCTIONS
-- ============================================================================

-- Function: Acquire routing lock (prevents race conditions)
CREATE OR REPLACE FUNCTION acquire_routing_lock(
  p_lead_id UUID,
  p_lock_owner UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  -- Try to acquire lock using FOR UPDATE SKIP LOCKED
  UPDATE leads
  SET
    routing_status = 'routing',
    routing_locked_by = p_lock_owner,
    routing_locked_at = NOW(),
    routing_started_at = COALESCE(routing_started_at, NOW()),
    routing_attempts = routing_attempts + 1,
    updated_at = NOW()
  WHERE id = p_lead_id
    AND routing_status IN ('pending', 'failed')
    AND (
      routing_locked_by IS NULL
      OR routing_locked_at < NOW() - INTERVAL '5 minutes'  -- Lock timeout
    )
  RETURNING true INTO v_updated;

  RETURN COALESCE(v_updated, false);
END;
$$ LANGUAGE plpgsql;

-- Function: Complete routing (marks as routed)
CREATE OR REPLACE FUNCTION complete_routing(
  p_lead_id UUID,
  p_destination_workspace_id UUID,
  p_matched_rule_id UUID,
  p_lock_owner UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE leads
  SET
    routing_status = 'routed',
    workspace_id = p_destination_workspace_id,
    routing_completed_at = NOW(),
    routing_locked_by = NULL,
    routing_locked_at = NULL,
    routing_error = NULL,
    updated_at = NOW()
  WHERE id = p_lead_id
    AND routing_locked_by = p_lock_owner
    AND routing_status = 'routing'
  RETURNING true INTO v_updated;

  -- Log routing event
  IF COALESCE(v_updated, false) THEN
    INSERT INTO lead_routing_logs (
      lead_id,
      source_workspace_id,
      destination_workspace_id,
      matched_rule_id,
      routing_result,
      created_at
    ) VALUES (
      p_lead_id,
      (SELECT workspace_id FROM leads WHERE id = p_lead_id),
      p_destination_workspace_id,
      p_matched_rule_id,
      'success',
      NOW()
    );
  END IF;

  RETURN COALESCE(v_updated, false);
END;
$$ LANGUAGE plpgsql;

-- Function: Fail routing (marks as failed, queues retry if attempts remain)
CREATE OR REPLACE FUNCTION fail_routing(
  p_lead_id UUID,
  p_error_message TEXT,
  p_lock_owner UUID,
  p_max_attempts INTEGER DEFAULT 3
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_attempts INTEGER;
  v_updated BOOLEAN;
BEGIN
  -- Get current attempt count
  SELECT routing_attempts INTO v_current_attempts
  FROM leads
  WHERE id = p_lead_id;

  IF v_current_attempts >= p_max_attempts THEN
    -- Final failure - mark as failed
    UPDATE leads
    SET
      routing_status = 'failed',
      routing_failed_at = NOW(),
      routing_locked_by = NULL,
      routing_locked_at = NULL,
      routing_error = p_error_message,
      updated_at = NOW()
    WHERE id = p_lead_id
      AND routing_locked_by = p_lock_owner
      AND routing_status = 'routing'
    RETURNING true INTO v_updated;

    -- Log final failure
    IF COALESCE(v_updated, false) THEN
      INSERT INTO lead_routing_logs (
        lead_id,
        source_workspace_id,
        destination_workspace_id,
        matched_rule_id,
        routing_result,
        error_message,
        created_at
      ) VALUES (
        p_lead_id,
        (SELECT workspace_id FROM leads WHERE id = p_lead_id),
        NULL,
        NULL,
        'failed',
        p_error_message,
        NOW()
      );
    END IF;
  ELSE
    -- Queue for retry - reset to pending
    UPDATE leads
    SET
      routing_status = 'pending',
      routing_locked_by = NULL,
      routing_locked_at = NULL,
      routing_error = p_error_message,
      updated_at = NOW()
    WHERE id = p_lead_id
      AND routing_locked_by = p_lock_owner
      AND routing_status = 'routing'
    RETURNING true INTO v_updated;

    -- Add to retry queue with exponential backoff
    IF COALESCE(v_updated, false) THEN
      INSERT INTO lead_routing_queue (
        lead_id,
        workspace_id,
        attempt_number,
        max_attempts,
        next_retry_at,
        last_error,
        error_count
      ) VALUES (
        p_lead_id,
        (SELECT workspace_id FROM leads WHERE id = p_lead_id),
        v_current_attempts,
        p_max_attempts,
        NOW() + (INTERVAL '1 minute' * POWER(2, v_current_attempts)),  -- Exponential backoff
        p_error_message,
        v_current_attempts
      );
    END IF;
  END IF;

  RETURN COALESCE(v_updated, false);
END;
$$ LANGUAGE plpgsql;

-- Function: Release stale locks (cleanup)
CREATE OR REPLACE FUNCTION release_stale_routing_locks() RETURNS INTEGER AS $$
DECLARE
  v_released_count INTEGER;
BEGIN
  UPDATE leads
  SET
    routing_status = 'pending',
    routing_locked_by = NULL,
    routing_locked_at = NULL,
    updated_at = NOW()
  WHERE routing_status = 'routing'
    AND routing_locked_at < NOW() - INTERVAL '5 minutes';

  GET DIAGNOSTICS v_released_count = ROW_COUNT;
  RETURN v_released_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PHASE 4: ROUTING LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_routing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  source_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  destination_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  matched_rule_id UUID REFERENCES lead_routing_rules(id) ON DELETE SET NULL,
  routing_result VARCHAR(20) NOT NULL,  -- 'success', 'failed', 'skipped'
  error_message TEXT,
  routing_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for log queries
CREATE INDEX IF NOT EXISTS idx_routing_logs_lead
  ON lead_routing_logs(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_routing_logs_workspace
  ON lead_routing_logs(source_workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_routing_logs_result
  ON lead_routing_logs(routing_result, created_at DESC);

-- ============================================================================
-- PHASE 5: DEDUPLICATION HASH FUNCTION
-- ============================================================================

-- Function: Generate deduplication hash for lead
CREATE OR REPLACE FUNCTION generate_dedupe_hash(
  p_email TEXT,
  p_phone TEXT,
  p_company_name TEXT,
  p_first_name TEXT,
  p_last_name TEXT
) RETURNS VARCHAR(64) AS $$
DECLARE
  v_hash_input TEXT;
BEGIN
  -- Normalize and concatenate identifying fields
  v_hash_input := CONCAT_WS('|',
    LOWER(TRIM(COALESCE(p_email, ''))),
    REGEXP_REPLACE(COALESCE(p_phone, ''), '[^0-9]', '', 'g'),
    LOWER(TRIM(COALESCE(p_company_name, ''))),
    LOWER(TRIM(COALESCE(p_first_name, ''))),
    LOWER(TRIM(COALESCE(p_last_name, '')))
  );

  -- Generate SHA256 hash
  RETURN encode(digest(v_hash_input, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Check for duplicate lead across partners
CREATE OR REPLACE FUNCTION check_cross_partner_duplicate(
  p_dedupe_hash VARCHAR(64),
  p_source_workspace_id UUID
) RETURNS TABLE (
  duplicate_lead_id UUID,
  duplicate_workspace_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.workspace_id,
    l.created_at
  FROM leads l
  INNER JOIN workspaces w ON l.workspace_id = w.id
  WHERE l.dedupe_hash = p_dedupe_hash
    AND l.workspace_id != p_source_workspace_id
    AND w.workspace_type = 'partner'  -- Only check partner workspaces
    AND l.routing_status != 'expired'
  ORDER BY l.created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PHASE 6: LIFECYCLE MANAGEMENT
-- ============================================================================

-- Function: Mark expired leads
CREATE OR REPLACE FUNCTION mark_expired_leads() RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE leads
  SET
    routing_status = 'expired',
    updated_at = NOW()
  WHERE lead_expires_at IS NOT NULL
    AND lead_expires_at < NOW()
    AND routing_status != 'expired';

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Set lead expiration (90 days from creation)
CREATE OR REPLACE FUNCTION set_lead_expiration() RETURNS TRIGGER AS $$
BEGIN
  -- Set expiration to 90 days from creation if not already set
  IF NEW.lead_expires_at IS NULL THEN
    NEW.lead_expires_at := NEW.created_at + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-set lead expiration on insert
CREATE TRIGGER set_lead_expiration_trigger
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_lead_expiration();

-- ============================================================================
-- PHASE 7: RLS POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE lead_routing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_routing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access routing queue for their workspace
CREATE POLICY routing_queue_workspace_isolation ON lead_routing_queue
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM user_workspaces
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only access routing logs for their workspace
CREATE POLICY routing_logs_workspace_isolation ON lead_routing_logs
  FOR ALL
  USING (
    source_workspace_id IN (
      SELECT workspace_id FROM user_workspaces
      WHERE user_id = auth.uid()
    )
    OR destination_workspace_id IN (
      SELECT workspace_id FROM user_workspaces
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- PHASE 8: DATA MIGRATION (BACKFILL)
-- ============================================================================

-- Backfill routing_status for existing leads
UPDATE leads
SET routing_status = 'routed'
WHERE routing_status IS NULL
  AND workspace_id IS NOT NULL;

-- Generate dedupe hashes for existing leads
UPDATE leads
SET dedupe_hash = generate_dedupe_hash(
  (contact_data->>'email')::TEXT,
  (contact_data->'contacts'->0->>'phone')::TEXT,
  name,
  (contact_data->>'first_name')::TEXT,
  (contact_data->>'last_name')::TEXT
)
WHERE dedupe_hash IS NULL
  AND (
    contact_data->>'email' IS NOT NULL
    OR contact_data->'contacts'->0->>'phone' IS NOT NULL
    OR name IS NOT NULL
  );

-- ============================================================================
-- ROLLBACK SCRIPT (stored as comment for reference)
-- ============================================================================

/*
-- To rollback this migration:

-- Drop triggers
DROP TRIGGER IF EXISTS set_lead_expiration_trigger ON leads;
DROP TRIGGER IF EXISTS update_lead_routing_queue_updated_at ON lead_routing_queue;

-- Drop functions
DROP FUNCTION IF EXISTS acquire_routing_lock(UUID, UUID);
DROP FUNCTION IF EXISTS complete_routing(UUID, UUID, UUID, UUID);
DROP FUNCTION IF EXISTS fail_routing(UUID, TEXT, UUID, INTEGER);
DROP FUNCTION IF EXISTS release_stale_routing_locks();
DROP FUNCTION IF EXISTS generate_dedupe_hash(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS check_cross_partner_duplicate(VARCHAR, UUID);
DROP FUNCTION IF EXISTS mark_expired_leads();
DROP FUNCTION IF EXISTS set_lead_expiration();

-- Drop tables
DROP TABLE IF EXISTS lead_routing_logs CASCADE;
DROP TABLE IF EXISTS lead_routing_queue CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_leads_routing_status;
DROP INDEX IF EXISTS idx_leads_expired;
DROP INDEX IF EXISTS idx_leads_dedupe_hash;
DROP INDEX IF EXISTS idx_leads_workspace_routing;
DROP INDEX IF EXISTS idx_routing_queue_next_retry;
DROP INDEX IF EXISTS idx_routing_queue_workspace;
DROP INDEX IF EXISTS idx_routing_queue_lead;
DROP INDEX IF EXISTS idx_routing_logs_lead;
DROP INDEX IF EXISTS idx_routing_logs_workspace;
DROP INDEX IF EXISTS idx_routing_logs_result;

-- Drop columns from leads table
ALTER TABLE leads
  DROP COLUMN IF EXISTS routing_status,
  DROP COLUMN IF EXISTS routing_started_at,
  DROP COLUMN IF EXISTS routing_completed_at,
  DROP COLUMN IF EXISTS routing_failed_at,
  DROP COLUMN IF EXISTS routing_attempts,
  DROP COLUMN IF EXISTS routing_error,
  DROP COLUMN IF EXISTS routing_locked_by,
  DROP COLUMN IF EXISTS routing_locked_at,
  DROP COLUMN IF EXISTS lead_expires_at,
  DROP COLUMN IF EXISTS dedupe_hash;

-- Drop enum type
DROP TYPE IF EXISTS lead_routing_status;
*/
