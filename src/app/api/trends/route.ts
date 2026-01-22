// Trends API
// GET /api/trends - Get trending topics (gainers and losers)

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { TopicSearchService } from '@/lib/services/topic-search.service'
import { z } from 'zod'

const trendsQuerySchema = z.object({
  type: z.enum(['gainers', 'losers', 'all']).optional(),
  limit: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const params = {
      type: searchParams.get('type') || 'all',
      limit: searchParams.get('limit') || '20',
    }

    const validated = trendsQuerySchema.parse(params)
    const limit = parseInt(validated.limit || '20', 10)

    // Fetch trending topics
    const topicSearchService = new TopicSearchService()

    let gainers: any[] = []
    let losers: any[] = []

    if (validated.type === 'gainers' || validated.type === 'all') {
      gainers = await topicSearchService.getTrendingGainers(limit)
    }

    if (validated.type === 'losers' || validated.type === 'all') {
      losers = await topicSearchService.getTrendingLosers(limit)
    }

    return NextResponse.json({
      success: true,
      data: {
        gainers,
        losers,
      },
    })
  } catch (error: any) {
    console.error('[API] Trends error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
