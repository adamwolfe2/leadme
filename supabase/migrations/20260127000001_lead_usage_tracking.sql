-- Lead Usage Tracking
-- Tracks lead fetches per workspace for billing and analytics

-- ============================================================================
-- LEAD USAGE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Usage data
  count INTEGER NOT NULL DEFAULT 1,
  provider TEXT NOT NULL, -- datashopper, audience_labs, manual

  -- Search context
  search_filters JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_usage_workspace ON lead_usage(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lead_usage_created ON lead_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_usage_provider ON lead_usage(provider);
CREATE INDEX IF NOT EXISTS idx_lead_usage_workspace_date ON lead_usage(workspace_id, created_at);

-- RLS
ALTER TABLE lead_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON lead_usage
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all usage" ON lead_usage
  FOR SELECT
  USING (is_current_user_platform_admin());

-- ============================================================================
-- LEAD PROVIDER CONFIGS TABLE
-- Store provider API keys per workspace (for future white-label)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_provider_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Provider info
  provider TEXT NOT NULL, -- datashopper, audience_labs

  -- Encrypted credentials (use Supabase Vault in production)
  api_key_encrypted TEXT,

  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher = preferred

  -- Rate limits
  daily_limit INTEGER,
  monthly_limit INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One config per provider per workspace
  CONSTRAINT unique_workspace_provider UNIQUE (workspace_id, provider)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_provider_configs_workspace ON lead_provider_configs(workspace_id);

-- Updated_at trigger
CREATE TRIGGER lead_provider_configs_updated_at
  BEFORE UPDATE ON lead_provider_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE lead_provider_configs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage provider configs (platform-level credentials)
CREATE POLICY "Admins can manage provider configs" ON lead_provider_configs
  FOR ALL
  USING (is_current_user_platform_admin());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get workspace daily lead usage
CREATE OR REPLACE FUNCTION get_workspace_daily_lead_usage(p_workspace_id UUID)
RETURNS INTEGER AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(count), 0)::INTEGER INTO usage_count
  FROM lead_usage
  WHERE workspace_id = p_workspace_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  RETURN usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get workspace monthly lead usage
CREATE OR REPLACE FUNCTION get_workspace_monthly_lead_usage(p_workspace_id UUID)
RETURNS INTEGER AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(count), 0)::INTEGER INTO usage_count
  FROM lead_usage
  WHERE workspace_id = p_workspace_id
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

  RETURN usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if workspace can fetch leads
CREATE OR REPLACE FUNCTION can_workspace_fetch_leads(p_workspace_id UUID, p_count INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  daily_limit INTEGER;
  monthly_limit INTEGER;
  daily_used INTEGER;
  monthly_used INTEGER;
BEGIN
  -- Get limits
  SELECT
    COALESCE(wt.daily_lead_limit_override, pt.daily_lead_limit, 3),
    COALESCE(wt.monthly_lead_limit_override, pt.monthly_lead_limit)
  INTO daily_limit, monthly_limit
  FROM workspaces w
  LEFT JOIN workspace_tiers wt ON wt.workspace_id = w.id
  LEFT JOIN product_tiers pt ON pt.id = wt.product_tier_id
  WHERE w.id = p_workspace_id;

  -- Get usage
  daily_used := get_workspace_daily_lead_usage(p_workspace_id);
  monthly_used := get_workspace_monthly_lead_usage(p_workspace_id);

  -- Check limits
  IF daily_used + p_count > daily_limit THEN
    RETURN FALSE;
  END IF;

  IF monthly_limit IS NOT NULL AND monthly_used + p_count > monthly_limit THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE lead_usage IS 'Tracks lead fetch usage per workspace for billing and analytics';
COMMENT ON TABLE lead_provider_configs IS 'Provider API configurations per workspace (for white-label)';
COMMENT ON FUNCTION get_workspace_daily_lead_usage(UUID) IS 'Get total leads fetched today for a workspace';
COMMENT ON FUNCTION get_workspace_monthly_lead_usage(UUID) IS 'Get total leads fetched this month for a workspace';
COMMENT ON FUNCTION can_workspace_fetch_leads(UUID, INTEGER) IS 'Check if workspace is within lead limits';
