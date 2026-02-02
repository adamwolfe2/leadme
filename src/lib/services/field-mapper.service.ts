/**
 * Smart Field Mapper Service
 * Cursive Platform
 *
 * Automatically maps messy CSV headers to standardized database fields
 * using fuzzy matching, synonyms, and pattern recognition.
 */

// ============================================
// STANDARD FIELD DEFINITIONS
// ============================================

export interface StandardField {
  name: string
  type: 'string' | 'email' | 'phone' | 'number' | 'date' | 'url' | 'address'
  required: boolean
  category: 'person' | 'company' | 'location' | 'meta'
  aliases: string[]
  patterns?: RegExp[]
  validator?: (value: string) => boolean
  transformer?: (value: string) => string
}

export const STANDARD_FIELDS: StandardField[] = [
  // Person Fields
  {
    name: 'first_name',
    type: 'string',
    required: false,
    category: 'person',
    aliases: [
      'first', 'firstname', 'first_name', 'fname', 'given_name', 'givenname',
      'contact_first', 'contact_firstname', 'person_first', 'lead_first'
    ],
  },
  {
    name: 'last_name',
    type: 'string',
    required: false,
    category: 'person',
    aliases: [
      'last', 'lastname', 'last_name', 'lname', 'surname', 'family_name',
      'familyname', 'contact_last', 'contact_lastname', 'person_last', 'lead_last'
    ],
  },
  {
    name: 'full_name',
    type: 'string',
    required: false,
    category: 'person',
    aliases: [
      'name', 'fullname', 'full_name', 'contact_name', 'person_name',
      'lead_name', 'customer_name', 'client_name', 'contactname'
    ],
  },
  {
    name: 'email',
    type: 'email',
    required: true,
    category: 'person',
    aliases: [
      'email', 'email_address', 'emailaddress', 'e_mail', 'e-mail',
      'contact_email', 'person_email', 'lead_email', 'work_email',
      'business_email', 'primary_email', 'mail'
    ],
    patterns: [/email/i, /e-?mail/i],
    validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    transformer: (v) => v.toLowerCase().trim(),
  },
  {
    name: 'phone',
    type: 'phone',
    required: false,
    category: 'person',
    aliases: [
      'phone', 'phone_number', 'phonenumber', 'telephone', 'tel',
      'mobile', 'cell', 'cellphone', 'contact_phone', 'work_phone',
      'business_phone', 'primary_phone', 'direct_phone', 'phone_direct'
    ],
    transformer: (v) => v.replace(/[^\d+]/g, ''),
  },
  {
    name: 'job_title',
    type: 'string',
    required: false,
    category: 'person',
    aliases: [
      'title', 'job_title', 'jobtitle', 'position', 'role', 'job',
      'occupation', 'designation', 'contact_title', 'person_title',
      'professional_title', 'work_title'
    ],
  },
  {
    name: 'department',
    type: 'string',
    required: false,
    category: 'person',
    aliases: [
      'department', 'dept', 'division', 'team', 'unit', 'group',
      'business_unit', 'org_unit'
    ],
  },
  {
    name: 'seniority_level',
    type: 'string',
    required: false,
    category: 'person',
    aliases: [
      'seniority', 'seniority_level', 'level', 'job_level', 'career_level',
      'management_level', 'rank'
    ],
  },
  {
    name: 'linkedin_url',
    type: 'url',
    required: false,
    category: 'person',
    aliases: [
      'linkedin', 'linkedin_url', 'linkedinurl', 'linkedin_profile',
      'li_url', 'linkedin_link', 'person_linkedin'
    ],
    patterns: [/linkedin/i],
  },

  // Company Fields
  {
    name: 'company_name',
    type: 'string',
    required: true,
    category: 'company',
    aliases: [
      'company', 'company_name', 'companyname', 'organization', 'org',
      'business', 'business_name', 'employer', 'firm', 'account',
      'account_name', 'client', 'customer', 'lead_company'
    ],
  },
  {
    name: 'company_domain',
    type: 'url',
    required: false,
    category: 'company',
    aliases: [
      'domain', 'company_domain', 'website', 'web', 'url', 'company_url',
      'company_website', 'site', 'homepage', 'web_address'
    ],
    transformer: (v) => {
      // Extract domain from URL
      let domain = v.toLowerCase().trim()
      domain = domain.replace(/^https?:\/\//, '')
      domain = domain.replace(/^www\./, '')
      domain = domain.split('/')[0]
      return domain
    },
  },
  {
    name: 'company_industry',
    type: 'string',
    required: false,
    category: 'company',
    aliases: [
      'industry', 'company_industry', 'sector', 'vertical', 'market',
      'business_type', 'industry_vertical', 'niche', 'category'
    ],
  },
  {
    name: 'company_size',
    type: 'string',
    required: false,
    category: 'company',
    aliases: [
      'size', 'company_size', 'employees', 'employee_count', 'headcount',
      'num_employees', 'number_of_employees', 'staff_size', 'workforce',
      'team_size', 'org_size'
    ],
  },
  {
    name: 'company_revenue',
    type: 'string',
    required: false,
    category: 'company',
    aliases: [
      'revenue', 'company_revenue', 'annual_revenue', 'yearly_revenue',
      'turnover', 'sales', 'annual_sales', 'revenue_range'
    ],
  },
  {
    name: 'company_founded',
    type: 'string',
    required: false,
    category: 'company',
    aliases: [
      'founded', 'year_founded', 'established', 'founded_year',
      'start_year', 'inception'
    ],
  },

  // Location Fields
  {
    name: 'address',
    type: 'address',
    required: false,
    category: 'location',
    aliases: [
      'address', 'street', 'street_address', 'address_line_1', 'address1',
      'mailing_address', 'physical_address', 'location_address'
    ],
  },
  {
    name: 'address_line_2',
    type: 'string',
    required: false,
    category: 'location',
    aliases: [
      'address_2', 'address_line_2', 'address2', 'suite', 'unit',
      'apt', 'apartment', 'floor'
    ],
  },
  {
    name: 'city',
    type: 'string',
    required: false,
    category: 'location',
    aliases: [
      'city', 'town', 'municipality', 'locality', 'company_city',
      'location_city', 'hq_city'
    ],
  },
  {
    name: 'state',
    type: 'string',
    required: false,
    category: 'location',
    aliases: [
      'state', 'province', 'region', 'state_province', 'state_code',
      'company_state', 'location_state', 'hq_state', 'territory'
    ],
  },
  {
    name: 'postal_code',
    type: 'string',
    required: false,
    category: 'location',
    aliases: [
      'zip', 'zipcode', 'zip_code', 'postal', 'postal_code', 'postcode',
      'post_code', 'zip_postal'
    ],
  },
  {
    name: 'country',
    type: 'string',
    required: false,
    category: 'location',
    aliases: [
      'country', 'nation', 'country_code', 'country_name', 'company_country',
      'location_country', 'hq_country'
    ],
  },

  // Meta Fields
  {
    name: 'lead_source',
    type: 'string',
    required: false,
    category: 'meta',
    aliases: [
      'source', 'lead_source', 'leadsource', 'origin', 'channel',
      'acquisition_source', 'how_found', 'referral_source'
    ],
  },
  {
    name: 'intent_score',
    type: 'number',
    required: false,
    category: 'meta',
    aliases: [
      'intent', 'intent_score', 'score', 'lead_score', 'quality_score',
      'rating', 'priority', 'hot_score'
    ],
  },
  {
    name: 'notes',
    type: 'string',
    required: false,
    category: 'meta',
    aliases: [
      'notes', 'comments', 'description', 'remarks', 'memo',
      'additional_info', 'extra_info'
    ],
  },
  {
    name: 'tags',
    type: 'string',
    required: false,
    category: 'meta',
    aliases: [
      'tags', 'labels', 'categories', 'keywords', 'topics'
    ],
  },
]

// ============================================
// FUZZY MATCHING UTILITIES
// ============================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Calculate similarity score (0-1) between two strings
 */
function similarityScore(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(a, b)
  return 1 - distance / maxLen
}

/**
 * Normalize a header string for comparison
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

// ============================================
// FIELD MAPPER CLASS
// ============================================

export interface FieldMapping {
  sourceHeader: string
  targetField: string | null
  confidence: number
  matchType: 'exact' | 'alias' | 'fuzzy' | 'pattern' | 'none'
  suggestions: Array<{ field: string; confidence: number }>
}

export interface MappingResult {
  mappings: FieldMapping[]
  unmappedHeaders: string[]
  missingRequired: string[]
  warnings: string[]
}

export class FieldMapperService {
  private fields: StandardField[]
  private aliasMap: Map<string, string>

  constructor(customFields?: StandardField[]) {
    this.fields = customFields || STANDARD_FIELDS
    this.aliasMap = this.buildAliasMap()
  }

  /**
   * Build a map of all aliases to field names
   */
  private buildAliasMap(): Map<string, string> {
    const map = new Map<string, string>()
    for (const field of this.fields) {
      map.set(normalizeHeader(field.name), field.name)
      for (const alias of field.aliases) {
        map.set(normalizeHeader(alias), field.name)
      }
    }
    return map
  }

  /**
   * Map CSV headers to standard fields
   */
  mapHeaders(headers: string[]): MappingResult {
    const mappings: FieldMapping[] = []
    const usedFields = new Set<string>()

    for (const header of headers) {
      const mapping = this.mapSingleHeader(header, usedFields)
      mappings.push(mapping)
      if (mapping.targetField) {
        usedFields.add(mapping.targetField)
      }
    }

    // Find unmapped headers
    const unmappedHeaders = mappings
      .filter((m) => !m.targetField)
      .map((m) => m.sourceHeader)

    // Find missing required fields
    const missingRequired = this.fields
      .filter((f) => f.required && !usedFields.has(f.name))
      .map((f) => f.name)

    // Generate warnings
    const warnings: string[] = []
    if (missingRequired.length > 0) {
      warnings.push(`Missing required fields: ${missingRequired.join(', ')}`)
    }
    if (unmappedHeaders.length > 0) {
      warnings.push(`${unmappedHeaders.length} column(s) could not be automatically mapped`)
    }

    return { mappings, unmappedHeaders, missingRequired, warnings }
  }

  /**
   * Map a single header to a standard field
   */
  private mapSingleHeader(header: string, usedFields: Set<string>): FieldMapping {
    const normalized = normalizeHeader(header)
    const suggestions: Array<{ field: string; confidence: number }> = []

    // 1. Check exact alias match
    const exactMatch = this.aliasMap.get(normalized)
    if (exactMatch && !usedFields.has(exactMatch)) {
      return {
        sourceHeader: header,
        targetField: exactMatch,
        confidence: 1.0,
        matchType: 'exact',
        suggestions: [],
      }
    }

    // 2. Check pattern matches
    for (const field of this.fields) {
      if (usedFields.has(field.name)) continue
      if (field.patterns) {
        for (const pattern of field.patterns) {
          if (pattern.test(header)) {
            suggestions.push({ field: field.name, confidence: 0.9 })
          }
        }
      }
    }

    // 3. Fuzzy match against all aliases
    for (const field of this.fields) {
      if (usedFields.has(field.name)) continue

      let bestScore = 0
      for (const alias of [field.name, ...field.aliases]) {
        const score = similarityScore(normalized, normalizeHeader(alias))
        if (score > bestScore) {
          bestScore = score
        }
      }

      if (bestScore >= 0.6) {
        suggestions.push({ field: field.name, confidence: bestScore })
      }
    }

    // Sort suggestions by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence)

    // Remove duplicates
    const uniqueSuggestions = suggestions.filter(
      (s, i, arr) => arr.findIndex((x) => x.field === s.field) === i
    )

    // If we have a high-confidence suggestion, use it
    if (uniqueSuggestions.length > 0 && uniqueSuggestions[0].confidence >= 0.8) {
      return {
        sourceHeader: header,
        targetField: uniqueSuggestions[0].field,
        confidence: uniqueSuggestions[0].confidence,
        matchType: uniqueSuggestions[0].confidence === 1.0 ? 'alias' : 'fuzzy',
        suggestions: uniqueSuggestions.slice(1, 4),
      }
    }

    // Return with suggestions but no auto-mapping
    return {
      sourceHeader: header,
      targetField: null,
      confidence: 0,
      matchType: 'none',
      suggestions: uniqueSuggestions.slice(0, 4),
    }
  }

  /**
   * Apply mappings to transform a row of data
   */
  transformRow(
    row: Record<string, string>,
    mappings: FieldMapping[]
  ): Record<string, string> {
    const result: Record<string, string> = {}

    for (const mapping of mappings) {
      if (!mapping.targetField) continue

      const value = row[mapping.sourceHeader]
      if (value === undefined || value === null || value === '') continue

      const field = this.fields.find((f) => f.name === mapping.targetField)
      if (field?.transformer) {
        result[mapping.targetField] = field.transformer(value)
      } else {
        result[mapping.targetField] = value.trim()
      }
    }

    return result
  }

  /**
   * Validate a transformed row
   */
  validateRow(row: Record<string, string>): {
    valid: boolean
    errors: Array<{ field: string; message: string }>
  } {
    const errors: Array<{ field: string; message: string }> = []

    for (const field of this.fields) {
      const value = row[field.name]

      // Check required
      if (field.required && (!value || value.trim() === '')) {
        errors.push({ field: field.name, message: `${field.name} is required` })
        continue
      }

      // Run validator if value exists
      if (value && field.validator && !field.validator(value)) {
        errors.push({ field: field.name, message: `Invalid ${field.name} format` })
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Get all standard fields
   */
  getStandardFields(): StandardField[] {
    return this.fields
  }

  /**
   * Get fields by category
   */
  getFieldsByCategory(category: StandardField['category']): StandardField[] {
    return this.fields.filter((f) => f.category === category)
  }
}

// Export singleton instance
export const fieldMapper = new FieldMapperService()
