import { Metadata } from 'next'
import { BlogClient } from './blog-client'

export const metadata: Metadata = {
  title: 'Visitor Identification & Lead Generation Blog | Cursive',
  description: 'Expert guides on visitor identification, intent data, B2B lead generation, and sales automation. Learn how to convert anonymous traffic into qualified leads.',
  keywords: 'visitor identification blog, lead generation guides, B2B marketing blog, intent data, sales automation',
  openGraph: {
    title: 'Visitor Identification & Lead Generation Blog | Cursive',
    description: 'Expert guides on visitor identification, intent data, B2B lead generation, and sales automation.',
    url: 'https://meetcursive.com/blog',
    siteName: 'Cursive',
    images: [{
      url: 'https://meetcursive.com/cursive-social-preview.png',
      width: 1200,
      height: 630,
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visitor Identification & Lead Generation Blog | Cursive',
    description: 'Expert guides on visitor identification, intent data, B2B lead generation, and sales automation.',
    images: ['https://meetcursive.com/cursive-social-preview.png'],
    creator: '@meetcursive',
  },
  alternates: {
    canonical: 'https://meetcursive.com/blog',
  },
}

export default function BlogPage() {
  return <BlogClient />
}
