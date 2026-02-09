-- Migration: Add accent_color support to workspace branding
-- The branding column is JSONB, so no schema change needed.
-- This migration exists to document that the branding JSONB now supports:
--   { primary_color, secondary_color, accent_color, logo_url }
--
-- Previously only primary_color, secondary_color, and logo_url were used.
-- No ALTER TABLE needed since branding is a JSONB column.

-- Verify the branding column exists (no-op if it does)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'branding'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN branding JSONB DEFAULT NULL;
  END IF;
END $$;
