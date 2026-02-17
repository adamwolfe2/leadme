'use client'

import { useState } from 'react'
import { useToast } from '@/lib/hooks/use-toast'

interface PremiumFeatureRequestProps {
  featureType: 'pixel' | 'more_leads' | 'email_campaign' | 'custom_integration' | 'lead_routing' | 'white_label' | 'api_access' | 'priority_support' | 'custom_feature'
  featureTitle: string
  featureDescription: string
  featureIcon?: React.ReactNode
  defaultTitle?: string
  defaultDescription?: string
  requestData?: Record<string, unknown>
  fields?: Array<{
    name: string
    label: string
    type: 'text' | 'url' | 'email' | 'number' | 'textarea'
    placeholder?: string
    required?: boolean
  }>
  onSuccess?: () => void
}

export function PremiumFeatureRequest({
  featureType,
  featureTitle,
  featureDescription,
  featureIcon,
  defaultTitle,
  defaultDescription,
  requestData = {},
  fields = [],
  onSuccess,
}: PremiumFeatureRequestProps) {
  const toast = useToast()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [description, setDescription] = useState(defaultDescription || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.name]) {
        toast.error(`${field.label} is required`)
        return
      }
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/features/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_type: featureType,
          request_title: defaultTitle || `${featureTitle} Request`,
          request_description: description,
          request_data: {
            ...requestData,
            ...formData,
          },
          priority: 'normal',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit request')
      }

      toast.success('Request submitted! Our team will contact you within 24-48 hours.')

      // Reset form
      setFormData({})
      setDescription('')

      // Call success callback
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Premium Feature Badge */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {featureIcon || (
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Premium Feature: {featureTitle}</h3>
            <p className="text-sm text-zinc-600">{featureDescription}</p>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">Request {featureTitle}</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Submit your request below and our team will contact you within 24-48 hours.
        </p>

        <div className="space-y-4 max-w-lg">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  className="block w-full rounded-lg border-zinc-300 shadow-sm focus:border-primary focus:ring-primary"
                  rows={3}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                />
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="block w-full rounded-lg border-zinc-300 shadow-sm focus:border-primary focus:ring-primary"
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                />
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Additional Details <span className="text-zinc-400">(optional)</span>
            </label>
            <textarea
              placeholder="Any specific requirements or questions?"
              className="block w-full rounded-lg border-zinc-300 shadow-sm focus:border-primary focus:ring-primary"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {submitting ? 'Submitting Request...' : `Request ${featureTitle}`}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-primary">Need Help?</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Use the chat widget in the bottom-right corner to speak with our team directly. We&apos;re here to help!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
