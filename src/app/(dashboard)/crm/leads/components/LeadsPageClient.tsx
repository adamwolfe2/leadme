'use client'

import { useState } from 'react'
import { TwentyStyleTable } from '@/components/crm/table/TwentyStyleTable'
import { RecordDrawer } from '@/components/crm/drawer/RecordDrawer'
import { formatDistanceToNow } from 'date-fns'
import type { LeadTableRow } from '@/types/crm.types'

interface LeadsPageClientProps {
  initialData: LeadTableRow[]
}

export function LeadsPageClient({ initialData }: LeadsPageClientProps) {
  const [leads] = useState<LeadTableRow[]>(initialData)
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleRowClick = (lead: LeadTableRow) => {
    setSelectedLead(lead.id)
    setDrawerOpen(true)
  }

  const selectedLeadData = leads.find((l) => l.id === selectedLead)

  return (
    <div className="flex h-full flex-col">
      {/* Twenty.com style table */}
      <TwentyStyleTable data={leads} onRowClick={handleRowClick} />

      {/* Record Drawer */}
      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          selectedLeadData
            ? [selectedLeadData.first_name, selectedLeadData.last_name].filter(Boolean).join(' ') || 'Unnamed Lead'
            : ''
        }
        subtitle={selectedLeadData?.company_name}
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Contact Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Email: </span>
                <span className="text-sm text-gray-900">{selectedLeadData?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Phone: </span>
                <span className="text-sm text-gray-900">{selectedLeadData?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Company: </span>
                <span className="text-sm text-gray-900">{selectedLeadData?.company_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">State: </span>
                <span className="text-sm text-gray-900">{selectedLeadData?.state || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Lead Details</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Status: </span>
                {selectedLeadData?.status && (
                  <span className="ml-2 text-sm text-gray-900">
                    {selectedLeadData.status.charAt(0).toUpperCase() + selectedLeadData.status.slice(1)}
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm text-gray-500">Assigned: </span>
                <span className="text-sm text-gray-900">
                  {selectedLeadData?.assigned_user?.full_name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Created: </span>
                <span className="text-sm text-gray-900">
                  {selectedLeadData && formatDistanceToNow(new Date(selectedLeadData.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </RecordDrawer>
    </div>
  )
}
