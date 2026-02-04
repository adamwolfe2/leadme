"use client"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { motion } from "framer-motion"
import { InteractiveFeaturesShowcase } from "@/components/demos/interactive-features-showcase"

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* Hero Section with Interactive Demo */}
      <section className="pt-24 pb-20 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-5xl mx-auto mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight">
              AI Intent Systems
              <span className="block text-gray-500 mt-2">
                That Never Sleep.
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              <span className="font-cursive text-4xl text-gray-900">Cursive</span> identifies real people actively searching for your service, enriches them with verified contact data, and activates them through automated outbound.
            </p>
            <Button size="lg" href="https://cal.com/adamwolfe/cursive-ai-audit" target="_blank">
              Get started. It's FREE!
            </Button>
          </motion.div>

          {/* Interactive Features Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <InteractiveFeaturesShowcase />
          </motion.div>
        </Container>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 bg-[#F7F9FB]">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-2 whitespace-nowrap">
              Everything you need to run
            </h2>
            <p className="font-cursive text-4xl sm:text-5xl lg:text-6xl text-gray-500 whitespace-nowrap">
              outbound at scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-xl border border-gray-200 p-8"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-6 h-6 text-gray-700"
                  >
                    <path d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-3 gap-12 text-center max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-5xl font-light text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#F7F9FB]">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-2">
              Trusted by Growth Teams
            </h2>
            <p className="font-cursive text-3xl lg:text-4xl text-gray-500">
              Who Move Fast
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 border border-gray-200"
              >
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
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
              We know who's searching
            </h2>
            <p className="font-cursive text-6xl lg:text-8xl text-gray-900 mb-12">
              with Cursive
            </p>
            <Button
              size="lg"
              href="https://cal.com/adamwolfe/cursive-ai-audit"
              target="_blank"
              className="bg-[#007AFF] text-white hover:bg-[#0066DD]"
            >
              Get Started. It's FREE!
            </Button>
          </motion.div>

          {/* Dashboard Screenshot with Fade */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200">
              {/* Browser Chrome */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-1.5 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              </div>

              {/* Dashboard Screenshot Placeholder */}
              <div className="bg-white p-8">
                <div className="space-y-6">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl text-gray-900">Pipeline Dashboard</h3>
                    <div className="flex gap-2">
                      <div className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded">Live</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Total Leads", value: "2,847" },
                      { label: "Active Campaigns", value: "12" },
                      { label: "Response Rate", value: "42%" },
                      { label: "Meetings Booked", value: "87" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
                        <div className="text-2xl text-[#007AFF]">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-48 flex items-end justify-between gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Fade to White at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}

// Core Features Data
const coreFeatures = [
  {
    title: "Pixel Lead Tracking",
    description: "Identify every website visitor and track their journey",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    items: [
      "Anonymous visitor identification",
      "Company enrichment",
      "Intent scoring",
      "CRM auto-sync"
    ]
  },
  {
    title: "AI-Powered Outreach",
    description: "Automated sequences that actually convert",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    items: [
      "Multi-touch campaigns",
      "Brand voice training",
      "Reply detection",
      "Meeting booking"
    ]
  },
  {
    title: "People Search",
    description: "500M+ verified B2B contacts at your fingertips",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    items: [
      "Advanced filtering",
      "Email verification",
      "Phone numbers",
      "LinkedIn profiles"
    ]
  },
  {
    title: "Pipeline Dashboard",
    description: "Real-time metrics and deal tracking",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    items: [
      "Live pipeline view",
      "Conversion analytics",
      "Lead source tracking",
      "Revenue forecasting"
    ]
  },
  {
    title: "Lead Marketplace",
    description: "Purchase verified lead lists on demand",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    items: [
      "Pre-built lists",
      "Custom targeting",
      "99% accuracy",
      "Instant delivery"
    ]
  },
  {
    title: "AI Studio",
    description: "Train AI on your brand and messaging",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    items: [
      "Brand voice setup",
      "Copy generation",
      "A/B testing",
      "Performance insights"
    ]
  },
]

// Stats Data
const stats = [
  { value: "500M+", label: "Verified Contacts" },
  { value: "99%", label: "Data Accuracy" },
  { value: "24/7", label: "AI Agents Active" },
]

// Testimonials Data
const testimonials = [
  {
    quote: "We went from 3 leads per week to 50+ qualified conversations per month. Cursive eliminated our prospecting bottleneck.",
    name: "Sarah Chen",
    title: "VP Sales, TechStart",
  },
  {
    quote: "The lead quality is unmatched. Every list is tailored to our ICP, verified, and ready to work. No more dead emails.",
    name: "Mike Rodriguez",
    title: "Head of Growth, SaaS Co",
  },
  {
    quote: "Cursive's AI SDR books more meetings than our entire sales team combined. It's like having 10 BDRs for the cost of one.",
    name: "Emily Johnson",
    title: "CEO, Pipeline Inc",
  },
]
