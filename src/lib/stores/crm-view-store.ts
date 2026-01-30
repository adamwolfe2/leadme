import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewType = 'table' | 'board' | 'calendar'

interface CRMViewState {
  // View type per page
  viewTypes: Record<string, ViewType>
  setViewType: (page: string, viewType: ViewType) => void
  getViewType: (page: string) => ViewType

  // Filters per page
  filters: Record<string, any>
  setFilters: (page: string, filters: any) => void
  getFilters: (page: string) => any

  // Sort per page
  sort: Record<string, { field: string; direction: 'asc' | 'desc' }[]>
  setSort: (page: string, sort: { field: string; direction: 'asc' | 'desc' }[]) => void
  getSort: (page: string) => { field: string; direction: 'asc' | 'desc' }[]
}

/**
 * CRM view state store
 * Manages view type, filters, and sort state per page
 * Persisted to localStorage
 */
export const useCRMViewStore = create<CRMViewState>()(
  persist(
    (set, get) => ({
      viewTypes: {},
      setViewType: (page, viewType) =>
        set((state) => ({
          viewTypes: { ...state.viewTypes, [page]: viewType },
        })),
      getViewType: (page) => get().viewTypes[page] || 'table',

      filters: {},
      setFilters: (page, filters) =>
        set((state) => ({
          filters: { ...state.filters, [page]: filters },
        })),
      getFilters: (page) => get().filters[page] || {},

      sort: {},
      setSort: (page, sort) =>
        set((state) => ({
          sort: { ...state.sort, [page]: sort },
        })),
      getSort: (page) => get().sort[page] || [],
    }),
    {
      name: 'crm-view-store',
    }
  )
)
