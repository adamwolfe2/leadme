'use client'

import { useState } from 'react'
import type { QueryFilters } from '@/types'

interface CompanySizeFilterStepProps {
  filters: QueryFilters
  onUpdate: (filters: QueryFilters) => void
  onNext: () => void
  onBack: () => void
}

const EMPLOYEE_RANGES = [
  { label: '1-10', min: 1, max: 10 },
  { label: '11-50', min: 11, max: 50 },
  { label: '51-200', min: 51, max: 200 },
  { label: '201-500', min: 201, max: 500 },
  { label: '501-1000', min: 501, max: 1000 },
  { label: '1000+', min: 1000, max: null },
]

const REVENUE_RANGES = [
  { label: 'Under $1M', min: 0, max: 1000000 },
  { label: '$1M - $10M', min: 1000000, max: 10000000 },
  { label: '$10M - $50M', min: 10000000, max: 50000000 },
  { label: '$50M - $100M', min: 50000000, max: 100000000 },
  { label: '$100M - $500M', min: 100000000, max: 500000000 },
  { label: '$500M+', min: 500000000, max: null },
]

export function CompanySizeFilterStep({
  filters,
  onUpdate,
  onNext,
  onBack,
}: CompanySizeFilterStepProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [selectedRevenue, setSelectedRevenue] = useState<number | null>(null)

  const handleNext = () => {
    const employee_range = selectedEmployee !== null
      ? EMPLOYEE_RANGES[selectedEmployee]
      : null

    const revenue_range = selectedRevenue !== null
      ? REVENUE_RANGES[selectedRevenue]
      : null

    onUpdate({
      ...filters,
      employee_range: employee_range ? {
        min: employee_range.min,
        max: employee_range.max || undefined,
      } : null,
      revenue_range: revenue_range ? {
        min: revenue_range.min,
        max: revenue_range.max || undefined,
      } : null,
    })
    onNext()
  }

  const handleSkip = () => {
    onUpdate({
      ...filters,
      employee_range: null,
      revenue_range: null,
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-medium text-zinc-900">
          Filter by Company Size (Optional)
        </h2>
        <p className="mt-1 text-[13px] text-zinc-600">
          Target companies based on their employee count and revenue
        </p>
      </div>

      {/* Employee Range */}
      <div>
        <label className="block text-[13px] font-medium text-zinc-700 mb-3">
          Number of Employees
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EMPLOYEE_RANGES.map((range, index) => (
            <button
              key={range.label}
              type="button"
              onClick={() =>
                setSelectedEmployee(selectedEmployee === index ? null : index)
              }
              className={`rounded-lg border-2 px-4 py-3 text-[13px] font-medium transition-all duration-150 ${
                selectedEmployee === index
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Range */}
      <div>
        <label className="block text-[13px] font-medium text-zinc-700 mb-3">
          Annual Revenue
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {REVENUE_RANGES.map((range, index) => (
            <button
              key={range.label}
              type="button"
              onClick={() =>
                setSelectedRevenue(selectedRevenue === index ? null : index)
              }
              className={`rounded-lg border-2 px-4 py-3 text-[13px] font-medium transition-all duration-150 ${
                selectedRevenue === index
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Selection */}
      {(selectedEmployee !== null || selectedRevenue !== null) && (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
          <p className="text-[12px] font-medium text-zinc-700 mb-2">
            Current Selection
          </p>
          <div className="space-y-1 text-[13px] text-zinc-900">
            {selectedEmployee !== null && (
              <p>Employees: {EMPLOYEE_RANGES[selectedEmployee].label}</p>
            )}
            {selectedRevenue !== null && (
              <p>Revenue: {REVENUE_RANGES[selectedRevenue].label}</p>
            )}
          </div>
        </div>
      )}

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
