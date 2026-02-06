import { metadata } from "./metadata"

export { metadata }

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
