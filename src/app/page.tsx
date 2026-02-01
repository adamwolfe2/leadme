import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Authenticated users go to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  // Non-authenticated users go to login page to sign up or log in
  redirect('/login')
}
