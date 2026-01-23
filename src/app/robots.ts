// Robots.txt Generation
// Controls search engine crawler access

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://openinfo.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/login',
          '/signup',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/data/',
          '/queries/',
          '/people-search/',
          '/trends/',
          '/settings/',
          '/integrations/',
          '/onboarding/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/pricing',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/data/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
