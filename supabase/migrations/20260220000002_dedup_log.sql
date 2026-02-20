-- Dedup Log Table
-- Tracks workspace-scoped lead deduplication rejections for monitoring/auditing
-- Note: separate from dedup_rejections (which tracks partner upload dedup)

CREATE TABLE IF NOT EXISTS dedup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_email TEXT,
  lead_name TEXT,
  company_name TEXT,
  rejection_reason TEXT NOT NULL, -- 'email_match', 'name_company_match', 'intra_batch'
  source TEXT, -- 'daily_leads', 'populate_initial', 'ingest_api'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dedup_log_workspace_id_idx ON dedup_log(workspace_id);
CREATE INDEX IF NOT EXISTS dedup_log_created_at_idx ON dedup_log(created_at);

ALTER TABLE dedup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON dedup_log FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
);
