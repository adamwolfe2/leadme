// Simple middleware for marketing site
// No authentication or database needed - just basic routing

import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Just pass through all requests
  return NextResponse.next()
}

// Only run on specific paths if needed
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images)
     * - SEO files (robots.txt, sitemap.xml, llms.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt|xml)$).*)',
  ],
}
