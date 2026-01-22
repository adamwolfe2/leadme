// Queries API Route - List and Create

import { NextResponse, type NextRequest } from 'next/server'
import { QueryRepository } from '@/lib/repositories/query.repository'
import { getCurrentUser } from '@/lib/auth/helpers'
import { z } from 'zod'

// Validation schema for query creation
const createQuerySchema = z.object({
  topic_id: z.string().uuid(),
  name: z.string().optional(),
  filters: z.object({
    location: z
      .object({
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
      })
      .optional()
      .nullable(),
    company_size: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
      })
      .optional()
      .nullable(),
    industry: z.array(z.string()).optional().nullable(),
    revenue_range: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
      })
      .optional()
      .nullable(),
    employee_range: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
      })
      .optional()
      .nullable(),
    technologies: z.array(z.string()).optional().nullable(),
    exclude_companies: z.array(z.string()).optional(),
  }),
})

/**
 * GET /api/queries - List all queries for workspace
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get queries
    const queryRepo = new QueryRepository()
    const queries = await queryRepo.findByWorkspace(user.workspace_id)

    return NextResponse.json({ data: queries })
  } catch (error: any) {
    console.error('Get queries error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/queries - Create a new query
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createQuerySchema.parse(body)

    // Check query limit based on plan
    const queryRepo = new QueryRepository()
    const activeCount = await queryRepo.countActiveByWorkspace(user.workspace_id)

    const limit = user.plan === 'pro' ? 5 : 1
    if (activeCount >= limit) {
      return NextResponse.json(
        {
          error: `Query limit reached. ${user.plan === 'free' ? 'Upgrade to Pro to create up to 5 queries.' : 'You have reached the maximum of 5 queries.'}`,
        },
        { status: 403 }
      )
    }

    // Create query
    const query = await queryRepo.create({
      workspace_id: user.workspace_id,
      topic_id: validatedData.topic_id,
      name: validatedData.name,
      filters: validatedData.filters,
      status: 'active',
      created_by: user.id,
    })

    return NextResponse.json({ data: query }, { status: 201 })
  } catch (error: any) {
    console.error('Create query error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
