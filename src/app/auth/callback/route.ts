// Auth Callback Route
// Handles OAuth redirects from Supabase

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL('/login?error=auth_callback_error', requestUrl.origin)
      )
    }

    // Get user and check if they have a workspace
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { data: user } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('auth_user_id', session.user.id)
        .single()

      // Redirect to onboarding if no workspace
      if (!user || !user.workspace_id) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }
    }
  }

  // Redirect to next URL
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
