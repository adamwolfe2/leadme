'use client'

import { useState } from 'react'
import { ContactsTable } from '@/components/crm/table/ContactsTable'
import { RecordDrawer } from '@/components/crm/drawer/RecordDrawer'
import { formatDistanceToNow } from 'date-fns'
import type { Contact } from '@/types/crm.types'

interface ContactsPageClientProps {
  initialData: Contact[]
}

export function ContactsPageClient({ initialData }: ContactsPageClientProps) {
  const [contacts] = useState<Contact[]>(initialData)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleRowClick = (contact: Contact) => {
    setSelectedContact(contact.id)
    setDrawerOpen(true)
  }

  const selectedContactData = contacts.find((c) => c.id === selectedContact)
  const fullName = selectedContactData?.full_name ||
    [selectedContactData?.first_name, selectedContactData?.last_name].filter(Boolean).join(' ') ||
    'Unnamed Contact'

  return (
    <div className="flex h-full flex-col">
      {/* Twenty.com style table */}
      <ContactsTable data={contacts} onRowClick={handleRowClick} />

      {/* Record Drawer */}
      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={fullName}
        subtitle={selectedContactData?.title || undefined}
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
                {selectedContactData?.email ? (
                  <a
                    href={`mailto:${selectedContactData.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedContactData.email}
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Phone</span>
                {selectedContactData?.phone ? (
                  <a
                    href={`tel:${selectedContactData.phone}`}
                    className="text-sm text-gray-900"
                  >
                    {selectedContactData.phone}
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Mobile</span>
                <span className="text-sm text-gray-900">
                  {selectedContactData?.mobile || '-'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Job Title</span>
                <span className="text-sm text-gray-900">
                  {selectedContactData?.title || '-'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Seniority</span>
                <span className="text-sm text-gray-900">
                  {selectedContactData?.seniority_level || '-'}
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
                  {selectedContactData?.status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">Created</span>
                <span className="text-sm text-gray-900">
                  {selectedContactData &&
                    formatDistanceToNow(new Date(selectedContactData.created_at), {
                      addSuffix: true,
                    })}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {(selectedContactData?.linkedin_url || selectedContactData?.twitter_url) && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Social
              </h3>
              <div className="space-y-3">
                {selectedContactData.linkedin_url && (
                  <div className="flex items-start gap-3">
                    <span className="w-20 shrink-0 text-xs text-gray-500">LinkedIn</span>
                    <a
                      href={selectedContactData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
                {selectedContactData.twitter_url && (
                  <div className="flex items-start gap-3">
                    <span className="w-20 shrink-0 text-xs text-gray-500">Twitter</span>
                    <a
                      href={selectedContactData.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </RecordDrawer>
    </div>
  )
}
