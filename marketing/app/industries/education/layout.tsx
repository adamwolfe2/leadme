import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Education Lead Generation & Visitor Identification',
  description: 'Identify prospective students browsing your program pages. Turn anonymous website visitors into enrolled students with AI-powered outreach for colleges, universities, and online education providers.',
  keywords: ['education lead generation', 'student recruitment leads', 'enrollment marketing', 'higher education visitor identification', 'college website visitor tracking', 'online education lead gen', 'university prospecting'],
  canonical: 'https://meetcursive.com/industries/education',
})

export default function EducationLayout({ children }: { children: React.ReactNode }) {
  return children
}
