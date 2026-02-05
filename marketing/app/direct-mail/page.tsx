"use client"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { motion } from "framer-motion"
import {
  Mail, MapPin, Zap, Target, TrendingUp, CheckCircle2,
  ArrowRight, Clock, DollarSign, Users, Shield, Sparkles,
  BarChart3, Package, MessageSquare, Globe
} from "lucide-react"

export default function DirectMailPage() {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://meetcursive.com/direct-mail#service",
        "name": "Cursive Direct Mail Automation",
        "description": "Turn website visitors into physical touchpoints. Automated direct mail campaigns starting at $1.50 per piece. Trigger postcards based on digital behavior.",
        "provider": {
          "@type": "Organization",
          "name": "Cursive"
        },
        "areaServed": "US",
        "category": "Direct Mail Marketing Automation"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://meetcursive.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Direct Mail",
            "item": "https://meetcursive.com/direct-mail"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much does direct mail cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Pricing starts at $1.50 per postcard (including design, printing, postage, and delivery). Letters start at $2.50. Custom packages are available for high-value accounts. No minimum orders or monthly commitments."
            }
          },
          {
            "@type": "Question",
            "name": "How quickly can mail be delivered?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Mail typically arrives within 48 hours of triggering. We handle printing, addressing, and delivery automatically. You can track delivery status in your dashboard."
            }
          },
          {
            "@type": "Question",
            "name": "Can I trigger direct mail based on website behavior?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Set up automated triggers based on page visits, email opens, cart abandonment, form submissions, or any custom event. Mail sends automatically when conditions are met."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to design my own mail pieces?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Cursive provides professional templates you can customize with your branding, messaging, and imagery. You can also upload custom designs if you have them."
            }
          },
          {
            "@type": "Question",
            "name": "How do you match visitors to physical addresses?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We use our visitor identification system to match website visitors to verified physical addresses. We validate addresses before mailing to ensure deliverability."
            }
          },
          {
            "@type": "Question",
            "name": "Can I track direct mail performance?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Track delivery status, response rates, website visits after receiving mail, and conversions. Include QR codes, PURLs, or trackable phone numbers for detailed attribution."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a minimum order quantity?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No minimums. Send one postcard or 10,000—whatever your campaign needs. Pay only for what you send."
            }
          },
          {
            "@type": "Question",
            "name": "Can I personalize each mail piece?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. Use merge tags to personalize with names, company names, specific pages they viewed, or any custom data. Every piece can be unique."
            }
          },
          {
            "@type": "Question",
            "name": "What types of mail can I send?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Postcards (4x6 or 6x9), letters in envelopes, and custom packages. For high-value accounts, we can send dimensional mail, samples, or branded gifts."
            }
          },
          {
            "@type": "Question",
            "name": "How does direct mail integrate with digital campaigns?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Direct mail syncs with your email, ad, and SMS campaigns. Build multi-touch sequences that combine digital and physical channels for maximum impact."
            }
          }
        ]
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-20 bg-white">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-5xl mx-auto"
            >
              <span className="text-sm text-[#007AFF] mb-4 block font-medium tracking-wide">DIRECT MAIL AUTOMATION</span>
              <h1 className="text-5xl lg:text-7xl font-light text-gray-900 mb-6">
                Turn Website Clicks Into Mailbox Conversions
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
                Offline conversion rates are 3-5x higher than digital-only campaigns. Cursive automates direct mail so you can reach prospects where email can't—their physical mailbox.
              </p>
              <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
                Trigger personalized postcards when visitors view your pricing page. Re-engage no-shows with event invitations. Win back churned customers with targeted offers. All automated.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" href="https://cal.com/adamwolfe/cursive-ai-audit">
                  Launch Your First Campaign
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" href="/pricing">
                  See Pricing
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>From $1.50 per piece</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>48-hour delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>No minimums</span>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-[#F7F9FB]">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-4">
                From Click to Mailbox in 48 Hours
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Automated direct mail that works while you sleep
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Visitor Identified",
                  description: "Our pixel identifies website visitors and matches them to verified physical addresses in real-time.",
                  icon: Target
                },
                {
                  step: "2",
                  title: "Trigger Activated",
                  description: "Set conditions like 'viewed pricing page' or 'abandoned cart.' Mail sends automatically when met.",
                  icon: Zap
                },
                {
                  step: "3",
                  title: "Mail Designed & Sent",
                  description: "Personalized postcards or letters are designed, printed, and mailed within hours. Address verification included.",
                  icon: Mail
                },
                {
                  step: "4",
                  title: "Track & Convert",
                  description: "Monitor delivery, track responses via QR codes or PURLs, and measure conversions in your dashboard.",
                  icon: BarChart3
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-6 shadow-lg">
                      <step.icon className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl text-gray-900 mb-3 font-medium">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Benefits Grid */}
        <section className="py-20 bg-white">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-4">
                Stand Out in a Crowded Inbox
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Physical mail gets opened. Digital ads get ignored. Break through the noise.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: "3-5x Higher Response Rates",
                  description: "Direct mail converts 3-5x better than digital-only campaigns. Stand out in physical mailboxes where competition is lower."
                },
                {
                  icon: DollarSign,
                  title: "Affordable at Scale",
                  description: "Starting at $1.50 per postcard with no minimums. Only pay for what you send. No hidden fees or monthly commitments."
                },
                {
                  icon: Zap,
                  title: "Fully Automated Triggers",
                  description: "Set it and forget it. Trigger mail based on website behavior, email opens, abandoned carts, or custom events."
                },
                {
                  icon: MapPin,
                  title: "Verified Address Matching",
                  description: "We match website visitors to verified physical addresses and validate deliverability before sending."
                },
                {
                  icon: Users,
                  title: "Personalized at Scale",
                  description: "Use merge tags to personalize every piece with names, company details, pages viewed, or custom data."
                },
                {
                  icon: Clock,
                  title: "48-Hour Delivery",
                  description: "Mail is printed, addressed, and delivered within 48 hours. Fast enough to catch hot leads while they're interested."
                },
                {
                  icon: BarChart3,
                  title: "Track Every Response",
                  description: "Monitor delivery status, scan rates, website visits after receiving mail, and conversions. Full attribution included."
                },
                {
                  icon: Package,
                  title: "Multi-Format Options",
                  description: "Send postcards, letters, or dimensional mail packages. Templates provided or upload custom designs."
                }
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#007AFF] hover:shadow-lg transition-all"
                >
                  <benefit.icon className="h-8 w-8 text-[#007AFF] mb-4" />
                  <h3 className="text-xl text-gray-900 mb-3 font-medium">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-[#F7F9FB]">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-4">
                Real Direct Mail Campaigns That Convert
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                How B2B companies use Cursive to stand out in the mailbox
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  audience: "SaaS Sales Teams",
                  scenario: "Enterprise prospects visit your pricing page but don't book demos. You have no way to follow up except generic emails that get ignored.",
                  solution: "Trigger personalized postcards to decision-makers within 24 hours of viewing high-intent pages. Include a QR code linking to a custom demo booking page. Mail arrives while they're still evaluating—before competitors reach out."
                },
                {
                  audience: "Event Marketers",
                  scenario: "Webinar registrants who don't show up never re-engage with follow-up emails. You're losing 40-50% of registered attendees.",
                  solution: "Send postcards to no-shows with a personalized message and link to the recording. Physical mail gets opened when emails don't. Recover 20-30% of no-shows with targeted mail."
                },
                {
                  audience: "E-Commerce Brands",
                  scenario: "Cart abandoners get retargeting ads but tune them out. Email open rates for abandoned cart sequences are declining.",
                  solution: "Trigger postcards with exclusive discount codes for high-value abandoned carts. Include product images and personalized messaging. Convert 5-10% of abandoned carts with offline touchpoints."
                },
                {
                  audience: "Customer Success",
                  scenario: "Churned customers stop responding to win-back emails. You need a way to re-engage them before they're lost forever.",
                  solution: "Send handwritten-style letters to churned accounts with a personal note and special offer. Physical mail feels more genuine than automated emails. Win back 15-20% of churned customers."
                }
              ].map((useCase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-8 border border-gray-200"
                >
                  <div className="text-sm text-[#007AFF] font-medium mb-2">FOR {useCase.audience.toUpperCase()}</div>
                  <h3 className="text-2xl text-gray-900 mb-4 font-medium">
                    {useCase.scenario}
                  </h3>
                  <div className="border-l-4 border-[#007AFF] pl-4 bg-blue-50 p-4 rounded">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">How Cursive helps:</strong> {useCase.solution}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Features Deep Dive */}
        <section className="py-20 bg-white">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-4">
                Everything You Need for Direct Mail Success
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professional direct mail without the complexity
              </p>
            </div>
            <div className="space-y-16 max-w-5xl mx-auto">
              {[
                {
                  title: "Automated Trigger Campaigns",
                  description: "Set up behavior-based triggers that send mail automatically when conditions are met. No manual work required.",
                  features: [
                    "Page visit triggers (pricing, features, case studies)",
                    "Email engagement triggers (opens, clicks, bounces)",
                    "Cart abandonment and checkout triggers",
                    "Event triggers (webinar no-shows, downloads)",
                    "CRM triggers (deal stage changes, lost opportunities)",
                    "Time-based delays (send 24 hours after first visit)"
                  ]
                },
                {
                  title: "Design Templates & Customization",
                  description: "Professional templates designed to convert, or upload your own custom designs. No design skills needed.",
                  features: [
                    "Pre-built templates for common use cases",
                    "Drag-and-drop editor for customization",
                    "Upload custom designs (PDF, PNG, JPG)",
                    "Personalization with merge tags",
                    "QR code and PURL generation",
                    "Brand color and logo integration"
                  ]
                },
                {
                  title: "Advanced Targeting & Filtering",
                  description: "Don't waste money sending mail to the wrong people. Filter audiences to reach only high-value prospects.",
                  features: [
                    "Filter by company size, industry, revenue",
                    "Exclude existing customers automatically",
                    "Target by job title and seniority",
                    "Geographic targeting (city, state, zip)",
                    "Intent-based filtering (active researchers only)",
                    "Custom scoring to prioritize high-value leads"
                  ]
                },
                {
                  title: "Multi-Channel Integration",
                  description: "Direct mail works best as part of a multi-touch sequence. Coordinate with email, ads, and SMS.",
                  features: [
                    "Sync with email sequences for coordinated outreach",
                    "Combine with retargeting ads for reinforcement",
                    "Trigger SMS follow-ups after mail delivery",
                    "CRM integration for sales team alerts",
                    "Unified analytics across all channels",
                    "A/B test mail vs. digital-only campaigns"
                  ]
                },
                {
                  title: "Tracking & Attribution",
                  description: "Measure every aspect of your direct mail campaigns. Prove ROI with detailed analytics.",
                  features: [
                    "Delivery confirmation and tracking",
                    "QR code scan tracking",
                    "PURL visit tracking",
                    "Conversion attribution to mail pieces",
                    "Response rate and ROI reporting",
                    "Integrate with Google Analytics and CRMs"
                  ]
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200"
                >
                  <h3 className="text-2xl text-gray-900 mb-4 font-medium">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.features.map((item, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-[#F7F9FB]">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Pay only for what you send. No minimums, no commitments.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  type: "Postcard",
                  price: "$1.50",
                  description: "4x6 or 6x9 postcards with full-color printing, postage, and delivery included.",
                  features: ["Full-color printing", "Address verification", "48-hour delivery", "QR code tracking"]
                },
                {
                  type: "Letter",
                  price: "$2.50",
                  description: "Personalized letters in envelopes with custom inserts and premium feel.",
                  features: ["Envelope + letter", "Up to 2 inserts", "Handwritten-style fonts", "PURL tracking"]
                },
                {
                  type: "Package",
                  price: "Custom",
                  description: "Dimensional mail, branded gifts, or custom packages for high-value accounts.",
                  features: ["Custom packaging", "Branded items", "Premium fulfillment", "White-glove service"]
                }
              ].map((tier, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[#007AFF] hover:shadow-lg transition-all"
                >
                  <h3 className="text-2xl text-gray-900 mb-2 font-medium">{tier.type}</h3>
                  <div className="text-4xl text-[#007AFF] mb-4 font-light">{tier.price}</div>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{tier.description}</p>
                  <ul className="space-y-3">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Integrations */}
        <section className="py-20 bg-white">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-4">
                Works With Your Marketing Stack
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Integrate with CRMs, email platforms, and marketing automation tools
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto mb-8">
              {[
                "Salesforce", "HubSpot", "Marketo", "Pardot", "Pipedrive", "Zoho CRM",
                "Mailchimp", "SendGrid", "ActiveCampaign", "Klaviyo", "Braze", "Customer.io",
                "Shopify", "WooCommerce", "BigCommerce", "Magento", "Stripe", "Zapier"
              ].map((integration, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center text-center h-20"
                >
                  <span className="text-sm font-medium text-gray-700">{integration}</span>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-4">And 180+ more integrations</p>
              <Button variant="outline" href="/integrations">
                View All Integrations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Container>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-[#F7F9FB]">
          <Container>
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-12 border border-blue-100"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <blockquote className="text-2xl text-gray-900 mb-6 leading-relaxed">
                  "We added direct mail to our webinar no-show sequence and recovered 25% of registrants who didn't attend. The physical postcard stands out when emails don't. ROI was positive from day one."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                    LT
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Lisa Thompson</div>
                    <div className="text-sm text-gray-600">VP of Marketing, Event Platform</div>
                  </div>
                </div>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                {[
                  { metric: "3-5x", label: "Higher response vs digital-only" },
                  { metric: "$1.50", label: "Starting price per postcard" },
                  { metric: "48hrs", label: "Average delivery time" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl text-[#007AFF] font-light mb-2">{stat.metric}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-light text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  question: "How much does direct mail cost?",
                  answer: "Pricing starts at $1.50 per postcard (including design, printing, postage, and delivery). Letters start at $2.50. Custom packages are available for high-value accounts. No minimum orders or monthly commitments."
                },
                {
                  question: "How quickly can mail be delivered?",
                  answer: "Mail typically arrives within 48 hours of triggering. We handle printing, addressing, and delivery automatically. You can track delivery status in your dashboard."
                },
                {
                  question: "Can I trigger direct mail based on website behavior?",
                  answer: "Yes. Set up automated triggers based on page visits, email opens, cart abandonment, form submissions, or any custom event. Mail sends automatically when conditions are met."
                },
                {
                  question: "Do I need to design my own mail pieces?",
                  answer: "No. Cursive provides professional templates you can customize with your branding, messaging, and imagery. You can also upload custom designs if you have them."
                },
                {
                  question: "How do you match visitors to physical addresses?",
                  answer: "We use our visitor identification system to match website visitors to verified physical addresses. We validate addresses before mailing to ensure deliverability."
                },
                {
                  question: "Can I track direct mail performance?",
                  answer: "Yes. Track delivery status, response rates, website visits after receiving mail, and conversions. Include QR codes, PURLs, or trackable phone numbers for detailed attribution."
                },
                {
                  question: "Is there a minimum order quantity?",
                  answer: "No minimums. Send one postcard or 10,000—whatever your campaign needs. Pay only for what you send."
                },
                {
                  question: "Can I personalize each mail piece?",
                  answer: "Absolutely. Use merge tags to personalize with names, company names, specific pages they viewed, or any custom data. Every piece can be unique."
                },
                {
                  question: "What types of mail can I send?",
                  answer: "Postcards (4x6 or 6x9), letters in envelopes, and custom packages. For high-value accounts, we can send dimensional mail, samples, or branded gifts."
                },
                {
                  question: "How does direct mail integrate with digital campaigns?",
                  answer: "Direct mail syncs with your email, ad, and SMS campaigns. Build multi-touch sequences that combine digital and physical channels for maximum impact."
                }
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                >
                  <h3 className="text-lg text-gray-900 mb-3 font-medium">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-[#F7F9FB]">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto"
            >
              <h2 className="text-4xl lg:text-5xl font-light mb-4">
                Launch Your First Direct Mail Campaign
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Turn anonymous website traffic into physical touchpoints. Starting at just $1.50 per piece with 48-hour delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#007AFF] hover:bg-gray-100"
                  href="https://cal.com/adamwolfe/cursive-ai-audit"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  href="/pricing"
                >
                  See Pricing
                </Button>
              </div>
              <p className="text-sm mt-6 opacity-75">No minimums · 48-hour delivery · Full tracking included</p>
            </motion.div>
          </Container>
        </section>
      </main>
    </>
  )
}
