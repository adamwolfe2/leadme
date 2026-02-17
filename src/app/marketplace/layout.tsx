import { ErrorBoundary } from '@/components/error-boundary'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
