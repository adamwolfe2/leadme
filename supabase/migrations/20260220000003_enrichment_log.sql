-- Enrichment Log Table (extended schema)
-- Tracks per-lead enrichment events with credit usage and field-level detail
-- Adds columns not present in the original enrichment_log from 20260219000003

-- Add missing columns to existing enrichment_log table if they don't exist
ALTER TABLE enrichment_log
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS visitor_id UUID,
  ADD COLUMN IF NOT EXISTS credits_charged INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS enrichment_source TEXT,
  ADD COLUMN IF NOT EXISTS fields_enriched TEXT[];

-- Drop the old required constraint on lead_id and user_id if any (make nullable for visitors)
-- The original schema had NOT NULL on lead_id and user_id; we relax this for visitor enrichment
ALTER TABLE enrichment_log
  ALTER COLUMN lead_id DROP NOT NULL;

-- Back-fill credits_charged from credits_used where available
UPDATE enrichment_log SET credits_charged = credits_used WHERE credits_charged = 1 AND credits_used IS NOT NULL;

-- Back-fill fields_enriched from fields_added where available
UPDATE enrichment_log SET fields_enriched = fields_added WHERE fields_enriched IS NULL AND fields_added IS NOT NULL;

-- Additional indexes
CREATE INDEX IF NOT EXISTS enrichment_log_workspace_id_idx ON enrichment_log(workspace_id);
CREATE INDEX IF NOT EXISTS enrichment_log_created_at_idx ON enrichment_log(created_at);

-- Drop old restrictive insert policy and add a workspace-scoped one
DROP POLICY IF EXISTS "Service role insert only" ON enrichment_log;

CREATE POLICY "workspace_isolation" ON enrichment_log FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
);
