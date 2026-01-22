-- OpenInfo Platform - Core Tables Migration
-- Creates workspaces and users tables with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- WORKSPACES TABLE
-- ============================================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  industry_vertical TEXT,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,

  -- Branding
  branding JSONB DEFAULT '{
    "logo_url": null,
    "primary_color": "#3b82f6",
    "secondary_color": "#1e40af"
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT subdomain_format CHECK (subdomain ~ '^[a-z0-9-]+$')
);

-- Indexes for workspaces
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_subdomain ON workspaces(subdomain);
CREATE INDEX idx_workspaces_custom_domain ON workspaces(custom_domain);

-- Updated_at trigger for workspaces
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TYPE user_plan AS ENUM ('free', 'pro');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Profile
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Role & Plan
  role user_role NOT NULL DEFAULT 'member',
  plan user_plan NOT NULL DEFAULT 'free',

  -- Credits & Limits
  daily_credits_used INTEGER NOT NULL DEFAULT 0,
  daily_credit_limit INTEGER NOT NULL DEFAULT 3, -- Free: 3, Pro: 1000

  -- Referral
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_workspace_id ON users(workspace_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Updated_at trigger for users
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));

    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Workspaces: Users can only see their own workspace
CREATE POLICY "Users can view their own workspace" ON workspaces
  FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Workspaces: Only owners can update
CREATE POLICY "Owners can update workspace" ON workspaces
  FOR UPDATE
  USING (
    id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid() AND role = 'owner'
    )
  );

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users: Can view users in same workspace
CREATE POLICY "Users can view workspace members" ON users
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users: Can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Users: Admins can update workspace members
CREATE POLICY "Admins can update members" ON users
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's workspace_id
CREATE OR REPLACE FUNCTION get_user_workspace_id()
RETURNS UUID AS $$
  SELECT workspace_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(required_role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role = required_role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to reset daily credits (to be called by cron)
CREATE OR REPLACE FUNCTION reset_daily_credits()
RETURNS void AS $$
  UPDATE users SET daily_credits_used = 0;
$$ LANGUAGE sql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE workspaces IS 'Multi-tenant workspaces with branding and configuration';
COMMENT ON TABLE users IS 'User profiles linked to auth.users with workspace association';
COMMENT ON COLUMN users.daily_credit_limit IS 'Free: 3, Pro: 1000 credits per day';
COMMENT ON FUNCTION reset_daily_credits() IS 'Cron job to reset daily_credits_used at midnight';
