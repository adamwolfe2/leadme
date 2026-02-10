-- Audience Labs Hardening Migration
-- Adds: pixel→workspace mapping table, import_jobs tracking, raw_headers column

-- ============ audiencelab_pixels (pixel → workspace mapping) ============

CREATE TABLE IF NOT EXISTS audiencelab_pixels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  pixel_id TEXT NOT NULL,
  domain TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_al_pixels_pixel_id UNIQUE (pixel_id)
);

CREATE INDEX IF NOT EXISTS idx_al_pixels_workspace
  ON audiencelab_pixels (workspace_id);
CREATE INDEX IF NOT EXISTS idx_al_pixels_domain
  ON audiencelab_pixels (domain) WHERE domain IS NOT NULL;

-- RLS
ALTER TABLE audiencelab_pixels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace isolation for audiencelab_pixels"
  ON audiencelab_pixels
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role access for audiencelab_pixels"
  ON audiencelab_pixels
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============ audiencelab_import_jobs (import progress tracking) ============

CREATE TABLE IF NOT EXISTS audiencelab_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  audience_id TEXT,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  error TEXT,
  idempotency_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_al_import_jobs_workspace
  ON audiencelab_import_jobs (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_al_import_jobs_status
  ON audiencelab_import_jobs (status) WHERE status IN ('pending', 'processing');

-- RLS
ALTER TABLE audiencelab_import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace isolation for audiencelab_import_jobs"
  ON audiencelab_import_jobs
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role access for audiencelab_import_jobs"
  ON audiencelab_import_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============ Add raw_headers column to audiencelab_events ============

ALTER TABLE audiencelab_events
  ADD COLUMN IF NOT EXISTS raw_headers JSONB;

-- ============ Updated_at triggers ============

CREATE TRIGGER trg_audiencelab_pixels_updated_at
  BEFORE UPDATE ON audiencelab_pixels
  FOR EACH ROW
  EXECUTE FUNCTION update_audiencelab_identities_updated_at();

CREATE TRIGGER trg_audiencelab_import_jobs_updated_at
  BEFORE UPDATE ON audiencelab_import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_audiencelab_identities_updated_at();
