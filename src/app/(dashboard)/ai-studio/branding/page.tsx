/**
 * AI Studio - Branding Page
 * Display extracted brand DNA (logo, colors, typography, etc.)
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { StudioLayout } from '@/components/ai-studio/studio-layout'

interface BrandData {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  typography: {
    heading: string
    body: string
  }
  headline: string
  images: string[]
  screenshot?: string
}

interface BrandWorkspace {
  id: string
  name: string
  url: string
  logo_url: string | null
  favicon_url: string | null
  brand_data: BrandData
  extraction_status: 'processing' | 'completed' | 'failed'
  extraction_error: string | null
  created_at: string
}

export default function BrandingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspace')

  const [workspace, setWorkspace] = useState<BrandWorkspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceId) {
      router.push('/ai-studio')
      return
    }

    fetchWorkspace()

    // Poll for updates if processing
    const interval = setInterval(() => {
      if (workspace?.extraction_status === 'processing') {
        fetchWorkspace()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [workspaceId, workspace?.extraction_status])

  async function fetchWorkspace() {
    try {
      const response = await fetch('/api/ai-studio/workspaces')
      const data = await response.json()

      const found = data.workspaces?.find((w: BrandWorkspace) => w.id === workspaceId)
      if (found) {
        setWorkspace(found)
      } else {
        setError('Workspace not found')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <StudioLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Loading brand workspace...</p>
          </div>
        </div>
      </StudioLayout>
    )
  }

  if (error || !workspace) {
    return (
      <StudioLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-600" />
            <p className="mt-4 text-gray-600">{error || 'Workspace not found'}</p>
            <Button onClick={() => router.push('/ai-studio')} className="mt-4">
              Back to AI Studio
            </Button>
          </div>
        </div>
      </StudioLayout>
    )
  }

  if (workspace.extraction_status === 'processing') {
    return (
      <StudioLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Analyzing {workspace.name}
            </h2>
            <p className="mt-2 text-gray-600">
              We're extracting your brand DNA from {workspace.url}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              This may take 30-60 seconds. We'll automatically refresh when ready.
            </p>
          </div>
        </div>
      </StudioLayout>
    )
  }

  if (workspace.extraction_status === 'failed') {
    return (
      <StudioLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <XCircle className="h-12 w-12 mx-auto text-red-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Extraction Failed
            </h2>
            <p className="mt-2 text-gray-600">
              {workspace.extraction_error || 'Failed to extract brand DNA'}
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={() => router.push('/ai-studio')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </StudioLayout>
    )
  }

  const brandData = workspace.brand_data

  return (
    <StudioLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/ai-studio')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Studio
          </Button>

          <div className="flex items-start gap-4">
            {workspace.logo_url && (
              <img
                src={workspace.logo_url}
                alt={workspace.name}
                className="h-16 w-16 rounded-lg object-contain bg-white border border-gray-200 p-2"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {workspace.name}
              </h1>
              <p className="text-gray-500">{workspace.url}</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Brand DNA extracted</span>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/ai-studio/knowledge?workspace=${workspace.id}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Knowledge Base
            </Button>
          </div>
        </div>

        {/* Brand DNA Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Company Info */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Company Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Company Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {workspace.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Website</p>
                <a
                  href={workspace.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {workspace.url}
                </a>
              </div>
            </div>
          </Card>

          {/* Brand Colors */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Brand Colors
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-2">Primary</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: brandData.colors.primary }}
                  />
                  <span className="text-sm font-mono text-gray-700">
                    {brandData.colors.primary}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Secondary</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: brandData.colors.secondary }}
                  />
                  <span className="text-sm font-mono text-gray-700">
                    {brandData.colors.secondary}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Accent</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: brandData.colors.accent }}
                  />
                  <span className="text-sm font-mono text-gray-700">
                    {brandData.colors.accent}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Background</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: brandData.colors.background }}
                  />
                  <span className="text-sm font-mono text-gray-700">
                    {brandData.colors.background}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Typography */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Typography
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Heading Font</p>
                <p
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontFamily: brandData.typography.heading }}
                >
                  {brandData.typography.heading}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Body Font</p>
                <p
                  className="text-base text-gray-900"
                  style={{ fontFamily: brandData.typography.body }}
                >
                  {brandData.typography.body}
                </p>
              </div>
            </div>
          </Card>

          {/* Headline */}
          <Card className="p-6 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Value Proposition
            </h3>
            <p className="text-lg text-gray-900">
              {brandData.headline}
            </p>
          </Card>

          {/* Screenshot */}
          {brandData.screenshot && (
            <Card className="p-6 lg:col-span-3">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Website Screenshot
              </h3>
              <img
                src={brandData.screenshot}
                alt="Website screenshot"
                className="w-full rounded-lg border border-gray-200"
              />
            </Card>
          )}

          {/* Brand Images */}
          {brandData.images && brandData.images.length > 0 && (
            <Card className="p-6 lg:col-span-3">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Brand Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandData.images.slice(0, 8).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Brand image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      </div>
    </StudioLayout>
  )
}
