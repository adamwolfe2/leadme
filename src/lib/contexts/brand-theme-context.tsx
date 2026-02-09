'use client'

/**
 * Brand Theme Provider
 * Reads workspace branding colors and injects them as CSS custom properties
 * so the Tailwind design system reflects the workspace's brand.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

interface BrandTheme {
  primaryColor: string | null
  secondaryColor: string | null
  accentColor: string | null
  logoUrl: string | null
}

interface BrandThemeContextType {
  theme: BrandTheme
  isLoaded: boolean
}

const BrandThemeContext = createContext<BrandThemeContextType>({
  theme: { primaryColor: null, secondaryColor: null, accentColor: null, logoUrl: null },
  isLoaded: false,
})

export const useBrandTheme = () => useContext(BrandThemeContext)

/**
 * Convert hex color to HSL string (without "hsl()" wrapper)
 * Returns format: "211 100% 50%" for use in CSS custom properties
 */
function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function applyBrandColors(branding: Record<string, string | null>) {
  const root = document.documentElement

  if (branding.primary_color) {
    const hsl = hexToHsl(branding.primary_color)
    if (hsl) {
      root.style.setProperty('--primary', hsl)
      // Derive hover (slightly darker)
      const parts = hsl.split(' ')
      const h = parts[0]
      const s = parts[1]
      const l = parseInt(parts[2])
      root.style.setProperty('--primary-hover', `${h} ${s} ${Math.max(l - 5, 0)}%`)
      root.style.setProperty('--primary-muted', `${h} ${s} 96%`)
    }
  }

  if (branding.accent_color) {
    const hsl = hexToHsl(branding.accent_color)
    if (hsl) {
      root.style.setProperty('--accent', hsl)
      root.style.setProperty('--accent-foreground', '0 0% 100%')
    }
  }

  // Also update ring/focus to match primary
  if (branding.primary_color) {
    const hsl = hexToHsl(branding.primary_color)
    if (hsl) {
      root.style.setProperty('--ring', hsl)
      root.style.setProperty('--border-focus', hsl)
      root.style.setProperty('--input-focus', hsl)
    }
  }
}

function clearBrandColors() {
  const root = document.documentElement
  const properties = [
    '--primary', '--primary-hover', '--primary-muted',
    '--accent', '--accent-foreground',
    '--ring', '--border-focus', '--input-focus',
  ]
  properties.forEach((prop) => root.style.removeProperty(prop))
}

export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<BrandTheme>({
    primaryColor: null,
    secondaryColor: null,
    accentColor: null,
    logoUrl: null,
  })
  const [isLoaded, setIsLoaded] = useState(false)

  const { data: brandingData } = useQuery({
    queryKey: ['workspace-branding'],
    queryFn: async () => {
      const response = await fetch('/api/workspace/branding')
      if (!response.ok) return null
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  })

  useEffect(() => {
    const branding = brandingData?.data?.branding
    if (branding) {
      setTheme({
        primaryColor: branding.primary_color || null,
        secondaryColor: branding.secondary_color || null,
        accentColor: branding.accent_color || null,
        logoUrl: branding.logo_url || null,
      })
      applyBrandColors(branding)
      setIsLoaded(true)
    } else if (brandingData !== undefined) {
      // Data loaded but no custom branding — use defaults
      clearBrandColors()
      setIsLoaded(true)
    }
  }, [brandingData])

  // Clean up on unmount
  useEffect(() => {
    return () => clearBrandColors()
  }, [])

  return (
    <BrandThemeContext.Provider value={{ theme, isLoaded }}>
      {children}
    </BrandThemeContext.Provider>
  )
}
