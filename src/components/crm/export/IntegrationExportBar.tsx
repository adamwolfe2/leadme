'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExportButton, PLATFORM_CONFIGS, type ExportPlatform, type ConnectionStatus } from './ExportButton'
import { cn } from '@/lib/utils'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ============================================================================
// Types
// ============================================================================

interface IntegrationExportBarProps {
  selectedLeadIds: string[]
  onClearSelection?: () => void
  className?: string
}

type ExportState = Record<ExportPlatform, {
  isExporting: boolean
  exportSuccess: boolean
}>

interface ConnectionResponseItem {
  provider: string
  connected: boolean
  status: string
  lastSyncAt: string | null
  connectedAt: string | null
}

// ============================================================================
// IntegrationExportBar Component
// ============================================================================

export function IntegrationExportBar({
  selectedLeadIds,
  onClearSelection,
  className,
}: IntegrationExportBarProps) {
  const [exportState, setExportState] = React.useState<ExportState>({
    hubspot: { isExporting: false, exportSuccess: false },
    salesforce: { isExporting: false, exportSuccess: false },
    'google-sheets': { isExporting: false, exportSuccess: false },
    csv: { isExporting: false, exportSuccess: false },
  })

  // Fetch real connection status from the bulk connections endpoint
  const { data: connections } = useQuery({
    queryKey: ['crm', 'connections', 'status'],
    queryFn: async () => {
      const res = await fetch('/api/crm/connections')
      if (!res.ok) {
        return [] as ConnectionResponseItem[]
      }
      const json = await res.json()
      return (json.data?.connections ?? []) as ConnectionResponseItem[]
    },
    staleTime: 30000, // Cache for 30s
  })

  // Map API response to the format needed by ExportButton
  const platformConnections = React.useMemo<Record<ExportPlatform, ConnectionStatus>>(() => {
    const connectionMap = new Map<string, boolean>()
    if (connections) {
      for (const conn of connections) {
        connectionMap.set(conn.provider, conn.connected)
      }
    }

    return {
      hubspot: connectionMap.get('hubspot') ? 'connected' : 'not_connected',
      salesforce: connectionMap.get('salesforce') ? 'connected' : 'not_connected',
      'google-sheets': connectionMap.get('google_sheets') ? 'connected' : 'not_connected',
      csv: 'connected', // CSV is always available
    }
  }, [connections])

  const selectedCount = selectedLeadIds.length

  // Reset success state when selection changes
  React.useEffect(() => {
    setExportState((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next) as ExportPlatform[]) {
        next[key] = { ...next[key], exportSuccess: false }
      }
      return next
    })
  }, [selectedLeadIds])

  const handleExport = React.useCallback(
    async (platform: ExportPlatform) => {
      if (selectedLeadIds.length === 0) return

      // Mark as exporting
      setExportState((prev) => ({
        ...prev,
        [platform]: { isExporting: true, exportSuccess: false },
      }))

      try {
        const config = PLATFORM_CONFIGS[platform]

        if (platform === 'csv') {
          // CSV export triggers a file download
          const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              format: 'csv',
              leadIds: selectedLeadIds,
            }),
          })

          if (!response.ok) {
            throw new Error('Export failed')
          }

          // Trigger download
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } else {
          // CRM platform exports
          const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              leadIds: selectedLeadIds,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Export failed')
          }
        }

        // Mark as success
        setExportState((prev) => ({
          ...prev,
          [platform]: { isExporting: false, exportSuccess: true },
        }))

        // Clear success after 3 seconds
        setTimeout(() => {
          setExportState((prev) => ({
            ...prev,
            [platform]: { isExporting: false, exportSuccess: false },
          }))
        }, 3000)
      } catch (error) {
        console.error(`[Export] ${platform} export failed:`, error)

        setExportState((prev) => ({
          ...prev,
          [platform]: { isExporting: false, exportSuccess: false },
        }))

        // Show basic error feedback (could be replaced with toast)
        alert(`Export to ${PLATFORM_CONFIGS[platform].name} failed. Please try again.`)
      }
    },
    [selectedLeadIds]
  )

  const platforms: ExportPlatform[] = ['hubspot', 'salesforce', 'google-sheets', 'csv']

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 sm:px-6 py-3 mb-4 rounded-xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      {/* Export label */}
      <div className="flex items-center gap-2 shrink-0">
        <Download className="size-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Export
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 shrink-0" />

      {/* Platform buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {platforms.map((platform) => (
          <ExportButton
            key={platform}
            platform={platform}
            selectedCount={selectedCount}
            connectionStatus={platformConnections[platform]}
            onExport={handleExport}
            isExporting={exportState[platform].isExporting}
            exportSuccess={exportState[platform].exportSuccess}
          />
        ))}
      </div>

      {/* Selection indicator + clear */}
      {selectedCount > 0 && (
        <>
          <div className="w-px h-5 bg-gray-200 shrink-0 ml-auto" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-blue-600">
              {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
            </span>
            {onClearSelection && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-gray-400 hover:text-gray-600"
                onClick={onClearSelection}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
