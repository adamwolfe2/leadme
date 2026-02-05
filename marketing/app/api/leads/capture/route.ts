/**
 * Lead Capture API Route
 * Handles popup form submissions
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // TODO: Replace with your actual CRM/database integration
    // Examples:
    // - Send to HubSpot
    // - Save to Supabase
    // - Add to Mailchimp
    // - Send to Slack webhook

    console.log('Lead captured from popup:', {
      email: body.email,
      company: body.company,
      source: body.source,
      timestamp: body.timestamp,
    })

    // Example: Send to HubSpot
    // await createHubSpotContact({
    //   email: body.email,
    //   company: body.company,
    //   source: 'exit_intent_popup',
    // })

    // Example: Save to database
    // await supabase.from('leads').insert({
    //   email: body.email,
    //   company: body.company,
    //   source: body.source,
    //   created_at: body.timestamp,
    // })

    // Example: Send notification to Slack
    // await fetch(process.env.SLACK_WEBHOOK_URL, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     text: `New lead from popup: ${body.email} (${body.company || 'No company'})`
    //   })
    // })

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
    })
  } catch (error) {
    console.error('Error capturing lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
