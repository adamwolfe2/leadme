/**
 * Address Standardization Service
 * OpenInfo Platform
 *
 * Normalizes and standardizes address data including:
 * - US state names/abbreviations
 * - City name corrections
 * - Country standardization
 * - Phone number formatting
 */

// ============================================
// US STATE DATA
// ============================================

export const US_STATES: Record<string, { name: string; abbrev: string; region: string }> = {
  // Full names map to data
  'alabama': { name: 'Alabama', abbrev: 'AL', region: 'Southeast' },
  'alaska': { name: 'Alaska', abbrev: 'AK', region: 'West' },
  'arizona': { name: 'Arizona', abbrev: 'AZ', region: 'Southwest' },
  'arkansas': { name: 'Arkansas', abbrev: 'AR', region: 'Southeast' },
  'california': { name: 'California', abbrev: 'CA', region: 'West' },
  'colorado': { name: 'Colorado', abbrev: 'CO', region: 'West' },
  'connecticut': { name: 'Connecticut', abbrev: 'CT', region: 'Northeast' },
  'delaware': { name: 'Delaware', abbrev: 'DE', region: 'Northeast' },
  'florida': { name: 'Florida', abbrev: 'FL', region: 'Southeast' },
  'georgia': { name: 'Georgia', abbrev: 'GA', region: 'Southeast' },
  'hawaii': { name: 'Hawaii', abbrev: 'HI', region: 'West' },
  'idaho': { name: 'Idaho', abbrev: 'ID', region: 'West' },
  'illinois': { name: 'Illinois', abbrev: 'IL', region: 'Midwest' },
  'indiana': { name: 'Indiana', abbrev: 'IN', region: 'Midwest' },
  'iowa': { name: 'Iowa', abbrev: 'IA', region: 'Midwest' },
  'kansas': { name: 'Kansas', abbrev: 'KS', region: 'Midwest' },
  'kentucky': { name: 'Kentucky', abbrev: 'KY', region: 'Southeast' },
  'louisiana': { name: 'Louisiana', abbrev: 'LA', region: 'Southeast' },
  'maine': { name: 'Maine', abbrev: 'ME', region: 'Northeast' },
  'maryland': { name: 'Maryland', abbrev: 'MD', region: 'Northeast' },
  'massachusetts': { name: 'Massachusetts', abbrev: 'MA', region: 'Northeast' },
  'michigan': { name: 'Michigan', abbrev: 'MI', region: 'Midwest' },
  'minnesota': { name: 'Minnesota', abbrev: 'MN', region: 'Midwest' },
  'mississippi': { name: 'Mississippi', abbrev: 'MS', region: 'Southeast' },
  'missouri': { name: 'Missouri', abbrev: 'MO', region: 'Midwest' },
  'montana': { name: 'Montana', abbrev: 'MT', region: 'West' },
  'nebraska': { name: 'Nebraska', abbrev: 'NE', region: 'Midwest' },
  'nevada': { name: 'Nevada', abbrev: 'NV', region: 'West' },
  'new hampshire': { name: 'New Hampshire', abbrev: 'NH', region: 'Northeast' },
  'new jersey': { name: 'New Jersey', abbrev: 'NJ', region: 'Northeast' },
  'new mexico': { name: 'New Mexico', abbrev: 'NM', region: 'Southwest' },
  'new york': { name: 'New York', abbrev: 'NY', region: 'Northeast' },
  'north carolina': { name: 'North Carolina', abbrev: 'NC', region: 'Southeast' },
  'north dakota': { name: 'North Dakota', abbrev: 'ND', region: 'Midwest' },
  'ohio': { name: 'Ohio', abbrev: 'OH', region: 'Midwest' },
  'oklahoma': { name: 'Oklahoma', abbrev: 'OK', region: 'Southwest' },
  'oregon': { name: 'Oregon', abbrev: 'OR', region: 'West' },
  'pennsylvania': { name: 'Pennsylvania', abbrev: 'PA', region: 'Northeast' },
  'rhode island': { name: 'Rhode Island', abbrev: 'RI', region: 'Northeast' },
  'south carolina': { name: 'South Carolina', abbrev: 'SC', region: 'Southeast' },
  'south dakota': { name: 'South Dakota', abbrev: 'SD', region: 'Midwest' },
  'tennessee': { name: 'Tennessee', abbrev: 'TN', region: 'Southeast' },
  'texas': { name: 'Texas', abbrev: 'TX', region: 'Southwest' },
  'utah': { name: 'Utah', abbrev: 'UT', region: 'West' },
  'vermont': { name: 'Vermont', abbrev: 'VT', region: 'Northeast' },
  'virginia': { name: 'Virginia', abbrev: 'VA', region: 'Southeast' },
  'washington': { name: 'Washington', abbrev: 'WA', region: 'West' },
  'west virginia': { name: 'West Virginia', abbrev: 'WV', region: 'Southeast' },
  'wisconsin': { name: 'Wisconsin', abbrev: 'WI', region: 'Midwest' },
  'wyoming': { name: 'Wyoming', abbrev: 'WY', region: 'West' },
  'district of columbia': { name: 'District of Columbia', abbrev: 'DC', region: 'Northeast' },
}

// Build abbreviation lookup
const STATE_ABBREV_MAP: Record<string, string> = {}
for (const [key, data] of Object.entries(US_STATES)) {
  STATE_ABBREV_MAP[data.abbrev.toLowerCase()] = key
}

// Common misspellings and variations
const STATE_ALIASES: Record<string, string> = {
  'calif': 'california',
  'cal': 'california',
  'cali': 'california',
  'fla': 'florida',
  'flo': 'florida',
  'tex': 'texas',
  'penn': 'pennsylvania',
  'penna': 'pennsylvania',
  'mass': 'massachusetts',
  'mich': 'michigan',
  'minn': 'minnesota',
  'miss': 'mississippi',
  'tenn': 'tennessee',
  'wash': 'washington',
  'wisc': 'wisconsin',
  'wis': 'wisconsin',
  'n.y.': 'new york',
  'ny': 'new york',
  'nyc': 'new york',
  'n.j.': 'new jersey',
  'n.c.': 'north carolina',
  's.c.': 'south carolina',
  'n.d.': 'north dakota',
  's.d.': 'south dakota',
  'w.v.': 'west virginia',
  'w.va.': 'west virginia',
  'd.c.': 'district of columbia',
  'dc': 'district of columbia',
  'washington dc': 'district of columbia',
  'washington d.c.': 'district of columbia',
}

// ============================================
// COUNTRY DATA
// ============================================

const COUNTRY_ALIASES: Record<string, string> = {
  'usa': 'United States',
  'us': 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  'united states of america': 'United States',
  'america': 'United States',
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'great britain': 'United Kingdom',
  'britain': 'United Kingdom',
  'england': 'United Kingdom',
  'uae': 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
}

// ============================================
// CITY NORMALIZATION
// ============================================

const CITY_ALIASES: Record<string, string> = {
  'nyc': 'New York',
  'new york city': 'New York',
  'manhattan': 'New York',
  'la': 'Los Angeles',
  'l.a.': 'Los Angeles',
  'sf': 'San Francisco',
  's.f.': 'San Francisco',
  'san fran': 'San Francisco',
  'philly': 'Philadelphia',
  'vegas': 'Las Vegas',
  'dc': 'Washington',
  'd.c.': 'Washington',
  'chi-town': 'Chicago',
  'chi': 'Chicago',
  'atl': 'Atlanta',
  'dallas-fort worth': 'Dallas',
  'dfw': 'Dallas',
  'miami-dade': 'Miami',
  'mpls': 'Minneapolis',
  'indy': 'Indianapolis',
  'nola': 'New Orleans',
  'stl': 'St. Louis',
  'saint louis': 'St. Louis',
  'st louis': 'St. Louis',
}

// ============================================
// ADDRESS STANDARDIZATION CLASS
// ============================================

export interface StandardizedAddress {
  address?: string
  address_line_2?: string
  city?: string
  state?: string
  state_abbrev?: string
  state_full?: string
  region?: string
  postal_code?: string
  country?: string
  country_code?: string
  normalized: boolean
  corrections: string[]
}

export interface StandardizedPhone {
  original: string
  formatted: string
  digits: string
  country_code?: string
  area_code?: string
  is_valid: boolean
  type?: 'mobile' | 'landline' | 'unknown'
}

export class AddressStandardizationService {
  /**
   * Standardize a US state input
   */
  standardizeState(input: string | null | undefined): {
    abbrev: string | null
    full: string | null
    region: string | null
    original: string
    corrected: boolean
  } {
    if (!input) {
      return { abbrev: null, full: null, region: null, original: '', corrected: false }
    }

    const original = input
    const normalized = input.toLowerCase().trim().replace(/\./g, '')

    // Check direct match in states
    if (US_STATES[normalized]) {
      const state = US_STATES[normalized]
      return {
        abbrev: state.abbrev,
        full: state.name,
        region: state.region,
        original,
        corrected: false,
      }
    }

    // Check abbreviation match
    if (STATE_ABBREV_MAP[normalized]) {
      const state = US_STATES[STATE_ABBREV_MAP[normalized]]
      return {
        abbrev: state.abbrev,
        full: state.name,
        region: state.region,
        original,
        corrected: false,
      }
    }

    // Check aliases
    if (STATE_ALIASES[normalized]) {
      const state = US_STATES[STATE_ALIASES[normalized]]
      return {
        abbrev: state.abbrev,
        full: state.name,
        region: state.region,
        original,
        corrected: true,
      }
    }

    // Fuzzy match - find closest state name
    let bestMatch: string | null = null
    let bestScore = 0

    for (const stateName of Object.keys(US_STATES)) {
      const score = this.similarityScore(normalized, stateName)
      if (score > bestScore && score >= 0.8) {
        bestScore = score
        bestMatch = stateName
      }
    }

    if (bestMatch) {
      const state = US_STATES[bestMatch]
      return {
        abbrev: state.abbrev,
        full: state.name,
        region: state.region,
        original,
        corrected: true,
      }
    }

    // Return original if no match
    return { abbrev: null, full: null, region: null, original, corrected: false }
  }

  /**
   * Standardize a city name
   */
  standardizeCity(input: string | null | undefined): {
    city: string | null
    original: string
    corrected: boolean
  } {
    if (!input) {
      return { city: null, original: '', corrected: false }
    }

    const original = input
    const normalized = input.toLowerCase().trim()

    // Check aliases
    if (CITY_ALIASES[normalized]) {
      return {
        city: CITY_ALIASES[normalized],
        original,
        corrected: true,
      }
    }

    // Title case the city name
    const titleCased = this.toTitleCase(input.trim())
    return {
      city: titleCased,
      original,
      corrected: titleCased !== input,
    }
  }

  /**
   * Standardize a country name
   */
  standardizeCountry(input: string | null | undefined): {
    country: string | null
    code: string | null
    original: string
    corrected: boolean
  } {
    if (!input) {
      // Default to US
      return { country: 'United States', code: 'US', original: '', corrected: false }
    }

    const original = input
    const normalized = input.toLowerCase().trim().replace(/\./g, '')

    // Check aliases
    if (COUNTRY_ALIASES[normalized]) {
      const country = COUNTRY_ALIASES[normalized]
      return {
        country,
        code: country === 'United States' ? 'US' : country === 'United Kingdom' ? 'UK' : null,
        original,
        corrected: true,
      }
    }

    // Title case if not found
    return {
      country: this.toTitleCase(input.trim()),
      code: null,
      original,
      corrected: false,
    }
  }

  /**
   * Standardize a postal/zip code
   */
  standardizePostalCode(input: string | null | undefined, country?: string): {
    postal_code: string | null
    original: string
    corrected: boolean
    valid: boolean
  } {
    if (!input) {
      return { postal_code: null, original: '', corrected: false, valid: false }
    }

    const original = input
    let cleaned = input.trim()

    // US ZIP code handling
    if (!country || country === 'United States' || country === 'US') {
      // Remove non-digits except hyphen
      cleaned = cleaned.replace(/[^\d-]/g, '')

      // Handle ZIP+4 format
      if (/^\d{5}-?\d{4}$/.test(cleaned)) {
        const digits = cleaned.replace('-', '')
        const formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`
        return {
          postal_code: formatted,
          original,
          corrected: formatted !== original,
          valid: true,
        }
      }

      // Handle 5-digit ZIP
      if (/^\d{5}$/.test(cleaned)) {
        return {
          postal_code: cleaned,
          original,
          corrected: cleaned !== original,
          valid: true,
        }
      }

      // Try to extract 5 digits
      const digits = cleaned.replace(/\D/g, '')
      if (digits.length >= 5) {
        return {
          postal_code: digits.slice(0, 5),
          original,
          corrected: true,
          valid: true,
        }
      }
    }

    return {
      postal_code: cleaned,
      original,
      corrected: cleaned !== original,
      valid: false,
    }
  }

  /**
   * Standardize a phone number
   */
  standardizePhone(input: string | null | undefined): StandardizedPhone {
    if (!input) {
      return {
        original: '',
        formatted: '',
        digits: '',
        is_valid: false,
      }
    }

    const original = input
    const digits = input.replace(/\D/g, '')

    // US phone number (10 digits or 11 with leading 1)
    let normalizedDigits = digits
    if (digits.length === 11 && digits.startsWith('1')) {
      normalizedDigits = digits.slice(1)
    }

    if (normalizedDigits.length === 10) {
      const areaCode = normalizedDigits.slice(0, 3)
      const prefix = normalizedDigits.slice(3, 6)
      const line = normalizedDigits.slice(6)

      return {
        original,
        formatted: `(${areaCode}) ${prefix}-${line}`,
        digits: normalizedDigits,
        country_code: '1',
        area_code: areaCode,
        is_valid: true,
        type: 'unknown',
      }
    }

    // International or invalid
    return {
      original,
      formatted: input.trim(),
      digits,
      is_valid: digits.length >= 7,
    }
  }

  /**
   * Standardize a complete address object
   */
  standardizeAddress(input: {
    address?: string
    address_line_2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }): StandardizedAddress {
    const corrections: string[] = []

    // Standardize country first (affects other validations)
    const countryResult = this.standardizeCountry(input.country)
    if (countryResult.corrected) {
      corrections.push(`Country: "${input.country}" → "${countryResult.country}"`)
    }

    // Standardize state
    const stateResult = this.standardizeState(input.state)
    if (stateResult.corrected) {
      corrections.push(`State: "${input.state}" → "${stateResult.full}"`)
    }

    // Standardize city
    const cityResult = this.standardizeCity(input.city)
    if (cityResult.corrected) {
      corrections.push(`City: "${input.city}" → "${cityResult.city}"`)
    }

    // Standardize postal code
    const postalResult = this.standardizePostalCode(input.postal_code, countryResult.country || undefined)
    if (postalResult.corrected) {
      corrections.push(`Postal code: "${input.postal_code}" → "${postalResult.postal_code}"`)
    }

    // Standardize address (basic cleanup)
    let address = input.address?.trim()
    if (address) {
      // Standardize common abbreviations
      address = this.standardizeStreetAddress(address)
    }

    return {
      address,
      address_line_2: input.address_line_2?.trim(),
      city: cityResult.city || undefined,
      state: stateResult.abbrev || stateResult.original || undefined,
      state_abbrev: stateResult.abbrev || undefined,
      state_full: stateResult.full || undefined,
      region: stateResult.region || undefined,
      postal_code: postalResult.postal_code || undefined,
      country: countryResult.country || undefined,
      country_code: countryResult.code || undefined,
      normalized: true,
      corrections,
    }
  }

  /**
   * Standardize street address abbreviations
   */
  private standardizeStreetAddress(address: string): string {
    const replacements: Record<string, string> = {
      ' st\\.?$': ' Street',
      ' st\\.? ': ' Street ',
      ' ave\\.?$': ' Avenue',
      ' ave\\.? ': ' Avenue ',
      ' blvd\\.?$': ' Boulevard',
      ' blvd\\.? ': ' Boulevard ',
      ' rd\\.?$': ' Road',
      ' rd\\.? ': ' Road ',
      ' dr\\.?$': ' Drive',
      ' dr\\.? ': ' Drive ',
      ' ln\\.?$': ' Lane',
      ' ln\\.? ': ' Lane ',
      ' ct\\.?$': ' Court',
      ' ct\\.? ': ' Court ',
      ' pl\\.?$': ' Place',
      ' pl\\.? ': ' Place ',
      ' cir\\.?$': ' Circle',
      ' cir\\.? ': ' Circle ',
      ' hwy\\.?$': ' Highway',
      ' hwy\\.? ': ' Highway ',
      ' pkwy\\.?$': ' Parkway',
      ' pkwy\\.? ': ' Parkway ',
      ' ste\\.? ': ' Suite ',
      ' apt\\.? ': ' Apartment ',
      ' fl\\.? ': ' Floor ',
    }

    let result = address
    for (const [pattern, replacement] of Object.entries(replacements)) {
      result = result.replace(new RegExp(pattern, 'gi'), replacement)
    }

    return result
  }

  /**
   * Convert string to title case
   */
  private toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Calculate similarity score between two strings (Levenshtein-based)
   */
  private similarityScore(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length)
    if (maxLen === 0) return 1

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
    return 1 - matrix[b.length][a.length] / maxLen
  }

  /**
   * Get state data by abbreviation
   */
  getStateByAbbrev(abbrev: string): { name: string; abbrev: string; region: string } | null {
    const normalized = abbrev.toLowerCase()
    const stateName = STATE_ABBREV_MAP[normalized]
    return stateName ? US_STATES[stateName] : null
  }

  /**
   * Get all states in a region
   */
  getStatesByRegion(region: string): Array<{ name: string; abbrev: string }> {
    return Object.values(US_STATES)
      .filter((s) => s.region.toLowerCase() === region.toLowerCase())
      .map((s) => ({ name: s.name, abbrev: s.abbrev }))
  }

  /**
   * Get all US regions
   */
  getRegions(): string[] {
    return [...new Set(Object.values(US_STATES).map((s) => s.region))]
  }
}

// Export singleton instance
export const addressStandardization = new AddressStandardizationService()
