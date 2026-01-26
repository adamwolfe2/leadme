-- ============================================================================
-- ALL MISSING TABLES - COMBINED MIGRATION
-- Run this in Supabase SQL Editor to create all missing tables from Phases 14-27
-- Created: 2026-01-26
-- ============================================================================

-- ============================================================================
-- PART 1: EMAIL REPLIES & REPLY TEMPLATES (Migration 20260126000002)
-- ============================================================================

-- Email replies table
CREATE TABLE IF NOT EXISTS email_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email_send_id UUID REFERENCES email_sends(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Reply details
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- External tracking
  emailbison_reply_id TEXT,

  -- AI Classification
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'question', 'not_interested', 'out_of_office', 'unsubscribe')),
  intent_score INTEGER CHECK (intent_score >= 0 AND intent_score <= 10),
  classification_confidence DECIMAL(3,2) CHECK (classification_confidence >= 0 AND classification_confidence <= 1),
  classification_metadata JSONB DEFAULT '{}',
  classified_at TIMESTAMPTZ,

  -- Suggested response (AI-generated)
  suggested_response TEXT,
  suggested_response_metadata JSONB DEFAULT '{}',
  response_generated_at TIMESTAMPTZ,

  -- Human review
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded', 'ignored', 'archived')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Response tracking
  response_sent_at TIMESTAMPTZ,
  response_email_send_id UUID REFERENCES email_sends(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reply response templates
CREATE TABLE IF NOT EXISTS reply_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Targeting
  for_sentiment TEXT[] DEFAULT ARRAY['positive', 'neutral', 'question'],
  for_intent_score_min INTEGER DEFAULT 0,
  for_intent_score_max INTEGER DEFAULT 10,

  -- Template content
  subject_template TEXT,
  body_template TEXT NOT NULL,

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  auto_suggest BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,

  -- Tracking
  times_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add reply tracking to campaign_leads
ALTER TABLE campaign_leads
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reply_sentiment TEXT,
ADD COLUMN IF NOT EXISTS reply_intent_score INTEGER,
ADD COLUMN IF NOT EXISTS last_reply_id UUID;

-- Add bounce tracking to campaign_leads
ALTER TABLE campaign_leads
ADD COLUMN IF NOT EXISTS bounce_reason TEXT,
ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ;

-- Add bounce tracking to email_sends
ALTER TABLE email_sends
ADD COLUMN IF NOT EXISTS bounce_type TEXT,
ADD COLUMN IF NOT EXISTS bounce_reason TEXT,
ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ;

-- Indexes for email_replies
CREATE INDEX IF NOT EXISTS idx_email_replies_workspace ON email_replies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_campaign ON email_replies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_lead ON email_replies(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_from_email ON email_replies(from_email);
CREATE INDEX IF NOT EXISTS idx_email_replies_status ON email_replies(status);
CREATE INDEX IF NOT EXISTS idx_email_replies_sentiment ON email_replies(sentiment);
CREATE INDEX IF NOT EXISTS idx_email_replies_received_at ON email_replies(received_at DESC);

-- Indexes for reply_response_templates
CREATE INDEX IF NOT EXISTS idx_reply_templates_workspace ON reply_response_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reply_templates_sentiment ON reply_response_templates USING GIN(for_sentiment);
CREATE INDEX IF NOT EXISTS idx_reply_templates_active ON reply_response_templates(is_active) WHERE is_active = TRUE;

-- Index for campaign_leads replied_at
CREATE INDEX IF NOT EXISTS idx_campaign_leads_replied_at ON campaign_leads(replied_at) WHERE replied_at IS NOT NULL;

-- RLS for email_replies
ALTER TABLE email_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_replies_workspace_isolation" ON email_replies
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- RLS for reply_response_templates
ALTER TABLE reply_response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reply_templates_workspace_isolation" ON reply_response_templates
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Function to get reply statistics for a campaign
CREATE OR REPLACE FUNCTION get_campaign_reply_stats(p_campaign_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_replies', COUNT(*),
    'positive', COUNT(*) FILTER (WHERE sentiment = 'positive'),
    'negative', COUNT(*) FILTER (WHERE sentiment = 'negative'),
    'neutral', COUNT(*) FILTER (WHERE sentiment = 'neutral'),
    'questions', COUNT(*) FILTER (WHERE sentiment = 'question'),
    'not_interested', COUNT(*) FILTER (WHERE sentiment = 'not_interested'),
    'out_of_office', COUNT(*) FILTER (WHERE sentiment = 'out_of_office'),
    'unsubscribes', COUNT(*) FILTER (WHERE sentiment = 'unsubscribe'),
    'new_unreviewd', COUNT(*) FILTER (WHERE status = 'new'),
    'responded', COUNT(*) FILTER (WHERE status = 'responded'),
    'avg_intent_score', COALESCE(AVG(intent_score), 0)
  ) INTO v_stats
  FROM email_replies
  WHERE campaign_id = p_campaign_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update campaign_leads when a reply is received
CREATE OR REPLACE FUNCTION update_campaign_lead_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaign_leads
  SET
    status = 'replied',
    replied_at = COALESCE(replied_at, NEW.received_at),
    reply_sentiment = COALESCE(NEW.sentiment, reply_sentiment),
    reply_intent_score = COALESCE(NEW.intent_score, reply_intent_score),
    last_reply_id = NEW.id,
    updated_at = NOW()
  WHERE campaign_id = NEW.campaign_id
    AND lead_id = NEW.lead_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_campaign_lead_on_reply ON email_replies;
CREATE TRIGGER trg_update_campaign_lead_on_reply
  AFTER INSERT OR UPDATE ON email_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_lead_on_reply();

-- ============================================================================
-- PART 2: SUPPRESSION LIST (Migration 20260126000004)
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppressed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'hard_bounce', 'complaint', 'manual')),
  source_campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  source_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  suppressed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(workspace_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_suppressed_emails_workspace ON suppressed_emails(workspace_id);
CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON suppressed_emails(email);
CREATE INDEX IF NOT EXISTS idx_suppressed_emails_reason ON suppressed_emails(reason);

-- RLS
ALTER TABLE suppressed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace isolation for suppressed_emails" ON suppressed_emails
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Add tracking columns to email_sends
ALTER TABLE email_sends
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_links JSONB DEFAULT '[]';

-- Add engagement stats to campaigns
ALTER TABLE email_campaigns
ADD COLUMN IF NOT EXISTS emails_opened INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS emails_clicked INTEGER DEFAULT 0;

-- Function to check suppression
CREATE OR REPLACE FUNCTION is_email_suppressed(
  p_email TEXT,
  p_workspace_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_suppressed BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM suppressed_emails
    WHERE email = LOWER(p_email)
    AND workspace_id = p_workspace_id
  ) INTO v_suppressed;

  RETURN v_suppressed;
END;
$$ LANGUAGE plpgsql;

-- Function to add to suppression list
CREATE OR REPLACE FUNCTION add_to_suppression_list(
  p_email TEXT,
  p_workspace_id UUID,
  p_reason TEXT,
  p_campaign_id UUID DEFAULT NULL,
  p_lead_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_suppression_id UUID;
BEGIN
  INSERT INTO suppressed_emails (
    workspace_id,
    email,
    reason,
    source_campaign_id,
    source_lead_id,
    metadata
  ) VALUES (
    p_workspace_id,
    LOWER(p_email),
    p_reason,
    p_campaign_id,
    p_lead_id,
    p_metadata
  )
  ON CONFLICT (workspace_id, email)
  DO UPDATE SET
    reason = p_reason,
    source_campaign_id = COALESCE(p_campaign_id, suppressed_emails.source_campaign_id),
    metadata = suppressed_emails.metadata || p_metadata,
    suppressed_at = NOW()
  RETURNING id INTO v_suppression_id;

  RETURN v_suppression_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-suppression
CREATE OR REPLACE FUNCTION auto_suppress_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_lead RECORD;
  v_campaign RECORD;
BEGIN
  IF NEW.status IN ('unsubscribed', 'bounced') AND
     (OLD.status IS NULL OR OLD.status NOT IN ('unsubscribed', 'bounced')) THEN

    SELECT * INTO v_lead FROM leads WHERE id = NEW.lead_id;
    SELECT * INTO v_campaign FROM email_campaigns WHERE id = NEW.campaign_id;

    IF v_lead IS NOT NULL AND v_lead.email IS NOT NULL THEN
      PERFORM add_to_suppression_list(
        v_lead.email,
        v_campaign.workspace_id,
        CASE WHEN NEW.status = 'unsubscribed' THEN 'unsubscribe' ELSE 'hard_bounce' END,
        NEW.campaign_id,
        NEW.lead_id,
        jsonb_build_object('bounce_reason', NEW.bounce_reason)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_suppress ON campaign_leads;
CREATE TRIGGER trg_auto_suppress
  AFTER UPDATE OF status ON campaign_leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_suppress_on_status_change();

-- ============================================================================
-- PART 3: A/B TESTING (Migration 20260126000007)
-- ============================================================================

-- Email template variants
CREATE TABLE IF NOT EXISTS email_template_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  variant_key VARCHAR(50) NOT NULL,
  is_control BOOLEAN DEFAULT false,

  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,

  weight INTEGER DEFAULT 50 CHECK (weight >= 0 AND weight <= 100),

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),

  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(campaign_id, variant_key)
);

-- A/B experiments
CREATE TABLE IF NOT EXISTS ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  hypothesis TEXT,

  test_type VARCHAR(50) DEFAULT 'subject' CHECK (test_type IN ('subject', 'body', 'full_template', 'send_time')),
  success_metric VARCHAR(50) DEFAULT 'open_rate' CHECK (success_metric IN ('open_rate', 'click_rate', 'reply_rate', 'conversion_rate')),
  minimum_sample_size INTEGER DEFAULT 100,
  confidence_level DECIMAL(5,2) DEFAULT 95.00,

  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),

  winner_variant_id UUID,
  statistical_significance DECIMAL(5,2),
  result_summary JSONB DEFAULT '{}',

  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  auto_end_on_significance BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variant assignments
CREATE TABLE IF NOT EXISTS ab_variant_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_lead_id UUID NOT NULL REFERENCES campaign_leads(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES email_template_variants(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES ab_experiments(id) ON DELETE SET NULL,

  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assignment_method VARCHAR(50) DEFAULT 'random',

  UNIQUE(campaign_lead_id)
);

-- Add variant tracking to email_sends
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS variant_id UUID;
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS experiment_id UUID;

-- Variant performance stats
CREATE TABLE IF NOT EXISTS variant_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES email_template_variants(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES ab_experiments(id) ON DELETE CASCADE,

  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  emails_unsubscribed INTEGER DEFAULT 0,

  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  reply_rate DECIMAL(5,2) DEFAULT 0,
  click_to_open_rate DECIMAL(5,2) DEFAULT 0,

  sample_size INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,

  first_send_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(variant_id, experiment_id)
);

-- Enable RLS
ALTER TABLE email_template_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_variant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workspace isolation for variants" ON email_template_variants
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Workspace isolation for experiments" ON ab_experiments
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Workspace isolation for variant assignments" ON ab_variant_assignments
  FOR ALL USING (
    variant_id IN (
      SELECT id FROM email_template_variants
      WHERE workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Workspace isolation for variant stats" ON variant_stats
  FOR ALL USING (
    variant_id IN (
      SELECT id FROM email_template_variants
      WHERE workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_variants_campaign ON email_template_variants(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_experiments_campaign ON ab_experiments(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_variant_assignments_variant ON ab_variant_assignments(variant_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_variant ON email_sends(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_variant_stats_variant ON variant_stats(variant_id);

-- Function to assign a variant
CREATE OR REPLACE FUNCTION assign_variant(
  p_campaign_lead_id UUID,
  p_campaign_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_variant_id UUID;
  v_total_weight INTEGER;
  v_random_value INTEGER;
  v_cumulative_weight INTEGER := 0;
BEGIN
  SELECT variant_id INTO v_variant_id
  FROM ab_variant_assignments
  WHERE campaign_lead_id = p_campaign_lead_id;

  IF v_variant_id IS NOT NULL THEN
    RETURN v_variant_id;
  END IF;

  SELECT COALESCE(SUM(weight), 0) INTO v_total_weight
  FROM email_template_variants
  WHERE campaign_id = p_campaign_id AND status = 'active';

  IF v_total_weight = 0 THEN
    RETURN NULL;
  END IF;

  v_random_value := floor(random() * v_total_weight)::INTEGER;

  FOR v_variant_id IN
    SELECT id
    FROM email_template_variants
    WHERE campaign_id = p_campaign_id AND status = 'active'
    ORDER BY created_at
  LOOP
    SELECT weight INTO v_cumulative_weight
    FROM email_template_variants WHERE id = v_variant_id;

    v_cumulative_weight := v_cumulative_weight + COALESCE(
      (SELECT SUM(weight) FROM email_template_variants
       WHERE campaign_id = p_campaign_id AND status = 'active'
       AND created_at < (SELECT created_at FROM email_template_variants WHERE id = v_variant_id)),
      0
    );

    IF v_random_value < v_cumulative_weight THEN
      INSERT INTO ab_variant_assignments (campaign_lead_id, variant_id)
      VALUES (p_campaign_lead_id, v_variant_id)
      ON CONFLICT (campaign_lead_id) DO NOTHING;

      RETURN v_variant_id;
    END IF;
  END LOOP;

  SELECT id INTO v_variant_id
  FROM email_template_variants
  WHERE campaign_id = p_campaign_id AND status = 'active'
  ORDER BY created_at
  LIMIT 1;

  IF v_variant_id IS NOT NULL THEN
    INSERT INTO ab_variant_assignments (campaign_lead_id, variant_id)
    VALUES (p_campaign_lead_id, v_variant_id)
    ON CONFLICT (campaign_lead_id) DO NOTHING;
  END IF;

  RETURN v_variant_id;
END;
$$;

-- Function to update variant stats
CREATE OR REPLACE FUNCTION update_variant_stats(
  p_variant_id UUID,
  p_experiment_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  SELECT
    COUNT(*) AS sent,
    COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
    COUNT(*) FILTER (WHERE status = 'bounced') AS bounced,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS opened,
    COUNT(DISTINCT CASE WHEN opened_at IS NOT NULL THEN recipient_email END) AS unique_opens,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) AS clicked,
    COUNT(DISTINCT CASE WHEN clicked_at IS NOT NULL THEN recipient_email END) AS unique_clicks,
    COUNT(*) FILTER (WHERE replied_at IS NOT NULL) AS replied,
    COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) AS unsubscribed,
    MIN(sent_at) AS first_send
  INTO v_stats
  FROM email_sends
  WHERE variant_id = p_variant_id
    AND (p_experiment_id IS NULL OR experiment_id = p_experiment_id);

  INSERT INTO variant_stats (
    variant_id, experiment_id,
    emails_sent, emails_delivered, emails_bounced,
    emails_opened, unique_opens,
    emails_clicked, unique_clicks,
    emails_replied, emails_unsubscribed,
    open_rate, click_rate, reply_rate, click_to_open_rate,
    sample_size, first_send_at, last_updated_at
  ) VALUES (
    p_variant_id, p_experiment_id,
    v_stats.sent, v_stats.delivered, v_stats.bounced,
    v_stats.opened, v_stats.unique_opens,
    v_stats.clicked, v_stats.unique_clicks,
    v_stats.replied, v_stats.unsubscribed,
    CASE WHEN v_stats.delivered > 0 THEN ROUND((v_stats.unique_opens::DECIMAL / v_stats.delivered) * 100, 2) ELSE 0 END,
    CASE WHEN v_stats.delivered > 0 THEN ROUND((v_stats.unique_clicks::DECIMAL / v_stats.delivered) * 100, 2) ELSE 0 END,
    CASE WHEN v_stats.delivered > 0 THEN ROUND((v_stats.replied::DECIMAL / v_stats.delivered) * 100, 2) ELSE 0 END,
    CASE WHEN v_stats.unique_opens > 0 THEN ROUND((v_stats.unique_clicks::DECIMAL / v_stats.unique_opens) * 100, 2) ELSE 0 END,
    v_stats.sent,
    v_stats.first_send,
    NOW()
  )
  ON CONFLICT (variant_id, experiment_id)
  DO UPDATE SET
    emails_sent = EXCLUDED.emails_sent,
    emails_delivered = EXCLUDED.emails_delivered,
    emails_bounced = EXCLUDED.emails_bounced,
    emails_opened = EXCLUDED.emails_opened,
    unique_opens = EXCLUDED.unique_opens,
    emails_clicked = EXCLUDED.emails_clicked,
    unique_clicks = EXCLUDED.unique_clicks,
    emails_replied = EXCLUDED.emails_replied,
    emails_unsubscribed = EXCLUDED.emails_unsubscribed,
    open_rate = EXCLUDED.open_rate,
    click_rate = EXCLUDED.click_rate,
    reply_rate = EXCLUDED.reply_rate,
    click_to_open_rate = EXCLUDED.click_to_open_rate,
    sample_size = EXCLUDED.sample_size,
    first_send_at = COALESCE(variant_stats.first_send_at, EXCLUDED.first_send_at),
    last_updated_at = NOW();
END;
$$;

-- Function to calculate statistical significance (Z-test)
CREATE OR REPLACE FUNCTION calculate_significance(
  p_control_conversions INTEGER,
  p_control_sample INTEGER,
  p_variant_conversions INTEGER,
  p_variant_sample INTEGER
)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
  v_p1 DECIMAL;
  v_p2 DECIMAL;
  v_pooled DECIMAL;
  v_se DECIMAL;
  v_z DECIMAL;
BEGIN
  IF p_control_sample = 0 OR p_variant_sample = 0 THEN
    RETURN 0;
  END IF;

  v_p1 := p_control_conversions::DECIMAL / p_control_sample;
  v_p2 := p_variant_conversions::DECIMAL / p_variant_sample;

  v_pooled := (p_control_conversions + p_variant_conversions)::DECIMAL / (p_control_sample + p_variant_sample);

  IF v_pooled = 0 OR v_pooled = 1 THEN
    RETURN 0;
  END IF;

  v_se := SQRT(v_pooled * (1 - v_pooled) * (1.0/p_control_sample + 1.0/p_variant_sample));

  IF v_se = 0 THEN
    RETURN 0;
  END IF;

  v_z := ABS(v_p1 - v_p2) / v_se;

  IF v_z >= 2.576 THEN
    RETURN 99.00;
  ELSIF v_z >= 1.96 THEN
    RETURN 95.00;
  ELSIF v_z >= 1.645 THEN
    RETURN 90.00;
  ELSIF v_z >= 1.28 THEN
    RETURN 80.00;
  ELSE
    RETURN ROUND(v_z * 30, 2);
  END IF;
END;
$$;

-- ============================================================================
-- PART 4: CONVERSATIONS (Migration 20260126000008)
-- ============================================================================

-- Conversation threads table
CREATE TABLE IF NOT EXISTS email_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_lead_id UUID REFERENCES campaign_leads(id) ON DELETE SET NULL,

  thread_id VARCHAR(255),
  subject_normalized VARCHAR(500),

  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'waiting_reply', 'replied', 'closed', 'archived')),

  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_direction VARCHAR(10) CHECK (last_message_direction IN ('outbound', 'inbound')),
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,

  sentiment VARCHAR(50),
  intent VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  assigned_to UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation messages
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES email_conversations(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  direction VARCHAR(10) NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  email_send_id UUID REFERENCES email_sends(id) ON DELETE SET NULL,
  reply_id UUID,

  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  subject VARCHAR(500),
  body_text TEXT,
  body_html TEXT,
  snippet VARCHAR(500),

  message_id VARCHAR(255),
  in_reply_to VARCHAR(255),
  references_header TEXT,

  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  classification JSONB DEFAULT '{}',
  is_auto_reply BOOLEAN DEFAULT false,
  is_out_of_office BOOLEAN DEFAULT false,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add conversation tracking to email_sends
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS message_id_header VARCHAR(255);
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS in_reply_to_header VARCHAR(255);

-- Enable RLS
ALTER TABLE email_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workspace isolation for conversations" ON email_conversations
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Workspace isolation for messages" ON conversation_messages
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

-- Function to normalize email subject
CREATE OR REPLACE FUNCTION normalize_subject(p_subject TEXT)
RETURNS VARCHAR(500)
LANGUAGE plpgsql
AS $$
DECLARE
  v_normalized TEXT;
BEGIN
  IF p_subject IS NULL THEN
    RETURN NULL;
  END IF;

  v_normalized := p_subject;

  v_normalized := REGEXP_REPLACE(v_normalized, '^(Re|RE|Fwd|FWD|Fw|FW|AW|Antwort|SV|VS):\s*', '', 'gi');
  v_normalized := REGEXP_REPLACE(v_normalized, '^\s+', '');

  WHILE v_normalized ~ '^(Re|RE|Fwd|FWD|Fw|FW|AW|Antwort|SV|VS):' LOOP
    v_normalized := REGEXP_REPLACE(v_normalized, '^(Re|RE|Fwd|FWD|Fw|FW|AW|Antwort|SV|VS):\s*', '', 'gi');
    v_normalized := REGEXP_REPLACE(v_normalized, '^\s+', '');
  END LOOP;

  RETURN LEFT(v_normalized, 500);
END;
$$;

-- Function to find or create a conversation
CREATE OR REPLACE FUNCTION find_or_create_conversation(
  p_workspace_id UUID,
  p_lead_id UUID,
  p_campaign_id UUID,
  p_campaign_lead_id UUID,
  p_subject TEXT,
  p_thread_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_conversation_id UUID;
  v_normalized_subject VARCHAR(500);
BEGIN
  v_normalized_subject := normalize_subject(p_subject);

  IF p_thread_id IS NOT NULL THEN
    SELECT id INTO v_conversation_id
    FROM email_conversations
    WHERE workspace_id = p_workspace_id
      AND thread_id = p_thread_id
    LIMIT 1;

    IF v_conversation_id IS NOT NULL THEN
      RETURN v_conversation_id;
    END IF;
  END IF;

  SELECT id INTO v_conversation_id
  FROM email_conversations
  WHERE workspace_id = p_workspace_id
    AND lead_id = p_lead_id
    AND subject_normalized = v_normalized_subject
    AND status != 'archived'
  ORDER BY last_message_at DESC
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  INSERT INTO email_conversations (
    workspace_id,
    campaign_id,
    lead_id,
    campaign_lead_id,
    thread_id,
    subject_normalized,
    status,
    message_count
  ) VALUES (
    p_workspace_id,
    p_campaign_id,
    p_lead_id,
    p_campaign_lead_id,
    p_thread_id,
    v_normalized_subject,
    'active',
    0
  )
  RETURNING id INTO v_conversation_id;

  RETURN v_conversation_id;
END;
$$;

-- Function to add a message to a conversation
CREATE OR REPLACE FUNCTION add_conversation_message(
  p_conversation_id UUID,
  p_workspace_id UUID,
  p_direction VARCHAR(10),
  p_from_email VARCHAR(255),
  p_to_email VARCHAR(255),
  p_subject VARCHAR(500),
  p_body_text TEXT,
  p_body_html TEXT,
  p_message_id VARCHAR(255) DEFAULT NULL,
  p_email_send_id UUID DEFAULT NULL,
  p_reply_id UUID DEFAULT NULL,
  p_sent_at TIMESTAMPTZ DEFAULT NULL,
  p_received_at TIMESTAMPTZ DEFAULT NULL,
  p_from_name VARCHAR(255) DEFAULT NULL,
  p_to_name VARCHAR(255) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_message_id UUID;
  v_snippet VARCHAR(500);
  v_message_time TIMESTAMPTZ;
BEGIN
  v_snippet := LEFT(
    REGEXP_REPLACE(COALESCE(p_body_text, p_body_html), '<[^>]+>', '', 'g'),
    500
  );

  v_message_time := COALESCE(p_sent_at, p_received_at, NOW());

  INSERT INTO conversation_messages (
    conversation_id,
    workspace_id,
    direction,
    email_send_id,
    reply_id,
    from_email,
    from_name,
    to_email,
    to_name,
    subject,
    body_text,
    body_html,
    snippet,
    message_id,
    sent_at,
    received_at,
    is_read
  ) VALUES (
    p_conversation_id,
    p_workspace_id,
    p_direction,
    p_email_send_id,
    p_reply_id,
    p_from_email,
    p_from_name,
    p_to_email,
    p_to_name,
    p_subject,
    p_body_text,
    p_body_html,
    v_snippet,
    p_message_id,
    p_sent_at,
    p_received_at,
    p_direction = 'outbound'
  )
  RETURNING id INTO v_message_id;

  UPDATE email_conversations
  SET
    message_count = message_count + 1,
    last_message_at = v_message_time,
    last_message_direction = p_direction,
    unread_count = CASE
      WHEN p_direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END,
    status = CASE
      WHEN p_direction = 'inbound' THEN 'replied'
      WHEN p_direction = 'outbound' THEN 'waiting_reply'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$;

-- Function to mark conversation messages as read
CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE conversation_messages
  SET is_read = true, read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND is_read = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  UPDATE email_conversations
  SET unread_count = 0, updated_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_updated;
END;
$$;

-- Trigger to update conversation when email is sent
CREATE OR REPLACE FUNCTION update_conversation_on_send()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_conversation_id UUID;
  v_lead_id UUID;
  v_campaign_lead_id UUID;
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    v_lead_id := NEW.lead_id;

    IF NEW.campaign_id IS NOT NULL THEN
      SELECT id INTO v_campaign_lead_id
      FROM campaign_leads
      WHERE campaign_id = NEW.campaign_id AND lead_id = NEW.lead_id
      LIMIT 1;
    END IF;

    v_conversation_id := find_or_create_conversation(
      NEW.workspace_id,
      v_lead_id,
      NEW.campaign_id,
      v_campaign_lead_id,
      NEW.subject,
      NULL
    );

    NEW.conversation_id := v_conversation_id;

    PERFORM add_conversation_message(
      v_conversation_id,
      NEW.workspace_id,
      'outbound',
      'noreply@example.com',
      NEW.recipient_email,
      NEW.subject,
      NEW.body_text,
      NEW.body_html,
      NEW.message_id_header,
      NEW.id,
      NULL,
      NEW.sent_at,
      NULL,
      NULL,
      NEW.recipient_name
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conversation_on_send ON email_sends;
CREATE TRIGGER trg_update_conversation_on_send
  BEFORE UPDATE ON email_sends
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_send();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_workspace ON email_conversations(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON email_conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_campaign_lead ON email_conversations(campaign_lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON email_conversations(workspace_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_unread ON conversation_messages(conversation_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_email_sends_conversation ON email_sends(conversation_id) WHERE conversation_id IS NOT NULL;

-- ============================================================================
-- PART 5: NOTIFICATIONS (Migration 20260126000009)
-- ============================================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID,

  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) DEFAULT 'info' CHECK (category IN ('info', 'success', 'warning', 'error', 'action_required')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  related_type VARCHAR(50),
  related_id UUID,

  action_url VARCHAR(500),
  action_label VARCHAR(100),

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,

  priority INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  in_app_enabled BOOLEAN DEFAULT true,

  email_enabled BOOLEAN DEFAULT true,
  email_frequency VARCHAR(20) DEFAULT 'instant' CHECK (email_frequency IN ('instant', 'hourly', 'daily', 'weekly', 'never')),

  type_preferences JSONB DEFAULT '{
    "reply_received": {"in_app": true, "email": true},
    "campaign_completed": {"in_app": true, "email": true},
    "limit_reached": {"in_app": true, "email": true},
    "bounce_detected": {"in_app": true, "email": false},
    "experiment_winner": {"in_app": true, "email": true},
    "lead_imported": {"in_app": true, "email": false},
    "error_occurred": {"in_app": true, "email": true}
  }',

  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone VARCHAR(50) DEFAULT 'America/New_York',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, workspace_id)
);

-- Notification digest queue
CREATE TABLE IF NOT EXISTS notification_digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,

  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_digest_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
    AND (user_id IS NULL OR user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
    AND (user_id IS NULL OR user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can manage their preferences" ON notification_preferences
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can view their digest queue" ON notification_digest_queue
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_workspace_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_user_id UUID DEFAULT NULL,
  p_category VARCHAR(50) DEFAULT 'info',
  p_related_type VARCHAR(50) DEFAULT NULL,
  p_related_id UUID DEFAULT NULL,
  p_action_url VARCHAR(500) DEFAULT NULL,
  p_action_label VARCHAR(100) DEFAULT NULL,
  p_priority INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    workspace_id,
    user_id,
    type,
    category,
    title,
    message,
    related_type,
    related_id,
    action_url,
    action_label,
    priority,
    metadata
  ) VALUES (
    p_workspace_id,
    p_user_id,
    p_type,
    p_category,
    p_title,
    p_message,
    p_related_type,
    p_related_id,
    p_action_url,
    p_action_label,
    p_priority,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_notification_ids UUID[],
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE id = ANY(p_notification_ids)
    AND (user_id IS NULL OR user_id = p_user_id)
    AND is_read = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_workspace_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE workspace_id = p_workspace_id
    AND (user_id IS NULL OR user_id = p_user_id)
    AND is_read = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_workspace_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE workspace_id = p_workspace_id
    AND (user_id IS NULL OR user_id = p_user_id)
    AND is_read = false
    AND is_dismissed = false
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN v_count;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_workspace_user ON notifications(workspace_id, user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(workspace_id, user_id) WHERE is_read = false AND is_dismissed = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(workspace_id, type);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_digest_queue_scheduled ON notification_digest_queue(scheduled_for) WHERE sent = false;

-- ============================================================================
-- PART 6: WORKSPACE SETTINGS (Migration 20260126000010)
-- ============================================================================

-- Add enhanced settings to workspaces
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'not_started';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Workspace integrations table
CREATE TABLE IF NOT EXISTS workspace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  provider VARCHAR(50) NOT NULL,
  name VARCHAR(100),

  is_connected BOOLEAN DEFAULT false,
  credentials JSONB DEFAULT '{}',
  oauth_data JSONB DEFAULT '{}',

  config JSONB DEFAULT '{}',
  mapping JSONB DEFAULT '{}',

  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'error', 'disconnected')),
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(workspace_id, provider)
);

-- Onboarding steps
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  step_key VARCHAR(50) NOT NULL,
  step_order INTEGER DEFAULT 0,

  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false,
  skipped_at TIMESTAMPTZ,

  step_data JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(workspace_id, user_id, step_key)
);

-- API keys for external access
CREATE TABLE IF NOT EXISTS workspace_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,

  scopes TEXT[] DEFAULT '{}',

  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,

  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(key_hash)
);

-- Enable RLS
ALTER TABLE workspace_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workspace isolation for integrations" ON workspace_integrations
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Workspace isolation for onboarding" ON onboarding_steps
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Workspace isolation for api keys" ON workspace_api_keys
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

-- Function to get onboarding progress
CREATE OR REPLACE FUNCTION get_onboarding_progress(
  p_workspace_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_steps JSONB;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_completed OR skipped)
  INTO v_total, v_completed
  FROM onboarding_steps
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  SELECT jsonb_agg(jsonb_build_object(
    'step_key', step_key,
    'step_order', step_order,
    'is_completed', is_completed,
    'skipped', skipped,
    'completed_at', completed_at
  ) ORDER BY step_order) INTO v_steps
  FROM onboarding_steps
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  RETURN jsonb_build_object(
    'total_steps', v_total,
    'completed_steps', v_completed,
    'progress_percent', CASE WHEN v_total > 0 THEN ROUND((v_completed::DECIMAL / v_total) * 100, 2) ELSE 0 END,
    'is_complete', v_completed >= v_total AND v_total > 0,
    'steps', COALESCE(v_steps, '[]'::jsonb)
  );
END;
$$;

-- Function to initialize onboarding
CREATE OR REPLACE FUNCTION initialize_onboarding(
  p_workspace_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO onboarding_steps (workspace_id, user_id, step_key, step_order)
  VALUES
    (p_workspace_id, p_user_id, 'connect_email_account', 1),
    (p_workspace_id, p_user_id, 'configure_sender_info', 2),
    (p_workspace_id, p_user_id, 'create_first_campaign', 3),
    (p_workspace_id, p_user_id, 'import_leads', 4),
    (p_workspace_id, p_user_id, 'compose_first_email', 5),
    (p_workspace_id, p_user_id, 'review_and_send', 6)
  ON CONFLICT (workspace_id, user_id, step_key) DO NOTHING;

  UPDATE workspaces
  SET onboarding_status = 'in_progress'
  WHERE id = p_workspace_id AND onboarding_status = 'not_started';
END;
$$;

-- Function to complete an onboarding step
CREATE OR REPLACE FUNCTION complete_onboarding_step(
  p_workspace_id UUID,
  p_user_id UUID,
  p_step_key VARCHAR(50),
  p_step_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_all_complete BOOLEAN;
BEGIN
  UPDATE onboarding_steps
  SET
    is_completed = true,
    completed_at = NOW(),
    step_data = p_step_data,
    updated_at = NOW()
  WHERE workspace_id = p_workspace_id
    AND user_id = p_user_id
    AND step_key = p_step_key
    AND is_completed = false;

  SELECT NOT EXISTS (
    SELECT 1 FROM onboarding_steps
    WHERE workspace_id = p_workspace_id
      AND user_id = p_user_id
      AND is_completed = false
      AND skipped = false
  ) INTO v_all_complete;

  IF v_all_complete THEN
    UPDATE workspaces
    SET
      onboarding_status = 'completed',
      onboarding_completed_at = NOW()
    WHERE id = p_workspace_id;
  END IF;

  RETURN v_all_complete;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_workspace ON workspace_integrations(workspace_id, provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON workspace_integrations(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_onboarding_workspace ON onboarding_steps(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_workspace ON workspace_api_keys(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON workspace_api_keys(key_hash) WHERE is_active = true;

-- ============================================================================
-- PART 7: FAILED JOBS (Migration 20260126000011)
-- ============================================================================

-- Failed jobs table
CREATE TABLE IF NOT EXISTS failed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,

  job_type VARCHAR(100) NOT NULL,
  job_id VARCHAR(255),
  job_name VARCHAR(255),

  related_type VARCHAR(50),
  related_id UUID,

  error_type VARCHAR(100),
  error_code VARCHAR(50),
  error_message TEXT NOT NULL,
  error_stack TEXT,

  payload JSONB DEFAULT '{}',

  attempts INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 5,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  next_retry_at TIMESTAMPTZ,

  status VARCHAR(50) DEFAULT 'failed' CHECK (status IN ('failed', 'pending_retry', 'retrying', 'resolved', 'abandoned')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,

  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System health metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  metric_name VARCHAR(100) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,

  value DECIMAL(20, 6) NOT NULL,
  tags JSONB DEFAULT '{}',

  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE failed_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workspace isolation for failed jobs" ON failed_jobs
  FOR ALL USING (
    workspace_id IS NULL OR
    workspace_id IN (SELECT workspace_id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can view metrics" ON system_health_metrics
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Function to log a failed job
CREATE OR REPLACE FUNCTION log_failed_job(
  p_job_type VARCHAR(100),
  p_error_message TEXT,
  p_workspace_id UUID DEFAULT NULL,
  p_job_id VARCHAR(255) DEFAULT NULL,
  p_job_name VARCHAR(255) DEFAULT NULL,
  p_related_type VARCHAR(50) DEFAULT NULL,
  p_related_id UUID DEFAULT NULL,
  p_error_type VARCHAR(100) DEFAULT 'unknown',
  p_error_code VARCHAR(50) DEFAULT NULL,
  p_error_stack TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT '{}',
  p_max_attempts INTEGER DEFAULT 5,
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id UUID;
  v_next_retry TIMESTAMPTZ;
BEGIN
  v_next_retry := NOW() + INTERVAL '1 minute';

  INSERT INTO failed_jobs (
    workspace_id,
    job_type,
    job_id,
    job_name,
    related_type,
    related_id,
    error_type,
    error_code,
    error_message,
    error_stack,
    payload,
    max_attempts,
    next_retry_at,
    status,
    context
  ) VALUES (
    p_workspace_id,
    p_job_type,
    p_job_id,
    p_job_name,
    p_related_type,
    p_related_id,
    p_error_type,
    p_error_code,
    p_error_message,
    p_error_stack,
    p_payload,
    p_max_attempts,
    v_next_retry,
    'pending_retry',
    p_context
  )
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

-- Function to get jobs ready for retry
CREATE OR REPLACE FUNCTION get_jobs_for_retry(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  job_id UUID,
  job_type VARCHAR(100),
  payload JSONB,
  attempts INTEGER,
  max_attempts INTEGER,
  workspace_id UUID,
  related_type VARCHAR(50),
  related_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE failed_jobs f
  SET
    status = 'retrying',
    last_attempt_at = NOW(),
    attempts = f.attempts + 1
  WHERE f.id IN (
    SELECT fj.id
    FROM failed_jobs fj
    WHERE fj.status = 'pending_retry'
      AND fj.next_retry_at <= NOW()
      AND fj.attempts < fj.max_attempts
    ORDER BY fj.next_retry_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING
    f.id AS job_id,
    f.job_type,
    f.payload,
    f.attempts,
    f.max_attempts,
    f.workspace_id,
    f.related_type,
    f.related_id;
END;
$$;

-- Function to mark a retry as successful
CREATE OR REPLACE FUNCTION mark_retry_success(p_job_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE failed_jobs
  SET
    status = 'resolved',
    resolved_at = NOW(),
    resolution_notes = 'Resolved via automatic retry'
  WHERE id = p_job_id;
END;
$$;

-- Function to mark a retry as failed
CREATE OR REPLACE FUNCTION mark_retry_failed(
  p_job_id UUID,
  p_error_message TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
  v_next_retry TIMESTAMPTZ;
BEGIN
  SELECT attempts, max_attempts INTO v_attempts, v_max_attempts
  FROM failed_jobs WHERE id = p_job_id;

  IF v_attempts >= v_max_attempts THEN
    UPDATE failed_jobs
    SET
      status = 'abandoned',
      error_message = p_error_message,
      resolution_notes = 'Max retry attempts exceeded'
    WHERE id = p_job_id;
  ELSE
    v_next_retry := NOW() + (POWER(2, v_attempts) || ' minutes')::INTERVAL;
    IF v_next_retry > NOW() + INTERVAL '1 hour' THEN
      v_next_retry := NOW() + INTERVAL '1 hour';
    END IF;

    UPDATE failed_jobs
    SET
      status = 'pending_retry',
      error_message = p_error_message,
      next_retry_at = v_next_retry
    WHERE id = p_job_id;
  END IF;
END;
$$;

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_stats(
  p_workspace_id UUID DEFAULT NULL,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
  error_type VARCHAR(100),
  job_type VARCHAR(100),
  count BIGINT,
  resolved_count BIGINT,
  abandoned_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.error_type,
    f.job_type,
    COUNT(*) AS count,
    COUNT(*) FILTER (WHERE f.status = 'resolved') AS resolved_count,
    COUNT(*) FILTER (WHERE f.status = 'abandoned') AS abandoned_count
  FROM failed_jobs f
  WHERE f.created_at >= NOW() - (p_hours || ' hours')::INTERVAL
    AND (p_workspace_id IS NULL OR f.workspace_id = p_workspace_id)
  GROUP BY f.error_type, f.job_type
  ORDER BY count DESC;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_failed_jobs_workspace ON failed_jobs(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_failed_jobs_retry ON failed_jobs(status, next_retry_at)
  WHERE status = 'pending_retry';
CREATE INDEX IF NOT EXISTS idx_failed_jobs_type ON failed_jobs(job_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failed_jobs_related ON failed_jobs(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_name ON system_health_metrics(metric_name, recorded_at DESC);

-- Cleanup old resolved jobs
CREATE OR REPLACE FUNCTION cleanup_old_failed_jobs()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM failed_jobs
  WHERE status IN ('resolved', 'abandoned')
    AND created_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================================
-- PART 8: AUDIT LOGS (Migration 20260126000012)
-- ============================================================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id UUID,

  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,

  old_values JSONB,
  new_values JSONB,
  changes JSONB,

  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  api_endpoint VARCHAR(255),
  http_method VARCHAR(10),

  metadata JSONB DEFAULT '{}',
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  tags TEXT[] DEFAULT '{}',

  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id UUID,

  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL,

  ip_address INET,
  user_agent TEXT,
  location_data JSONB,

  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  is_suspicious BOOLEAN DEFAULT false,
  suspicious_reason TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admins only)
CREATE POLICY "Workspace admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Workspace admins can view security events" ON security_events
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
  );

-- Function to create an audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_workspace_id UUID,
  p_user_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(100),
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_request_id VARCHAR(100) DEFAULT NULL,
  p_api_endpoint VARCHAR(255) DEFAULT NULL,
  p_http_method VARCHAR(10) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_severity VARCHAR(20) DEFAULT 'info',
  p_duration_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
  v_changes JSONB := '{}';
BEGIN
  IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    SELECT jsonb_object_agg(key, jsonb_build_object(
      'old', p_old_values->key,
      'new', p_new_values->key
    ))
    INTO v_changes
    FROM jsonb_each(p_new_values)
    WHERE p_old_values->key IS DISTINCT FROM p_new_values->key;
  END IF;

  INSERT INTO audit_logs (
    workspace_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    changes,
    ip_address,
    user_agent,
    request_id,
    api_endpoint,
    http_method,
    metadata,
    severity,
    duration_ms
  ) VALUES (
    p_workspace_id,
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    v_changes,
    p_ip_address,
    p_user_agent,
    p_request_id,
    p_api_endpoint,
    p_http_method,
    p_metadata,
    p_severity,
    p_duration_ms
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type VARCHAR(100),
  p_event_category VARCHAR(50),
  p_workspace_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_risk_level VARCHAR(20) DEFAULT 'low',
  p_is_suspicious BOOLEAN DEFAULT false,
  p_suspicious_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO security_events (
    workspace_id,
    user_id,
    event_type,
    event_category,
    ip_address,
    user_agent,
    risk_level,
    is_suspicious,
    suspicious_reason,
    metadata
  ) VALUES (
    p_workspace_id,
    p_user_id,
    p_event_type,
    p_event_category,
    p_ip_address,
    p_user_agent,
    p_risk_level,
    p_is_suspicious,
    p_suspicious_reason,
    p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Function to get activity summary for a resource
CREATE OR REPLACE FUNCTION get_resource_activity(
  p_resource_type VARCHAR(100),
  p_resource_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  action VARCHAR(100),
  user_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.user_id,
    al.changes,
    al.created_at
  FROM audit_logs al
  WHERE al.resource_type = p_resource_type
    AND al.resource_id = p_resource_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity, created_at DESC) WHERE severity IN ('warning', 'error', 'critical');
CREATE INDEX IF NOT EXISTS idx_security_events_workspace ON security_events(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_suspicious ON security_events(is_suspicious, created_at DESC) WHERE is_suspicious = true;

-- Cleanup old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (p_days || ' days')::INTERVAL
    AND severity NOT IN ('error', 'critical');

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================================
-- PART 9: FOREIGN KEY FIXES (Migration 20260126000013)
-- ============================================================================

-- Fix campaign_leads.last_reply_id FK (added earlier but needs constraint)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'campaign_leads' AND column_name = 'last_reply_id') THEN
    EXECUTE 'ALTER TABLE campaign_leads DROP CONSTRAINT IF EXISTS campaign_leads_last_reply_id_fkey';
    EXECUTE 'ALTER TABLE campaign_leads
      ADD CONSTRAINT campaign_leads_last_reply_id_fkey
      FOREIGN KEY (last_reply_id) REFERENCES email_replies(id) ON DELETE SET NULL';
  END IF;
END $$;

-- Fix ab_experiments.winner_variant_id FK
ALTER TABLE ab_experiments DROP CONSTRAINT IF EXISTS ab_experiments_winner_variant_id_fkey;
ALTER TABLE ab_experiments
  ADD CONSTRAINT ab_experiments_winner_variant_id_fkey
  FOREIGN KEY (winner_variant_id) REFERENCES email_template_variants(id) ON DELETE SET NULL;

-- Fix email_sends.variant_id FK
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'email_sends' AND column_name = 'variant_id') THEN
    EXECUTE 'ALTER TABLE email_sends DROP CONSTRAINT IF EXISTS email_sends_variant_id_fkey';
    EXECUTE 'ALTER TABLE email_sends
      ADD CONSTRAINT email_sends_variant_id_fkey
      FOREIGN KEY (variant_id) REFERENCES email_template_variants(id) ON DELETE SET NULL';
  END IF;
END $$;

-- Fix email_sends.experiment_id FK
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'email_sends' AND column_name = 'experiment_id') THEN
    EXECUTE 'ALTER TABLE email_sends DROP CONSTRAINT IF EXISTS email_sends_experiment_id_fkey';
    EXECUTE 'ALTER TABLE email_sends
      ADD CONSTRAINT email_sends_experiment_id_fkey
      FOREIGN KEY (experiment_id) REFERENCES ab_experiments(id) ON DELETE SET NULL';
  END IF;
END $$;

-- Fix email_sends.conversation_id FK
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'email_sends' AND column_name = 'conversation_id') THEN
    EXECUTE 'ALTER TABLE email_sends DROP CONSTRAINT IF EXISTS email_sends_conversation_id_fkey';
    EXECUTE 'ALTER TABLE email_sends
      ADD CONSTRAINT email_sends_conversation_id_fkey
      FOREIGN KEY (conversation_id) REFERENCES email_conversations(id) ON DELETE SET NULL';
  END IF;
END $$;

-- Fix notification_preferences.user_id FK
ALTER TABLE notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE notification_preferences
  ADD CONSTRAINT notification_preferences_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix notification_digest_queue.user_id FK
ALTER TABLE notification_digest_queue DROP CONSTRAINT IF EXISTS notification_digest_queue_user_id_fkey;
ALTER TABLE notification_digest_queue
  ADD CONSTRAINT notification_digest_queue_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix onboarding_steps.user_id FK
ALTER TABLE onboarding_steps DROP CONSTRAINT IF EXISTS onboarding_steps_user_id_fkey;
ALTER TABLE onboarding_steps
  ADD CONSTRAINT onboarding_steps_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix workspace_api_keys.user_id FK
ALTER TABLE workspace_api_keys DROP CONSTRAINT IF EXISTS workspace_api_keys_user_id_fkey;
ALTER TABLE workspace_api_keys
  ADD CONSTRAINT workspace_api_keys_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Fix failed_jobs.resolved_by FK
ALTER TABLE failed_jobs DROP CONSTRAINT IF EXISTS failed_jobs_resolved_by_fkey;
ALTER TABLE failed_jobs
  ADD CONSTRAINT failed_jobs_resolved_by_fkey
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Fix audit_logs.user_id FK
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Fix security_events.user_id FK
ALTER TABLE security_events DROP CONSTRAINT IF EXISTS security_events_user_id_fkey;
ALTER TABLE security_events
  ADD CONSTRAINT security_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 10: PERFORMANCE INDEXES (Migration 20260126000014)
-- ============================================================================

-- Campaign Leads Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_status
  ON campaign_leads (campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_leads_next_email
  ON campaign_leads (campaign_id, next_email_scheduled_at)
  WHERE status IN ('ready', 'in_sequence');

CREATE INDEX IF NOT EXISTS idx_campaign_leads_timezone
  ON campaign_leads (campaign_id, status)
  WHERE status = 'ready';

-- Email Sends Indexes
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign_status
  ON email_sends (campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_email_sends_pending
  ON email_sends (status, created_at)
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at
  ON email_sends (campaign_id, sent_at)
  WHERE sent_at IS NOT NULL;

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

-- Leads Indexes
CREATE INDEX IF NOT EXISTS idx_leads_workspace_created
  ON leads (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_workspace_email
  ON leads (workspace_id, email)
  WHERE email IS NOT NULL;

-- Email Templates Indexes
CREATE INDEX IF NOT EXISTS idx_templates_workspace_active
  ON email_templates (workspace_id, is_active)
  WHERE is_active = true;

-- Conversations Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_workspace_updated
  ON email_conversations (workspace_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_unread
  ON email_conversations (workspace_id, status)
  WHERE status = 'open';

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_created
  ON audit_logs (workspace_id, created_at DESC);

-- Suppression List Indexes
CREATE INDEX IF NOT EXISTS idx_suppressed_emails_workspace_email
  ON suppressed_emails (workspace_id, email);

-- A/B Testing Indexes
CREATE INDEX IF NOT EXISTS idx_ab_experiments_active
  ON ab_experiments (campaign_id, status)
  WHERE status = 'running';

CREATE INDEX IF NOT EXISTS idx_variant_assignments_lookup
  ON ab_variant_assignments (experiment_id, campaign_lead_id);

-- Failed Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_failed_jobs_retry
  ON failed_jobs (status, next_retry_at)
  WHERE status IN ('pending', 'retrying');

-- ============================================================================
-- DONE! All missing tables have been created.
-- ============================================================================

-- Summary of tables created:
-- 1. email_replies - Reply tracking with AI classification
-- 2. reply_response_templates - Pre-approved response templates
-- 3. suppressed_emails - Bounce/unsubscribe tracking
-- 4. email_template_variants - A/B testing variants
-- 5. ab_experiments - A/B test experiments
-- 6. ab_variant_assignments - Variant assignments per lead
-- 7. variant_stats - Aggregated variant performance
-- 8. email_conversations - Conversation threads
-- 9. conversation_messages - Individual messages
-- 10. notifications - In-app notifications
-- 11. notification_preferences - User notification settings
-- 12. notification_digest_queue - Email digest queue
-- 13. workspace_integrations - External integrations
-- 14. onboarding_steps - User onboarding tracking
-- 15. workspace_api_keys - API key management
-- 16. failed_jobs - Background job error tracking
-- 17. system_health_metrics - System performance metrics
-- 18. audit_logs - Activity audit trail
-- 19. security_events - Security event logging

-- Plus numerous helper functions, triggers, indexes, and RLS policies.
