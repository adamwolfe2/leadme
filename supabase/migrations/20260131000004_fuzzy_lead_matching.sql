-- Migration: Add fuzzy lead matching using PostgreSQL trigram similarity
-- Enables detection of duplicate leads even with typos (e.g., acme.com vs acmee.com)

-- Enable pg_trgm extension for trigram similarity matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes for fast trigram similarity searches
-- These indexes speed up fuzzy matching on company names and emails
CREATE INDEX IF NOT EXISTS idx_leads_company_name_trgm
ON leads USING gin (company_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_leads_email_trgm
ON leads USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_leads_linkedin_url_trgm
ON leads USING gin (linkedin_url gin_trgm_ops);

-- Create function to find similar leads using fuzzy matching
-- Returns leads that are similar based on company name, email, or LinkedIn URL
CREATE OR REPLACE FUNCTION find_similar_leads(
  p_company_name VARCHAR DEFAULT NULL,
  p_email VARCHAR DEFAULT NULL,
  p_linkedin_url VARCHAR DEFAULT NULL,
  p_similarity_threshold REAL DEFAULT 0.8,
  p_workspace_id UUID DEFAULT NULL
)
RETURNS TABLE (
  lead_id UUID,
  similarity_score REAL,
  match_field VARCHAR,
  matched_company_name VARCHAR,
  matched_email VARCHAR,
  matched_linkedin_url VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id AS lead_id,
    GREATEST(
      COALESCE(similarity(l.company_name, p_company_name), 0),
      COALESCE(similarity(l.email, p_email), 0),
      COALESCE(similarity(l.linkedin_url, p_linkedin_url), 0)
    ) AS similarity_score,
    CASE
      WHEN similarity(l.company_name, p_company_name) >= p_similarity_threshold THEN 'company_name'
      WHEN similarity(l.email, p_email) >= p_similarity_threshold THEN 'email'
      WHEN similarity(l.linkedin_url, p_linkedin_url) >= p_similarity_threshold THEN 'linkedin_url'
      ELSE 'unknown'
    END AS match_field,
    l.company_name AS matched_company_name,
    l.email AS matched_email,
    l.linkedin_url AS matched_linkedin_url
  FROM leads l
  WHERE
    (p_workspace_id IS NULL OR l.workspace_id = p_workspace_id)
    AND (
      (p_company_name IS NOT NULL AND similarity(l.company_name, p_company_name) >= p_similarity_threshold)
      OR (p_email IS NOT NULL AND similarity(l.email, p_email) >= p_similarity_threshold)
      OR (p_linkedin_url IS NOT NULL AND similarity(l.linkedin_url, p_linkedin_url) >= p_similarity_threshold)
    )
  ORDER BY similarity_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_similar_leads IS
'Finds leads similar to the provided criteria using fuzzy matching (trigram similarity).
Useful for detecting duplicates even with typos. Default similarity threshold is 0.8 (80% similar).';

-- Create function to check if a lead is a duplicate (exact or fuzzy match)
-- Returns the ID of the duplicate lead if found, NULL otherwise
CREATE OR REPLACE FUNCTION check_lead_duplicate(
  p_company_name VARCHAR,
  p_email VARCHAR DEFAULT NULL,
  p_linkedin_url VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_workspace_id UUID DEFAULT NULL,
  p_use_fuzzy_matching BOOLEAN DEFAULT TRUE
)
RETURNS UUID AS $$
DECLARE
  v_duplicate_id UUID;
  v_hash VARCHAR;
BEGIN
  -- STEP 1: Check for exact duplicates using hash
  v_hash := MD5(
    COALESCE(LOWER(TRIM(p_company_name)), '') || '::' ||
    COALESCE(LOWER(TRIM(p_email)), '') || '::' ||
    COALESCE(LOWER(TRIM(p_linkedin_url)), '') || '::' ||
    COALESCE(LOWER(TRIM(p_phone)), '')
  );

  SELECT id INTO v_duplicate_id
  FROM leads
  WHERE dedupe_hash = v_hash
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
  LIMIT 1;

  IF v_duplicate_id IS NOT NULL THEN
    RETURN v_duplicate_id;
  END IF;

  -- STEP 2: If fuzzy matching enabled, check for similar leads
  IF p_use_fuzzy_matching THEN
    SELECT lead_id INTO v_duplicate_id
    FROM find_similar_leads(
      p_company_name,
      p_email,
      p_linkedin_url,
      0.85, -- 85% similarity threshold for duplicates
      p_workspace_id
    )
    LIMIT 1;

    IF v_duplicate_id IS NOT NULL THEN
      RETURN v_duplicate_id;
    END IF;
  END IF;

  -- No duplicate found
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_lead_duplicate IS
'Checks if a lead is a duplicate using both exact hash matching and fuzzy similarity matching.
Returns the UUID of the duplicate lead if found, NULL otherwise.
Use p_use_fuzzy_matching=FALSE to disable fuzzy matching and only check exact duplicates.';

-- Create function to merge duplicate leads
-- Merges a duplicate lead into the primary lead, preserving the older created_at
CREATE OR REPLACE FUNCTION merge_duplicate_leads(
  p_primary_lead_id UUID,
  p_duplicate_lead_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_primary_created TIMESTAMPTZ;
  v_duplicate_created TIMESTAMPTZ;
BEGIN
  -- Get created_at timestamps
  SELECT created_at INTO v_primary_created
  FROM leads
  WHERE id = p_primary_lead_id;

  SELECT created_at INTO v_duplicate_created
  FROM leads
  WHERE id = p_duplicate_lead_id;

  -- Ensure we keep the older record as primary
  IF v_duplicate_created < v_primary_created THEN
    RAISE EXCEPTION 'Cannot merge: duplicate lead (%) is older than primary lead (%). Swap them and retry.',
      p_duplicate_lead_id, p_primary_lead_id;
  END IF;

  -- Update references in marketplace_purchases to point to primary lead
  UPDATE marketplace_purchase_items
  SET lead_id = p_primary_lead_id
  WHERE lead_id = p_duplicate_lead_id;

  -- Update references in lead_deliveries to point to primary lead
  UPDATE lead_deliveries
  SET lead_id = p_primary_lead_id
  WHERE lead_id = p_duplicate_lead_id;

  -- Merge enrichment data from duplicate if primary is missing it
  UPDATE leads
  SET
    email = COALESCE(leads.email, dup.email),
    phone = COALESCE(leads.phone, dup.phone),
    first_name = COALESCE(leads.first_name, dup.first_name),
    last_name = COALESCE(leads.last_name, dup.last_name),
    job_title = COALESCE(leads.job_title, dup.job_title),
    linkedin_url = COALESCE(leads.linkedin_url, dup.linkedin_url),
    company_location = COALESCE(leads.company_location, dup.company_location),
    company_industry = COALESCE(leads.company_industry, dup.company_industry),
    updated_at = NOW()
  FROM leads dup
  WHERE leads.id = p_primary_lead_id
    AND dup.id = p_duplicate_lead_id;

  -- Soft delete the duplicate lead
  UPDATE leads
  SET
    is_deleted = TRUE,
    deleted_at = NOW(),
    deleted_reason = 'merged_duplicate',
    updated_at = NOW()
  WHERE id = p_duplicate_lead_id;

  RAISE NOTICE 'Merged duplicate lead % into primary lead %', p_duplicate_lead_id, p_primary_lead_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION merge_duplicate_leads IS
'Merges a duplicate lead into the primary lead, updating all references and soft-deleting the duplicate.
Preserves the older lead as primary. Enrichment data from duplicate is merged if primary is missing it.';

-- Add columns to leads table for tracking duplicates
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(100);

-- Add index for filtering out deleted leads
CREATE INDEX IF NOT EXISTS idx_leads_not_deleted
ON leads(is_deleted, workspace_id)
WHERE is_deleted = FALSE;

-- Add check constraint for valid deleted_reason
ALTER TABLE leads
ADD CONSTRAINT check_valid_deleted_reason
CHECK (
  deleted_reason IS NULL OR
  deleted_reason IN (
    'merged_duplicate',
    'data_quality',
    'user_request',
    'manual_deletion'
  )
);

-- Comments for documentation
COMMENT ON COLUMN leads.is_deleted IS
'Soft delete flag. Deleted leads are hidden from queries but preserved for audit trail.';

COMMENT ON COLUMN leads.deleted_at IS
'Timestamp when the lead was soft-deleted.';

COMMENT ON COLUMN leads.deleted_reason IS
'Reason why the lead was deleted (merged_duplicate, data_quality, user_request, manual_deletion).';

-- Create view for non-deleted leads (convenience)
CREATE OR REPLACE VIEW active_leads AS
SELECT *
FROM leads
WHERE is_deleted = FALSE OR is_deleted IS NULL;

COMMENT ON VIEW active_leads IS
'View of all active (non-deleted) leads. Use this view instead of querying leads table directly to automatically filter out deleted leads.';
