import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Agency Lead Generation & Visitor Identification',
  description: 'White-label lead generation for marketing and sales agencies. Identify client website visitors, build targeted prospect lists, and deliver measurable pipeline results with AI-powered outreach.',
  keywords: ['agency lead generation', 'white label visitor identification', 'agency prospecting platform', 'marketing agency lead gen', 'sales agency data solutions', 'multi-client lead management'],
  canonical: 'https://meetcursive.com/industries/agencies',
})

export default function AgenciesLayout({ children }: { children: React.ReactNode }) {
  return children
}
