import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Website Visitor Identification Guide: How to Identify Anonymous Visitors (2026)",
  description: "Complete guide to website visitor identification: how it works, ID rates compared (Cursive 70% vs Warmly 40% vs RB2B), implementation steps, use cases, legal considerations, and how to turn visitors into pipeline.",
  keywords: "website visitor identification, how to identify website visitors, visitor deanonymization, anonymous visitor tracking, website visitor intelligence, identify anonymous website visitors, b2b visitor identification",

  openGraph: {
    title: "Website Visitor Identification Guide: How to Identify Anonymous Visitors (2026) | Cursive",
    description: "Complete guide to website visitor identification: how it works, ID rates compared (Cursive 70% vs Warmly 40% vs RB2B), implementation steps, use cases, legal considerations, and how to turn visitors into pipeline.",
    type: "article",
    url: "https://www.meetcursive.com/blog/website-visitor-identification-guide",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Website Visitor Identification Guide: How to Identify Anonymous Visitors (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Website Visitor Identification Guide: How to Identify Anonymous Visitors (2026) | Cursive",
    description: "Complete guide to website visitor identification: how it works, ID rates compared (Cursive 70% vs Warmly 40% vs RB2B), implementation steps, use cases, legal considerations, and how to turn visitors into pipeline.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/website-visitor-identification-guide",
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
          { name: 'Website Visitor Identification Guide: How to Identify Anonymous Visitors (2026)', url: 'https://www.meetcursive.com/blog/website-visitor-identification-guide' },
        ]),
        generateBlogPostSchema({
          title: 'Website Visitor Identification Guide: How to Identify Anonymous Visitors (2026)',
          description: 'Complete guide to website visitor identification: how it works, ID rates compared (Cursive 70% vs Warmly 40% vs RB2B), implementation steps, use cases, legal considerations, and how to turn visitors into pipeline.',
          url: 'https://www.meetcursive.com/blog/website-visitor-identification-guide',
          datePublished: '2026-02-20',
          dateModified: '2026-02-20',
        }),
      ]} />
      {children}
    </>
  )
}
