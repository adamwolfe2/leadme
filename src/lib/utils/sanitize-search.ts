/**
 * Sanitize search input for use in PostgREST .or() filter expressions.
 * Escapes characters that have special meaning in PostgREST filter syntax.
 */
export function sanitizeSearchTerm(input: string): string {
  return input
    .replace(/\\/g, '\\\\')   // Escape backslashes first
    .replace(/[%_]/g, '\\$&') // Escape LIKE wildcards (we add our own %)
    .replace(/[(),."']/g, '') // Remove PostgREST operators/delimiters
    .trim()
    .slice(0, 200) // Limit length to prevent abuse
}
