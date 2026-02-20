-- Add missing columns to audiencelab_pixels for pixel provisioning
-- The /api/pixel/provision route uses label, snippet, and install_url
-- but they were never added to the schema.

ALTER TABLE audiencelab_pixels
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS snippet TEXT,
  ADD COLUMN IF NOT EXISTS install_url TEXT;
