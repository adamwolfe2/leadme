// CRM Companies Page
// Manage companies in the CRM

import Link from 'next/link'
import { Building2, Plus } from 'lucide-react'
import { QueryProvider } from '@/components/providers/query-provider'

export const metadata = {
  title: 'Companies - CRM',
  description: 'Manage your companies and accounts',
}

export default async function CRMCompaniesPage() {
  return (
    <QueryProvider>
      <div className="flex h-screen bg-gradient-cursive-soft">
        {/* CRM Sidebar - With Cursive Branding */}
        <aside className="w-64 border-r border-blue-100/50 bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold bg-gradient-cursive bg-clip-text text-transparent">
              CRM
            </h2>
            <nav className="mt-6 space-y-1.5">
              <Link
                href="/crm/leads"
                className="block px-3 py-2.5 text-muted-foreground hover:bg-gradient-cursive-subtle rounded-lg transition-all"
              >
                Leads
              </Link>
              <div className="px-3 py-2.5 bg-gradient-cursive text-white rounded-lg font-medium shadow-sm">
                Companies
              </div>
              <Link
                href="/crm/contacts"
                className="block px-3 py-2.5 text-muted-foreground hover:bg-gradient-cursive-subtle rounded-lg transition-all"
              >
                Contacts
              </Link>
              <Link
                href="/crm/deals"
                className="block px-3 py-2.5 text-muted-foreground hover:bg-gradient-cursive-subtle rounded-lg transition-all"
              >
                Deals
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header with Gradient */}
            <header className="border-b border-blue-100/50 bg-white/80 backdrop-blur-sm px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-cursive bg-clip-text text-transparent">
                    Companies
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Manage your business accounts and companies
                  </p>
                </div>
                <button className="btn-gradient-cursive px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Company
                </button>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="h-full rounded-lg border border-blue-100/50 bg-white/80 backdrop-blur-sm p-8">
                {/* Empty state with shimmer skeletons */}
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-cursive-soft flex items-center justify-center mb-6">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No companies yet
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    Start managing your business accounts by adding your first company. Track deals,
                    contacts, and activities all in one place.
                  </p>
                  <button className="btn-gradient-cursive px-6 py-2.5 rounded-lg flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Company
                  </button>

                  {/* Loading skeleton preview */}
                  <div className="mt-12 w-full max-w-3xl space-y-3">
                    <div className="text-xs text-muted-foreground mb-3">Preview (Loading State)</div>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 rounded-lg border border-blue-100/50 bg-gradient-cursive-subtle/30 p-4 flex items-center gap-4"
                      >
                        <div className="shimmer-cursive h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="shimmer-cursive h-4 w-48 rounded" />
                          <div className="shimmer-cursive h-3 w-32 rounded" />
                        </div>
                        <div className="shimmer-cursive h-6 w-20 rounded-full" />
                        <div className="shimmer-cursive h-8 w-8 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </QueryProvider>
  )
}
