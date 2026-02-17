/**
 * Partner Stats Cards Component
 * Displays key performance metrics for partners
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Upload, ShoppingCart } from 'lucide-react'

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

  return (
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
  )
}
