/**
 * Unit tests for safe number parsing utilities
 */

import { describe, it, expect } from 'vitest'
import { safeParseInt, safeParseFloat, safeParsePagination } from '@/lib/utils/parse-number'

describe('safeParseInt', () => {
  describe('basic parsing', () => {
    it('should parse valid integer strings', () => {
      expect(safeParseInt('42')).toBe(42)
      expect(safeParseInt('0')).toBe(0)
      expect(safeParseInt('-10')).toBe(-10)
      expect(safeParseInt('999')).toBe(999)
    })

    it('should handle null and undefined', () => {
      expect(safeParseInt(null)).toBe(0)
      expect(safeParseInt(undefined)).toBe(0)
      expect(safeParseInt('')).toBe(0)
    })

    it('should use fallback for invalid strings', () => {
      expect(safeParseInt('abc')).toBe(0)
      expect(safeParseInt('12.34.56')).toBe(12) // parseInt stops at first invalid char
      expect(safeParseInt('NaN')).toBe(0)
      expect(safeParseInt('Infinity')).toBe(0)
    })
  })

  describe('fallback option', () => {
    it('should use custom fallback value', () => {
      expect(safeParseInt('abc', { fallback: 100 })).toBe(100)
      expect(safeParseInt(null, { fallback: -1 })).toBe(-1)
      expect(safeParseInt('', { fallback: 999 })).toBe(999)
    })
  })

  describe('min constraint', () => {
    it('should enforce minimum value', () => {
      expect(safeParseInt('5', { min: 10 })).toBe(10)
      expect(safeParseInt('-100', { min: 0 })).toBe(0)
      expect(safeParseInt('1', { min: 1 })).toBe(1)
    })

    it('should allow values above minimum', () => {
      expect(safeParseInt('50', { min: 10 })).toBe(50)
      expect(safeParseInt('100', { min: 0 })).toBe(100)
    })
  })

  describe('max constraint', () => {
    it('should enforce maximum value', () => {
      expect(safeParseInt('150', { max: 100 })).toBe(100)
      expect(safeParseInt('1000', { max: 500 })).toBe(500)
      expect(safeParseInt('100', { max: 100 })).toBe(100)
    })

    it('should allow values below maximum', () => {
      expect(safeParseInt('50', { max: 100 })).toBe(50)
      expect(safeParseInt('1', { max: 1000 })).toBe(1)
    })
  })

  describe('min and max together', () => {
    it('should enforce both constraints', () => {
      expect(safeParseInt('5', { min: 10, max: 100 })).toBe(10)
      expect(safeParseInt('150', { min: 10, max: 100 })).toBe(100)
      expect(safeParseInt('50', { min: 10, max: 100 })).toBe(50)
    })

    it('should handle fallback with constraints', () => {
      expect(safeParseInt('abc', { min: 10, max: 100, fallback: 5 })).toBe(10)
      expect(safeParseInt('abc', { min: 10, max: 100, fallback: 50 })).toBe(50)
      expect(safeParseInt('abc', { min: 10, max: 100, fallback: 150 })).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('should handle leading/trailing whitespace', () => {
      expect(safeParseInt('  42  ')).toBe(42)
      expect(safeParseInt('\n100\n')).toBe(100)
    })

    it('should handle decimal strings (truncates)', () => {
      expect(safeParseInt('42.7')).toBe(42)
      expect(safeParseInt('99.999')).toBe(99)
    })

    it('should handle negative zero', () => {
      const result = safeParseInt('-0')
      expect(result === 0 || result === -0).toBe(true) // JS treats -0 and 0 as equal
    })

    it('should handle very large numbers', () => {
      expect(safeParseInt('999999999')).toBe(999999999)
    })
  })
})

describe('safeParseFloat', () => {
  describe('basic parsing', () => {
    it('should parse valid float strings', () => {
      expect(safeParseFloat('42.5')).toBe(42.5)
      expect(safeParseFloat('0.0')).toBe(0.0)
      expect(safeParseFloat('-10.25')).toBe(-10.25)
      expect(safeParseFloat('999.999')).toBe(999.999)
    })

    it('should parse integer strings', () => {
      expect(safeParseFloat('42')).toBe(42)
      expect(safeParseFloat('0')).toBe(0)
    })

    it('should handle null and undefined', () => {
      expect(safeParseFloat(null)).toBe(0)
      expect(safeParseFloat(undefined)).toBe(0)
      expect(safeParseFloat('')).toBe(0)
    })

    it('should use fallback for invalid strings', () => {
      expect(safeParseFloat('abc')).toBe(0)
      expect(safeParseFloat('12.34.56')).toBe(12.34) // parseFloat stops at first invalid char
      expect(safeParseFloat('NaN')).toBe(0)
    })
  })

  describe('fallback option', () => {
    it('should use custom fallback value', () => {
      expect(safeParseFloat('abc', { fallback: 100.5 })).toBe(100.5)
      expect(safeParseFloat(null, { fallback: -1.5 })).toBe(-1.5)
    })
  })

  describe('min constraint', () => {
    it('should enforce minimum value', () => {
      expect(safeParseFloat('5.5', { min: 10.0 })).toBe(10.0)
      expect(safeParseFloat('-100.5', { min: 0.0 })).toBe(0.0)
    })

    it('should allow values above minimum', () => {
      expect(safeParseFloat('50.5', { min: 10.0 })).toBe(50.5)
    })
  })

  describe('max constraint', () => {
    it('should enforce maximum value', () => {
      expect(safeParseFloat('150.5', { max: 100.0 })).toBe(100.0)
      expect(safeParseFloat('1000.99', { max: 500.0 })).toBe(500.0)
    })

    it('should allow values below maximum', () => {
      expect(safeParseFloat('50.5', { max: 100.0 })).toBe(50.5)
    })
  })

  describe('edge cases', () => {
    it('should handle scientific notation', () => {
      expect(safeParseFloat('1e2')).toBe(100)
      expect(safeParseFloat('1.5e2')).toBe(150)
    })

    it('should handle leading/trailing whitespace', () => {
      expect(safeParseFloat('  42.5  ')).toBe(42.5)
    })

    it('should handle decimal without leading zero', () => {
      expect(safeParseFloat('.5')).toBe(0.5)
      expect(safeParseFloat('-.5')).toBe(-0.5)
    })
  })
})

describe('safeParsePagination', () => {
  describe('default behavior', () => {
    it('should use default values for null/undefined', () => {
      const result = safeParsePagination(null, null)
      expect(result).toEqual({
        page: 1,
        limit: 50,
        offset: 0,
      })
    })

    it('should use default values for invalid strings', () => {
      const result = safeParsePagination('abc', 'xyz')
      expect(result).toEqual({
        page: 1,
        limit: 50,
        offset: 0,
      })
    })
  })

  describe('valid pagination', () => {
    it('should parse valid page and limit', () => {
      const result = safeParsePagination('2', '100')
      expect(result).toEqual({
        page: 2,
        limit: 100,
        offset: 100, // (2-1) * 100
      })
    })

    it('should calculate correct offset', () => {
      const result1 = safeParsePagination('1', '10')
      expect(result1.offset).toBe(0)

      const result2 = safeParsePagination('3', '25')
      expect(result2.offset).toBe(50) // (3-1) * 25

      const result3 = safeParsePagination('10', '100')
      expect(result3.offset).toBe(900) // (10-1) * 100
    })
  })

  describe('custom defaults', () => {
    it('should use custom default page', () => {
      const result = safeParsePagination(null, null, { defaultPage: 5 })
      expect(result.page).toBe(5)
      expect(result.offset).toBe(200) // (5-1) * 50
    })

    it('should use custom default limit', () => {
      const result = safeParsePagination(null, null, { defaultLimit: 100 })
      expect(result.limit).toBe(100)
      expect(result.offset).toBe(0)
    })

    it('should use both custom defaults', () => {
      const result = safeParsePagination(null, null, {
        defaultPage: 2,
        defaultLimit: 25,
      })
      expect(result).toEqual({
        page: 2,
        limit: 25,
        offset: 25, // (2-1) * 25
      })
    })
  })

  describe('max limit constraint', () => {
    it('should enforce maxLimit', () => {
      const result = safeParsePagination('1', '5000', { maxLimit: 1000 })
      expect(result.limit).toBe(1000)
    })

    it('should allow limits below maxLimit', () => {
      const result = safeParsePagination('1', '100', { maxLimit: 1000 })
      expect(result.limit).toBe(100)
    })

    it('should handle default limit with maxLimit', () => {
      const result = safeParsePagination(null, null, {
        defaultLimit: 200,
        maxLimit: 150,
      })
      expect(result.limit).toBe(150) // defaultLimit capped by maxLimit
    })
  })

  describe('minimum constraints', () => {
    it('should enforce page minimum of 1', () => {
      const result1 = safeParsePagination('0', '50')
      expect(result1.page).toBe(1)

      const result2 = safeParsePagination('-5', '50')
      expect(result2.page).toBe(1)
    })

    it('should enforce limit minimum of 1', () => {
      const result1 = safeParsePagination('1', '0')
      expect(result1.limit).toBe(1)

      const result2 = safeParsePagination('1', '-10')
      expect(result2.limit).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle very large page numbers', () => {
      const result = safeParsePagination('999999', '50')
      expect(result.page).toBe(999999)
      expect(result.offset).toBe(49999900) // (999999-1) * 50 = 999998 * 50
    })

    it('should handle fractional strings (truncates)', () => {
      const result = safeParsePagination('2.7', '10.9')
      expect(result).toEqual({
        page: 2,
        limit: 10,
        offset: 10,
      })
    })

    it('should handle whitespace', () => {
      const result = safeParsePagination('  3  ', '  20  ')
      expect(result).toEqual({
        page: 3,
        limit: 20,
        offset: 40,
      })
    })
  })

  describe('real-world scenarios', () => {
    it('should handle typical pagination requests', () => {
      // First page
      const page1 = safeParsePagination('1', '50')
      expect(page1.offset).toBe(0)

      // Second page
      const page2 = safeParsePagination('2', '50')
      expect(page2.offset).toBe(50)

      // Last page of 100 items with limit 20
      const page5 = safeParsePagination('5', '20')
      expect(page5.offset).toBe(80)
    })

    it('should handle API route scenarios', () => {
      // Query params from URL: ?page=3&limit=100
      const result = safeParsePagination('3', '100', { maxLimit: 500 })
      expect(result).toEqual({
        page: 3,
        limit: 100,
        offset: 200,
      })
    })

    it('should handle malicious input safely', () => {
      const result = safeParsePagination('999999999999999', '999999', {
        maxLimit: 1000,
      })
      expect(result.limit).toBe(1000) // Capped
      expect(result.page).toBeGreaterThan(0) // Still valid
    })
  })
})
