'use client'

import { useState } from 'react'
import { EnhancedCompaniesTable } from '@/components/crm/table/EnhancedCompaniesTable'
import { RecordDrawer } from '@/components/crm/drawer/RecordDrawer'
import { CreateCompanyDialog } from './CreateCompanyDialog'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import type { Company } from '@/types/crm.types'

interface CompaniesPageClientProps {
  initialData: Company[]
}

export function CompaniesPageClient({ initialData }: CompaniesPageClientProps) {
  const router = useRouter()
  const [companies] = useState<Company[]>(initialData)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleRowClick = (company: Company) => {
    setSelectedCompany(company.id)
    setDrawerOpen(true)
  }

  const handleCreateClick = () => {
    setCreateDialogOpen(true)
  }

  const handleDialogClose = (created: boolean) => {
    setCreateDialogOpen(false)
    if (created) {
      router.refresh()
    }
  }

  const selectedCompanyData = companies.find((c) => c.id === selectedCompany)

  return (
    <div className="flex h-full flex-col p-6">
      {/* Enhanced square-ui inspired table */}
      <EnhancedCompaniesTable
        data={companies}
        onRowClick={handleRowClick}
        onCreateClick={handleCreateClick}
      />

      {/* Create Company Dialog */}
      <CreateCompanyDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDialogClose(false)
          else setCreateDialogOpen(true)
        }}
      />

      {/* Record Drawer */}
      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedCompanyData?.name || ''}
        subtitle={selectedCompanyData?.industry || undefined}
      >
        <div className="space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Company Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Industry</span>
                <span className="text-sm text-gray-900">
                  {selectedCompanyData?.industry || '-'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Website</span>
                {selectedCompanyData?.website ? (
                  <a
                    href={selectedCompanyData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedCompanyData.website}
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Employees</span>
                <span className="text-sm text-gray-900">
                  {selectedCompanyData?.employees_range || '-'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Revenue</span>
                <span className="text-sm text-gray-900">
                  {selectedCompanyData?.revenue_range || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Metadata
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Status</span>
                <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {selectedCompanyData?.status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Created</span>
                <span className="text-sm text-gray-900">
                  {selectedCompanyData &&
                    formatDistanceToNow(new Date(selectedCompanyData.created_at), {
                      addSuffix: true,
                    })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </RecordDrawer>
    </div>
  )
}
