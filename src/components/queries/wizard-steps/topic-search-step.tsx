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
        <h2 className="text-2xl font-bold text-gray-900">
          What topic do you want to track?
        </h2>
        <p className="mt-2 text-gray-600">
          Search for a topic that your target companies might be researching
        </p>
      </div>

      {/* Selected Topic */}
      {selectedTopicId && (
        <div className="rounded-lg border-2 border-blue-600 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Selected Topic:</p>
              <p className="text-lg font-semibold text-blue-900">
                {selectedTopicName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null as any, null as any)}
              className="text-sm text-blue-600 hover:text-blue-700"
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
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Topics
            </label>
            <input
              id="topic-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Artificial Intelligence, Cloud Computing..."
              className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500">
              Type at least 2 characters to search
            </p>
          </div>

          {/* Results */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Searching...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {results.length} topics found
              </p>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {results.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelectTopic(topic)}
                    className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {topic.topic}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {topic.category}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {/* Trend Indicator */}
                        {topic.trend_direction === 'up' && (
                          <span className="text-green-600">↑</span>
                        )}
                        {topic.trend_direction === 'down' && (
                          <span className="text-red-600">↓</span>
                        )}
                        {topic.trend_direction === 'stable' && (
                          <span className="text-gray-400">→</span>
                        )}
                        <span className="text-sm text-gray-500">
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
              <p className="text-gray-500">
                No topics found. Try a different search term.
              </p>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
