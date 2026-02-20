import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Best Amplemarket Alternatives: 7 Sales Engagement Tools Compared (2026)",
  description: "Compare the top Amplemarket alternatives for B2B sales engagement and lead generation. Find tools with real-time website visitor identification, intent data, and better ROI than Amplemarket.",
  keywords: "amplemarket alternative, amplemarket alternatives, amplemarket competitors, best alternative to amplemarket, amplemarket vs cursive, amplemarket replacement, sales engagement platform, sdr automation tools",

  openGraph: {
    title: "Best Amplemarket Alternatives: 7 Sales Engagement Tools Compared (2026) | Cursive",
    description: "Compare the top Amplemarket alternatives for B2B sales engagement and lead generation. Find tools with real-time website visitor identification, intent data, and better ROI than Amplemarket.",
    type: "article",
    url: "https://www.meetcursive.com/blog/amplemarket-alternative",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Best Amplemarket Alternatives: 7 Sales Engagement Tools Compared (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Best Amplemarket Alternatives: 7 Sales Engagement Tools Compared (2026) | Cursive",
    description: "Compare the top Amplemarket alternatives for B2B sales engagement and lead generation. Find tools with real-time website visitor identification, intent data, and better ROI than Amplemarket.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/amplemarket-alternative",
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
          { name: 'Best Amplemarket Alternatives: 7 Sales Engagement Tools Compared (2026)', url: 'https://www.meetcursive.com/blog/amplemarket-alternative' },
        ]),
        generateBlogPostSchema({
          title: 'Best Amplemarket Alternatives: 7 Sales Engagement Tools Compared (2026)',
          description: 'Compare the top Amplemarket alternatives for B2B sales engagement and lead generation. Find tools with real-time website visitor identification, intent data, and better ROI than Amplemarket.',
          url: 'https://www.meetcursive.com/blog/amplemarket-alternative',
          datePublished: '2026-02-20',
          dateModified: '2026-02-20',
        }),
      ]} />
      {children}
    </>
  )
}
