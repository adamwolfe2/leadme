'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CRMThreeColumnLayoutProps {
  sidebar?: ReactNode
  children: ReactNode
  drawer?: ReactNode
  drawerOpen?: boolean
  className?: string
}

/**
 * Three-column layout for CRM pages
 * Inspired by Twenty CRM's layout system
 *
 * Layout: [Sidebar (optional)] [Main Content] [Drawer (optional, slide-in)]
 */
export function CRMThreeColumnLayout({
  sidebar,
  children,
  drawer,
  drawerOpen = false,
  className,
}: CRMThreeColumnLayoutProps) {
  return (
    <div className={cn('flex h-full overflow-hidden', className)}>
      {/* Sidebar (optional) */}
      {sidebar && (
        <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
          {sidebar}
        </aside>
      )}

      {/* Main content area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>

      {/* Right drawer (optional, slide-in) */}
      {drawer && (
        <>
          {/* Overlay */}
          {drawerOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => {
                // Handle drawer close
              }}
            />
          )}

          {/* Drawer */}
          <aside
            className={cn(
              'fixed right-0 top-0 z-50 h-full w-96 transform border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out',
              drawerOpen ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            {drawer}
          </aside>
        </>
      )}
    </div>
  )
}
