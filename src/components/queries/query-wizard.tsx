'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopicSearchStep } from './wizard-steps/topic-search-step'
import { LocationFilterStep } from './wizard-steps/location-filter-step'
import { CompanySizeFilterStep } from './wizard-steps/company-size-filter-step'
import { IndustryFilterStep } from './wizard-steps/industry-filter-step'
import { ReviewStep } from './wizard-steps/review-step'
import type { QueryFilters } from '@/types'

export interface WizardState {
  step: number
  topic_id: string | null
  topic_name: string | null
  filters: QueryFilters
}

const TOTAL_STEPS = 5

export function QueryWizard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [state, setState] = useState<WizardState>({
    step: 1,
    topic_id: null,
    topic_name: null,
    filters: {
      location: null,
      company_size: null,
      industry: null,
      revenue_range: null,
      employee_range: null,
      technologies: null,
      exclude_companies: [],
    },
  })

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (state.step < TOTAL_STEPS) {
      updateState({ step: state.step + 1 })
    }
  }

  const prevStep = () => {
    if (state.step > 1) {
      updateState({ step: state.step - 1 })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: state.topic_id,
          filters: state.filters,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create query')
      }

      // Redirect to queries list
      router.push('/queries')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div
              key={stepNum}
              className="flex flex-1 items-center last:flex-none"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  stepNum <= state.step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 5 && (
                <div
                  className={`mx-4 h-1 flex-1 ${
                    stepNum < state.step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>Topic</span>
          <span>Location</span>
          <span>Size</span>
          <span>Industry</span>
          <span>Review</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="rounded-lg bg-white p-8 shadow">
        {state.step === 1 && (
          <TopicSearchStep
            selectedTopicId={state.topic_id}
            selectedTopicName={state.topic_name}
            onSelect={(topicId, topicName) => {
              updateState({ topic_id: topicId, topic_name: topicName })
            }}
            onNext={nextStep}
          />
        )}

        {state.step === 2 && (
          <LocationFilterStep
            filters={state.filters}
            onUpdate={(filters) => updateState({ filters })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 3 && (
          <CompanySizeFilterStep
            filters={state.filters}
            onUpdate={(filters) => updateState({ filters })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 4 && (
          <IndustryFilterStep
            filters={state.filters}
            onUpdate={(filters) => updateState({ filters })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.step === 5 && (
          <ReviewStep
            topicName={state.topic_name || 'Unknown Topic'}
            filters={state.filters}
            onSubmit={handleSubmit}
            onBack={prevStep}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
