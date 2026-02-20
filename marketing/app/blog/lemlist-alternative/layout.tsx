import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Best lemlist Alternatives: Cold Email + LinkedIn Outreach Compared (2026)",
  description: "Compare the best lemlist alternatives for cold email and LinkedIn outreach. Find platforms that add visitor identification and real-time intent signals to your outbound workflow.",
  keywords: "lemlist alternative, lemlist alternatives, lemlist competitors, best alternative to lemlist, lemlist vs cursive, cold email software, linkedin outreach tools, email personalization platform, lemlist replacement, b2b email outreach",

  openGraph: {
    title: "Best lemlist Alternatives: Cold Email + LinkedIn Outreach Compared (2026) | Cursive",
    description: "Compare the best lemlist alternatives for cold email and LinkedIn outreach. Find platforms that add visitor identification and real-time intent signals to your outbound workflow.",
    type: "article",
    url: "https://www.meetcursive.com/blog/lemlist-alternative",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Best lemlist Alternatives: Cold Email + LinkedIn Outreach Compared (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Best lemlist Alternatives: Cold Email + LinkedIn Outreach Compared (2026) | Cursive",
    description: "Compare the best lemlist alternatives for cold email and LinkedIn outreach. Find platforms that add visitor identification and real-time intent signals to your outbound workflow.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/lemlist-alternative",
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
          { name: 'Best lemlist Alternatives: Cold Email + LinkedIn Outreach Compared (2026)', url: 'https://www.meetcursive.com/blog/lemlist-alternative' },
        ]),
        generateBlogPostSchema({
          title: 'Best lemlist Alternatives: Cold Email + LinkedIn Outreach Compared (2026)',
          description: 'Compare the best lemlist alternatives for cold email and LinkedIn outreach. Find platforms that add visitor identification and real-time intent signals to your outbound workflow.',
          url: 'https://www.meetcursive.com/blog/lemlist-alternative',
          datePublished: '2026-02-20',
          dateModified: '2026-02-20',
        }),
      ]} />
      {children}
    </>
  )
}
