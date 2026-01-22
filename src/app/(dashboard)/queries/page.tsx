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
          <h1 className="text-2xl font-bold text-gray-900">Queries</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your topic tracking queries
          </p>
        </div>
        <Link
          href="/queries/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
      <div className="rounded-lg bg-blue-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-blue-900">
            Using {activeCount} of {queryLimit} active {queryLimit === 1 ? 'query' : 'queries'}
          </p>
          {user.plan === 'free' && activeCount >= queryLimit && (
            <Link
              href="/pricing"
              className="text-sm font-medium text-blue-700 hover:text-blue-600"
            >
              Upgrade to Pro →
            </Link>
          )}
        </div>
      </div>

      {/* Queries List */}
      {queries.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 px-6 py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No queries yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first query
          </p>
          <div className="mt-6">
            <Link
              href="/queries/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
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
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-300 hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-lg font-semibold text-gray-900">
                    {query.name || query.global_topics?.topic}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 capitalize">
                    {query.global_topics?.category}
                  </p>
                </div>
                <span
                  className={`ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    query.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : query.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {query.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Leads</span>
                  <span className="font-medium text-gray-900">
                    {query.total_leads_generated || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">This Week</span>
                  <span className="font-medium text-gray-900">
                    {query.leads_this_week || 0}
                  </span>
                </div>
              </div>

              {query.last_run_at && (
                <div className="mt-4 text-xs text-gray-500">
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
