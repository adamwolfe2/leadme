/**
 * Marketplace Utility Functions
 * Helper functions for marketplace lead display and filtering
 */

export function getIntentBadge(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Hot', color: 'bg-red-100 text-red-700' }
  if (score >= 40) return { label: 'Warm', color: 'bg-amber-100 text-amber-700' }
  return { label: 'Cold', color: 'bg-blue-100 text-blue-700' }
}

export function getFreshnessBadge(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Fresh', color: 'bg-blue-100 text-blue-700' }
  if (score >= 40) return { label: 'Recent', color: 'bg-yellow-100 text-yellow-700' }
  return { label: 'Aged', color: 'bg-zinc-100 text-zinc-600' }
}
