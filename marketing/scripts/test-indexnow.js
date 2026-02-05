#!/usr/bin/env node

/**
 * IndexNow Test Script
 *
 * This script tests the IndexNow implementation without actually submitting to the API.
 * It verifies URL extraction, validation, and batch processing.
 *
 * Usage:
 *   node scripts/test-indexnow.js
 */

function getAllUrls() {
  const baseUrl = 'https://www.meetcursive.com'

  const corePages = ['', '/platform', '/pricing']

  const solutionPages = [
    '/visitor-identification',
    '/audience-builder',
    '/direct-mail',
    '/clean-room',
    '/data-access',
    '/integrations',
    '/intent-audiences',
  ]

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

  const secondaryPages = ['/services', '/about', '/contact', '/demos', '/faq']

  const resourcePages = ['/resources', '/blog', '/case-studies']

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

  const recentBlogPosts = [
    '/blog/scaling-outbound',
    '/blog/ai-sdr-vs-human-bdr',
    '/blog/cold-email-2026',
    '/blog/icp-targeting-guide',
  ]

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

  const legalPages = ['/privacy', '/terms']

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

function main() {
  console.log('\n========================================')
  console.log('IndexNow Implementation Test')
  console.log('========================================\n')

  // Test URL extraction
  const urls = getAllUrls()
  console.log(`Total URLs extracted: ${urls.length}`)

  // Check for duplicates
  const uniqueUrls = new Set(urls)
  console.log(`Unique URLs: ${uniqueUrls.size}`)
  console.log(`Duplicates: ${urls.length - uniqueUrls.size}`)

  // Test URL validation
  const validUrls = urls.filter(url => {
    try {
      new URL(url)
      return url.startsWith('https://www.meetcursive.com')
    } catch {
      return false
    }
  })
  console.log(`Valid URLs: ${validUrls.length}`)
  console.log(`Invalid URLs: ${urls.length - validUrls.length}`)

  // Test batch processing
  const BATCH_SIZE = 100
  const batches = []
  const urlsToSubmit = Array.from(uniqueUrls)

  for (let i = 0; i < urlsToSubmit.length; i += BATCH_SIZE) {
    batches.push(urlsToSubmit.slice(i, i + BATCH_SIZE))
  }

  console.log(`\nBatch configuration:`)
  console.log(`  Batch size: ${BATCH_SIZE}`)
  console.log(`  Number of batches: ${batches.length}`)

  batches.forEach((batch, i) => {
    console.log(`  Batch ${i + 1}: ${batch.length} URLs`)
  })

  // Test key file
  const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '7c33bde0a15b132aa38f5bea1dd15077'
  console.log(`\nIndexNow configuration:`)
  console.log(`  Key: ${INDEXNOW_KEY}`)
  console.log(`  Key file: https://www.meetcursive.com/${INDEXNOW_KEY}.txt`)

  // Sample URLs
  console.log(`\nSample URLs to be submitted:`)
  const sampleUrls = [
    urls[0], // Homepage
    urls.find(u => u.includes('/platform')),
    urls.find(u => u.includes('/blog/scaling-outbound')),
    urls[urls.length - 1], // Last URL
  ].filter(Boolean)

  sampleUrls.forEach(url => console.log(`  - ${url}`))

  console.log('\n========================================')
  console.log('Test complete - No API calls made')
  console.log('========================================\n')

  console.log('To run actual submission:')
  console.log('  npm run postbuild')
  console.log('  node scripts/notify-indexnow.js\n')
}

main()
