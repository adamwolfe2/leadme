/**
 * Knowledge Base Generation - AI-powered company intelligence
 * Uses OpenAI GPT-4 to generate structured company knowledge from scraped content
 */

import OpenAI from 'openai'
import type { BrandDNA } from './firecrawl'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export interface ProductService {
  name: string
  description: string
  target_audience: string
}

export interface BrandVoice {
  tone: string
  energy_level: string
  communication_style: string
}

export interface KnowledgeBase {
  company_overview: string
  products_services: ProductService[]
  target_audience: string
  value_proposition: string[]
  brand_voice: BrandVoice
  key_messages: string[]
}

/**
 * Generate comprehensive knowledge base from scraped website content
 */
export async function generateKnowledgeBase(
  markdown: string,
  brandData: BrandDNA
): Promise<KnowledgeBase> {
  try {
    const openai = getOpenAIClient()
    console.log('[Knowledge] Generating knowledge base with GPT-4...')

    const systemPrompt = `You are a brand analyst and marketing strategist. Analyze the following website content and generate a comprehensive knowledge base for marketing and advertising purposes.

Output Format (strict JSON):
{
  "company_overview": "2-3 paragraph description of the company, its mission, unique value proposition, and what makes it different. Be specific and compelling.",
  "products_services": [
    {
      "name": "Product/Service Name",
      "description": "Detailed description of what this product/service does and its key features",
      "target_audience": "Who this product/service is specifically designed for"
    }
  ],
  "target_audience": "Detailed description of ideal customer demographics, psychographics, pain points, and characteristics. Include age ranges, income levels, job titles, and behaviors.",
  "value_proposition": [
    "Key benefit 1 - be specific about the transformation or outcome",
    "Key benefit 2",
    "Key benefit 3"
  ],
  "brand_voice": {
    "tone": "Describe the brand's tone (e.g., Professional yet friendly, Bold and confident, Warm and approachable)",
    "energy_level": "Describe energy level (e.g., Calm and reassuring, Energetic and motivating, Authoritative and trustworthy)",
    "communication_style": "How they communicate with customers (e.g., Direct and data-driven, Storytelling and emotional, Educational and helpful)"
  },
  "key_messages": [
    "Core message 1 - what they want customers to remember",
    "Core message 2",
    "Core message 3"
  ]
}

Guidelines:
- Be specific and avoid generic business jargon
- Extract real value propositions, not just feature lists
- Identify the emotional and practical benefits
- Focus on what makes this company unique
- Use language that could be used in actual marketing materials`

    const userPrompt = `Website Content (Markdown):
${markdown.slice(0, 8000)}

Brand Identity:
- Company: ${brandData.company_name}
- Primary Color: ${brandData.primary_color}
- Headline: ${brandData.headline}

Analyze this content and generate a comprehensive knowledge base in the exact JSON format specified.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No content returned from OpenAI')
    }

    const knowledgeBase = JSON.parse(content) as KnowledgeBase

    console.log('[Knowledge] Knowledge base generated successfully')

    return knowledgeBase
  } catch (error: any) {
    console.error('[Knowledge] Error generating knowledge base:', error)
    throw new Error(`Failed to generate knowledge base: ${error.message}`)
  }
}

/**
 * Generate customer personas (ICPs) from knowledge base
 */
export async function generateCustomerProfiles(
  knowledgeBase: KnowledgeBase
): Promise<CustomerProfile[]> {
  try {
    const openai = getOpenAIClient()
    console.log('[Knowledge] Generating customer profiles...')

    const systemPrompt = `You are an expert in buyer persona development. Create 3-5 detailed, realistic buyer personas based on the company information provided.

Output Format (strict JSON):
{
  "personas": [
    {
      "name": "First Name, the Descriptive Title (e.g., 'Alex, the Tech-Savvy Startup Founder')",
      "title": "Job Title (e.g., 'Startup Founder')",
      "description": "2-3 sentence character description that brings this persona to life",
      "demographics": {
        "age_range": "Age range (e.g., '28-35')",
        "income_range": "Income range (e.g., '$70,000-120,000')",
        "location": "Geographic location (e.g., 'Urban areas, US')",
        "education": "Education level (e.g., 'Bachelor's degree')"
      },
      "pain_points": [
        "Specific pain point 1 that this product/service solves",
        "Specific pain point 2",
        "Specific pain point 3"
      ],
      "goals": [
        "Primary goal 1",
        "Primary goal 2",
        "Primary goal 3"
      ],
      "preferred_channels": [
        "Marketing channel 1 (e.g., 'LinkedIn')",
        "Marketing channel 2 (e.g., 'Tech forums')",
        "Marketing channel 3"
      ]
    }
  ]
}

Guidelines:
- Create diverse personas that represent different market segments
- Give each persona a memorable, specific name
- Pain points should directly relate to what the company solves
- Goals should align with the company's value proposition
- Preferred channels should be realistic for that persona type`

    const userPrompt = `Company Knowledge Base:
${JSON.stringify(knowledgeBase, null, 2)}

Generate 3-5 detailed buyer personas in the exact JSON format specified.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 2000,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No content returned from OpenAI')
    }

    const result = JSON.parse(content)

    console.log('[Knowledge] Customer profiles generated successfully')

    return result.personas || []
  } catch (error: any) {
    console.error('[Knowledge] Error generating customer profiles:', error)
    throw new Error(`Failed to generate customer profiles: ${error.message}`)
  }
}

export interface CustomerProfile {
  name: string
  title: string
  description: string
  demographics: {
    age_range: string
    income_range: string
    location: string
    education: string
  }
  pain_points: string[]
  goals: string[]
  preferred_channels: string[]
}
