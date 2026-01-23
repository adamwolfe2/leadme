'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Workspace data
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  const [industryVertical, setIndustryVertical] = useState('')

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'E-commerce',
    'Marketing',
    'Real Estate',
    'Manufacturing',
    'Other',
  ]

  // Auto-generate slug from workspace name
  const handleWorkspaceNameChange = (name: string) => {
    setWorkspaceName(name)
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setWorkspaceSlug(slug)
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Validate slug
    if (workspaceSlug.length < 3) {
      setError('Workspace slug must be at least 3 characters')
      setLoading(false)
      return
    }

    // Check if slug is available
    const { data: existingWorkspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('slug', workspaceSlug)
      .single()

    if (existingWorkspace) {
      setError('This workspace slug is already taken')
      setLoading(false)
      return
    }

    try {
      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: workspaceName,
          slug: workspaceSlug,
          subdomain: workspaceSlug,
          industry_vertical: industryVertical || null,
        } as any)
        .select()
        .single()

      if (workspaceError || !workspace) {
        throw workspaceError || new Error('Failed to create workspace')
      }

      // Create user profile
      const { error: userError } = await supabase.from('users').insert({
        auth_user_id: session.user.id,
        workspace_id: (workspace as any).id,
        email: session.user.email!,
        full_name:
          session.user.user_metadata.full_name ||
          session.user.user_metadata.name ||
          null,
        role: 'owner',
        plan: 'free',
        daily_credit_limit: 3,
      } as any)

      if (userError) {
        // Rollback workspace creation
        await supabase.from('workspaces').delete().eq('id', (workspace as any).id)
        throw userError
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-medium text-zinc-900">
            Welcome to OpenInfo
          </h2>
          <p className="mt-2 text-[13px] text-zinc-600">
            Let's set up your workspace to get started
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-medium ${
              step === 1
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            1
          </div>
          <div className="h-1 w-16 bg-zinc-200" />
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-medium ${
              step === 2
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            2
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-[13px] font-medium text-red-700">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Workspace Details */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
            <div className="rounded-lg bg-white border border-zinc-200 p-8">
              <h3 className="text-[13px] font-medium text-zinc-900 mb-6">
                Workspace Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="workspace-name"
                    className="block text-[13px] font-medium text-zinc-700 mb-2"
                  >
                    Workspace Name
                  </label>
                  <input
                    id="workspace-name"
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => handleWorkspaceNameChange(e.target.value)}
                    className="w-full h-9 px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-200 transition-all duration-150"
                    placeholder="Acme Corporation"
                  />
                  <p className="mt-2 text-[13px] text-zinc-500">
                    This will be displayed throughout the platform
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="workspace-slug"
                    className="block text-[13px] font-medium text-zinc-700 mb-2"
                  >
                    Workspace Slug
                  </label>
                  <div className="flex rounded-lg">
                    <input
                      id="workspace-slug"
                      type="text"
                      required
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value)}
                      className="flex-1 h-9 px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 bg-white border border-zinc-300 rounded-l-lg focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-200 transition-all duration-150"
                      placeholder="acme-corp"
                      pattern="[a-z0-9-]+"
                    />
                    <span className="inline-flex items-center h-9 px-3 text-[13px] text-zinc-500 bg-zinc-50 border border-l-0 border-zinc-300 rounded-r-lg">
                      .openinfo.com
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-zinc-500">
                    Your workspace URL: {workspaceSlug || 'your-slug'}.openinfo.com
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="industry"
                    className="block text-[13px] font-medium text-zinc-700 mb-2"
                  >
                    Industry (Optional)
                  </label>
                  <select
                    id="industry"
                    value={industryVertical}
                    onChange={(e) => setIndustryVertical(e.target.value)}
                    className="w-full h-9 px-3 text-[13px] text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-200 transition-all duration-150"
                  >
                    <option value="">Select an industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="h-9 px-4 text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Review & Create */}
        {step === 2 && (
          <form onSubmit={handleCreateWorkspace} className="space-y-6">
            <div className="rounded-lg bg-white border border-zinc-200 p-8">
              <h3 className="text-[13px] font-medium text-zinc-900 mb-6">
                Review & Create
              </h3>

              <dl className="divide-y divide-zinc-100">
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-[13px] font-medium text-zinc-900">
                    Workspace Name
                  </dt>
                  <dd className="mt-1 text-[13px] text-zinc-700 sm:col-span-2 sm:mt-0">
                    {workspaceName}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-[13px] font-medium text-zinc-900">
                    Workspace URL
                  </dt>
                  <dd className="mt-1 text-[13px] text-zinc-700 sm:col-span-2 sm:mt-0">
                    {workspaceSlug}.openinfo.com
                  </dd>
                </div>
                {industryVertical && (
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-[13px] font-medium text-zinc-900">
                      Industry
                    </dt>
                    <dd className="mt-1 text-[13px] text-zinc-700 sm:col-span-2 sm:mt-0">
                      {industryVertical}
                    </dd>
                  </div>
                )}
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-[13px] font-medium text-zinc-900">
                    Plan
                  </dt>
                  <dd className="mt-1 text-[13px] text-zinc-700 sm:col-span-2 sm:mt-0">
                    Free (3 credits/day)
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-9 px-4 text-[13px] font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all duration-150"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-9 px-4 text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating workspace...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
