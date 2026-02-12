export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { WaitlistRepository } from '@/lib/repositories/waitlist.repository'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'

export async function GET() {
  try {
    // Check admin authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAdminAccess = await isAdmin(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all waitlist signups
    const repo = new WaitlistRepository()
    const result = await repo.findAll(1, 1000) // Get first 1000

    return NextResponse.json({
      signups: result.signups,
      total: result.total
    })
  } catch (error) {
    console.error('[Admin] Waitlist fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}
