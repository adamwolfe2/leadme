'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/lib/hooks/use-toast'
import { PLAN_CONFIGS } from '@/lib/stripe/client'

interface PricingCardProps {
  plan: 'free' | 'pro'
  isCurrentPlan: boolean
  billingPeriod: 'monthly' | 'yearly'
  onUpgrade: (billingPeriod: 'monthly' | 'yearly') => void
  loading: boolean
}

function PricingCard({
  plan,
  isCurrentPlan,
  billingPeriod,
  onUpgrade,
  loading,
}: PricingCardProps) {
  const isPro = plan === 'pro'
  const config = PLAN_CONFIGS[plan]

  // Price calculations
  const monthlyPrice = config.price
  const yearlyPrice = isPro ? monthlyPrice * 12 * 0.8 : 0 // 20% discount
  const displayPrice = billingPeriod === 'yearly' ? yearlyPrice : monthlyPrice
  const pricePerMonth =
    billingPeriod === 'yearly' && isPro ? yearlyPrice / 12 : monthlyPrice

  return (
    <div
      className={`relative rounded-2xl border-2 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
        isPro
          ? 'border-emerald-500 ring-2 ring-emerald-500 ring-opacity-50'
          : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      {/* Most Popular Badge */}
      {isPro && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-5 right-4">
          <span className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white shadow-sm">
            Current Plan
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-zinc-900">{config.name}</h3>
        <p className="mt-2 text-sm text-zinc-600">
          {isPro
            ? 'For serious lead generation and growth'
            : 'Perfect for trying out the platform'}
        </p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold text-zinc-900">
            ${Math.round(pricePerMonth)}
          </span>
          <div className="flex flex-col">
            <span className="text-lg text-zinc-600">/month</span>
            {billingPeriod === 'yearly' && isPro && (
              <span className="text-xs text-emerald-600 font-medium">
                Save ${Math.round(monthlyPrice * 12 - yearlyPrice)}/year
              </span>
            )}
          </div>
        </div>
        {billingPeriod === 'yearly' && isPro && (
          <p className="mt-2 text-sm text-zinc-500">
            Billed ${Math.round(displayPrice)} annually
          </p>
        )}
      </div>

      {/* Features List */}
      <ul className="mb-8 space-y-4">
        {config.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-zinc-700 leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="space-y-3">
        {!isPro ? (
          isCurrentPlan ? (
            <button
              disabled
              className="w-full rounded-lg bg-zinc-100 px-6 py-3.5 text-base font-semibold text-zinc-400 cursor-not-allowed transition-all"
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={() => onUpgrade(billingPeriod)}
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-6 py-3.5 text-base font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? 'Processing...' : 'Downgrade to Free'}
            </button>
          )
        ) : isCurrentPlan ? (
          <button
            disabled
            className="w-full rounded-lg bg-zinc-100 px-6 py-3.5 text-base font-semibold text-zinc-400 cursor-not-allowed transition-all"
          >
            Current Plan
          </button>
        ) : (
          <>
            <button
              onClick={() => onUpgrade(billingPeriod)}
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-base font-semibold text-white hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? 'Processing...' : 'Upgrade to Pro'}
            </button>
            <p className="text-center text-xs text-zinc-500">
              14-day free trial • Cancel anytime
            </p>
          </>
        )}
      </div>
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-emerald-600"
      >
        <span className="text-lg font-semibold text-zinc-900">{question}</span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-zinc-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly'
  )
  const [loading, setLoading] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkoutStatus = searchParams.get('checkout')
  const toast = useToast()

  // Fetch current user data
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await fetch('/api/users/me')
      if (!response.ok) throw new Error('Failed to fetch user data')
      return response.json()
    },
  })

  const user = userData?.data
  const currentPlan = user?.plan || 'free'

  const handleUpgrade = async (selectedBillingPeriod: 'monthly' | 'yearly') => {
    setLoading(true)

    try {
      // Create checkout session
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingPeriod: selectedBillingPeriod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Upgrade error:', error)
      toast.error(error.message || 'Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  const faqs = [
    {
      question: 'What are credits and how do they work?',
      answer:
        'Credits are used to reveal contact emails in the People Search feature. Each email reveal costs 1 credit. Your credit balance resets daily at midnight UTC. Free plan gets 3 credits per day, Pro plan gets 1,000 credits per day.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer:
        "Yes, you can cancel your subscription at any time from the billing settings. You'll continue to have Pro access until the end of your billing period. No questions asked, and no hidden fees.",
    },
    {
      question: 'What happens when I downgrade to Free?',
      answer:
        'Your queries will be paused but not deleted. You can reactivate one query on the Free plan. All your data remains accessible, including leads and saved searches. You can upgrade again anytime to reactivate all features.',
    },
    {
      question: 'Do you offer refunds?',
      answer:
        "We offer a 14-day money-back guarantee. If you're not satisfied within the first 14 days of your subscription, contact support at support@openinfo.com for a full refund, no questions asked.",
    },
    {
      question: 'Can I switch between monthly and yearly billing?',
      answer:
        'Yes, you can switch billing periods from your billing settings at any time. If switching from monthly to yearly, the change takes effect immediately with prorated credit. If switching from yearly to monthly, the change takes effect at the start of your next billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. We do not store your credit card information.',
    },
    {
      question: 'Is there a free trial for Pro?',
      answer:
        'Yes! All new Pro subscriptions include a 14-day free trial. You can cancel anytime during the trial period without being charged. Your card will only be charged after the trial period ends.',
    },
    {
      question: 'What kind of support do I get?',
      answer:
        'Free plan users get basic email support with response times within 2-3 business days. Pro plan users get priority support with response times within 24 hours, including access to our team for onboarding and technical assistance.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              pricing
            </span>
          </h1>
          <p className="mt-4 text-xl text-zinc-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Upgrade, downgrade, or cancel
            anytime.
          </p>
        </div>

        {/* Checkout status notification */}
        {checkoutStatus === 'success' && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-emerald-800">
                  Subscription activated!
                </h3>
                <p className="mt-2 text-sm text-emerald-700">
                  Your Pro subscription is now active. Start generating leads with
                  unlimited access!
                </p>
              </div>
            </div>
          </div>
        )}

        {checkoutStatus === 'cancelled' && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Checkout cancelled
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  You can upgrade anytime. Questions?{' '}
                  <a
                    href="mailto:support@openinfo.com"
                    className="underline hover:text-yellow-900"
                  >
                    Contact support
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing period toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-base font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'text-zinc-900'
                : 'text-zinc-500'
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingPeriod(
                billingPeriod === 'monthly' ? 'yearly' : 'monthly'
              )
            }
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              billingPeriod === 'yearly'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : 'bg-zinc-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span
            className={`text-base font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'text-zinc-900'
                : 'text-zinc-500'
            }`}
          >
            Yearly
            <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <PricingCard
            plan="free"
            isCurrentPlan={currentPlan === 'free'}
            billingPeriod={billingPeriod}
            onUpgrade={handleUpgrade}
            loading={loading}
          />
          <PricingCard
            plan="pro"
            isCurrentPlan={currentPlan === 'pro'}
            billingPeriod={billingPeriod}
            onUpgrade={handleUpgrade}
            loading={loading}
          />
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 text-center mb-12">
            Compare Plans
          </h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Features
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    Daily leads
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-zinc-900 font-medium">
                    3
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-zinc-900 font-medium">
                    1,000
                  </td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    Active queries
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-zinc-900 font-medium">
                    1
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-zinc-900 font-medium">
                    5
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    Email reveals
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-zinc-900 font-medium">
                    3/day
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-zinc-900 font-medium">
                    Unlimited
                  </td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    Email delivery
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-emerald-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-emerald-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    Slack integration
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-zinc-300 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-emerald-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="px-6 py-4 text-sm text-zinc-700">Webhooks</td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-zinc-300 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-emerald-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    CSV exports
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-zinc-300 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-emerald-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    API access
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-zinc-300 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-emerald-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    Advanced filters
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-zinc-300 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg
                      className="h-5 w-5 text-emerald-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="px-6 py-4 text-sm text-zinc-700">Support</td>
                  <td className="px-6 py-4 text-center text-sm text-zinc-600">
                    Basic
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-zinc-900 font-medium">
                    Priority
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-zinc-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-12 text-center shadow-2xl max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to accelerate your growth?
          </h2>
          <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
            Join hundreds of teams using OpenInfo to find high-quality leads with
            intent-based prospecting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleUpgrade(billingPeriod)}
              disabled={loading || currentPlan === 'pro'}
              className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-lg font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentPlan === 'pro'
                ? "You're on Pro!"
                : loading
                  ? 'Processing...'
                  : 'Start Free Trial'}
            </button>
            <a
              href="mailto:sales@openinfo.com"
              className="text-white hover:text-emerald-50 underline text-sm font-medium transition-colors"
            >
              Contact sales for enterprise
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
