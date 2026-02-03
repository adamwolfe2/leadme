'use client'

import { useFeature } from '@/lib/hooks/use-tier'
import { InlineFeatureLock } from '@/components/gates/FeatureLock'
import { ReactNode } from 'react'

interface AgentsListWrapperProps {
  children: ReactNode
}

export function AgentsListWrapper({ children }: AgentsListWrapperProps) {
  const { hasAccess, isLoading } = useFeature('ai_agents')

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-zinc-200 rounded-lg" />
        <div className="h-64 bg-zinc-200 rounded-lg" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <>
        <InlineFeatureLock
          feature="ai_agents"
          requiredTier="Cursive Pipeline"
          requiredTierSlug="cursive-pipeline"
        />
        <div className="opacity-50 pointer-events-none blur-sm">
          {children}
        </div>
      </>
    )
  }

  return <>{children}</>
}
