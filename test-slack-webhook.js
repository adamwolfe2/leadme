// Test Slack Webhook
// Run: node test-slack-webhook.js

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || process.env.SLACK_SALES_WEBHOOK_URL

if (!SLACK_WEBHOOK_URL) {
  console.error('❌ No Slack webhook URL found in environment variables')
  console.error('Set SLACK_WEBHOOK_URL or SLACK_SALES_WEBHOOK_URL')
  process.exit(1)
}

console.log('🔔 Testing Slack webhook...')
console.log('Webhook URL:', SLACK_WEBHOOK_URL.substring(0, 50) + '...')

const testPayload = {
  text: '🧪 Test: New Custom Audience Request',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🧪 TEST: New Custom Audience Request',
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: '*User:* John Doe (john@acme.com)' },
        { type: 'mrkdwn', text: '*Industry:* SaaS / Software' },
        { type: 'mrkdwn', text: '*Geography:* United States' },
        { type: 'mrkdwn', text: '*Volume:* 1,000 leads' },
        { type: 'mrkdwn', text: '*Company Size:* 51-200 employees' },
        { type: 'mrkdwn', text: '*Seniority:* C-Suite, VP, Director' },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Intent Signals:*\nActively researching CRM solutions, recently raised Series A funding, hiring sales team',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Additional Notes:*\nLooking for decision-makers at fast-growing tech companies in California. Must have verified emails and direct phone numbers.',
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '🕐 Submitted: ' + new Date().toLocaleString(),
        },
      ],
    },
  ],
}

fetch(SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload),
})
  .then((res) => {
    if (res.ok) {
      console.log('✅ Slack notification sent successfully!')
      console.log('Check your Slack channel for the test message.')
    } else {
      console.error('❌ Slack webhook failed:', res.status, res.statusText)
      return res.text().then(console.error)
    }
  })
  .catch((err) => {
    console.error('❌ Error sending Slack notification:', err.message)
  })
