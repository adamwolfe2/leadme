-- Add partner approval and business subscription fields to users
-- Date: 2026-02-01
-- Purpose: Enable partner vs business user distinction for marketplace

-- Add partner_approved field for quick access control (auto-approved)
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_approved BOOLEAN DEFAULT true;

-- Add active_subscription field for business access control
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_subscription BOOLEAN DEFAULT false;

-- Add subscription_plan_id to link to Stripe subscription
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan_id TEXT;

-- Add subscription dates for tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create index for faster partner lookup
CREATE INDEX IF NOT EXISTS idx_users_role_partner ON users(role) WHERE role = 'partner';
CREATE INDEX IF NOT EXISTS idx_users_active_subscription ON users(active_subscription) WHERE active_subscription = true;

-- Add comments for documentation
COMMENT ON COLUMN users.partner_approved IS 'Whether partner account is approved to upload leads';
COMMENT ON COLUMN users.active_subscription IS 'Whether business user has an active subscription to access marketplace';
COMMENT ON COLUMN users.subscription_plan_id IS 'Stripe subscription ID for business users';

-- Create helper function to check business access
CREATE OR REPLACE FUNCTION has_marketplace_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = user_id
    AND role IN ('owner', 'admin', 'member')
    AND active_subscription = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check partner upload access
CREATE OR REPLACE FUNCTION can_upload_leads(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = user_id
    AND role = 'partner'
    AND partner_approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-approve all existing partners
UPDATE users SET partner_approved = true WHERE role = 'partner';

-- Set active_subscription = true for users with paid plans
UPDATE users SET active_subscription = true WHERE plan IN ('starter', 'pro', 'enterprise');
