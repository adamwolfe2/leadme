// Dashboard Layout - Protected layout with navigation

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user profile
  const { data: user } = await supabase
    .from('users')
    .select('*, workspaces(*)')
    .eq('auth_user_id', session.user.id)
    .single()

  if (!user) {
    redirect('/onboarding')
  }

  const workspace = user.workspaces as any

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold text-blue-600">
                  OpenInfo
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:border-gray-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/queries"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Queries
                </Link>
                <Link
                  href="/data"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Lead Data
                </Link>
                <Link
                  href="/people-search"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  People Search
                </Link>
                <Link
                  href="/trends"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Trends
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Credits:</span>
                <span className="font-semibold text-gray-900">
                  {user.daily_credit_limit - user.daily_credits_used} /{' '}
                  {user.daily_credit_limit}
                </span>
              </div>

              {/* Plan Badge */}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.plan === 'pro'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user.plan === 'pro' ? 'Pro' : 'Free'}
              </span>

              {/* User Menu */}
              <div className="relative">
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Workspace Indicator */}
      <div className="bg-blue-50 px-4 py-2">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-blue-900">
            <span className="font-medium">{workspace?.name}</span>
            {workspace?.subdomain && (
              <span className="text-blue-700 ml-2">
                ({workspace.subdomain}.openinfo.com)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
