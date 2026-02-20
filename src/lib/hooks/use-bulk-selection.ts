'use client'

import { useState, useCallback } from 'react'

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === items.length && items.length > 0) {
        return new Set()
      }
      return new Set(items.map((item) => item.id))
    })
  }, [items])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const selectedCount = selectedIds.size
  const isAllSelected = items.length > 0 && selectedIds.size === items.length
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < items.length

  return {
    selectedIds,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    selectedCount,
    isAllSelected,
    isIndeterminate,
  }
}
