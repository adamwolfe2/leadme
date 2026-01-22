// Leads Export API
// POST /api/leads/export - Export leads to CSV

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { LeadRepository } from '@/lib/repositories/lead.repository'
import { z } from 'zod'

const exportRequestSchema = z.object({
  filters: z
    .object({
      query_id: z.string().uuid().optional(),
      enrichment_status: z.enum(['pending', 'completed', 'failed']).optional(),
      delivery_status: z.enum(['pending', 'delivered', 'failed']).optional(),
      intent_score: z.enum(['hot', 'warm', 'cold']).optional(),
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      search: z.string().optional(),
    })
    .optional(),
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
    const { filters } = exportRequestSchema.parse(body)

    // Generate CSV
    const leadRepo = new LeadRepository()
    const csv = await leadRepo.exportToCSV(user.workspace_id, filters || {})

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('[API] Leads export error:', error)

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
