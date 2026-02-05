import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Audience Builder | Build Unlimited B2B & B2C Audiences | No Caps',
  description: 'Build unlimited audiences with 220M+ consumer and 140M+ business profiles. Filter by demographics, firmographics, and 450B+ monthly intent signals. No size limits, no export caps.',
  keywords: ['audience builder', 'B2B audience builder', 'B2C audience targeting', 'intent-based targeting', 'audience segmentation', 'lookalike audiences', 'custom audience builder'],
  canonical: 'https://meetcursive.com/audience-builder',
})

export default function AudienceBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
