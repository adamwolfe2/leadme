# Toast Notification Quick Reference

## Import

```tsx
import { useToast } from '@/lib/hooks/use-toast'
// or
import { useToast } from '@/lib/contexts/toast-context'
```

## Basic Usage

```tsx
const toast = useToast()

// Simple toasts
toast.success('Changes saved!')
toast.error('Failed to save')
toast.warning('Are you sure?')
toast.info('Update available')
```

## Common Patterns

### Form Success

```tsx
toast.success('Your profile has been updated successfully.')
```

### API Error

```tsx
toast.error('Unable to connect to the server. Please try again.', {
  title: 'Connection Error'
})
```

### Delete with Undo

```tsx
toast.success('Lead deleted successfully.', {
  action: {
    label: 'Undo',
    onClick: () => restoreLead()
  }
})
```

### Session Warning

```tsx
toast.warning('Your session will expire in 5 minutes.', {
  title: 'Session Expiring',
  action: {
    label: 'Extend Session',
    onClick: () => extendSession()
  }
})
```

### Copy to Clipboard

```tsx
await navigator.clipboard.writeText(text)
toast.success('Copied to clipboard!', { duration: 2000 })
```

### Persistent Toast

```tsx
toast.info('Please read this carefully.', { duration: 0 })
```

## Options

| Option     | Type                                   | Default | Description                |
|------------|----------------------------------------|---------|----------------------------|
| `title`    | `string`                               | -       | Optional title             |
| `duration` | `number`                               | 5000    | Duration in ms (0 = never) |
| `action`   | `{ label: string, onClick: () => void }` | -       | Optional action button     |

## Types

- **Success**: Confirmations, successful operations
- **Error**: Failed operations, critical issues
- **Warning**: Important notices, destructive actions
- **Info**: General information, updates

## Demo

Visit `/toast-demo` to see all features in action.

## Full Documentation

See `/TOAST_DOCUMENTATION.md` for complete documentation.
