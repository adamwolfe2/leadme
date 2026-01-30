import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PartnerRepository } from '@/lib/repositories/partner.repository'
import { PartnerDetailClient } from './components/PartnerDetailClient'

export default async function AdminPartnerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: admin } = await supabase
    .from('platform_admins')
    .select('id')
    .eq('email', user.email)
    .eq('is_active', true)
    .single()

  if (!admin) redirect('/dashboard')

  // Get partner details
  const repo = new PartnerRepository()
  const partner = await repo.findById(params.id)

  if (!partner) {
    redirect('/admin/partners')
  }

  // Get upload batches
  const { batches, total: uploadCount } = await repo.getUploadBatches(params.id, {
    limit: 20,
  })

  // Get earnings
  const { earnings, total: earningsCount } = await repo.getEarningsHistory(params.id, {
    limit: 50,
  })

  // Get payouts
  const { payouts } = await repo.getPayouts(params.id, {
    limit: 20,
  })

  // Get referred partners count
  const { data: referredPartners, count: referredCount } = await supabase
    .from('partners')
    .select('*', { count: 'exact' })
    .eq('referred_by_partner_id', params.id)

  return (
    <PartnerDetailClient
      partner={partner}
      batches={batches}
      uploadCount={uploadCount}
      earnings={earnings}
      earningsCount={earningsCount}
      payouts={payouts}
      referredCount={referredCount || 0}
    />
  )
}
