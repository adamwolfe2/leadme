'use client'

import { useState } from 'react'
import type { QueryFilters } from '@/types'

interface IndustryFilterStepProps {
  filters: QueryFilters
  onUpdate: (filters: QueryFilters) => void
  onNext: () => void
  onBack: () => void
}

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'E-commerce',
  'Marketing',
  'Real Estate',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media & Entertainment',
  'Transportation',
  'Energy',
  'Telecommunications',
  'Hospitality',
  'Legal',
  'Construction',
  'Agriculture',
]

export function IndustryFilterStep({
  filters,
  onUpdate,
  onNext,
  onBack,
}: IndustryFilterStepProps) {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    filters.industry || []
  )

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    )
  }

  const handleNext = () => {
    onUpdate({
      ...filters,
      industry: selectedIndustries.length > 0 ? selectedIndustries : null,
    })
    onNext()
  }

  const handleSkip = () => {
    onUpdate({
      ...filters,
      industry: null,
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Filter by Industry (Optional)
        </h2>
        <p className="mt-2 text-gray-600">
          Select one or more industries to target. Leave blank to include all.
        </p>
      </div>

      {/* Selected Count */}
      {selectedIndustries.length > 0 && (
        <div className="rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-900">
            {selectedIndustries.length} {selectedIndustries.length === 1 ? 'industry' : 'industries'} selected
          </p>
        </div>
      )}

      {/* Industry Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {INDUSTRIES.map((industry) => (
          <button
            key={industry}
            type="button"
            onClick={() => toggleIndustry(industry)}
            className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
              selectedIndustries.includes(industry)
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            {industry}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
