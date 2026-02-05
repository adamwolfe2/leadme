"use client"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { motion } from "framer-motion"
import { FileText, Book } from "lucide-react"
import { DashboardCTA } from "@/components/dashboard-cta"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "B2B Marketing Resources & Lead Generation Guides | Cursive",
  description: "Free resources for B2B marketers. Learn visitor identification, audience targeting, intent data, and campaign automation strategies.",
  keywords: "B2B marketing resources, lead generation guides, marketing playbooks, B2B marketing education, free marketing resources",

  openGraph: {
    title: "B2B Marketing Resources & Lead Generation Guides | Cursive",
    description: "Free resources for B2B marketers. Learn visitor identification, audience targeting, intent data, and campaign automation strategies.",
    type: "website",
    url: "https://meetcursive.com/resources",
    siteName: "Cursive",
    images: [{
      url: "https://meetcursive.com/og-image.png",
      width: 1200,
      height: 630,
    }],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "B2B Marketing Resources & Lead Generation Guides | Cursive",
    description: "Free resources for B2B marketers. Learn visitor identification, audience targeting, intent data, and campaign automation strategies.",
    images: ["https://meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://meetcursive.com/resources",
  },

  robots: {
    index: true,
    follow: true,
  },
}

export default function ResourcesPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Learn About
              <span className="block font-cursive text-6xl lg:text-7xl text-gray-900 mt-2">
                Visitor Identification
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Expert guides on turning anonymous traffic into qualified leads
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Blog Categories */}
      <section className="py-20 bg-[#F7F9FB]">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {blogCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={category.href}
                  className="block bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 h-full"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <category.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <p className="text-sm text-[#007AFF] font-medium">
                    {category.count} articles →
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-white">
        <Container>
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-2">
              Popular Articles
            </h2>
            <p className="text-gray-600">Most read guides on visitor identification and lead generation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularArticles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={article.href}
                  className="block bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 h-full"
                >
                  <h3 className="text-lg text-gray-900 mb-3 font-medium">{article.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{article.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{article.readTime}</span>
                    <span className="text-[#007AFF] font-medium">Read article →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" href="/blog" size="lg">
              View All Articles
            </Button>
          </div>
        </Container>
      </section>



      {/* Dashboard CTA */}
      <DashboardCTA
        headline="Ready to Identify"
        subheadline="Your Website Visitors?"
        description="Book a free AI audit and see exactly which companies are visiting your site right now—and how to convert them into qualified leads."
        ctaText="Book Your Free AI Audit"
      />
    </main>
  )
}

// Blog Categories
const blogCategories = [
  {
    title: "Visitor Identification",
    description: "Learn how to identify and track anonymous website visitors",
    icon: FileText,
    href: "/blog/visitor-tracking",
    count: 12,
  },
  {
    title: "Lead Generation",
    description: "Strategies for generating high-quality B2B leads",
    icon: Book,
    href: "/blog/lead-generation",
    count: 18,
  },
  {
    title: "Data Platforms",
    description: "Comparisons and guides for B2B data providers",
    icon: FileText,
    href: "/blog/data-platforms",
    count: 8,
  },
  {
    title: "Direct Mail",
    description: "Turn digital visitors into physical campaigns",
    icon: Book,
    href: "/blog/direct-mail",
    count: 6,
  },
]

// Popular Articles
const popularArticles = [
  {
    title: "How to Identify Website Visitors: Complete Technical Guide",
    description: "Learn the technical details behind visitor identification technology",
    href: "/blog/how-to-identify-website-visitors-technical-guide",
    readTime: "12 min read",
  },
  {
    title: "AI SDR vs. Human BDR: Which Drives More Pipeline in 2026?",
    description: "90-day experiment comparing AI SDRs against human BDR teams",
    href: "/blog/ai-sdr-vs-human-bdr",
    readTime: "8 min read",
  },
  {
    title: "Warmly vs. Cursive: Head-to-Head Comparison",
    description: "Feature-by-feature comparison of visitor identification platforms",
    href: "/blog/warmly-vs-cursive-comparison",
    readTime: "10 min read",
  },
  {
    title: "Cold Email Best Practices for 2026",
    description: "Latest strategies for cold email that actually get responses",
    href: "/blog/cold-email-2026",
    readTime: "15 min read",
  },
  {
    title: "ICP Targeting Guide: Define Your Ideal Customer Profile",
    description: "Step-by-step framework for perfect customer targeting",
    href: "/blog/icp-targeting-guide",
    readTime: "11 min read",
  },
  {
    title: "Clearbit Alternatives: Top Visitor Identification Tools",
    description: "Compare the best alternatives to Clearbit in 2026",
    href: "/blog/clearbit-alternatives-comparison",
    readTime: "9 min read",
  },
]
