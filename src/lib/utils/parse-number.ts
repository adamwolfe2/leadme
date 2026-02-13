/**
 * Safe number parsing utilities
 * Prevents NaN injection and provides sensible defaults
 */

interface ParseIntOptions {
  min?: number
  max?: number
  fallback?: number
}

interface ParseFloatOptions {
  min?: number
  max?: number
  fallback?: number
}

/**
 * Safely parse an integer with validation
 * @param value - Value to parse
 * @param options - Parsing options
 * @returns Parsed integer or fallback value
 */
export function safeParseInt(
  value: string | null | undefined,
  options: ParseIntOptions = {}
): number {
  const { min, max, fallback = 0 } = options

  let result: number

  if (!value) {
    result = fallback
  } else {
    const parsed = parseInt(value, 10)
    // Check for NaN
    result = isNaN(parsed) ? fallback : parsed
  }

  // Apply constraints to both parsed values and fallback
  if (min !== undefined && result < min) result = min
  if (max !== undefined && result > max) result = max

  return result
}

/**
 * Safely parse a float with validation
 * @param value - Value to parse
 * @param options - Parsing options
 * @returns Parsed float or fallback value
 */
export function safeParseFloat(
  value: string | null | undefined,
  options: ParseFloatOptions = {}
): number {
  const { min, max, fallback = 0 } = options

  let result: number

  if (!value) {
    result = fallback
  } else {
    const parsed = parseFloat(value)
    // Check for NaN
    result = isNaN(parsed) ? fallback : parsed
  }

  // Apply constraints to both parsed values and fallback
  if (min !== undefined && result < min) result = min
  if (max !== undefined && result > max) result = max

  return result
}

/**
 * Parse pagination parameters safely
 * @param pageParam - Page number string
 * @param limitParam - Limit string
 * @returns Validated page and limit
 */
export function safeParsePagination(
  pageParam: string | null | undefined,
  limitParam: string | null | undefined,
  options: {
    defaultPage?: number
    defaultLimit?: number
    maxLimit?: number
  } = {}
): { page: number; limit: number; offset: number } {
  const { defaultPage = 1, defaultLimit = 50, maxLimit = 1000 } = options

  const page = safeParseInt(pageParam, { min: 1, fallback: defaultPage })
  const limit = safeParseInt(limitParam, {
    min: 1,
    max: maxLimit,
    fallback: defaultLimit,
  })
  const offset = (page - 1) * limit

  return { page, limit, offset }
}
