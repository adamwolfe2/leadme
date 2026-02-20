import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Best Outreach.io Alternatives: Sales Engagement Tools Compared (2026)",
  description: "Compare the best Outreach.io alternatives for sales engagement and pipeline management. Find platforms that combine outreach automation with visitor identification at a fraction of the cost.",
  keywords: "outreach alternative, outreach io alternatives, outreach competitors, best alternative to outreach, outreach vs cursive, sales engagement platform, outreach io replacement, b2b outreach tools, pipeline management tools",

  openGraph: {
    title: "Best Outreach.io Alternatives: Sales Engagement Tools Compared (2026) | Cursive",
    description: "Compare the best Outreach.io alternatives for sales engagement and pipeline management. Find platforms that combine outreach automation with visitor identification at a fraction of the cost.",
    type: "article",
    url: "https://www.meetcursive.com/blog/outreach-alternative",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Best Outreach.io Alternatives: Sales Engagement Tools Compared (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Best Outreach.io Alternatives: Sales Engagement Tools Compared (2026) | Cursive",
    description: "Compare the best Outreach.io alternatives for sales engagement and pipeline management. Find platforms that combine outreach automation with visitor identification at a fraction of the cost.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/outreach-alternative",
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
          { name: 'Best Outreach.io Alternatives: Sales Engagement Tools Compared (2026)', url: 'https://www.meetcursive.com/blog/outreach-alternative' },
        ]),
        generateBlogPostSchema({
          title: 'Best Outreach.io Alternatives: Sales Engagement Tools Compared (2026)',
          description: 'Compare the best Outreach.io alternatives for sales engagement and pipeline management. Find platforms that combine outreach automation with visitor identification at a fraction of the cost.',
          url: 'https://www.meetcursive.com/blog/outreach-alternative',
          datePublished: '2026-02-20',
          dateModified: '2026-02-20',
        }),
      ]} />
      {children}
    </>
  )
}
