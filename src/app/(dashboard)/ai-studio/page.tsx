/**
 * AI Studio - Home Page
 * Polished brand extraction with real-time loading checkpoints
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Loader2,
  Sparkles,
  Globe,
  Check,
  Image as ImageIcon,
  Palette,
  Type,
  MessageSquare,
  Wand2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BrandWorkspace {
  id: string
  name: string
  url: string
  logo_url: string | null
  extraction_status: 'processing' | 'completed' | 'failed'
  created_at: string
}

interface LoadingStep {
  id: string
  label: string
  icon: any
  status: 'pending' | 'loading' | 'complete'
}

export default function AIStudioPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [workspaces, setWorkspaces] = useState<BrandWorkspace[]>([])
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)

  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: '1', label: 'Capturing website', icon: Globe, status: 'pending' },
    { id: '2', label: 'Extracting screenshots', icon: ImageIcon, status: 'pending' },
    { id: '3', label: 'Analyzing brand colors', icon: Palette, status: 'pending' },
    { id: '4', label: 'Identifying typography', icon: Type, status: 'pending' },
    { id: '5', label: 'Understanding brand voice', icon: MessageSquare, status: 'pending' },
    { id: '6', label: 'Generating insights', icon: Wand2, status: 'pending' },
  ])

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

  async function simulateLoadingSteps() {
    const steps = [...loadingSteps]

    for (let i = 0; i < steps.length; i++) {
      // Set current step to loading
      setLoadingSteps(prev => prev.map((step, idx) =>
        idx === i ? { ...step, status: 'loading' } : step
      ))

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))

      // Mark as complete
      setLoadingSteps(prev => prev.map((step, idx) =>
        idx === i ? { ...step, status: 'complete' } : step
      ))

      // Show screenshot after first step
      if (i === 1) {
        setScreenshot('https://placehold.co/800x600/e2e8f0/64748b?text=Website+Preview')
      }
    }
  }

  async function handleExtract() {
    if (!url.trim()) return

    setIsExtracting(true)
    setLoadingSteps(steps => steps.map(s => ({ ...s, status: 'pending' })))
    setScreenshot(null)

    // Start visual loading simulation
    simulateLoadingSteps()

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

      // Wait for all steps to complete before navigating
      await new Promise(resolve => setTimeout(resolve, 5000))

      router.push(`/ai-studio/branding?workspace=${data.workspaceId}`)
    } catch (error: any) {
      alert(error.message || 'Failed to extract brand DNA')
      setIsExtracting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-4 shadow-lg">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            AI Studio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your website URL and watch as we extract your brand DNA in real-time
          </p>
        </motion.div>

        {/* URL Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Website URL
                </span>
                <div className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && url.trim() && !isExtracting) {
                        handleExtract()
                      }
                    }}
                    className="flex-1 text-lg h-14 border-2 focus:border-blue-500 transition-all"
                    disabled={isExtracting}
                  />
                  <Button
                    onClick={handleExtract}
                    disabled={isExtracting || !url.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 h-14 text-base font-semibold shadow-lg"
                    size="lg"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Analyze Brand
                      </>
                    )}
                  </Button>
                </div>
              </label>

              {!isExtracting && (
                <p className="text-sm text-gray-500">
                  We'll extract your logo, colors, fonts, and brand voice to generate on-brand creatives
                </p>
              )}
            </div>

            {/* Loading Progress */}
            <AnimatePresence>
              {isExtracting && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 space-y-6"
                >
                  {/* Screenshot Preview */}
                  {screenshot && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-blue-200"
                    >
                      <img
                        src={screenshot}
                        alt="Website preview"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                        <p className="text-white font-semibold text-lg">Analyzing your website...</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Loading Steps */}
                  <div className="space-y-3">
                    {loadingSteps.map((step, index) => {
                      const Icon = step.icon
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                            step.status === 'complete'
                              ? 'bg-green-50 border-2 border-green-200'
                              : step.status === 'loading'
                              ? 'bg-blue-50 border-2 border-blue-300 shadow-md'
                              : 'bg-gray-50 border-2 border-gray-200'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${
                            step.status === 'complete'
                              ? 'text-green-600'
                              : step.status === 'loading'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}>
                            {step.status === 'complete' ? (
                              <Check className="h-6 w-6" />
                            ) : step.status === 'loading' ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              <Icon className="h-6 w-6" />
                            )}
                          </div>
                          <span className={`font-medium ${
                            step.status === 'complete'
                              ? 'text-green-900'
                              : step.status === 'loading'
                              ? 'text-blue-900'
                              : 'text-gray-500'
                          }`}>
                            {step.label}
                          </span>
                          {step.status === 'loading' && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.8 }}
                              className="ml-auto h-1 bg-blue-500 rounded-full"
                              style={{ maxWidth: '60px' }}
                            />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Existing Workspaces */}
        {!isExtracting && workspaces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Brand Workspaces
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Card
                    className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 bg-white/80 backdrop-blur-sm"
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
                          className="h-14 w-14 rounded-xl object-contain bg-white border-2 border-gray-200 p-2"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Sparkles className="h-7 w-7 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-lg">
                          {workspace.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {workspace.url}
                        </p>
                        <div className="mt-2">
                          {workspace.extraction_status === 'processing' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Processing...
                            </span>
                          )}
                          {workspace.extraction_status === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                              <Check className="h-3 w-3" />
                              Ready
                            </span>
                          )}
                          {workspace.extraction_status === 'failed' && (
                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoadingWorkspaces && !isExtracting && workspaces.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center text-gray-500"
          >
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No brand workspaces yet. Enter a URL above to get started.</p>
          </motion.div>
        )}
      </div>

      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 z-50"
      >
        <MessageSquare className="h-6 w-6 mx-auto" />
      </motion.button>
    </div>
  )
}
