// Supabase Browser Client
// Use this in Client Components

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Browser client handles cookies automatically - no need for custom handlers
  // The @supabase/ssr package manages cookie storage internally
  // Note: Database type generic omitted until types are regenerated from the full schema
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
