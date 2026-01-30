-- Add lead verification columns for admin manual review
-- This allows admins to approve/reject leads uploaded by partners

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS verification_status_admin TEXT DEFAULT 'approved' CHECK (verification_status_admin IN ('pending', 'approved', 'rejected', 'flagged')),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS rejection_code TEXT CHECK (rejection_code IN ('invalid_data', 'duplicate', 'low_quality', 'incorrect_format', 'missing_information', 'outside_coverage', 'other'));

-- Add index for verification queue queries
CREATE INDEX IF NOT EXISTS idx_leads_verification_status ON leads(verification_status_admin) WHERE verification_status_admin IN ('pending', 'flagged');

-- Add index for verified_by
CREATE INDEX IF NOT EXISTS idx_leads_verified_by ON leads(verified_by) WHERE verified_by IS NOT NULL;

-- Add comment
COMMENT ON COLUMN leads.verification_status_admin IS 'Admin verification status for manually uploaded or flagged leads';
COMMENT ON COLUMN leads.rejection_reason IS 'Detailed reason provided by admin when rejecting a lead';
COMMENT ON COLUMN leads.rejection_code IS 'Categorized rejection reason code';
