'use client'
import { useState } from 'react'

interface Props {
  domain: string
  monthlyVisitors: number
  dealSize: number
  industry: string
  revenueLeak: number
  cursiveAdvantage: number
}

export function LeadCaptureForm({ domain, monthlyVisitors, dealSize, industry, revenueLeak, cursiveAdvantage }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain, monthly_visitors: monthlyVisitors, deal_size: dealSize, industry, revenue_leak_annual: revenueLeak, cursive_advantage_annual: cursiveAdvantage }),
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
        <span>&#10003;</span>
        <span>Report sent! Check your inbox.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/30 transition-all"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all whitespace-nowrap"
      >
        {status === 'loading' ? 'Sending...' : 'Get Full Report'}
      </button>
    </form>
  )
}
