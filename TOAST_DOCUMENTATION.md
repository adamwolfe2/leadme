# Toast Notification System Documentation

## Overview

A professional, fully-featured toast notification system for Cursive that provides beautiful, accessible, and functional notifications throughout the application.

## Features

- **4 Toast Types**: Success, Error, Warning, and Info
- **Auto-Dismiss**: Configurable auto-dismiss with progress bar (default: 5s)
- **Pause on Hover**: Hover over toasts to pause the countdown and read messages
- **Manual Dismiss**: Close button on every toast
- **Toast Queue**: Stack up to 5 toasts, older ones automatically hidden
- **Smooth Animations**: Slide in from top-right, slide out on dismiss
- **Action Buttons**: Optional action buttons (e.g., "Undo", "Extend Session")
- **Persistent Toasts**: Set duration to 0 for toasts that don't auto-dismiss
- **Accessibility**: ARIA labels and semantic HTML

## Installation

The toast system is already integrated into the app through the `ToastProvider` in `/src/components/providers.tsx`.

## Basic Usage

### Import the Hook

```tsx
import { useToast } from '@/lib/contexts/toast-context'
```

### Simple Toast Examples

```tsx
function MyComponent() {
  const toast = useToast()

  return (
    <>
      <button onClick={() => toast.success('Changes saved!')}>
        Show Success
      </button>

      <button onClick={() => toast.error('Failed to save')}>
        Show Error
      </button>

      <button onClick={() => toast.warning('Are you sure?')}>
        Show Warning
      </button>

      <button onClick={() => toast.info('Update available')}>
        Show Info
      </button>
    </>
  )
}
```

## Advanced Usage

### With Titles

```tsx
toast.success('Your workspace has been updated successfully.', {
  title: 'Workspace Updated'
})

toast.error('The server is currently unavailable.', {
  title: 'Connection Failed'
})
```

### With Action Buttons

```tsx
toast.success('Lead deleted successfully.', {
  action: {
    label: 'Undo',
    onClick: () => {
      // Restore the lead
      toast.info('Lead restored!')
    }
  }
})

toast.warning('Your session will expire in 5 minutes.', {
  title: 'Session Expiring',
  action: {
    label: 'Extend Session',
    onClick: () => {
      // Extend session logic
      toast.success('Session extended!')
    }
  }
})
```

### Custom Duration

```tsx
// 2 second toast
toast.info('Quick message', { duration: 2000 })

// 10 second toast
toast.info('Longer message', { duration: 10000 })

// Persistent toast (doesn't auto-dismiss)
toast.info('Important: Read this carefully', { duration: 0 })
```

### Custom API

```tsx
toast.toast({
  type: 'success',
  title: 'Custom Toast',
  message: 'Using the custom toast API',
  duration: 3000,
  action: {
    label: 'Action',
    onClick: () => console.log('Action clicked')
  }
})
```

## Real-World Integration Examples

### Form Submission

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    await fetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify(formData)
    })

    toast.success('Your profile has been updated successfully.')
  } catch (error) {
    toast.error('Failed to update profile. Please try again.', {
      title: 'Update Failed'
    })
  } finally {
    setIsSubmitting(false)
  }
}
```

### API Call with Error Handling

```tsx
const fetchLeads = async () => {
  try {
    const response = await fetch('/api/leads')

    if (!response.ok) {
      throw new Error('Failed to fetch')
    }

    const data = await response.json()
    toast.success(`Loaded ${data.length} leads successfully.`)
  } catch (error) {
    toast.error('Unable to load leads. Please check your connection.', {
      title: 'Load Failed'
    })
  }
}
```

### Delete with Undo

```tsx
const handleDelete = async (leadId: string) => {
  // Store the lead for potential undo
  const lead = leads.find(l => l.id === leadId)

  // Optimistic update
  setLeads(leads.filter(l => l.id !== leadId))

  toast.success('Lead deleted successfully.', {
    action: {
      label: 'Undo',
      onClick: async () => {
        // Restore the lead
        setLeads([...leads, lead])
        await fetch(`/api/leads/${leadId}/restore`, { method: 'POST' })
        toast.info('Lead restored.')
      }
    }
  })

  // Actually delete from server
  await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
}
```

### Copy to Clipboard

```tsx
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!', { duration: 2000 })
  } catch (error) {
    toast.error('Failed to copy to clipboard.')
  }
}
```

### Bulk Operations

```tsx
const bulkDelete = async (selectedIds: string[]) => {
  try {
    await fetch('/api/leads/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: selectedIds })
    })

    toast.success(`Successfully deleted ${selectedIds.length} leads.`, {
      title: 'Bulk Delete Complete',
      action: {
        label: 'Undo',
        onClick: async () => {
          // Restore leads
          await fetch('/api/leads/bulk-restore', {
            method: 'POST',
            body: JSON.stringify({ ids: selectedIds })
          })
          toast.info(`Restored ${selectedIds.length} leads.`)
        }
      }
    })
  } catch (error) {
    toast.error('Failed to delete leads.', {
      title: 'Bulk Delete Failed'
    })
  }
}
```

### Session Warning

```tsx
useEffect(() => {
  // Show warning 5 minutes before session expires
  const timeoutId = setTimeout(() => {
    toast.warning('Your session will expire in 5 minutes.', {
      title: 'Session Expiring Soon',
      duration: 10000,
      action: {
        label: 'Extend Session',
        onClick: async () => {
          await fetch('/api/auth/extend-session')
          toast.success('Your session has been extended.')
        }
      }
    })
  }, SESSION_DURATION - 5 * 60 * 1000)

  return () => clearTimeout(timeoutId)
}, [])
```

### Validation Errors

```tsx
const validateEmail = (email: string) => {
  if (!email.includes('@')) {
    toast.warning('Please enter a valid email address.', {
      title: 'Invalid Email'
    })
    return false
  }
  return true
}
```

## API Reference

### `useToast()` Hook

Returns an object with the following methods:

#### `success(message, options?)`
- **message**: `string` - The toast message
- **options**: `object` (optional)
  - `title`: `string` - Optional title
  - `duration`: `number` - Duration in ms (default: 5000)
  - `action`: `{ label: string, onClick: () => void }` - Optional action button

#### `error(message, options?)`
Same parameters as `success()`

#### `warning(message, options?)`
Same parameters as `success()`

#### `info(message, options?)`
Same parameters as `success()`

#### `toast(options)`
Custom API with full control:
- **options**: `object`
  - `type`: `'success' | 'error' | 'warning' | 'info'`
  - `message`: `string`
  - `title`: `string` (optional)
  - `duration`: `number` (optional, default: 5000)
  - `action`: `{ label: string, onClick: () => void }` (optional)

## Design System

### Toast Types and Colors

#### Success
- **Background**: `bg-emerald-50`
- **Border**: `border-emerald-200`
- **Text**: `text-emerald-900`
- **Icon**: `text-emerald-600`
- **Icon**: CheckCircle (lucide-react)

#### Error
- **Background**: `bg-red-50`
- **Border**: `border-red-200`
- **Text**: `text-red-900`
- **Icon**: `text-red-600`
- **Icon**: XCircle (lucide-react)

#### Warning
- **Background**: `bg-amber-50`
- **Border**: `border-amber-200`
- **Text**: `text-amber-900`
- **Icon**: `text-amber-600`
- **Icon**: AlertTriangle (lucide-react)

#### Info
- **Background**: `bg-zinc-50`
- **Border**: `border-zinc-200`
- **Text**: `text-zinc-900`
- **Icon**: `text-zinc-600`
- **Icon**: Info (lucide-react)

### Typography
- All text uses `text-[13px]` for consistency with Cursive design system
- Titles use `font-medium`
- Messages use normal weight with `leading-relaxed`

### Animations
- **Entry**: Slide in from right (`translate-x-0` from `translate-x-[400px]`)
- **Exit**: Slide out to right (`translate-x-[400px]`)
- **Duration**: 300ms
- **Easing**: `ease-out`
- **Opacity**: Fade in/out combined with slide

### Layout
- **Width**: Fixed at 380px
- **Position**: Fixed at top-right (4 units from top and right)
- **Stack**: Vertical stack with 2 units gap
- **Max Visible**: 5 toasts
- **Z-Index**: 9999 (above all other content)

## Testing

### Demo Page

Visit `/toast-demo` to see all toast types and features in action.

### Integration Examples

See `/src/components/toast-integration-example.tsx` for comprehensive real-world examples.

## Accessibility

- Proper ARIA labels (`role="alert"`, `aria-live="polite"`)
- Keyboard accessible close button
- Semantic HTML structure
- Sufficient color contrast
- Focus management

## Best Practices

1. **Use Appropriate Types**
   - Success: Successful operations, confirmations
   - Error: Failed operations, critical issues
   - Warning: Important notices, destructive actions
   - Info: General information, updates

2. **Keep Messages Concise**
   - Aim for 1-2 sentences
   - Front-load important information
   - Use titles for context

3. **Use Actions Wisely**
   - Undo for destructive actions
   - Quick fixes for errors
   - Important follow-up actions

4. **Set Appropriate Durations**
   - Quick confirmations: 2-3 seconds
   - Standard messages: 5 seconds (default)
   - Important warnings: 8-10 seconds
   - Critical actions: Persistent (duration: 0)

5. **Don't Overuse**
   - Not every action needs a toast
   - Batch similar notifications
   - Use inline feedback when appropriate

6. **Provide Context**
   - Include what happened
   - Why it matters
   - What the user can do

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── toast.tsx                    # Toast component
│   │   └── toast-container.tsx          # Container component
│   ├── providers.tsx                    # Integrates ToastProvider
│   └── toast-integration-example.tsx    # Integration examples
├── lib/
│   └── contexts/
│       ├── toast-context.tsx            # Context and provider
│       └── index.ts                     # Context exports
└── app/
    └── (dashboard)/
        └── toast-demo/
            └── page.tsx                 # Demo page
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Full support

## Performance

- Uses `requestAnimationFrame` for smooth progress bar
- Efficient re-renders with React context
- Automatic cleanup of dismissed toasts
- Max 5 visible toasts prevents memory issues

## Migration Guide

If you have existing notification code:

### Before
```tsx
alert('Changes saved!')
console.log('Error occurred')
```

### After
```tsx
const toast = useToast()
toast.success('Changes saved!')
toast.error('Error occurred')
```

## Support

For issues or questions, see the integration examples or demo page.

---

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Author**: Cursive Platform Team
