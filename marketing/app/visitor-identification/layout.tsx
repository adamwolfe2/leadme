import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Visitor Identification Software | Identify 70% of Anonymous Traffic',
  description: 'Stop losing 98% of your website visitors. Cursive identifies up to 70% of anonymous traffic with company + individual data. Real-time enrichment, 200+ integrations, GDPR compliant.',
  keywords: ['visitor identification', 'website visitor tracking', 'anonymous visitor identification', 'identify website visitors', 'B2B visitor identification', 'visitor tracking software', 'website analytics'],
  canonical: 'https://meetcursive.com/visitor-identification',
})

export default function VisitorIdentificationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
