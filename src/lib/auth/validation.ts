// Authentication Form Validation Schemas

import { z } from 'zod'

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')

/**
 * Password validation schema
 * Requirements:
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/**
 * Simple password schema (just length requirement)
 * Use this for less strict validation
 */
export const simplePasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

/**
 * Signup form schema
 */
export const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: emailSchema,
  password: simplePasswordSchema,
})

/**
 * Forgot password form schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

/**
 * Reset password form schema
 */
export const resetPasswordSchema = z
  .object({
    password: simplePasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * Workspace creation schema
 */
export const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen',
    }),
  industry: z.string().optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type WorkspaceInput = z.infer<typeof workspaceSchema>
