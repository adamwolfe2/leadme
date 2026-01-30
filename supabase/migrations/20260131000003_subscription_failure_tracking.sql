-- Migration: Add subscription payment failure tracking and workspace access control
-- Enables tracking of failed payment attempts and disabling workspace access after repeated failures

-- Add columns to subscriptions table for tracking payment failures
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS failed_payment_count INTEGER DEFAULT 0;

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS last_payment_failed_at TIMESTAMPTZ;

-- Add columns to workspaces table for access control
ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS access_disabled BOOLEAN DEFAULT FALSE;

ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS access_disabled_reason VARCHAR(100);

ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS access_disabled_at TIMESTAMPTZ;

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_failed_payments
ON subscriptions(failed_payment_count, status)
WHERE failed_payment_count > 0;

CREATE INDEX IF NOT EXISTS idx_workspaces_access_disabled
ON workspaces(access_disabled)
WHERE access_disabled = TRUE;

-- Add check constraint for valid access_disabled_reason
ALTER TABLE workspaces
ADD CONSTRAINT check_valid_access_disabled_reason
CHECK (
  access_disabled_reason IS NULL OR
  access_disabled_reason IN (
    'subscription_payment_failed',
    'subscription_canceled',
    'terms_violation',
    'manual_suspension'
  )
);

-- Comments for documentation
COMMENT ON COLUMN subscriptions.failed_payment_count IS
'Number of consecutive failed payment attempts. Reset to 0 when payment succeeds.';

COMMENT ON COLUMN subscriptions.last_payment_failed_at IS
'Timestamp of the most recent failed payment attempt.';

COMMENT ON COLUMN workspaces.access_disabled IS
'Whether workspace access is disabled due to payment failure or other reasons.';

COMMENT ON COLUMN workspaces.access_disabled_reason IS
'Reason why workspace access was disabled (subscription_payment_failed, subscription_canceled, terms_violation, manual_suspension).';

COMMENT ON COLUMN workspaces.access_disabled_at IS
'Timestamp when workspace access was disabled.';

-- Function to check if workspace has active access
CREATE OR REPLACE FUNCTION workspace_has_active_access(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_disabled BOOLEAN;
  v_subscription_status VARCHAR;
BEGIN
  -- Check if workspace is disabled
  SELECT access_disabled INTO v_disabled
  FROM workspaces
  WHERE id = p_workspace_id;

  IF v_disabled THEN
    RETURN FALSE;
  END IF;

  -- Check subscription status
  SELECT status INTO v_subscription_status
  FROM subscriptions
  WHERE workspace_id = p_workspace_id;

  -- Allow access if no subscription (free plan) or subscription is active
  IF v_subscription_status IS NULL OR v_subscription_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Deny access for past_due, unpaid, or canceled subscriptions
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION workspace_has_active_access IS
'Checks if a workspace has active access based on subscription status and access_disabled flag. Returns TRUE if workspace can access the platform.';
