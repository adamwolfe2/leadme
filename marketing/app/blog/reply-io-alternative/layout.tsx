import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Best Reply.io Alternatives: Why Teams Are Switching to Intent-Based Outreach (2026)",
  description: "Comparing Reply.io alternatives for AI SDR and sales engagement. See why teams are moving from cold-list sequences to warm visitor outreach with Cursive.",
  keywords: "reply.io alternative, reply.io alternatives, reply.io competitors, sales engagement alternative, jason ai alternative, cold email alternative, ai sdr alternative",

  openGraph: {
    title: "Best Reply.io Alternatives: Why Teams Are Switching to Intent-Based Outreach (2026) | Cursive",
    description: "Comparing Reply.io alternatives for AI SDR and sales engagement. See why teams are moving from cold-list sequences to warm visitor outreach with Cursive.",
    type: "article",
    url: "https://www.meetcursive.com/blog/reply-io-alternative",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Best Reply.io Alternatives: Intent-Based Outreach (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Best Reply.io Alternatives: Why Teams Are Switching to Intent-Based Outreach (2026) | Cursive",
    description: "Comparing Reply.io alternatives for AI SDR and sales engagement. See why teams are moving from cold-list sequences to warm visitor outreach with Cursive.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/reply-io-alternative",
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
          { name: 'Best Reply.io Alternatives: Intent-Based Outreach (2026)', url: 'https://www.meetcursive.com/blog/reply-io-alternative' },
        ]),
        generateBlogPostSchema({
          title: 'Best Reply.io Alternatives: Why Teams Are Switching to Intent-Based Outreach (2026)',
          description: 'Comparing Reply.io alternatives for AI SDR and sales engagement. See why teams are moving from cold-list sequences to warm visitor outreach with Cursive.',
          url: 'https://www.meetcursive.com/blog/reply-io-alternative',
          datePublished: '2026-02-19',
          dateModified: '2026-02-19',
        }),
      ]} />
      {children}
    </>
  )
}
