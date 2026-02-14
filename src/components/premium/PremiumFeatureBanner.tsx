'use client'

/**
 * Premium Feature Banner Component
 * Shows an upsell banner for locked premium features
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PremiumFeatureRequestModal } from './PremiumFeatureRequestModal'
import type { FeatureType } from '@/types/premium'

interface PremiumFeatureBannerProps {
  feature: FeatureType
  title: string
  description: string
  icon?: string
  benefits?: string[]
  className?: string
}

export function PremiumFeatureBanner({
  feature,
  title,
  description,
  icon = '🔒',
  benefits = [],
  className = '',
}: PremiumFeatureBannerProps) {
  const [showRequestModal, setShowRequestModal] = useState(false)

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 ${className}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
                {icon}
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Premium Feature
              </div>

              <h3 className="text-2xl font-bold text-zinc-900 mb-2">
                {title}
              </h3>

              <p className="text-zinc-600 mb-4 max-w-2xl">
                {description}
              </p>

              {/* Benefits */}
              {benefits.length > 0 && (
                <ul className="mb-6 space-y-2">
                  {benefits.slice(0, 4).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-zinc-700">
                      <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA Button */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowRequestModal(true)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                >
                  Request Access
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>

                <p className="text-sm text-zinc-500">
                  Talk to our team to unlock this feature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <PremiumFeatureRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        featureType={feature}
        featureTitle={title}
      />
    </>
  )
}

// Pre-configured banner components for each feature
export function PixelFeatureBanner({ className }: { className?: string }) {
  return (
    <PremiumFeatureBanner
      feature="pixel"
      title="AudienceLab Pixel Tracking"
      description="Track your own website visitors and automatically convert them into enriched leads with contact information."
      icon="🎯"
      benefits={[
        'Track unlimited website visitors in real-time',
        'Identify anonymous visitors with 40%+ match rate',
        'Auto-enrich with email, phone, LinkedIn, and more',
        'Custom tracking events and conversion funnels',
        'Real-time Slack notifications for hot leads',
      ]}
      className={className}
    />
  )
}

export function WhitelabelFeatureBanner({ className }: { className?: string }) {
  return (
    <PremiumFeatureBanner
      feature="whitelabel"
      title="White-Label Branding"
      description="Remove Cursive branding and present the platform as your own with custom colors, logo, and domain."
      icon="🎨"
      benefits={[
        'Remove all "Powered by Cursive" branding',
        'Custom colors matching your brand identity',
        'Your logo in the dashboard and emails',
        'Custom domain (leads.yourdomain.com)',
        'Branded PDF exports and reports',
      ]}
      className={className}
    />
  )
}

export function ExtraDataFeatureBanner({ className }: { className?: string }) {
  return (
    <PremiumFeatureBanner
      feature="extra_data"
      title="Premium Audience Data"
      description="Access 10x more leads from premium data sources with advanced filtering and targeting options."
      icon="📊"
      benefits={[
        '10x higher monthly lead capacity',
        'Premium B2B data sources and partnerships',
        'Advanced intent signals and buying signals',
        'Technographic and firmographic data',
        'Industry-specific data feeds',
      ]}
      className={className}
    />
  )
}

export function OutboundFeatureBanner({ className }: { className?: string }) {
  return (
    <PremiumFeatureBanner
      feature="outbound"
      title="Automated Outbound Campaigns"
      description="Send personalized email sequences to your leads with AI-powered personalization and reply detection."
      icon="📧"
      benefits={[
        'Multi-step email sequences (3-7 touches)',
        'AI-powered personalization per lead',
        'A/B testing for subject lines and content',
        'Automatic reply detection and notifications',
        'Native CRM integration (HubSpot, Salesforce)',
      ]}
      className={className}
    />
  )
}
