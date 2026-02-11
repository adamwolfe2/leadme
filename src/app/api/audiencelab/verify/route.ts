/**
 * AudienceLab API Verification Endpoint
 *
 * Admin-only endpoint to test AL REST API connectivity.
 * Tests: listPixels, listAudiences, and optionally enrich.
 *
 * GET /api/audiencelab/verify
 * GET /api/audiencelab/verify?enrich=test@example.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listPixels, listAudiences, enrich, healthCheck } from '@/lib/audiencelab/api-client'

export async function GET(request: NextRequest) {
  // Auth check — admin only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const results: Record<string, unknown> = {}
  const enrichEmail = request.nextUrl.searchParams.get('enrich')

  // Test 1: Health check (calls listPixels)
  try {
    results.health = await healthCheck()
  } catch (err) {
    results.health = { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }

  // Test 2: List pixels
  try {
    const pixels = await listPixels()
    results.pixels = { count: pixels.length, data: pixels }
  } catch (err) {
    results.pixels = { error: err instanceof Error ? err.message : 'Unknown error' }
  }

  // Test 3: List audiences
  try {
    const audiences = await listAudiences({ limit: 5 })
    results.audiences = audiences
  } catch (err) {
    results.audiences = { error: err instanceof Error ? err.message : 'Unknown error' }
  }

  // Test 4: Enrich (optional, only if email param provided)
  if (enrichEmail) {
    try {
      const enrichResult = await enrich({ filter: { email: enrichEmail } })
      results.enrich = enrichResult
    } catch (err) {
      results.enrich = { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return NextResponse.json({
    api_key_configured: !!process.env.AUDIENCELAB_ACCOUNT_API_KEY,
    timestamp: new Date().toISOString(),
    results,
  })
}
