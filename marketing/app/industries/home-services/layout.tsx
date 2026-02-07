import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Home Services Lead Generation & Visitor Identification',
  description: 'Identify homeowners browsing your service pages. Generate qualified leads for HVAC, plumbing, roofing, landscaping, and home improvement companies with AI-powered outreach and verified contact data.',
  keywords: ['home services lead generation', 'contractor visitor identification', 'HVAC leads', 'plumbing lead gen', 'roofing leads', 'homeowner identification', 'home improvement website tracking'],
  canonical: 'https://meetcursive.com/industries/home-services',
})

export default function HomeServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
