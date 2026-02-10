'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Building2, Upload } from 'lucide-react'

type UserRole = 'business' | 'partner' | null

const industryOptions = [
  'HVAC',
  'Roofing',
  'Plumbing',
  'Electrical',
  'Solar',
  'Real Estate',
  'Insurance',
  'Home Services',
  'Other'
]

const partnerTypeOptions = [
  'Marketing Agency',
  'Lead Generation Company',
  'Data Provider',
  'Affiliate Network',
  'Other'
]

const leadVolumeOptions = [
  '1-50 per month',
  '51-200 per month',
  '201-500 per month',
  '500+ per month'
]

const databaseSizeOptions = [
  '0-1,000 leads',
  '1,000-10,000 leads',
  '10,000-50,000 leads',
  '50,000+ leads'
]

export default function WelcomeForm({ isMarketplace }: { isMarketplace: boolean }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)

  // Business fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [targetLocations, setTargetLocations] = useState('')
  const [monthlyLeadNeed, setMonthlyLeadNeed] = useState('')

  // Partner fields
  const [partnerType, setPartnerType] = useState('')
  const [primaryVerticals, setPrimaryVerticals] = useState('')
  const [databaseSize, setDatabaseSize] = useState('')
  const [enrichmentMethods, setEnrichmentMethods] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [website, setWebsite] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (selectedRole === 'business') {
        if (!firstName || !lastName || !email || !companyName || !industry || !monthlyLeadNeed) {
          throw new Error('Please fill in all required fields')
        }
      } else if (selectedRole === 'partner') {
        if (!firstName || !lastName || !email || !companyName || !partnerType || !primaryVerticals || !databaseSize || !linkedin) {
          throw new Error('Please fill in all required fields')
        }
      }

      const payload = selectedRole === 'business'
        ? {
            role: 'business',
            firstName,
            lastName,
            email,
            companyName,
            industry,
            targetLocations,
            monthlyLeadNeed
          }
        : {
            role: 'partner',
            firstName,
            lastName,
            email,
            companyName,
            partnerType,
            primaryVerticals,
            databaseSize,
            enrichmentMethods,
            linkedin,
            website
          }

      const res = await fetch('/api/onboarding/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 409 && data.workspace_id) {
        const redirectTo = isMarketplace ? '/marketplace' : '/dashboard'
        router.push(redirectTo)
        router.refresh()
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      const redirectTo = isMarketplace ? '/marketplace' : '/dashboard'
      router.push(redirectTo)
      router.refresh()

    } catch (err: any) {
      setError(err.message || 'Failed to create account')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image src="/cursive-logo.png" alt="Cursive" width={90} height={90} priority />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Cursive</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the first 100 {selectedRole === 'partner' ? 'partners' : 'businesses'}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!selectedRole ? (
          <div className="space-y-4">
            <p className="text-center text-sm font-medium text-gray-700">
              What brings you here?
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setSelectedRole('business')}
                className="group relative overflow-hidden bg-white rounded-xl border-2 border-gray-200 p-6 text-left shadow-sm hover:shadow-lg hover:border-blue-500 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-4">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  I'm a Business
                </h3>
                <p className="text-sm text-gray-600">
                  Get qualified leads delivered daily
                </p>
              </button>

              <button
                onClick={() => setSelectedRole('partner')}
                className="group relative overflow-hidden bg-white rounded-xl border-2 border-gray-200 p-6 text-left shadow-sm hover:shadow-lg hover:border-blue-500 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-4">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  I'm a Partner
                </h3>
                <p className="text-sm text-gray-600">
                  Start earning recurring revenue
                </p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {selectedRole === 'business' ? 'Business Information' : 'Partner Information'}
              </h3>

              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                    placeholder={selectedRole === 'business' ? 'john@company.com' : 'john@agency.com'}
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedRole === 'business' ? 'Company name *' : 'Company/Agency name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                    placeholder={selectedRole === 'business' ? 'Your company name' : 'Acme Lead Gen'}
                  />
                </div>

                {selectedRole === 'business' ? (
                  <>
                    {/* Industry */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                      </label>
                      <select
                        required
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      >
                        <option value="">Select an industry</option>
                        {industryOptions.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>

                    {/* Target Locations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target locations <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={targetLocations}
                        onChange={(e) => setTargetLocations(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                        placeholder="e.g., California, Northeast US, National"
                      />
                    </div>

                    {/* Monthly Lead Need */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How many leads do you need per month? *
                      </label>
                      <select
                        required
                        value={monthlyLeadNeed}
                        onChange={(e) => setMonthlyLeadNeed(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      >
                        <option value="">Select lead volume</option>
                        {leadVolumeOptions.map((vol) => (
                          <option key={vol} value={vol}>{vol}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Partner Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner type *
                      </label>
                      <select
                        required
                        value={partnerType}
                        onChange={(e) => setPartnerType(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      >
                        <option value="">Select partner type</option>
                        {partnerTypeOptions.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Primary Verticals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary verticals you serve *
                      </label>
                      <input
                        type="text"
                        required
                        value={primaryVerticals}
                        onChange={(e) => setPrimaryVerticals(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                        placeholder="e.g., Solar, HVAC, Insurance"
                      />
                    </div>

                    {/* Database Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current database size *
                      </label>
                      <select
                        required
                        value={databaseSize}
                        onChange={(e) => setDatabaseSize(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      >
                        <option value="">Select database size</option>
                        {databaseSizeOptions.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    {/* Enrichment Methods */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead enrichment methods <span className="text-gray-500">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={enrichmentMethods}
                        onChange={(e) => setEnrichmentMethods(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm resize-none"
                        placeholder="How do you verify/enrich? (e.g., manual research, intent tools, scraped data)"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn *
                      </label>
                      <input
                        type="text"
                        required
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full rounded-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                disabled={submitting}
                className="flex-1 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-md px-4 py-3 text-sm font-semibold text-white shadow-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating account...' : selectedRole === 'business' ? 'Get Free Leads' : 'Join Partner Network'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              {selectedRole === 'business'
                ? 'No spam. Unsubscribe anytime. Limited to first 100 businesses.'
                : 'Your leads stay tagged to you. Transparent attribution. Fair revenue share on every placement.'}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
