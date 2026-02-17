-- Migration: Daily Lead Distribution Integration
-- Adds fields needed for Audience Labs daily lead distribution and GHL/Email Bison integration

-- Add columns to users table for segment matching and service integrations
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS industry_segment TEXT,
  ADD COLUMN IF NOT EXISTS location_segment TEXT,
  ADD COLUMN IF NOT EXISTS daily_lead_limit INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS ghl_sub_account_id TEXT,
  ADD COLUMN IF NOT EXISTS ghl_login_url TEXT,
  ADD COLUMN IF NOT EXISTS emailbison_account_id TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add index for daily lead distribution query
CREATE INDEX IF NOT EXISTS idx_users_active_segments
  ON users(is_active, industry_segment, location_segment)
  WHERE is_active = TRUE AND workspace_id IS NOT NULL;

-- Create table for tracking segment mappings (industry/location → Audience Labs segment ID)
CREATE TABLE IF NOT EXISTS audience_lab_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  segment_id TEXT NOT NULL,
  segment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry, location)
);

-- Enable RLS on audience_lab_segments
ALTER TABLE audience_lab_segments ENABLE ROW LEVEL SECURITY;

-- Only admins can manage segment mappings
CREATE POLICY "Admin can manage segment mappings" ON audience_lab_segments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = TRUE
    )
  );

-- Create table for feature requests (from placeholder modals)
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'pixel_tracking', 'email_campaigns', 'custom_audiences', etc.
  user_email TEXT NOT NULL,
  user_phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'onboarding', 'active', 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on feature_requests
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Users can create and view their own feature requests
CREATE POLICY "Users can create feature requests" ON feature_requests
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own feature requests" ON feature_requests
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can view and manage all feature requests
CREATE POLICY "Admins can manage feature requests" ON feature_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = TRUE
    )
  );

-- Create index for feature request queries
CREATE INDEX IF NOT EXISTS idx_feature_requests_status
  ON feature_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feature_requests_workspace
  ON feature_requests(workspace_id, created_at DESC);

-- Add metadata column to leads table for storing Audience Labs enrichment data
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for metadata queries
CREATE INDEX IF NOT EXISTS idx_leads_metadata
  ON leads USING GIN (metadata);

-- Add delivered_at timestamp for tracking when leads were delivered to users
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_delivered_at
  ON leads(workspace_id, delivered_at DESC)
  WHERE delivered_at IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN users.industry_segment IS 'User''s industry for Audience Labs segment matching (e.g., "roofing", "plumbing")';
COMMENT ON COLUMN users.location_segment IS 'User''s location for Audience Labs segment matching (e.g., "dallas", "houston")';
COMMENT ON COLUMN users.daily_lead_limit IS 'Number of leads to deliver daily (10 for free, 100 for paid)';
COMMENT ON COLUMN users.ghl_sub_account_id IS 'GoHighLevel sub-account ID if user has Pixel + CRM tier';
COMMENT ON COLUMN users.ghl_login_url IS 'GoHighLevel login URL for user''s sub-account';
COMMENT ON COLUMN users.emailbison_account_id IS 'Email Bison account ID if user has Email Campaigns tier';

COMMENT ON TABLE audience_lab_segments IS 'Mapping of industry/location combinations to Audience Labs segment IDs';
COMMENT ON TABLE feature_requests IS 'User requests for upsell features (Pixel, Email Campaigns, Custom Audiences, etc.)';

COMMENT ON COLUMN leads.metadata IS 'Additional lead data from Audience Labs (city, state, domain, etc.)';
COMMENT ON COLUMN leads.delivered_at IS 'Timestamp when lead was delivered to user (for daily distribution tracking)';
