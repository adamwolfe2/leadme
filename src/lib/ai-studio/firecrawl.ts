/**
 * Firecrawl Integration - Brand DNA Extraction
 * Uses Firecrawl API to scrape websites and extract brand assets
 */

import FirecrawlApp from '@mendable/firecrawl-js'

function getFirecrawlClient() {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY is not set in environment variables')
  }
  return new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY,
  })
}

export interface BrandDNA {
  company_name: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  heading_font: string
  body_font: string
  headline: string
  images: string[]
}

export interface FirecrawlResult {
  url: string
  markdown: string
  html: string
  links: string[]
  screenshot: string
  brandData: BrandDNA
}

/**
 * Extract brand DNA from a website URL
 */
export async function extractBrandDNA(url: string): Promise<FirecrawlResult> {
  try {
    const firecrawl = getFirecrawlClient()

    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

    console.log(`[Firecrawl] Starting brand extraction for: ${normalizedUrl}`)

    // 1. Scrape the website for content and assets
    const scrapeResult = await firecrawl.scrapeUrl(normalizedUrl, {
      formats: ['markdown', 'html', 'links', 'screenshot'],
      onlyMainContent: true,
      includeTags: ['img', 'link', 'meta', 'style'],
    })

    console.log(`[Firecrawl] Scrape completed, extracting structured data...`)

    // 2. Extract structured brand data with LLM
    const extractionSchema = {
      type: 'object',
      properties: {
        company_name: {
          type: 'string',
          description: 'The company or brand name'
        },
        logo_url: {
          type: 'string',
          description: 'URL to the company logo image (if found)'
        },
        favicon_url: {
          type: 'string',
          description: 'URL to the favicon (if found)'
        },
        primary_color: {
          type: 'string',
          description: 'Primary brand color in hex format (e.g., #0082FB)'
        },
        secondary_color: {
          type: 'string',
          description: 'Secondary brand color in hex format'
        },
        accent_color: {
          type: 'string',
          description: 'Accent brand color in hex format'
        },
        background_color: {
          type: 'string',
          description: 'Background color in hex format'
        },
        heading_font: {
          type: 'string',
          description: 'Font family used for headings'
        },
        body_font: {
          type: 'string',
          description: 'Font family used for body text'
        },
        headline: {
          type: 'string',
          description: 'Main value proposition or tagline from the website'
        },
        images: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of relevant image URLs (max 10)'
        },
      },
      required: ['company_name', 'primary_color', 'headline']
    }

    const extractResult = await firecrawl.scrapeUrl(normalizedUrl, {
      formats: ['extract'],
      extract: {
        schema: extractionSchema,
      }
    })

    console.log(`[Firecrawl] Brand DNA extracted successfully`)

    // 3. Return combined result
    return {
      url: normalizedUrl,
      markdown: scrapeResult.markdown || '',
      html: scrapeResult.html || '',
      links: scrapeResult.links || [],
      screenshot: scrapeResult.screenshot || '',
      brandData: {
        company_name: extractResult.extract?.company_name || 'Unknown Company',
        logo_url: extractResult.extract?.logo_url || null,
        favicon_url: extractResult.extract?.favicon_url || null,
        primary_color: extractResult.extract?.primary_color || '#0082FB',
        secondary_color: extractResult.extract?.secondary_color || '#4B5563',
        accent_color: extractResult.extract?.accent_color || '#60A5FA',
        background_color: extractResult.extract?.background_color || '#F6F6F8',
        heading_font: extractResult.extract?.heading_font || 'Inter',
        body_font: extractResult.extract?.body_font || 'Inter',
        headline: extractResult.extract?.headline || '',
        images: (extractResult.extract?.images || []).slice(0, 10),
      }
    }
  } catch (error: any) {
    console.error('[Firecrawl] Error extracting brand DNA:', error)
    throw new Error(`Failed to extract brand DNA: ${error.message}`)
  }
}

/**
 * Validate a URL before extraction
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    new URL(normalized)
    return true
  } catch {
    return false
  }
}
