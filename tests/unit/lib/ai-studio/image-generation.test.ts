/**
 * Image Generation Library Tests
 * Tests for AI-powered ad creative generation with Fal.ai
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { BrandDNA } from '@/lib/ai-studio/firecrawl'
import type { CustomerProfile, KnowledgeBase } from '@/lib/ai-studio/knowledge'

// ============================================
// MOCKS
// ============================================

const mockFalSubscribe = vi.fn()
const mockFalConfig = vi.fn()

// Mock @fal-ai/client
vi.mock('@fal-ai/client', () => ({
  subscribe: (...args: any[]) => mockFalSubscribe(...args),
  config: (opts: any) => mockFalConfig(opts),
}))

// Import AFTER mocks
import { generateAdCreative, estimateCreditCost } from '@/lib/ai-studio/image-generation'

// ============================================
// TEST DATA
// ============================================

const mockBrandData: BrandDNA = {
  company_name: 'Acme Corp',
  tagline: 'Innovation at Scale',
  primary_color: '#FF0000',
  secondary_color: '#0000FF',
  accent_color: '#00FF00',
  background_color: '#FFFFFF',
  heading_font: 'Great Vibes',
  body_font: 'Inter',
  brand_personality: ['Professional', 'Innovative'],
  value_propositions: ['Fast delivery', 'Best quality'],
  target_audience_description: 'Tech startups',
  logo_url: 'https://example.com/logo.png',
  favicon_url: 'https://example.com/favicon.ico',
  images: ['https://example.com/img1.jpg'],
  screenshot_url: 'https://example.com/screenshot.png',
}

const mockKnowledgeBase: KnowledgeBase = {
  company_overview: 'Leading tech company',
  products_services: [
    {
      name: 'Premium Plan',
      description: 'Our best offering with all features included',
      pricing: '$99/month',
    },
  ],
  target_audience: 'Startup founders aged 25-45 in tech hubs',
  value_proposition: ['Save 10 hours per week', 'Increase revenue by 30%'],
  brand_voice: {
    tone: 'Professional yet friendly',
    energy_level: 'Energetic',
    communication_style: 'Direct and clear',
  },
  key_messages: ['Innovation', 'Reliability'],
}

const mockICP: CustomerProfile = {
  id: 'icp-123',
  brand_workspace_id: 'ws-123',
  name: 'Alex the Founder',
  title: 'Startup Founder',
  description: 'Tech-savvy entrepreneur',
  demographics: {
    age_range: '28-35',
    income_level: '$70k-120k',
    location: 'San Francisco',
  },
  pain_points: ['Too many tools', 'Wasting time on admin'],
  goals: ['Scale business', 'Automate workflows'],
  preferred_channels: ['LinkedIn', 'Twitter'],
  created_at: new Date().toISOString(),
}

const mockOffer = {
  name: 'Summer Sale',
  description: '50% off all plans',
}

// ============================================
// TESTS
// ============================================

describe('Image Generation Library', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: FAL_KEY is set
    vi.stubEnv('FAL_KEY', 'test-fal-key')

    // Default: Successful generation
    mockFalSubscribe.mockResolvedValue({
      images: [{ url: 'https://example.com/generated.jpg' }],
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // ============================================
  // ENVIRONMENT VALIDATION
  // ============================================

  describe('Environment Validation', () => {
    it('should throw when FAL_KEY is missing', async () => {
      vi.unstubAllEnvs()
      delete process.env.FAL_KEY

      await expect(
        generateAdCreative({
          prompt: 'Test',
          brandData: mockBrandData,
        })
      ).rejects.toThrow(/FAL_KEY.*not set/i)
    })

    it('should configure Fal client with API key', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(mockFalConfig).toHaveBeenCalledWith({
        credentials: 'test-fal-key',
      })
    })
  })

  // ============================================
  // BASIC GENERATION
  // ============================================

  describe('Basic Generation', () => {
    it('should generate creative with minimal input', async () => {
      const result = await generateAdCreative({
        prompt: 'Summer sale campaign',
        brandData: mockBrandData,
      })

      expect(result).toBeDefined()
      expect(result.imageUrl).toBe('https://example.com/generated.jpg')
      expect(result.enhancedPrompt).toContain('Acme Corp')
      expect(result.enhancedPrompt).toContain('Summer sale campaign')
    })

    it('should call Fal with correct model for high quality', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        quality: 'high',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        'fal-ai/flux-pro',
        expect.objectContaining({
          input: expect.objectContaining({
            num_inference_steps: 30,
            guidance_scale: 3.5,
          }),
        })
      )
    })
  })

  // ============================================
  // PROMPT ENHANCEMENT
  // ============================================

  describe('Prompt Enhancement', () => {
    it('should include company name in prompt', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(result.enhancedPrompt).toContain('Acme Corp')
    })

    it('should include tagline when available', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(result.enhancedPrompt).toContain('Innovation at Scale')
    })

    it('should include brand colors', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(result.enhancedPrompt).toContain('#FF0000')
      expect(result.enhancedPrompt).toContain('#0000FF')
      expect(result.enhancedPrompt).toContain('#00FF00')
    })

    it('should include typography information', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(result.enhancedPrompt).toContain('Great Vibes')
      expect(result.enhancedPrompt).toContain('Inter')
    })

    it('should include brand voice from knowledge base', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        knowledgeBase: mockKnowledgeBase,
      })

      expect(result.enhancedPrompt).toContain('Professional yet friendly')
      expect(result.enhancedPrompt).toContain('Energetic')
    })

    it('should include ICP information when provided', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        icp: mockICP,
      })

      expect(result.enhancedPrompt).toContain('Alex the Founder')
      expect(result.enhancedPrompt).toContain('28-35')
      expect(result.enhancedPrompt).toContain('Too many tools')
      expect(result.enhancedPrompt).toContain('Scale business')
    })

    it('should include offer information when provided', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        offer: mockOffer,
      })

      expect(result.enhancedPrompt).toContain('Summer Sale')
      expect(result.enhancedPrompt).toContain('50% off')
    })

    it('should include value proposition', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        knowledgeBase: mockKnowledgeBase,
      })

      expect(result.enhancedPrompt).toContain('Save 10 hours per week')
    })

    it('should include user prompt as creative direction', async () => {
      const result = await generateAdCreative({
        prompt: 'Show happy customers using the product',
        brandData: mockBrandData,
      })

      expect(result.enhancedPrompt).toContain('CREATIVE DIRECTION')
      expect(result.enhancedPrompt).toContain('Show happy customers using the product')
    })
  })

  // ============================================
  // STYLE PRESETS
  // ============================================

  describe('Style Presets', () => {
    it('should apply "Write with Elegance" style', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        stylePreset: 'Write with Elegance',
      })

      expect(result.enhancedPrompt).toContain('Elegant')
      expect(result.enhancedPrompt).toContain('sophisticated')
    })

    it('should apply "Flow of Creativity" style', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        stylePreset: 'Flow of Creativity',
      })

      expect(result.enhancedPrompt).toContain('Creative')
      expect(result.enhancedPrompt).toContain('flowing')
    })

    it('should apply "Handcrafted Perfection" style', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        stylePreset: 'Handcrafted Perfection',
      })

      expect(result.enhancedPrompt).toContain('Hand-drawn')
      expect(result.enhancedPrompt).toContain('artisanal')
    })

    it('should apply "Timeless Style" style', async () => {
      const result = await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        stylePreset: 'Timeless Style',
      })

      expect(result.enhancedPrompt).toContain('Classic')
      expect(result.enhancedPrompt).toContain('timeless')
    })
  })

  // ============================================
  // FORMAT CONFIGURATION
  // ============================================

  describe('Format Configuration', () => {
    it('should use 1024x1024 for square format', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        format: 'square',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            image_size: { width: 1024, height: 1024 },
          }),
        })
      )
    })

    it('should use 1080x1920 for story format', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        format: 'story',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            image_size: { width: 1080, height: 1920 },
          }),
        })
      )
    })

    it('should use 1200x628 for landscape format', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        format: 'landscape',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            image_size: { width: 1200, height: 628 },
          }),
        })
      )
    })

    it('should default to square format when not specified', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            image_size: { width: 1024, height: 1024 },
          }),
        })
      )
    })
  })

  // ============================================
  // QUALITY SETTINGS
  // ============================================

  describe('Quality Settings', () => {
    it('should use flux-pro for high quality', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        quality: 'high',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        'fal-ai/flux-pro',
        expect.any(Object)
      )
    })

    it('should use flux/dev for balanced quality', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        quality: 'balanced',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        'fal-ai/flux/dev',
        expect.any(Object)
      )
    })

    it('should use flux/schnell for fast quality', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        quality: 'fast',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        'fal-ai/flux/schnell',
        expect.any(Object)
      )
    })

    it('should use 30 steps for high quality', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        quality: 'high',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            num_inference_steps: 30,
          }),
        })
      )
    })

    it('should use 20 steps for balanced quality', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        quality: 'balanced',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            num_inference_steps: 20,
          }),
        })
      )
    })

    it('should use 4 steps for fast quality', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
        quality: 'fast',
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            num_inference_steps: 4,
          }),
        })
      )
    })

    it('should default to high quality when not specified', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        'fal-ai/flux-pro',
        expect.any(Object)
      )
    })
  })

  // ============================================
  // ERROR HANDLING
  // ============================================

  describe('Error Handling', () => {
    it('should throw when Fal API returns no images', async () => {
      mockFalSubscribe.mockResolvedValue({ images: [] })

      await expect(
        generateAdCreative({
          prompt: 'Test',
          brandData: mockBrandData,
        })
      ).rejects.toThrow(/No images generated/i)
    })

    it('should throw when Fal API returns null images', async () => {
      mockFalSubscribe.mockResolvedValue({ images: null })

      await expect(
        generateAdCreative({
          prompt: 'Test',
          brandData: mockBrandData,
        })
      ).rejects.toThrow(/No images generated/i)
    })

    it('should handle Fal API errors', async () => {
      mockFalSubscribe.mockRejectedValue(new Error('API rate limit exceeded'))

      await expect(
        generateAdCreative({
          prompt: 'Test',
          brandData: mockBrandData,
        })
      ).rejects.toThrow(/Failed to generate creative/i)
    })

    it('should include original error message', async () => {
      mockFalSubscribe.mockRejectedValue(new Error('Out of credits'))

      await expect(
        generateAdCreative({
          prompt: 'Test',
          brandData: mockBrandData,
        })
      ).rejects.toThrow(/Out of credits/i)
    })
  })

  // ============================================
  // CREDIT COST ESTIMATION
  // ============================================

  describe('Credit Cost Estimation', () => {
    it('should return 5 cents for square format', () => {
      expect(estimateCreditCost('square')).toBe(5)
    })

    it('should return 5 cents for story format', () => {
      expect(estimateCreditCost('story')).toBe(5)
    })

    it('should return 5 cents for landscape format', () => {
      expect(estimateCreditCost('landscape')).toBe(5)
    })
  })

  // ============================================
  // INTEGRATION SCENARIOS
  // ============================================

  describe('Integration Scenarios', () => {
    it('should generate with full brand intelligence', async () => {
      const result = await generateAdCreative({
        prompt: 'Launch campaign for new product',
        brandData: mockBrandData,
        knowledgeBase: mockKnowledgeBase,
        icp: mockICP,
        offer: mockOffer,
        stylePreset: 'Write with Elegance',
        format: 'story',
        quality: 'high',
      })

      expect(result.imageUrl).toBeDefined()
      expect(result.enhancedPrompt).toContain('Acme Corp')
      expect(result.enhancedPrompt).toContain('Alex the Founder')
      expect(result.enhancedPrompt).toContain('Summer Sale')
      expect(result.enhancedPrompt).toContain('Elegant')
      expect(result.enhancedPrompt).toContain('Launch campaign for new product')

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        'fal-ai/flux-pro',
        expect.objectContaining({
          input: expect.objectContaining({
            image_size: { width: 1080, height: 1920 },
            num_inference_steps: 30,
          }),
        })
      )
    })

    it('should enable safety checker', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            enable_safety_checker: true,
          }),
        })
      )
    })

    it('should request single image generation', async () => {
      await generateAdCreative({
        prompt: 'Test',
        brandData: mockBrandData,
      })

      expect(mockFalSubscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          input: expect.objectContaining({
            num_images: 1,
          }),
        })
      )
    })
  })
})
