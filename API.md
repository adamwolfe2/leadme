# API Documentation

Complete reference for OpenInfo's REST API.

## Base URL

```
Production: https://openinfo.com/api
Development: http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a valid session cookie.

### Headers

```http
Cookie: sb-access-token=<token>
Content-Type: application/json
```

## Rate Limiting

All endpoints are rate limited:

- **Public**: 100 requests per 15 minutes (IP-based)
- **Authenticated**: 60 requests per minute (user-based)
- **Strict** (search, export): 10 requests per minute

Rate limit headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1674567890
Retry-After: 15  (if exceeded)
```

## Error Responses

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `402` - Payment Required (insufficient credits)
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoints

### Authentication

#### POST /api/auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "workspace_id": "workspace-456"
  }
}
```

#### POST /api/auth/signup

Create new account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  }
}
```

#### POST /api/auth/logout

Logout current user.

**Response (200):**
```json
{
  "success": true
}
```

---

### Queries

#### GET /api/queries

List all queries for workspace.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `paused`, `draft`)

**Response (200):**
```json
{
  "queries": [
    {
      "id": "query-123",
      "name": "AI Automation Tools",
      "status": "active",
      "topic_id": "topic-456",
      "filters": {
        "location": { "countries": ["US"] },
        "companySize": { "employeeMin": 10, "employeeMax": 500 },
        "industries": ["Technology"]
      },
      "created_at": "2024-01-22T10:00:00Z",
      "global_topics": {
        "topic": "AI automation",
        "category": "Technology"
      }
    }
  ]
}
```

#### POST /api/queries

Create new query.

**Request:**
```json
{
  "name": "AI Automation Tools",
  "topic_id": "topic-456",
  "filters": {
    "location": {
      "countries": ["US", "CA"]
    },
    "companySize": {
      "employeeMin": 10,
      "employeeMax": 500
    },
    "industries": ["Technology", "Software"]
  }
}
```

**Response (201):**
```json
{
  "query": {
    "id": "query-789",
    "name": "AI Automation Tools",
    "status": "draft",
    "created_at": "2024-01-22T10:00:00Z"
  }
}
```

#### PATCH /api/queries/[id]

Update query.

**Request:**
```json
{
  "name": "Updated Name",
  "status": "active"
}
```

**Response (200):**
```json
{
  "query": {
    "id": "query-123",
    "name": "Updated Name",
    "status": "active"
  }
}
```

#### DELETE /api/queries/[id]

Delete query.

**Response (200):**
```json
{
  "success": true
}
```

---

### Leads

#### GET /api/leads

List leads for workspace.

**Query Parameters:**
- `query_id` (optional): Filter by query
- `delivery_status` (optional): Filter by status (`pending`, `delivered`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50, max: 100)

**Response (200):**
```json
{
  "leads": [
    {
      "id": "lead-123",
      "company_name": "Acme Corp",
      "company_data": {
        "domain": "acme.com",
        "industry": "Technology",
        "employee_count": 250,
        "location": {
          "city": "San Francisco",
          "state": "CA",
          "country": "US"
        }
      },
      "contact_data": {
        "primary_contact": {
          "full_name": "John Smith",
          "title": "VP of Sales",
          "email": "john@acme.com"
        }
      },
      "intent_data": {
        "score": "hot",
        "signals": [
          {
            "signal_type": "website_visit",
            "signal_strength": "strong"
          }
        ]
      },
      "delivery_status": "delivered",
      "created_at": "2024-01-22T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150
  }
}
```

#### GET /api/leads/[id]

Get single lead details.

**Response (200):**
```json
{
  "lead": {
    "id": "lead-123",
    "company_name": "Acme Corp",
    "company_data": { },
    "contact_data": { },
    "intent_data": { }
  }
}
```

#### POST /api/leads/export

Export leads to CSV.

**Costs 5 credits**

**Request:**
```json
{
  "query_id": "query-123",
  "filters": {
    "delivery_status": "delivered"
  },
  "format": "csv"
}
```

**Response (202):**
```json
{
  "export_job_id": "job-123",
  "status": "pending",
  "estimated_time": "2 minutes"
}
```

---

### People Search

#### POST /api/people-search

Search for people.

**Costs 2 credits per search**

**Request:**
```json
{
  "filters": {
    "company": "Acme Corp",
    "domain": "acme.com",
    "job_title": "VP",
    "seniority": "executive",
    "department": "sales"
  },
  "save_search": true,
  "search_name": "Acme Executives"
}
```

**Response (200):**
```json
{
  "results": [
    {
      "id": "result-123",
      "person_data": {
        "full_name": "John Smith",
        "title": "VP of Sales",
        "email": "j***@acme.com",  // Masked
        "linkedin_url": "https://linkedin.com/in/johnsmith",
        "company": "Acme Corp"
      },
      "email_revealed": false
    }
  ],
  "count": 15,
  "credits": {
    "remaining": 998,
    "limit": 1000
  }
}
```

#### GET /api/people-search

Get saved searches.

**Response (200):**
```json
{
  "searches": [
    {
      "id": "search-123",
      "name": "Acme Executives",
      "filters": { },
      "created_at": "2024-01-22T10:00:00Z"
    }
  ]
}
```

#### POST /api/people-search/reveal

Reveal email address.

**Costs 1 credit**

**Request:**
```json
{
  "result_id": "result-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "email": "john.smith@acme.com",
    "credits_remaining": 997
  },
  "message": "Email revealed. 997 credits remaining today."
}
```

---

### Topics

#### GET /api/topics/search

Search for topics (autocomplete).

**Query Parameters:**
- `q`: Search query (min 2 characters)

**Response (200):**
```json
{
  "topics": [
    {
      "id": "topic-123",
      "topic": "AI automation tools",
      "category": "Technology",
      "current_volume": 1500,
      "trend_direction": "up"
    }
  ]
}
```

---

### Trends

#### GET /api/trends

Get trending topics.

**Query Parameters:**
- `direction` (optional): Filter by trend (`up`, `down`, `stable`)
- `category` (optional): Filter by category

**Response (200):**
```json
{
  "trends": [
    {
      "id": "trend-123",
      "topic_id": "topic-456",
      "global_topics": {
        "topic": "AI automation",
        "category": "Technology"
      },
      "current_volume": 1500,
      "trend_direction": "up",
      "change_percent": 25.5
    }
  ]
}
```

---

### Credits

#### GET /api/credits/status

Get current credit status.

**Response (200):**
```json
{
  "credits": {
    "remaining": 997,
    "limit": 1000,
    "used": 3,
    "resetAt": "2024-01-23T00:00:00Z",
    "plan": "pro"
  },
  "usage": {
    "people_search": {
      "count": 2,
      "total": 4
    },
    "email_reveal": {
      "count": 1,
      "total": 1
    }
  }
}
```

---

### Billing

#### POST /api/billing/checkout

Create Stripe checkout session.

**Request:**
```json
{
  "priceId": "price_monthly",
  "successUrl": "https://openinfo.com/pricing?success=true",
  "cancelUrl": "https://openinfo.com/pricing?canceled=true"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_123",
  "url": "https://checkout.stripe.com/pay/cs_test_123"
}
```

#### POST /api/billing/portal

Create Stripe billing portal session.

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/session/123"
}
```

---

## Webhooks

### Stripe Webhooks

#### POST /api/webhooks/stripe

Stripe webhook handler.

**Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Headers:**
```http
Stripe-Signature: t=1674567890,v1=abc123...
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Get queries
const response = await fetch('https://openinfo.com/api/queries', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})

const { queries } = await response.json()
```

```typescript
// Create query
const response = await fetch('https://openinfo.com/api/queries', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'New Query',
    topic_id: 'topic-123',
    filters: {},
  }),
})

const { query } = await response.json()
```

```typescript
// People search
const response = await fetch('https://openinfo.com/api/people-search', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    filters: {
      company: 'Acme Corp',
      job_title: 'VP',
    },
  }),
})

const { results, credits } = await response.json()
console.log(`Found ${results.length} people. ${credits.remaining} credits remaining.`)
```

### Python

```python
import requests

# Get queries
response = requests.get(
    'https://openinfo.com/api/queries',
    headers={'Content-Type': 'application/json'},
    cookies={'sb-access-token': 'your-token'}
)

queries = response.json()['queries']
```

```python
# Create query
response = requests.post(
    'https://openinfo.com/api/queries',
    json={
        'name': 'New Query',
        'topic_id': 'topic-123',
        'filters': {}
    },
    headers={'Content-Type': 'application/json'},
    cookies={'sb-access-token': 'your-token'}
)

query = response.json()['query']
```

### cURL

```bash
# Get queries
curl https://openinfo.com/api/queries \
  -H "Cookie: sb-access-token=your-token" \
  -H "Content-Type: application/json"
```

```bash
# Create query
curl -X POST https://openinfo.com/api/queries \
  -H "Cookie: sb-access-token=your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Query",
    "topic_id": "topic-123",
    "filters": {}
  }'
```

---

## SDKs

### Official SDKs (Coming Soon)

- JavaScript/TypeScript
- Python
- Ruby
- PHP

---

## Changelog

### v1.0.0 (2024-01-22)

- Initial API release
- Authentication endpoints
- Query management
- Lead management
- People search
- Topic search
- Trends
- Credits
- Billing

---

**Last Updated**: 2026-01-22
