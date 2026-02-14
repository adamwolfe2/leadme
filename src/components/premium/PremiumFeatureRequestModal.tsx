'use client'

/**
 * Premium Feature Request Modal
 * Modal form for users to request access to premium features
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { FeatureType, ContactPreference } from '@/types/premium'
import { PREMIUM_FEATURES } from '@/types/premium'

interface PremiumFeatureRequestModalProps {
  isOpen: boolean
  onClose: () => void
  featureType: FeatureType
  featureTitle: string
}

export function PremiumFeatureRequestModal({
  isOpen,
  onClose,
  featureType,
  featureTitle,
}: PremiumFeatureRequestModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    use_case: '',
    expected_volume: '',
    budget_range: '',
    contact_preference: 'email' as ContactPreference,
  })

  if (!isOpen) return null

  const feature = PREMIUM_FEATURES[featureType]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/premium/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature_type: featureType,
          title: formData.title || `Request access to ${featureTitle}`,
          description: formData.description,
          use_case: formData.use_case,
          expected_volume: formData.expected_volume,
          budget_range: formData.budget_range,
          contact_preference: formData.contact_preference,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      toast.success('Request Submitted!', {
        description: 'Our team will reach out to you within 24 hours.',
        duration: 5000,
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        use_case: '',
        expected_volume: '',
        budget_range: '',
        contact_preference: 'email',
      })

      // Close modal
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error('Failed to submit request', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{feature.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Request Access
              </h2>
              <p className="text-sm text-zinc-600">{featureTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-100 transition-colors"
          >
            <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Feature Description */}
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
            <p className="text-sm text-zinc-700">{feature.description}</p>
          </div>

          {/* Title (Optional - auto-generated) */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">
              Request Title <span className="text-zinc-400">(optional)</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={`Request access to ${featureTitle}`}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={200}
            />
          </div>

          {/* Use Case (Most Important) */}
          <div>
            <label htmlFor="use_case" className="block text-sm font-medium text-zinc-700 mb-1">
              Tell us about your use case <span className="text-red-500">*</span>
            </label>
            <textarea
              id="use_case"
              value={formData.use_case}
              onChange={(e) => setFormData({ ...formData, use_case: e.target.value })}
              placeholder="How do you plan to use this feature? What problem are you trying to solve?"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={4}
              required
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-zinc-500">
              The more details you provide, the faster we can help you!
            </p>
          </div>

          {/* Expected Volume */}
          <div>
            <label htmlFor="expected_volume" className="block text-sm font-medium text-zinc-700 mb-1">
              Expected volume <span className="text-zinc-400">(optional)</span>
            </label>
            <input
              type="text"
              id="expected_volume"
              value={formData.expected_volume}
              onChange={(e) => setFormData({ ...formData, expected_volume: e.target.value })}
              placeholder="e.g., 10,000 leads/month, 50k website visitors, etc."
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={200}
            />
          </div>

          {/* Budget Range */}
          <div>
            <label htmlFor="budget_range" className="block text-sm font-medium text-zinc-700 mb-1">
              Budget range <span className="text-zinc-400">(optional)</span>
            </label>
            <select
              id="budget_range"
              value={formData.budget_range}
              onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a range...</option>
              <option value="<$500/mo">Less than $500/month</option>
              <option value="$500-$1k/mo">$500 - $1,000/month</option>
              <option value="$1k-$2.5k/mo">$1,000 - $2,500/month</option>
              <option value="$2.5k-$5k/mo">$2,500 - $5,000/month</option>
              <option value="$5k+/mo">$5,000+/month</option>
              <option value="custom">Custom/Enterprise</option>
            </select>
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              How would you like us to reach out?
            </label>
            <div className="space-y-2">
              {[
                { value: 'email', label: 'Email me', icon: '📧' },
                { value: 'call', label: 'Schedule a call', icon: '📞' },
                { value: 'slack', label: 'Slack message (if connected)', icon: '💬' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 rounded-lg border border-zinc-300 p-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <input
                    type="radio"
                    name="contact_preference"
                    value={option.value}
                    checked={formData.contact_preference === option.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_preference: e.target.value as ContactPreference,
                      })
                    }
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium text-zinc-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
              Additional notes <span className="text-zinc-400">(optional)</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Anything else we should know?"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.use_case}
              className="bg-primary hover:bg-primary/90"
            >
              {submitting ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
