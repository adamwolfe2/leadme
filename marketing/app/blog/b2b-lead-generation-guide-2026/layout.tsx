import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "B2B Lead Generation Guide 2026: Strategies, Tools, and Playbook",
  description: "The complete B2B lead generation playbook for 2026. Covers inbound vs outbound, website visitor identification, intent data, cold email, LinkedIn, AI automation, metrics, and recommended tools.",
  keywords: "b2b lead generation, b2b lead generation strategies 2026, b2b lead gen guide, b2b lead generation playbook, how to generate b2b leads, b2b lead generation tools, outbound lead generation",

  openGraph: {
    title: "B2B Lead Generation Guide 2026: Strategies, Tools, and Playbook | Cursive",
    description: "The complete B2B lead generation playbook for 2026. Covers inbound vs outbound, website visitor identification, intent data, cold email, LinkedIn, AI automation, metrics, and recommended tools.",
    type: "article",
    url: "https://www.meetcursive.com/blog/b2b-lead-generation-guide-2026",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "B2B Lead Generation Guide 2026: Strategies, Tools, and Playbook",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "B2B Lead Generation Guide 2026: Strategies, Tools, and Playbook | Cursive",
    description: "The complete B2B lead generation playbook for 2026. Covers inbound vs outbound, website visitor identification, intent data, cold email, LinkedIn, AI automation, metrics, and recommended tools.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/b2b-lead-generation-guide-2026",
  },

  robots: {
    index: true,
    follow: true,
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={[
        generateBreadcrumbSchema([
          { name: 'Home', url: 'https://www.meetcursive.com' },
          { name: 'Blog', url: 'https://www.meetcursive.com/blog' },
          { name: 'B2B Lead Generation Guide 2026: Strategies, Tools, and Playbook', url: 'https://www.meetcursive.com/blog/b2b-lead-generation-guide-2026' },
        ]),
        generateBlogPostSchema({
          title: 'B2B Lead Generation Guide 2026: Strategies, Tools, and Playbook',
          description: 'The complete B2B lead generation playbook for 2026. Covers inbound vs outbound, website visitor identification, intent data, cold email, LinkedIn, AI automation, metrics, and recommended tools.',
          url: 'https://www.meetcursive.com/blog/b2b-lead-generation-guide-2026',
          datePublished: '2026-02-20',
          dateModified: '2026-02-20',
        }),
      ]} />
      {children}
    </>
  )
}
