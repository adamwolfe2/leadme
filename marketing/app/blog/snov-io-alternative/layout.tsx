import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Best Snov.io Alternatives: Email Finder Tools vs 95%+ Deliverability AI Outreach (2026)",
  description: "Compare the top Snov.io alternatives for email finding and outreach automation. See why B2B teams are switching from Snov.io's credit-based pricing to Cursive's warm-lead AI platform.",
  keywords: "snov.io alternative, snov io alternative, snov.io alternatives, snov.io competitors, email finder alternative, email outreach alternative, cold email tool alternative",

  openGraph: {
    title: "Best Snov.io Alternatives: Email Finder Tools vs 95%+ Deliverability AI Outreach (2026) | Cursive",
    description: "Compare the top Snov.io alternatives for email finding and outreach automation. See why B2B teams are switching from Snov.io's credit-based pricing to Cursive's warm-lead AI platform.",
    type: "article",
    url: "https://www.meetcursive.com/blog/snov-io-alternative",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Best Snov.io Alternatives: Email Finder Tools vs AI Outreach (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Best Snov.io Alternatives: Email Finder Tools vs 95%+ Deliverability AI Outreach (2026) | Cursive",
    description: "Compare the top Snov.io alternatives for email finding and outreach automation. See why B2B teams are switching from Snov.io's credit-based pricing to Cursive's warm-lead AI platform.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/snov-io-alternative",
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
          { name: 'Best Snov.io Alternatives: Email Finder Tools vs AI Outreach (2026)', url: 'https://www.meetcursive.com/blog/snov-io-alternative' },
        ]),
        generateBlogPostSchema({
          title: 'Best Snov.io Alternatives: Email Finder Tools vs 95%+ Deliverability AI Outreach (2026)',
          description: 'Compare the top Snov.io alternatives for email finding and outreach automation. See why B2B teams are switching from Snov.io\'s credit-based pricing to Cursive\'s warm-lead AI platform.',
          url: 'https://www.meetcursive.com/blog/snov-io-alternative',
          datePublished: '2026-02-19',
          dateModified: '2026-02-19',
        }),
      ]} />
      {children}
    </>
  )
}
