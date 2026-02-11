'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy onboarding page — redirects to /welcome.
 *
 * The old onboarding flow created workspaces without granting free credits.
 * The /welcome flow (/api/onboarding/setup) handles workspace creation,
 * credit grants, and Slack notifications properly.
 */
export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/welcome')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  )
}
