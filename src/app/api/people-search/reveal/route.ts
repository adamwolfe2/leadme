// Email Reveal API
// POST /api/people-search/reveal - Reveal email (costs 1 credit)

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { PeopleSearchRepository } from '@/lib/repositories/people-search.repository'
import { z } from 'zod'

const revealRequestSchema = z.object({
  result_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { result_id } = revealRequestSchema.parse(body)

    // Check if user has credits available
    const peopleSearchRepo = new PeopleSearchRepository()
    const hasCredits = await peopleSearchRepo.checkCredits(user.id, 1)

    if (!hasCredits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message:
            'You have reached your daily credit limit. Upgrade to Pro for more credits or wait for the daily reset at midnight.',
        },
        { status: 403 }
      )
    }

    // Reveal email (this deducts 1 credit atomically)
    const result = await peopleSearchRepo.revealEmail(
      result_id,
      user.workspace_id,
      user.id
    )

    return NextResponse.json({
      success: true,
      data: {
        email: result.email,
        credits_remaining: result.credits_remaining,
      },
      message: `Email revealed. ${result.credits_remaining} credits remaining today.`,
    })
  } catch (error: any) {
    console.error('[API] Email reveal error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    // Check for specific error messages
    if (error.message?.includes('Insufficient credits')) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: error.message,
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
