// Topic Search API Route

import { NextResponse, type NextRequest } from 'next/server'
import { TopicSearchService } from '@/lib/services/topic-search.service'
import { getCurrentUser } from '@/lib/auth/helpers'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Search topics
    const topicSearchService = new TopicSearchService()
    const results = await topicSearchService.searchTopics(query, limit)

    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Topic search error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
