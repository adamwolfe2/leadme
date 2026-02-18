import { generateMetadata } from '@/lib/seo/metadata'
import { StructuredData } from '@/components/seo/structured-data'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/structured-data'

export const metadata = generateMetadata({
  title: 'Integrations — Connect Cursive to 200+ Tools | CRM, Sales, Marketing',
  description: 'Seamlessly sync Cursive visitor identification and intent data with your existing marketing stack. 200+ integrations including Salesforce, HubSpot, Outreach, Zapier, and more.',
  keywords: ['integrations', 'CRM integration', 'marketing automation', 'API', 'webhooks', 'data sync'],
  canonical: 'https://www.meetcursive.com/integrations',
})

const integrationsFAQs = [
  {
    question: 'What CRM platforms does Cursive integrate with?',
    answer: 'Cursive natively integrates with Salesforce, HubSpot, Pipedrive, Close, Zoho CRM, Copper, and Freshsales. When a website visitor is identified, Cursive can automatically create or update a contact record, log a timeline activity, and trigger a workflow — all without manual data entry.',
  },
  {
    question: 'How does Cursive integrate with sales engagement tools?',
    answer: 'Cursive integrates with Outreach, Salesloft, Apollo, Reply.io, and Lemlist. When a high-intent visitor is identified, Cursive can automatically enroll them in a sales sequence in your preferred tool. This enables trigger-based outreach that reaches prospects within minutes of their pricing page visit.',
  },
  {
    question: 'Can I use Cursive with Zapier and other automation tools?',
    answer: 'Yes. Cursive connects to Zapier, Make (Integromat), n8n, and Tray.io — giving you access to 5,000+ additional tools. Use Zaps to push identified visitors to any CRM, send Slack alerts for high-intent accounts, create Asana tasks, or trigger any custom workflow.',
  },
  {
    question: 'Does Cursive have a webhook or API?',
    answer: 'Yes. Cursive provides a webhook API for real-time event streaming and a REST API for querying visitor data, intent scores, and audience lists. Webhooks fire immediately when a visitor is identified, enabling sub-minute response times for your sales workflows.',
  },
  {
    question: 'Can Cursive push data to advertising platforms?',
    answer: 'Yes. Cursive integrates with Google Ads, Meta Ads, and LinkedIn Campaign Manager. Identified visitors and intent audiences can be pushed as custom audiences for retargeting — letting you target the exact individuals who visited your site with matched advertising across all major platforms.',
  },
  {
    question: 'How long does it take to set up a Cursive integration?',
    answer: 'Most native integrations (HubSpot, Salesforce, Pipedrive) take 5-15 minutes to configure via OAuth or API key. Webhook setups take under 30 minutes with our documentation. Our team offers free integration support during onboarding to ensure your CRM and sequencing tools are connected correctly.',
  },
]

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={[
        generateBreadcrumbSchema([
          { name: 'Home', url: 'https://www.meetcursive.com' },
          { name: 'Integrations', url: 'https://www.meetcursive.com/integrations' },
        ]),
        generateFAQSchema(integrationsFAQs),
      ]} />
      {children}
    </>
  )
}
