/**
 * Firecrawl Library Tests
 * Tests for brand DNA extraction with Firecrawl API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================
// MOCKS
// ============================================

const { mockScrape } = vi.hoisted(() => {
  return {
    mockScrape: vi.fn(),
  }
})

// Mock @mendable/firecrawl-js
vi.mock('@mendable/firecrawl-js', () => {
  return {
    default: class MockFirecrawlApp {
      scrape = mockScrape
    },
  }
})

// Import AFTER mocks
import { extractBrandDNA, isValidUrl } from '@/lib/ai-studio/firecrawl'

// ============================================
// TEST DATA
// ============================================

const mockScrapeResult = {
  markdown: '# Acme Corp\n\nLeading innovation',
  html: '<html><body><h1>Acme Corp</h1></body></html>',
  links: ['https://acme.com/about', 'https://acme.com/pricing'],
  screenshot: 'https://example.com/screenshot.png',
}

const mockExtractResult = {
  extract: {
    company_name: 'Acme Corp',
    logo_url: 'https://acme.com/logo.png',
    favicon_url: 'https://acme.com/favicon.ico',
    primary_color: '#FF0000',
    secondary_color: '#0000FF',
    accent_color: '#00FF00',
    background_color: '#FFFFFF',
    heading_font: 'Great Vibes',
    body_font: 'Inter',
    headline: 'Innovation at Scale',
    tagline: 'Building the Future',
    value_propositions: ['Fast delivery', 'Best quality', 'Great support'],
    brand_personality: ['Professional', 'Innovative', 'Trustworthy'],
    hero_images: ['https://acme.com/hero.jpg'],
    product_images: ['https://acme.com/product1.jpg', 'https://acme.com/product2.jpg'],
    team_images: ['https://acme.com/team.jpg'],
    icon_urls: ['https://acme.com/icon1.svg', 'https://acme.com/icon2.svg'],
    og_image: 'https://acme.com/og-image.jpg',
    meta_description: 'Acme Corp is the leading provider of innovative solutions',
  },
}

// ============================================
// TESTS
// ============================================

describe('Firecrawl Library', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: FIRECRAWL_API_KEY is set
    vi.stubEnv('FIRECRAWL_API_KEY', 'test-firecrawl-key')

    // Default: Successful scrape (first call for content, second for extraction)
    mockScrape
      .mockResolvedValueOnce(mockScrapeResult) // First call: scrape for content
      .mockResolvedValueOnce(mockExtractResult) // Second call: LLM extraction
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // ============================================
  // ENVIRONMENT VALIDATION
  // ============================================

  describe('Environment Validation', () => {
    it('should throw when FIRECRAWL_API_KEY is missing', async () => {
      vi.unstubAllEnvs()
      delete process.env.FIRECRAWL_API_KEY

      await expect(extractBrandDNA('https://example.com')).rejects.toThrow(
        /FIRECRAWL_API_KEY.*not set/i
      )
    })

    it('should successfully extract when API key is set', async () => {
      const result = await extractBrandDNA('https://example.com')

      // Should complete without throwing
      expect(result).toBeDefined()
      expect(result.brandData).toBeDefined()
    })
  })

  // ============================================
  // URL NORMALIZATION
  // ============================================

  describe('URL Normalization', () => {
    it('should keep https:// URLs unchanged', async () => {
      await extractBrandDNA('https://example.com')

      expect(mockScrape).toHaveBeenCalledWith(
        'https://example.com',
        expect.any(Object)
      )
    })

    it('should keep http:// URLs unchanged', async () => {
      await extractBrandDNA('http://example.com')

      expect(mockScrape).toHaveBeenCalledWith(
        'http://example.com',
        expect.any(Object)
      )
    })

    it('should add https:// to URLs without protocol', async () => {
      await extractBrandDNA('example.com')

      expect(mockScrape).toHaveBeenCalledWith('https://example.com', expect.any(Object))
    })

    it('should handle URLs with paths', async () => {
      await extractBrandDNA('example.com/about')

      expect(mockScrape).toHaveBeenCalledWith(
        'https://example.com/about',
        expect.any(Object)
      )
    })
  })

  // ============================================
  // FIRECRAWL API CALLS
  // ============================================

  describe('Firecrawl API Calls', () => {
    it('should make two scrape calls (content + extraction)', async () => {
      await extractBrandDNA('https://example.com')

      expect(mockScrape).toHaveBeenCalledTimes(2)
    })

    it('should first scrape for content with correct formats', async () => {
      await extractBrandDNA('https://example.com')

      expect(mockScrape).toHaveBeenNthCalledWith(1, 'https://example.com', {
        formats: ['markdown', 'html', 'links', 'screenshot'],
        onlyMainContent: true,
        includeTags: ['img', 'link', 'meta', 'style'],
      })
    })

    it('should second scrape for LLM extraction with schema', async () => {
      await extractBrandDNA('https://example.com')

      expect(mockScrape).toHaveBeenNthCalledWith(
        2,
        'https://example.com',
        expect.objectContaining({
          formats: ['extract'],
          extract: expect.objectContaining({
            schema: expect.objectContaining({
              type: 'object',
              properties: expect.any(Object),
              required: expect.arrayContaining([
                'company_name',
                'primary_color',
                'headline',
                'tagline',
                'meta_description',
              ]),
            }),
          }),
        })
      )
    })

    it('should include all required schema fields', async () => {
      await extractBrandDNA('https://example.com')

      const secondCallArgs = mockScrape.mock.calls[1][1]
      const schema = secondCallArgs.extract.schema

      expect(schema.properties).toHaveProperty('company_name')
      expect(schema.properties).toHaveProperty('logo_url')
      expect(schema.properties).toHaveProperty('favicon_url')
      expect(schema.properties).toHaveProperty('primary_color')
      expect(schema.properties).toHaveProperty('secondary_color')
      expect(schema.properties).toHaveProperty('accent_color')
      expect(schema.properties).toHaveProperty('background_color')
      expect(schema.properties).toHaveProperty('heading_font')
      expect(schema.properties).toHaveProperty('body_font')
      expect(schema.properties).toHaveProperty('headline')
      expect(schema.properties).toHaveProperty('tagline')
      expect(schema.properties).toHaveProperty('value_propositions')
      expect(schema.properties).toHaveProperty('brand_personality')
      expect(schema.properties).toHaveProperty('meta_description')
    })
  })

  // ============================================
  // RESULT STRUCTURE
  // ============================================

  describe('Result Structure', () => {
    it('should return complete FirecrawlResult', async () => {
      const result = await extractBrandDNA('https://example.com')

      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('markdown')
      expect(result).toHaveProperty('html')
      expect(result).toHaveProperty('links')
      expect(result).toHaveProperty('screenshot')
      expect(result).toHaveProperty('brandData')
    })

    it('should include normalized URL in result', async () => {
      const result = await extractBrandDNA('example.com')

      expect(result.url).toBe('https://example.com')
    })

    it('should include scraped content in result', async () => {
      const result = await extractBrandDNA('https://example.com')

      expect(result.markdown).toBe('# Acme Corp\n\nLeading innovation')
      expect(result.html).toBe('<html><body><h1>Acme Corp</h1></body></html>')
      expect(result.links).toEqual([
        'https://acme.com/about',
        'https://acme.com/pricing',
      ])
      expect(result.screenshot).toBe('https://example.com/screenshot.png')
    })

    it('should include extracted brand data', async () => {
      const result = await extractBrandDNA('https://example.com')

      expect(result.brandData.company_name).toBe('Acme Corp')
      expect(result.brandData.primary_color).toBe('#FF0000')
      expect(result.brandData.headline).toBe('Innovation at Scale')
      expect(result.brandData.tagline).toBe('Building the Future')
    })

    it('should include all brand data fields', async () => {
      const result = await extractBrandDNA('https://example.com')
      const { brandData } = result

      expect(brandData).toHaveProperty('company_name')
      expect(brandData).toHaveProperty('logo_url')
      expect(brandData).toHaveProperty('favicon_url')
      expect(brandData).toHaveProperty('primary_color')
      expect(brandData).toHaveProperty('secondary_color')
      expect(brandData).toHaveProperty('accent_color')
      expect(brandData).toHaveProperty('background_color')
      expect(brandData).toHaveProperty('heading_font')
      expect(brandData).toHaveProperty('body_font')
      expect(brandData).toHaveProperty('headline')
      expect(brandData).toHaveProperty('tagline')
      expect(brandData).toHaveProperty('value_propositions')
      expect(brandData).toHaveProperty('brand_personality')
      expect(brandData).toHaveProperty('images')
      expect(brandData).toHaveProperty('hero_images')
      expect(brandData).toHaveProperty('product_images')
      expect(brandData).toHaveProperty('team_images')
      expect(brandData).toHaveProperty('icon_urls')
      expect(brandData).toHaveProperty('og_image')
      expect(brandData).toHaveProperty('meta_description')
    })
  })

  // ============================================
  // DEFAULT VALUES
  // ============================================

  describe('Default Values', () => {
    it('should use defaults when extraction returns no data', async () => {
      mockScrape.mockReset()
      mockScrape
        .mockResolvedValueOnce(mockScrapeResult)
        .mockResolvedValueOnce({ extract: null }) // No extraction data

      const result = await extractBrandDNA('https://example.com')

      expect(result.brandData.company_name).toBe('Unknown Company')
      expect(result.brandData.primary_color).toBe('#0082FB')
      expect(result.brandData.secondary_color).toBe('#4B5563')
      expect(result.brandData.accent_color).toBe('#60A5FA')
      expect(result.brandData.background_color).toBe('#F6F6F8')
      expect(result.brandData.heading_font).toBe('Inter')
      expect(result.brandData.body_font).toBe('Inter')
    })

    it('should default null fields to null', async () => {
      mockScrape.mockReset()
      mockScrape
        .mockResolvedValueOnce(mockScrapeResult)
        .mockResolvedValueOnce({ extract: {} })

      const result = await extractBrandDNA('https://example.com')

      expect(result.brandData.logo_url).toBeNull()
      expect(result.brandData.favicon_url).toBeNull()
      expect(result.brandData.og_image).toBeNull()
    })

    it('should default arrays to empty arrays', async () => {
      mockScrape.mockReset()
      mockScrape
        .mockResolvedValueOnce(mockScrapeResult)
        .mockResolvedValueOnce({ extract: {} })

      const result = await extractBrandDNA('https://example.com')

      expect(result.brandData.value_propositions).toEqual([])
      expect(result.brandData.brand_personality).toEqual([])
      expect(result.brandData.images).toEqual([])
      expect(result.brandData.hero_images).toEqual([])
      expect(result.brandData.product_images).toEqual([])
      expect(result.brandData.team_images).toEqual([])
      expect(result.brandData.icon_urls).toEqual([])
    })

    it('should default strings to empty strings', async () => {
      mockScrape.mockReset()
      mockScrape
        .mockResolvedValueOnce(mockScrapeResult)
        .mockResolvedValueOnce({ extract: {} })

      const result = await extractBrandDNA('https://example.com')

      expect(result.brandData.headline).toBe('')
      expect(result.brandData.tagline).toBe('')
      expect(result.brandData.meta_description).toBe('')
    })

    it('should handle missing scrape content gracefully', async () => {
      mockScrape.mockReset()
      mockScrape
        .mockResolvedValueOnce({}) // Empty scrape result
        .mockResolvedValueOnce(mockExtractResult)

      const result = await extractBrandDNA('https://example.com')

      expect(result.markdown).toBe('')
      expect(result.html).toBe('')
      expect(result.links).toEqual([])
      expect(result.screenshot).toBe('')
    })

    it('should limit images array to 10 items', async () => {
      mockScrape.mockReset()
      const manyImages = Array.from({ length: 20 }, (_, i) => `https://example.com/img${i}.jpg`)

      mockScrape
        .mockResolvedValueOnce(mockScrapeResult)
        .mockResolvedValueOnce({
          extract: {
            company_name: 'Test',
            primary_color: '#000000',
            headline: 'Test',
            tagline: 'Test',
            meta_description: 'Test',
            images: manyImages,
          },
        })

      const result = await extractBrandDNA('https://example.com')

      expect(result.brandData.images).toHaveLength(10)
    })
  })

  // ============================================
  // ERROR HANDLING
  // ============================================

  describe('Error Handling', () => {
    it('should throw when first scrape fails', async () => {
      mockScrape.mockReset()
      mockScrape.mockRejectedValueOnce(new Error('Firecrawl scrape failed'))

      await expect(extractBrandDNA('https://example.com')).rejects.toThrow(
        /Failed to extract brand DNA/i
      )
    })

    it('should throw when extraction scrape fails', async () => {
      mockScrape.mockReset()
      mockScrape
        .mockResolvedValueOnce(mockScrapeResult)
        .mockRejectedValueOnce(new Error('Extraction failed'))

      await expect(extractBrandDNA('https://example.com')).rejects.toThrow(
        /Failed to extract brand DNA/i
      )
    })

    it('should include original error message', async () => {
      mockScrape.mockReset()
      mockScrape.mockRejectedValueOnce(new Error('Rate limit exceeded'))

      await expect(extractBrandDNA('https://example.com')).rejects.toThrow(
        /Rate limit exceeded/
      )
    })

    it('should handle network timeouts', async () => {
      mockScrape.mockReset()
      mockScrape.mockRejectedValueOnce(new Error('Request timeout'))

      await expect(extractBrandDNA('https://example.com')).rejects.toThrow(
        /Request timeout/
      )
    })
  })

  // ============================================
  // URL VALIDATION
  // ============================================

  describe('URL Validation', () => {
    it('should validate https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('should validate http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
    })

    it('should validate URLs without protocol', () => {
      expect(isValidUrl('example.com')).toBe(true)
    })

    it('should validate URLs with paths', () => {
      expect(isValidUrl('https://example.com/about/team')).toBe(true)
    })

    it('should validate URLs with query strings', () => {
      expect(isValidUrl('https://example.com?utm_source=test')).toBe(true)
    })

    it('should validate URLs with ports', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true)
    })

    it('should invalidate malformed URLs', () => {
      expect(isValidUrl('not a url')).toBe(false)
    })

    it('should invalidate empty strings', () => {
      expect(isValidUrl('')).toBe(false)
    })

    it('should invalidate URLs with invalid characters', () => {
      expect(isValidUrl('https://example .com')).toBe(false)
    })
  })

  // ============================================
  // INTEGRATION SCENARIOS
  // ============================================

  describe('Integration Scenarios', () => {
    it('should extract complete brand profile from real-looking data', async () => {
      const result = await extractBrandDNA('stripe.com')

      expect(result.url).toBe('https://stripe.com')
      expect(result.brandData.company_name).toBe('Acme Corp')
      expect(result.brandData.value_propositions).toHaveLength(3)
      expect(result.brandData.brand_personality).toHaveLength(3)
      expect(result.brandData.hero_images).toHaveLength(1)
      expect(result.brandData.product_images).toHaveLength(2)
    })

    it('should handle partial extraction data gracefully', async () => {
      mockScrape.mockReset()
      mockScrape
        .mockResolvedValueOnce(mockScrapeResult)
        .mockResolvedValueOnce({
          extract: {
            company_name: 'Partial Corp',
            primary_color: '#123456',
            headline: 'Test',
            tagline: 'Test',
            meta_description: 'Test',
            // Missing other fields
          },
        })

      const result = await extractBrandDNA('https://example.com')

      expect(result.brandData.company_name).toBe('Partial Corp')
      expect(result.brandData.primary_color).toBe('#123456')
      // Should have defaults for missing fields
      expect(result.brandData.secondary_color).toBe('#4B5563')
      expect(result.brandData.heading_font).toBe('Inter')
    })
  })
})
