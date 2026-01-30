// CRM Deals Page - Twenty CRM Inspired
// Professional three-column layout with view switching

import { QueryProvider } from '@/components/providers/query-provider'
import { DealsPageClient } from './components/DealsPageClient'
import { getCurrentUser } from '@/lib/auth/helpers'
import { DealRepository } from '@/lib/repositories/deal.repository'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Deals - CRM',
  description: 'Manage your deals and sales pipeline',
}

export default async function CRMDealsPage() {
  // Fetch current user
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial deals data
  const dealRepo = new DealRepository()
  const initialData = await dealRepo.findByWorkspace(user.workspace_id, undefined, undefined, 1, 100)

  return (
    <QueryProvider>
      <DealsPageClient initialData={initialData.data} />
    </QueryProvider>
  )
}
