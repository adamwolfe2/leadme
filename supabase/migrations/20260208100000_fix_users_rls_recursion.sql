-- Fix RLS Infinite Recursion on users table
-- The SELECT/UPDATE policies on `users` reference `users` in a subquery,
-- causing "infinite recursion detected in policy for relation 'users'".
-- Fix: use get_user_workspace_id() which is SECURITY DEFINER and bypasses RLS.

-- ============================================================================
-- 1. FIX SELECT POLICY ON users
-- ============================================================================

-- Drop the old recursive SELECT policies
DROP POLICY IF EXISTS "Users can view workspace members" ON users;
DROP POLICY IF EXISTS "Users can view workspace members with impersonation" ON users;

-- Recreate using SECURITY DEFINER function (no recursion)
CREATE POLICY "Users can view workspace members" ON users
  FOR SELECT
  USING (
    workspace_id = get_user_workspace_id()
    OR auth_user_id = auth.uid()
    OR is_current_user_platform_admin()
  );

-- ============================================================================
-- 2. FIX UPDATE POLICIES ON users
-- ============================================================================

-- Drop old recursive UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update members" ON users;

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Workspace owners/admins can update members in their workspace
CREATE POLICY "Admins can update members" ON users
  FOR UPDATE
  USING (
    workspace_id = get_user_workspace_id()
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
        AND u.role IN ('owner', 'admin')
        AND u.workspace_id = get_user_workspace_id()
    )
  );

-- ============================================================================
-- 3. FIX is_admin BUG ON processed_webhook_events
-- ============================================================================

-- The "Admins can view webhook events" policy references is_admin column
-- which doesn't exist on the users table. Replace with platform admin check.
DROP POLICY IF EXISTS "Admins can view webhook events" ON processed_webhook_events;

CREATE POLICY "Admins can view webhook events" ON processed_webhook_events
  FOR SELECT
  USING (is_current_user_platform_admin());

-- ============================================================================
-- 4. ADD INSERT POLICY ON users
-- ============================================================================

-- Users can only insert their own record (auth_user_id must match)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

-- ============================================================================
-- 5. ADD INSERT POLICY ON workspaces
-- ============================================================================

-- Any authenticated user can create a workspace (needed for onboarding)
DROP POLICY IF EXISTS "Authenticated users can create workspace" ON workspaces;

CREATE POLICY "Authenticated users can create workspace" ON workspaces
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
