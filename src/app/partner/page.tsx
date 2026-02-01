/**
 * Partner Root Page - Redirect to Dashboard
 */

import { redirect } from 'next/navigation'

export default function PartnerRootPage() {
  redirect('/partner/dashboard')
}
