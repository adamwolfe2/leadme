/**
 * Partner Stats Cards Component
 * Displays key performance metrics for partners, including partner tier status.
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, Upload, ShoppingCart, Sparkles } from 'lucide-react'
import { getTierProgress } from '@/lib/services/partner-tier.service'
import { cn } from '@/lib/design-system'

interface StatsCardsProps {
  analytics: {
    total_leads_uploaded: number
    leads_sold: number
    total_revenue: number
    conversion_rate_percent: number | null
  } | null
  credits: {
    balance: number
    total_earned: number
    total_withdrawn: number
  } | null
}

export function StatsCards({ analytics, credits }: StatsCardsProps) {
  const totalLeads = analytics?.total_leads_uploaded || 0
  const tierProgress = getTierProgress(totalLeads)
  const { currentTier, nextTier, progress, leadsToNextTier } = tierProgress
  const TierIcon = currentTier.icon

  const stats = [
    {
      title: 'Leads Uploaded',
      value: analytics?.total_leads_uploaded || 0,
      icon: Upload,
      description: 'Total leads in marketplace',
      color: 'text-blue-500',
    },
    {
      title: 'Leads Sold',
      value: analytics?.leads_sold || 0,
      icon: ShoppingCart,
      description: 'Purchased by businesses',
      color: 'text-green-500',
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics?.total_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      description: 'Lifetime earnings',
      color: 'text-emerald-500',
    },
    {
      title: 'Current Balance',
      value: `$${(credits?.balance || 0).toFixed(2)}`,
      icon: TrendingUp,
      description: 'Available for withdrawal',
      color: 'text-blue-500',
    },
  ]

  const isGold = currentTier.name === 'Gold'

  return (
    <div className="space-y-6">
      {/* Tier Status Card */}
      <Card
        className={cn(
          'relative overflow-hidden border-2 transition-all duration-200',
          currentTier.color.border
        )}
      >
        <div
          className={cn(
            'absolute inset-0 opacity-[0.04] bg-gradient-to-br',
            currentTier.color.gradient
          )}
        />
        <CardContent className="relative p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Tier Info */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-xl',
                  currentTier.color.bg
                )}
              >
                <TierIcon className={cn('h-7 w-7', currentTier.color.text)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Partner Tier</h3>
                  <Badge
                    className={cn(
                      'font-semibold',
                      currentTier.color.bg,
                      currentTier.color.text
                    )}
                  >
                    {currentTier.name}
                  </Badge>
                </div>
                <p className="text-2xl font-bold mt-0.5">
                  {Math.round(currentTier.commissionRate * 100)}% per sale
                </p>
              </div>
            </div>

            {/* Right: Progress or Gold celebration */}
            <div className="w-full sm:w-72 sm:text-right">
              {isGold ? (
                <div className="flex items-center gap-2 sm:justify-end">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">
                    Top Partner — Maximum Commission
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Progress to {nextTier?.name}
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                        nextTier
                          ? nextTier.color.gradient
                          : currentTier.color.gradient
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {leadsToNextTier.toLocaleString()} more lead
                    {leadsToNextTier !== 1 ? 's' : ''} to reach{' '}
                    <span className="font-medium">{nextTier?.name}</span> (
                    {nextTier
                      ? `${Math.round(nextTier.commissionRate * 100)}% commission`
                      : ''}
                    )
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="glass-card hover:shadow-lg transition-all duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                {stat.title === 'Leads Sold' &&
                  analytics &&
                  analytics.total_leads_uploaded > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {(analytics.conversion_rate_percent || 0).toFixed(1)}%
                      conversion rate
                    </p>
                  )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
