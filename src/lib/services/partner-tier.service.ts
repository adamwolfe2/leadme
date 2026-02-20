/**
 * Partner Tier Service
 * Defines partner tier levels based on total leads uploaded.
 * Tiers escalate commission rates to reward high-volume partners.
 */

import type { LucideIcon } from 'lucide-react'
import { Shield, Award, Crown } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PartnerTier {
  name: 'Bronze' | 'Silver' | 'Gold'
  minLeads: number
  maxLeads: number | null // null = unlimited (Gold)
  commissionRate: number  // e.g. 0.30 for 30%
  color: {
    bg: string       // Background class for badges/cards
    text: string     // Text color class
    border: string   // Border color class
    gradient: string // Gradient for progress bar / accents
    ring: string     // Ring/outline for highlighted state
  }
  icon: LucideIcon
}

export interface TierProgress {
  currentTier: PartnerTier
  nextTier: PartnerTier | null
  progress: number         // 0-100 percentage toward next tier
  leadsToNextTier: number  // leads remaining to reach next tier (0 if Gold)
}

// ---------------------------------------------------------------------------
// Tier Configuration
// ---------------------------------------------------------------------------

export const PARTNER_TIERS: PartnerTier[] = [
  {
    name: 'Bronze',
    minLeads: 0,
    maxLeads: 999,
    commissionRate: 0.30,
    color: {
      bg: 'bg-zinc-100',
      text: 'text-zinc-700',
      border: 'border-zinc-300',
      gradient: 'from-zinc-400 to-zinc-500',
      ring: 'ring-zinc-300',
    },
    icon: Shield,
  },
  {
    name: 'Silver',
    minLeads: 1000,
    maxLeads: 4999,
    commissionRate: 0.35,
    color: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-400',
      gradient: 'from-slate-400 to-blue-400',
      ring: 'ring-slate-400',
    },
    icon: Award,
  },
  {
    name: 'Gold',
    minLeads: 5000,
    maxLeads: null,
    commissionRate: 0.40,
    color: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-400',
      gradient: 'from-amber-400 to-yellow-400',
      ring: 'ring-amber-400',
    },
    icon: Crown,
  },
]

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Get the partner tier for a given total leads count.
 */
export function getPartnerTier(totalLeads: number): PartnerTier {
  const leads = Math.max(0, totalLeads)

  // Iterate in reverse to match the highest qualifying tier first
  for (let i = PARTNER_TIERS.length - 1; i >= 0; i--) {
    if (leads >= PARTNER_TIERS[i].minLeads) {
      return PARTNER_TIERS[i]
    }
  }

  // Fallback (should never happen since Bronze starts at 0)
  return PARTNER_TIERS[0]
}

/**
 * Get the next tier above the current one, or null if already at Gold.
 */
export function getNextTier(totalLeads: number): PartnerTier | null {
  const current = getPartnerTier(totalLeads)
  const currentIndex = PARTNER_TIERS.findIndex((t) => t.name === current.name)

  if (currentIndex < PARTNER_TIERS.length - 1) {
    return PARTNER_TIERS[currentIndex + 1]
  }

  return null
}

/**
 * Get full tier progress information including percentage toward next tier.
 */
export function getTierProgress(totalLeads: number): TierProgress {
  const leads = Math.max(0, totalLeads)
  const currentTier = getPartnerTier(leads)
  const nextTier = getNextTier(leads)

  if (!nextTier) {
    // Already at Gold tier
    return {
      currentTier,
      nextTier: null,
      progress: 100,
      leadsToNextTier: 0,
    }
  }

  // Calculate progress within the current tier range
  const tierRange = nextTier.minLeads - currentTier.minLeads
  const leadsIntoTier = leads - currentTier.minLeads
  const progress = Math.min(Math.round((leadsIntoTier / tierRange) * 100), 100)
  const leadsToNextTier = nextTier.minLeads - leads

  return {
    currentTier,
    nextTier,
    progress,
    leadsToNextTier,
  }
}
