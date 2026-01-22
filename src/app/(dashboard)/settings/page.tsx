// Settings Page

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Profile Information
          </h3>
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={user.full_name || ''}
                  className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Referral Code
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={user.referral_code || ''}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm"
                />
                <button
                  type="button"
                  className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Share this code to earn rewards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Section */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Workspace
          </h3>
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Workspace Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={workspace?.name || ''}
                  className="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Workspace URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={`${workspace?.subdomain || 'your-workspace'}.openinfo.com`}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={workspace?.industry_vertical || 'Not specified'}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Section */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Subscription Plan
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Current plan: <span className="font-medium capitalize">{user.plan}</span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Daily credit limit: {user.daily_credit_limit}
              </p>
            </div>
            {user.plan === 'free' && (
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Danger Zone
          </h3>
          <div className="mt-6 space-y-4">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
