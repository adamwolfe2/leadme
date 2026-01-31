/**
 * AI Studio - Home Page
 * Enter URL to extract brand DNA and generate ad creatives
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loader2, Sparkles, Globe } from 'lucide-react'
import { StudioLayout } from '@/components/ai-studio/studio-layout'

interface BrandWorkspace {
  id: string
  name: string
  url: string
  logo_url: string | null
  extraction_status: 'processing' | 'completed' | 'failed'
  created_at: string
}

export default function AIStudioPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [workspaces, setWorkspaces] = useState<BrandWorkspace[]>([])
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)

  // Load workspaces on mount
  useEffect(() => {
    fetchWorkspaces()
  }, [])

  async function fetchWorkspaces() {
    try {
      const response = await fetch('/api/ai-studio/workspaces')
      const data = await response.json()
      setWorkspaces(data.workspaces || [])
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    } finally {
      setIsLoadingWorkspaces(false)
    }
  }

  async function handleExtract() {
    if (!url.trim()) return

    setIsExtracting(true)
    try {
      const response = await fetch('/api/ai-studio/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract brand DNA')
      }

      // Navigate to branding page
      router.push(`/ai-studio/branding?workspace=${data.workspaceId}`)
    } catch (error: any) {
      alert(error.message || 'Failed to extract brand DNA')
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <StudioLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
        {/* Header */}
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            AI Studio
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            We'll analyze your brand and generate high-converting ad creatives in seconds
          </p>
        </div>

        {/* URL Input */}
        <Card className="mt-12 p-8 shadow-lg border-blue-100">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Enter your website URL
              </span>
              <div className="mt-2 flex gap-3">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && url.trim()) {
                      handleExtract()
                    }
                  }}
                  className="flex-1 text-lg"
                  disabled={isExtracting}
                />
                <Button
                  onClick={handleExtract}
                  disabled={isExtracting || !url.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  size="lg"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    'Analyze Brand'
                  )}
                </Button>
              </div>
            </label>

            <p className="text-sm text-gray-500">
              We'll extract your logo, colors, fonts, and brand voice to generate on-brand creatives
            </p>
          </div>
        </Card>

        {/* Existing Workspaces */}
        {workspaces.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Your Brand Workspaces
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <Card
                  key={workspace.id}
                  className="p-6 cursor-pointer hover:shadow-md transition-shadow border-blue-100 hover:border-blue-300"
                  onClick={() => {
                    if (workspace.extraction_status === 'completed') {
                      router.push(`/ai-studio/branding?workspace=${workspace.id}`)
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {workspace.logo_url ? (
                      <img
                        src={workspace.logo_url}
                        alt={workspace.name}
                        className="h-12 w-12 rounded-lg object-contain bg-white border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {workspace.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {workspace.url}
                      </p>
                      <div className="mt-2">
                        {workspace.extraction_status === 'processing' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing...
                          </span>
                        )}
                        {workspace.extraction_status === 'completed' && (
                          <span className="text-xs font-medium text-green-600">
                            Ready
                          </span>
                        )}
                        {workspace.extraction_status === 'failed' && (
                          <span className="text-xs font-medium text-red-600">
                            Failed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingWorkspaces && (
          <div className="mt-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Loading workspaces...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingWorkspaces && workspaces.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            <p>No brand workspaces yet. Enter a URL above to get started.</p>
          </div>
        )}
        </div>
      </div>
    </StudioLayout>
  )
}
