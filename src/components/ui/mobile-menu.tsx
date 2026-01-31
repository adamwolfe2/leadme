/**
 * Mobile Menu Component
 * Slide-out drawer for mobile navigation
 */

'use client'

import { ReactNode, useEffect } from 'react'
import { X, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'

interface MobileMenuProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function MobileMenu({ children, isOpen, onClose, onOpen }: MobileMenuProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <Button
        onClick={onOpen}
        variant="ghost"
        size="icon"
        className="lg:hidden min-w-[44px] min-h-[44px]"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay and Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 lg:hidden shadow-xl overflow-y-auto"
            >
              {/* Close Button */}
              <div className="flex justify-end p-4">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="min-w-[44px] min-h-[44px]"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Menu Content */}
              <div className="px-4 pb-4">
                {children}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
