'use client'

import { useState } from 'react'
import type { QueryFilters } from '@/types'

interface LocationFilterStepProps {
  filters: QueryFilters
  onUpdate: (filters: QueryFilters) => void
  onNext: () => void
  onBack: () => void
}

export function LocationFilterStep({
  filters,
  onUpdate,
  onNext,
  onBack,
}: LocationFilterStepProps) {
  const [country, setCountry] = useState(filters.location?.country || '')
  const [state, setState] = useState(filters.location?.state || '')
  const [city, setCity] = useState(filters.location?.city || '')

  const handleNext = () => {
    const location =
      country || state || city
        ? {
            country: country || undefined,
            state: state || undefined,
            city: city || undefined,
          }
        : null

    onUpdate({
      ...filters,
      location,
    })
    onNext()
  }

  const handleSkip = () => {
    onUpdate({
      ...filters,
      location: null,
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Filter by Location (Optional)
        </h2>
        <p className="mt-2 text-gray-600">
          Narrow down companies by their geographic location
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Country
          </label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., United States"
            className="block w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            State/Province
          </label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g., California"
            className="block w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., San Francisco"
            className="block w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
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
