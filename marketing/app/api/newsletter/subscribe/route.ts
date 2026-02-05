/**
 * Newsletter Subscription API Route
 * Handles blog scroll popup newsletter signups
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

    // TODO: Replace with your actual email service integration
    // Examples:
    // - Mailchimp
    // - ConvertKit
    // - Resend
    // - SendGrid

    console.log('Newsletter subscription:', {
      email: body.email,
      source: body.source,
      timestamp: body.timestamp,
    })

    // Example: Add to Mailchimp list
    // await mailchimp.lists.addListMember(LIST_ID, {
    //   email_address: body.email,
    //   status: 'subscribed',
    //   merge_fields: {
    //     SOURCE: 'blog_scroll_popup'
    //   }
    // })

    // Example: Add to ConvertKit
    // await fetch('https://api.convertkit.com/v3/forms/{form_id}/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     api_key: process.env.CONVERTKIT_API_KEY,
    //     email: body.email,
    //   })
    // })

    // Example: Send welcome email with Resend
    // await resend.emails.send({
    //   from: 'newsletter@meetcursive.com',
    //   to: body.email,
    //   subject: 'Welcome to Cursive Weekly',
    //   html: welcomeEmailTemplate
    // })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
