'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LayoutGrid, LayoutList, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ViewType = 'table' | 'board' | 'calendar'

interface CRMViewBarProps {
  title: string
  icon?: ReactNode
  viewType: ViewType
  onViewTypeChange: (type: ViewType) => void
  filterButton?: ReactNode
  sortButton?: ReactNode
  actions?: ReactNode
  showViewSwitcher?: boolean
}

/**
 * Top bar for CRM pages with view switching, filters, and actions
 * Inspired by Twenty CRM's ViewBar component
 */
export function CRMViewBar({
  title,
  icon,
  viewType,
  onViewTypeChange,
  filterButton,
  sortButton,
  actions,
  showViewSwitcher = true,
}: CRMViewBarProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Left: Title and icon */}
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-500">{icon}</div>}
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right: View switcher, filters, sort, actions */}
      <div className="flex items-center gap-2">
        {/* View type switcher */}
        {showViewSwitcher && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-2',
                viewType === 'table' &&
                  'bg-white shadow-sm hover:bg-white'
              )}
              onClick={() => onViewTypeChange('table')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-2',
                viewType === 'board' &&
                  'bg-white shadow-sm hover:bg-white'
              )}
              onClick={() => onViewTypeChange('board')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-2',
                viewType === 'calendar' &&
                  'bg-white shadow-sm hover:bg-white'
              )}
              onClick={() => onViewTypeChange('calendar')}
              disabled
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Filter button */}
        {filterButton}

        {/* Sort button */}
        {sortButton}

        {/* Custom actions */}
        {actions}
      </div>
    </div>
  )
}
