import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, Database } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "B2B Data Platforms & Enrichment | Cursive Blog",
  description: "Explore B2B data platform strategies, contact enrichment techniques, and how to leverage business intelligence data to power your marketing and sales operations.",
  keywords: [
    "B2B data platform",
    "contact data enrichment",
    "business intelligence data",
    "customer data platform",
    "data quality",
    "B2B contact database",
    "firmographic data",
  ],
  openGraph: {
    title: "B2B Data Platforms & Enrichment | Cursive Blog",
    description: "Explore B2B data platform strategies and contact enrichment techniques to power your sales operations.",
    type: "website",
    url: "https://meetcursive.com/blog/data-platforms",
  },
  alternates: {
    canonical: "https://meetcursive.com/blog/data-platforms",
  },
}

export default function DataPlatformsCategoryPage() {
  return (
    <main>
      {/* Breadcrumb */}
      <section className="py-6 bg-gray-50 border-b border-gray-200">
        <Container>
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Data Platforms</span>
          </nav>
        </Container>
      </section>

      {/* Category Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Container>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-full text-sm font-medium mb-6">
              <Database className="w-4 h-4" />
              Data Platforms
            </div>

            <h1 className="text-5xl font-bold mb-6">
              B2B Data Platforms & Enrichment
            </h1>

            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                Your marketing and sales success depends on data quality. Outdated contact information, incomplete
                firmographic data, and siloed databases waste your team's time and kill conversion rates. Modern B2B
                data platforms solve this by enriching contacts in real-time, maintaining data accuracy, and
                integrating seamlessly with your existing tools.
              </p>
              <p>
                For B2B companies, a data platform isn't just a database—it's the foundation of your go-to-market
                strategy. Cursive combines 220M+ consumer and 140M+ business profiles with real-time enrichment,
                450B+ monthly intent signals, and 200+ native integrations. Instead of juggling multiple data providers,
                you get everything in one unified platform that stays fresh and actionable.
              </p>
            </div>

            {/* Related Solutions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/data-access">
                <Button variant="outline" className="group">
                  Explore Data Access
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/clean-room">
                <Button variant="outline" className="group">
                  Learn About Data Clean Room
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Articles List */}
      <section className="py-16 bg-white">
        <Container>
          <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dataPlatformsPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 aspect-video flex items-center justify-center">
                    <Database className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#007AFF] to-blue-600">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Your Complete B2B Data Platform
            </h2>
            <p className="text-xl mb-8 opacity-90">
              220M+ consumer profiles. 140M+ business profiles. Real-time enrichment. 450B+ monthly intent signals.
              All in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://cal.com/adamwolfe/cursive-ai-audit">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Book a Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  See Platform
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "B2B Data Platforms & Enrichment",
            description: "Explore B2B data platform strategies, contact enrichment techniques, and how to leverage business intelligence data.",
            url: "https://meetcursive.com/blog/data-platforms",
            publisher: {
              "@type": "Organization",
              name: "Cursive",
              logo: {
                "@type": "ImageObject",
                url: "https://meetcursive.com/logo.png",
              },
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Blog",
                  item: "https://meetcursive.com/blog",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Data Platforms",
                  item: "https://meetcursive.com/blog/data-platforms",
                },
              ],
            },
          }),
        }}
      />
    </main>
  )
}

const dataPlatformsPosts = [
  {
    slug: "scaling-outbound",
    title: "How to Scale Outbound Without Killing Quality",
    excerpt: "Go from 10 emails/day to 200+ without sacrificing personalization or deliverability.",
    date: "Jan 14, 2026",
    readTime: "7 min read",
  },
]
