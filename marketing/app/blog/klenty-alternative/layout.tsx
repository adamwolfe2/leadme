import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Best Klenty Alternatives: Intent-Based Outreach vs Cold Sequences (2026)",
  description: "Comparing Klenty alternatives for sales engagement. See why teams are switching from Klenty's cold-list sequences to Cursive's warm visitor identification and AI outreach.",
  keywords: "klenty alternative, klenty alternatives, klenty competitors, sales engagement alternative, cold email alternative, sales automation alternative, outbound sales alternative",

  openGraph: {
    title: "Best Klenty Alternatives: Intent-Based Outreach vs Cold Sequences (2026) | Cursive",
    description: "Comparing Klenty alternatives for sales engagement. See why teams are switching from Klenty's cold-list sequences to Cursive's warm visitor identification and AI outreach.",
    type: "article",
    url: "https://www.meetcursive.com/blog/klenty-alternative",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Best Klenty Alternatives: Intent-Based Outreach vs Cold Sequences (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Best Klenty Alternatives: Intent-Based Outreach vs Cold Sequences (2026) | Cursive",
    description: "Comparing Klenty alternatives for sales engagement. See why teams are switching from Klenty's cold-list sequences to Cursive's warm visitor identification and AI outreach.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/klenty-alternative",
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
          { name: 'Best Klenty Alternatives: Intent-Based Outreach vs Cold Sequences (2026)', url: 'https://www.meetcursive.com/blog/klenty-alternative' },
        ]),
        generateBlogPostSchema({
          title: 'Best Klenty Alternatives: Intent-Based Outreach vs Cold Sequences (2026)',
          description: 'Comparing Klenty alternatives for sales engagement. See why teams are switching from Klenty\'s cold-list sequences to Cursive\'s warm visitor identification and AI outreach.',
          url: 'https://www.meetcursive.com/blog/klenty-alternative',
          datePublished: '2026-02-19',
          dateModified: '2026-02-19',
        }),
      ]} />
      {children}
    </>
  )
}
