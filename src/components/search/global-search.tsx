'use client'

import * as React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/design-system'
import type { SearchResults } from '@/app/api/search/route'

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchResponse {
  results: SearchResults
}

// ── Fetch ────────────────────────────────────────────────────────────────────

async function fetchSearchResults(query: string): Promise<SearchResults> {
  const params = new URLSearchParams({ q: query, limit: '8' })
  const response = await fetch(`/api/search?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Search failed')
  }
  const data: SearchResponse = await response.json()
  return data.results
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

function hasResults(results: SearchResults): boolean {
  return (
    results.leads.length > 0 ||
    results.contacts.length > 0 ||
    results.campaigns.length > 0
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface ResultItemProps {
  href: string
  label: string
  sub?: string | null
  onSelect: () => void
}

function ResultItem({ href, label, sub, onSelect }: ResultItemProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex flex-col px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
    >
      <span className="text-sm font-medium text-foreground truncate">{label}</span>
      {sub && (
        <span className="text-xs text-muted-foreground truncate mt-0.5">{sub}</span>
      )}
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {children}
      </span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function GlobalSearch() {
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // React Query — only fetches when debounced query is >= 2 chars
  const { data, isLoading } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 10_000,
    gcTime: 30_000,
  })

  const results = data ?? null

  // Open dropdown when we have a query and results/loading state
  React.useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedQuery])

  // Cmd+K global shortcut to focus the search input
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close on Escape key
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function close() {
    setIsOpen(false)
    inputRef.current?.blur()
  }

  function handleSelect() {
    setQuery('')
    close()
  }

  const showDropdown = isOpen && debouncedQuery.length >= 2
  const showEmpty = showDropdown && !isLoading && results !== null && !hasResults(results)

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Search input */}
      <div className="relative">
        {/* Search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="global-search-results"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (debouncedQuery.length >= 2) setIsOpen(true)
          }}
          className={cn(
            'h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-16 text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
          )}
        />

        {/* Cmd+K hint — hidden on small screens */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5">
          <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div
          id="global-search-results"
          role="listbox"
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-dropdown overflow-hidden',
            'rounded-lg border border-border bg-popover shadow-enterprise-md',
            'animate-slide-in-from-top'
          )}
        >
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
              <svg
                className="h-4 w-4 animate-spin"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Searching...
            </div>
          )}

          {/* No results */}
          {showEmpty && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </div>
          )}

          {/* Results */}
          {!isLoading && results && hasResults(results) && (
            <div className="py-1 max-h-80 overflow-y-auto">
              {/* Leads section */}
              {results.leads.length > 0 && (
                <div>
                  <SectionLabel>Leads</SectionLabel>
                  {results.leads.map((lead) => (
                    <ResultItem
                      key={lead.id}
                      href={`/crm/leads/${lead.id}`}
                      label={lead.full_name || lead.email || lead.company_name}
                      sub={
                        lead.full_name
                          ? [lead.email, lead.company_name].filter(Boolean).join(' · ')
                          : lead.company_name || null
                      }
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}

              {/* Contacts (buyers) section */}
              {results.contacts.length > 0 && (
                <div>
                  {results.leads.length > 0 && (
                    <div className="-mx-1 my-1 h-px bg-border" />
                  )}
                  <SectionLabel>Contacts</SectionLabel>
                  {results.contacts.map((contact) => (
                    <ResultItem
                      key={contact.id}
                      href={`/crm/leads`}
                      label={contact.company_name}
                      sub={contact.email}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}

              {/* Campaigns section */}
              {results.campaigns.length > 0 && (
                <div>
                  {(results.leads.length > 0 || results.contacts.length > 0) && (
                    <div className="-mx-1 my-1 h-px bg-border" />
                  )}
                  <SectionLabel>Campaigns</SectionLabel>
                  {results.campaigns.map((campaign) => (
                    <ResultItem
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}`}
                      label={campaign.name}
                      sub={campaign.status}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
