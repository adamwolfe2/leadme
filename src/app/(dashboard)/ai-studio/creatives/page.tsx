/**
 * AI Studio - Creatives Page
 * Generate and manage ad creatives (VIBIZ-inspired UI)
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  User,
  Monitor,
  Zap,
  Type,
  Megaphone,
  ArrowUp,
  Lock,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StudioLayout } from '@/components/ai-studio/studio-layout'

interface Creative {
  id: string
  image_url: string
  prompt: string
  style_preset: string | null
  format: string
  created_at: string
  customer_profiles?: { name: string; title: string }
  offers?: { name: string }
}

interface CustomerProfile {
  id: string
  name: string
  title: string
}

interface Offer {
  id: string
  name: string
  description: string
}

const STYLE_PRESETS = [
  'Write with Elegance',
  'Flow of Creativity',
  'Handcrafted Perfection',
  'Timeless Style',
]

const FORMATS = [
  { value: 'square', label: 'Square (1:1)', icon: '1x' },
  { value: 'story', label: 'Story (9:16)', icon: '9:16' },
  { value: 'landscape', label: 'Landscape (16:9)', icon: '16:9' },
]

export default function CreativesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspace')

  const [creatives, setCreatives] = useState<Creative[]>([])
  const [profiles, setProfiles] = useState<CustomerProfile[]>([])
  const [offers, setOffers] = useState<Offer[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // Generation inputs
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_PRESETS[0])
  const [prompt, setPrompt] = useState('')
  const [selectedIcp, setSelectedIcp] = useState<string>('')
  const [selectedOffer, setSelectedOffer] = useState<string>('')
  const [selectedFormat, setSelectedFormat] = useState<string>('square')

  useEffect(() => {
    if (!workspaceId) {
      router.push('/ai-studio')
      return
    }
    fetchData()
  }, [workspaceId])

  async function fetchData() {
    try {
      const [creativesRes, profilesRes, offersRes] = await Promise.all([
        fetch(`/api/ai-studio/creatives?workspace=${workspaceId}`),
        fetch(`/api/ai-studio/profiles?workspace=${workspaceId}`),
        fetch(`/api/ai-studio/offers?workspace=${workspaceId}`),
      ])

      const [creativesData, profilesData, offersData] = await Promise.all([
        creativesRes.json(),
        profilesRes.json(),
        offersRes.json(),
      ])

      setCreatives(creativesData.creatives || [])
      setProfiles(profilesData.profiles || [])
      setOffers(offersData.offers || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai-studio/creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          prompt: prompt.trim(),
          stylePreset: selectedStyle,
          format: selectedFormat,
          icpId: selectedIcp || undefined,
          offerId: selectedOffer || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate creative')
      }

      // Add new creative to the list
      setCreatives([data.creative, ...creatives])
      setPrompt('')
    } catch (error: any) {
      alert(error.message || 'Failed to generate creative')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <StudioLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              onClick={() => router.push(`/ai-studio/offers?workspace=${workspaceId}`)}
              variant="ghost"
              size="sm"
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Offers
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Creatives</h1>
            <p className="text-sm text-gray-500">AI-generated ad creatives</p>
          </div>

          <Button
            onClick={() => router.push(`/ai-studio/campaigns?workspace=${workspaceId}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Next: Campaigns
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Creatives Gallery */}
        <div className="flex-1 overflow-y-auto pb-64">
          {creatives.length === 0 ? (
            <Card className="p-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No creatives yet
              </h3>
              <p className="text-gray-600">
                Use the generator below to create your first ad creative
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {creatives.map((creative) => (
                <Card
                  key={creative.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={creative.image_url}
                      alt={creative.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {creative.prompt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {creative.style_preset && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {creative.style_preset}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {FORMATS.find((f) => f.value === creative.format)?.label || creative.format}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Creative Generator - Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:left-64">
          <div className="max-w-7xl mx-auto px-6 py-4 pr-[25rem]">
            {/* Style Presets */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedStyle === style
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
              <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap">
                More
              </button>
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                placeholder="Describe your creative idea..."
                className="text-base h-12"
                disabled={isGenerating}
              />

              {/* Toolbar */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </Button>

                <Select value={selectedIcp} onValueChange={setSelectedIcp}>
                  <SelectTrigger className="w-[140px] h-9">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <SelectValue placeholder="ICP" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No ICP</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger className="w-[120px] h-9">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Auto
                </Button>

                <Select value={selectedOffer} onValueChange={setSelectedOffer}>
                  <SelectTrigger className="w-[140px] h-9">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4" />
                      <SelectValue placeholder="Offer" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Offer</SelectItem>
                    {offers.map((offer) => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex-1" />

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 p-0"
                  size="icon"
                >
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  )
}
