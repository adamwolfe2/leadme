/**
 * HubSpot OAuth Authorization Route
 * Cursive Platform
 *
 * Initiates the OAuth flow for connecting HubSpot CRM accounts.
 * Stores credentials in crm_connections table for use by HubSpotService.
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { safeError } from '@/lib/utils/log-sanitizer'

// HubSpot OAuth Configuration
const HS_OAUTH_URL = 'https://app.hubspot.com/oauth/authorize'

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

    // Validate HubSpot configuration
    const clientId = process.env.HUBSPOT_CLIENT_ID
    if (!clientId) {
      safeError('[HubSpot OAuth] Missing HUBSPOT_CLIENT_ID')
      return NextResponse.redirect(
        new URL('/settings/integrations?error=hs_not_configured', req.url)
      )
    }

    // Generate state parameter for CSRF protection
    const state = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')

    // Store state in cookie for verification
    const cookieStore = await cookies()
    cookieStore.set('hs_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    // Store workspace info for callback
    cookieStore.set(
      'hs_oauth_context',
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
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/crm/auth/hubspot/callback`
    const scopes = 'crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write crm.objects.companies.read crm.objects.companies.write'

    const oauthUrl = new URL(HS_OAUTH_URL)
    oauthUrl.searchParams.set('response_type', 'code')
    oauthUrl.searchParams.set('client_id', clientId)
    oauthUrl.searchParams.set('redirect_uri', redirectUri)
    oauthUrl.searchParams.set('scope', scopes)
    oauthUrl.searchParams.set('state', state)

    return NextResponse.redirect(oauthUrl.toString())
  } catch (error: any) {
    safeError('[HubSpot OAuth] Authorization error:', error)
    return NextResponse.redirect(
      new URL('/settings/integrations?error=hs_oauth_failed', req.url)
    )
  }
}
