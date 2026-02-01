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
          {/* Contact Information */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Email</span>
                <a
                  href={`mailto:${selectedLeadData?.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {selectedLeadData?.email || '-'}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Phone</span>
                <a
                  href={`tel:${selectedLeadData?.phone}`}
                  className="text-sm text-gray-900"
                >
                  {selectedLeadData?.phone || '-'}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Company</span>
                <span className="text-sm text-gray-900">
                  {selectedLeadData?.company_name || '-'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Location</span>
                <span className="text-sm text-gray-900">
                  {[selectedLeadData?.city, selectedLeadData?.state]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Lead Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Status</span>
                <div className="text-sm">
                  {selectedLeadData?.status && (
                    <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {selectedLeadData.status.charAt(0).toUpperCase() +
                        selectedLeadData.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Owner</span>
                <span className="text-sm text-gray-900">
                  {selectedLeadData?.assigned_user?.full_name || 'Unassigned'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Created</span>
                <span className="text-sm text-gray-900">
                  {selectedLeadData &&
                    formatDistanceToNow(new Date(selectedLeadData.created_at), {
                      addSuffix: true,
                    })}
                </span>
              </div>
            </div>
          </div>

          {/* LinkedIn */}
          {selectedLeadData?.linkedin_url && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Social
              </h3>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">LinkedIn</span>
                <a
                  href={selectedLeadData.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Profile
                </a>
              </div>
            </div>
          )}
        </div>
      </RecordDrawer>
    </div>
  )
}
