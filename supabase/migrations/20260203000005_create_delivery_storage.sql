-- Create storage bucket for service deliveries
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-deliveries', 'service-deliveries', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for service deliveries bucket
-- Admins can upload files
CREATE POLICY "Admins can upload delivery files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-deliveries' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admins can update files
CREATE POLICY "Admins can update delivery files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-deliveries' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admins can delete files
CREATE POLICY "Admins can delete delivery files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-deliveries' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Users can download their workspace's delivery files
CREATE POLICY "Users can download their delivery files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'service-deliveries' AND
  -- Extract workspace_id from file path: workspace_id/delivery_id/filename
  (string_to_array(name, '/'))[1]::uuid IN (
    SELECT workspace_id::text FROM users
    WHERE users.auth_user_id = auth.uid()
  )
);

-- Add file_path column to service_deliveries to store the storage path
ALTER TABLE service_deliveries
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER;

COMMENT ON COLUMN service_deliveries.file_path IS 'Storage path: workspace_id/delivery_id/filename.csv';
COMMENT ON COLUMN service_deliveries.file_name IS 'Original filename uploaded by admin';
COMMENT ON COLUMN service_deliveries.file_size IS 'File size in bytes';
