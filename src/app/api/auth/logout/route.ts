/**
 * Logout API Endpoint — DEPRECATED
 * Redirects to /api/auth/signout which handles proper cookie cleanup.
 * Kept as a redirect for backward compatibility with any cached clients.
 */

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Forward to the canonical signout endpoint
  const url = new URL('/api/auth/signout', request.url)
  return NextResponse.redirect(url, { status: 307 })
}
