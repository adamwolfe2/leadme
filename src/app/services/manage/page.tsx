'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, CreditCard, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface ServiceSubscription {
  id: string
  status: string
  monthly_price: number
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  onboarding_completed: boolean
  created_at: string
}

interface ServiceTier {
  id: string
  slug: string
  name: string
  description: string
  features: string[]
  platform_features: any
}

interface Delivery {
  id: string
  delivery_type: string
  status: string
  delivery_period_start: string
  delivery_period_end: string
  delivered_at: string | null
}

export default function ManageServicePage() {
  const [subscription, setSubscription] = useState<ServiceSubscription | null>(null)
  const [tier, setTier] = useState<ServiceTier | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    try {
      const response = await fetch('/api/services/subscription')
      if (!response.ok) throw new Error('Failed to fetch subscription')

      const data = await response.json()

      if (data.has_subscription) {
        setSubscription(data.subscription)
        setTier(data.tier)
        setDeliveries(data.recent_deliveries || [])
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      toast.error('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!subscription || !tier) {
    return (
      <div className="min-h-screen bg-zinc-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl border border-zinc-200 p-12">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-zinc-100 rounded-full mb-6">
              <Package className="h-8 w-8 text-zinc-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              No Active Subscription
            </h1>
            <p className="text-zinc-600 mb-8">
              You don't have an active service subscription yet. Explore our service tiers to get started.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = {
    active: { label: 'Active', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
    pending_payment: { label: 'Pending', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
    onboarding: { label: 'Onboarding', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Clock },
    paused: { label: 'Paused', color: 'text-zinc-700 bg-zinc-50 border-zinc-200', icon: AlertCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertCircle },
  }

  const currentStatus = statusConfig[subscription.status as keyof typeof statusConfig] || statusConfig.active
  const StatusIcon = currentStatus.icon

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Manage Subscription
          </h1>
          <p className="text-zinc-600">
            View and manage your {tier.name} subscription
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1">
                {tier.name}
              </h2>
              <p className="text-zinc-600">{tier.description}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${currentStatus.color}`}>
              <StatusIcon className="h-4 w-4" />
              {currentStatus.label}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-zinc-200">
            <div>
              <p className="text-sm text-zinc-600 mb-1">Monthly Price</p>
              <p className="text-2xl font-bold text-zinc-900">
                ${subscription.monthly_price.toLocaleString()}
                <span className="text-base font-normal text-zinc-600">/mo</span>
              </p>
            </div>

            {subscription.current_period_end && (
              <div>
                <p className="text-sm text-zinc-600 mb-1">
                  {subscription.cancel_at_period_end ? 'Access Until' : 'Next Billing Date'}
                </p>
                <p className="text-lg font-semibold text-zinc-900">
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Your Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tier.features.slice(0, 6).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-zinc-700">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Deliveries */}
        {deliveries.length > 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Recent Deliveries</h2>
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-zinc-200"
                >
                  <div>
                    <p className="font-medium text-zinc-900 capitalize">
                      {delivery.delivery_type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {new Date(delivery.delivery_period_start).toLocaleDateString()} - {new Date(delivery.delivery_period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    delivery.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-zinc-100 text-zinc-700'
                  }`}>
                    {delivery.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Manage Subscription</h2>
          <div className="space-y-3">
            <Link
              href={`/services/${tier.slug}`}
              className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-zinc-600 group-hover:text-blue-600 transition-colors" />
                <div>
                  <p className="font-medium text-zinc-900">View Service Details</p>
                  <p className="text-sm text-zinc-600">Learn more about {tier.name}</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-zinc-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/settings/billing"
              className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-zinc-600 group-hover:text-blue-600 transition-colors" />
                <div>
                  <p className="font-medium text-zinc-900">Payment Method</p>
                  <p className="text-sm text-zinc-600">Update billing details</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-zinc-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/services/contact"
              className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-zinc-600 group-hover:text-blue-600 transition-colors" />
                <div>
                  <p className="font-medium text-zinc-900">Contact Support</p>
                  <p className="text-sm text-zinc-600">Get help from our team</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-zinc-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
