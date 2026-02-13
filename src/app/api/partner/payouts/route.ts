export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/utils/log-sanitizer'

// Header validation schema
const headersSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
})

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key')

    // Validate headers
    const headerValidation = headersSchema.safeParse({ apiKey })
    if (!headerValidation.success) {
      return NextResponse.json(
        { error: 'API key required', details: headerValidation.error.format() },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Validate partner
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name, total_earnings, pending_balance, available_balance, payout_threshold, stripe_account_id, stripe_onboarding_complete')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Get payout history
    const { data: payoutHistory } = await supabase
      .from('payout_requests')
      .select('id, amount, status, requested_at, processed_at, notes')
      .eq('partner_id', partner.id)
      .order('requested_at', { ascending: false })
      .limit(50)

    // Calculate lifetime paid
    const { data: completedPayouts } = await supabase
      .from('payout_requests')
      .select('amount')
      .eq('partner_id', partner.id)
      .eq('status', 'completed')

    const lifetimePaid = completedPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    return NextResponse.json({
      success: true,
      partner_name: partner.name,
      stats: {
        total_earnings: Number(partner.total_earnings || 0),
        pending_balance: Number(partner.pending_balance || 0),
        available_balance: Number(partner.available_balance || 0),
        lifetime_paid: lifetimePaid,
        payout_threshold: Number(partner.payout_threshold || 50),
        stripe_connected: !!partner.stripe_account_id && partner.stripe_onboarding_complete,
      },
      payout_history: payoutHistory || [],
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.format() },
        { status: 400 }
      )
    }

    safeError('Partner payouts error:', error)
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
  }
}
