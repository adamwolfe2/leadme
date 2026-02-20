import type { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Lead Marketplace | Cursive',
  description: 'Browse and purchase high-quality, verified business leads. Filter by industry, location, company size, and intent signals.',
  openGraph: {
    title: 'Lead Marketplace | Cursive',
    description: 'Browse and purchase high-quality, verified business leads.',
    url: 'https://leads.meetcursive.com/marketplace',
    siteName: 'Cursive',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lead Marketplace | Cursive',
    description: 'Browse and purchase high-quality, verified business leads.',
  },
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
