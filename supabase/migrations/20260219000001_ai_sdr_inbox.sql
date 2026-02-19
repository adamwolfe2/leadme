-- AI SDR Inbox Manager Migration
-- Adds SDR configuration, DNC list, and draft lifecycle columns to email_replies

-- SDR Configuration per workspace
CREATE TABLE IF NOT EXISTS sdr_configurations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  objective                 TEXT    DEFAULT 'Set up a meeting',
  language                  TEXT    DEFAULT 'English',
  do_not_contact_enabled    BOOLEAN DEFAULT false,
  human_in_the_loop         BOOLEAN DEFAULT true,
  trigger_phrases           TEXT[]  DEFAULT '{}',
  warmup_exclusion_keywords TEXT[]  DEFAULT '{}',
  follow_up_enabled         BOOLEAN DEFAULT false,
  follow_up_count           INT     DEFAULT 2 CHECK (follow_up_count BETWEEN 1 AND 5),
  follow_up_interval_days   INT     DEFAULT 3,
  reply_to_no_thanks        BOOLEAN DEFAULT false,
  no_thanks_template        TEXT,
  enable_signature          BOOLEAN DEFAULT true,
  auto_bcc_address          TEXT,
  notification_email        TEXT,
  cal_booking_url           TEXT,
  timezone                  TEXT    DEFAULT 'America/Chicago',
  availability_start        TIME    DEFAULT '08:00',
  availability_end          TIME    DEFAULT '17:00',
  exclude_weekends          BOOLEAN DEFAULT true,
  exclude_holidays          BOOLEAN DEFAULT true,
  agent_first_name          TEXT,
  agent_last_name           TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_sdr_conf_workspace ON sdr_configurations(workspace_id);
ALTER TABLE sdr_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sdr_configurations_service_only" ON sdr_configurations FOR ALL USING (false);

-- Do Not Contact list
CREATE TABLE IF NOT EXISTS do_not_contact (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  reason       TEXT,
  added_by     TEXT,
  added_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, email)
);
CREATE INDEX IF NOT EXISTS idx_dnc_workspace ON do_not_contact(workspace_id);
CREATE INDEX IF NOT EXISTS idx_dnc_email     ON do_not_contact(email);
ALTER TABLE do_not_contact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "do_not_contact_service_only" ON do_not_contact FOR ALL USING (false);

-- Extend email_replies with AI draft lifecycle
ALTER TABLE email_replies
  ADD COLUMN IF NOT EXISTS draft_status TEXT DEFAULT 'pending'
    CHECK (draft_status IN ('pending','needs_approval','approved','sent','rejected','skipped')),
  ADD COLUMN IF NOT EXISTS approved_by  TEXT,
  ADD COLUMN IF NOT EXISTS approved_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_notes  TEXT;
CREATE INDEX IF NOT EXISTS idx_email_replies_draft_status
  ON email_replies(draft_status) WHERE draft_status = 'needs_approval';
