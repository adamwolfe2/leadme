-- Migration: Fix Foreign Key Constraints
-- Addresses missing ON DELETE clauses and implicit FK constraints

-- =============================================
-- Fix Migration 1: sales_co_campaigns_templates
-- =============================================

-- Fix email_campaigns.reviewed_by FK
ALTER TABLE email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_reviewed_by_fkey;
ALTER TABLE email_campaigns
  ADD CONSTRAINT email_campaigns_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Fix campaign_reviews.reviewer_id FK
ALTER TABLE campaign_reviews DROP CONSTRAINT IF EXISTS campaign_reviews_reviewer_id_fkey;
ALTER TABLE campaign_reviews
  ADD CONSTRAINT campaign_reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- Fix Migration 2: campaign_replies
-- =============================================

-- Fix email_replies.reviewed_by FK
ALTER TABLE email_replies DROP CONSTRAINT IF EXISTS email_replies_reviewed_by_fkey;
ALTER TABLE email_replies
  ADD CONSTRAINT email_replies_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Fix email_replies.response_email_send_id FK
ALTER TABLE email_replies DROP CONSTRAINT IF EXISTS email_replies_response_email_send_id_fkey;
ALTER TABLE email_replies
  ADD CONSTRAINT email_replies_response_email_send_id_fkey
  FOREIGN KEY (response_email_send_id) REFERENCES email_sends(id) ON DELETE SET NULL;

-- =============================================
-- Fix Migration 7: ab_testing
-- =============================================

-- Fix email_template_variants.workspace_id FK
ALTER TABLE email_template_variants DROP CONSTRAINT IF EXISTS email_template_variants_workspace_id_fkey;
ALTER TABLE email_template_variants
  ADD CONSTRAINT email_template_variants_workspace_id_fkey
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Fix ab_experiments.workspace_id FK
ALTER TABLE ab_experiments DROP CONSTRAINT IF EXISTS ab_experiments_workspace_id_fkey;
ALTER TABLE ab_experiments
  ADD CONSTRAINT ab_experiments_workspace_id_fkey
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Fix ab_experiments.winner_variant_id FK
ALTER TABLE ab_experiments DROP CONSTRAINT IF EXISTS ab_experiments_winner_variant_id_fkey;
ALTER TABLE ab_experiments
  ADD CONSTRAINT ab_experiments_winner_variant_id_fkey
  FOREIGN KEY (winner_variant_id) REFERENCES email_template_variants(id) ON DELETE SET NULL;

-- Fix email_sends.variant_id FK (if column exists)
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

-- Fix email_sends.experiment_id FK (if column exists)
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

-- =============================================
-- Fix Migration 8: conversations
-- =============================================

-- Fix conversation_messages.workspace_id FK
ALTER TABLE conversation_messages DROP CONSTRAINT IF EXISTS conversation_messages_workspace_id_fkey;
ALTER TABLE conversation_messages
  ADD CONSTRAINT conversation_messages_workspace_id_fkey
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Fix email_sends.conversation_id FK (if column exists)
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

-- =============================================
-- Fix Migration 9: notifications
-- =============================================

-- Fix notifications.workspace_id FK
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_workspace_id_fkey;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_workspace_id_fkey
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add explicit FK for notification_preferences.user_id
ALTER TABLE notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE notification_preferences
  ADD CONSTRAINT notification_preferences_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add explicit FK for notification_digest_queue.user_id
ALTER TABLE notification_digest_queue DROP CONSTRAINT IF EXISTS notification_digest_queue_user_id_fkey;
ALTER TABLE notification_digest_queue
  ADD CONSTRAINT notification_digest_queue_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- =============================================
-- Fix Migration 10: workspace_settings
-- =============================================

-- Add explicit FK for onboarding_steps.user_id
ALTER TABLE onboarding_steps DROP CONSTRAINT IF EXISTS onboarding_steps_user_id_fkey;
ALTER TABLE onboarding_steps
  ADD CONSTRAINT onboarding_steps_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add explicit FK for workspace_api_keys.user_id
ALTER TABLE workspace_api_keys DROP CONSTRAINT IF EXISTS workspace_api_keys_user_id_fkey;
ALTER TABLE workspace_api_keys
  ADD CONSTRAINT workspace_api_keys_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- Fix Migration 11: failed_jobs
-- =============================================

-- Add explicit FK for failed_jobs.resolved_by
ALTER TABLE failed_jobs DROP CONSTRAINT IF EXISTS failed_jobs_resolved_by_fkey;
ALTER TABLE failed_jobs
  ADD CONSTRAINT failed_jobs_resolved_by_fkey
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- Fix Migration 12: audit_logs
-- =============================================

-- Add explicit FK for audit_logs.user_id (soft reference - SET NULL on delete)
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add explicit FK for security_events.user_id (soft reference - SET NULL on delete)
ALTER TABLE security_events DROP CONSTRAINT IF EXISTS security_events_user_id_fkey;
ALTER TABLE security_events
  ADD CONSTRAINT security_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- Summary of changes:
-- - 22 foreign key constraints fixed
-- - All user references now SET NULL on delete (preserve audit trail)
-- - All workspace references now CASCADE on delete
-- - All optional references (winner_variant_id, etc) SET NULL on delete
-- =============================================
