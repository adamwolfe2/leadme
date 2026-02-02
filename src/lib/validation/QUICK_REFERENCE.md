# Form Validation Quick Reference

Quick copy-paste examples for common form validation patterns in Cursive.

## Basic Setup

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { yourSchema, type YourFormData } from '@/lib/validation/schemas'
import {
  FormField,
  FormLabel,
  FormInput,
  FormError,
  FormSuccess,
} from '@/components/ui/form'

const {
  register,
  handleSubmit,
  formState: { errors, isValid },
  reset,
} = useForm<YourFormData>({
  resolver: zodResolver(yourSchema),
  mode: 'onBlur', // or 'onChange' or 'onSubmit'
})

const onSubmit = (data: YourFormData) => {
  console.log(data)
}
```

## Text Input (Required)

```tsx
<FormField error={errors.name}>
  <FormLabel htmlFor="name" required>
    Full Name
  </FormLabel>
  <FormInput
    id="name"
    type="text"
    placeholder="John Doe"
    disabled={loading}
    error={errors.name}
    {...register('name')}
  />
</FormField>
```

## Text Input (Optional)

```tsx
<FormField error={errors.bio}>
  <FormLabel htmlFor="bio" optional hint="Tell us about yourself">
    Bio
  </FormLabel>
  <FormInput
    id="bio"
    type="text"
    placeholder="I am..."
    error={errors.bio}
    {...register('bio')}
  />
</FormField>
```

## Email Input

```tsx
<FormField error={errors.email}>
  <FormLabel htmlFor="email" required>
    Email Address
  </FormLabel>
  <FormInput
    id="email"
    type="email"
    placeholder="john@example.com"
    disabled={loading}
    error={errors.email}
    {...register('email')}
  />
</FormField>
```

## Password Input

```tsx
<FormField error={errors.password}>
  <FormLabel
    htmlFor="password"
    required
    hint="Must be at least 8 characters"
  >
    Password
  </FormLabel>
  <FormInput
    id="password"
    type="password"
    disabled={loading}
    error={errors.password}
    {...register('password')}
  />
</FormField>
```

## Number Input

```tsx
<FormField error={errors.age}>
  <FormLabel htmlFor="age" optional>
    Age
  </FormLabel>
  <FormInput
    id="age"
    type="number"
    placeholder="25"
    error={errors.age}
    {...register('age', { valueAsNumber: true })}
  />
</FormField>
```

## Select Dropdown

```tsx
<FormField error={errors.country}>
  <FormLabel htmlFor="country" required>
    Country
  </FormLabel>
  <FormSelect
    id="country"
    disabled={loading}
    error={errors.country}
    {...register('country')}
  >
    <option value="">Select a country</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
  </FormSelect>
</FormField>
```

## Textarea

```tsx
<FormField error={errors.message}>
  <FormLabel htmlFor="message" required>
    Message
  </FormLabel>
  <FormTextarea
    id="message"
    rows={4}
    placeholder="Your message..."
    disabled={loading}
    error={errors.message}
    {...register('message')}
  />
</FormField>
```

## Checkbox (Required)

```tsx
<FormField error={errors.terms}>
  <FormCheckbox
    id="terms"
    label="I agree to the terms and conditions"
    error={errors.terms}
    {...register('terms')}
  />
</FormField>
```

## Checkbox (Optional)

```tsx
<FormField error={errors.newsletter}>
  <FormCheckbox
    id="newsletter"
    label="Subscribe to newsletter"
    {...register('newsletter')}
  />
</FormField>
```

## Error/Success Messages

```tsx
<FormError message={error || undefined} />
<FormSuccess message={success || undefined} />
```

## Submit Button

```tsx
<button
  type="submit"
  disabled={loading || !isValid}
  className="h-9 px-4 text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? 'Submitting...' : 'Submit'}
</button>
```

## Reset Button

```tsx
<button
  type="button"
  onClick={() => reset()}
  disabled={loading}
  className="h-9 px-4 text-[13px] font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all duration-150"
>
  Clear
</button>
```

## Complete Form Template

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FormField,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormError,
  FormSuccess,
} from '@/components/ui/form'

const mySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  country: z.string().min(1, 'Please select a country'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
})

type MyFormData = z.infer<typeof mySchema>

export function MyForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: MyFormData) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setSuccess('Form submitted successfully!')
      reset()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-6">
          My Form
        </h2>

        <FormSuccess message={success || undefined} className="mb-6" />
        <FormError message={error || undefined} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <FormField error={errors.name}>
            <FormLabel htmlFor="name" required>
              Full Name
            </FormLabel>
            <FormInput
              id="name"
              type="text"
              placeholder="John Doe"
              disabled={loading}
              error={errors.name}
              {...register('name')}
            />
          </FormField>

          {/* Email */}
          <FormField error={errors.email}>
            <FormLabel htmlFor="email" required>
              Email Address
            </FormLabel>
            <FormInput
              id="email"
              type="email"
              placeholder="john@example.com"
              disabled={loading}
              error={errors.email}
              {...register('email')}
            />
          </FormField>

          {/* Country */}
          <FormField error={errors.country}>
            <FormLabel htmlFor="country" required>
              Country
            </FormLabel>
            <FormSelect
              id="country"
              disabled={loading}
              error={errors.country}
              {...register('country')}
            >
              <option value="">Select a country</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
            </FormSelect>
          </FormField>

          {/* Message */}
          <FormField error={errors.message}>
            <FormLabel htmlFor="message" required>
              Message
            </FormLabel>
            <FormTextarea
              id="message"
              rows={4}
              placeholder="Your message..."
              disabled={loading}
              error={errors.message}
              {...register('message')}
            />
          </FormField>

          {/* Terms */}
          <FormField error={errors.terms}>
            <FormCheckbox
              id="terms"
              label="I agree to the terms and conditions"
              error={errors.terms}
              {...register('terms')}
            />
          </FormField>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 h-9 px-4 text-[13px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              disabled={loading}
              className="h-9 px-4 text-[13px] font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all duration-150"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

## Common Schema Patterns

### Email
```tsx
email: z.string().email('Please enter a valid email address')
```

### Password (Basic)
```tsx
password: z.string().min(8, 'Password must be at least 8 characters')
```

### Password (Strong)
```tsx
password: z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Must contain uppercase, lowercase, and number'
  )
```

### Password Confirmation
```tsx
z.object({
  password: z.string().min(8),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})
```

### Required Checkbox
```tsx
terms: z.boolean().refine((val) => val === true, {
  message: 'You must agree to the terms',
})
```

### Optional Field
```tsx
bio: z.string().optional()
```

### Required Select
```tsx
country: z.string().min(1, 'Please make a selection')
```

### Number with Min/Max
```tsx
age: z.number().min(18, 'Must be at least 18').max(120, 'Invalid age')
```

### URL
```tsx
website: z.string().url('Please enter a valid URL')
```

### Array with Min Length
```tsx
tags: z.array(z.string()).min(1, 'At least one tag required')
```

### Conditional Validation
```tsx
z.object({
  save_search: z.boolean(),
  search_name: z.string().optional(),
}).refine((data) => {
  if (data.save_search && !data.search_name) return false
  return true
}, {
  message: 'Search name is required when saving',
  path: ['search_name'],
})
```

### Range Validation (Min <= Max)
```tsx
z.object({
  min_price: z.number(),
  max_price: z.number(),
}).refine((data) => data.min_price <= data.max_price, {
  message: 'Min must be less than max',
  path: ['min_price'],
})
```

## Validation Modes

```tsx
// Validate on blur (recommended)
mode: 'onBlur'

// Validate as user types
mode: 'onChange'

// Validate only on submit
mode: 'onSubmit'

// Multiple modes
mode: 'onBlur',
reValidateMode: 'onChange'
```

## Form State

```tsx
const {
  register,           // Register input
  handleSubmit,       // Handle form submission
  formState: {
    errors,          // Validation errors
    isValid,         // Is form valid?
    isDirty,         // Has form been modified?
    isSubmitting,    // Is form submitting?
  },
  reset,             // Reset form to defaults
  watch,             // Watch field value
  setValue,          // Set field value programmatically
  getValues,         // Get current form values
} = useForm()
```

## Dynamic Field Values

```tsx
// Watch a field
const saveSearch = watch('save_search')

// Set a field value
setValue('name', 'John Doe', { shouldValidate: true })

// Get all values
const values = getValues()
```

## Available Schemas

Import from: `@/lib/validation/schemas`

- `loginSchema`
- `signupSchema`
- `forgotPasswordSchema`
- `resetPasswordSchema`
- `peopleSearchSchema`
- `profileSettingsSchema`
- `passwordUpdateSchema`
- `notificationSettingsSchema`
- `billingSettingsSchema`
- `slackIntegrationSchema`
- `webhookIntegrationSchema`
- `buyerProfileSchema`
- `leadExportSchema`
- And more...

## Styling Classes

### Input States
- Default: `border-zinc-300`
- Focus: `border-zinc-500 ring-1 ring-zinc-200`
- Error: `border-red-600 ring-1 ring-red-200`
- Disabled: `bg-zinc-50 text-zinc-500`

### Text Colors
- Labels: `text-zinc-700`
- Hints: `text-zinc-500`
- Errors: `text-red-600`
- Success: `text-emerald-800`

### Sizing
- Input height: `h-9` (36px)
- Font size: `text-[13px]` (labels/inputs) or `text-[12px]` (hints)
- Padding: `px-3` (horizontal)

## Full Documentation

See `/src/lib/validation/README.md` for complete documentation.
