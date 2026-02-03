'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useFeature } from '@/lib/hooks/use-tier'
import type { ProductTierFeatures } from '@/types'

interface FeatureLockProps {
  feature: keyof ProductTierFeatures
  requiredTier?: string
  requiredTierSlug?: string
  children: ReactNode
  fallback?: ReactNode
  showBlur?: boolean
}

/**
 * FeatureLock Component
 *
 * Blocks access to features based on tier, showing an upgrade prompt.
 *
 * @example
 * <FeatureLock feature="campaigns" requiredTier="Cursive Outbound" requiredTierSlug="cursive-outbound">
 *   <CampaignBuilder />
 * </FeatureLock>
 */
export function FeatureLock({
  feature,
  requiredTier = 'Pro',
  requiredTierSlug = 'pro',
  children,
  fallback,
  showBlur = true
}: FeatureLockProps) {
  const { hasAccess, isLoading } = useFeature(feature)

  // Show loading state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-zinc-100 rounded-lg" />
      </div>
    )
  }

  // User has access - show the feature
  if (hasAccess) {
    return <>{children}</>
  }

  // User doesn't have access - show lock screen
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      {showBlur && (
        <div className="blur-sm pointer-events-none opacity-50 select-none">
          {children}
        </div>
      )}

      {/* Lock overlay */}
      <div className={`${showBlur ? 'absolute inset-0' : ''} flex items-center justify-center p-8`}>
        <div className="max-w-md w-full bg-white rounded-xl border-2 border-zinc-200 shadow-lg p-8 text-center">
          {/* Lock icon */}
          <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>

          {/* Heading */}
          <h3 className="text-xl font-bold text-zinc-900 mb-2">
            Upgrade to {requiredTier}
          </h3>

          {/* Description */}
          <p className="text-zinc-600 mb-6">
            This feature requires an active {requiredTier} subscription. Unlock this and more with an upgrade.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/services/${requiredTierSlug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-zinc-300 hover:border-zinc-400 text-zinc-700 font-medium rounded-lg transition-colors"
            >
              Compare Plans
            </Link>
          </div>

          {/* Feature list */}
          <div className="mt-6 pt-6 border-t border-zinc-200 text-left">
            <p className="text-sm font-medium text-zinc-900 mb-3">
              {requiredTier} includes:
            </p>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Full feature access</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Dedicated support</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>30-day money-back guarantee</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline feature lock (no blur, just a banner)
 */
export function InlineFeatureLock({
  feature,
  requiredTier = 'Pro',
  requiredTierSlug = 'pro',
}: {
  feature: keyof ProductTierFeatures
  requiredTier?: string
  requiredTierSlug?: string
}) {
  const { hasAccess } = useFeature(feature)

  if (hasAccess) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">
            Upgrade Required
          </h3>
          <p className="text-sm text-zinc-600 mb-4">
            This feature requires {requiredTier}. Unlock it now to get started.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/services/${requiredTierSlug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              View {requiredTier}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 hover:border-zinc-400 text-zinc-700 font-medium rounded-lg transition-colors text-sm"
            >
              Compare All Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
