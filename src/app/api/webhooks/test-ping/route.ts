import { NextResponse } from 'next/server'

// Explicitly use Node.js runtime (NOT Edge) to test if Node.js functions work at webhook paths
// export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ ok: true, runtime: 'nodejs', ts: Date.now() })
}

export async function POST() {
  return NextResponse.json({ ok: true, runtime: 'nodejs', method: 'POST', ts: Date.now() })
}
