/**
 * Partner Tier Overview Component
 * Displays all partner tiers with benefits, highlighting the current tier.
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { PARTNER_TIERS, getPartnerTier } from '@/lib/services/partner-tier.service'
import { cn } from '@/lib/design-system'

interface PartnerTierOverviewProps {
  totalLeads: number
}

/** Benefits displayed for each tier */
const TIER_BENEFITS: Record<string, string[]> = {
  Bronze: [
    'Access to lead marketplace',
    '30% commission on every sale',
    'Basic upload tools',
    'Standard support',
  ],
  Silver: [
    'Everything in Bronze',
    '35% commission on every sale',
    'Priority lead review',
    'Bulk upload tools',
    'Email support',
  ],
  Gold: [
    'Everything in Silver',
    '40% commission on every sale',
    'Dedicated account manager',
    'Advanced analytics',
    'Priority payouts',
    'Custom integrations',
  ],
}

export function PartnerTierOverview({ totalLeads }: PartnerTierOverviewProps) {
  const currentTier = getPartnerTier(totalLeads)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Partner Tiers</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload more leads to unlock higher commission rates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PARTNER_TIERS.map((tier) => {
          const TierIcon = tier.icon
          const isCurrent = tier.name === currentTier.name
          const isLocked =
            PARTNER_TIERS.indexOf(tier) > PARTNER_TIERS.indexOf(currentTier)
          const benefits = TIER_BENEFITS[tier.name] || []

          return (
            <Card
              key={tier.name}
              className={cn(
                'relative overflow-hidden transition-all duration-200',
                isCurrent
                  ? `border-2 ${tier.color.border} shadow-md`
                  : 'border border-border',
                isLocked && 'opacity-75'
              )}
            >
              {/* Subtle gradient overlay for current tier */}
              {isCurrent && (
                <div
                  className={cn(
                    'absolute inset-0 opacity-[0.03] bg-gradient-to-br',
                    tier.color.gradient
                  )}
                />
              )}

              <CardContent className="relative p-6 space-y-4">
                {/* Tier Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        tier.color.bg
                      )}
                    >
                      <TierIcon className={cn('h-5 w-5', tier.color.text)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tier.maxLeads !== null
                          ? `${tier.minLeads.toLocaleString()} - ${tier.maxLeads.toLocaleString()} leads`
                          : `${tier.minLeads.toLocaleString()}+ leads`}
                      </p>
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge
                      className={cn(
                        'font-semibold',
                        tier.color.bg,
                        tier.color.text
                      )}
                    >
                      Current
                    </Badge>
                  )}
                </div>

                {/* Commission Rate */}
                <div className="pt-2 border-t border-border">
                  <p className="text-3xl font-bold">
                    {Math.round(tier.commissionRate * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    commission per sale
                  </p>
                </div>

                {/* Benefits List */}
                <ul className="space-y-2 pt-2">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 mt-0.5 shrink-0',
                          isCurrent ? tier.color.text : 'text-muted-foreground'
                        )}
                      />
                      <span
                        className={
                          isLocked
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                        }
                      >
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
