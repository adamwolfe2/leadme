/**
 * SavedSearchesList
 *
 * Displays saved marketplace filter combos as clickable chips.
 * Clicking a chip applies its stored filters to the marketplace page.
 * The X button deletes the saved search.
 */

'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/lib/hooks/use-toast'
import { safeError } from '@/lib/utils/log-sanitizer'
import type { MarketplaceFilters } from '@/lib/hooks/use-marketplace-leads'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SavedSearch {
  id: string
  name: string
  filters: MarketplaceFilters
  created_at: string
}

interface SavedSearchesListProps {
  onApply: (filters: MarketplaceFilters) => void
}

// ── Data fetching ────────────────────────────────────────────────────────────

async function fetchSavedSearches(): Promise<SavedSearch[]> {
  const response = await fetch('/api/marketplace/saved-searches')

  if (!response.ok) {
    throw new Error('Failed to fetch saved searches')
  }

  const data = await response.json()
  return data.savedSearches ?? []
}

// ── Component ────────────────────────────────────────────────────────────────

export function SavedSearchesList({ onApply }: SavedSearchesListProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: savedSearches = [], isLoading } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: fetchSavedSearches,
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000,
  })

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/marketplace/saved-searches/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete saved search')
      }

      await queryClient.invalidateQueries({ queryKey: ['saved-searches'] })

      toast({
        title: 'Search deleted',
        message: `"${name}" has been removed`,
        type: 'success',
      })
    } catch (error) {
      safeError('[SavedSearchesList] Failed to delete saved search:', error)
      toast({
        title: 'Failed to delete search',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: 'error',
      })
    }
  }

  // Don't render anything while loading
  if (isLoading) {
    return null
  }

  // Empty state
  if (savedSearches.length === 0) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[12px] text-zinc-400 italic">
          No saved searches yet — apply filters above and click &quot;Save Search&quot;
        </span>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-2">
        Saved Searches
      </p>
      <div className="flex flex-wrap gap-2">
        {savedSearches.map((search) => (
          <div
            key={search.id}
            className="group flex items-center gap-1 h-7 pl-3 pr-1.5 bg-white border border-zinc-200 hover:border-zinc-400 rounded-full text-[12px] text-zinc-700 transition-all duration-150 cursor-pointer"
          >
            <button
              onClick={() => onApply(search.filters)}
              className="flex-1 text-left leading-none"
              title={`Apply "${search.name}" filters`}
            >
              {search.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                void handleDelete(search.id, search.name)
              }}
              className="ml-1 w-4 h-4 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
              aria-label={`Delete saved search "${search.name}"`}
              title="Delete"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
