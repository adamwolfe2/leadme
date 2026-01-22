-- OpenInfo Platform - Lead System Migration
-- Creates leads, credit usage, and export jobs tables

-- ============================================================================
-- LEADS TABLE
-- ============================================================================
CREATE TYPE enrichment_status AS ENUM ('pending', 'enriching', 'enriched', 'failed');
CREATE TYPE delivery_status AS ENUM ('pending', 'delivered', 'failed');

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,

  -- Company data (from DataShopper)
  company_data JSONB NOT NULL DEFAULT '{
    "name": null,
    "domain": null,
    "industry": null,
    "size": null,
    "location": null,
    "description": null,
    "technologies": [],
    "intent_score": null,
    "intent_signals": []
  }'::jsonb,

  -- Contact data (from Clay enrichment)
  contact_data JSONB DEFAULT '{
    "contacts": [],
    "total_contacts": 0,
    "enrichment_date": null
  }'::jsonb,

  -- Status
  enrichment_status enrichment_status NOT NULL DEFAULT 'pending',
  delivery_status delivery_status NOT NULL DEFAULT 'pending',

  -- Tracking
  enrichment_attempts INTEGER NOT NULL DEFAULT 0,
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enriched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT company_name_required CHECK (company_data->>'name' IS NOT NULL),
  CONSTRAINT positive_enrichment_attempts CHECK (enrichment_attempts >= 0),
  CONSTRAINT positive_delivery_attempts CHECK (delivery_attempts >= 0)
);

-- Indexes for leads
CREATE INDEX idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX idx_leads_query_id ON leads(query_id);
CREATE INDEX idx_leads_enrichment_status ON leads(enrichment_status);
CREATE INDEX idx_leads_delivery_status ON leads(delivery_status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- GIN indexes for JSONB queries
CREATE INDEX idx_leads_company_data ON leads USING GIN(company_data);
CREATE INDEX idx_leads_contact_data ON leads USING GIN(contact_data);

-- Index for company domain (unique per workspace)
CREATE UNIQUE INDEX idx_leads_workspace_domain ON leads(workspace_id, (company_data->>'domain'))
  WHERE company_data->>'domain' IS NOT NULL;

-- ============================================================================
-- CREDIT USAGE TABLE
-- ============================================================================
CREATE TYPE credit_action AS ENUM (
  'email_reveal',
  'lead_export',
  'people_search',
  'contact_enrichment'
);

CREATE TABLE credit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Action details
  action_type credit_action NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,

  -- Reference
  reference_id UUID, -- ID of lead, search, etc.
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_credits CHECK (credits_used > 0)
);

-- Indexes for credit_usage
CREATE INDEX idx_credit_usage_workspace_id ON credit_usage(workspace_id);
CREATE INDEX idx_credit_usage_user_id ON credit_usage(user_id);
CREATE INDEX idx_credit_usage_action_type ON credit_usage(action_type);
CREATE INDEX idx_credit_usage_created_at ON credit_usage(created_at DESC);
CREATE INDEX idx_credit_usage_reference_id ON credit_usage(reference_id);

-- ============================================================================
-- EXPORT JOBS TABLE
-- ============================================================================
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE export_format AS ENUM ('csv', 'json');

CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Export configuration
  export_format export_format NOT NULL DEFAULT 'csv',
  filters JSONB DEFAULT '{}'::jsonb,

  -- Status
  status export_status NOT NULL DEFAULT 'pending',
  file_url TEXT,
  file_size_bytes BIGINT,
  row_count INTEGER,

  -- Error tracking
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- File expiry (7 days from completion)

  -- Constraints
  CONSTRAINT positive_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
  CONSTRAINT positive_row_count CHECK (row_count IS NULL OR row_count >= 0)
);

-- Indexes for export_jobs
CREATE INDEX idx_export_jobs_workspace_id ON export_jobs(workspace_id);
CREATE INDEX idx_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
CREATE INDEX idx_export_jobs_created_at ON export_jobs(created_at DESC);
CREATE INDEX idx_export_jobs_expires_at ON export_jobs(expires_at)
  WHERE status = 'completed';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Leads: Workspace isolation
CREATE POLICY "Workspace isolation for leads" ON leads
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Enable RLS on credit_usage
ALTER TABLE credit_usage ENABLE ROW LEVEL SECURITY;

-- Credit usage: Workspace isolation (read-only for users)
CREATE POLICY "Workspace isolation for credit usage" ON credit_usage
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Enable RLS on export_jobs
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Export jobs: Workspace isolation
CREATE POLICY "Workspace isolation for export jobs" ON export_jobs
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get leads pending enrichment
CREATE OR REPLACE FUNCTION get_leads_pending_enrichment(batch_size INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
  query_id UUID,
  company_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.workspace_id, l.query_id, l.company_data
  FROM leads l
  WHERE l.enrichment_status = 'pending'
  AND l.enrichment_attempts < 3
  ORDER BY l.created_at
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leads pending delivery
CREATE OR REPLACE FUNCTION get_leads_pending_delivery(batch_size INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
  query_id UUID,
  company_data JSONB,
  contact_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.workspace_id, l.query_id, l.company_data, l.contact_data
  FROM leads l
  WHERE l.enrichment_status = 'enriched'
  AND l.delivery_status = 'pending'
  AND l.delivery_attempts < 3
  ORDER BY l.enriched_at
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record credit usage
CREATE OR REPLACE FUNCTION record_credit_usage(
  p_workspace_id UUID,
  p_user_id UUID,
  p_action_type credit_action,
  p_credits_used INTEGER DEFAULT 1,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  usage_id UUID;
BEGIN
  -- Insert credit usage record
  INSERT INTO credit_usage (
    workspace_id,
    user_id,
    action_type,
    credits_used,
    reference_id,
    metadata
  ) VALUES (
    p_workspace_id,
    p_user_id,
    p_action_type,
    p_credits_used,
    p_reference_id,
    p_metadata
  ) RETURNING id INTO usage_id;

  -- Update user's daily credits used
  UPDATE users
  SET daily_credits_used = daily_credits_used + p_credits_used
  WHERE id = p_user_id;

  RETURN usage_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has available credits
CREATE OR REPLACE FUNCTION check_credits_available(
  p_user_id UUID,
  p_credits_needed INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  user_rec RECORD;
BEGIN
  SELECT daily_credits_used, daily_credit_limit
  INTO user_rec
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN (user_rec.daily_credits_used + p_credits_needed) <= user_rec.daily_credit_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update lead enrichment status
CREATE OR REPLACE FUNCTION update_lead_enrichment(
  p_lead_id UUID,
  p_status enrichment_status,
  p_contact_data JSONB DEFAULT NULL,
  p_error TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE leads
  SET
    enrichment_status = p_status,
    contact_data = COALESCE(p_contact_data, contact_data),
    enriched_at = CASE WHEN p_status = 'enriched' THEN NOW() ELSE enriched_at END,
    enrichment_attempts = enrichment_attempts + 1,
    last_error = p_error
  WHERE id = p_lead_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update lead delivery status
CREATE OR REPLACE FUNCTION update_lead_delivery(
  p_lead_id UUID,
  p_status delivery_status,
  p_error TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE leads
  SET
    delivery_status = p_status,
    delivered_at = CASE WHEN p_status = 'delivered' THEN NOW() ELSE delivered_at END,
    delivery_attempts = delivery_attempts + 1,
    last_error = p_error
  WHERE id = p_lead_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired exports (to be called daily)
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS void AS $$
BEGIN
  DELETE FROM export_jobs
  WHERE status = 'completed'
  AND expires_at < NOW();
END;
$$ LANGUAGE sql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE leads IS 'Lead records with company and contact data';
COMMENT ON TABLE credit_usage IS 'Tracks all credit consumption actions';
COMMENT ON TABLE export_jobs IS 'Background CSV/JSON export job queue';
COMMENT ON COLUMN leads.company_data IS 'Company information from DataShopper API';
COMMENT ON COLUMN leads.contact_data IS 'Enriched contact information from Clay API';
COMMENT ON FUNCTION record_credit_usage IS 'Records credit usage and updates user daily count';
COMMENT ON FUNCTION check_credits_available IS 'Validates user has sufficient credits';
