import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'Automated Direct Mail Marketing | From $1.50 per Piece | 48hr Delivery',
  description: 'Turn website visitors into mailbox conversions. Automated direct mail triggered by digital behavior. 3-5x higher response rates than digital-only. Starting at $1.50 per postcard, no minimums.',
  keywords: ['direct mail marketing', 'automated direct mail', 'direct mail retargeting', 'postcard marketing', 'direct mail automation', 'triggered direct mail', 'website to mailbox'],
  canonical: 'https://meetcursive.com/direct-mail',
})

export default function DirectMailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
