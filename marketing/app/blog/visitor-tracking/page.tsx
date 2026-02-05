import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { DashboardCTA } from "@/components/dashboard-cta"
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Visitor Tracking & Identification | Cursive Blog",
  description: "Learn how to identify anonymous website visitors, track visitor behavior, and turn website traffic into qualified B2B leads. Expert guides on visitor identification technology and strategies.",
  keywords: [
    "visitor tracking",
    "website visitor identification",
    "anonymous visitor tracking",
    "B2B visitor tracking",
    "visitor identification software",
    "website analytics",
    "visitor intelligence",
  ],
  openGraph: {
    title: "Visitor Tracking & Identification | Cursive Blog",
    description: "Learn how to identify anonymous website visitors, track visitor behavior, and turn website traffic into qualified B2B leads.",
    type: "website",
    url: "https://meetcursive.com/blog/visitor-tracking",
  },
  alternates: {
    canonical: "https://meetcursive.com/blog/visitor-tracking",
  },
}

export default function VisitorTrackingCategoryPage() {
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
            <span className="text-gray-900 font-medium">Visitor Tracking</span>
          </nav>
        </Container>
      </section>

      {/* Category Header */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium mb-6">
              <Eye className="w-4 h-4" />
              Visitor Tracking
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Website Visitor Tracking & Identification
            </h1>

            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                Most B2B websites lose 98% of their visitors without ever knowing who they were. Visitor tracking
                technology identifies the companies and people browsing your site—even if they don't fill out a form.
                This category covers everything from the basics of visitor identification to advanced strategies for
                turning anonymous traffic into qualified sales conversations.
              </p>
              <p>
                For B2B companies, knowing which companies visited your pricing page this week is the difference
                between guessing and growing. Visitor tracking reveals purchase intent, helps prioritize outreach,
                and gives your sales team warm leads instead of cold prospects. Cursive identifies up to 70% of
                your website traffic in real-time, showing you exactly which companies are researching your product
                and what pages they viewed.
              </p>
            </div>

            {/* Related Solutions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/visitor-identification">
                <Button variant="outline" className="group">
                  Learn About Visitor Identification
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="outline" className="group">
                  See How Cursive Works
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
            {visitorTrackingPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 aspect-video flex items-center justify-center">
                    <Eye className="w-16 h-16 text-white" />
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
      <DashboardCTA
        headline="Ready to See Who's"
        subheadline="Visiting Your Site?"
        description="Cursive identifies up to 70% of your anonymous website traffic. Know which companies viewed your pricing page this week—and reach out while they're still interested."
      />

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Visitor Tracking & Identification",
            description: "Learn how to identify anonymous website visitors, track visitor behavior, and turn website traffic into qualified B2B leads.",
            url: "https://meetcursive.com/blog/visitor-tracking",
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
                  name: "Visitor Tracking",
                  item: "https://meetcursive.com/blog/visitor-tracking",
                },
              ],
            },
          }),
        }}
      />
    </main>
  )
}

const visitorTrackingPosts = [
  {
    slug: "ai-sdr-vs-human-bdr",
    title: "AI SDR vs. Human BDR: Which Drives More Pipeline in 2026?",
    excerpt: "We ran a 90-day experiment comparing our AI SDR against a team of 3 human BDRs. The results surprised even us.",
    date: "Feb 1, 2026",
    readTime: "8 min read",
  },
  {
    slug: "cold-email-2026",
    title: "Cold Email in 2026: What's Still Working (And What's Not)",
    excerpt: "The cold email landscape has changed dramatically. Here's what top performers are doing differently.",
    date: "Jan 28, 2026",
    readTime: "6 min read",
  },
  {
    slug: "icp-targeting-guide",
    title: "The 5-Step Framework for Perfect ICP Targeting",
    excerpt: "Stop wasting money on bad leads. Learn how to define and target your ideal customer profile.",
    date: "Jan 21, 2026",
    readTime: "10 min read",
  },
]
