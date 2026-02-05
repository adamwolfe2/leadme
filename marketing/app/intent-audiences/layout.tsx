import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Intent Audiences | Pre-Built Segments Across 8 Verticals | 450B+ Signals',
  description: 'Reach buyers when they are ready to purchase. Pre-built intent audiences across MedSpa, Home Services, Legal, GLP-1, and more. 280M+ profiles, updated every 7 days with fresh in-market prospects.',
  keywords: ['intent data', 'buyer intent', 'intent audiences', 'purchase intent data', 'syndicated audiences', 'B2B intent data', 'B2C intent signals', 'behavioral targeting'],
  canonical: 'https://meetcursive.com/intent-audiences',
})

export default function IntentAudiencesLayout({ children }: { children: React.ReactNode }) {
  return children
}
