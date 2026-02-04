-- Add onboarding data to service subscriptions
-- Stores customer's ICP, targeting criteria, and goals

ALTER TABLE service_subscriptions
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';

COMMENT ON COLUMN service_subscriptions.onboarding_data IS 'Customer onboarding responses: ICP, targeting criteria, goals, etc.';

-- Example structure:
-- {
--   "industry": ["SaaS", "E-commerce"],
--   "company_size": "50-200",
--   "revenue_range": "$1M-$10M",
--   "target_titles": ["CEO", "VP Sales", "Head of Growth"],
--   "target_seniority": ["C-Level", "VP"],
--   "geographic_focus": ["United States", "Canada"],
--   "tech_stack": ["Salesforce", "HubSpot"],
--   "pain_points": "Need help with outbound, struggling to find quality leads",
--   "use_case": "Cold outbound email campaigns",
--   "ideal_lead_profile": "B2B SaaS companies, $1M+ ARR, using Salesforce",
--   "exclusions": "No agencies, no consultants",
--   "additional_notes": "Focus on companies that raised Series A in last 12 months"
-- }
