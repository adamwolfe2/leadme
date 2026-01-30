/**
 * Log Sanitization Utility
 * Prevents sensitive data (API keys, tokens, emails) from appearing in application logs
 *
 * Security: All integration clients MUST use this utility before logging
 */

/**
 * Sensitive field patterns to redact
 */
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /password/i,
  /auth/i,
  /bearer/i,
  /credential/i,
  /signature/i,
  /webhook[_-]?secret/i,
  /stripe[_-]?key/i,
  /client[_-]?secret/i,
]

/**
 * Email regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Redact sensitive string value
 * Shows only last 4 characters for debugging
 */
function redactSensitiveValue(value: string, fieldName: string): string {
  // Check if field name matches sensitive patterns
  const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(fieldName))

  if (!isSensitive && !EMAIL_REGEX.test(value)) {
    return value // Not sensitive, return as-is
  }

  // Redact sensitive values
  if (value.length <= 8) {
    return '****' // Too short, fully redact
  }

  // For emails, show first char and domain
  if (EMAIL_REGEX.test(value)) {
    const [localPart, domain] = value.split('@')
    return `${localPart[0]}***@${domain}`
  }

  // For API keys/tokens, show last 4 chars
  const lastFour = value.slice(-4)
  return `****${lastFour}`
}

/**
 * Recursively sanitize an object for logging
 */
export function sanitizeLog(data: any): any {
  if (data === null || data === undefined) {
    return data
  }

  // Handle primitives
  if (typeof data !== 'object') {
    return data
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeLog(item))
  }

  // Handle objects
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value
      continue
    }

    // Recursively sanitize nested objects/arrays
    if (typeof value === 'object') {
      sanitized[key] = sanitizeLog(value)
      continue
    }

    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[key] = redactSensitiveValue(value, key)
      continue
    }

    // Pass through other types (numbers, booleans)
    sanitized[key] = value
  }

  return sanitized
}

/**
 * Safe console.log that sanitizes sensitive data
 */
export function safeLog(message: string, data?: any): void {
  if (data) {
    console.log(message, sanitizeLog(data))
  } else {
    console.log(message)
  }
}

/**
 * Safe console.error that sanitizes sensitive data
 */
export function safeError(message: string, error?: any): void {
  if (error) {
    // Sanitize error object but preserve stack trace
    const sanitizedError = {
      ...sanitizeLog(error),
      stack: error?.stack // Keep stack trace for debugging
    }
    console.error(message, sanitizedError)
  } else {
    console.error(message)
  }
}

/**
 * Safe console.warn that sanitizes sensitive data
 */
export function safeWarn(message: string, data?: any): void {
  if (data) {
    console.warn(message, sanitizeLog(data))
  } else {
    console.warn(message)
  }
}
