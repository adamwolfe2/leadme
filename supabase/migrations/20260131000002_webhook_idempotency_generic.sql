-- Migration: Make webhook idempotency table generic for all webhook sources
-- Extends processed_webhook_events to handle Stripe, Audience Labs, and future webhook sources

-- Add generic event_id column (replaces stripe_event_id constraint)
ALTER TABLE processed_webhook_events
ADD COLUMN IF NOT EXISTS event_id VARCHAR(255);

-- Add source column to distinguish webhook providers
ALTER TABLE processed_webhook_events
ADD COLUMN IF NOT EXISTS source VARCHAR(50) NOT NULL DEFAULT 'stripe';

-- Add payload summary for debugging
ALTER TABLE processed_webhook_events
ADD COLUMN IF NOT EXISTS payload_summary JSONB;

-- Backfill event_id from stripe_event_id for existing records
UPDATE processed_webhook_events
SET event_id = stripe_event_id
WHERE event_id IS NULL;

-- Make event_id required
ALTER TABLE processed_webhook_events
ALTER COLUMN event_id SET NOT NULL;

-- Create composite unique constraint (event_id + source)
-- Drop old unique constraint on stripe_event_id first
ALTER TABLE processed_webhook_events
DROP CONSTRAINT IF EXISTS processed_webhook_events_stripe_event_id_key;

-- Add new composite unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_processed_webhook_events_event_source
ON processed_webhook_events(event_id, source);

-- Create index for fast source lookup
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_source
ON processed_webhook_events(source);

-- Update cleanup function to work with all sources
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events(p_retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM processed_webhook_events
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Log cleanup for audit
  RAISE NOTICE 'Cleaned up % webhook events older than % days', v_deleted, p_retention_days;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Update comments
COMMENT ON TABLE processed_webhook_events IS
'Tracks processed webhook events from all sources (Stripe, Audience Labs, etc.) to prevent duplicate processing.
Used for idempotency in webhook handlers. Old events are automatically cleaned up after 30 days.';

COMMENT ON COLUMN processed_webhook_events.event_id IS
'Unique event identifier from webhook source (e.g., Stripe event ID, import job ID, or payload hash)';

COMMENT ON COLUMN processed_webhook_events.source IS
'Webhook source identifier (stripe, audience-labs, etc.)';

COMMENT ON COLUMN processed_webhook_events.payload_summary IS
'JSON summary of webhook payload for debugging (lead count, workspace, etc.)';

-- Update stripe_event_id to be nullable since we now use event_id
-- Keep it for backwards compatibility
ALTER TABLE processed_webhook_events
ALTER COLUMN stripe_event_id DROP NOT NULL;

-- Add check constraint for valid sources
ALTER TABLE processed_webhook_events
ADD CONSTRAINT check_valid_webhook_source
CHECK (source IN ('stripe', 'audience-labs', 'clay', 'datashopper', 'emailbison', 'bland', 'inbound-email'));

COMMENT ON CONSTRAINT check_valid_webhook_source ON processed_webhook_events IS
'Ensures webhook source is from a known provider. Update this list when adding new webhook integrations.';
