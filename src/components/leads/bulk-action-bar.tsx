'use client'

import { useState } from 'react'
import { Download, Zap, XCircle, AlertCircle } from 'lucide-react'

interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  selectedUnenrichedCount: number
  bulkEnriching: boolean
  bulkEnrichProgress: number
  bulkEnrichErrors: number
  creditsRemaining: number
  onSelectAll: () => void
  onClear: () => void
  onExport: () => void
  onBulkEnrich: () => void
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  selectedUnenrichedCount,
  bulkEnriching,
  bulkEnrichProgress,
  bulkEnrichErrors,
  creditsRemaining,
  onSelectAll,
  onClear,
  onExport,
  onBulkEnrich,
}: BulkActionBarProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  function handleEnrichClick() {
    if (selectedUnenrichedCount >= 5) {
      setShowConfirm(true)
    } else {
      onBulkEnrich()
    }
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-primary">
          {selectedCount} selected
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onSelectAll}
            className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-gray-50 transition-colors"
          >
            Select all {totalCount}
          </button>
          {selectedCount > 0 && (
            <>
              <button
                onClick={onClear}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <XCircle className="h-3.5 w-3.5" /> Clear
              </button>
              <button
                onClick={onExport}
                className="inline-flex items-center gap-1.5 text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="h-3 w-3" /> Export {selectedCount}
              </button>
              {selectedUnenrichedCount > 0 && (
                <button
                  onClick={handleEnrichClick}
                  disabled={bulkEnriching || creditsRemaining < selectedUnenrichedCount}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-primary rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Zap className="h-3 w-3" />
                  {bulkEnriching
                    ? `Enriching ${bulkEnrichProgress}/${selectedUnenrichedCount}${bulkEnrichErrors > 0 ? ` (${bulkEnrichErrors} failed)` : ''}…`
                    : `Enrich ${selectedUnenrichedCount} (${selectedUnenrichedCount} cr)`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bulk enrich progress bar */}
      {bulkEnriching && selectedUnenrichedCount > 0 && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-blue-700 font-medium">
              Enriching leads... {bulkEnrichProgress}/{selectedUnenrichedCount}
            </span>
            {bulkEnrichErrors > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="h-3 w-3" /> {bulkEnrichErrors} failed
              </span>
            )}
          </div>
          <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(bulkEnrichProgress / selectedUnenrichedCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              This will use <strong>{selectedUnenrichedCount} credits</strong> to enrich {selectedUnenrichedCount} leads.
              You have {creditsRemaining} credits remaining.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setShowConfirm(false); onBulkEnrich() }}
              className="text-xs font-semibold text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
