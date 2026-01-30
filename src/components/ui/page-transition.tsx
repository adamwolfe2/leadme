'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { animationVariants } from '@/lib/animations/variants'
import { useAnimationProps } from '@/hooks/use-reduced-motion'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Page transition wrapper for smooth route changes.
 * Add this to page components for consistent enter/exit animations.
 *
 * @example
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <PageTransition>
 *       <div>Page content</div>
 *     </PageTransition>
 *   )
 * }
 * ```
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const animation = useAnimationProps(animationVariants.fadeIn)

  return (
    <motion.div className={className} {...animation}>
      {children}
    </motion.div>
  )
}
