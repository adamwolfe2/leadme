// Minimal test endpoint - no dependencies, no middleware
import { NextResponse } from 'next/server'

export const runtime = 'edge' // Use edge runtime for faster cold starts

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    message: 'Simple test endpoint works!',
    timestamp: new Date().toISOString(),
  })
}
