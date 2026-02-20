import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "Best Qualified Alternatives: 6 Visitor Intelligence Tools Compared (2026)",
  description: "Compare the top Qualified.com alternatives for B2B website visitor intelligence and pipeline generation. Find tools that identify ALL visitors — not just the ones who choose to chat.",
  keywords: "qualified alternative, qualified.com alternative, qualified alternatives, qualified competitors, best alternative to qualified, qualified vs cursive, website visitor routing, conversational marketing tools",

  openGraph: {
    title: "Best Qualified Alternatives: 6 Visitor Intelligence Tools Compared (2026) | Cursive",
    description: "Compare the top Qualified.com alternatives for B2B website visitor intelligence and pipeline generation. Find tools that identify ALL visitors — not just the ones who choose to chat.",
    type: "article",
    url: "https://www.meetcursive.com/blog/qualified-alternative",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "Best Qualified Alternatives: 6 Visitor Intelligence Tools Compared (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Best Qualified Alternatives: 6 Visitor Intelligence Tools Compared (2026) | Cursive",
    description: "Compare the top Qualified.com alternatives for B2B website visitor intelligence and pipeline generation. Find tools that identify ALL visitors — not just the ones who choose to chat.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/qualified-alternative",
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
          { name: 'Best Qualified Alternatives: 6 Visitor Intelligence Tools Compared (2026)', url: 'https://www.meetcursive.com/blog/qualified-alternative' },
        ]),
        generateBlogPostSchema({
          title: 'Best Qualified Alternatives: 6 Visitor Intelligence Tools Compared (2026)',
          description: 'Compare the top Qualified.com alternatives for B2B website visitor intelligence and pipeline generation. Find tools that identify ALL visitors — not just the ones who choose to chat.',
          url: 'https://www.meetcursive.com/blog/qualified-alternative',
          datePublished: '2026-02-20',
          dateModified: '2026-02-20',
        }),
      ]} />
      {children}
    </>
  )
}
