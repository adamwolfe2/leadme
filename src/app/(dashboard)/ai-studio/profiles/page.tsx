/**
 * AI Studio - Customer Profiles Page
 * Display AI-generated buyer personas (ICPs)
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, ArrowRight, User, MapPin, DollarSign, GraduationCap, Target, TrendingUp, Radio } from 'lucide-react'

interface CustomerProfile {
  id: string
  name: string
  title: string
  description: string
  demographics: {
    age_range: string
    income_range: string
    location: string
    education: string
  }
  pain_points: string[]
  goals: string[]
  preferred_channels: string[]
}

export default function ProfilesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspace')

  const [profiles, setProfiles] = useState<CustomerProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    if (!workspaceId) {
      router.push('/ai-studio')
      return
    }
    fetchProfiles()
  }, [workspaceId])

  async function fetchProfiles() {
    try {
      const response = await fetch(`/api/ai-studio/profiles?workspace=${workspaceId}`)
      const data = await response.json()
      setProfiles(data.profiles || [])
      if (data.profiles?.length > 0) {
        setSelectedProfile(data.profiles[0])
      }
    } catch (error) {
      console.error('Failed to load profiles:', error)
    } finally {
      setIsLoading(false)
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
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => router.push(`/ai-studio/knowledge?workspace=${workspaceId}`)}
                variant="ghost"
                size="sm"
                className="mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Knowledge Base
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Customer Profiles</h1>
              <p className="text-sm text-gray-500">AI-generated ideal customer personas</p>
            </div>

            <Button
              onClick={() => router.push(`/ai-studio/offers?workspace=${workspaceId}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Offers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {profiles.length === 0 ? (
            <Card className="p-12 text-center bg-white shadow-sm border border-gray-200">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No customer profiles yet</h3>
              <p className="text-gray-600">Profiles are generated automatically during brand extraction</p>
            </Card>
          ) : (
            <>
              {/* Profile Selector */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedProfile?.id === profile.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-blue-100 p-3 border border-blue-200">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{profile.title}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Selected Profile Details */}
              {selectedProfile && (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <Card className="p-6 bg-white shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-600 p-6">
                        <User className="h-12 w-12 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedProfile.name}
                        </h2>
                        <p className="text-blue-600 font-medium mb-3">{selectedProfile.title}</p>
                        <p className="text-gray-700 leading-relaxed">{selectedProfile.description}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Demographics */}
                  <Card className="p-6 bg-white shadow-sm border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Demographics
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Age Range</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedProfile.demographics.age_range}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Income Range</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedProfile.demographics.income_range}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Location</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedProfile.demographics.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Education</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedProfile.demographics.education}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Three Column Layout */}
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Pain Points */}
                    <Card className="p-6 bg-white shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-red-600" />
                        <h3 className="font-semibold text-gray-900">Pain Points</h3>
                      </div>
                      <ul className="space-y-3">
                        {selectedProfile.pain_points.map((pain, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-600 mt-1 text-sm">•</span>
                            <p className="text-sm text-gray-700 flex-1">{pain}</p>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {/* Goals */}
                    <Card className="p-6 bg-white shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Goals</h3>
                      </div>
                      <ul className="space-y-3">
                        {selectedProfile.goals.map((goal, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1 text-sm">•</span>
                            <p className="text-sm text-gray-700 flex-1">{goal}</p>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {/* Preferred Channels */}
                    <Card className="p-6 bg-white shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Radio className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Preferred Channels</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.preferred_channels.map((channel, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                          >
                            {channel}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
