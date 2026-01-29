-- ============================================================================
-- PERFORMANCE OPTIMIZATION - INDEXES
-- Safe additions that improve query performance
-- Created: 2026-01-28
-- ============================================================================

-- ============================================================================
-- 1. FOREIGN KEY INDEXES (Critical for RLS performance)
-- ============================================================================

-- Users table
CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Leads table
CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_partner_id ON leads(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_upload_batch_id ON leads(upload_batch_id) WHERE upload_batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_query_id ON leads(query_id) WHERE query_id IS NOT NULL;

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_workspace ON marketplace_purchases(buyer_workspace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_user ON marketplace_purchases(buyer_user_id) WHERE buyer_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mpi_purchase_id ON marketplace_purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_mpi_lead_id ON marketplace_purchase_items(lead_id);
CREATE INDEX IF NOT EXISTS idx_mpi_partner_id ON marketplace_purchase_items(partner_id) WHERE partner_id IS NOT NULL;

-- Partner indexes
CREATE INDEX IF NOT EXISTS idx_partner_batches_partner ON partner_upload_batches(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_partner ON payouts(partner_id);

-- Campaign indexes
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign ON campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead ON campaign_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_lead ON email_sends(lead_id);

-- ============================================================================
-- 2. COMMON QUERY PATTERN INDEXES
-- ============================================================================

-- Marketplace browsing (most common query)
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_browse ON leads(
  is_marketplace_listed,
  company_industry,
  verification_status,
  intent_score_calculated DESC,
  freshness_score DESC
) WHERE is_marketplace_listed = true;

-- Marketplace filtering by location
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_location ON leads(
  is_marketplace_listed,
  state
) WHERE is_marketplace_listed = true AND state IS NOT NULL;

-- Partner lead queries
CREATE INDEX IF NOT EXISTS idx_leads_partner_status ON leads(
  partner_id,
  verification_status,
  is_marketplace_listed
) WHERE partner_id IS NOT NULL;

-- Email verification queue processing
CREATE INDEX IF NOT EXISTS idx_verification_queue_pending ON email_verification_queue(
  status,
  priority DESC,
  scheduled_at ASC
) WHERE status = 'pending';

-- Commission processing
CREATE INDEX IF NOT EXISTS idx_mpi_commission_pending ON marketplace_purchase_items(
  commission_status,
  commission_payable_at
) WHERE commission_status = 'pending_holdback';

-- Campaign leads ready for sending
CREATE INDEX IF NOT EXISTS idx_campaign_leads_ready ON campaign_leads(
  campaign_id,
  status,
  next_email_scheduled_at
) WHERE status IN ('ready', 'in_sequence');

-- Notifications for user
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(
  user_id,
  workspace_id,
  is_read,
  created_at DESC
) WHERE is_read = false;

-- ============================================================================
-- 3. TIMESTAMP INDEXES FOR TIME-BASED QUERIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_created ON marketplace_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_batches_created ON partner_upload_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC) WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'audit_logs');
CREATE INDEX IF NOT EXISTS idx_marketplace_audit_created ON marketplace_audit_log(created_at DESC);

-- ============================================================================
-- 4. PARTIAL INDEXES FOR STATUS FILTERING
-- ============================================================================

-- Active partners only
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(partner_score DESC)
  WHERE status = 'active';

-- Pending partners for admin review
CREATE INDEX IF NOT EXISTS idx_partners_pending ON partners(created_at DESC)
  WHERE status = 'pending';

-- Completed purchases only
CREATE INDEX IF NOT EXISTS idx_purchases_completed ON marketplace_purchases(created_at DESC)
  WHERE status = 'completed';

-- Active campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON email_campaigns(workspace_id, created_at DESC)
  WHERE status = 'active';

-- ============================================================================
-- 5. GIN INDEXES FOR JSONB QUERIES
-- ============================================================================

-- Lead contact data search
CREATE INDEX IF NOT EXISTS idx_leads_contact_data ON leads USING GIN(contact_data)
  WHERE contact_data IS NOT NULL;

-- Lead company location
CREATE INDEX IF NOT EXISTS idx_leads_company_location ON leads USING GIN(company_location)
  WHERE company_location IS NOT NULL;

-- Lead SIC codes array
CREATE INDEX IF NOT EXISTS idx_leads_sic_codes ON leads USING GIN(sic_codes)
  WHERE sic_codes IS NOT NULL;

-- ============================================================================
-- 6. TEXT SEARCH INDEXES
-- ============================================================================

-- Company name search
CREATE INDEX IF NOT EXISTS idx_leads_company_name_text ON leads USING gin(to_tsvector('english', company_name))
  WHERE company_name IS NOT NULL;

-- ============================================================================
-- 7. ANALYZE TABLES AFTER INDEX CREATION
-- ============================================================================

ANALYZE leads;
ANALYZE marketplace_purchases;
ANALYZE marketplace_purchase_items;
ANALYZE partners;
ANALYZE partner_upload_batches;
ANALYZE email_verification_queue;
ANALYZE campaign_leads;
ANALYZE email_sends;
ANALYZE notifications;

-- ============================================================================
-- DONE - Performance indexes added
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Performance indexing migration completed successfully';
END $$;
