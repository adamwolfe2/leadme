// Referral Code Validation API
// Validate a referral code and return referrer info

import { NextRequest, NextResponse } from 'next/server'
import { lookupReferralCode } from '@/lib/services/referral.service'
import { safeError } from '@/lib/utils/log-sanitizer'
import { withRateLimit } from '@/lib/middleware/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    const rateLimited = await withRateLimit(request, 'public-form')
    if (rateLimited) return rateLimited

    const code = request.nextUrl.searchParams.get('code')

    if (!code || code.length > 64) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 })
    }

    const result = await lookupReferralCode(code)

    if (!result || !result.valid) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid referral code',
      })
    }

    return NextResponse.json({
      valid: true,
      referrerType: result.referrerType,
      referrerName: result.referrerName,
    })
  } catch (error) {
    safeError('Failed to validate referral code:', error)
    return NextResponse.json(
      { error: 'Failed to validate code' },
      { status: 500 }
    )
  }
}
