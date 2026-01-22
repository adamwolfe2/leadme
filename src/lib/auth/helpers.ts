// Authentication Helper Functions

import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types'

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  // Get user profile from database
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', session.user.id)
    .single()

  return user
}

/**
 * Get the current user's workspace ID
 * Returns null if not authenticated or no workspace
 */
export async function getCurrentWorkspaceId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.workspace_id ?? null
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: 'owner' | 'admin' | 'member'): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const roles = {
    owner: ['owner'],
    admin: ['owner', 'admin'],
    member: ['owner', 'admin', 'member'],
  }

  return roles[role].includes(user.role)
}

/**
 * Check if user has Pro plan
 */
export async function hasPro(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.plan === 'pro'
}

/**
 * Get user with workspace data
 */
export async function getUserWithWorkspace() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('*, workspaces(*)')
    .eq('auth_user_id', session.user.id)
    .single()

  return user
}

/**
 * Check if user has available credits
 */
export async function hasCreditsAvailable(creditsNeeded: number = 1): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return (user.daily_credits_used + creditsNeeded) <= user.daily_credit_limit
}

/**
 * Get credits remaining for user
 */
export async function getCreditsRemaining(): Promise<number> {
  const user = await getCurrentUser()
  if (!user) return 0

  return Math.max(0, user.daily_credit_limit - user.daily_credits_used)
}
