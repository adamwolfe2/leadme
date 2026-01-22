-- Add Intent Data and Platform Upload Fields to Leads Table
-- Supports warm/medium/hot scoring and platform uploads

BEGIN;

-- Add intent_data column to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS intent_data JSONB DEFAULT NULL;

COMMENT ON COLUMN leads.intent_data IS 'Intent signals and scoring data from DataShopper';

-- Add platform upload tracking columns
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS platform_uploaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS platform_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS platform_name TEXT DEFAULT NULL;

COMMENT ON COLUMN leads.platform_uploaded IS 'Whether lead has been uploaded to industry platform';
COMMENT ON COLUMN leads.platform_uploaded_at IS 'When lead was uploaded to platform';
COMMENT ON COLUMN leads.platform_name IS 'Name of the platform (tech-platform, finance-platform, etc.)';

-- Create index on intent_data for fast filtering by score
CREATE INDEX IF NOT EXISTS idx_leads_intent_score
ON leads ((intent_data->>'score'));

COMMENT ON INDEX idx_leads_intent_score IS 'Fast filtering by intent score (hot, warm, cold)';

-- Create index on platform_uploaded for tracking
CREATE INDEX IF NOT EXISTS idx_leads_platform_uploaded
ON leads (platform_uploaded, platform_uploaded_at)
WHERE platform_uploaded = TRUE;

COMMENT ON INDEX idx_leads_platform_uploaded IS 'Fast filtering of platform-uploaded leads';

-- Function: Get leads by intent score
CREATE OR REPLACE FUNCTION get_leads_by_intent_score(
  p_workspace_id UUID,
  p_score TEXT
)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  domain TEXT,
  intent_score TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    (l.company_data->>'name')::TEXT as company_name,
    (l.company_data->>'domain')::TEXT as domain,
    (l.intent_data->>'score')::TEXT as intent_score,
    l.created_at
  FROM leads l
  WHERE l.workspace_id = p_workspace_id
    AND l.intent_data->>'score' = p_score
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_leads_by_intent_score IS 'Get leads filtered by intent score (hot, warm, cold)';

-- Function: Get platform upload stats
CREATE OR REPLACE FUNCTION get_platform_upload_stats(
  p_workspace_id UUID
)
RETURNS TABLE (
  platform_name TEXT,
  hot_leads INTEGER,
  warm_leads INTEGER,
  total_leads INTEGER,
  last_upload TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.platform_name,
    COUNT(*) FILTER (WHERE l.intent_data->>'score' = 'hot')::INTEGER as hot_leads,
    COUNT(*) FILTER (WHERE l.intent_data->>'score' = 'warm')::INTEGER as warm_leads,
    COUNT(*)::INTEGER as total_leads,
    MAX(l.platform_uploaded_at) as last_upload
  FROM leads l
  WHERE l.workspace_id = p_workspace_id
    AND l.platform_uploaded = TRUE
  GROUP BY l.platform_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_platform_upload_stats IS 'Get statistics on platform uploads by workspace';

-- Function: Get leads ready for platform upload
CREATE OR REPLACE FUNCTION get_leads_ready_for_upload(
  p_workspace_id UUID,
  p_min_score TEXT DEFAULT 'warm'
)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  domain TEXT,
  industry TEXT,
  intent_score TEXT,
  enriched_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    (l.company_data->>'name')::TEXT as company_name,
    (l.company_data->>'domain')::TEXT as domain,
    (l.company_data->>'industry')::TEXT as industry,
    (l.intent_data->>'score')::TEXT as intent_score,
    l.enriched_at
  FROM leads l
  WHERE l.workspace_id = p_workspace_id
    AND l.enrichment_status = 'completed'
    AND l.platform_uploaded = FALSE
    AND (
      (p_min_score = 'warm' AND l.intent_data->>'score' IN ('warm', 'hot'))
      OR (p_min_score = 'hot' AND l.intent_data->>'score' = 'hot')
    )
  ORDER BY
    CASE l.intent_data->>'score'
      WHEN 'hot' THEN 1
      WHEN 'warm' THEN 2
      ELSE 3
    END,
    l.enriched_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_leads_ready_for_upload IS 'Get enriched leads ready for platform upload';

-- Create view for intent score breakdown
CREATE OR REPLACE VIEW lead_intent_breakdown AS
SELECT
  l.workspace_id,
  COUNT(*) FILTER (WHERE l.intent_data->>'score' = 'hot')::INTEGER as hot_count,
  COUNT(*) FILTER (WHERE l.intent_data->>'score' = 'warm')::INTEGER as warm_count,
  COUNT(*) FILTER (WHERE l.intent_data->>'score' = 'cold')::INTEGER as cold_count,
  COUNT(*)::INTEGER as total_count,
  ROUND(
    COUNT(*) FILTER (WHERE l.intent_data->>'score' = 'hot')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
    1
  ) as hot_percentage,
  ROUND(
    COUNT(*) FILTER (WHERE l.intent_data->>'score' = 'warm')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
    1
  ) as warm_percentage
FROM leads l
WHERE l.intent_data IS NOT NULL
GROUP BY l.workspace_id;

COMMENT ON VIEW lead_intent_breakdown IS 'Breakdown of leads by intent score per workspace';

COMMIT;
