// CRM Leads Page
// Main CRM page for viewing and managing leads

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CRMLeadRepository } from '@/lib/repositories/crm-lead.repository'
import { LeadsDataTable } from './components/LeadsDataTable'
import { Skeleton } from '@/components/ui/skeleton'
import type { LeadFilters } from '@/types/crm.types'

export const metadata = {
  title: 'Leads - CRM',
  description: 'Manage your leads and contacts',
}

async function getLeadsData(workspaceId: string) {
  const repo = new CRMLeadRepository()

  // Default filters for initial load
  const filters: LeadFilters = {
    page: 1,
    pageSize: 20,
    orderBy: 'created_at',
    orderDirection: 'desc',
  }

  const { leads, total } = await repo.findByWorkspace(workspaceId, filters)
  const pageCount = Math.ceil(total / filters.pageSize)

  return { leads, total, pageCount }
}

export default async function CRMLeadsPage() {
  const supabase = await createClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's workspace
  const { data: userData } = await supabase
    .from('users')
    .select('workspace_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!userData?.workspace_id) {
    redirect('/onboarding')
  }

  // Fetch leads data
  const { leads, total, pageCount } = await getLeadsData(userData.workspace_id)

  return (
    <div className="flex h-screen">
      {/* CRM Sidebar - TODO: Build in Week 2 */}
      <aside className="w-64 border-r bg-muted/10">
        <div className="p-6">
          <h2 className="text-xl font-semibold">CRM</h2>
          <nav className="mt-6 space-y-2">
            <div className="px-3 py-2 bg-background rounded-md font-medium">
              Leads
            </div>
            <div className="px-3 py-2 text-muted-foreground hover:bg-muted/50 rounded-md cursor-pointer">
              Companies
            </div>
            <div className="px-3 py-2 text-muted-foreground hover:bg-muted/50 rounded-md cursor-pointer">
              Contacts
            </div>
            <div className="px-3 py-2 text-muted-foreground hover:bg-muted/50 rounded-md cursor-pointer">
              Deals
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Leads</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your sales leads and contacts
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* TODO: Add filter dropdowns and actions */}
                <p className="text-sm text-muted-foreground">
                  {total} total leads
                </p>
              </div>
            </div>
          </header>

          {/* Table */}
          <div className="flex-1 p-6 overflow-hidden">
            <Suspense fallback={<TableSkeleton />}>
              <LeadsDataTable
                data={leads}
                totalCount={total}
                pageCount={pageCount}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="h-10 border-b flex items-center gap-4 px-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-32" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 border-b flex items-center gap-4 px-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
