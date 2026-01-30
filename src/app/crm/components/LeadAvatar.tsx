// Lead Avatar Component
// Avatar with fallback to initials and color generation from email hash

'use client'

import { Avatar } from '@/components/ui/avatar'

export interface LeadAvatarProps {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  imageUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'default',
  xl: 'lg',
} as const

export function LeadAvatar({
  firstName,
  lastName,
  email,
  imageUrl,
  size = 'md',
  className,
}: LeadAvatarProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || email || 'Unknown'

  // Use unavatar.io as fallback for profile images (like Twenty)
  const avatarSrc = imageUrl || (email ? `https://unavatar.io/${email}` : undefined)

  return (
    <Avatar
      src={avatarSrc}
      name={fullName}
      size={sizeMap[size]}
      className={className}
    />
  )
}
