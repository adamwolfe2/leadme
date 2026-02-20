import { Metadata } from "next"
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateBlogPostSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: "What Is B2B Data? Definition, Types, and How to Use It (2026)",
  description: "A complete guide to B2B data: what it is, the 5 main types (contact, firmographic, intent, behavioral, technographic), how it's collected, what makes it good or bad, and how to use it for sales and marketing.",
  keywords: "what is b2b data, b2b data definition, b2b contact data, types of b2b data, b2b data explained, b2b data for sales, firmographic data, intent data, b2b database",

  openGraph: {
    title: "What Is B2B Data? Definition, Types, and How to Use It (2026) | Cursive",
    description: "A complete guide to B2B data: what it is, the 5 main types (contact, firmographic, intent, behavioral, technographic), how it's collected, what makes it good or bad, and how to use it for sales and marketing.",
    type: "article",
    url: "https://www.meetcursive.com/blog/what-is-b2b-data",
    siteName: "Cursive",
    images: [{
      url: "https://www.meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
      alt: "What Is B2B Data? Definition, Types, and How to Use It (2026)",
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "What Is B2B Data? Definition, Types, and How to Use It (2026) | Cursive",
    description: "A complete guide to B2B data: what it is, the 5 main types (contact, firmographic, intent, behavioral, technographic), how it's collected, what makes it good or bad, and how to use it for sales and marketing.",
    images: ["https://www.meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://www.meetcursive.com/blog/what-is-b2b-data",
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
          { name: 'What Is B2B Data? Definition, Types, and How to Use It (2026)', url: 'https://www.meetcursive.com/blog/what-is-b2b-data' },
        ]),
        generateBlogPostSchema({
          title: 'What Is B2B Data? Definition, Types, and How to Use It (2026)',
          description: 'A complete guide to B2B data: what it is, the 5 main types (contact, firmographic, intent, behavioral, technographic), how it\'s collected, what makes it good or bad, and how to use it for sales and marketing.',
          url: 'https://www.meetcursive.com/blog/what-is-b2b-data',
          datePublished: '2026-02-20',
          dateModified: '2026-02-20',
        }),
      ]} />
      {children}
    </>
  )
}
