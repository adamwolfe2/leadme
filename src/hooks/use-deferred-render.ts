import { useEffect, useState } from 'react'

/**
 * Hook to defer rendering of below-fold content until after initial page load.
 * This improves Time to Interactive (TTI) by prioritizing above-fold content.
 *
 * @param delay - Delay in milliseconds before rendering (default: 100ms)
 * @returns boolean indicating whether the component should render
 *
 * @example
 * ```tsx
 * function HeavyChart() {
 *   const shouldRender = useDeferredRender()
 *
 *   if (!shouldRender) {
 *     return <ChartSkeleton />
 *   }
 *
 *   return <Chart data={data} />
 * }
 * ```
 */
export function useDeferredRender(delay: number = 100): boolean {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      const handle = requestIdleCallback(
        () => {
          setShouldRender(true)
        },
        { timeout: delay + 1000 } // Fallback timeout
      )

      return () => cancelIdleCallback(handle)
    } else {
      const timer = setTimeout(() => {
        setShouldRender(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [delay])

  return shouldRender
}
