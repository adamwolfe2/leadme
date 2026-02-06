/**
 * Integration Types
 * Types for CRM and external service sync operations
 */

// ============================================================================
// SYNC RESULT TYPES
// ============================================================================

export type IntegrationProvider = 'hubspot' | 'salesforce' | 'google_sheets'

export type SyncAction = 'created' | 'updated' | 'failed'

export interface SyncResult {
  success: boolean
  externalId?: string
  provider: IntegrationProvider
  action: SyncAction
  error?: string
}

export interface BulkSyncResult {
  total: number
  synced: number
  failed: number
  results: SyncResult[]
}

// ============================================================================
// CRM CONNECTION
// ============================================================================

export interface CrmConnection {
  id: string
  workspace_id: string
  provider: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  instance_url?: string
  field_mappings?: Record<string, string>
  settings?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================================
// SALESFORCE TYPES
// ============================================================================

export interface SalesforceLeadFields {
  FirstName?: string
  LastName?: string
  Email?: string
  Phone?: string
  Company?: string
  Title?: string
  City?: string
  State?: string
  Status?: string
  LinkedIn_Profile__c?: string
  Lead_Score__c?: number
  [key: string]: string | number | undefined
}

export interface SalesforceContactFields {
  FirstName?: string
  LastName?: string
  Email?: string
  Phone?: string
  Title?: string
  MailingCity?: string
  MailingState?: string
  LinkedIn_Profile__c?: string
  [key: string]: string | number | undefined
}

export interface SalesforceAccountFields {
  Name: string
  Website?: string
  [key: string]: string | undefined
}

export interface SalesforceApiResponse {
  id: string
  success: boolean
  errors: Array<{ message: string; statusCode: string }>
}

export interface SalesforceQueryResponse<T = Record<string, unknown>> {
  totalSize: number
  done: boolean
  records: Array<T & { Id: string; attributes: { type: string; url: string } }>
}

// ============================================================================
// GOOGLE SHEETS TYPES
// ============================================================================

export interface GoogleSheetsSpreadsheet {
  spreadsheetId: string
  properties: {
    title: string
  }
  spreadsheetUrl: string
}

export interface GoogleSheetsAppendResponse {
  spreadsheetId: string
  updates: {
    updatedRows: number
    updatedColumns: number
    updatedCells: number
  }
}

export interface GoogleDriveFileList {
  files: Array<{
    id: string
    name: string
  }>
}

// ============================================================================
// STATUS MAPPINGS
// ============================================================================

export const SALESFORCE_STATUS_MAP: Record<string, string> = {
  new: 'Open - Not Contacted',
  contacted: 'Working - Contacted',
  qualified: 'Working - Contacted',
  proposal: 'Working - Contacted',
  negotiation: 'Working - Contacted',
  won: 'Closed - Converted',
  lost: 'Closed - Not Converted',
}

// ============================================================================
// DEFAULT FIELD MAPPINGS
// ============================================================================

export const DEFAULT_SALESFORCE_LEAD_MAPPINGS: Record<string, string> = {
  first_name: 'FirstName',
  last_name: 'LastName',
  email: 'Email',
  phone: 'Phone',
  company_name: 'Company',
  title: 'Title',
  city: 'City',
  state: 'State',
  linkedin_url: 'LinkedIn_Profile__c',
  intent_score_calculated: 'Lead_Score__c',
  status: 'Status',
}

export const GOOGLE_SHEETS_DEFAULT_HEADERS: string[] = [
  'Name',
  'Email',
  'Phone',
  'Company',
  'Title',
  'City',
  'State',
  'LinkedIn',
  'Intent Score',
  'Status',
  'Created Date',
]
