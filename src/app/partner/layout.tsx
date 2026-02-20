import type { Metadata } from 'next'
import { PartnerLayoutShell } from './partner-layout-shell'

export const metadata: Metadata = {
  title: 'Partner Dashboard | Cursive',
  description: 'Manage your lead uploads, track earnings, and monitor payouts in the Cursive Partner Portal.',
  openGraph: {
    title: 'Partner Dashboard | Cursive',
    description: 'Manage your lead uploads, track earnings, and monitor payouts.',
    url: 'https://leads.meetcursive.com/partner',
    siteName: 'Cursive',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partner Dashboard | Cursive',
    description: 'Manage your lead uploads, track earnings, and monitor payouts.',
  },
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PartnerLayoutShell>{children}</PartnerLayoutShell>
}
