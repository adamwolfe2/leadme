"use client"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { DashboardCTA } from "@/components/dashboard-cta"
import { motion } from "framer-motion"
import { Clock, TrendingUp, Users, Target, BarChart3 } from "lucide-react"

export default function CaseStudiesPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Clock className="w-10 h-10 text-[#007AFF]" />
            </div>
            <h1 className="text-5xl lg:text-7xl font-light text-gray-900 mb-6">
              Customer Stories
              <span className="block font-cursive text-6xl lg:text-8xl text-gray-500 mt-2">
                Coming Soon
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              We're working with our customers to gather detailed case studies and success stories. Check back soon to see how B2B companies are using Cursive to transform their lead generation and pipeline.
            </p>
            <Button
              size="lg"
              href="https://cal.com/adamwolfe/cursive-ai-audit"
              className="bg-[#007AFF] hover:bg-[#0066DD]"
            >
              Book a Demo Instead
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* What to Expect Section */}
      <section className="py-24 bg-[#F7F9FB]">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
              What You'll See
              <span className="block font-cursive text-5xl lg:text-6xl text-gray-500 mt-2">
                In Our Case Studies
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 text-center border border-gray-200"
            >
              <TrendingUp className="w-12 h-12 text-[#007AFF] mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-3">Pipeline Growth</h3>
              <p className="text-gray-600 text-sm">
                Quantified impact on qualified leads, pipeline value, and revenue growth
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-8 text-center border border-gray-200"
            >
              <Users className="w-12 h-12 text-[#007AFF] mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-3">Team Efficiency</h3>
              <p className="text-gray-600 text-sm">
                How teams scaled outreach without scaling headcount
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-8 text-center border border-gray-200"
            >
              <Target className="w-12 h-12 text-[#007AFF] mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-3">Lead Quality</h3>
              <p className="text-gray-600 text-sm">
                Improvements in deliverability, reply rates, and conversion rates
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-8 text-center border border-gray-200"
            >
              <BarChart3 className="w-12 h-12 text-[#007AFF] mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-3">ROI & Cost Savings</h3>
              <p className="text-gray-600 text-sm">
                Detailed breakdown of costs reduced and value generated
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <DashboardCTA
        headline="Want to Be"
        subheadline="Our Next Success Story?"
        description="Book a demo to see how Cursive can help you grow pipeline, improve lead quality, and scale revenue without scaling headcount."
      />
    </main>
  )
}
