import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Media & Advertising Marketing Solutions',
  description: 'Audience data for publishers, media companies, and ad agencies. Build premium audiences, maximize ad inventory value, and prove attribution with verified data.',
  keywords: ['media marketing', 'publisher data', 'advertising audience data', 'programmatic advertising', 'ad inventory optimization'],
  canonical: 'https://meetcursive.com/industries/media-advertising',
})

export default function MediaAdvertisingLayout({ children }: { children: React.ReactNode }) {
  return children
}
