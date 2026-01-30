import { WaitlistPageClient } from '@/components/marketing/waitlist-page-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Waitlist | Cursive',
  description:
    'AI Intent Systems That Never Sleep. Cursive identifies real people actively searching for your service, enriches them with verified contact data, and activates them through automated outbound.',
  keywords: [
    'lead generation',
    'AI intent',
    'buyer intent',
    'automated outbound',
    'lead enrichment',
    'sales automation',
  ],
  openGraph: {
    type: 'website',
    url: 'https://leads.meetcursive.com',
    title: 'Cursive - AI Intent Systems That Never Sleep',
    description:
      'Cursive identifies real people actively searching for your service, enriches them with verified contact data, and activates them through automated outbound.',
    siteName: 'Cursive',
    images: [
      {
        url: '/cursive-logo.png',
        width: 1200,
        height: 630,
        alt: 'Cursive - AI Intent Systems',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cursive - AI Intent Systems That Never Sleep',
    description:
      'Cursive identifies real people actively searching for your service, enriches them with verified contact data, and activates them through automated outbound.',
    images: ['/cursive-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function WaitlistPage() {
  return <WaitlistPageClient />
}
