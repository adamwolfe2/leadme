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

  const clearAll = () => {
    setSelectedIndustries([])
  }

  const selectAll = () => {
    setSelectedIndustries([...INDUSTRIES])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-medium text-zinc-900">
          Filter by Industry (Optional)
        </h2>
        <p className="mt-1 text-[13px] text-zinc-600">
          Select one or more industries to target. Leave blank to include all.
        </p>
      </div>

      {/* Selected Count */}
      {selectedIndustries.length > 0 && (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-zinc-900">
              {selectedIndustries.length} {selectedIndustries.length === 1 ? 'industry' : 'industries'} selected
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-[12px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {selectedIndustries.length === 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={selectAll}
            className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Select all
          </button>
        </div>
      )}

      {/* Industry Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {INDUSTRIES.map((industry) => (
          <button
            key={industry}
            type="button"
            onClick={() => toggleIndustry(industry)}
            className={`rounded-lg border-2 px-4 py-3 text-[13px] font-medium transition-all duration-150 ${
              selectedIndustries.includes(industry)
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            {industry}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-zinc-200">
        <button
          type="button"
          onClick={onBack}
          className="h-9 px-4 text-[13px] font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all duration-150"
        >
          Back
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleSkip}
            className="h-9 px-4 text-[13px] font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all duration-150"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="h-9 px-6 text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
