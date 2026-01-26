-- Campaign Email Replies
-- Stores and tracks replies to campaign emails for AI processing and human review
-- ============================================================================

-- ============================================================================
-- 1. EMAIL REPLIES TABLE
-- Stores all replies received to campaign emails
-- ============================================================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_replies_workspace ON email_replies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_campaign ON email_replies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_lead ON email_replies(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_from_email ON email_replies(from_email);
CREATE INDEX IF NOT EXISTS idx_email_replies_status ON email_replies(status);
CREATE INDEX IF NOT EXISTS idx_email_replies_sentiment ON email_replies(sentiment);
CREATE INDEX IF NOT EXISTS idx_email_replies_received_at ON email_replies(received_at DESC);

-- RLS
ALTER TABLE email_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_replies_workspace_isolation" ON email_replies
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

COMMENT ON TABLE email_replies IS 'Stores replies to campaign emails with AI classification and suggested responses';
COMMENT ON COLUMN email_replies.sentiment IS 'AI-classified sentiment of the reply';
COMMENT ON COLUMN email_replies.intent_score IS 'Score from 0-10 indicating buying intent (10 = ready to buy)';
COMMENT ON COLUMN email_replies.classification_confidence IS 'Confidence score of the AI classification (0-1)';

-- ============================================================================
-- 2. REPLY RESPONSE TEMPLATES
-- Pre-approved response templates for different reply types
-- ============================================================================

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
  subject_template TEXT, -- Optional override for subject
  body_template TEXT NOT NULL,

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  auto_suggest BOOLEAN DEFAULT FALSE, -- Auto-suggest this template for matching replies
  priority INTEGER DEFAULT 0, -- Higher priority templates are suggested first

  -- Tracking
  times_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reply_templates_workspace ON reply_response_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reply_templates_sentiment ON reply_response_templates USING GIN(for_sentiment);
CREATE INDEX IF NOT EXISTS idx_reply_templates_active ON reply_response_templates(is_active) WHERE is_active = TRUE;

ALTER TABLE reply_response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reply_templates_workspace_isolation" ON reply_response_templates
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

COMMENT ON TABLE reply_response_templates IS 'Pre-approved response templates for handling different types of replies';

-- ============================================================================
-- 3. ADD REPLY TRACKING TO CAMPAIGN_LEADS
-- ============================================================================

ALTER TABLE campaign_leads
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reply_sentiment TEXT,
ADD COLUMN IF NOT EXISTS reply_intent_score INTEGER,
ADD COLUMN IF NOT EXISTS last_reply_id UUID REFERENCES email_replies(id);

CREATE INDEX IF NOT EXISTS idx_campaign_leads_replied_at ON campaign_leads(replied_at) WHERE replied_at IS NOT NULL;

-- ============================================================================
-- 4. ADD BOUNCE TRACKING
-- ============================================================================

ALTER TABLE campaign_leads
ADD COLUMN IF NOT EXISTS bounce_reason TEXT,
ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ;

ALTER TABLE email_sends
ADD COLUMN IF NOT EXISTS bounce_type TEXT,
ADD COLUMN IF NOT EXISTS bounce_reason TEXT,
ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ;

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

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

COMMENT ON FUNCTION get_campaign_reply_stats IS 'Returns aggregated reply statistics for a campaign';

-- Trigger to update campaign_leads when a reply is received
CREATE OR REPLACE FUNCTION update_campaign_lead_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  -- Update campaign_lead with reply info
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

CREATE TRIGGER trg_update_campaign_lead_on_reply
  AFTER INSERT OR UPDATE ON email_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_lead_on_reply();

-- ============================================================================
-- 6. SAMPLE REPLY RESPONSE TEMPLATES
-- ============================================================================

-- Note: These should be inserted by a seed script with proper workspace_id
-- Here we just document the expected format

COMMENT ON TABLE reply_response_templates IS '
Sample templates to insert per workspace:

- "Positive Interest Follow-up": For positive replies, schedule a call
- "Question Response": For replies with questions, provide info and offer call
- "Objection Handler": For negative/hesitant replies, address concerns
- "Not Now Response": For timing-based pushback, offer to follow up later
- "Referral Request": For out-of-office or not the right person, ask for referral
';
