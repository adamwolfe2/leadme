// Dashboard Home Page

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', session!.user.id)
    .single()

  // Get queries count
  const { count: queriesCount } = await supabase
    .from('queries')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', user!.workspace_id)

  // Get leads count
  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', user!.workspace_id)

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', user!.workspace_id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-xl font-medium text-zinc-900">
          Welcome back, {user?.full_name || 'there'}!
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Here&apos;s what&apos;s happening with your lead generation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Queries */}
        <div className="overflow-hidden rounded-lg bg-zinc-50 border border-zinc-200 px-5 py-4">
          <dt className="truncate text-[13px] font-medium text-zinc-600">
            Active Queries
          </dt>
          <dd className="mt-1 text-2xl font-medium text-zinc-900">
            {queriesCount || 0}
          </dd>
        </div>

        {/* Total Leads */}
        <div className="overflow-hidden rounded-lg bg-zinc-50 border border-zinc-200 px-5 py-4">
          <dt className="truncate text-[13px] font-medium text-zinc-600">
            Total Leads
          </dt>
          <dd className="mt-1 text-2xl font-medium text-zinc-900">
            {leadsCount || 0}
          </dd>
        </div>

        {/* Credits Remaining */}
        <div className="overflow-hidden rounded-lg bg-zinc-50 border border-zinc-200 px-5 py-4">
          <dt className="truncate text-[13px] font-medium text-zinc-600">
            Credits Today
          </dt>
          <dd className="mt-1 text-2xl font-medium text-zinc-900">
            {user!.daily_credit_limit - user!.daily_credits_used}
          </dd>
        </div>

        {/* Plan */}
        <div className="overflow-hidden rounded-lg bg-zinc-50 border border-zinc-200 px-5 py-4">
          <dt className="truncate text-[13px] font-medium text-zinc-600">
            Current Plan
          </dt>
          <dd className="mt-1 text-2xl font-medium text-zinc-900 capitalize">
            {user!.plan}
          </dd>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white border border-zinc-200 shadow-sm">
        <div className="px-5 py-4">
          <h3 className="text-[15px] font-medium text-zinc-900">
            Quick Actions
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/queries/new"
              className="relative flex items-center space-x-3 rounded-lg border border-zinc-200 bg-white px-6 py-5 hover:bg-zinc-50 transition-colors duration-150"
            >
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-[13px] font-medium text-zinc-900">
                  Create Query
                </p>
                <p className="truncate text-[13px] text-zinc-600">
                  Track a new topic
                </p>
              </div>
            </Link>

            <Link
              href="/data"
              className="relative flex items-center space-x-3 rounded-lg border border-zinc-200 bg-white px-6 py-5 hover:bg-zinc-50 transition-colors duration-150"
            >
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-[13px] font-medium text-zinc-900">View Leads</p>
                <p className="truncate text-[13px] text-zinc-600">
                  Browse your data
                </p>
              </div>
            </Link>

            <Link
              href="/people-search"
              className="relative flex items-center space-x-3 rounded-lg border border-zinc-200 bg-white px-6 py-5 hover:bg-zinc-50 transition-colors duration-150"
            >
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-[13px] font-medium text-zinc-900">
                  Search People
                </p>
                <p className="truncate text-[13px] text-zinc-600">
                  Find contacts
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      {recentLeads && recentLeads.length > 0 && (
        <div className="rounded-lg bg-white border border-zinc-200 shadow-sm">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-zinc-900">
                Recent Leads
              </h3>
              <Link
                href="/data"
                className="text-[13px] font-medium text-zinc-900 hover:text-zinc-700"
              >
                View all
              </Link>
            </div>
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-zinc-100">
                {recentLeads.map((lead) => {
                  const companyData = lead.company_data as any
                  return (
                    <li key={lead.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13px] font-medium text-zinc-900">
                            {companyData?.name || 'Unknown Company'}
                          </p>
                          <p className="truncate text-[13px] text-zinc-600">
                            {companyData?.industry || 'No industry'}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                              lead.enrichment_status === 'enriched'
                                ? 'bg-emerald-50 text-emerald-700'
                                : lead.enrichment_status === 'pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {lead.enrichment_status}
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started (if no queries) */}
      {queriesCount === 0 && (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-[13px] font-medium text-zinc-900">
                Get Started with OpenInfo
              </h3>
              <div className="mt-2 text-[13px] text-zinc-600">
                <p>
                  Create your first query to start tracking companies researching
                  topics you care about. It only takes a few minutes!
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/queries/new"
                  className="h-9 px-4 inline-flex items-center text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150"
                >
                  Create Your First Query
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
