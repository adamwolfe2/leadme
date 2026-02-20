import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Best Salesloft Alternatives: Sales Engagement Platforms Compared (2026)",
  description: "Compare the best Salesloft alternatives for sales engagement, cadence management, and outbound automation. Find platforms with visitor identification and better value than Salesloft.",
  keywords: "salesloft alternative, salesloft alternatives, salesloft competitors, best alternative to salesloft, salesloft vs cursive, sales engagement platform, sales cadence tools, outbound sales platform, salesloft replacement",

  openGraph: {
    title: "Best Salesloft Alternatives: Sales Engagement Platforms Compared (2026) | Cursive",
    description: "Compare the best Salesloft alternatives for sales engagement, cadence management, and outbound automation. Find platforms with visitor identification and better value than Salesloft.",
    type: "article",
    url: "https://www.meetcursive.com/blog/salesloft-alternative",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Best Salesloft Alternatives: Sales Engagement Platforms Compared (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Best Salesloft Alternatives: Sales Engagement Platforms Compared (2026) | Cursive",
    description: "Compare the best Salesloft alternatives for sales engagement, cadence management, and outbound automation. Find platforms with visitor identification and better value than Salesloft.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/salesloft-alternative",
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
          { name: 'Best Salesloft Alternatives: Sales Engagement Platforms Compared (2026)', url: 'https://www.meetcursive.com/blog/salesloft-alternative' },
        ]),
        generateBlogPostSchema({
          title: 'Best Salesloft Alternatives: Sales Engagement Platforms Compared (2026)',
          description: 'Compare the best Salesloft alternatives for sales engagement, cadence management, and outbound automation. Find platforms with visitor identification and better value than Salesloft.',
          url: 'https://www.meetcursive.com/blog/salesloft-alternative',
          datePublished: '2026-02-20',
          dateModified: '2026-02-20',
        }),
      ]} />
      {children}
    </>
  )
}
