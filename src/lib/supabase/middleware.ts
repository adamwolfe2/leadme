// Supabase Middleware Client
// Use this in Next.js middleware

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const createClient = (request: NextRequest) => {
  // Create a mutable response object
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Accumulate all cookies across multiple setAll calls to prevent cookie loss.
  // The Supabase SDK may call setAll multiple times during a single getSession()
  // (e.g., once to clear old cookies, once to set refreshed cookies). Without
  // accumulation, recreating supabaseResponse in each setAll would lose earlier cookies.
  const pendingCookies = new Map<string, { name: string; value: string; options?: Record<string, unknown> }>()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // Update request cookies for downstream handlers
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value)
          )
          // Track all cookies (latest value wins for each name)
          cookiesToSet.forEach((cookie) =>
            pendingCookies.set(cookie.name, cookie)
          )
          // Recreate response with updated request
          supabaseResponse = NextResponse.next({
            request,
          })
          // CRITICAL: Set ALL accumulated cookies on response for browser persistence
          pendingCookies.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  return {
    supabase,
    get response() {
      return supabaseResponse
    },
  }
}
