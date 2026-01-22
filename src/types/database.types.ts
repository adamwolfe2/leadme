// OpenInfo Platform - Database Types
// Generated from Supabase schema
// To regenerate: pnpx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type UserPlan = 'free' | 'pro'
export type UserRole = 'owner' | 'admin' | 'member'
export type TopicCategory =
  | 'technology'
  | 'marketing'
  | 'sales'
  | 'finance'
  | 'operations'
  | 'hr'
  | 'legal'
  | 'product'
  | 'other'
export type TrendDirection = 'up' | 'down' | 'stable'
export type QueryStatus = 'active' | 'paused' | 'completed'
export type EnrichmentStatus = 'pending' | 'enriching' | 'enriched' | 'failed'
export type DeliveryStatus = 'pending' | 'delivered' | 'failed'
export type CreditAction =
  | 'email_reveal'
  | 'lead_export'
  | 'people_search'
  | 'contact_enrichment'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ExportFormat = 'csv' | 'json'
export type IntegrationType = 'slack' | 'zapier' | 'webhook' | 'email'
export type IntegrationStatus = 'active' | 'inactive' | 'error'
export type BillingEventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'plan_upgraded'
  | 'plan_downgraded'

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          slug: string
          name: string
          industry_vertical: string | null
          subdomain: string | null
          custom_domain: string | null
          branding: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          industry_vertical?: string | null
          subdomain?: string | null
          custom_domain?: string | null
          branding?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          industry_vertical?: string | null
          subdomain?: string | null
          custom_domain?: string | null
          branding?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_user_id: string
          workspace_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          plan: UserPlan
          daily_credits_used: number
          daily_credit_limit: number
          referral_code: string | null
          referred_by: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          auth_user_id: string
          workspace_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          plan?: UserPlan
          daily_credits_used?: number
          daily_credit_limit?: number
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string
          workspace_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          plan?: UserPlan
          daily_credits_used?: number
          daily_credit_limit?: number
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      global_topics: {
        Row: {
          id: string
          topic: string
          category: TopicCategory
          current_volume: number
          trend_direction: TrendDirection
          change_percent: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic: string
          category?: TopicCategory
          current_volume?: number
          trend_direction?: TrendDirection
          change_percent?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic?: string
          category?: TopicCategory
          current_volume?: number
          trend_direction?: TrendDirection
          change_percent?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      trends: {
        Row: {
          id: string
          topic_id: string
          week_start: string
          week_end: string
          volume: number
          change_percent: number | null
          rank_overall: number | null
          rank_category: number | null
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          week_start: string
          week_end: string
          volume?: number
          change_percent?: number | null
          rank_overall?: number | null
          rank_category?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          week_start?: string
          week_end?: string
          volume?: number
          change_percent?: number | null
          rank_overall?: number | null
          rank_category?: number | null
          created_at?: string
        }
      }
      queries: {
        Row: {
          id: string
          workspace_id: string
          topic_id: string
          name: string | null
          filters: Json
          status: QueryStatus
          last_run_at: string | null
          next_run_at: string | null
          total_leads_generated: number
          leads_this_week: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          topic_id: string
          name?: string | null
          filters?: Json
          status?: QueryStatus
          last_run_at?: string | null
          next_run_at?: string | null
          total_leads_generated?: number
          leads_this_week?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          topic_id?: string
          name?: string | null
          filters?: Json
          status?: QueryStatus
          last_run_at?: string | null
          next_run_at?: string | null
          total_leads_generated?: number
          leads_this_week?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      saved_searches: {
        Row: {
          id: string
          workspace_id: string
          name: string
          filters: Json
          last_used_at: string | null
          use_count: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          filters?: Json
          last_used_at?: string | null
          use_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          filters?: Json
          last_used_at?: string | null
          use_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          workspace_id: string
          query_id: string
          company_data: Json
          contact_data: Json | null
          enrichment_status: EnrichmentStatus
          delivery_status: DeliveryStatus
          enrichment_attempts: number
          delivery_attempts: number
          last_error: string | null
          created_at: string
          enriched_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          query_id: string
          company_data: Json
          contact_data?: Json | null
          enrichment_status?: EnrichmentStatus
          delivery_status?: DeliveryStatus
          enrichment_attempts?: number
          delivery_attempts?: number
          last_error?: string | null
          created_at?: string
          enriched_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          query_id?: string
          company_data?: Json
          contact_data?: Json | null
          enrichment_status?: EnrichmentStatus
          delivery_status?: DeliveryStatus
          enrichment_attempts?: number
          delivery_attempts?: number
          last_error?: string | null
          created_at?: string
          enriched_at?: string | null
          delivered_at?: string | null
        }
      }
      credit_usage: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          action_type: CreditAction
          credits_used: number
          reference_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          action_type: CreditAction
          credits_used?: number
          reference_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          action_type?: CreditAction
          credits_used?: number
          reference_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      export_jobs: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          export_format: ExportFormat
          filters: Json
          status: ExportStatus
          file_url: string | null
          file_size_bytes: number | null
          row_count: number | null
          error_message: string | null
          created_at: string
          started_at: string | null
          completed_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          export_format?: ExportFormat
          filters?: Json
          status?: ExportStatus
          file_url?: string | null
          file_size_bytes?: number | null
          row_count?: number | null
          error_message?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          export_format?: ExportFormat
          filters?: Json
          status?: ExportStatus
          file_url?: string | null
          file_size_bytes?: number | null
          row_count?: number | null
          error_message?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
          expires_at?: string | null
        }
      }
      people_search_results: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          person_data: Json
          search_filters: Json
          email_revealed_at: string | null
          email_revealed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          person_data: Json
          search_filters?: Json
          email_revealed_at?: string | null
          email_revealed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          person_data?: Json
          search_filters?: Json
          email_revealed_at?: string | null
          email_revealed_by?: string | null
          created_at?: string
        }
      }
      saved_people_searches: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          name: string
          filters: Json
          last_used_at: string | null
          use_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          name: string
          filters?: Json
          last_used_at?: string | null
          use_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          name?: string
          filters?: Json
          last_used_at?: string | null
          use_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          workspace_id: string
          type: IntegrationType
          name: string
          status: IntegrationStatus
          config: Json
          last_used_at: string | null
          total_events_sent: number
          last_error: string | null
          error_count: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          type: IntegrationType
          name: string
          status?: IntegrationStatus
          config?: Json
          last_used_at?: string | null
          total_events_sent?: number
          last_error?: string | null
          error_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          type?: IntegrationType
          name?: string
          status?: IntegrationStatus
          config?: Json
          last_used_at?: string | null
          total_events_sent?: number
          last_error?: string | null
          error_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      billing_events: {
        Row: {
          id: string
          workspace_id: string
          event_type: BillingEventType
          stripe_event_id: string | null
          amount_cents: number | null
          currency: string | null
          old_plan: UserPlan | null
          new_plan: UserPlan | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          event_type: BillingEventType
          stripe_event_id?: string | null
          amount_cents?: number | null
          currency?: string | null
          old_plan?: UserPlan | null
          new_plan?: UserPlan | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          event_type?: BillingEventType
          stripe_event_id?: string | null
          amount_cents?: number | null
          currency?: string | null
          old_plan?: UserPlan | null
          new_plan?: UserPlan | null
          metadata?: Json
          created_at?: string
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_new_leads: boolean
          email_daily_digest: boolean
          email_weekly_report: boolean
          email_query_completed: boolean
          email_credit_low: boolean
          email_billing_updates: boolean
          inapp_new_leads: boolean
          inapp_mentions: boolean
          inapp_system_updates: boolean
          slack_new_leads: boolean
          slack_daily_digest: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_new_leads?: boolean
          email_daily_digest?: boolean
          email_weekly_report?: boolean
          email_query_completed?: boolean
          email_credit_low?: boolean
          email_billing_updates?: boolean
          inapp_new_leads?: boolean
          inapp_mentions?: boolean
          inapp_system_updates?: boolean
          slack_new_leads?: boolean
          slack_daily_digest?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_new_leads?: boolean
          email_daily_digest?: boolean
          email_weekly_report?: boolean
          email_query_completed?: boolean
          email_credit_low?: boolean
          email_billing_updates?: boolean
          inapp_new_leads?: boolean
          inapp_mentions?: boolean
          inapp_system_updates?: boolean
          slack_new_leads?: boolean
          slack_daily_digest?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stripe_customers: {
        Row: {
          id: string
          workspace_id: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          subscription_status: string | null
          current_period_start: string | null
          current_period_end: string | null
          default_payment_method: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          default_payment_method?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          default_payment_method?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      get_user_workspace_id: {
        Args: Record<string, never>
        Returns: string
      }
      search_topics: {
        Args: {
          search_query: string
          result_limit?: number
        }
        Returns: Array<{
          id: string
          topic: string
          category: TopicCategory
          current_volume: number
          trend_direction: TrendDirection
          relevance: number
        }>
      }
    }
    Enums: {
      user_plan: UserPlan
      user_role: UserRole
      topic_category: TopicCategory
      trend_direction: TrendDirection
      query_status: QueryStatus
      enrichment_status: EnrichmentStatus
      delivery_status: DeliveryStatus
      credit_action: CreditAction
      export_status: ExportStatus
      export_format: ExportFormat
      integration_type: IntegrationType
      integration_status: IntegrationStatus
      billing_event_type: BillingEventType
    }
  }
}
