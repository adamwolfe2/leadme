import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meetcursive.com'
  const currentDate = new Date()

  // Core pages - highest priority, frequent updates
  const corePages = [
    { url: '', priority: 1.0, changefreq: 'daily' as const },
    { url: '/platform', priority: 0.9, changefreq: 'weekly' as const },
    { url: '/pricing', priority: 0.9, changefreq: 'weekly' as const },
  ]

  // Solution pages - high priority
  const solutionPages = [
    '/visitor-identification',
    '/audience-builder',
    '/direct-mail',
    '/clean-room',
    '/data-access',
    '/integrations',
    '/intent-audiences',
  ].map(url => ({
    url,
    priority: 0.8,
    changefreq: 'weekly' as const,
  }))

  // Industry pages - medium-high priority
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
  ].map(url => ({
    url,
    priority: 0.7,
    changefreq: 'monthly' as const,
  }))

  // Secondary pages - medium priority
  const secondaryPages = [
    '/services',
    '/about',
    '/contact',
    '/demos',
    '/faq',
  ].map(url => ({
    url,
    priority: 0.6,
    changefreq: 'monthly' as const,
  }))

  // Resources and blog hub - medium priority
  const resourcePages = [
    { url: '/resources', priority: 0.7, changefreq: 'weekly' as const },
    { url: '/blog', priority: 0.7, changefreq: 'daily' as const },
    { url: '/case-studies', priority: 0.7, changefreq: 'monthly' as const },
  ]

  // Blog category pages - medium priority
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
  ].map(url => ({
    url,
    priority: 0.6,
    changefreq: 'weekly' as const,
  }))

  // Blog posts - organized by recency
  // Recent posts (published in last 3 months) - higher priority
  const recentBlogPosts = [
    '/blog/scaling-outbound',
    '/blog/ai-sdr-vs-human-bdr',
    '/blog/cold-email-2026',
    '/blog/icp-targeting-guide',
  ].map(url => ({
    url,
    priority: 0.7,
    changefreq: 'monthly' as const,
  }))

  // Older blog posts - standard priority
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
  ].map(url => ({
    url,
    priority: 0.6,
    changefreq: 'monthly' as const,
  }))

  // Legal pages - low priority, rarely change
  const legalPages = [
    { url: '/privacy', priority: 0.3, changefreq: 'yearly' as const },
    { url: '/terms', priority: 0.3, changefreq: 'yearly' as const },
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

  return allPages.map(({ url, priority, changefreq }) => ({
    url: `${baseUrl}${url}`,
    lastModified: currentDate,
    changeFrequency: changefreq,
    priority,
  }))
}

/**
 * Sitemap Configuration Notes:
 *
 * Excluded paths (automatically excluded by Next.js or via robots.txt):
 * - /api/* - API routes
 * - /popup-test - Internal testing page
 *
 * Priority Guidelines:
 * - 1.0: Homepage (most important)
 * - 0.9: Core product pages (platform, pricing)
 * - 0.8: Solution pages
 * - 0.7: Industry pages, resource hubs, recent blog posts
 * - 0.6: Secondary pages, blog categories, standard blog posts
 * - 0.3: Legal pages
 *
 * Change Frequency Guidelines:
 * - daily: Homepage (with dynamic content)
 * - weekly: Product pages, solution pages, resource hubs
 * - monthly: Industry pages, blog posts, secondary pages
 * - yearly: Legal pages
 *
 * Dynamic Routes:
 * For dynamic blog routes like /blog/[category]/[slug], implement generateStaticParams()
 * in the page component to include them in the sitemap at build time.
 */
