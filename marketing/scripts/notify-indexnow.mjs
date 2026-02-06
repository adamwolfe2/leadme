#!/usr/bin/env node

/**
 * IndexNow Notification Script
 *
 * This script notifies search engines about all pages via IndexNow protocol.
 * It should be run after deployment to accelerate indexing.
 *
 * Usage:
 *   node scripts/notify-indexnow.js
 *   npm run postbuild (automatically runs after build)
 */

import https from 'https'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '7c33bde0a15b132aa38f5bea1dd15077'
const BASE_URL = 'https://www.meetcursive.com'
const INDEXNOW_API = 'api.indexnow.org'

/**
 * Get all URLs from sitemap
 */
function getAllUrls() {
  const baseUrl = 'https://www.meetcursive.com'

  // Core pages
  const corePages = [
    '',
    '/platform',
    '/pricing',
  ]

  // Solution pages
  const solutionPages = [
    '/visitor-identification',
    '/audience-builder',
    '/direct-mail',
    '/clean-room',
    '/data-access',
    '/integrations',
    '/intent-audiences',
  ]

  // Industry pages
  const industryPages = [
    '/industries/financial-services',
    '/industries/ecommerce',
    '/industries/media-advertising',
    '/industries/b2b-software',
    '/industries/agencies',
    '/industries/franchises',
    '/industries/home-services',
    '/industries/retail',
    '/industries/education',
  ]

  // Secondary pages
  const secondaryPages = [
    '/services',
    '/about',
    '/contact',
    '/demos',
    '/faq',
  ]

  // Resources and blog hub
  const resourcePages = [
    '/resources',
    '/blog',
    '/case-studies',
  ]

  // Blog category pages
  const blogCategoryPages = [
    '/blog/visitor-tracking',
    '/blog/lead-generation',
    '/blog/data-platforms',
    '/blog/audience-targeting',
    '/blog/direct-mail',
    '/blog/analytics',
    '/blog/retargeting',
    '/blog/crm-integration',
    '/blog/scaling-outbound',
    '/blog/ai-sdr-vs-human-bdr',
    '/blog/cold-email-2026',
    '/blog/icp-targeting-guide',
  ]

  // Recent blog posts
  const recentBlogPosts = [
    '/blog/scaling-outbound',
    '/blog/ai-sdr-vs-human-bdr',
    '/blog/cold-email-2026',
    '/blog/icp-targeting-guide',
  ]

  // Older blog posts
  const olderBlogPosts = [
    '/blog/tips-for-using-marketing-audience-data-efficiently',
    '/blog/steps-to-build-an-effective-audience-building-platform',
    '/blog/why-consumer-targeting-data-is-essential-for-brands',
    '/blog/what-to-consider-when-selecting-a-business-data-platform',
    '/blog/understanding-data-driven-retargeting-practices',
    '/blog/guide-to-choosing-a-b2c-data-platform-for-retailers',
    '/blog/how-marketing-data-solutions-can-improve-campaigns',
    '/blog/steps-to-use-a-customer-data-platform-successfully',
    '/blog/how-to-leverage-business-contact-data-for-better-outreach',
    '/blog/guide-to-direct-mail-marketing-automation-for-agencies',
    '/blog/why-audience-segmentation-platforms-are-key-to-marketing',
    '/blog/discover-the-benefits-of-a-consumer-data-platform',
    '/blog/tips-for-finding-data-targeting-solutions-that-work',
    '/blog/how-to-improve-b2b-contact-data-efficiency',
    '/blog/understanding-business-intelligence-data-for-marketing-success',
    '/blog/guide-to-building-an-effective-audience-targeting-platform',
    '/blog/cross-platform-retargeting-strategies-to-explore',
    '/blog/understanding-data-driven-decision-making-in-marketing',
    '/blog/enhancing-data-connectivity-with-crm-integration',
    '/blog/guide-to-completing-contact-records-easily',
    '/blog/real-time-analytics-strategies-for-better-roi-decisions',
    '/blog/using-website-visitor-tracking-for-lead-generation',
    '/blog/steps-to-improve-your-marketing-database-quality',
    '/blog/understanding-marketing-data-privacy-compliance',
    '/blog/boosting-sales-through-anonymous-visitor-conversion',
    '/blog/leveraging-real-time-data-for-efficient-campaigns',
    '/blog/steps-to-safeguard-consumer-data-privacy',
    '/blog/why-scalable-workflows-benefit-agencies',
    '/blog/understanding-the-impact-of-buyer-intent-on-campaigns',
    '/blog/tips-for-improving-crm-integration-workflows',
    '/blog/why-data-quality-matters-in-marketing',
    '/blog/creating-behavioral-audience-segments-easily',
    '/blog/why-crm-integration-is-crucial-for-smooth-operations',
    '/blog/multifactor-audience-segmentation-for-campaign-success',
    '/blog/how-omni-channel-orchestration-aligns-marketing-efforts',
    '/blog/guide-to-setting-up-a-consumer-data-platform',
    '/blog/retargeting-tactics-to-boost-offline-conversions',
    '/blog/buyer-intent-based-audience-segmentation-techniques',
    '/blog/discovering-multi-touchpoint-attribution-benefits',
    '/blog/intent-signal-tracking-for-b2b-marketing',
    '/blog/intent-based-marketing-tactics-for-b2b',
    '/blog/how-marketing-contact-data-can-warm-up-cold-leads',
    '/blog/business-database-platforms-for-b2b-growth',
    '/blog/b2b-data-enrichment-for-better-marketing-outcomes',
    '/blog/direct-mail-audience-data-for-smarter-winter-outreach',
    '/blog/unlocking-business-data-enrichment-for-growth',
    '/blog/cdp-for-small-marketing-teams',
    '/blog/b2b-audience-targeting-explained-for-everyday-brands',
    '/blog/holiday-marketing-data-platform-guide',
    '/blog/what-b2c-database-providers-do-for-busy-retailers',
    '/blog/how-business-contact-data-helps-grow-winter-connections',
    '/blog/audience-targeting-software-anyone-can-understand',
  ]

  // Legal pages
  const legalPages = [
    '/privacy',
    '/terms',
  ]

  // Combine all pages
  const allPages = [
    ...corePages,
    ...solutionPages,
    ...industryPages,
    ...secondaryPages,
    ...resourcePages,
    ...blogCategoryPages,
    ...recentBlogPosts,
    ...olderBlogPosts,
    ...legalPages,
  ]

  return allPages.map(url => `${baseUrl}${url}`)
}

/**
 * Submit URLs to IndexNow
 */
function submitToIndexNow(urls) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      host: 'www.meetcursive.com',
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    })

    const options = {
      hostname: INDEXNOW_API,
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('[IndexNow] Successfully notified search engines')
          resolve({ success: true, statusCode: res.statusCode })
        } else if (res.statusCode === 202) {
          console.log('[IndexNow] URLs received and will be processed')
          resolve({ success: true, statusCode: res.statusCode })
        } else if (res.statusCode === 400) {
          console.error('[IndexNow] Bad request - check URL format and key')
          resolve({ success: false, statusCode: res.statusCode, error: data })
        } else if (res.statusCode === 403) {
          console.error('[IndexNow] Forbidden - key validation failed')
          resolve({ success: false, statusCode: res.statusCode, error: data })
        } else if (res.statusCode === 422) {
          console.error('[IndexNow] Unprocessable - URLs may already be submitted')
          resolve({ success: false, statusCode: res.statusCode, error: data })
        } else if (res.statusCode === 429) {
          console.error('[IndexNow] Too many requests - rate limited')
          resolve({ success: false, statusCode: res.statusCode, error: data })
        } else {
          console.error(`[IndexNow] Error: HTTP ${res.statusCode}`)
          if (data) {
            console.error(`[IndexNow] Response: ${data}`)
          }
          resolve({ success: false, statusCode: res.statusCode, error: data })
        }
      })
    })

    req.on('error', (error) => {
      console.error(`[IndexNow] Network error: ${error.message}`)
      // Don't reject - we want builds to succeed even if IndexNow fails
      resolve({ success: false, error: error.message })
    })

    req.write(payload)
    req.end()
  })
}

/**
 * Main execution
 */
async function main() {
  console.log('\n========================================')
  console.log('IndexNow Notification Script')
  console.log('========================================\n')

  const urls = getAllUrls()
  console.log(`Found ${urls.length} URLs to notify`)

  // Submit in batches of 100
  const BATCH_SIZE = 100
  const batches = []

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches.push(urls.slice(i, i + BATCH_SIZE))
  }

  console.log(`Submitting ${batches.length} batch(es)\n`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`Batch ${i + 1}/${batches.length}: ${batch.length} URLs`)

    const result = await submitToIndexNow(batch)

    if (!result.success) {
      console.warn('[IndexNow] Batch submission had issues, but continuing...')
    }

    // Add delay between batches
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('\n========================================')
  console.log('IndexNow notification complete')
  console.log('========================================\n')

  // Always exit successfully (don't break builds)
  process.exit(0)
}

// Run the script
main().catch((error) => {
  console.error('[IndexNow] Unexpected error:', error)
  // Exit successfully anyway to not break builds
  process.exit(0)
})
