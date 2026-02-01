-- Partner Attribution System
-- Date: 2026-02-01
-- Purpose: Track which partner uploaded each lead, handle purchases, and credit system

-- ============================================================================
-- 1. LEADS TABLE: Add partner tracking
-- ============================================================================

-- Track which partner uploaded each lead
ALTER TABLE leads ADD COLUMN IF NOT EXISTS uploaded_by_partner_id UUID REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS upload_source TEXT DEFAULT 'partner_upload';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ DEFAULT NOW();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_leads_partner ON leads(uploaded_by_partner_id);
CREATE INDEX IF NOT EXISTS idx_leads_upload_date ON leads(upload_date DESC);

-- Comments
COMMENT ON COLUMN leads.uploaded_by_partner_id IS 'Partner user who uploaded this lead';
COMMENT ON COLUMN leads.upload_source IS 'Source of upload: partner_upload, csv_upload, api_upload';
COMMENT ON COLUMN leads.upload_date IS 'When the lead was uploaded to the marketplace';

-- ============================================================================
-- 2. LEAD PURCHASES TABLE: Track all lead sales
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) UNIQUE NOT NULL, -- one purchase per lead
  buyer_user_id UUID REFERENCES users(id) NOT NULL,
  partner_id UUID REFERENCES users(id), -- denormalized from leads.uploaded_by_partner_id for fast queries
  purchase_price DECIMAL NOT NULL CHECK (purchase_price >= 0),
  partner_commission DECIMAL NOT NULL CHECK (partner_commission >= 0),
  platform_fee DECIMAL NOT NULL CHECK (platform_fee >= 0),
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchases_partner ON lead_purchases(partner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON lead_purchases(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_lead ON lead_purchases(lead_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON lead_purchases(purchased_at DESC);

-- Comments
COMMENT ON TABLE lead_purchases IS 'Tracks all lead purchases with partner attribution and commission breakdown';
COMMENT ON COLUMN lead_purchases.partner_id IS 'Denormalized partner ID for fast queries (copied from leads.uploaded_by_partner_id)';
COMMENT ON COLUMN lead_purchases.purchase_price IS 'Total price buyer paid ($20 per lead typically)';
COMMENT ON COLUMN lead_purchases.partner_commission IS 'Commission earned by partner (70% = $14)';
COMMENT ON COLUMN lead_purchases.platform_fee IS 'Platform fee (30% = $6)';

-- ============================================================================
-- 3. PARTNER CREDITS TABLE: Track partner balances
-- ============================================================================

CREATE TABLE IF NOT EXISTS partner_credits (
  partner_id UUID PRIMARY KEY REFERENCES users(id),
  balance DECIMAL DEFAULT 0 NOT NULL CHECK (balance >= 0),
  total_earned DECIMAL DEFAULT 0 NOT NULL CHECK (total_earned >= 0),
  total_withdrawn DECIMAL DEFAULT 0 NOT NULL CHECK (total_withdrawn >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comments
COMMENT ON TABLE partner_credits IS 'Current credit balance for each partner';
COMMENT ON COLUMN partner_credits.balance IS 'Current available balance (earned - withdrawn)';
COMMENT ON COLUMN partner_credits.total_earned IS 'Lifetime total earnings from lead sales';
COMMENT ON COLUMN partner_credits.total_withdrawn IS 'Lifetime total withdrawn/paid out';

-- ============================================================================
-- 4. PARTNER CREDIT TRANSACTIONS TABLE: Transaction log
-- ============================================================================

CREATE TABLE IF NOT EXISTS partner_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'payout_request', 'payout_completed', 'adjustment')),
  lead_purchase_id UUID REFERENCES lead_purchases(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast partner transaction history
CREATE INDEX IF NOT EXISTS idx_credit_txns_partner ON partner_credit_transactions(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_txns_type ON partner_credit_transactions(type);

-- Comments
COMMENT ON TABLE partner_credit_transactions IS 'Immutable log of all partner credit transactions';
COMMENT ON COLUMN partner_credit_transactions.type IS 'Transaction type: earned (from sale), payout_request, payout_completed, adjustment (manual)';
COMMENT ON COLUMN partner_credit_transactions.lead_purchase_id IS 'Reference to lead purchase if type=earned';
COMMENT ON COLUMN partner_credit_transactions.metadata IS 'Additional data: payout method, stripe payout ID, admin notes, etc.';

-- ============================================================================
-- 5. PARTNER ANALYTICS VIEW: Dashboard metrics
-- ============================================================================

CREATE OR REPLACE VIEW partner_analytics AS
SELECT
  u.id as partner_id,
  u.full_name as partner_name,
  u.email as partner_email,
  COUNT(DISTINCT l.id) as total_leads_uploaded,
  COUNT(DISTINCT lp.id) as leads_sold,
  COALESCE(SUM(lp.partner_commission), 0) as total_revenue,
  COALESCE(pc.balance, 0) as current_balance,
  COALESCE(pc.total_earned, 0) as lifetime_earnings,
  COALESCE(pc.total_withdrawn, 0) as total_withdrawn,
  ROUND(
    (COUNT(DISTINCT lp.id)::float / NULLIF(COUNT(DISTINCT l.id), 0) * 100),
    2
  ) as conversion_rate_percent,
  u.created_at as partner_since
FROM users u
LEFT JOIN leads l ON l.uploaded_by_partner_id = u.id
LEFT JOIN lead_purchases lp ON lp.lead_id = l.id
LEFT JOIN partner_credits pc ON pc.partner_id = u.id
WHERE u.role = 'partner'
GROUP BY u.id, u.full_name, u.email, u.created_at, pc.balance, pc.total_earned, pc.total_withdrawn;

-- Comment
COMMENT ON VIEW partner_analytics IS 'Analytics dashboard for partners: uploads, sales, revenue, conversion rate';

-- ============================================================================
-- 6. HELPER FUNCTIONS: Business logic
-- ============================================================================

-- Function to credit partner when their lead is purchased
CREATE OR REPLACE FUNCTION credit_partner_for_sale(
  p_lead_purchase_id UUID,
  p_partner_id UUID,
  p_commission_amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
  -- Upsert partner credits record
  INSERT INTO partner_credits (partner_id, balance, total_earned)
  VALUES (p_partner_id, p_commission_amount, p_commission_amount)
  ON CONFLICT (partner_id) DO UPDATE SET
    balance = partner_credits.balance + p_commission_amount,
    total_earned = partner_credits.total_earned + p_commission_amount,
    updated_at = NOW();

  -- Log the transaction
  INSERT INTO partner_credit_transactions (
    partner_id,
    amount,
    type,
    lead_purchase_id,
    description
  ) VALUES (
    p_partner_id,
    p_commission_amount,
    'earned',
    p_lead_purchase_id,
    'Commission earned from lead sale'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON FUNCTION credit_partner_for_sale IS 'Credits partner account when their lead is purchased. Called from Stripe webhook or purchase API.';

-- ============================================================================
-- 7. TRIGGER: Auto-update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_lead_purchases_updated_at
  BEFORE UPDATE ON lead_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_credits_updated_at
  BEFORE UPDATE ON partner_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE lead_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Lead purchases: Business users can see their purchases, partners can see their attributed sales
CREATE POLICY "Users can view their own purchases" ON lead_purchases
  FOR SELECT USING (
    buyer_user_id = auth.uid() OR
    partner_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Partner credits: Partners can only see their own credits
CREATE POLICY "Partners can view their own credits" ON partner_credits
  FOR SELECT USING (
    partner_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid() AND role = 'partner')
  );

-- Credit transactions: Partners can only see their own transactions
CREATE POLICY "Partners can view their own transactions" ON partner_credit_transactions
  FOR SELECT USING (
    partner_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid() AND role = 'partner')
  );

-- ============================================================================
-- 9. INITIAL DATA: Create credit records for existing partners
-- ============================================================================

-- Initialize partner_credits for all existing partners with zero balance
INSERT INTO partner_credits (partner_id, balance, total_earned, total_withdrawn)
SELECT id, 0, 0, 0
FROM users
WHERE role = 'partner'
ON CONFLICT (partner_id) DO NOTHING;
