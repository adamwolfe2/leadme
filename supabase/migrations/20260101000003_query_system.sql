-- OpenInfo Platform - Query System Migration
-- Creates queries and saved searches tables

-- ============================================================================
-- QUERIES TABLE
-- ============================================================================
CREATE TYPE query_status AS ENUM ('active', 'paused', 'completed');

CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES global_topics(id) ON DELETE RESTRICT,

  -- Query configuration
  name TEXT,
  filters JSONB NOT NULL DEFAULT '{
    "location": null,
    "company_size": null,
    "industry": null,
    "revenue_range": null,
    "employee_range": null,
    "technologies": null,
    "exclude_companies": []
  }'::jsonb,

  -- Status
  status query_status NOT NULL DEFAULT 'active',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,

  -- Stats
  total_leads_generated INTEGER NOT NULL DEFAULT 0,
  leads_this_week INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT query_name_not_empty CHECK (name IS NULL OR length(trim(name)) > 0)
);

-- Indexes for queries
CREATE INDEX idx_queries_workspace_id ON queries(workspace_id);
CREATE INDEX idx_queries_topic_id ON queries(topic_id);
CREATE INDEX idx_queries_status ON queries(status);
CREATE INDEX idx_queries_next_run_at ON queries(next_run_at) WHERE status = 'active';
CREATE INDEX idx_queries_created_at ON queries(created_at DESC);

-- GIN index for filter queries
CREATE INDEX idx_queries_filters ON queries USING GIN(filters);

-- Updated_at trigger
CREATE TRIGGER queries_updated_at
  BEFORE UPDATE ON queries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAVED SEARCHES TABLE
-- ============================================================================
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Search details
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Usage stats
  last_used_at TIMESTAMPTZ,
  use_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT saved_search_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Indexes for saved searches
CREATE INDEX idx_saved_searches_workspace_id ON saved_searches(workspace_id);
CREATE INDEX idx_saved_searches_created_by ON saved_searches(created_by);
CREATE INDEX idx_saved_searches_use_count ON saved_searches(use_count DESC);

-- GIN index for filter queries
CREATE INDEX idx_saved_searches_filters ON saved_searches USING GIN(filters);

-- Updated_at trigger
CREATE TRIGGER saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on queries
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Queries: Workspace isolation
CREATE POLICY "Workspace isolation for queries" ON queries
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Enable RLS on saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Saved searches: Workspace isolation
CREATE POLICY "Workspace isolation for saved searches" ON saved_searches
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

-- Function to check query limit based on plan
CREATE OR REPLACE FUNCTION check_query_limit(user_workspace_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan user_plan;
  query_count INTEGER;
BEGIN
  -- Get user's plan
  SELECT plan INTO user_plan
  FROM users
  WHERE auth_user_id = auth.uid()
  AND workspace_id = user_workspace_id
  LIMIT 1;

  -- Count active queries
  SELECT COUNT(*) INTO query_count
  FROM queries
  WHERE workspace_id = user_workspace_id
  AND status = 'active';

  -- Check limits: Free = 1 query, Pro = 5 queries
  IF user_plan = 'free' THEN
    RETURN query_count < 1;
  ELSIF user_plan = 'pro' THEN
    RETURN query_count < 5;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active queries for cron processing
CREATE OR REPLACE FUNCTION get_active_queries_for_processing()
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
  topic_id UUID,
  filters JSONB,
  topic TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.workspace_id,
    q.topic_id,
    q.filters,
    gt.topic
  FROM queries q
  INNER JOIN global_topics gt ON gt.id = q.topic_id
  WHERE q.status = 'active'
  AND (q.next_run_at IS NULL OR q.next_run_at <= NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update query run times
CREATE OR REPLACE FUNCTION update_query_run_time(query_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE queries
  SET
    last_run_at = NOW(),
    next_run_at = NOW() + INTERVAL '1 day'
  WHERE id = query_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment query stats
CREATE OR REPLACE FUNCTION increment_query_leads(query_id UUID, lead_count INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE queries
  SET
    total_leads_generated = total_leads_generated + lead_count,
    leads_this_week = leads_this_week + lead_count
  WHERE id = query_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset weekly lead counts (to be called weekly)
CREATE OR REPLACE FUNCTION reset_weekly_lead_counts()
RETURNS void AS $$
  UPDATE queries SET leads_this_week = 0;
$$ LANGUAGE sql;

-- Function to auto-name query based on filters
CREATE OR REPLACE FUNCTION generate_query_name(
  topic_name TEXT,
  query_filters JSONB
)
RETURNS TEXT AS $$
DECLARE
  name_parts TEXT[];
  location TEXT;
  industry TEXT[];
BEGIN
  name_parts := ARRAY[topic_name];

  -- Add location if present
  IF query_filters ? 'location' AND query_filters->'location' IS NOT NULL THEN
    location := query_filters->'location'->>'country';
    IF location IS NOT NULL THEN
      name_parts := array_append(name_parts, 'in ' || location);
    END IF;
  END IF;

  -- Add industry if present
  IF query_filters ? 'industry' AND query_filters->'industry' IS NOT NULL THEN
    industry := ARRAY(SELECT jsonb_array_elements_text(query_filters->'industry'));
    IF array_length(industry, 1) > 0 THEN
      name_parts := array_append(name_parts, '(' || industry[1] || ')');
    END IF;
  END IF;

  RETURN array_to_string(name_parts, ' ');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-generate query name if not provided
CREATE OR REPLACE FUNCTION set_query_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS NULL THEN
    NEW.name := generate_query_name(
      (SELECT topic FROM global_topics WHERE id = NEW.topic_id),
      NEW.filters
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queries_set_name
  BEFORE INSERT ON queries
  FOR EACH ROW
  EXECUTE FUNCTION set_query_name();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE queries IS 'User-created queries to track companies researching specific topics';
COMMENT ON TABLE saved_searches IS 'Reusable search filter configurations';
COMMENT ON COLUMN queries.filters IS 'JSONB object containing location, company_size, industry filters';
COMMENT ON FUNCTION check_query_limit IS 'Enforces plan limits: Free=1 query, Pro=5 queries';
COMMENT ON FUNCTION get_active_queries_for_processing IS 'Gets queries ready for daily lead generation';
