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
        <h2 className="text-2xl font-bold text-gray-900">
          Filter by Company Size (Optional)
        </h2>
        <p className="mt-2 text-gray-600">
          Target companies based on their employee count and revenue
        </p>
      </div>

      {/* Employee Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Number of Employees
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EMPLOYEE_RANGES.map((range, index) => (
            <button
              key={range.label}
              type="button"
              onClick={() =>
                setSelectedEmployee(selectedEmployee === index ? null : index)
              }
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                selectedEmployee === index
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Annual Revenue
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {REVENUE_RANGES.map((range, index) => (
            <button
              key={range.label}
              type="button"
              onClick={() =>
                setSelectedRevenue(selectedRevenue === index ? null : index)
              }
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                selectedRevenue === index
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
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
