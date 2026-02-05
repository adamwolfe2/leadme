import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, Workflow } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "CRM Integration & Marketing Automation | Cursive Blog",
  description: "Learn how to integrate your CRM with marketing tools, automate data sync, streamline workflows, and connect your entire marketing and sales stack.",
  keywords: [
    "CRM integration",
    "marketing automation",
    "Salesforce integration",
    "HubSpot integration",
    "data sync",
    "workflow automation",
    "sales and marketing alignment",
  ],
  openGraph: {
    title: "CRM Integration & Marketing Automation | Cursive Blog",
    description: "Learn how to integrate your CRM with marketing tools and automate workflows.",
    type: "website",
    url: "https://meetcursive.com/blog/crm-integration",
  },
  alternates: {
    canonical: "https://meetcursive.com/blog/crm-integration",
  },
}

export default function CRMIntegrationCategoryPage() {
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
            <span className="text-gray-900 font-medium">CRM Integration</span>
          </nav>
        </Container>
      </section>

      {/* Category Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Container>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-full text-sm font-medium mb-6">
              <Workflow className="w-4 h-4" />
              CRM Integration
            </div>

            <h1 className="text-5xl font-bold mb-6">
              CRM Integration & Marketing Automation
            </h1>

            <div className="prose prose-lg text-gray-600 mb-8">
              <p>
                Disconnected tools kill productivity. When your visitor tracking, marketing automation, and CRM don't
                talk to each other, your team wastes hours on manual data entry, leads fall through the cracks, and
                attribution becomes impossible. This category explores how to integrate your marketing stack, automate
                data sync, and create workflows that connect visitor behavior to closed deals.
              </p>
              <p>
                For B2B companies, CRM integration means sales reps see which companies visited your pricing page,
                marketing knows which campaigns influenced deals, and everyone works from the same data. Cursive offers
                200+ native integrations with Salesforce, HubSpot, and every major CRM and marketing tool. Visitor data,
                intent signals, and campaign activity sync automatically—no Zapier required, no manual exports, just
                real-time data flowing where you need it.
              </p>
            </div>

            {/* Related Solutions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/integrations">
                <Button variant="outline" className="group">
                  View All Integrations
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="outline" className="group">
                  See Platform Overview
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
            {crmIntegrationPosts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 aspect-video flex items-center justify-center">
                    <Workflow className="w-16 h-16 text-white" />
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
      <section className="py-24 bg-gradient-to-br from-[#007AFF] to-blue-700">
        <Container>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Connect Your Entire Marketing Stack
            </h2>
            <p className="text-xl mb-8 opacity-90">
              200+ native integrations with Salesforce, HubSpot, and every major marketing tool.
              Automatic data sync. Real-time updates. No Zapier required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://cal.com/adamwolfe/cursive-ai-audit">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Book a Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/integrations">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  View Integrations
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
            name: "CRM Integration & Marketing Automation",
            description: "Learn how to integrate your CRM with marketing tools, automate data sync, and streamline workflows.",
            url: "https://meetcursive.com/blog/crm-integration",
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
                  name: "CRM Integration",
                  item: "https://meetcursive.com/blog/crm-integration",
                },
              ],
            },
          }),
        }}
      />
    </main>
  )
}

const crmIntegrationPosts = [
  {
    slug: "scaling-outbound",
    title: "How to Scale Outbound Without Killing Quality",
    excerpt: "Go from 10 emails/day to 200+ without sacrificing personalization or deliverability.",
    date: "Jan 14, 2026",
    readTime: "7 min read",
  },
]
