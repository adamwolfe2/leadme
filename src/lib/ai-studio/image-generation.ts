/**
 * Image Generation - AI-powered ad creative generation
 * Uses Fal.ai with Flux model for fast, high-quality image generation
 */

import * as fal from '@fal-ai/client'
import type { BrandDNA } from './firecrawl'
import type { CustomerProfile } from './knowledge'

function configureFal() {
  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY is not set in environment variables')
  }
  fal.config({
    credentials: process.env.FAL_KEY,
  })
}

export type CreativeFormat = 'square' | 'story' | 'landscape'
export type StylePreset =
  | 'Write with Elegance'
  | 'Flow of Creativity'
  | 'Handcrafted Perfection'
  | 'Timeless Style'

export interface GenerateCreativeInput {
  prompt: string
  brandData: BrandDNA
  icp?: CustomerProfile | null
  offer?: { name: string; description: string } | null
  stylePreset?: StylePreset
  format?: CreativeFormat
}

export interface GenerateCreativeOutput {
  imageUrl: string
  enhancedPrompt: string
}

/**
 * Generate ad creative image with Fal.ai Flux model
 */
export async function generateAdCreative({
  prompt,
  brandData,
  icp,
  offer,
  stylePreset,
  format = 'square'
}: GenerateCreativeInput): Promise<GenerateCreativeOutput> {
  try {
    configureFal()
    console.log('[ImageGen] Generating ad creative...')

    // Build enhanced prompt
    const enhancedPrompt = buildPrompt({
      userPrompt: prompt,
      brandData,
      icp,
      offer,
      stylePreset,
    })

    console.log('[ImageGen] Enhanced prompt:', enhancedPrompt)

    // Image dimensions based on format
    const dimensions = getImageDimensions(format)

    // Generate with Flux Schnell (fast, cost-effective)
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: enhancedPrompt,
        image_size: dimensions,
        num_inference_steps: 4, // Fast generation (4 steps for Schnell)
        num_images: 1,
        enable_safety_checker: false, // We're generating ads, not problematic content
      }
    }) as any

    if (!result.images || result.images.length === 0) {
      throw new Error('No images generated')
    }

    const imageUrl = result.images[0].url

    console.log('[ImageGen] Image generated successfully:', imageUrl)

    return {
      imageUrl,
      enhancedPrompt,
    }
  } catch (error: any) {
    console.error('[ImageGen] Error generating creative:', error)
    throw new Error(`Failed to generate creative: ${error.message}`)
  }
}

/**
 * Build enhanced prompt from user input and context
 */
function buildPrompt({
  userPrompt,
  brandData,
  icp,
  offer,
  stylePreset,
}: {
  userPrompt: string
  brandData: BrandDNA
  icp?: CustomerProfile | null
  offer?: { name: string; description: string } | null
  stylePreset?: StylePreset
}): string {
  let basePrompt = `Create a professional social media ad for ${brandData.company_name}. `

  // Add style preset
  if (stylePreset) {
    const styleGuides: Record<StylePreset, string> = {
      'Write with Elegance': 'Style: Elegant, sophisticated, minimal design with serif fonts, clean layouts, and refined aesthetics. ',
      'Flow of Creativity': 'Style: Creative, flowing shapes, abstract backgrounds, vibrant gradients, and artistic elements. ',
      'Handcrafted Perfection': 'Style: Hand-drawn elements, artisanal feel, organic textures, warm and authentic. ',
      'Timeless Style': 'Style: Classic, timeless design, clean layouts, traditional elegance, enduring appeal. ',
    }
    basePrompt += styleGuides[stylePreset]
  }

  // Add brand colors
  basePrompt += `Brand colors: primary ${brandData.primary_color}, secondary ${brandData.secondary_color}. `

  // Add ICP context
  if (icp) {
    basePrompt += `Target audience: ${icp.name} (${icp.title}), demographics: ${icp.demographics.age_range}, ${icp.demographics.location}. `
  }

  // Add offer context
  if (offer) {
    basePrompt += `Promoting: ${offer.name} - ${offer.description}. `
  }

  // Add user's creative direction
  basePrompt += userPrompt + '. '

  // Add technical requirements for ad format
  basePrompt += `Professional commercial photography style, high quality, modern, clean composition. Include space for headline text overlay at top or bottom. Ensure brand colors are prominently featured. Photo-realistic, sharp focus, professional lighting.`

  return basePrompt
}

/**
 * Get image dimensions for format
 */
function getImageDimensions(format: CreativeFormat): { width: number; height: number } | string {
  const dimensions = {
    square: 'square',      // 1:1 - Instagram feed, Facebook feed
    story: 'portrait_16_9',        // 9:16 - Instagram story, TikTok
    landscape: 'landscape_16_9',    // 16:9 - Facebook cover, Twitter header
  }

  return dimensions[format] as any
}

/**
 * Estimate credit cost for generation
 */
export function estimateCreditCost(format: CreativeFormat): number {
  // Approximate costs (in cents) based on Fal.ai pricing
  const costs = {
    square: 5,      // ~$0.05
    story: 5,       // ~$0.05
    landscape: 5,   // ~$0.05
  }
  return costs[format]
}
