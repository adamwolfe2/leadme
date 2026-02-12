import { redirect } from 'next/navigation'

/**
 * Legacy lead preferences page — redirects to the active targeting system.
 * The old lead_preferences table is not connected to the lead routing pipeline.
 * All lead matching uses user_targeting via /my-leads/preferences.
 */
export default function LeadPreferencesPage() {
  redirect('/my-leads/preferences')
}
