import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, BarChart3 } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Marketing Analytics & Attribution | Cursive Blog",
  description: "Learn how to track marketing performance, measure ROI, implement multi-touch attribution, and make data-driven decisions with real-time analytics.",
  keywords: [
    "marketing analytics",
    "marketing attribution",
    "ROI tracking",
    "real-time analytics",
    "multi-touch attribution",
    "marketing metrics",
    "data-driven marketing",
  ],
  openGraph: {
    title: "Marketing Analytics & Attribution | Cursive Blog",
    description: "Learn how to track marketing performance, measure ROI, and make data-driven decisions.",
    type: "website",
    url: "https://meetcursive.com/blog/analytics",
  },
  alternates: {
    canonical: "https://meetcursive.com/blog/analytics",
  },
}

export default function AnalyticsCategoryPage() {
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
            <span className="text-gray-900 font-medium">Analytics</span>
          </nav>
        </Container>
      </section>

      {/* Category Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Container>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-full text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Marketing Analytics & Attribution
            </h1>

            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                You can't improve what you don't measure. Marketing analytics help you understand what's working,
                what's wasting budget, and where to invest next. But traditional analytics only show part of the
                story—they miss anonymous visitors, can't connect offline and online touchpoints, and struggle with
                multi-channel attribution. This category covers real-time analytics, attribution modeling, and how
                to prove marketing ROI.
              </p>
              <p>
                For B2B companies, analytics need to connect the dots from first website visit to closed deal.
                Which campaigns drive pipeline? Which content influences deals? Which channels deserve more budget?
                Cursive tracks visitor behavior in real-time, attributes revenue across channels, and shows you exactly
                which marketing activities generate qualified leads. No more guessing—just clear data on what drives
                growth.
              </p>
            </div>

            {/* Related Solutions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/visitor-identification">
                <Button variant="outline" className="group">
                  Track Visitor Behavior
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="outline" className="group">
                  See Analytics Dashboard
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
            {analyticsPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 aspect-video flex items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-white" />
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
              See Exactly What Drives Pipeline
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Real-time visitor tracking. Multi-channel attribution. Revenue reporting. Know which campaigns
              generate qualified leads and prove marketing ROI.
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
            name: "Marketing Analytics & Attribution",
            description: "Learn how to track marketing performance, measure ROI, implement multi-touch attribution, and make data-driven decisions.",
            url: "https://meetcursive.com/blog/analytics",
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
                  name: "Analytics",
                  item: "https://meetcursive.com/blog/analytics",
                },
              ],
            },
          }),
        }}
      />
    </main>
  )
}

const analyticsPosts = [
  {
    slug: "ai-sdr-vs-human-bdr",
    title: "AI SDR vs. Human BDR: Which Drives More Pipeline in 2026?",
    excerpt: "We ran a 90-day experiment comparing our AI SDR against a team of 3 human BDRs. The results surprised even us.",
    date: "Feb 1, 2026",
    readTime: "8 min read",
  },
]
