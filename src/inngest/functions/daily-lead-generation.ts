// Daily Lead Generation
// Previously used DataShopper for intent-based company discovery.
// Now leads flow in via AudienceLab webhooks (SuperPixel + AudienceSync).
// This cron function is kept as a placeholder for future pull-based lead generation.

import { inngest } from '../client'

export const dailyLeadGeneration = inngest.createFunction(
  {
    id: 'daily-lead-generation',
    name: 'Daily Lead Generation',
    retries: 1,
    timeouts: { finish: "1m" },
  },
  { cron: '0 2 * * *' }, // Every day at 2 AM
  async ({ logger }) => {
    // Lead generation is now handled by AudienceLab webhooks and the segment puller cron.
    // See: src/inngest/functions/audiencelab-processor.ts
    // See: src/inngest/functions/audiencelab-segment-puller.ts
    logger.info('Daily lead generation: leads now flow via AudienceLab webhooks. No action needed.')

    return {
      success: true,
      message: 'Lead generation handled by AudienceLab webhooks and segment puller',
    }
  }
)
