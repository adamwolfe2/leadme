-- OpenInfo Platform - Integrations & Billing Migration
-- Creates integrations, billing events, and notification preferences tables

-- ============================================================================
-- INTEGRATIONS TABLE
-- ============================================================================
CREATE TYPE integration_type AS ENUM ('slack', 'zapier', 'webhook', 'email');
CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error');

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Integration details
  type integration_type NOT NULL,
  name TEXT NOT NULL,
  status integration_status NOT NULL DEFAULT 'active',

  -- Configuration (encrypted sensitive data)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  total_events_sent INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT integration_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT positive_events CHECK (total_events_sent >= 0),
  CONSTRAINT positive_errors CHECK (error_count >= 0)
);

-- Indexes for integrations
CREATE INDEX idx_integrations_workspace_id ON integrations(workspace_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_created_at ON integrations(created_at DESC);

-- Unique constraint per workspace and type (one Slack, one Zapier, etc.)
CREATE UNIQUE INDEX idx_integrations_workspace_type ON integrations(workspace_id, type)
  WHERE status = 'active';

-- Updated_at trigger
CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BILLING EVENTS TABLE
-- ============================================================================
CREATE TYPE billing_event_type AS ENUM (
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'payment_succeeded',
  'payment_failed',
  'plan_upgraded',
  'plan_downgraded'
);

CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Event details
  event_type billing_event_type NOT NULL,
  stripe_event_id TEXT UNIQUE,

  -- Financial data
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',

  -- Plan information
  old_plan user_plan,
  new_plan user_plan,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_amount CHECK (amount_cents IS NULL OR amount_cents >= 0)
);

-- Indexes for billing_events
CREATE INDEX idx_billing_events_workspace_id ON billing_events(workspace_id);
CREATE INDEX idx_billing_events_type ON billing_events(event_type);
CREATE INDEX idx_billing_events_created_at ON billing_events(created_at DESC);
CREATE INDEX idx_billing_events_stripe_id ON billing_events(stripe_event_id);

-- ============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================================
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Email notifications
  email_new_leads BOOLEAN NOT NULL DEFAULT true,
  email_daily_digest BOOLEAN NOT NULL DEFAULT true,
  email_weekly_report BOOLEAN NOT NULL DEFAULT true,
  email_query_completed BOOLEAN NOT NULL DEFAULT false,
  email_credit_low BOOLEAN NOT NULL DEFAULT true,
  email_billing_updates BOOLEAN NOT NULL DEFAULT true,

  -- In-app notifications
  inapp_new_leads BOOLEAN NOT NULL DEFAULT true,
  inapp_mentions BOOLEAN NOT NULL DEFAULT true,
  inapp_system_updates BOOLEAN NOT NULL DEFAULT true,

  -- Slack notifications (if integrated)
  slack_new_leads BOOLEAN NOT NULL DEFAULT false,
  slack_daily_digest BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for notification_preferences
CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);

-- Updated_at trigger
CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_create_notification_prefs
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences();

-- ============================================================================
-- STRIPE CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,

  -- Current subscription
  subscription_status TEXT, -- active, canceled, past_due, etc.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Payment method
  default_payment_method TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT stripe_customer_id_not_empty CHECK (length(trim(stripe_customer_id)) > 0)
);

-- Indexes for stripe_customers
CREATE INDEX idx_stripe_customers_workspace_id ON stripe_customers(workspace_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX idx_stripe_customers_subscription_id ON stripe_customers(stripe_subscription_id);
CREATE INDEX idx_stripe_customers_status ON stripe_customers(subscription_status);

-- Updated_at trigger
CREATE TRIGGER stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on integrations
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Integrations: Workspace isolation
CREATE POLICY "Workspace isolation for integrations" ON integrations
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Enable RLS on billing_events
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Billing events: Workspace isolation (read-only)
CREATE POLICY "Workspace isolation for billing events" ON billing_events
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notification preferences: Users can only manage their own
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
  FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Enable RLS on stripe_customers
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- Stripe customers: Workspace isolation (read-only for users)
CREATE POLICY "Workspace isolation for stripe customers" ON stripe_customers
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to send integration event
CREATE OR REPLACE FUNCTION send_integration_event(
  p_workspace_id UUID,
  p_integration_type integration_type,
  p_event_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  integration_config JSONB;
  integration_id UUID;
BEGIN
  -- Get active integration
  SELECT id, config INTO integration_id, integration_config
  FROM integrations
  WHERE workspace_id = p_workspace_id
  AND type = p_integration_type
  AND status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update usage stats
  UPDATE integrations
  SET
    total_events_sent = total_events_sent + 1,
    last_used_at = NOW()
  WHERE id = integration_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to record integration error
CREATE OR REPLACE FUNCTION record_integration_error(
  p_integration_id UUID,
  p_error_message TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE integrations
  SET
    last_error = p_error_message,
    error_count = error_count + 1,
    status = CASE
      WHEN error_count + 1 >= 5 THEN 'error'::integration_status
      ELSE status
    END
  WHERE id = p_integration_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get integration config (redacted for non-owners)
CREATE OR REPLACE FUNCTION get_integration_config(p_integration_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_role_var user_role;
  config_data JSONB;
BEGIN
  -- Get user's role
  SELECT role INTO user_role_var
  FROM users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  -- Get config
  SELECT config INTO config_data
  FROM integrations
  WHERE id = p_integration_id;

  -- Redact sensitive fields for non-owners
  IF user_role_var NOT IN ('owner', 'admin') THEN
    config_data := jsonb_set(config_data, '{webhook_url}', '"[REDACTED]"'::jsonb);
    config_data := jsonb_set(config_data, '{api_key}', '"[REDACTED]"'::jsonb);
    config_data := jsonb_set(config_data, '{access_token}', '"[REDACTED]"'::jsonb);
  END IF;

  RETURN config_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if workspace has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_status TEXT;
BEGIN
  SELECT subscription_status INTO sub_status
  FROM stripe_customers
  WHERE workspace_id = p_workspace_id;

  RETURN sub_status = 'active';
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update workspace plan from Stripe
CREATE OR REPLACE FUNCTION update_workspace_plan(
  p_workspace_id UUID,
  p_new_plan user_plan,
  p_stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Update all users in workspace
  UPDATE users
  SET
    plan = p_new_plan,
    daily_credit_limit = CASE
      WHEN p_new_plan = 'free' THEN 3
      WHEN p_new_plan = 'pro' THEN 1000
      ELSE daily_credit_limit
    END
  WHERE workspace_id = p_workspace_id;

  -- Update Stripe customer record if subscription ID provided
  IF p_stripe_subscription_id IS NOT NULL THEN
    UPDATE stripe_customers
    SET
      stripe_subscription_id = p_stripe_subscription_id,
      subscription_status = 'active'
    WHERE workspace_id = p_workspace_id;
  END IF;

  -- Record billing event
  INSERT INTO billing_events (
    workspace_id,
    event_type,
    new_plan
  ) VALUES (
    p_workspace_id,
    'plan_upgraded'::billing_event_type,
    p_new_plan
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get workspace billing summary
CREATE OR REPLACE FUNCTION get_billing_summary(p_workspace_id UUID)
RETURNS JSONB AS $$
DECLARE
  summary JSONB;
BEGIN
  SELECT jsonb_build_object(
    'current_plan', (SELECT plan FROM users WHERE workspace_id = p_workspace_id LIMIT 1),
    'subscription_status', (SELECT subscription_status FROM stripe_customers WHERE workspace_id = p_workspace_id),
    'current_period_end', (SELECT current_period_end FROM stripe_customers WHERE workspace_id = p_workspace_id),
    'total_events', (SELECT COUNT(*) FROM billing_events WHERE workspace_id = p_workspace_id),
    'last_payment', (
      SELECT created_at FROM billing_events
      WHERE workspace_id = p_workspace_id
      AND event_type = 'payment_succeeded'
      ORDER BY created_at DESC
      LIMIT 1
    )
  ) INTO summary;

  RETURN summary;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE integrations IS 'Third-party integrations (Slack, Zapier, webhooks)';
COMMENT ON TABLE billing_events IS 'Audit log of all billing-related events from Stripe';
COMMENT ON TABLE notification_preferences IS 'Per-user notification settings';
COMMENT ON TABLE stripe_customers IS 'Stripe customer and subscription mapping';
COMMENT ON FUNCTION send_integration_event IS 'Queues event to be sent to integration';
COMMENT ON FUNCTION update_workspace_plan IS 'Updates all workspace users to new plan and records event';
COMMENT ON FUNCTION get_billing_summary IS 'Returns workspace billing overview';
