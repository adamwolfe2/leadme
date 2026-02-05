import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Calendar, Clock, Target } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Audience Targeting & Segmentation | Cursive Blog",
  description: "Master B2B audience targeting strategies, learn how to build high-converting segments, and discover intent-based targeting techniques to reach your ideal customers at scale.",
  keywords: [
    "audience targeting",
    "B2B audience segmentation",
    "audience builder",
    "intent-based targeting",
    "firmographic targeting",
    "customer segmentation",
    "target audience identification",
  ],
  openGraph: {
    title: "Audience Targeting & Segmentation | Cursive Blog",
    description: "Master B2B audience targeting strategies and build high-converting segments with intent data.",
    type: "website",
    url: "https://meetcursive.com/blog/audience-targeting",
  },
  alternates: {
    canonical: "https://meetcursive.com/blog/audience-targeting",
  },
}

export default function AudienceTargetingCategoryPage() {
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
            <span className="text-gray-900 font-medium">Audience Targeting</span>
          </nav>
        </Container>
      </section>

      {/* Category Header */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Container>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              Audience Targeting
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Audience Targeting & Segmentation
            </h1>

            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                The difference between good and great B2B marketing comes down to audience targeting. Generic campaigns
                get ignored. Targeted campaigns that speak to specific pain points, industries, and buying stages get
                meetings booked. This category explores how to build precise audience segments using firmographic,
                demographic, behavioral, and intent data.
              </p>
              <p>
                For B2B companies, audience targeting means reaching the right decision-makers at companies matching
                your ICP—not wasting budget on unqualified leads. Cursive gives you access to 220M+ consumer and 140M+
                business profiles with unlimited segmentation. Build audiences based on company size, industry, technology
                stack, intent signals, and 30,000+ behavioral categories. No size caps, no restrictive licensing.
              </p>
            </div>

            {/* Related Solutions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/audience-builder">
                <Button variant="outline" className="group">
                  Explore Audience Builder
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/intent-audiences">
                <Button variant="outline" className="group">
                  See Intent Audiences
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
            {audienceTargetingPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 aspect-video flex items-center justify-center">
                    <Target className="w-16 h-16 text-white" />
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
      <section className="py-24 bg-gradient-to-br from-purple-600 to-blue-600">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Build Your Perfect Audience in Minutes
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Access 220M+ consumer and 140M+ business profiles. Build unlimited audiences with no size caps.
              Filter by firmographic, demographic, behavioral, and intent data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://cal.com/adamwolfe/cursive-ai-audit">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Book a Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/audience-builder">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Learn More
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
            name: "Audience Targeting & Segmentation",
            description: "Master B2B audience targeting strategies, learn how to build high-converting segments, and discover intent-based targeting techniques.",
            url: "https://meetcursive.com/blog/audience-targeting",
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
                  name: "Audience Targeting",
                  item: "https://meetcursive.com/blog/audience-targeting",
                },
              ],
            },
          }),
        }}
      />
    </main>
  )
}

const audienceTargetingPosts = [
  {
    slug: "icp-targeting-guide",
    title: "The 5-Step Framework for Perfect ICP Targeting",
    excerpt: "Stop wasting money on bad leads. Learn how to define and target your ideal customer profile.",
    date: "Jan 21, 2026",
    readTime: "10 min read",
  },
  {
    slug: "scaling-outbound",
    title: "How to Scale Outbound Without Killing Quality",
    excerpt: "Go from 10 emails/day to 200+ without sacrificing personalization or deliverability.",
    date: "Jan 14, 2026",
    readTime: "7 min read",
  },
]
