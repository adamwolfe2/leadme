'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupFormData } from '@/lib/validation/schemas'
import {
  FormField,
  FormLabel,
  FormInput,
  FormCheckbox,
  FormError,
} from '@/components/ui/form'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  })

  const handleEmailSignup = async (data: SignupFormData) => {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Redirect to onboarding
    router.push('/onboarding')
    router.refresh()
  }

  const handleLinkedInSignup = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-xl font-medium text-zinc-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-[13px] text-zinc-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-zinc-900 hover:text-zinc-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Error Message */}
        <FormError message={error || undefined} />

        {/* Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleEmailSignup)}>
          <div className="space-y-3">
            <FormField error={errors.full_name}>
              <label htmlFor="full_name" className="sr-only">
                Full name
              </label>
              <FormInput
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="Full name"
                disabled={loading}
                error={errors.full_name}
                {...register('full_name')}
              />
            </FormField>

            <FormField error={errors.email}>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <FormInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                disabled={loading}
                error={errors.email}
                {...register('email')}
              />
            </FormField>

            <FormField error={errors.password}>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <FormInput
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Password (min. 8 characters)"
                disabled={loading}
                error={errors.password}
                {...register('password')}
              />
            </FormField>

            <FormField error={errors.confirm_password}>
              <label htmlFor="confirm_password" className="sr-only">
                Confirm password
              </label>
              <FormInput
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm password"
                disabled={loading}
                error={errors.confirm_password}
                {...register('confirm_password')}
              />
            </FormField>
          </div>

          <FormField error={errors.terms}>
            <div className="flex items-start">
              <FormCheckbox
                id="terms"
                error={errors.terms}
                {...register('terms')}
              />
              <label htmlFor="terms" className="ml-2 block text-[13px] text-zinc-700">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="font-medium text-zinc-900 hover:text-zinc-700"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-zinc-900 hover:text-zinc-700"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
          </FormField>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-4 w-full text-[13px] font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-[13px]">
            <span className="bg-white px-2 text-zinc-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div>
          <button
            type="button"
            onClick={handleLinkedInSignup}
            disabled={loading}
            className="h-9 px-4 w-full text-[13px] font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all duration-150 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </button>
        </div>
      </div>
    </div>
  )
}
