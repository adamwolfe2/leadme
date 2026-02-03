-- ============================================================================
-- Analytics Events Table
-- Track user interactions and service tier funnel
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event details
  event_name VARCHAR(255) NOT NULL,
  properties JSONB DEFAULT '{}',

  -- User & workspace (nullable for anonymous events)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_events_workspace_id ON analytics_events(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Composite index for user event history
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- GIN index for JSONB properties queries
CREATE INDEX idx_analytics_events_properties ON analytics_events USING GIN(properties);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Admin can view all events
CREATE POLICY "Admin can view all analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- System can insert events (via service role)
CREATE POLICY "System can insert analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- Analytics Aggregation Views
-- ============================================================================

-- Service tier funnel view
CREATE OR REPLACE VIEW service_tier_funnel AS
SELECT
  DATE(created_at) as date,
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT workspace_id) as unique_workspaces,
  properties->>'tier_slug' as tier_slug,
  properties->>'cta_location' as cta_location
FROM analytics_events
WHERE event_name LIKE 'service_tier%'
GROUP BY DATE(created_at), event_name, properties->>'tier_slug', properties->>'cta_location'
ORDER BY date DESC, event_count DESC;

-- Upsell performance view
CREATE OR REPLACE VIEW upsell_performance AS
SELECT
  DATE(created_at) as date,
  properties->>'upsell_location' as upsell_location,
  properties->>'upsell_type' as upsell_type,
  properties->>'target_tier' as target_tier,
  COUNT(CASE WHEN event_name = 'service_tier_upsell_displayed' THEN 1 END) as impressions,
  COUNT(CASE WHEN event_name = 'service_tier_upsell_clicked' THEN 1 END) as clicks,
  COUNT(CASE WHEN event_name = 'service_tier_upsell_dismissed' THEN 1 END) as dismissals,
  CASE
    WHEN COUNT(CASE WHEN event_name = 'service_tier_upsell_displayed' THEN 1 END) > 0
    THEN ROUND(
      COUNT(CASE WHEN event_name = 'service_tier_upsell_clicked' THEN 1 END)::NUMERIC /
      COUNT(CASE WHEN event_name = 'service_tier_upsell_displayed' THEN 1 END)::NUMERIC * 100,
      2
    )
    ELSE 0
  END as click_through_rate
FROM analytics_events
WHERE event_name LIKE 'service_tier_upsell%'
GROUP BY DATE(created_at), properties->>'upsell_location', properties->>'upsell_type', properties->>'target_tier'
ORDER BY date DESC, impressions DESC;

-- Checkout funnel view
CREATE OR REPLACE VIEW checkout_funnel AS
SELECT
  DATE(created_at) as date,
  properties->>'tier_slug' as tier_slug,
  COUNT(CASE WHEN event_name = 'service_tier_checkout_started' THEN 1 END) as started,
  COUNT(CASE WHEN event_name = 'service_tier_checkout_completed' THEN 1 END) as completed,
  COUNT(CASE WHEN event_name = 'service_tier_checkout_abandoned' THEN 1 END) as abandoned,
  CASE
    WHEN COUNT(CASE WHEN event_name = 'service_tier_checkout_started' THEN 1 END) > 0
    THEN ROUND(
      COUNT(CASE WHEN event_name = 'service_tier_checkout_completed' THEN 1 END)::NUMERIC /
      COUNT(CASE WHEN event_name = 'service_tier_checkout_started' THEN 1 END)::NUMERIC * 100,
      2
    )
    ELSE 0
  END as conversion_rate
FROM analytics_events
WHERE event_name LIKE 'service_tier_checkout%'
GROUP BY DATE(created_at), properties->>'tier_slug'
ORDER BY date DESC;

-- Feature lock interactions
CREATE OR REPLACE VIEW feature_lock_interactions AS
SELECT
  DATE(created_at) as date,
  properties->>'locked_feature' as locked_feature,
  properties->>'required_tier' as required_tier,
  COUNT(CASE WHEN event_name = 'service_tier_feature_lock_displayed' THEN 1 END) as displays,
  COUNT(CASE WHEN event_name = 'service_tier_feature_lock_upgrade_clicked' THEN 1 END) as upgrade_clicks,
  COUNT(DISTINCT user_id) as unique_users,
  CASE
    WHEN COUNT(CASE WHEN event_name = 'service_tier_feature_lock_displayed' THEN 1 END) > 0
    THEN ROUND(
      COUNT(CASE WHEN event_name = 'service_tier_feature_lock_upgrade_clicked' THEN 1 END)::NUMERIC /
      COUNT(CASE WHEN event_name = 'service_tier_feature_lock_displayed' THEN 1 END)::NUMERIC * 100,
      2
    )
    ELSE 0
  END as upgrade_click_rate
FROM analytics_events
WHERE event_name LIKE 'service_tier_feature_lock%'
GROUP BY DATE(created_at), properties->>'locked_feature', properties->>'required_tier'
ORDER BY date DESC, displays DESC;

COMMENT ON TABLE analytics_events IS 'Tracks user interactions and events for analytics';
COMMENT ON VIEW service_tier_funnel IS 'Service tier conversion funnel metrics';
COMMENT ON VIEW upsell_performance IS 'Upsell effectiveness metrics';
COMMENT ON VIEW checkout_funnel IS 'Checkout conversion metrics';
COMMENT ON VIEW feature_lock_interactions IS 'Feature lock interaction metrics';
