-- Cursive Platform - Super Admin Architecture
-- Phase 1: Foundation for GoHighLevel-style multi-tenant management
--
-- This migration adds:
-- 1. Super admin impersonation sessions
-- 2. Product tiers configuration
-- 3. Workspace tier assignments with overrides
-- 4. Admin audit logs
-- 5. Extended workspace columns for managed accounts

-- ============================================================================
-- PRODUCT TIERS TABLE
-- Configurable product tiers with feature flags and limits
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Pricing
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
  price_yearly INTEGER NOT NULL DEFAULT 0, -- in cents
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,

  -- Lead limits
  daily_lead_limit INTEGER NOT NULL DEFAULT 3,
  monthly_lead_limit INTEGER,

  -- Feature flags (JSONB for flexibility)
  features JSONB NOT NULL DEFAULT '{
    "campaigns": false,
    "templates": false,
    "ai_agents": false,
    "people_search": false,
    "integrations": false,
    "api_access": false,
    "white_label": false,
    "dedicated_support": false,
    "custom_domains": false,
    "team_members": 1,
    "max_campaigns": 0,
    "max_templates": 0,
    "max_email_accounts": 1
  }'::jsonb,

  -- UI display
  description TEXT,
  badge_text TEXT, -- e.g., "Most Popular"
  is_highlighted BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true, -- Show on pricing page

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default product tiers
INSERT INTO product_tiers (name, slug, display_order, price_monthly, price_yearly, daily_lead_limit, monthly_lead_limit, features, description, is_highlighted) VALUES
  ('Free', 'free', 1, 0, 0, 3, NULL,
   '{"campaigns": false, "templates": false, "ai_agents": false, "people_search": true, "integrations": false, "api_access": false, "white_label": false, "dedicated_support": false, "custom_domains": false, "team_members": 1, "max_campaigns": 0, "max_templates": 0, "max_email_accounts": 1}'::jsonb,
   'Get started with 3 free leads per day', false),
  ('Starter', 'starter', 2, 4900, 47000, 50, 1500,
   '{"campaigns": true, "templates": true, "ai_agents": false, "people_search": true, "integrations": true, "api_access": false, "white_label": false, "dedicated_support": false, "custom_domains": false, "team_members": 2, "max_campaigns": 5, "max_templates": 10, "max_email_accounts": 2}'::jsonb,
   'Perfect for solo founders and small teams', false),
  ('Growth', 'growth', 3, 9900, 95000, 200, 6000,
   '{"campaigns": true, "templates": true, "ai_agents": true, "people_search": true, "integrations": true, "api_access": true, "white_label": false, "dedicated_support": false, "custom_domains": false, "team_members": 5, "max_campaigns": 25, "max_templates": 50, "max_email_accounts": 5}'::jsonb,
   'For growing teams who need more power', true),
  ('Enterprise', 'enterprise', 4, 29900, 287000, 1000, 30000,
   '{"campaigns": true, "templates": true, "ai_agents": true, "people_search": true, "integrations": true, "api_access": true, "white_label": true, "dedicated_support": true, "custom_domains": true, "team_members": -1, "max_campaigns": -1, "max_templates": -1, "max_email_accounts": -1}'::jsonb,
   'Unlimited everything with dedicated support', false)
ON CONFLICT (slug) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_tiers_slug ON product_tiers(slug);
CREATE INDEX IF NOT EXISTS idx_product_tiers_active ON product_tiers(is_active) WHERE is_active = true;

-- Updated_at trigger
CREATE TRIGGER product_tiers_updated_at
  BEFORE UPDATE ON product_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- WORKSPACE TIERS TABLE
-- Links workspaces to tiers with optional overrides
-- ============================================================================
CREATE TABLE IF NOT EXISTS workspace_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_tier_id UUID NOT NULL REFERENCES product_tiers(id) ON DELETE RESTRICT,

  -- Subscription details
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  subscription_status TEXT DEFAULT 'active', -- active, trialing, past_due, canceled
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Feature overrides (merged with tier features)
  -- NULL means use tier default, explicit values override
  feature_overrides JSONB DEFAULT '{}'::jsonb,

  -- Limit overrides
  daily_lead_limit_override INTEGER,
  monthly_lead_limit_override INTEGER,

  -- Admin notes
  internal_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One active tier per workspace
  CONSTRAINT unique_workspace_tier UNIQUE (workspace_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_tiers_workspace ON workspace_tiers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tiers_product_tier ON workspace_tiers(product_tier_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tiers_status ON workspace_tiers(subscription_status);

-- Updated_at trigger
CREATE TRIGGER workspace_tiers_updated_at
  BEFORE UPDATE ON workspace_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- EXTEND WORKSPACES TABLE
-- Add columns for managed accounts and enrichment
-- ============================================================================
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS managed_by_cursive BOOLEAN DEFAULT true;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS company_enrichment_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS annual_revenue TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS target_industries TEXT[];
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS target_company_sizes TEXT[];
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS target_locations TEXT[];
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Add constraint for onboarding status
ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS valid_onboarding_status;
ALTER TABLE workspaces ADD CONSTRAINT valid_onboarding_status
  CHECK (onboarding_status IN ('pending', 'in_progress', 'completed', 'skipped'));

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_workspaces_managed ON workspaces(managed_by_cursive) WHERE managed_by_cursive = true;
CREATE INDEX IF NOT EXISTS idx_workspaces_onboarding ON workspaces(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_workspaces_suspended ON workspaces(is_suspended) WHERE is_suspended = true;
CREATE INDEX IF NOT EXISTS idx_workspaces_last_activity ON workspaces(last_activity_at);

-- ============================================================================
-- SUPER ADMIN SESSIONS TABLE
-- Tracks when admins impersonate into workspaces
-- ============================================================================
CREATE TABLE IF NOT EXISTS super_admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES platform_admins(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Session details
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Context
  reason TEXT, -- Why admin is accessing
  ip_address INET,
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_super_admin_sessions_admin ON super_admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_sessions_workspace ON super_admin_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_sessions_active ON super_admin_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_super_admin_sessions_started ON super_admin_sessions(started_at);

-- ============================================================================
-- ADMIN AUDIT LOGS TABLE
-- Comprehensive logging of all admin actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES platform_admins(id) ON DELETE CASCADE,

  -- Action details
  action TEXT NOT NULL, -- e.g., 'impersonate_start', 'workspace_update', 'tier_change'
  resource_type TEXT NOT NULL, -- e.g., 'workspace', 'user', 'tier'
  resource_id UUID,

  -- Change tracking
  old_values JSONB,
  new_values JSONB,

  -- Context
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_workspace ON admin_audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at);

-- Partition by month for performance (optional, for high-volume deployments)
-- Can be enabled later if needed

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is a platform admin (enhanced)
CREATE OR REPLACE FUNCTION is_current_user_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM platform_admins pa
    JOIN auth.users au ON au.email = pa.email
    WHERE au.id = auth.uid()
    AND pa.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current admin's active impersonation session
CREATE OR REPLACE FUNCTION get_impersonated_workspace_id()
RETURNS UUID AS $$
DECLARE
  impersonated_workspace UUID;
BEGIN
  SELECT workspace_id INTO impersonated_workspace
  FROM super_admin_sessions sas
  JOIN platform_admins pa ON pa.id = sas.admin_id
  JOIN auth.users au ON au.email = pa.email
  WHERE au.id = auth.uid()
  AND sas.is_active = true
  ORDER BY sas.started_at DESC
  LIMIT 1;

  RETURN impersonated_workspace;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get effective workspace ID (own or impersonated)
CREATE OR REPLACE FUNCTION get_effective_workspace_id()
RETURNS UUID AS $$
DECLARE
  impersonated UUID;
  own_workspace UUID;
BEGIN
  -- First check for active impersonation session
  impersonated := get_impersonated_workspace_id();
  IF impersonated IS NOT NULL THEN
    RETURN impersonated;
  END IF;

  -- Fall back to user's own workspace
  SELECT workspace_id INTO own_workspace
  FROM users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN own_workspace;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get workspace tier features (with overrides)
CREATE OR REPLACE FUNCTION get_workspace_features(p_workspace_id UUID)
RETURNS JSONB AS $$
DECLARE
  tier_features JSONB;
  overrides JSONB;
BEGIN
  SELECT
    pt.features,
    COALESCE(wt.feature_overrides, '{}'::jsonb)
  INTO tier_features, overrides
  FROM workspace_tiers wt
  JOIN product_tiers pt ON pt.id = wt.product_tier_id
  WHERE wt.workspace_id = p_workspace_id;

  -- If no tier found, return free tier defaults
  IF tier_features IS NULL THEN
    SELECT features INTO tier_features
    FROM product_tiers
    WHERE slug = 'free';
  END IF;

  -- Merge overrides (override values take precedence)
  RETURN tier_features || overrides;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get workspace effective lead limit
CREATE OR REPLACE FUNCTION get_workspace_daily_lead_limit(p_workspace_id UUID)
RETURNS INTEGER AS $$
DECLARE
  tier_limit INTEGER;
  override_limit INTEGER;
BEGIN
  SELECT
    pt.daily_lead_limit,
    wt.daily_lead_limit_override
  INTO tier_limit, override_limit
  FROM workspace_tiers wt
  JOIN product_tiers pt ON pt.id = wt.product_tier_id
  WHERE wt.workspace_id = p_workspace_id;

  -- Override takes precedence
  IF override_limit IS NOT NULL THEN
    RETURN override_limit;
  END IF;

  -- Return tier limit or free default
  RETURN COALESCE(tier_limit, 3);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_workspace_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_admin_id UUID;
  v_log_id UUID;
BEGIN
  -- Get admin ID
  SELECT pa.id INTO v_admin_id
  FROM platform_admins pa
  JOIN auth.users au ON au.email = pa.email
  WHERE au.id = auth.uid();

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not a platform admin';
  END IF;

  -- Insert log
  INSERT INTO admin_audit_logs (
    admin_id, action, resource_type, resource_id,
    old_values, new_values, workspace_id
  ) VALUES (
    v_admin_id, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_workspace_id
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES - ADMIN ACCESS
-- ============================================================================

-- Drop existing policies that we'll replace
DROP POLICY IF EXISTS "Users can view their own workspace" ON workspaces;

-- Workspaces: Users can view own workspace OR admins can view all
CREATE POLICY "Users and admins can view workspaces" ON workspaces
  FOR SELECT
  USING (
    -- User's own workspace
    id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
    OR
    -- Platform admin can view all
    is_current_user_platform_admin()
    OR
    -- Impersonated workspace
    id = get_impersonated_workspace_id()
  );

-- Workspaces: Admins can update any workspace
CREATE POLICY "Admins can update any workspace" ON workspaces
  FOR UPDATE
  USING (is_current_user_platform_admin());

-- Product Tiers: Anyone can view active public tiers
ALTER TABLE product_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public tiers" ON product_tiers
  FOR SELECT
  USING (is_active = true AND is_public = true);

CREATE POLICY "Admins can manage tiers" ON product_tiers
  FOR ALL
  USING (is_current_user_platform_admin());

-- Workspace Tiers: RLS
ALTER TABLE workspace_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tier" ON workspace_tiers
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
    )
    OR is_current_user_platform_admin()
  );

CREATE POLICY "Admins can manage workspace tiers" ON workspace_tiers
  FOR ALL
  USING (is_current_user_platform_admin());

-- Super Admin Sessions: Only admins
ALTER TABLE super_admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sessions" ON super_admin_sessions
  FOR ALL
  USING (is_current_user_platform_admin());

-- Admin Audit Logs: Only admins can view
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view logs" ON admin_audit_logs
  FOR SELECT
  USING (is_current_user_platform_admin());

-- ============================================================================
-- UPDATE USERS RLS FOR IMPERSONATION
-- ============================================================================
DROP POLICY IF EXISTS "Users can view workspace members" ON users;

CREATE POLICY "Users can view workspace members with impersonation" ON users
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
    )
    OR workspace_id = get_impersonated_workspace_id()
    OR is_current_user_platform_admin()
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE product_tiers IS 'Configurable product/pricing tiers with features and limits';
COMMENT ON TABLE workspace_tiers IS 'Links workspaces to product tiers with optional overrides';
COMMENT ON TABLE super_admin_sessions IS 'Tracks admin impersonation sessions into workspaces';
COMMENT ON TABLE admin_audit_logs IS 'Audit trail of all admin actions for compliance';
COMMENT ON FUNCTION is_current_user_platform_admin() IS 'Check if current auth user is a platform admin';
COMMENT ON FUNCTION get_impersonated_workspace_id() IS 'Get workspace ID being impersonated by current admin';
COMMENT ON FUNCTION get_effective_workspace_id() IS 'Get workspace ID (own or impersonated)';
COMMENT ON FUNCTION get_workspace_features(UUID) IS 'Get merged tier features with overrides for a workspace';
COMMENT ON FUNCTION get_workspace_daily_lead_limit(UUID) IS 'Get effective daily lead limit for a workspace';
COMMENT ON FUNCTION log_admin_action(TEXT, TEXT, UUID, JSONB, JSONB, UUID) IS 'Log an admin action for audit trail';
