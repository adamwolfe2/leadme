import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// Diagnostic endpoint to check cookies and session
export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Get Supabase cookies specifically
  const supabaseCookies = allCookies.filter(c =>
    c.name.startsWith('sb-') ||
    c.name.includes('auth-token') ||
    c.name.includes('supabase')
  )

  // Try to read user
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  return NextResponse.json({
    totalCookies: allCookies.length,
    allCookieNames: allCookies.map(c => c.name),
    supabaseCookies: supabaseCookies.map(c => ({
      name: c.name,
      valueLength: c.value?.length || 0,
      hasValue: !!c.value,
    })),
    user: {
      exists: !!user,
      userId: user?.id || null,
      userEmail: user?.email || null,
    },
    error: error?.message || null,
    adminBypassCookie: cookieStore.get('admin_bypass_waitlist')?.value || null,
  })
}
