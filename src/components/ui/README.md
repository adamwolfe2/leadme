# UI Components

## Toast Notification System

Professional toast notifications for user feedback.

### Quick Start

```tsx
import { useToast } from '@/lib/hooks/use-toast'

function MyComponent() {
  const toast = useToast()

  return (
    <button onClick={() => toast.success('Saved!')}>
      Save
    </button>
  )
}
```

### All Methods

```tsx
toast.success('Success message')
toast.error('Error message')
toast.warning('Warning message')
toast.info('Info message')
```

### With Options

```tsx
toast.success('Deleted successfully', {
  action: {
    label: 'Undo',
    onClick: () => restore()
  }
})

toast.error('Failed to connect', {
  title: 'Connection Error',
  duration: 10000
})
```

### Demo

Visit `/toast-demo` to see all features in action.

### Documentation

- **Quick Reference**: `/TOAST_QUICK_REFERENCE.md`
- **Full Documentation**: `/TOAST_DOCUMENTATION.md`
- **Examples**: `/src/components/toast-integration-example.tsx`

## Form Components

See individual files for documentation:
- `form-input.tsx`
- `form-select.tsx`
- `form-textarea.tsx`
- `form-checkbox.tsx`
- `form-error.tsx`
- `form-success.tsx`
