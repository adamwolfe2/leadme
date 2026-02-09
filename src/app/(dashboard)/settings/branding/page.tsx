'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/lib/hooks/use-toast'

const DEFAULT_PRIMARY = '#3b82f6'
const DEFAULT_SECONDARY = '#8b5cf6'
const DEFAULT_ACCENT = '#f59e0b'

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground uppercase">{color}</p>
      </div>
    </div>
  )
}

export default function BrandingSettingsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()

  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY)
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY)
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT)
  const [logoUrl, setLogoUrl] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch current branding
  const { data: brandingData, isLoading } = useQuery({
    queryKey: ['workspace-branding'],
    queryFn: async () => {
      const response = await fetch('/api/workspace/branding')
      if (!response.ok) throw new Error('Failed to fetch branding')
      return response.json()
    },
  })

  const branding = brandingData?.data?.branding

  // Load branding into form
  useEffect(() => {
    if (branding) {
      setPrimaryColor(branding.primary_color || DEFAULT_PRIMARY)
      setSecondaryColor(branding.secondary_color || DEFAULT_SECONDARY)
      setAccentColor(branding.accent_color || DEFAULT_ACCENT)
      setLogoUrl(branding.logo_url || '')
      setHasChanges(false)
    }
  }, [branding])

  // Track changes
  const handleChange = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    setHasChanges(true)
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/workspace/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor || null,
          logo_url: logoUrl || null,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save branding')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-branding'] })
      setHasChanges(false)
      toast.success('Branding updated successfully!')
      // Reload to apply theme changes
      window.location.reload()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save branding')
    },
  })

  const handleReset = () => {
    if (branding) {
      setPrimaryColor(branding.primary_color || DEFAULT_PRIMARY)
      setSecondaryColor(branding.secondary_color || DEFAULT_SECONDARY)
      setAccentColor(branding.accent_color || DEFAULT_ACCENT)
      setLogoUrl(branding.logo_url || '')
      setHasChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set your workspace brand colors. These colors are used throughout the
            platform for buttons, links, and accents.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-w-lg">
            <FormField
              label="Primary Color"
              htmlFor="primary_color"
              description="Main brand color used for buttons and primary UI elements"
            >
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primary_color_picker"
                  value={primaryColor}
                  onChange={(e) => handleChange(setPrimaryColor)(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                />
                <Input
                  id="primary_color"
                  value={primaryColor}
                  onChange={(e) => handleChange(setPrimaryColor)(e.target.value)}
                  placeholder="#3b82f6"
                  className="max-w-32 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </FormField>

            <FormField
              label="Secondary Color"
              htmlFor="secondary_color"
              description="Used for secondary actions and complementary UI elements"
            >
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="secondary_color_picker"
                  value={secondaryColor}
                  onChange={(e) => handleChange(setSecondaryColor)(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                />
                <Input
                  id="secondary_color"
                  value={secondaryColor}
                  onChange={(e) => handleChange(setSecondaryColor)(e.target.value)}
                  placeholder="#8b5cf6"
                  className="max-w-32 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </FormField>

            <FormField
              label="Accent Color"
              htmlFor="accent_color"
              description="Used for highlights, badges, and attention-grabbing elements"
            >
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="accent_color_picker"
                  value={accentColor}
                  onChange={(e) => handleChange(setAccentColor)(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                />
                <Input
                  id="accent_color"
                  value={accentColor}
                  onChange={(e) => handleChange(setAccentColor)(e.target.value)}
                  placeholder="#f59e0b"
                  className="max-w-32 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your workspace logo displayed in the sidebar and platform header.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-lg">
            <FormField
              label="Logo URL"
              htmlFor="logo_url"
              description="Direct URL to your logo image (PNG, SVG, or JPG)"
            >
              <Input
                id="logo_url"
                value={logoUrl}
                onChange={(e) => handleChange(setLogoUrl)(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </FormField>

            {logoUrl && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-white">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Logo preview</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            See how your brand colors will look in the platform.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-6">
              <ColorSwatch color={primaryColor} label="Primary" />
              <ColorSwatch color={secondaryColor} label="Secondary" />
              <ColorSwatch color={accentColor} label="Accent" />
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <button
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: secondaryColor }}
              >
                Secondary Button
              </button>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: accentColor }}
              >
                Accent Badge
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-3">
        {hasChanges && (
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
        )}
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!hasChanges || saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Branding'}
        </Button>
      </div>
    </div>
  )
}
