'use client'

/**
 * useUpgradeModal
 *
 * Global hook for triggering the contextual upgrade modal.
 * Call showUpgradeModal(trigger, context?) from any component —
 * typically when a 402 / insufficient_credits error is encountered.
 *
 * Usage:
 *   const { showUpgradeModal } = useUpgradeModal()
 *   showUpgradeModal('credits_empty', "You've used all your credits")
 *
 * Mount <UpgradeModal> once near the root and pass the hook's return values.
 */

import { useState, useCallback } from 'react'

export type UpgradeTrigger =
  | 'credits_empty'
  | 'credits_low'
  | 'premium_feature'
  | 'export_limit'

export interface UpgradeModalState {
  isOpen: boolean
  trigger: UpgradeTrigger
  context?: string
}

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [trigger, setTrigger] = useState<UpgradeTrigger>('credits_empty')
  const [context, setContext] = useState<string | undefined>(undefined)

  const showUpgradeModal = useCallback(
    (nextTrigger: UpgradeTrigger, nextContext?: string) => {
      setTrigger(nextTrigger)
      setContext(nextContext)
      setIsOpen(true)
    },
    []
  )

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    trigger,
    context,
    showUpgradeModal,
    closeModal,
  }
}
