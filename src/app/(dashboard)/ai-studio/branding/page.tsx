/**
 * AI Studio - Branding Page
 * Stunning visual display of extracted brand DNA
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Palette, Type as TypeIcon, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 text-lg">Loading brand workspace...</p>
        </div>
      </div>
    )
  }

  if (error || !workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || 'Workspace not found'}</p>
          <Button onClick={() => router.push('/ai-studio')} size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Studio
          </Button>
        </div>
      </div>
    )
  }

  if (workspace.extraction_status === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-md">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-600 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Analyzing {workspace.name}
          </h2>
          <p className="text-gray-600 mb-4">
            We're extracting your brand DNA from {workspace.url}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This may take 30-60 seconds. We'll automatically refresh when ready.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (workspace.extraction_status === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Extraction Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {workspace.extraction_error || 'Failed to extract brand DNA'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/ai-studio')} variant="outline" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => window.location.reload()} size="lg">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const brandData = workspace.brand_data

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.push('/ai-studio')}
            variant="ghost"
            className="mb-6 hover:bg-white/50"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to AI Studio
          </Button>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-start gap-6">
              {workspace.logo_url && (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  src={workspace.logo_url}
                  alt={workspace.name}
                  className="h-20 w-20 rounded-xl object-contain bg-white border-2 border-gray-200 p-3 shadow-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {workspace.name}
                </h1>
                <p className="text-gray-600 text-lg mb-4">{workspace.url}</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-semibold">Brand DNA extracted successfully</span>
                </div>
              </div>

              <Button
                onClick={() => router.push(`/ai-studio/knowledge?workspace=${workspace.id}`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                size="lg"
              >
                Next: Knowledge Base
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Brand Colors - Full Width Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Brand Colors</h2>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {Object.entries(brandData.colors).map(([name, color], index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div
                    className="h-32 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl border-4 border-white"
                    style={{ backgroundColor: color }}
                  />
                  <div className="mt-4 text-center">
                    <p className="text-sm font-semibold text-gray-900 capitalize mb-1">{name}</p>
                    <p className="text-xs font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
                      {color}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Typography */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                  <TypeIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Typography</h2>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-3 font-semibold">Heading Font</p>
                  <p
                    className="text-4xl font-bold text-gray-900"
                    style={{ fontFamily: brandData.typography.heading }}
                  >
                    {brandData.typography.heading}
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-3 font-semibold">Body Font</p>
                  <p
                    className="text-2xl text-gray-900"
                    style={{ fontFamily: brandData.typography.body }}
                  >
                    {brandData.typography.body}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-8 bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl border-0 h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wider">
                  Value Proposition
                </p>
                <h3 className="text-3xl font-bold text-white leading-tight">
                  {brandData.headline}
                </h3>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Website Screenshot */}
        {brandData.screenshot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Website Preview</h2>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={brandData.screenshot}
                  alt="Website screenshot"
                  className="w-full"
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Brand Images Gallery */}
        {brandData.images && brandData.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Imagery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandData.images.slice(0, 8).map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border-4 border-white"
                  >
                    <img
                      src={image}
                      alt={`Brand image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
