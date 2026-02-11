'use client'

import { FeatureGate } from '@/components/billing/feature-gate'

export default function CRMPage() {
  return (
    <FeatureGate
      featureName="CRM"
      comingSoon
      featureDescription="Manage your leads, companies, contacts, and deals all in one place. Our CRM is being built to integrate directly with your lead pipeline."
    >
      <div />
    </FeatureGate>
  )
}
