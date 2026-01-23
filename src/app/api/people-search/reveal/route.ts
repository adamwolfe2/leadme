// Email Reveal API
// POST /api/people-search/reveal - Reveal email (costs 1 credit)

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { PeopleSearchRepository } from '@/lib/repositories/people-search.repository'
import { handleApiError, unauthorized, forbidden, success } from '@/lib/utils/api-error-handler'
import { z } from 'zod'

const revealRequestSchema = z.object({
  result_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized()
    }

    // 2. Validate input with Zod
    const body = await request.json()
    const { result_id } = revealRequestSchema.parse(body)

    // 3. Check if user has credits available
    const peopleSearchRepo = new PeopleSearchRepository()
    const hasCredits = await peopleSearchRepo.checkCredits(user.id, 1)

    if (!hasCredits) {
      return forbidden(
        'You have reached your daily credit limit. Upgrade to Pro for more credits or wait for the daily reset at midnight.'
      )
    }

    // 4. Reveal email with workspace filtering (deducts 1 credit atomically)
    const result = await peopleSearchRepo.revealEmail(
      result_id,
      user.workspace_id,
      user.id
    )

    // 5. Return response
    return NextResponse.json({
      success: true,
      data: {
        email: result.email,
        credits_remaining: result.credits_remaining,
      },
      message: `Email revealed. ${result.credits_remaining} credits remaining today.`,
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}
