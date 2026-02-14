-- Admin Audit Log Table
-- Tracks all admin actions for compliance and security auditing

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying by admin
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_email
  ON admin_audit_log(admin_email);

-- Index for querying by action
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action
  ON admin_audit_log(action);

-- Index for querying by resource
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource
  ON admin_audit_log(resource_type, resource_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at
  ON admin_audit_log(created_at DESC);

-- Enable RLS (admins only can read their own logs or platform admins see all)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Platform admins can insert audit logs
CREATE POLICY "Platform admins can insert audit logs" ON admin_audit_log
  FOR INSERT
  WITH CHECK (
    admin_email IN (
      SELECT email FROM platform_admins WHERE is_active = true
    )
  );

-- Policy: Platform admins can read all audit logs
CREATE POLICY "Platform admins can read all audit logs" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE email = admin_email
      AND is_active = true
    )
  );

-- Add comments
COMMENT ON TABLE admin_audit_log IS 'Audit trail of all administrative actions for compliance';
COMMENT ON COLUMN admin_audit_log.admin_email IS 'Email of admin who performed the action';
COMMENT ON COLUMN admin_audit_log.action IS 'Action performed (e.g., workspace.suspended, lead.approved)';
COMMENT ON COLUMN admin_audit_log.resource_type IS 'Type of resource affected (workspace, lead, user, etc.)';
COMMENT ON COLUMN admin_audit_log.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN admin_audit_log.details IS 'Additional context about the action';
