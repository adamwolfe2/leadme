'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KanbanColumn<T> {
  id: string
  title: string
  color?: string
  count?: number
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[]
  data: Record<string, T[]>
  renderCard: (item: T) => ReactNode
  onCardClick?: (item: T) => void
  onAddCard?: (columnId: string) => void
  loading?: boolean
  className?: string
}

/**
 * Kanban board component
 * Inspired by Twenty CRM's RecordBoard
 * Note: Drag-and-drop will be added in Phase 3
 */
export function KanbanBoard<T extends { id: string }>({
  columns,
  data,
  renderCard,
  onCardClick,
  onAddCard,
  loading = false,
  className,
}: KanbanBoardProps<T>) {
  if (loading) {
    return (
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="h-full w-80 flex-shrink-0 animate-pulse rounded-lg bg-gray-100"
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex h-full gap-4 overflow-x-auto p-4', className)}>
      {columns.map((column) => {
        const columnData = data[column.id] || []

        return (
          <div
            key={column.id}
            className="flex h-full w-80 flex-shrink-0 flex-col rounded-lg bg-gray-50"
          >
            {/* Column header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-2">
                {column.color && (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                )}
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                {column.count !== undefined && (
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {column.count}
                  </span>
                )}
              </div>

              {/* Add card button */}
              {onAddCard && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onAddCard(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {columnData.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onCardClick?.(item)}
                  className={cn(
                    'rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md',
                    onCardClick && 'cursor-pointer hover:border-blue-300'
                  )}
                >
                  {renderCard(item)}
                </div>
              ))}

              {/* Empty state */}
              {columnData.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-400">
                  No items
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
