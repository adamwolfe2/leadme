# Form Validation with Zod & React Hook Form

Comprehensive form validation system for OpenInfo using Zod schemas and react-hook-form.

## Overview

This validation system provides:
- Type-safe form validation with Zod
- Reusable form components with consistent styling
- Inline error display
- Field-level validation (onBlur, onChange, onSubmit)
- Professional zinc/emerald/red color scheme

## Quick Start

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validation/schemas'
import { FormField, FormLabel, FormInput, FormError } from '@/components/ui/form'

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur
  })

  const onSubmit = (data: LoginFormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField error={errors.email}>
        <FormLabel htmlFor="email" required>
          Email
        </FormLabel>
        <FormInput
          id="email"
          type="email"
          error={errors.email}
          {...register('email')}
        />
      </FormField>

      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  )
}
```

## Available Schemas

### Authentication
- `loginSchema` - Email, password, remember me
- `signupSchema` - Full name, email, password, confirm password, terms
- `forgotPasswordSchema` - Email
- `resetPasswordSchema` - Password, confirm password

### Query Wizard (5 Steps)
- `topicSearchSchema` - Topic selection
- `locationFilterSchema` - Country, state, city
- `companySizeFilterSchema` - Company size ranges
- `industryFilterSchema` - Industry, technologies, revenue
- `createQuerySchema` - Complete query with all filters

### People Search
- `peopleSearchSchema` - Domain, company, job title, seniority, etc.

### Settings
- `profileSettingsSchema` - Profile information
- `passwordUpdateSchema` - Password change
- `notificationSettingsSchema` - Notification preferences
- `billingSettingsSchema` - Billing information

### Integrations
- `slackIntegrationSchema` - Slack webhook setup
- `webhookIntegrationSchema` - Custom webhook
- `zapierIntegrationSchema` - Zapier integration

### Marketplace
- `buyerProfileSchema` - Buyer profile setup
- `leadPurchaseSchema` - Lead purchase
- `leadExportSchema` - Export configuration

## Form Components

### FormField
Wrapper component for consistent spacing and error display.

```tsx
<FormField error={errors.fieldName}>
  <FormLabel htmlFor="field">Field Name</FormLabel>
  <FormInput {...register('fieldName')} />
</FormField>
```

### FormLabel
Label with required/optional indicators and hint text.

```tsx
<FormLabel
  htmlFor="email"
  required
  hint="We'll never share your email"
>
  Email Address
</FormLabel>
```

### FormInput
Text input with validation styling.

```tsx
<FormInput
  id="email"
  type="email"
  placeholder="john@example.com"
  disabled={loading}
  error={errors.email}
  {...register('email')}
/>
```

### FormSelect
Dropdown select with validation styling.

```tsx
<FormSelect
  id="country"
  error={errors.country}
  {...register('country')}
>
  <option value="">Select...</option>
  <option value="us">United States</option>
</FormSelect>
```

### FormTextarea
Textarea with validation styling.

```tsx
<FormTextarea
  id="bio"
  rows={4}
  placeholder="Tell us about yourself"
  error={errors.bio}
  {...register('bio')}
/>
```

### FormCheckbox
Checkbox with label and validation.

```tsx
<FormCheckbox
  id="terms"
  label="I agree to the terms"
  error={errors.terms}
  {...register('terms')}
/>
```

### FormError
Display error messages.

```tsx
<FormError message={error || undefined} />
```

### FormSuccess
Display success messages.

```tsx
<FormSuccess message="Profile updated successfully!" />
```

## Validation Modes

### onBlur (Recommended)
Validates when user leaves a field. Good balance between UX and feedback.

```tsx
useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur',
})
```

### onChange
Validates as user types. Provides immediate feedback but can be distracting.

```tsx
useForm({
  resolver: zodResolver(schema),
  mode: 'onChange',
})
```

### onSubmit
Only validates on form submission. Less intrusive but delayed feedback.

```tsx
useForm({
  resolver: zodResolver(schema),
  mode: 'onSubmit',
})
```

## Creating Custom Schemas

```tsx
import { z } from 'zod'

export const customSchema = z.object({
  // Required string
  name: z.string().min(2, 'Name must be at least 2 characters'),

  // Email
  email: z.string().email('Please enter a valid email'),

  // Optional string
  bio: z.string().optional(),

  // Number with validation
  age: z.number().min(18, 'Must be at least 18'),

  // Enum
  role: z.enum(['admin', 'user', 'guest']),

  // Array
  tags: z.array(z.string()).min(1, 'At least one tag required'),

  // Boolean
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),

  // Nested object
  address: z.object({
    street: z.string(),
    city: z.string(),
  }).optional(),

  // Custom validation
  password: z.string()
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter'),
})

// Refinement for cross-field validation
export const passwordSchema = z.object({
  password: z.string().min(8),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

export type CustomFormData = z.infer<typeof customSchema>
```

## Advanced Features

### Conditional Validation

```tsx
const schema = z.object({
  save_search: z.boolean(),
  search_name: z.string().optional(),
}).refine((data) => {
  if (data.save_search && !data.search_name) {
    return false
  }
  return true
}, {
  message: 'Search name is required when saving',
  path: ['search_name'],
})
```

### Range Validation

```tsx
const schema = z.object({
  min_price: z.number(),
  max_price: z.number(),
}).refine((data) => data.min_price <= data.max_price, {
  message: 'Min must be less than max',
  path: ['min_price'],
})
```

### Dynamic Field Values

```tsx
const { register, watch, setValue } = useForm()

// Watch field changes
const saveSearch = watch('save_search')

// Update field programmatically
setValue('search_name', 'Default Name', { shouldValidate: true })
```

### Async Validation

```tsx
const schema = z.object({
  username: z.string()
    .min(3)
    .refine(async (username) => {
      const response = await fetch(`/api/check-username?username=${username}`)
      const { available } = await response.json()
      return available
    }, {
      message: 'Username is already taken',
    }),
})
```

## Best Practices

### 1. Use Validation Modes Wisely
- `onBlur` for most forms (good UX)
- `onChange` for real-time feedback (search, username availability)
- `onSubmit` for simple forms

### 2. Provide Helpful Error Messages
```tsx
// ❌ Bad
z.string().min(8)

// ✅ Good
z.string().min(8, 'Password must be at least 8 characters')
```

### 3. Use Hints for Additional Context
```tsx
<FormLabel
  htmlFor="password"
  required
  hint="Use at least 8 characters with uppercase, lowercase, and numbers"
>
  Password
</FormLabel>
```

### 4. Disable Submit While Invalid
```tsx
<button
  type="submit"
  disabled={loading || !isValid}
>
  Submit
</button>
```

### 5. Clear Errors on Success
```tsx
const onSuccess = () => {
  setError('')
  setSuccess('Updated successfully!')
  reset() // Clear form
}
```

### 6. Show Loading States
```tsx
<FormInput
  disabled={loading}
  {...register('email')}
/>

<button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>
```

## Styling

All form components use the professional zinc/emerald/red palette:

- **Border**: zinc-300 (default), zinc-500 (focus), red-600 (error)
- **Text**: zinc-900 (input), zinc-700 (label), zinc-500 (hint), red-600 (error)
- **Background**: white (default), zinc-50 (disabled)
- **Success**: emerald-600
- **Focus ring**: zinc-200 (default), red-200 (error)

## Example: Complete Form

See `/src/components/examples/validated-form-example.tsx` for a comprehensive example demonstrating all features.

## Migration Guide

### From Manual Validation

Before:
```tsx
const [email, setEmail] = useState('')
const [error, setError] = useState('')

const handleSubmit = (e) => {
  e.preventDefault()
  if (!email.includes('@')) {
    setError('Invalid email')
    return
  }
  // submit...
}

<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
{error && <p>{error}</p>}
```

After:
```tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
})

const onSubmit = (data) => {
  // data is already validated!
}

<FormField error={errors.email}>
  <FormInput {...register('email')} />
</FormField>
```

## Troubleshooting

### Validation Not Triggering
- Check `mode` in useForm config
- Ensure `resolver` is set
- Verify schema is correct

### TypeScript Errors
- Import type from schema: `type FormData = z.infer<typeof schema>`
- Ensure all fields in defaultValues match schema

### Errors Not Clearing
- Use `reset()` after success
- Clear error state manually
- Check error state management

## Resources

- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Form Components](/src/components/ui/form.tsx)
- [Validation Schemas](/src/lib/validation/schemas.ts)
