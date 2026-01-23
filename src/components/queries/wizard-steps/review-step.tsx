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
        <h2 className="text-[17px] font-medium text-zinc-900">
          Review Your Query
        </h2>
        <p className="mt-1 text-[13px] text-zinc-600">
          Make sure everything looks correct before creating your query
        </p>
      </div>

      {/* Query Summary */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <dl className="space-y-4">
          {/* Topic */}
          <div>
            <dt className="text-[12px] font-medium text-zinc-500">Topic</dt>
            <dd className="mt-1 text-[15px] font-medium text-zinc-900">
              {topicName}
            </dd>
          </div>

          {/* Location */}
          {filters.location && (
            <div>
              <dt className="text-[12px] font-medium text-zinc-500">
                Location
              </dt>
              <dd className="mt-1 text-[13px] text-zinc-900">
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
              <dt className="text-[12px] font-medium text-zinc-500">
                Number of Employees
              </dt>
              <dd className="mt-1 text-[13px] text-zinc-900">
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
              <dt className="text-[12px] font-medium text-zinc-500">
                Annual Revenue
              </dt>
              <dd className="mt-1 text-[13px] text-zinc-900">
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
              <dt className="text-[12px] font-medium text-zinc-500">
                Industries
              </dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {filters.industry.map((industry) => (
                  <span
                    key={industry}
                    className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium bg-zinc-100 text-zinc-700"
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
              <dt className="text-[12px] font-medium text-zinc-500">Filters</dt>
              <dd className="mt-1 text-[13px] text-zinc-900">
                No filters applied - tracking all companies researching this
                topic
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-emerald-600"
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
            <h3 className="text-[13px] font-medium text-emerald-900">
              What happens next?
            </h3>
            <div className="mt-2 text-[13px] text-emerald-800">
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
      <div className="flex justify-between pt-4 border-t border-zinc-200">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="h-9 px-4 text-[13px] font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="h-9 px-6 text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Query...
            </span>
          ) : (
            'Create Query'
          )}
        </button>
      </div>
    </div>
  )
}
