'use client'

import type { QueryFilters } from '@/types'

interface ReviewStepProps {
  topicName: string
  filters: QueryFilters
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

export function ReviewStep({
  topicName,
  filters,
  onSubmit,
  onBack,
  loading,
}: ReviewStepProps) {
  const hasFilters =
    filters.location ||
    filters.employee_range ||
    filters.revenue_range ||
    (filters.industry && filters.industry.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review Your Query</h2>
        <p className="mt-2 text-gray-600">
          Make sure everything looks correct before creating your query
        </p>
      </div>

      {/* Query Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <dl className="space-y-4">
          {/* Topic */}
          <div>
            <dt className="text-sm font-medium text-gray-500">Topic</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {topicName}
            </dd>
          </div>

          {/* Location */}
          {filters.location && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-base text-gray-900">
                {[
                  filters.location.city,
                  filters.location.state,
                  filters.location.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </dd>
            </div>
          )}

          {/* Employee Range */}
          {filters.employee_range && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Number of Employees
              </dt>
              <dd className="mt-1 text-base text-gray-900">
                {filters.employee_range.min?.toLocaleString() || '0'} -{' '}
                {filters.employee_range.max
                  ? filters.employee_range.max.toLocaleString()
                  : 'Unlimited'}
              </dd>
            </div>
          )}

          {/* Revenue Range */}
          {filters.revenue_range && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Annual Revenue
              </dt>
              <dd className="mt-1 text-base text-gray-900">
                ${(filters.revenue_range.min || 0).toLocaleString()} -{' '}
                {filters.revenue_range.max
                  ? `$${filters.revenue_range.max.toLocaleString()}`
                  : 'Unlimited'}
              </dd>
            </div>
          )}

          {/* Industries */}
          {filters.industry && filters.industry.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Industries</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {filters.industry.map((industry) => (
                  <span
                    key={industry}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                  >
                    {industry}
                  </span>
                ))}
              </dd>
            </div>
          )}

          {/* No Filters Message */}
          {!hasFilters && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Filters</dt>
              <dd className="mt-1 text-base text-gray-900">
                No filters applied - tracking all companies researching this
                topic
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              What happens next?
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc space-y-1 pl-5">
                <li>Your query will run daily to discover new leads</li>
                <li>
                  Companies matching your criteria will be enriched with contact
                  data
                </li>
                <li>
                  New leads will be delivered to your email and available in
                  your dashboard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creating Query...' : 'Create Query'}
        </button>
      </div>
    </div>
  )
}
