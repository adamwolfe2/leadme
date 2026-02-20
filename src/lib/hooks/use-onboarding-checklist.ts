'use client'

import { useQuery } from '@tanstack/react-query'
import type { ChecklistItem } from '@/app/api/onboarding/checklist/route'

interface ChecklistResponse {
  items: ChecklistItem[]
}

async function fetchChecklist(): Promise<ChecklistResponse> {
  const res = await fetch('/api/onboarding/checklist')
  if (!res.ok) {
    throw new Error('Failed to fetch onboarding checklist')
  }
  return res.json()
}

export function useOnboardingChecklist() {
  return useQuery({
    queryKey: ['onboarding-checklist'],
    queryFn: fetchChecklist,
    staleTime: 30_000,
  })
}
