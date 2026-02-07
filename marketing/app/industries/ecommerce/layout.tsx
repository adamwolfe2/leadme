import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({
  title: 'eCommerce & DTC Lead Generation & Visitor Identification',
  description: 'Identify anonymous online shoppers browsing your products. Turn cart abandoners and window shoppers into customers with AI-powered retargeting and personalized outreach across email, SMS, and direct mail.',
  keywords: ['ecommerce lead generation', 'DTC visitor identification', 'online store visitor tracking', 'cart abandonment recovery', 'ecommerce retargeting', 'shopper identification', 'ecommerce customer acquisition'],
  canonical: 'https://meetcursive.com/industries/ecommerce',
})

export default function EcommerceLayout({ children }: { children: React.ReactNode }) {
  return children
}
