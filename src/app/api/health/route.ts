/**
 * Health Check API Route
 * GET /api/health
 *
 * Provides system health status for monitoring
 */

import { NextResponse } from 'next/server'

// Use edge runtime for instant response
export const runtime = 'edge'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: { status: string; responseTime?: number; error?: string }
    stripe: { status: string; error?: string }
    environment: { status: string; missing?: string[] }
  }
  uptime: number
}

const START_TIME = Date.now()

export async function GET() {
  // Simplified health check for edge runtime (no Supabase admin client support)
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    checks: {
      environment: {
        status: 'healthy',
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
      }
    },
    runtime: 'edge',
  }

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

// Also respond to HEAD requests for simple uptime checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
