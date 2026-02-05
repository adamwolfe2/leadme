"use client"

import { Container } from "@/components/ui/container"
import { motion } from "framer-motion"
import Image from "next/image"

const companies = [
  { name: "Salesforce", logo: "/integrations/salesforce.svg" },
  { name: "HubSpot", logo: "/integrations/hubspot-svgrepo-com.svg" },
  { name: "Stripe", logo: "/integrations/public/integrations/stripe.svg" },
  { name: "Klaviyo", logo: "/integrations/klaviyo.svg" },
  { name: "Slack", logo: "/integrations/slack.svg" },
  { name: "Zoom", logo: "/integrations/icons8-zoom.svg" },
  { name: "Shopify", logo: "/integrations/shopify.svg" },
  { name: "Notion", logo: "/integrations/notion.svg" },
]

export function CustomerLogos() {
  return (
    <section className="py-16 bg-gray-100">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-12">
            Trusted by 500+ B2B companies
          </h2>

          {/* Desktop: 2x4 Grid, Mobile: 2x2 Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex items-center justify-center"
              >
                <div className="relative w-32 h-16 md:w-40 md:h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 128px, 160px"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
