/**
 * Toast Hook Export
 *
 * Re-export the useToast hook for convenience.
 * This allows importing from either:
 * - @/lib/hooks/use-toast (standard hook location)
 * - @/lib/contexts/toast-context (context location)
 */

export { useToast } from '@/lib/contexts/toast-context'
export type { ToastType, ToastAction } from '@/components/ui/toast'
