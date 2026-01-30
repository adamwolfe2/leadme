'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Plus, Filter, ArrowUpDown, Inbox } from 'lucide-react'
import { CRMPageContainer } from '@/components/crm/layout/CRMPageContainer'
import { CRMViewBar } from '@/components/crm/layout/CRMViewBar'
import { CRMThreeColumnLayout } from '@/components/crm/layout/CRMThreeColumnLayout'
import { CRMTableView } from '@/components/crm/views/CRMTableView'
import { KanbanBoard } from '@/components/crm/board/KanbanBoard'
import { RecordDrawer } from '@/components/crm/drawer/RecordDrawer'
import { EmptyState } from '@/components/crm/empty-states/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCRMViewStore } from '@/lib/stores/crm-view-store'
import { MobileMenu } from '@/components/ui/mobile-menu'
import { formatDistanceToNow } from 'date-fns'

// Mock data for demonstration
// TODO: Replace with actual data fetching from Supabase
const mockLeads = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@acme.com',
    company: 'Acme Corp',
    status: 'New',
    value: '$5,000',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@techcorp.com',
    company: 'Tech Corp',
    status: 'Contacted',
    value: '$12,000',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@startup.io',
    company: 'Startup Inc',
    status: 'Qualified',
    value: '$8,500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]

export function LeadsPageClient() {
  const viewType = useCRMViewStore((state) => state.getViewType('leads'))
  const setViewType = useCRMViewStore((state) => state.setViewType)

  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Sidebar content
  const sidebarContent = (
    <div className="flex h-full flex-col p-6">
      <h2 className="bg-gradient-cursive bg-clip-text text-xl font-semibold text-transparent">
        CRM
      </h2>
      <nav className="mt-6 space-y-1.5">
        <div className="rounded-lg bg-gradient-cursive px-3 py-2.5 font-medium text-white shadow-sm">
          Leads
        </div>
        <Link
          href="/crm/companies"
          className="block rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gradient-cursive-subtle"
        >
          Companies
        </Link>
        <Link
          href="/crm/contacts"
          className="block rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gradient-cursive-subtle"
        >
          Contacts
        </Link>
        <Link
          href="/crm/deals"
          className="block rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-gradient-cursive-subtle"
        >
          Deals
        </Link>
      </nav>
    </div>
  )

  // Table columns configuration
  const tableColumns = [
    {
      key: 'name',
      header: 'Name',
      width: '25%',
      render: (lead: typeof mockLeads[0]) => (
        <div>
          <div className="font-medium text-gray-900">{lead.name}</div>
          <div className="text-sm text-gray-500">{lead.email}</div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      width: '20%',
      render: (lead: typeof mockLeads[0]) => (
        <span className="text-gray-700">{lead.company}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '15%',
      render: (lead: typeof mockLeads[0]) => {
        const colors = {
          New: 'bg-blue-100 text-blue-800',
          Contacted: 'bg-amber-100 text-amber-800',
          Qualified: 'bg-green-100 text-green-800',
        }
        return (
          <Badge className={colors[lead.status as keyof typeof colors] || ''}>
            {lead.status}
          </Badge>
        )
      },
    },
    {
      key: 'value',
      header: 'Value',
      width: '15%',
      render: (lead: typeof mockLeads[0]) => (
        <span className="font-medium text-gray-900">{lead.value}</span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      width: '15%',
      render: (lead: typeof mockLeads[0]) => (
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
        </span>
      ),
    },
  ]

  // Kanban board configuration
  const boardColumns = [
    { id: 'new', title: 'New', color: '#3B82F6', count: 1 },
    { id: 'contacted', title: 'Contacted', color: '#F59E0B', count: 1 },
    { id: 'qualified', title: 'Qualified', color: '#10B981', count: 1 },
    { id: 'won', title: 'Won', color: '#059669', count: 0 },
  ]

  const boardData = {
    new: mockLeads.filter((l) => l.status === 'New'),
    contacted: mockLeads.filter((l) => l.status === 'Contacted'),
    qualified: mockLeads.filter((l) => l.status === 'Qualified'),
    won: [],
  }

  const renderCard = (lead: typeof mockLeads[0]) => (
    <div className="space-y-2">
      <div className="font-medium text-gray-900">{lead.name}</div>
      <div className="text-sm text-gray-600">{lead.company}</div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{lead.value}</span>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
        </span>
      </div>
    </div>
  )

  const handleRowClick = (lead: typeof mockLeads[0]) => {
    setSelectedLead(lead.id)
    setDrawerOpen(true)
  }

  const selectedLeadData = mockLeads.find((l) => l.id === selectedLead)

  return (
    <CRMPageContainer>
      <CRMThreeColumnLayout
        sidebar={
          <div className="hidden lg:block">
            {sidebarContent}
          </div>
        }
      >
        {/* View Bar */}
        <CRMViewBar
          title="Leads"
          icon={<Users className="h-5 w-5" />}
          viewType={viewType}
          onViewTypeChange={(type) => setViewType('leads', type)}
          filterButton={
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          }
          sortButton={
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          }
          actions={
            <>
              {/* Mobile menu */}
              <div className="lg:hidden">
                <MobileMenu triggerClassName="h-9 px-3">
                  {sidebarContent}
                </MobileMenu>
              </div>

              {/* Add lead button */}
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </>
          }
        />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {mockLeads.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-12 w-12" />}
              title="No leads yet"
              description="Get started by creating your first lead or importing leads from a CSV file."
              primaryAction={{
                label: 'Create Lead',
                onClick: () => console.log('Create lead'),
              }}
              secondaryAction={{
                label: 'Import Leads',
                onClick: () => console.log('Import leads'),
              }}
            />
          ) : (
            <>
              {viewType === 'table' && (
                <CRMTableView
                  data={mockLeads}
                  columns={tableColumns}
                  onRowClick={handleRowClick}
                />
              )}

              {viewType === 'board' && (
                <KanbanBoard
                  columns={boardColumns}
                  data={boardData}
                  renderCard={renderCard}
                  onCardClick={handleRowClick}
                  onAddCard={(columnId) => console.log('Add card to', columnId)}
                />
              )}
            </>
          )}
        </div>
      </CRMThreeColumnLayout>

      {/* Record Drawer */}
      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedLeadData?.name || ''}
        subtitle={selectedLeadData?.company}
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Contact Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Email: </span>
                <span className="text-sm text-gray-900">{selectedLeadData?.email}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Company: </span>
                <span className="text-sm text-gray-900">{selectedLeadData?.company}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Lead Details</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Status: </span>
                <Badge className="ml-2">
                  {selectedLeadData?.status}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-gray-500">Value: </span>
                <span className="text-sm font-medium text-gray-900">{selectedLeadData?.value}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Created: </span>
                <span className="text-sm text-gray-900">
                  {selectedLeadData && formatDistanceToNow(selectedLeadData.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </RecordDrawer>
    </CRMPageContainer>
  )
}
