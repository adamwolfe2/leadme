/**
 * Premium Feature Types
 * Types for premium feature requests and upsell system
 */

export type FeatureType = 'pixel' | 'whitelabel' | 'extra_data' | 'outbound' | 'custom'

export type RequestStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed'

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ContactPreference = 'email' | 'call' | 'slack'

export interface PremiumFeatureRequest {
  id: string
  workspace_id: string
  user_id: string
  feature_type: FeatureType
  title: string
  description?: string
  use_case?: string
  expected_volume?: string
  budget_range?: string
  contact_preference: ContactPreference
  status: RequestStatus
  priority: RequestPriority
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  created_at: string
  updated_at: string
}

export interface PremiumFeatureRequestInput {
  feature_type: FeatureType
  title: string
  description?: string
  use_case?: string
  expected_volume?: string
  budget_range?: string
  contact_preference?: ContactPreference
}

export interface WorkspacePremiumFeatures {
  has_pixel_access: boolean
  has_whitelabel_access: boolean
  has_extra_data_access: boolean
  has_outbound_access: boolean
  premium_features_updated_at?: string
}

export interface FeatureInfo {
  id: FeatureType
  name: string
  description: string
  icon: string
  benefits: string[]
  typical_price?: string
}

export const PREMIUM_FEATURES: Record<FeatureType, FeatureInfo> = {
  pixel: {
    id: 'pixel',
    name: 'AudienceLab Pixel',
    description: 'Track your own website visitors and convert them into leads',
    icon: '🎯',
    benefits: [
      'Track unlimited website visitors',
      'Identify anonymous visitors',
      'Auto-enrich with contact data',
      'Real-time visitor notifications',
      'Custom tracking events',
    ],
    typical_price: 'Custom pricing',
  },
  whitelabel: {
    id: 'whitelabel',
    name: 'White-Label Branding',
    description: 'Remove Cursive branding and use your own',
    icon: '🎨',
    benefits: [
      'Remove "Powered by Cursive"',
      'Custom colors and logo',
      'Custom domain (leads.yourdomain.com)',
      'Branded email templates',
      'Full brand control',
    ],
    typical_price: '$299/mo',
  },
  extra_data: {
    id: 'extra_data',
    name: 'Premium Audience Data',
    description: 'Access 10x more audiences and data sources',
    icon: '📊',
    benefits: [
      '10x more lead capacity',
      'Premium data sources',
      'Advanced filtering',
      'Intent data signals',
      'Technographic data',
    ],
    typical_price: 'Volume-based',
  },
  outbound: {
    id: 'outbound',
    name: 'Automated Outbound',
    description: 'Send automated email campaigns to your leads',
    icon: '📧',
    benefits: [
      'Multi-step email sequences',
      'AI-powered personalization',
      'A/B testing',
      'Reply detection',
      'CRM integration',
    ],
    typical_price: '$499/mo',
  },
  custom: {
    id: 'custom',
    name: 'Custom Feature',
    description: 'Request a custom feature or integration',
    icon: '⚡',
    benefits: [
      'Custom integrations',
      'Dedicated support',
      'Feature prioritization',
      'API access',
    ],
  },
}
