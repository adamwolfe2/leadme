'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface TopicSearchStepProps {
  selectedTopicId: string | null
  selectedTopicName: string | null
  onSelect: (topicId: string, topicName: string) => void
  onNext: () => void
}

interface TopicResult {
  id: string
  topic: string
  category: string
  current_volume: number
  trend_direction: 'up' | 'down' | 'stable'
  relevance?: number
}

export function TopicSearchStep({
  selectedTopicId,
  selectedTopicName,
  onSelect,
  onNext,
}: TopicSearchStepProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TopicResult[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchTopics(debouncedQuery)
    } else {
      setResults([])
    }
  }, [debouncedQuery])

  const searchTopics = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/topics/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()

      if (response.ok) {
        setResults(data.data || [])
      }
    } catch (error) {
      console.error('Topic search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTopic = (topic: TopicResult) => {
    onSelect(topic.id, topic.topic)
  }

  const canProceed = selectedTopicId !== null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-medium text-zinc-900">
          What topic do you want to track?
        </h2>
        <p className="mt-1 text-[13px] text-zinc-600">
          Search for a topic that your target companies might be researching
        </p>
      </div>

      {/* Selected Topic */}
      {selectedTopicId && (
        <div className="rounded-lg border-2 border-blue-600 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-blue-700">
                Selected Topic
              </p>
              <p className="mt-1 text-[15px] font-medium text-blue-900">
                {selectedTopicName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null as any, null as any)}
              className="text-[13px] font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      {!selectedTopicId && (
        <>
          <div>
            <label
              htmlFor="topic-search"
              className="block text-[13px] font-medium text-zinc-700 mb-2"
            >
              Search Topics
            </label>
            <input
              id="topic-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Artificial Intelligence, Cloud Computing..."
              className="w-full h-10 px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-200 transition-all duration-150"
              autoFocus
            />
            <p className="mt-2 text-[12px] text-zinc-500">
              Type at least 2 characters to search
            </p>
          </div>

          {/* Results */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent"></div>
              <p className="mt-3 text-[13px] text-zinc-600">Searching...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-[13px] font-medium text-zinc-700">
                {results.length} {results.length === 1 ? 'topic' : 'topics'} found
              </p>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {results.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelectTopic(topic)}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-left hover:border-zinc-900 hover:bg-zinc-50 transition-all duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-zinc-900">
                          {topic.topic}
                        </p>
                        <p className="mt-0.5 text-[12px] text-zinc-500 capitalize">
                          {topic.category}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {/* Trend Indicator */}
                        {topic.trend_direction === 'up' && (
                          <span className="text-blue-600 font-medium">↑</span>
                        )}
                        {topic.trend_direction === 'down' && (
                          <span className="text-red-600 font-medium">↓</span>
                        )}
                        {topic.trend_direction === 'stable' && (
                          <span className="text-zinc-400 font-medium">→</span>
                        )}
                        <span className="text-[12px] text-zinc-500">
                          {topic.current_volume.toLocaleString()} vol
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="mt-3 text-[13px] text-zinc-600">
                No topics found. Try a different search term.
              </p>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-zinc-200">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="h-9 px-6 text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
