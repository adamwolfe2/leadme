// People Search API
// POST /api/people-search - Search for people

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { PeopleSearchService } from '@/lib/services/people-search.service'
import { PeopleSearchRepository } from '@/lib/repositories/people-search.repository'
import { z } from 'zod'

const searchRequestSchema = z.object({
  filters: z.object({
    company: z.string().optional(),
    domain: z.string().optional(),
    job_title: z.string().optional(),
    seniority: z.string().optional(),
    department: z.string().optional(),
    location: z.string().optional(),
    industry: z.string().optional(),
  }),
  save_search: z.boolean().optional(),
  search_name: z.string().optional(),
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
    const { filters, save_search, search_name } = searchRequestSchema.parse(body)

    // Validate at least one filter is provided
    if (!filters.domain && !filters.company) {
      return NextResponse.json(
        { error: 'Please provide either a company domain or company name' },
        { status: 400 }
      )
    }

    // Search for people
    const peopleSearchService = new PeopleSearchService()
    const results = await peopleSearchService.searchPeople(filters, 50)

    // Save results to database
    const peopleSearchRepo = new PeopleSearchRepository()
    const savedResults = await Promise.all(
      results.map((person) =>
        peopleSearchRepo.createResult(
          user.workspace_id,
          {
            ...person,
            email_revealed: false, // Email hidden by default
          },
          filters
        )
      )
    )

    // Save search if requested
    if (save_search && search_name) {
      await peopleSearchRepo.saveSearch(
        user.workspace_id,
        search_name,
        filters
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        results: savedResults.map((result) => ({
          ...result,
          person_data: {
            ...result.person_data,
            // Mask email for display
            email: peopleSearchService.maskEmail(
              result.person_data.email || ''
            ),
          },
        })),
        count: savedResults.length,
      },
    })
  } catch (error: any) {
    console.error('[API] People search error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/people-search - Get saved searches
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const peopleSearchRepo = new PeopleSearchRepository()
    const savedSearches = await peopleSearchRepo.findSavedSearches(
      user.workspace_id
    )

    return NextResponse.json({
      success: true,
      data: savedSearches,
    })
  } catch (error: any) {
    console.error('[API] Get saved searches error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
