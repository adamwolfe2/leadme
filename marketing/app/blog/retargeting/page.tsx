import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, RotateCcw } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Retargeting & Re-engagement Strategies | Cursive Blog",
  description: "Master B2B retargeting tactics, cross-platform retargeting strategies, and how to re-engage anonymous visitors across email, ads, and direct mail.",
  keywords: [
    "B2B retargeting",
    "visitor retargeting",
    "cross-platform retargeting",
    "retargeting campaigns",
    "anonymous visitor retargeting",
    "multi-channel retargeting",
    "re-engagement strategies",
  ],
  openGraph: {
    title: "Retargeting & Re-engagement Strategies | Cursive Blog",
    description: "Master B2B retargeting tactics and cross-platform strategies to re-engage anonymous visitors.",
    type: "website",
    url: "https://meetcursive.com/blog/retargeting",
  },
  alternates: {
    canonical: "https://meetcursive.com/blog/retargeting",
  },
}

export default function RetargetingCategoryPage() {
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
            <span className="text-gray-900 font-medium">Retargeting</span>
          </nav>
        </Container>
      </section>

      {/* Category Header */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Container>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium mb-6">
              <RotateCcw className="w-4 h-4" />
              Retargeting
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Retargeting & Re-engagement Strategies
            </h1>

            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                The vast majority of website visitors don't convert on their first visit. Retargeting brings them back
                with relevant messages across email, ads, and direct mail. But most companies can only retarget the 2%
                who filled out a form. This category explores how to retarget the other 98%—anonymous visitors—across
                multiple channels based on their behavior and intent.
              </p>
              <p>
                For B2B companies, retargeting isn't just about showing ads to people who visited your site. It's about
                identifying which companies showed interest, enriching them with contact data, and orchestrating
                personalized outreach across every channel. Cursive identifies up to 70% of anonymous visitors, then
                activates retargeting campaigns across email, LinkedIn ads, display ads, and direct mail—all from one
                platform.
              </p>
            </div>

            {/* Related Solutions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/visitor-identification">
                <Button variant="outline" className="group">
                  Identify Anonymous Visitors
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/direct-mail">
                <Button variant="outline" className="group">
                  Explore Direct Mail Retargeting
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
            {retargetingPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 aspect-video flex items-center justify-center">
                    <RotateCcw className="w-16 h-16 text-white" />
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
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-blue-700">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Retarget the 98% Who Don't Convert
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Identify anonymous visitors, enrich their data, and retarget across email, ads, and direct mail.
              Multi-channel campaigns that bring prospects back and convert.
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
            name: "Retargeting & Re-engagement Strategies",
            description: "Master B2B retargeting tactics, cross-platform retargeting strategies, and how to re-engage anonymous visitors.",
            url: "https://meetcursive.com/blog/retargeting",
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
                  name: "Retargeting",
                  item: "https://meetcursive.com/blog/retargeting",
                },
              ],
            },
          }),
        }}
      />
    </main>
  )
}

const retargetingPosts = [
  {
    slug: "cold-email-2026",
    title: "Cold Email in 2026: What's Still Working (And What's Not)",
    excerpt: "The cold email landscape has changed dramatically. Here's what top performers are doing differently.",
    date: "Jan 28, 2026",
    readTime: "6 min read",
  },
]
