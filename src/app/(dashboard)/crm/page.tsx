import { redirect } from 'next/navigation'

// Redirect /crm to /crm/leads
export default function CRMPage() {
  redirect('/crm/leads')
}
