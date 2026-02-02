# API Routes Summary

Complete list of all API routes in the Cursive platform.

## Authentication Required Routes

All routes below require authentication via `getCurrentUser()`.

### Queries

| Method | Endpoint | Description | Workspace Isolated |
|--------|----------|-------------|-------------------|
| GET | `/api/queries` | List all queries | ✅ |
| POST | `/api/queries` | Create new query | ✅ |
| GET | `/api/queries/[id]` | Get single query | ✅ |
| PATCH | `/api/queries/[id]` | Update query | ✅ |
| DELETE | `/api/queries/[id]` | Delete query | ✅ |

**Features**:
- Plan limits enforced (Free: 1 query, Pro: 5 queries)
- Status management (active, paused, completed)
- Filter configuration support

### Leads

| Method | Endpoint | Description | Workspace Isolated |
|--------|----------|-------------|-------------------|
| GET | `/api/leads` | List leads with filters | ✅ |
| GET | `/api/leads/[id]` | Get single lead | ✅ |
| DELETE | `/api/leads/[id]` | Delete lead | ✅ |
| POST | `/api/leads/export` | Export leads to CSV | ✅ |
| GET | `/api/leads/stats` | Get lead statistics | ✅ |

**Features**:
- Advanced filtering (query, status, intent score, dates)
- Pagination support (page, per_page)
- Search by company name or domain
- CSV export with filters
- Intent breakdown and platform stats

### People Search

| Method | Endpoint | Description | Workspace Isolated |
|--------|----------|-------------|-------------------|
| POST | `/api/people-search` | Search for people | ✅ |
| GET | `/api/people-search` | Get saved searches | ✅ |
| POST | `/api/people-search/reveal` | Reveal email (costs 1 credit) | ✅ |

**Features**:
- Search by company, title, location, seniority
- Email masking by default
- Credit-based email reveal
- Save search functionality

### Trends

| Method | Endpoint | Description | Workspace Isolated |
|--------|----------|-------------|-------------------|
| GET | `/api/trends` | Get trending topics | ❌ (Global data) |

**Query Parameters**:
- `type`: `gainers`, `losers`, or `all` (default: all)
- `limit`: Number of results (default: 20)

### Topics

| Method | Endpoint | Description | Workspace Isolated |
|--------|----------|-------------|-------------------|
| GET | `/api/topics/search` | Search topics | ❌ (Global data) |

**Query Parameters**:
- `q`: Search query (min 2 chars, required)
- `limit`: Number of results (default: 20)

### Users

| Method | Endpoint | Description | Workspace Isolated |
|--------|----------|-------------|-------------------|
| GET | `/api/users/me` | Get current user info | ✅ |

**Response includes**:
- User profile (id, email, name)
- Plan and role
- Credit usage and limits

### Billing

| Method | Endpoint | Description | Workspace Isolated |
|--------|----------|-------------|-------------------|
| POST | `/api/billing/checkout` | Create Stripe checkout session | ✅ |
| POST | `/api/billing/portal` | Create customer portal session | ✅ |

**Features**:
- Monthly/yearly billing support
- Subscription management
- Active subscription check

## Admin Routes

Require `role === 'admin'` or `role === 'owner'`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/trigger-enrichment` | Trigger lead enrichment job |
| POST | `/api/admin/trigger-lead-generation` | Trigger lead generation job |

## Webhook Routes

No authentication (verified by signature).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe webhook events |
| POST | `/api/webhooks/clay` | Clay integration webhook |
| POST | `/api/webhooks/datashopper` | DataShopper webhook |
| POST | `/api/webhooks/audience-labs` | Audience Labs webhook |

## Other Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST/GET | `/api/inngest` | Inngest function handler |

## Request/Response Patterns

### Successful Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {
    // Optional error details
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 250,
    "total_pages": 5
  }
}
```

### Validation Error Response
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions/credits/plan |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Error | Unhandled server error |

## Query Parameter Examples

### Leads List
```
GET /api/leads?query_id=123&enrichment_status=completed&page=1&per_page=50
```

### Trends
```
GET /api/trends?type=gainers&limit=10
```

### Topic Search
```
GET /api/topics/search?q=AI&limit=20
```

## Rate Limiting

Currently not implemented. Planned for PHASE 10.

## Caching

Currently not implemented. Planned for PHASE 14.

## Documentation

- Full API patterns: `/CLAUDE.md`
- Error handler guide: `/docs/API-ERROR-HANDLER-GUIDE.md`
- Phase 2 completion: `/PHASE-2-API-ROUTES-COMPLETE.md`

---

**Last Updated**: 2026-01-22
**Total Routes**: 20+ endpoints
**All Routes**: ✅ Following standard patterns
