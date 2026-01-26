// Campaign Reply Handling Functions
// Handles AI classification and response generation for email replies

import { inngest } from '../client'
import { createClient } from '@/lib/supabase/server'

// Mock flag for development when API keys aren't available
const USE_MOCKS = !process.env.ANTHROPIC_API_KEY

interface ReplyClassification {
  sentiment: 'positive' | 'negative' | 'neutral' | 'question' | 'not_interested' | 'out_of_office' | 'unsubscribe'
  intent_score: number
  confidence: number
  reasoning: string
  suggested_action: string
}

interface SuggestedResponse {
  subject?: string
  body: string
  tone: string
  confidence: number
}

// Handle incoming reply - classify and suggest response
export const processReply = inngest.createFunction(
  {
    id: 'campaign-process-reply',
    name: 'Process Campaign Reply',
    retries: 3,
  },
  { event: 'emailbison/reply-received' },
  async ({ event, step, logger }) => {
    const { reply_id, lead_email, from_email, subject, body, received_at } = event.data

    logger.info(`Processing reply ${reply_id} from ${from_email}`)

    // Step 1: Find the reply record
    const reply = await step.run('fetch-reply', async () => {
      const supabase = await createClient()

      // Try to find by ID first, then by email
      let query = supabase
        .from('email_replies')
        .select(`
          *,
          lead:leads!lead_id(
            id,
            first_name,
            last_name,
            company_name,
            job_title
          ),
          campaign:email_campaigns!campaign_id(
            id,
            name,
            client_profile
          ),
          email_send:email_sends!email_send_id(
            id,
            subject,
            body_text
          )
        `)

      if (reply_id && reply_id.match(/^[0-9a-f-]{36}$/i)) {
        query = query.eq('id', reply_id)
      } else {
        query = query.eq('from_email', from_email).order('received_at', { ascending: false }).limit(1)
      }

      const { data, error } = await query.single()

      if (error) {
        logger.warn(`Reply record not found: ${error.message}`)
        return null
      }

      return data
    })

    if (!reply) {
      logger.info('No reply record found to process')
      return { success: false, reason: 'reply_not_found' }
    }

    // Step 2: Classify the reply with AI
    const classification = await step.run('classify-reply', async () => {
      if (USE_MOCKS) {
        logger.info('[MOCK] Generating mock classification')
        return generateMockClassification(body, subject)
      }

      return await classifyWithClaude(body, subject, reply, logger)
    })

    // Step 3: Update reply with classification
    await step.run('update-classification', async () => {
      const supabase = await createClient()

      const { error } = await supabase
        .from('email_replies')
        .update({
          sentiment: classification.sentiment,
          intent_score: classification.intent_score,
          classification_confidence: classification.confidence,
          classification_metadata: {
            reasoning: classification.reasoning,
            suggested_action: classification.suggested_action,
            classified_via: USE_MOCKS ? 'mock' : 'claude',
          },
          classified_at: new Date().toISOString(),
        })
        .eq('id', reply.id)

      if (error) {
        throw new Error(`Failed to update classification: ${error.message}`)
      }

      logger.info(`Reply ${reply.id} classified as ${classification.sentiment} with intent ${classification.intent_score}`)
    })

    // Step 4: Generate suggested response for high-value replies
    let suggestedResponse: SuggestedResponse | null = null

    if (shouldGenerateResponse(classification)) {
      suggestedResponse = await step.run('generate-response', async () => {
        if (USE_MOCKS) {
          logger.info('[MOCK] Generating mock response suggestion')
          return generateMockResponse(classification, reply)
        }

        return await generateResponseWithClaude(classification, reply, logger)
      })

      // Update reply with suggested response
      await step.run('update-response', async () => {
        const supabase = await createClient()

        const { error } = await supabase
          .from('email_replies')
          .update({
            suggested_response: suggestedResponse?.body,
            suggested_response_metadata: {
              subject: suggestedResponse?.subject,
              tone: suggestedResponse?.tone,
              confidence: suggestedResponse?.confidence,
              generated_via: USE_MOCKS ? 'mock' : 'claude',
            },
            response_generated_at: new Date().toISOString(),
          })
          .eq('id', reply.id)

        if (error) {
          logger.warn(`Failed to update suggested response: ${error.message}`)
        }
      })
    }

    // Step 5: Update campaign lead status
    await step.run('update-campaign-lead', async () => {
      const supabase = await createClient()

      // Determine new status based on sentiment
      const statusMap: Record<string, string> = {
        positive: 'positive',
        question: 'replied',
        neutral: 'replied',
        negative: 'not_interested',
        not_interested: 'not_interested',
        unsubscribe: 'unsubscribed',
        out_of_office: 'replied',
      }

      const newStatus = statusMap[classification.sentiment] || 'replied'

      await supabase
        .from('campaign_leads')
        .update({
          status: newStatus,
          reply_sentiment: classification.sentiment,
          reply_intent_score: classification.intent_score,
          last_reply_id: reply.id,
          updated_at: new Date().toISOString(),
        })
        .eq('campaign_id', reply.campaign_id)
        .eq('lead_id', reply.lead_id)
    })

    return {
      success: true,
      reply_id: reply.id,
      classification,
      has_suggested_response: !!suggestedResponse,
    }
  }
)

// Batch process unclassified replies
export const batchProcessReplies = inngest.createFunction(
  {
    id: 'campaign-batch-process-replies',
    name: 'Batch Process Unclassified Replies',
    retries: 2,
  },
  { cron: '*/15 * * * *' }, // Every 15 minutes
  async ({ step, logger }) => {
    // Fetch unclassified replies
    const unclassifiedReplies = await step.run('fetch-unclassified', async () => {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('email_replies')
        .select('id, from_email')
        .is('classified_at', null)
        .eq('status', 'new')
        .order('received_at', { ascending: true })
        .limit(50)

      if (error) {
        throw new Error(`Failed to fetch unclassified replies: ${error.message}`)
      }

      return data || []
    })

    logger.info(`Found ${unclassifiedReplies.length} unclassified replies`)

    if (unclassifiedReplies.length === 0) {
      return { success: true, processed: 0 }
    }

    // Queue processing for each reply
    await step.run('queue-processing', async () => {
      const events = unclassifiedReplies.map((reply) => ({
        name: 'emailbison/reply-received' as const,
        data: {
          reply_id: reply.id,
          lead_email: reply.from_email,
          from_email: reply.from_email,
          subject: '',
          body: '',
          received_at: new Date().toISOString(),
        },
      }))

      await inngest.send(events)
    })

    return {
      success: true,
      processed: unclassifiedReplies.length,
    }
  }
)

// Helper: Determine if we should generate a response suggestion
function shouldGenerateResponse(classification: ReplyClassification): boolean {
  // Generate responses for positive, questions, and neutral replies
  const generateFor = ['positive', 'neutral', 'question']
  return generateFor.includes(classification.sentiment) && classification.intent_score >= 3
}

// Helper: Generate mock classification for development
function generateMockClassification(body: string, subject: string): ReplyClassification {
  const lowerBody = body.toLowerCase()
  const lowerSubject = subject.toLowerCase()

  // Simple rule-based mock classification
  if (lowerBody.includes('interested') || lowerBody.includes('tell me more') || lowerBody.includes('sounds good')) {
    return {
      sentiment: 'positive',
      intent_score: 8,
      confidence: 0.85,
      reasoning: 'Reply contains positive interest indicators',
      suggested_action: 'Schedule a call or send more information',
    }
  }

  if (lowerBody.includes('not interested') || lowerBody.includes('no thanks') || lowerBody.includes('remove me')) {
    return {
      sentiment: 'not_interested',
      intent_score: 1,
      confidence: 0.9,
      reasoning: 'Reply contains explicit disinterest',
      suggested_action: 'Respect decision, mark as not interested',
    }
  }

  if (lowerBody.includes('unsubscribe') || lowerBody.includes('stop emailing')) {
    return {
      sentiment: 'unsubscribe',
      intent_score: 0,
      confidence: 0.95,
      reasoning: 'Reply requests unsubscription',
      suggested_action: 'Remove from all campaigns immediately',
    }
  }

  if (lowerBody.includes('out of office') || lowerBody.includes('vacation') || lowerBody.includes('will be back')) {
    return {
      sentiment: 'out_of_office',
      intent_score: 5,
      confidence: 0.9,
      reasoning: 'Auto-reply detected',
      suggested_action: 'Wait and follow up after return date',
    }
  }

  if (lowerBody.includes('?') || lowerBody.includes('how') || lowerBody.includes('what')) {
    return {
      sentiment: 'question',
      intent_score: 6,
      confidence: 0.75,
      reasoning: 'Reply contains questions',
      suggested_action: 'Answer questions and guide toward next step',
    }
  }

  return {
    sentiment: 'neutral',
    intent_score: 5,
    confidence: 0.6,
    reasoning: 'No clear positive or negative signals detected',
    suggested_action: 'Review manually and follow up appropriately',
  }
}

// Helper: Generate mock response suggestion
function generateMockResponse(
  classification: ReplyClassification,
  reply: any
): SuggestedResponse {
  const leadName = reply.lead?.first_name || 'there'

  const responses: Record<string, SuggestedResponse> = {
    positive: {
      subject: `Re: ${reply.subject || 'Following up'}`,
      body: `Hi ${leadName},

Thanks so much for your interest! I'd love to set up a quick call to discuss how we can help.

Would you have 15-20 minutes this week or next? Feel free to pick a time that works: [CALENDAR_LINK]

Looking forward to connecting!

Best,
[YOUR_NAME]`,
      tone: 'enthusiastic',
      confidence: 0.8,
    },
    question: {
      subject: `Re: ${reply.subject || 'Your questions'}`,
      body: `Hi ${leadName},

Great questions! Let me address those:

[Answer their specific questions here]

Would it be helpful to jump on a quick call to discuss further? I'm happy to walk through anything in more detail.

Best,
[YOUR_NAME]`,
      tone: 'helpful',
      confidence: 0.75,
    },
    neutral: {
      subject: `Re: ${reply.subject || 'Following up'}`,
      body: `Hi ${leadName},

Thanks for getting back to me. I wanted to make sure you had everything you needed to evaluate whether this might be a good fit.

Is there any specific information I can provide, or would a quick call be useful?

Best,
[YOUR_NAME]`,
      tone: 'professional',
      confidence: 0.7,
    },
  }

  return responses[classification.sentiment] || responses.neutral
}

// Helper: Classify with Claude AI (real implementation)
async function classifyWithClaude(
  body: string,
  subject: string,
  reply: any,
  logger: any
): Promise<ReplyClassification> {
  // TODO: Implement real Claude API call for classification
  logger.info('[REAL] Would classify with Claude API')
  return generateMockClassification(body, subject)
}

// Helper: Generate response with Claude AI (real implementation)
async function generateResponseWithClaude(
  classification: ReplyClassification,
  reply: any,
  logger: any
): Promise<SuggestedResponse> {
  // TODO: Implement real Claude API call for response generation
  logger.info('[REAL] Would generate response with Claude API')
  return generateMockResponse(classification, reply)
}
