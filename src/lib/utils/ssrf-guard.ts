/**
 * SSRF Guard — validates webhook URLs to block internal/private network access
 * Prevents users from configuring webhook URLs that point to internal services
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
])

const PRIVATE_IP_PATTERNS = [
  /^127\./,           // IPv4 loopback
  /^10\./,            // Private class A
  /^172\.(1[6-9]|2\d|3[01])\./,  // Private class B (172.16-31.x.x)
  /^192\.168\./,      // Private class C
  /^169\.254\./,      // Link-local
  /^0\./,             // This network
  /^::1$/,            // IPv6 loopback
  /^fc[0-9a-f]{2}:/i, // IPv6 unique local
  /^fe[89ab][0-9a-f]:/i, // IPv6 link-local
]

/**
 * Returns true if the URL is safe to use as an outbound webhook destination.
 * Rejects:
 * - Non-HTTPS URLs
 * - Localhost / loopback addresses
 * - Private / RFC-1918 IP ranges
 * - Cloud metadata endpoints (169.254.169.254, metadata.google.internal)
 */
export function isValidWebhookUrl(urlString: string): boolean {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    return false
  }

  // Only HTTPS
  if (url.protocol !== 'https:') return false

  const hostname = url.hostname.toLowerCase()

  // Block known internal hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) return false

  // Block private/loopback IP ranges
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) return false
  }

  return true
}
