/**
 * Health Check API Route
 * GET /api/health
 *
 * Provides system health status for monitoring
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripeClient } from '@/lib/stripe/client'

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
  const startTime = Date.now()
  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    checks: {
      database: { status: 'unknown' },
      stripe: { status: 'unknown' },
      environment: { status: 'unknown' },
    },
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
  }

  // Check 1: Database connectivity
  try {
    const dbCheckStart = Date.now()
    const supabase = createAdminClient()
    const { error } = await supabase.from('workspaces').select('id').limit(1).single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is ok
      health.checks.database = {
        status: 'degraded',
        error: error.message,
      }
      health.status = 'degraded'
    } else {
      health.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbCheckStart,
      }
    }
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    health.status = 'unhealthy'
  }

  // Check 2: Stripe API
  try {
    const stripe = getStripeClient()
    // Simple check - just verify client instantiation
    if (stripe) {
      health.checks.stripe = { status: 'healthy' }
    }
  } catch (error) {
    health.checks.stripe = {
      status: 'degraded',
      error: error instanceof Error ? error.message : 'Stripe client error',
    }
    if (health.status === 'healthy') health.status = 'degraded'
  }

  // Check 3: Environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    health.checks.environment = {
      status: 'degraded',
      missing: missingVars,
    }
    if (health.status === 'healthy') health.status = 'degraded'
  } else {
    health.checks.environment = { status: 'healthy' }
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 500 : 503

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Check-Duration-Ms': String(Date.now() - startTime),
    },
  })
}

// Also respond to HEAD requests for simple uptime checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
