import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

/**
 * Hook to prefetch routes on hover for faster navigation.
 * Reduces perceived navigation time by prefetching before click.
 *
 * @param href - Route to prefetch
 * @returns Object with onMouseEnter and onTouchStart handlers
 *
 * @example
 * ```tsx
 * function QuickLink({ href, children }: { href: string; children: React.ReactNode }) {
 *   const prefetchHandlers = usePrefetchOnHover(href)
 *
 *   return (
 *     <Link href={href} {...prefetchHandlers}>
 *       {children}
 *     </Link>
 *   )
 * }
 * ```
 */
export function usePrefetchOnHover(href: string) {
  const router = useRouter()
  const prefetchedRef = useRef(false)

  const handlePrefetch = useCallback(() => {
    if (!prefetchedRef.current && href) {
      router.prefetch(href)
      prefetchedRef.current = true
    }
  }, [href, router])

  return {
    onMouseEnter: handlePrefetch,
    onTouchStart: handlePrefetch,
  }
}
