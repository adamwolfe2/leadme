import { Metadata } from 'next'
import { BlogClient } from './blog-client'

export const metadata: Metadata = {
  title: 'Visitor Identification & Lead Generation Blog | Cursive',
  description: 'Expert guides on visitor identification, intent data, B2B lead generation, and sales automation. Learn how to convert anonymous traffic into qualified leads.',
  keywords: 'visitor identification blog, lead generation guides, B2B marketing blog, intent data, sales automation',
  openGraph: {
    title: 'Visitor Identification & Lead Generation Blog | Cursive',
    description: 'Expert guides on visitor identification, intent data, B2B lead generation, and sales automation.',
    url: 'https://www.meetcursive.com/blog',
    type: 'website',
  },
}

export default function BlogPage() {
  return <BlogClient />
}
