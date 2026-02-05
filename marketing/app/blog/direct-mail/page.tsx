import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, Mail } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Direct Mail Marketing Automation | Cursive Blog",
  description: "Learn how to automate direct mail campaigns, trigger postcards based on digital behavior, and combine offline and online marketing for higher conversion rates.",
  keywords: [
    "direct mail automation",
    "triggered direct mail",
    "postcard marketing",
    "offline marketing",
    "direct mail retargeting",
    "physical mail automation",
    "hybrid marketing campaigns",
  ],
  openGraph: {
    title: "Direct Mail Marketing Automation | Cursive Blog",
    description: "Learn how to automate direct mail campaigns and trigger postcards based on digital behavior.",
    type: "website",
    url: "https://meetcursive.com/blog/direct-mail",
  },
  alternates: {
    canonical: "https://meetcursive.com/blog/direct-mail",
  },
}

export default function DirectMailCategoryPage() {
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
            <span className="text-gray-900 font-medium">Direct Mail</span>
          </nav>
        </Container>
      </section>

      {/* Category Header */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Container>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              Direct Mail
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Direct Mail Marketing Automation
            </h1>

            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                In a world of overflowing inboxes and ad fatigue, physical mail cuts through the noise. Direct mail
                automation lets you trigger postcards based on digital behavior—website visits, email opens, cart
                abandonment—creating multi-channel campaigns that convert 3-5x better than digital-only approaches.
                This category explores triggered direct mail strategies, offline retargeting, and how to measure ROI.
              </p>
              <p>
                For B2B companies, direct mail isn't just for trade shows anymore. When a high-value prospect visits
                your pricing page but doesn't convert, sending a personalized postcard within 48 hours keeps your brand
                top-of-mind. Cursive automates the entire process—from triggering campaigns based on website behavior
                to address verification, printing, and delivery tracking. Combine digital precision with offline impact.
              </p>
            </div>

            {/* Related Solutions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/direct-mail">
                <Button variant="outline" className="group">
                  Explore Direct Mail
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="outline" className="group">
                  See How It Works
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
            {directMailPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 aspect-video flex items-center justify-center">
                    <Mail className="w-16 h-16 text-white" />
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
      <section className="py-24 bg-gradient-to-br from-orange-600 to-red-600">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Turn Website Visits into Physical Mail
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Trigger personalized postcards based on digital behavior. Automated address verification, printing,
              and delivery tracking. Offline conversion rates 3-5x higher than digital-only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://cal.com/adamwolfe/cursive-ai-audit">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Book a Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/direct-mail">
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
            name: "Direct Mail Marketing Automation",
            description: "Learn how to automate direct mail campaigns, trigger postcards based on digital behavior, and combine offline and online marketing.",
            url: "https://meetcursive.com/blog/direct-mail",
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
                  name: "Direct Mail",
                  item: "https://meetcursive.com/blog/direct-mail",
                },
              ],
            },
          }),
        }}
      />
    </main>
  )
}

const directMailPosts = [
  {
    slug: "scaling-outbound",
    title: "How to Scale Outbound Without Killing Quality",
    excerpt: "Go from 10 emails/day to 200+ without sacrificing personalization or deliverability.",
    date: "Jan 14, 2026",
    readTime: "7 min read",
  },
]
