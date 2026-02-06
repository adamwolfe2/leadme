// CRM Leads Page - Twenty CRM Inspired
// Updated with professional three-column layout and view switching

import { QueryProvider } from '@/components/providers/query-provider'
import { LeadsPageClient } from './components/LeadsPageClient'
import { getCurrentUser } from '@/lib/auth/helpers'
import { CRMLeadRepository } from '@/lib/repositories/crm-lead.repository'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Leads - CRM',
  description: 'Manage your sales leads and contacts',
}

interface CRMLeadsPageProps {
  searchParams: Promise<{ page?: string; per_page?: string }>
}

export default async function CRMLeadsPage({ searchParams }: CRMLeadsPageProps) {
  // Fetch current user
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const perPage = Math.max(1, Math.min(100, parseInt(params.per_page || '50', 10) || 50))

  // Fetch paginated leads data
  const leadRepo = new CRMLeadRepository()
  const { leads, total } = await leadRepo.findByWorkspace(user.workspace_id, {
    page,
    pageSize: perPage,
  })

  return (
    <QueryProvider>
      <LeadsPageClient
        initialData={leads}
        currentPage={page}
        perPage={perPage}
        totalCount={total}
      />
    </QueryProvider>
  )
}
