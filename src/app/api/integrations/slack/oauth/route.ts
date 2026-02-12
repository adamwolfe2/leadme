/**
 * Slack OAuth Authorization Route
 * Cursive Platform
 *
 * Initiates the OAuth v2 flow for connecting Slack Incoming Webhooks.
 * User clicks "Connect Slack" -> redirected here -> redirected to Slack OAuth.
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Slack OAuth Configuration
const SLACK_OAUTH_URL = 'https://slack.com/oauth/v2/authorize'

/**
 * Get authenticated user from session
 */
async function getAuthenticatedUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, workspace_id, email')
    .eq('auth_user_id', authUser.id)
    .single()

  return user
}

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized&redirect=/settings/integrations', req.url)
      )
    }

    // Validate Slack configuration
    const clientId = process.env.SLACK_CLIENT_ID
    if (!clientId) {
      console.error('[Slack OAuth] Missing SLACK_CLIENT_ID')
      return NextResponse.redirect(
        new URL('/settings/integrations?error=slack_not_configured', req.url)
      )
    }

    // Generate state parameter for CSRF protection
    const state = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')

    // Store state in cookie for verification
    const cookieStore = await cookies()
    cookieStore.set('slack_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    // Store workspace info for callback
    cookieStore.set(
      'slack_oauth_context',
      JSON.stringify({
        workspace_id: user.workspace_id,
        user_id: user.id,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      }
    )

    // Build OAuth URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`

    const oauthUrl = new URL(SLACK_OAUTH_URL)
    oauthUrl.searchParams.set('client_id', clientId)
    oauthUrl.searchParams.set('scope', 'incoming-webhook')
    oauthUrl.searchParams.set('redirect_uri', redirectUri)
    oauthUrl.searchParams.set('state', state)

    return NextResponse.redirect(oauthUrl.toString())
  } catch (error: any) {
    console.error('[Slack OAuth] Authorization error:', error)
    return NextResponse.redirect(
      new URL('/settings/integrations?error=slack_oauth_failed', req.url)
    )
  }
}
