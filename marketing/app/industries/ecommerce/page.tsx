"use client"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { motion } from "framer-motion"
import { StructuredData } from "@/components/seo/structured-data"
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data"
import { DashboardPreview } from "@/components/dashboard-preview"

export default function EcommercePage() {
  return (
    <>
      <StructuredData data={generateBreadcrumbSchema([
        { name: 'Home', url: 'https://meetcursive.com' },
        { name: 'Industries', url: 'https://meetcursive.com/industries' },
        { name: 'eCommerce', url: 'https://meetcursive.com/industries/ecommerce' },
      ])} />
      <main>
        <section className="pt-24 pb-20 bg-white">
          <Container>
            <div className="max-w-5xl mx-auto">
              <span className="text-sm text-[#007AFF] mb-4 block">INDUSTRY SOLUTIONS</span>
              <h1 className="text-5xl lg:text-7xl font-light text-gray-900 mb-6">eCommerce Marketing Solutions</h1>
              <p className="text-lg text-gray-600 mb-8">Turn anonymous visitors into customers. Identify shoppers, build high-intent audiences, and activate across channels.</p>
              <Button size="lg" href="https://cal.com/adamwolfe/cursive-ai-audit">Get Started</Button>
            </div>
          </Container>
        </section>

        <section className="py-20 bg-[#F7F9FB]">
          <Container>
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-12 text-center">
              Why Choose Cursive for <span className="font-cursive text-5xl">eCommerce</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Visitor Identification', description: 'Identify up to 70% of anonymous website visitors—turn browsers into buyers.' },
                { title: 'Cart Abandonment Recovery', description: 'Target cart abandoners with personalized email, ads, and direct mail.' },
                { title: 'Lookalike Audiences', description: 'Find new customers that match your best buyers across 220M+ consumer profiles.' },
                { title: 'Multi-Channel Retargeting', description: 'Activate audiences on Facebook, Google, TikTok, email, and direct mail.' },
                { title: 'Purchase Intent Data', description: 'Target shoppers actively searching for products in your category.' },
                { title: 'Customer Enrichment', description: 'Enrich existing customer data with demographics, interests, and behaviors.' },
              ].map((benefit, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        <section className="relative py-32 bg-white overflow-hidden">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center relative z-10 mb-16"
            >
              <h2 className="text-5xl lg:text-7xl font-light text-gray-900 mb-4 leading-tight">
                Ready to Boost Your
              </h2>
              <p className="font-cursive text-6xl lg:text-8xl text-gray-900 mb-6">
                eCommerce Revenue?
              </p>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Turn anonymous visitors into customers with real-time identification and targeted campaigns across every channel.
              </p>

              <Button
                size="lg"
                href="https://cal.com/adamwolfe/cursive-ai-audit"
                target="_blank"
                className="bg-[#007AFF] text-white hover:bg-[#0066DD] text-lg px-10 py-5 mb-4"
              >
                Get Started Now
              </Button>

              <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cart recovery</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Lookalike audiences</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Multi-channel</span>
                </div>
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <DashboardPreview />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </Container>
        </section>
      </main>
    </>
  )
}
