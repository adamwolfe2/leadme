/**
 * In-Memory Rate Limiter for Admin Operations
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number
  max: number
}

export const RATE_LIMIT_CONFIGS = {
  payout_approval: { windowMs: 60 * 60 * 1000, max: 10 }, // 10/hour
  payout_rejection: { windowMs: 60 * 60 * 1000, max: 20 }, // 20/hour
} as const

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter: number
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  let entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs }
  }

  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, config.max - entry.count)
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000)

  return { allowed: entry.count <= config.max, remaining, retryAfter }
}
