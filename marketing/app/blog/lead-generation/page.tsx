import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "B2B Lead Generation Strategies | Cursive Blog",
  description: "Proven B2B lead generation tactics, outbound strategies, and AI-powered approaches to fill your pipeline with qualified leads. Learn what works in 2026.",
  keywords: [
    "B2B lead generation",
    "outbound lead generation",
    "AI lead generation",
    "qualified leads",
    "pipeline generation",
    "lead gen strategies",
    "B2B sales leads",
  ],
  openGraph: {
    title: "B2B Lead Generation Strategies | Cursive Blog",
    description: "Proven B2B lead generation tactics and AI-powered approaches to fill your pipeline with qualified leads.",
    type: "website",
    url: "https://meetcursive.com/blog/lead-generation",
  },
  alternates: {
    canonical: "https://meetcursive.com/blog/lead-generation",
  },
}

export default function LeadGenerationCategoryPage() {
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
            <span className="text-gray-900 font-medium">Lead Generation</span>
          </nav>
        </Container>
      </section>

      {/* Category Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Container>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Lead Generation
            </div>

            <h1 className="text-5xl font-bold mb-6">
              B2B Lead Generation Strategies
            </h1>

            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                Every B2B company needs a predictable way to generate qualified leads. Cold outreach, inbound marketing,
                and paid ads all work—but only when you know who to target, what to say, and when to reach out. This
                category covers proven lead generation strategies from AI-powered outbound to visitor conversion tactics
                that turn anonymous traffic into sales conversations.
              </p>
              <p>
                For B2B companies, lead generation isn't about volume—it's about quality and timing. Reaching out to
                prospects showing buying intent converts 10x better than cold lists. Cursive identifies which companies
                are researching solutions like yours, enriches them with contact data, and triggers multi-channel outreach
                automatically. Your sales team gets warm leads, not cold prospects.
              </p>
            </div>

            {/* Related Solutions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/visitor-identification">
                <Button variant="outline" className="group">
                  Turn Traffic into Leads
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="outline" className="group">
                  See Cursive Platform
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
            {leadGenerationPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 aspect-video flex items-center justify-center">
                    <TrendingUp className="w-16 h-16 text-white" />
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
              Turn Anonymous Visitors into Qualified Leads
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Stop losing 98% of your website visitors. Cursive reveals who they are, enriches their data,
              and triggers outreach automatically—so you never miss a warm lead.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://cal.com/adamwolfe/cursive-ai-audit">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Book a Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/visitor-identification">
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
            name: "B2B Lead Generation Strategies",
            description: "Proven B2B lead generation tactics, outbound strategies, and AI-powered approaches to fill your pipeline with qualified leads.",
            url: "https://meetcursive.com/blog/lead-generation",
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
                  name: "Lead Generation",
                  item: "https://meetcursive.com/blog/lead-generation",
                },
              ],
            },
          }),
        }}
      />
    </main>
  )
}

const leadGenerationPosts = [
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
