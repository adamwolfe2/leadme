-- ============================================
-- AI STUDIO TABLES - Complete Schema
-- Migration: 20260130000000
-- ============================================

-- ============================================
-- BRAND WORKSPACES (Multi-tenant isolation)
-- ============================================
CREATE TABLE brand_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  workspace_id uuid REFERENCES workspaces NOT NULL,

  -- Brand Identity
  name text NOT NULL,
  url text NOT NULL,
  logo_url text,
  favicon_url text,

  -- Extracted Brand DNA
  brand_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  /*
    {
      "colors": {
        "primary": "#0082FB",
        "secondary": "#4B5563",
        "accent": "#60A5FA",
        "background": "#F6F6F8"
      },
      "typography": {
        "heading": "Great Vibes",
        "body": "Inter"
      },
      "headline": "Your tagline here",
      "images": ["url1", "url2", ...],
      "screenshot": "url"
    }
  */

  -- AI-Generated Content
  knowledge_base jsonb,
  /*
    {
      "company_overview": "...",
      "products_services": [...],
      "target_audience": "...",
      "value_proposition": [...],
      "brand_voice": {...},
      "key_messages": [...]
    }
  */

  -- Status
  extraction_status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  extraction_error text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX brand_workspaces_user_id_idx ON brand_workspaces(user_id);
CREATE INDEX brand_workspaces_workspace_id_idx ON brand_workspaces(workspace_id);
CREATE INDEX brand_workspaces_status_idx ON brand_workspaces(extraction_status);

-- RLS Policy
ALTER TABLE brand_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own brand workspaces" ON brand_workspaces
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================
-- CUSTOMER PROFILES (ICPs)
-- ============================================
CREATE TABLE customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_workspace_id uuid REFERENCES brand_workspaces ON DELETE CASCADE,

  -- Profile Identity
  name text NOT NULL, -- "Alex, the Tech-Savvy Startup Founder"
  title text, -- "Startup Founder"
  avatar_url text, -- Future: AI-generated
  description text,

  -- Demographics
  demographics jsonb DEFAULT '{}'::jsonb,
  /*
    {
      "age_range": "28-35",
      "income_range": "$70,000-120,000",
      "location": "Urban areas, US",
      "education": "Bachelor's degree"
    }
  */

  -- Targeting Data
  pain_points text[],
  goals text[],
  preferred_channels text[],

  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX customer_profiles_brand_workspace_id_idx ON customer_profiles(brand_workspace_id);

-- RLS Policy
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access through brand workspace" ON customer_profiles
  FOR ALL USING (
    brand_workspace_id IN (
      SELECT id FROM brand_workspaces
      WHERE workspace_id IN (
        SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================
-- OFFERS (Products/Services)
-- ============================================
CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_workspace_id uuid REFERENCES brand_workspaces ON DELETE CASCADE,

  name text NOT NULL,
  description text,
  pricing text,

  source text DEFAULT 'extracted', -- 'extracted' or 'manual'
  status text DEFAULT 'active', -- 'active' or 'inactive'

  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX offers_brand_workspace_id_idx ON offers(brand_workspace_id);
CREATE INDEX offers_status_idx ON offers(status);

-- RLS Policy
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access through brand workspace" ON offers
  FOR ALL USING (
    brand_workspace_id IN (
      SELECT id FROM brand_workspaces
      WHERE workspace_id IN (
        SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================
-- AD CREATIVES
-- ============================================
CREATE TABLE ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_workspace_id uuid REFERENCES brand_workspaces ON DELETE CASCADE,
  offer_id uuid REFERENCES offers ON DELETE SET NULL,
  icp_id uuid REFERENCES customer_profiles ON DELETE SET NULL,

  -- Creative Assets
  image_url text NOT NULL,
  thumbnail_url text,

  -- Ad Copy
  headline text,
  body_copy text,
  cta_text text,

  -- Generation Details
  prompt text NOT NULL, -- User's original prompt
  style_preset text, -- "Write with Elegance", "Flow of Creativity", etc.
  format text NOT NULL DEFAULT 'square', -- 'square' (1:1), 'story' (9:16), 'landscape' (16:9)

  -- Status
  generation_status text DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
  is_locked boolean DEFAULT false, -- Unlock/paywall feature

  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX ad_creatives_brand_workspace_id_idx ON ad_creatives(brand_workspace_id);
CREATE INDEX ad_creatives_offer_id_idx ON ad_creatives(offer_id);
CREATE INDEX ad_creatives_icp_id_idx ON ad_creatives(icp_id);
CREATE INDEX ad_creatives_status_idx ON ad_creatives(generation_status);

-- RLS Policy
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access through brand workspace" ON ad_creatives
  FOR ALL USING (
    brand_workspace_id IN (
      SELECT id FROM brand_workspaces
      WHERE workspace_id IN (
        SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================
-- CAMPAIGNS (Managed Service Orders)
-- ============================================
CREATE TABLE ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_workspace_id uuid REFERENCES brand_workspaces ON DELETE CASCADE,

  -- Campaign Config
  objective text NOT NULL, -- 'generate_leads', 'traffic', 'brand_awareness'
  landing_url text NOT NULL,
  target_icp_ids uuid[], -- Array of customer_profile IDs
  creative_ids uuid[], -- Array of ad_creative IDs

  -- Pricing Tier
  tier text NOT NULL, -- 'starter', 'growth', 'scale'
  tier_price integer NOT NULL, -- In cents: 30000, 100000, 150000
  leads_guaranteed integer NOT NULL, -- 20, 100, 200

  -- Payment
  stripe_session_id text,
  stripe_payment_intent_id text,
  payment_status text DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'

  -- Fulfillment Status
  campaign_status text DEFAULT 'pending', -- 'pending', 'in_review', 'active', 'completed', 'cancelled'
  meta_campaign_id text, -- Populated when manually set up in Meta

  -- Performance (manually updated)
  metrics jsonb,
  /*
    {
      "impressions": 10000,
      "clicks": 500,
      "leads": 25,
      "cpl": 12.00
    }
  */

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX ad_campaigns_brand_workspace_id_idx ON ad_campaigns(brand_workspace_id);
CREATE INDEX ad_campaigns_payment_status_idx ON ad_campaigns(payment_status);
CREATE INDEX ad_campaigns_campaign_status_idx ON ad_campaigns(campaign_status);

-- RLS Policy
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access through brand workspace" ON ad_campaigns
  FOR ALL USING (
    brand_workspace_id IN (
      SELECT id FROM brand_workspaces
      WHERE workspace_id IN (
        SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================
-- LANDING PAGES (Optional - Phase 4)
-- ============================================
CREATE TABLE landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_workspace_id uuid REFERENCES brand_workspaces ON DELETE CASCADE,

  name text NOT NULL,
  slug text UNIQUE NOT NULL, -- For public URL: cursive.com/l/{slug}

  -- Content
  html_content text,
  template_id text, -- Reference to template used

  -- Connections
  connected_campaign_id uuid REFERENCES ad_campaigns,

  -- Status
  is_published boolean DEFAULT false,
  views integer DEFAULT 0,
  submissions integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX landing_pages_brand_workspace_id_idx ON landing_pages(brand_workspace_id);
CREATE INDEX landing_pages_slug_idx ON landing_pages(slug);
CREATE INDEX landing_pages_is_published_idx ON landing_pages(is_published);

-- RLS Policy
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access through brand workspace" ON landing_pages
  FOR ALL USING (
    brand_workspace_id IN (
      SELECT id FROM brand_workspaces
      WHERE workspace_id IN (
        SELECT workspace_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Public access for published pages
CREATE POLICY "Published pages are publicly viewable" ON landing_pages
  FOR SELECT USING (is_published = true);
