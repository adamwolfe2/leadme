# API Error Handler Guide

Quick reference for using the centralized error handler in API routes.

## Import

```typescript
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  success,
  created
} from '@/lib/utils/api-error-handler'
```

## Response Helpers

### Success Responses

```typescript
// 200 OK
return success({ users: [...] })
// Response: { success: true, data: { users: [...] } }

// 201 Created
return created({ id: '123', name: 'New Item' })
// Response: { success: true, data: { id: '123', name: 'New Item' } }
```

### Error Responses

```typescript
// 401 Unauthorized
return unauthorized()
return unauthorized('Custom message')
// Response: { error: 'Unauthorized' }

// 403 Forbidden
return forbidden()
return forbidden('Insufficient permissions')
// Response: { error: 'Forbidden' }

// 404 Not Found
return notFound()
return notFound('Resource not found')
// Response: { error: 'Not found' }

// 400 Bad Request
return badRequest('Invalid input')
return badRequest('Invalid input', { field: 'email', reason: 'invalid format' })
// Response: { error: 'Invalid input', details: {...} }
```

## Error Handling

### Basic Pattern

```typescript
try {
  // Your route logic
} catch (error) {
  return handleApiError(error)
}
```

### What handleApiError Does

1. **Zod Errors** → 400 with formatted field errors
2. **Custom API Errors** → Appropriate status code
3. **Generic Errors** → 500 with sanitized message

## Custom Error Classes

Use these for specific error scenarios:

```typescript
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  DatabaseError
} from '@/lib/utils/api-error-handler'
```

### Examples

```typescript
// Generic API error with custom status
throw new ApiError('Custom error', 418)

// Specific errors
throw new UnauthorizedError('Invalid token')
throw new ForbiddenError('Insufficient credits')
throw new NotFoundError('User not found')
throw new ValidationError('Invalid email format')
throw new DatabaseError('Connection failed')
```

## Complete Route Example

```typescript
import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth/helpers'
import { handleApiError, unauthorized, notFound, success } from '@/lib/utils/api-error-handler'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    // 2. Validate (Zod errors automatically formatted by handleApiError)
    const body = await request.json()
    const data = schema.parse(body)

    // 3. Business logic
    const repo = new Repository()
    const result = await repo.create({
      workspace_id: user.workspace_id,
      ...data
    })

    if (!result) return notFound('Could not create resource')

    // 4. Success
    return created(result)
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Best Practices

### ✅ DO

```typescript
// Use helper functions
if (!user) return unauthorized()

// Let handleApiError format Zod errors
const data = schema.parse(body) // Throws ZodError if invalid

// Use success helpers
return success(data)
```

### ❌ DON'T

```typescript
// Don't manually build error responses
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Don't manually format Zod errors
if (error instanceof z.ZodError) {
  return NextResponse.json({ error: error.errors }, { status: 400 })
}

// Don't manually build success responses
return NextResponse.json({ success: true, data: data })
```

## Error Response Formats

### Validation Error (Zod)
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    },
    {
      "field": "name",
      "message": "String must contain at least 2 character(s)"
    }
  ]
}
```

### Simple Error
```json
{
  "error": "Resource not found"
}
```

### Error with Details
```json
{
  "error": "Forbidden",
  "details": {
    "credits_remaining": 0,
    "plan": "free"
  }
}
```

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Item"
  }
}
```

## Common Patterns

### Check Auth
```typescript
const user = await getCurrentUser()
if (!user) return unauthorized()
```

### Check Resource Exists
```typescript
const item = await repo.findById(id, user.workspace_id)
if (!item) return notFound('Item not found')
```

### Check Permissions
```typescript
if (user.role !== 'admin') {
  return forbidden('Admin access required')
}
```

### Check Plan Limits
```typescript
if (count >= limit) {
  return forbidden(`Plan limit reached. Upgrade to increase limit.`)
}
```

### Check Credits
```typescript
const hasCredits = await checkCredits(user.id, 1)
if (!hasCredits) {
  return forbidden('Insufficient credits')
}
```

## Tips

1. **Always use try/catch** - Let handleApiError do the work
2. **Use helper functions** - More readable than manual responses
3. **Let Zod errors throw** - handleApiError formats them nicely
4. **Be specific with messages** - Help users understand what went wrong
5. **Use appropriate status codes** - Makes debugging easier

## Status Code Reference

| Code | Helper | Use Case |
|------|--------|----------|
| 200 | `success()` | Successful GET/PATCH/DELETE |
| 201 | `created()` | Successful POST |
| 400 | `badRequest()` | Invalid input |
| 401 | `unauthorized()` | Not authenticated |
| 403 | `forbidden()` | Authenticated but not allowed |
| 404 | `notFound()` | Resource doesn't exist |
| 500 | Auto | Unhandled errors |

---

**Location**: `/src/lib/utils/api-error-handler.ts`
**Used in**: All API routes
**Pattern from**: `CLAUDE.md`
