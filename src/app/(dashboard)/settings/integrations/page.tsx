'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/lib/hooks/use-toast'
import { SlackIntegration } from '@/components/integrations/slack-integration'
import { ZapierIntegration } from '@/components/integrations/zapier-integration'
import { SalesforceIntegration } from '@/components/integrations/salesforce-integration'
import { GoogleSheetsIntegration } from '@/components/integrations/google-sheets-integration'

// CRM connection response type (matches /api/crm/connections)
interface CrmConnection {
  provider: string
  connected: boolean
  status: string
  lastSyncAt: string | null
  connectedAt: string | null
}

// CRM platform configuration (HubSpot uses setup modal; Salesforce & Google Sheets have dedicated components)
const CRM_PLATFORMS = [
  {
    name: 'HubSpot',
    key: 'hubspot',
    providerKey: 'hubspot',
    description: 'Push leads to HubSpot contacts and companies',
    color: 'orange',
    setupSteps: [
      'Create a HubSpot private app at Settings > Integrations > Private Apps in your HubSpot account.',
      'Grant the app scopes: crm.objects.contacts.write, crm.objects.contacts.read, crm.objects.companies.write, crm.objects.companies.read.',
      'Copy the generated access token.',
      'Add it as HUBSPOT_ACCESS_TOKEN in your environment variables, or store it via the Supabase dashboard in the crm_connections table for your workspace.',
      'Once configured, Cursive will automatically sync leads to HubSpot when you export.',
    ],
    docsUrl: 'https://developers.hubspot.com/docs/api/private-apps',
  },
] as const

// Integration logo configuration - using uploaded files from public folder
const INTEGRATION_LOGOS: Record<string, { src: string; alt: string }> = {
  slack: { src: '/Slack_icon_2019.svg.png', alt: 'Slack' },
  zapier: { src: '/zapier-logo-png-transparent.png', alt: 'Zapier' },
  salesforce: { src: '/Salesforce.com_logo.svg.png', alt: 'Salesforce' },
  hubspot: { src: '/free-hubspot-logo-icon-svg-download-png-2944939.webp', alt: 'HubSpot' },
  pipedrive: { src: '/Pipedrive_Monogram_Green background.png', alt: 'Pipedrive' },
  'google-sheets': { src: '/Google_Sheets_Logo_512px.png', alt: 'Google Sheets' },
  'microsoft-teams': { src: '/Microsoft_Teams.png', alt: 'Microsoft Teams' },
  discord: { src: '/concours-discord-cartes-voeux-fortnite-france-6.png', alt: 'Discord' },
}

// Fallback icon component when logo is not available
function FallbackIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    salesforce: 'bg-blue-500',
    hubspot: 'bg-orange-500',
    pipedrive: 'bg-green-600',
    'google-sheets': 'bg-green-500',
    'microsoft-teams': 'bg-indigo-500',
    discord: 'bg-indigo-600',
  }

  const labels: Record<string, string> = {
    salesforce: 'SF',
    hubspot: 'HS',
    pipedrive: 'PD',
    'google-sheets': 'GS',
    'microsoft-teams': 'MT',
    discord: 'DC',
  }

  return (
    <div className={`w-10 h-10 rounded-lg ${icons[name] || 'bg-zinc-400'} flex items-center justify-center text-white text-xs font-bold`}>
      {labels[name] || name.slice(0, 2).toUpperCase()}
    </div>
  )
}

// Integration logo component with fallback
function IntegrationLogo({ name }: { name: string }) {
  const [hasError, setHasError] = useState(false)
  const logo = INTEGRATION_LOGOS[name]

  if (!logo || hasError) {
    return <FallbackIcon name={name} />
  }

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={40}
      height={40}
      className="object-contain"
      onError={() => setHasError(true)}
    />
  )
}

// Format a date string to a human-friendly relative or absolute format
function formatSyncTime(dateString: string | null): string {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Setup instructions modal for CRM platforms
function CrmSetupModal({
  platform,
  onClose,
}: {
  platform: typeof CRM_PLATFORMS[number]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 p-6 pb-4">
          <div className="flex items-center gap-3">
            <IntegrationLogo name={platform.key} />
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Connect {platform.name}
              </h2>
              <p className="text-sm text-zinc-500">{platform.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-800">Setup Instructions</h3>
          <ol className="space-y-3">
            {platform.setupSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-700">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mt-4">
            <p className="text-xs text-amber-800">
              After configuring the credentials, the connection will appear as active on this page.
              You can then export leads from the Leads page or set up automatic sync.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 p-6 pt-4">
          <a
            href={platform.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:text-primary/90 font-medium"
          >
            View Documentation
          </a>
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// Webhook event types supported by the platform
const WEBHOOK_EVENTS = [
  { key: 'lead.created', label: 'Lead Created', description: 'When a new lead is identified' },
  { key: 'lead.updated', label: 'Lead Updated', description: 'When lead data changes' },
  { key: 'lead.exported', label: 'Lead Exported', description: 'When a lead is exported to a CRM' },
  { key: 'lead.scored', label: 'Lead Scored', description: 'When intent score changes' },
] as const

// Webhook settings response type
interface WebhookSettings {
  webhook_url: string | null
  webhook_secret: string | null
  webhook_enabled: boolean
  webhook_events: string[]
}

export default function IntegrationsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [customWebhookUrl, setCustomWebhookUrl] = useState('')
  const [webhookEnabled, setWebhookEnabled] = useState(false)
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['lead.created'])
  const [showSecret, setShowSecret] = useState(false)
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [webhookSettingsLoaded, setWebhookSettingsLoaded] = useState(false)
  const [setupModalPlatform, setSetupModalPlatform] = useState<typeof CRM_PLATFORMS[number] | null>(null)

  // Fetch current user
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await fetch('/api/users/me')
      if (!response.ok) throw new Error('Failed to fetch user data')
      return response.json()
    },
  })

  const user = userData?.data

  // Fetch CRM connection statuses
  const { data: connectionsData } = useQuery({
    queryKey: ['crm', 'connections'],
    queryFn: async () => {
      const response = await fetch('/api/crm/connections')
      if (!response.ok) throw new Error('Failed to fetch CRM connections')
      return response.json()
    },
    enabled: !!user,
  })

  const crmConnections: CrmConnection[] = connectionsData?.data?.connections ?? []

  // Helper to get connection for a given provider key
  const getConnection = useCallback(
    (providerKey: string): CrmConnection | undefined => {
      return crmConnections.find((c) => c.provider === providerKey)
    },
    [crmConnections]
  )

  // Disconnect a CRM provider
  const disconnectCrmMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch('/api/crm/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to disconnect ${provider}`)
      }
      return response.json()
    },
    onSuccess: (_data, provider) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'connections'] })
      const label = CRM_PLATFORMS.find((p) => p.providerKey === provider)?.name ?? provider
      toast.success(`${label} disconnected successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disconnect')
    },
  })

  // Save custom webhook mutation
  const saveCustomWebhookMutation = useMutation({
    mutationFn: async (webhookUrl: string) => {
      const response = await fetch('/api/integrations/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save webhook')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Custom webhook saved successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save webhook')
    },
  })

  // Generate API key mutation
  const generateApiKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/integrations/api-key', {
        method: 'POST',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate API key')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('API key generated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate API key')
    },
  })

  // Fetch webhook settings
  const { data: webhookData } = useQuery<WebhookSettings>({
    queryKey: ['webhook', 'settings'],
    queryFn: async () => {
      const response = await fetch('/api/integrations/webhook')
      if (!response.ok) throw new Error('Failed to fetch webhook settings')
      return response.json()
    },
    enabled: !!user,
  })

  // Sync webhook settings into local state when data loads
  if (webhookData && !webhookSettingsLoaded) {
    setCustomWebhookUrl(webhookData.webhook_url || '')
    setWebhookEnabled(webhookData.webhook_enabled)
    setWebhookEvents(webhookData.webhook_events || ['lead.created'])
    setWebhookSettingsLoaded(true)
  }

  // Update webhook settings mutation (POST)
  const updateWebhookMutation = useMutation({
    mutationFn: async (payload: {
      webhook_url?: string | null
      webhook_enabled?: boolean
      webhook_events?: string[]
    }) => {
      const response = await fetch('/api/integrations/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update webhook settings')
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhook', 'settings'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      // If a new secret was generated, reveal it
      if (data.webhook_secret && data.webhook_secret !== '••••••••') {
        setRevealedSecret(data.webhook_secret)
        setShowSecret(true)
      }
      toast.success('Webhook settings saved successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update webhook settings')
    },
  })

  // Test webhook mutation (PUT)
  const testWebhookMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/integrations/webhook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to test webhook')
      }
      return response.json()
    },
    onSuccess: (data) => {
      setTestResult({ success: data.success, message: data.message })
    },
    onError: (error: Error) => {
      setTestResult({ success: false, message: error.message || 'Failed to test webhook' })
    },
  })

  // Regenerate webhook secret mutation (DELETE)
  const regenerateSecretMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/integrations/webhook', {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to regenerate secret')
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhook', 'settings'] })
      if (data.webhook_secret) {
        setRevealedSecret(data.webhook_secret)
        setShowSecret(true)
      }
      toast.success('Webhook secret regenerated. Save it now!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to regenerate secret')
    },
  })

  const handleSaveWebhookSettings = () => {
    if (customWebhookUrl) {
      try {
        new URL(customWebhookUrl)
      } catch {
        toast.error('Please enter a valid URL')
        return
      }
    }

    updateWebhookMutation.mutate({
      webhook_url: customWebhookUrl || null,
      webhook_enabled: webhookEnabled,
      webhook_events: webhookEvents,
    })
  }

  const handleTestWebhook = () => {
    const url = customWebhookUrl || webhookData?.webhook_url
    if (!url) {
      toast.error('Please enter a webhook URL first')
      return
    }
    try {
      new URL(url)
      setTestResult(null)
      testWebhookMutation.mutate(url)
    } catch {
      toast.error('Please enter a valid URL')
    }
  }

  const handleRegenerateSecret = () => {
    if (confirm('Are you sure you want to regenerate your webhook secret? The old secret will stop working immediately. You must update your webhook consumer with the new secret.')) {
      regenerateSecretMutation.mutate()
    }
  }

  const handleToggleEvent = (eventKey: string) => {
    setWebhookEvents((prev) =>
      prev.includes(eventKey)
        ? prev.filter((e) => e !== eventKey)
        : [...prev, eventKey]
    )
  }

  const handleSaveCustomWebhook = () => {
    if (!customWebhookUrl) {
      toast.error('Please enter a webhook URL')
      return
    }

    try {
      new URL(customWebhookUrl)
      saveCustomWebhookMutation.mutate(customWebhookUrl)
    } catch {
      toast.error('Please enter a valid URL')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse" />
        <div className="h-96 bg-zinc-200 rounded animate-pulse" />
      </div>
    )
  }

  const isPro = user?.plan === 'pro'

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary">
              Multi-Channel Lead Delivery
            </h3>
            <p className="mt-2 text-sm text-primary/90">
              Connect Slack, Zapier, or custom webhooks to receive leads in real-time
              across multiple channels. Pro plan required for integrations.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications & Automation */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Notifications & Automation</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SlackIntegration user={user} isPro={isPro} />
          <ZapierIntegration user={user} isPro={isPro} />
        </div>
      </div>

      {/* CRM Integrations - Dedicated Components */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">CRM Integrations</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SalesforceIntegration workspaceId={user?.workspace_id ?? ''} isPro={isPro} />
          <GoogleSheetsIntegration workspaceId={user?.workspace_id ?? ''} isPro={isPro} />
        </div>
      </div>

      {/* Custom Webhooks */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-zinc-900">Custom Webhooks</h2>
            <p className="text-sm text-zinc-600 mt-1">
              Send lead data to any endpoint via HTTP POST. Perfect for custom
              integrations and internal tools.
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {!isPro && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary">
                Pro
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-zinc-700">
                Webhook Delivery
              </label>
              <p className="text-xs text-zinc-500 mt-0.5">
                {webhookEnabled ? 'Webhooks are active and delivering events' : 'Webhooks are paused'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={webhookEnabled}
              disabled={!isPro}
              onClick={() => setWebhookEnabled(!webhookEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                webhookEnabled ? 'bg-primary' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  webhookEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://your-domain.com/webhook"
              className="block w-full rounded-lg border-zinc-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-zinc-50 disabled:cursor-not-allowed"
              value={customWebhookUrl}
              onChange={(e) => setCustomWebhookUrl(e.target.value)}
              disabled={!isPro}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Receives POST requests with JSON lead data, signed with your HMAC secret
            </p>
          </div>

          {/* Webhook Secret */}
          {isPro && (webhookData?.webhook_secret || revealedSecret) && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Signing Secret
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type={showSecret && revealedSecret ? 'text' : 'password'}
                    value={revealedSecret || webhookData?.webhook_secret || ''}
                    readOnly
                    className="block w-full rounded-lg border-zinc-300 bg-zinc-50 shadow-sm text-sm font-mono pr-16"
                  />
                  {revealedSecret && (
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-500 hover:text-zinc-700 font-medium"
                    >
                      {showSecret ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (revealedSecret) {
                      navigator.clipboard.writeText(revealedSecret)
                      toast.success('Secret copied to clipboard!')
                    } else {
                      toast.error('Secret is masked. Regenerate to see the full value.')
                    }
                  }}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={handleRegenerateSecret}
                  disabled={regenerateSecretMutation.isPending}
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {regenerateSecretMutation.isPending ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Used to verify webhook signatures. Sent in the <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">X-Cursive-Signature</code> header.
              </p>
              {revealedSecret && (
                <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                  <p className="text-xs text-amber-800 font-medium">
                    Save this secret now. It will be masked once you leave this page.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Webhook Events
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Select which events trigger webhook delivery.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {WEBHOOK_EVENTS.map((event) => {
                const isChecked = webhookEvents.includes(event.key)
                return (
                  <label
                    key={event.key}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    } ${!isPro ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleEvent(event.key)}
                      disabled={!isPro}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary disabled:cursor-not-allowed"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-zinc-900">
                        {event.label}
                      </span>
                      <span className="block text-xs text-zinc-500 mt-0.5">
                        {event.description}
                      </span>
                      <code className="text-xs text-zinc-400 font-mono mt-1 block">
                        {event.key}
                      </code>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveWebhookSettings}
              disabled={!isPro || updateWebhookMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {updateWebhookMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>

            <button
              onClick={handleTestWebhook}
              disabled={!isPro || testWebhookMutation.isPending || !customWebhookUrl}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testWebhookMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Testing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Send Test
                </span>
              )}
            </button>
          </div>

          {/* Test Result Feedback */}
          {testResult && (
            <div
              className={`rounded-lg border p-3 ${
                testResult.success
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <p className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {!isPro && (
            <p className="text-sm text-zinc-500">
              <Link
                href="/settings/billing"
                className="text-primary hover:text-primary/90 font-medium"
              >
                Upgrade to Pro
              </Link>{' '}
              to use custom webhooks
            </p>
          )}
        </div>

        {/* Webhook Payload Example */}
        {(customWebhookUrl || webhookData?.webhook_url) && isPro && (
          <div className="mt-6 pt-6 border-t border-zinc-200">
            <h3 className="text-sm font-medium text-zinc-900 mb-3">Example Payload</h3>
            <pre className="text-xs bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(
                {
                  event: 'lead.created',
                  lead_id: 'uuid',
                  company: {
                    name: 'Acme Corp',
                    domain: 'acme.com',
                    industry: 'Technology',
                    employee_count: 250,
                  },
                  contact: {
                    name: 'John Smith',
                    email: 'john@acme.com',
                    title: 'VP of Engineering',
                  },
                  intent_score: 'hot',
                  query_id: 'uuid',
                  created_at: '2026-01-23T10:00:00Z',
                },
                null,
                2
              )}
            </pre>
            <div className="mt-3 rounded-lg bg-zinc-50 border border-zinc-200 p-3">
              <h4 className="text-xs font-semibold text-zinc-700 mb-1">Signature Verification</h4>
              <p className="text-xs text-zinc-500">
                Each request includes an <code className="bg-zinc-100 px-1 py-0.5 rounded">X-Cursive-Signature</code> header
                in the format <code className="bg-zinc-100 px-1 py-0.5 rounded">t=timestamp,v1=signature</code>.
                Compute <code className="bg-zinc-100 px-1 py-0.5 rounded">HMAC-SHA256(secret, &quot;timestamp.body&quot;)</code> and
                compare with the <code className="bg-zinc-100 px-1 py-0.5 rounded">v1</code> value to verify authenticity.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* API Keys */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-zinc-900">API Keys</h2>
            <p className="text-sm text-zinc-600 mt-1">
              Generate API keys to access Cursive programmatically via our REST API.
            </p>
          </div>
          {!isPro && (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary ml-4">
              Pro
            </span>
          )}
        </div>

        {user?.api_key && isPro ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Your API Key
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={user.api_key}
                  readOnly
                  className="block flex-1 rounded-lg border-zinc-300 bg-zinc-50 shadow-sm text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.api_key)
                    toast.success('API key copied to clipboard!')
                  }}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to regenerate your API key? The old key will stop working immediately.'
                  )
                ) {
                  generateApiKeyMutation.mutate()
                }
              }}
              disabled={generateApiKeyMutation.isPending}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              {generateApiKeyMutation.isPending ? 'Regenerating...' : 'Regenerate API Key'}
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => generateApiKeyMutation.mutate()}
              disabled={!isPro || generateApiKeyMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {generateApiKeyMutation.isPending ? 'Generating...' : 'Generate API Key'}
            </button>

            {!isPro && (
              <p className="text-sm text-zinc-500 mt-3">
                <Link
                  href="/settings/billing"
                  className="text-primary hover:text-primary/90 font-medium"
                >
                  Upgrade to Pro
                </Link>{' '}
                to generate API keys
              </p>
            )}
          </div>
        )}

        {user?.api_key && isPro && (
          <div className="mt-6 pt-6 border-t border-zinc-200">
            <h3 className="text-sm font-medium text-zinc-900 mb-3">Example Usage</h3>
            <pre className="text-xs bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto">
              {`curl -X GET "https://api.meetcursive.com/v1/leads" \\
  -H "Authorization: Bearer ${user.api_key}" \\
  -H "Content-Type: application/json"`}
            </pre>
            <p className="text-sm text-zinc-500 mt-3">
              <a
                href="/docs/api"
                className="text-primary hover:text-primary/90 font-medium"
              >
                View API Documentation →
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Additional CRM Connections (HubSpot / GHL) */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Additional CRM Connections</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Connect additional CRM platforms using API keys and manual configuration.
            </p>
          </div>
          {!isPro && (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary ml-4">
              Pro
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CRM_PLATFORMS.map((platform) => {
            const connection = getConnection(platform.providerKey)
            const isConnected = connection?.connected === true
            const isExpired = connection?.status === 'token_expired'

            return (
              <div
                key={platform.key}
                className={`rounded-xl border p-4 transition-all ${
                  isConnected
                    ? 'border-green-200 bg-green-50/30'
                    : isExpired
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <IntegrationLogo name={platform.key} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900">
                        {platform.name}
                      </h3>
                      {isConnected && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Connected
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                      {platform.description}
                    </p>
                  </div>
                </div>

                {isConnected && (
                  <div className="mt-3 pt-3 border-t border-green-200/60">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zinc-500">
                        Last sync: {formatSyncTime(connection?.lastSyncAt ?? null)}
                      </p>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to disconnect ${platform.name}?`)) {
                            disconnectCrmMutation.mutate(platform.providerKey)
                          }
                        }}
                        disabled={disconnectCrmMutation.isPending}
                        className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}

                {isExpired && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-amber-700">
                        Token expired. Please reconnect.
                      </p>
                      <button
                        onClick={() => setSetupModalPlatform(platform)}
                        className="text-xs text-primary hover:text-primary/90 font-medium"
                      >
                        Reconnect
                      </button>
                    </div>
                  </div>
                )}

                {!isConnected && !isExpired && (
                  <div className="mt-4">
                    {isPro ? (
                      <button
                        onClick={() => setSetupModalPlatform(platform)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-sm"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Connect
                      </button>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        <Link
                          href="/settings/billing"
                          className="text-primary hover:text-primary/90 font-medium"
                        >
                          Upgrade to Pro
                        </Link>{' '}
                        to connect
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-6">Coming Soon</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: 'Pipedrive',
              key: 'pipedrive',
              description: 'Create deals in Pipedrive automatically',
            },
            {
              name: 'Microsoft Teams',
              key: 'microsoft-teams',
              description: 'Receive lead notifications in Teams',
            },
            {
              name: 'Discord',
              key: 'discord',
              description: 'Get lead alerts in Discord channels',
            },
          ].map((integration) => (
            <div
              key={integration.key}
              className="rounded-xl border border-zinc-200 p-4 opacity-60 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <IntegrationLogo name={integration.key} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {integration.name}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{integration.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-600">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPro && (
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary/90 p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Unlock All Integrations</h2>
              <p className="text-white/80">
                Upgrade to Pro to connect Slack, Zapier, HubSpot, Salesforce, Google Sheets,
                custom webhooks, and access our API. Automate your entire lead workflow.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/settings/billing"
                className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors shadow-md"
              >
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CRM Setup Modal */}
      {setupModalPlatform && (
        <CrmSetupModal
          platform={setupModalPlatform}
          onClose={() => setSetupModalPlatform(null)}
        />
      )}
    </div>
  )
}
