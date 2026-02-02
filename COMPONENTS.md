# UI Component Library

Comprehensive guide to Cursive's reusable UI components.

## Overview

This library provides professionally designed, accessible, and reusable components that maintain design consistency across the platform.

## Design Principles

- **Consistent**: All components follow the same design language (zinc/emerald/red palette)
- **Accessible**: ARIA labels, keyboard navigation, semantic HTML
- **Responsive**: Mobile-first design, works on all screen sizes
- **Composable**: Components can be combined to create complex UIs
- **Type-safe**: Full TypeScript support with strict typing

## Color Palette

```
Primary: zinc-900     (#18181b)
Success: emerald-600  (#059669)
Warning: amber-600    (#d97706)
Error: red-600        (#dc2626)
Info: blue-600        (#2563eb)
```

## Components

### EmptyState

Displays when no data is available, with optional call-to-action.

**Usage:**
```tsx
import { EmptyState } from '@/components/ui/empty-state'
import { Database } from 'lucide-react'

<EmptyState
  icon={Database}
  title="No leads found"
  description="You haven't generated any leads yet. Create a query to get started."
  action={{
    label: 'Create Query',
    href: '/queries/new'
  }}
/>
```

**Props:**
- `icon` (optional): Lucide icon component
- `title`: Main heading text
- `description`: Supporting text
- `action` (optional): CTA button with `label` and either `href` or `onClick`
- `children` (optional): Custom content

**Examples:**
```tsx
// With link action
<EmptyState
  icon={Search}
  title="No results"
  description="Try adjusting your filters"
  action={{ label: 'Reset Filters', href: '/search' }}
/>

// With click action
<EmptyState
  icon={FileText}
  title="No exports"
  description="Export your leads to CSV"
  action={{ label: 'Export Now', onClick: () => handleExport() }}
/>

// Without action
<EmptyState
  icon={Clock}
  title="Processing"
  description="Your data is being prepared..."
/>
```

---

### StatCard

Displays a metric with optional trend indicator and icon.

**Usage:**
```tsx
import { StatCard } from '@/components/ui/stat-card'
import { Users } from 'lucide-react'

<StatCard
  label="Total Leads"
  value="1,234"
  icon={Users}
  trend={{
    value: 12.5,
    direction: 'up',
    label: 'from last month'
  }}
  subtitle="456 this month"
/>
```

**Props:**
- `label`: Metric label
- `value`: Metric value (string or number)
- `icon` (optional): Lucide icon
- `trend` (optional): Object with `value`, `direction`, and optional `label`
- `subtitle` (optional): Additional context
- `variant` (optional): 'default' | 'success' | 'warning' | 'error'
- `className` (optional): Additional CSS classes

**Examples:**
```tsx
// Success variant with trend
<StatCard
  label="Revenue"
  value="$45,231"
  variant="success"
  icon={DollarSign}
  trend={{ value: 20, direction: 'up', label: 'vs last quarter' }}
/>

// Warning variant
<StatCard
  label="Credits Remaining"
  value="15"
  variant="warning"
  subtitle="50% used today"
/>

// Simple stat
<StatCard
  label="Active Queries"
  value={5}
/>
```

---

### ConfirmDialog

Modal for confirming destructive actions.

**Usage:**
```tsx
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/confirm-dialog'

// With hook
function MyComponent() {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  const handleDelete = async () => {
    await confirm({
      title: 'Delete Lead?',
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        await deleteLead(id)
      }
    })
  }

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <ConfirmDialogComponent />
    </>
  )
}

// Controlled
function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title="Archive Query?"
      description="Archived queries can be restored later."
      confirmLabel="Archive"
      variant="default"
      onConfirm={async () => {
        await archiveQuery(id)
      }}
    />
  )
}
```

**Props:**
- `open`: Boolean state
- `onOpenChange`: State setter
- `title`: Dialog title
- `description`: Explanation text
- `confirmLabel` (optional): Confirm button text (default: 'Confirm')
- `cancelLabel` (optional): Cancel button text (default: 'Cancel')
- `variant` (optional): 'default' | 'destructive'
- `onConfirm`: Async function to execute
- `loading` (optional): External loading state

---

### PageHeader

Consistent header for all pages with title, description, breadcrumbs, and actions.

**Usage:**
```tsx
import { PageHeader } from '@/components/ui/page-header'

<PageHeader
  title="Lead Management"
  description="View and manage all your generated leads"
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Data', href: '/data' },
    { label: 'Leads' }
  ]}
  actions={
    <>
      <button>Export</button>
      <button>Create Lead</button>
    </>
  }
/>
```

**Props:**
- `title`: Page title
- `description` (optional): Page description
- `backButton` (optional): Object with `href` and optional `label`
- `actions` (optional): React node for action buttons
- `breadcrumbs` (optional): Array of breadcrumb items
- `className` (optional): Additional CSS classes

**Examples:**
```tsx
// With back button
<PageHeader
  title="Edit Query"
  backButton={{ href: '/queries', label: 'Back to Queries' }}
/>

// With actions
<PageHeader
  title="Settings"
  description="Manage your workspace settings"
  actions={
    <button className="btn-primary">Save Changes</button>
  }
/>

// Minimal
<PageHeader title="Dashboard" />
```

---

### Section

Consistent content section with header and body.

**Usage:**
```tsx
import { Section } from '@/components/ui/section'
import { Settings } from 'lucide-react'

<Section
  title="Profile Settings"
  description="Update your personal information"
  icon={Settings}
  actions={<button>Save</button>}
  variant="card"
>
  {/* Section content */}
</Section>
```

**Props:**
- `title` (optional): Section title
- `description` (optional): Section description
- `icon` (optional): Lucide icon
- `actions` (optional): Action buttons
- `children`: Section content
- `className` (optional): Container classes
- `bodyClassName` (optional): Body classes
- `variant` (optional): 'default' | 'bordered' | 'card'

**Examples:**
```tsx
// Card variant
<Section variant="card" title="Recent Activity">
  <ActivityList />
</Section>

// Bordered variant
<Section variant="bordered" title="Filters">
  <FilterForm />
</Section>

// Without header
<Section>
  <Content />
</Section>
```

---

### StatusBadge

Displays status with appropriate colors.

**Usage:**
```tsx
import { StatusBadge, SmartStatusBadge } from '@/components/ui/status-badge'
import { Check } from 'lucide-react'

// Manual variant
<StatusBadge
  status="Active"
  variant="success"
  dot
/>

// Auto-inferred variant
<SmartStatusBadge
  status="Pending Review"
  dot
/>

// With icon
<StatusBadge
  status="Completed"
  variant="success"
  icon={Check}
/>
```

**Props:**
- `status`: Status text
- `variant` (optional): 'default' | 'success' | 'warning' | 'error' | 'info' | 'pending'
- `icon` (optional): Lucide icon
- `size` (optional): 'sm' | 'md' (default: 'md')
- `dot` (optional): Show colored dot

**Examples:**
```tsx
// Different variants
<StatusBadge status="Delivered" variant="success" dot />
<StatusBadge status="Processing" variant="info" dot />
<StatusBadge status="Failed" variant="error" dot />
<StatusBadge status="Draft" variant="pending" dot />

// Smart badge (auto-detects variant)
<SmartStatusBadge status="Active" />      // → success
<SmartStatusBadge status="Pending" />     // → pending
<SmartStatusBadge status="Failed" />      // → error
<SmartStatusBadge status="Attention" />   // → warning
```

---

### LoadingButton

Button with loading state and spinner.

**Usage:**
```tsx
import { LoadingButton } from '@/components/ui/loading-button'

function MyComponent() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    await submitForm()
    setLoading(false)
  }

  return (
    <LoadingButton
      loading={loading}
      loadingText="Saving..."
      onClick={handleSubmit}
      variant="primary"
    >
      Save Changes
    </LoadingButton>
  )
}
```

**Props:**
- `loading` (optional): Loading state
- `loadingText` (optional): Text to show while loading
- `variant` (optional): 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost'
- `size` (optional): 'sm' | 'md' | 'lg'
- `fullWidth` (optional): Take full width
- All standard button props

**Examples:**
```tsx
// Primary button
<LoadingButton loading={loading} variant="primary">
  Create Query
</LoadingButton>

// Destructive action
<LoadingButton
  loading={deleting}
  loadingText="Deleting..."
  variant="destructive"
  onClick={handleDelete}
>
  Delete
</LoadingButton>

// Full width
<LoadingButton loading={loading} fullWidth>
  Submit
</LoadingButton>
```

---

### Alert

Display informational, success, warning, or error alerts.

**Usage:**
```tsx
import { Alert } from '@/components/ui/alert'

<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

<Alert variant="error" onClose={() => setAlert(null)}>
  Failed to process payment. Please try again.
</Alert>
```

**Props:**
- `variant` (optional): 'info' | 'success' | 'warning' | 'error' (default: 'info')
- `title` (optional): Alert title
- `children`: Alert content
- `onClose` (optional): Close handler (shows X button)
- `className` (optional): Additional classes

**Examples:**
```tsx
// Info alert
<Alert variant="info" title="New Feature">
  Check out our new export functionality!
</Alert>

// Success with close button
<Alert variant="success" onClose={() => dismiss()}>
  Lead generated successfully
</Alert>

// Warning
<Alert variant="warning" title="Low Credits">
  You have only 3 credits remaining today.
</Alert>

// Error
<Alert variant="error" title="Error">
  Failed to fetch data. Please try again.
</Alert>
```

---

## Usage Patterns

### Dashboard Layout

```tsx
<div className="space-y-6">
  <PageHeader
    title="Dashboard"
    description="Overview of your lead generation performance"
  />

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard
      label="Total Leads"
      value={1234}
      icon={Users}
      trend={{ value: 12, direction: 'up' }}
    />
    <StatCard
      label="Active Queries"
      value={5}
      icon={Search}
    />
    <StatCard
      label="Credits Used"
      value="450 / 1000"
      icon={Zap}
    />
  </div>

  <Section title="Recent Activity" variant="card">
    <ActivityList />
  </Section>
</div>
```

### Empty State with Action

```tsx
{leads.length === 0 ? (
  <EmptyState
    icon={Database}
    title="No leads yet"
    description="Create your first query to start generating leads"
    action={{
      label: 'Create Query',
      href: '/queries/new'
    }}
  />
) : (
  <LeadsTable data={leads} />
)}
```

### Form with Loading Button

```tsx
<form onSubmit={handleSubmit}>
  <Section title="Query Details" variant="card">
    <FormFields />
  </Section>

  <div className="flex justify-end gap-2">
    <button type="button" className="btn-secondary">
      Cancel
    </button>
    <LoadingButton
      type="submit"
      loading={isSubmitting}
      loadingText="Creating..."
      variant="primary"
    >
      Create Query
    </LoadingButton>
  </div>
</form>
```

### Confirmation Flow

```tsx
function DeleteButton({ leadId }: { leadId: string }) {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Lead?',
      description: 'This action cannot be undone. The lead will be permanently removed.',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        await deleteLead(leadId)
      }
    })

    if (confirmed) {
      toast.success('Lead deleted')
    }
  }

  return (
    <>
      <button onClick={handleDelete} className="btn-destructive">
        Delete
      </button>
      <ConfirmDialogComponent />
    </>
  )
}
```

## Best Practices

1. **Consistent Spacing**: Use Tailwind's spacing scale (4, 6, 8, 12, 16, 24)
2. **Color Usage**: Stick to the defined palette (zinc/emerald/red)
3. **Typography**: Use defined font sizes (text-[12px], text-[13px], text-base)
4. **Accessibility**: Always include ARIA labels for icon-only buttons
5. **Loading States**: Show loading indicators for async operations
6. **Error Handling**: Display clear error messages with Alert component
7. **Empty States**: Always show EmptyState instead of blank pages
8. **Confirmation**: Use ConfirmDialog for destructive actions
9. **Feedback**: Provide immediate feedback for user actions (toasts, alerts)
10. **Responsive**: Test on mobile devices, use responsive classes

## Component Checklist

When creating new components:

- [ ] TypeScript types defined
- [ ] Variants implemented (at least 2)
- [ ] Accessibility attributes added (ARIA)
- [ ] Keyboard navigation supported
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Responsive design tested
- [ ] Documentation added to this file
- [ ] Examples provided
- [ ] Dark mode support (if applicable)

---

**Last Updated**: 2026-01-22
