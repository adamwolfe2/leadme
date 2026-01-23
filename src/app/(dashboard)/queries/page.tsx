// Queries List Page

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QueryRepository } from '@/lib/repositories/query.repository'

export default async function QueriesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Get queries
  const queryRepo = new QueryRepository()
  const queries = await queryRepo.findByWorkspace(user.workspace_id)

  const activeCount = queries.filter((q) => (q as any).status === 'active').length
  const queryLimit = user.plan === 'pro' ? 5 : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-zinc-900">Queries</h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Manage your topic tracking queries
          </p>
        </div>
        <Link
          href="/queries/new"
          className="h-9 px-4 inline-flex items-center text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
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
          New Query
        </Link>
      </div>

      {/* Query Limit Info */}
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-zinc-900">
            Using {activeCount} of {queryLimit} active {queryLimit === 1 ? 'query' : 'queries'}
          </p>
          {user.plan === 'free' && activeCount >= queryLimit && (
            <Link
              href="/pricing"
              className="text-[13px] font-medium text-zinc-900 hover:text-zinc-700"
            >
              Upgrade to Pro →
            </Link>
          )}
        </div>
      </div>

      {/* Queries List */}
      {queries.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-zinc-200 px-6 py-12 text-center bg-white">
          <svg
            className="mx-auto h-12 w-12 text-zinc-400"
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
          <h3 className="mt-2 text-[13px] font-medium text-zinc-900">
            No queries yet
          </h3>
          <p className="mt-1 text-[13px] text-zinc-600">
            Get started by creating your first query
          </p>
          <div className="mt-6">
            <Link
              href="/queries/new"
              className="h-9 px-4 inline-flex items-center text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150"
            >
              <svg
                className="-ml-0.5 mr-1.5 h-5 w-5"
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
              New Query
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queries.map((query: any) => (
            <Link
              key={query.id}
              href={`/queries/${query.id}`}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:bg-zinc-50 transition-colors duration-150"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-[15px] font-medium text-zinc-900">
                    {query.name || query.global_topics?.topic}
                  </h3>
                  <p className="mt-1 text-[13px] text-zinc-600 capitalize">
                    {query.global_topics?.category}
                  </p>
                </div>
                <span
                  className={`ml-3 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    query.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : query.status === 'paused'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {query.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-600">Total Leads</span>
                  <span className="font-medium text-zinc-900">
                    {query.total_leads_generated || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-600">This Week</span>
                  <span className="font-medium text-zinc-900">
                    {query.leads_this_week || 0}
                  </span>
                </div>
              </div>

              {query.last_run_at && (
                <div className="mt-4 text-[12px] text-zinc-500">
                  Last run:{' '}
                  {new Date(query.last_run_at).toLocaleDateString()}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
