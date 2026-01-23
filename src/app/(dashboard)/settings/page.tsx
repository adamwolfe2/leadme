'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { profileSettingsSchema, type ProfileSettingsFormData } from '@/lib/validation/schemas'
import {
  FormField,
  FormLabel,
  FormInput,
  FormError,
  FormSuccess,
} from '@/components/ui/form'

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    mode: 'onBlur',
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
    },
  })

  // Reset form when user data loads
  useState(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        email: user.email || '',
      })
    }
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileSettingsFormData) => {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: data.full_name }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      setSuccessMessage('Profile updated successfully!')
      setErrorMessage('')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
    onError: (error: Error) => {
      setErrorMessage(error.message)
      setSuccessMessage('')
    },
  })

  const onSubmit = async (data: ProfileSettingsFormData) => {
    updateProfileMutation.mutate(data)
  }

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code)
      setSuccessMessage('Referral code copied!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${user?.referral_code}`
    navigator.clipboard.writeText(link)
    setSuccessMessage('Referral link copied!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/settings"
            className="border-blue-500 text-blue-600 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
          >
            Profile
          </Link>
          <Link
            href="/settings/notifications"
            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
          >
            Notifications
          </Link>
          <Link
            href="/settings/security"
            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
          >
            Security
          </Link>
          <Link
            href="/settings/billing"
            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
          >
            Billing
          </Link>
        </nav>
      </div>

      {/* Success Message */}
      <FormSuccess message={successMessage || undefined} />

      {/* Error Message */}
      <FormError message={errorMessage || undefined} />

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Personal Information
          </h2>

          <div className="space-y-4">
            <FormField error={errors.full_name}>
              <FormLabel htmlFor="full_name" required>
                Full Name
              </FormLabel>
              <FormInput
                id="full_name"
                type="text"
                disabled={updateProfileMutation.isPending}
                error={errors.full_name}
                {...register('full_name')}
              />
            </FormField>

            <FormField error={errors.email}>
              <FormLabel
                htmlFor="email"
                hint="Email cannot be changed once registered"
              >
                Email Address
              </FormLabel>
              <FormInput
                id="email"
                type="email"
                disabled
                className="bg-zinc-50 text-zinc-500"
                {...register('email')}
              />
            </FormField>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending || Object.keys(errors).length > 0}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      {/* Workspace Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Workspace Information
        </h2>

        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-700">Role:</span>
            <span className="ml-2 text-sm text-gray-900 capitalize">
              {user?.role || 'Member'}
            </span>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700">Plan:</span>
            <span className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {user?.plan || 'free'}
            </span>
            {user?.plan === 'free' && (
              <Link
                href="/pricing"
                className="ml-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Upgrade to Pro →
              </Link>
            )}
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700">
              Credits Remaining:
            </span>
            <span className="ml-2 text-sm text-gray-900">
              {user?.credits_remaining || 0} /{' '}
              {user?.daily_credit_limit || 3} today
            </span>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700">
              Member since:
            </span>
            <span className="ml-2 text-sm text-gray-900">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Referral Program */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Referral Program
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Share OpenInfo with your network and earn bonus credits when they
          sign up using your referral link.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Referral Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={user?.referral_code || 'Generating...'}
                readOnly
                className="block flex-1 rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
              <button
                onClick={copyReferralCode}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Copy Code
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Referral Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={
                  user?.referral_code
                    ? `${window.location.origin}/signup?ref=${user.referral_code}`
                    : 'Generating...'
                }
                readOnly
                className="block flex-1 rounded-md border-gray-300 bg-gray-50 shadow-sm text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
