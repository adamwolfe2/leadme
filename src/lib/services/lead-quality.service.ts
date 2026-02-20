/**
 * Lead Quality Gate
 *
 * Shared quality check applied at all lead insertion paths.
 * Ensures every lead delivered to users has the minimum data
 * required to be actionable: first name, last name, company, and email.
 */

export function meetsQualityBar(lead: {
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  email?: string | null
}): { passes: boolean; reason?: string } {
  if (!lead.first_name?.trim() || lead.first_name.trim().length < 2) return { passes: false, reason: 'missing_first_name' }
  if (!lead.last_name?.trim() || lead.last_name.trim().length < 2) return { passes: false, reason: 'missing_last_name' }
  if (!lead.company_name?.trim()) return { passes: false, reason: 'missing_company_name' }
  // Must have @ with at least 2-char TLD
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
  if (!lead.email?.trim() || !emailRegex.test(lead.email.trim())) return { passes: false, reason: 'missing_email' }
  return { passes: true }
}
