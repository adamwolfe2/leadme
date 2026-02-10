/**
 * DEPRECATED: Old Audience Labs Webhook Handler
 *
 * This endpoint has been replaced by:
 * - /api/webhooks/audiencelab/superpixel (SuperPixel real-time events)
 * - /api/webhooks/audiencelab/audiencesync (AudienceSync HTTP destination)
 * - /api/audiencelab/import (batch export imports)
 *
 * This stub remains to return a helpful error if anything still hits this path.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: 'This endpoint has been deprecated.',
      message: 'Use /api/webhooks/audiencelab/superpixel or /api/webhooks/audiencelab/audiencesync instead.',
    },
    { status: 410 } // 410 Gone
  )
}
