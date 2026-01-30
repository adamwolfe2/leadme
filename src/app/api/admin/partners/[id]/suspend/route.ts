// Admin Partner Suspend API
// Suspend a partner account

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { PartnerRepository } from '@/lib/repositories/partner.repository'

const suspendSchema = z.object({
  reason: z.string().min(10, 'Suspension reason must be at least 10 characters'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('platform_admins')
      .select('id')
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const validated = suspendSchema.parse(body)

    // Update partner status
    const repo = new PartnerRepository()
    const partner = await repo.update(params.id, {
      status: 'suspended',
      isActive: false,
      suspensionReason: validated.reason,
    })

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'partner.suspended',
      resource_type: 'partner',
      resource_id: params.id,
      metadata: {
        reason: validated.reason,
        suspended_by: user.email,
      },
    })

    return NextResponse.json({ partner })
  } catch (error) {
    console.error('Error suspending partner:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to suspend partner' },
      { status: 500 }
    )
  }
}
