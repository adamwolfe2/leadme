-- OpenInfo Platform - People Search Migration
-- Creates people search and results tables

-- ============================================================================
-- PEOPLE SEARCH RESULTS TABLE
-- ============================================================================
CREATE TABLE people_search_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Person data
  person_data JSONB NOT NULL DEFAULT '{
    "full_name": null,
    "title": null,
    "company": null,
    "location": null,
    "linkedin_url": null,
    "email": null,
    "email_revealed": false,
    "phone": null,
    "seniority_level": null,
    "department": null,
    "technologies": []
  }'::jsonb,

  -- Search context
  search_filters JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Email reveal tracking
  email_revealed_at TIMESTAMPTZ,
  email_revealed_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT person_name_required CHECK (person_data->>'full_name' IS NOT NULL)
);

-- Indexes for people_search_results
CREATE INDEX idx_people_search_workspace_id ON people_search_results(workspace_id);
CREATE INDEX idx_people_search_user_id ON people_search_results(user_id);
CREATE INDEX idx_people_search_created_at ON people_search_results(created_at DESC);
CREATE INDEX idx_people_search_email_revealed ON people_search_results(email_revealed_at)
  WHERE email_revealed_at IS NOT NULL;

-- GIN indexes for JSONB queries
CREATE INDEX idx_people_search_person_data ON people_search_results USING GIN(person_data);
CREATE INDEX idx_people_search_filters ON people_search_results USING GIN(search_filters);

-- Composite index for deduplication (workspace + name + company)
CREATE INDEX idx_people_search_dedup ON people_search_results(
  workspace_id,
  (person_data->>'full_name'),
  (person_data->>'company')
);

-- ============================================================================
-- SAVED PEOPLE SEARCHES TABLE
-- ============================================================================
CREATE TABLE saved_people_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Search details
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{
    "title": null,
    "company": null,
    "location": null,
    "seniority_level": null,
    "department": null,
    "industry": null
  }'::jsonb,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  use_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT saved_people_search_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Indexes for saved_people_searches
CREATE INDEX idx_saved_people_searches_workspace_id ON saved_people_searches(workspace_id);
CREATE INDEX idx_saved_people_searches_user_id ON saved_people_searches(user_id);
CREATE INDEX idx_saved_people_searches_created_at ON saved_people_searches(created_at DESC);

-- GIN index for filters
CREATE INDEX idx_saved_people_searches_filters ON saved_people_searches USING GIN(filters);

-- Updated_at trigger
CREATE TRIGGER saved_people_searches_updated_at
  BEFORE UPDATE ON saved_people_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on people_search_results
ALTER TABLE people_search_results ENABLE ROW LEVEL SECURITY;

-- People search results: Workspace isolation
CREATE POLICY "Workspace isolation for people search" ON people_search_results
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Enable RLS on saved_people_searches
ALTER TABLE saved_people_searches ENABLE ROW LEVEL SECURITY;

-- Saved people searches: Workspace isolation
CREATE POLICY "Workspace isolation for saved people searches" ON saved_people_searches
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

-- Function to search people with filters
CREATE OR REPLACE FUNCTION search_people(
  p_workspace_id UUID,
  p_filters JSONB,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  person_data JSONB,
  email_revealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  title_filter TEXT;
  company_filter TEXT;
  location_filter TEXT;
  seniority_filter TEXT;
  department_filter TEXT;
BEGIN
  -- Extract filters
  title_filter := p_filters->>'title';
  company_filter := p_filters->>'company';
  location_filter := p_filters->>'location';
  seniority_filter := p_filters->>'seniority_level';
  department_filter := p_filters->>'department';

  RETURN QUERY
  SELECT
    psr.id,
    psr.person_data,
    psr.email_revealed_at,
    psr.created_at
  FROM people_search_results psr
  WHERE psr.workspace_id = p_workspace_id
  AND (title_filter IS NULL OR psr.person_data->>'title' ILIKE '%' || title_filter || '%')
  AND (company_filter IS NULL OR psr.person_data->>'company' ILIKE '%' || company_filter || '%')
  AND (location_filter IS NULL OR psr.person_data->>'location' ILIKE '%' || location_filter || '%')
  AND (seniority_filter IS NULL OR psr.person_data->>'seniority_level' = seniority_filter)
  AND (department_filter IS NULL OR psr.person_data->>'department' = department_filter)
  ORDER BY psr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to reveal email (costs credits)
CREATE OR REPLACE FUNCTION reveal_person_email(
  p_result_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  workspace_id_var UUID;
  person_email TEXT;
  credits_available BOOLEAN;
BEGIN
  -- Get workspace and check if email already revealed
  SELECT
    workspace_id,
    person_data->>'email',
    (person_data->>'email_revealed')::BOOLEAN
  INTO
    workspace_id_var,
    person_email,
    credits_available
  FROM people_search_results
  WHERE id = p_result_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Person not found';
  END IF;

  -- If already revealed, return email without charging
  IF credits_available THEN
    RETURN jsonb_build_object(
      'email', person_email,
      'already_revealed', true
    );
  END IF;

  -- Check if user has credits
  IF NOT check_credits_available(p_user_id, 1) THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Record credit usage
  PERFORM record_credit_usage(
    workspace_id_var,
    p_user_id,
    'email_reveal'::credit_action,
    1,
    p_result_id,
    jsonb_build_object('result_id', p_result_id)
  );

  -- Update result to mark email as revealed
  UPDATE people_search_results
  SET
    person_data = jsonb_set(person_data, '{email_revealed}', 'true'::jsonb),
    email_revealed_at = NOW(),
    email_revealed_by = p_user_id
  WHERE id = p_result_id;

  RETURN jsonb_build_object(
    'email', person_email,
    'already_revealed', false,
    'credits_used', 1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get people search stats
CREATE OR REPLACE FUNCTION get_people_search_stats(p_workspace_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_searches', COUNT(*),
    'emails_revealed', COUNT(*) FILTER (WHERE email_revealed_at IS NOT NULL),
    'unique_companies', COUNT(DISTINCT person_data->>'company'),
    'this_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))
  )
  INTO stats
  FROM people_search_results
  WHERE workspace_id = p_workspace_id;

  RETURN stats;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to deduplicate person (check if already exists)
CREATE OR REPLACE FUNCTION person_exists(
  p_workspace_id UUID,
  p_full_name TEXT,
  p_company TEXT
)
RETURNS UUID AS $$
DECLARE
  existing_id UUID;
BEGIN
  SELECT id INTO existing_id
  FROM people_search_results
  WHERE workspace_id = p_workspace_id
  AND person_data->>'full_name' = p_full_name
  AND person_data->>'company' = p_company
  LIMIT 1;

  RETURN existing_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update saved search usage
CREATE OR REPLACE FUNCTION update_saved_search_usage(p_search_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE saved_people_searches
  SET
    last_used_at = NOW(),
    use_count = use_count + 1
  WHERE id = p_search_id;
END;
$$ LANGUAGE plpgsql;

-- Function to export people search results to CSV format
CREATE OR REPLACE FUNCTION export_people_to_csv(
  p_workspace_id UUID,
  p_filters JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  full_name TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  email TEXT,
  linkedin_url TEXT,
  seniority_level TEXT,
  department TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    psr.person_data->>'full_name',
    psr.person_data->>'title',
    psr.person_data->>'company',
    psr.person_data->>'location',
    CASE
      WHEN (psr.person_data->>'email_revealed')::BOOLEAN THEN psr.person_data->>'email'
      ELSE '[HIDDEN]'
    END,
    psr.person_data->>'linkedin_url',
    psr.person_data->>'seniority_level',
    psr.person_data->>'department'
  FROM people_search_results psr
  WHERE psr.workspace_id = p_workspace_id
  ORDER BY psr.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE people_search_results IS 'Individual people found through search with optional email reveal';
COMMENT ON TABLE saved_people_searches IS 'Reusable people search filter configurations';
COMMENT ON COLUMN people_search_results.person_data IS 'JSONB containing all person details including email';
COMMENT ON FUNCTION reveal_person_email IS 'Reveals email for a person result, costs 1 credit';
COMMENT ON FUNCTION person_exists IS 'Checks if person already exists to prevent duplicates';
COMMENT ON FUNCTION search_people IS 'Full-text search across people with filters';
