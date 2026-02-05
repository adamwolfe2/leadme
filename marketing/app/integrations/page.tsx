import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { DashboardCTA } from "@/components/dashboard-cta"
import { motion } from "framer-motion"
import { IntegrationsShowcase } from "@/components/integrations-showcase"
import { ArrowRight } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "200+ Marketing Integrations - CRM, Email, Ads | Cursive",
  description: "Connect Cursive with Salesforce, HubSpot, Google Ads, LinkedIn, and 200+ marketing tools. One-click integration setup.",
  keywords: "marketing integrations, CRM integrations, ad platform integrations, Salesforce integration, HubSpot integration, API connections",

  openGraph: {
    title: "200+ Marketing Integrations - CRM, Email, Ads | Cursive",
    description: "Connect Cursive with Salesforce, HubSpot, Google Ads, LinkedIn, and 200+ marketing tools. One-click integration setup.",
    type: "website",
    url: "https://meetcursive.com/integrations",
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
    title: "200+ Marketing Integrations - CRM, Email, Ads | Cursive",
    description: "Connect Cursive with Salesforce, HubSpot, Google Ads, LinkedIn, and 200+ marketing tools. One-click integration setup.",
    images: ["https://meetcursive.com/og-image.png"],
    creator: "@meetcursive",
  },

  alternates: {
    canonical: "https://meetcursive.com/integrations",
  },

  robots: {
    index: true,
    follow: true,
  },
}

export default function IntegrationsPage() {
  return (
    <main>
      <section className="pt-24 pb-20 bg-white">
        <Container>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-5xl mx-auto">
            <span className="text-sm text-[#007AFF] mb-4 block">INTEGRATIONS</span>
            <h1 className="text-5xl lg:text-7xl font-light text-gray-900 mb-6">
              Seamlessly Sync Data
              <span className="block font-cursive text-6xl lg:text-8xl text-gray-500 mt-2">With Your Stack</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect Cursive to 200+ platforms or use our API and webhooks for custom integrations.
            </p>
            <Button size="lg" href="https://cal.com/adamwolfe/cursive-ai-audit">View Integrations</Button>
          </motion.div>
        </Container>
      </section>

      <section className="py-20 bg-[#F7F9FB]">
        <Container>
          <IntegrationsShowcase />
        </Container>
      </section>

      <section className="py-20 bg-white">
        <Container>
          <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-12 text-center">
            Integration Categories
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: 'CRM Platforms', examples: 'Salesforce, HubSpot, Pipedrive, Close' },
              { title: 'Ad Platforms', examples: 'Facebook, Google, LinkedIn, TikTok' },
              { title: 'Email Tools', examples: 'Mailchimp, SendGrid, ActiveCampaign' },
              { title: 'Analytics', examples: 'Google Analytics, Segment, Mixpanel' },
              { title: 'Automation', examples: 'Zapier, Make, n8n, webhooks' },
              { title: 'Data Warehouses', examples: 'Snowflake, BigQuery, Redshift' },
            ].map((category, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.examples}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Related Resources */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
              Learn More About Data Integration
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Best practices for connecting your marketing data platforms
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
            {[
              {
                title: "CRM Integration Best Practices",
                description: "Connect your CRM to centralize lead data and improve workflows.",
                href: "/blog/crm-integration"
              },
              {
                title: "Marketing Data Platforms",
                description: "Leverage integrated data platforms to boost campaign ROI and unify customer data.",
                href: "/blog/data-platforms"
              }
            ].map((resource, i) => (
              <motion.a
                key={i}
                href={resource.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="block bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-[#007AFF] hover:shadow-lg transition-all group"
              >
                <h3 className="text-lg text-gray-900 mb-2 font-medium group-hover:text-[#007AFF] transition-colors">
                  {resource.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {resource.description}
                </p>
                <div className="mt-4 text-[#007AFF] text-sm font-medium flex items-center gap-2">
                  Read article <ArrowRight className="h-4 w-4" />
                </div>
              </motion.a>
            ))}
          </div>
        </Container>
      </section>

      <DashboardCTA
        headline="Ready to Connect"
        subheadline="Your Stack?"
        description="See how Cursive integrates with your CRM, ad platforms, and marketing tools to create a seamless data flow across your entire GTM stack."
      />
    </main>
  )
}
