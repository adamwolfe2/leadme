import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Home Services Marketing Solutions',
  description: 'Lead generation for contractors, HVAC, plumbing, landscaping, and home improvement companies. Reach homeowners with verified intent data and automated outreach.',
  keywords: ['home services marketing', 'contractor leads', 'HVAC leads', 'plumbing leads', 'homeowner targeting'],
  canonical: 'https://meetcursive.com/industries/home-services',
})

export default function HomeServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
