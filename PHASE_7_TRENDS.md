# Phase 7: Trends Dashboard Documentation

## Overview

The Trends Dashboard displays trending topics with the highest gains and losses in search volume. Users can view trend history charts and quickly create queries to track emerging topics.

## Features

### 1. Gainers/Losers Tabs

**Gainers Tab**:
- Topics with positive growth in search volume
- Sorted by change percentage (highest first)
- "🚀 Top Gainers" label

**Losers Tab**:
- Topics with declining search volume
- Sorted by change percentage (lowest first)
- "📉 Top Losers" label

### 2. Topic Cards

Each topic card displays:
- **Topic name** (e.g., "Artificial Intelligence")
- **Category** (e.g., "Technology")
- **Current search volume** (e.g., 1,250,000)
- **Trend direction icon**:
  - 🟢 Green arrow up (gaining)
  - 🔴 Red arrow down (losing)
  - ⚪ Gray horizontal line (stable)
- **Change percentage** (e.g., +42.5% vs last week)
- **View Chart button** - Opens modal with historical trend data
- **Track This Topic button** - Creates a new query for this topic

### 3. Trend Chart Modal

When clicking "View Chart":
- Opens full-screen modal with Headless UI Dialog
- Displays line chart with Recharts library
- Shows last 12 weeks of search volume data
- Interactive tooltip with:
  - Week label
  - Exact volume number
  - Change percentage (color-coded)
- Close button to dismiss modal

### 4. Track This Topic

When clicking "Track This Topic":
- Redirects to `/queries/new` with pre-filled parameters
- Query params: `topic_id={id}&topic={name}`
- Query wizard opens with topic already selected
- User completes remaining filters and creates query

## Architecture

### API Endpoints

#### GET /api/trends

Get trending topics (gainers and losers).

**Query Parameters**:
- `type`: `"gainers" | "losers" | "all"` (default: "all")
- `limit`: Number of topics to return (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "gainers": [
      {
        "id": "uuid",
        "topic": "Artificial Intelligence",
        "category": "Technology",
        "current_volume": 1250000,
        "trend_direction": "up",
        "change_percent": 42.5
      }
    ],
    "losers": [
      {
        "id": "uuid",
        "topic": "Cryptocurrency",
        "category": "Finance",
        "current_volume": 850000,
        "trend_direction": "down",
        "change_percent": -15.3
      }
    ]
  }
}
```

#### GET /api/trends/[topicId]

Get trend history for a specific topic.

**Response**:
```json
{
  "success": true,
  "data": {
    "topic": {
      "id": "uuid",
      "topic": "Artificial Intelligence",
      "category": "Technology",
      "current_volume": 1250000,
      "trend_direction": "up"
    },
    "trends": [
      {
        "week_start": "2025-10-01",
        "volume": 950000,
        "change_percent": 5.2
      },
      {
        "week_start": "2025-10-08",
        "volume": 1000000,
        "change_percent": 5.3
      },
      {
        "week_start": "2025-10-15",
        "volume": 1100000,
        "change_percent": 10.0
      }
    ]
  }
}
```

### Database Queries

#### Trending Gainers

Uses `TopicSearchService.getTrendingGainers()`:

```typescript
async getTrendingGainers(limit: number = 20) {
  const { data } = await supabase
    .from('global_topics')
    .select('*')
    .eq('trend_direction', 'up')
    .order('change_percent', { ascending: false })
    .limit(limit)

  return data
}
```

#### Trending Losers

Uses `TopicSearchService.getTrendingLosers()`:

```typescript
async getTrendingLosers(limit: number = 20) {
  const { data } = await supabase
    .from('global_topics')
    .select('*')
    .eq('trend_direction', 'down')
    .order('change_percent', { ascending: true })
    .limit(limit)

  return data
}
```

#### Trend History

Fetches last 12 weeks from `trends` table:

```sql
SELECT * FROM trends
WHERE topic_id = $1
ORDER BY week_start DESC
LIMIT 12
```

## Components

### TrendChart Component

**Location**: `src/components/trends/trend-chart.tsx`

**Purpose**: Displays line chart with Recharts library

**Props**:
```typescript
interface TrendChartProps {
  data: Array<{
    week_start: string
    volume: number
    change_percent: number
  }>
  topicName: string
}
```

**Features**:
- Responsive container (100% width, 320px height)
- Cartesian grid with dashed lines
- X-axis: Week labels (e.g., "Oct 15")
- Y-axis: Volume with locale formatting
- Line: Blue (#3b82f6), 2px width, 4px dots
- Custom tooltip:
  - White background with border
  - Week label
  - Volume (formatted with commas)
  - Change % (color-coded: green/red/gray)

**Implementation**:
```typescript
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="week" />
    <YAxis tickFormatter={(value) => value.toLocaleString()} />
    <Tooltip content={CustomTooltip} />
    <Legend />
    <Line
      type="monotone"
      dataKey="volume"
      stroke="#3b82f6"
      strokeWidth={2}
    />
  </LineChart>
</ResponsiveContainer>
```

### TopicCard Component

**Location**: `src/components/trends/topic-card.tsx`

**Purpose**: Display topic with trend indicator and actions

**Props**:
```typescript
interface TopicCardProps {
  topic: {
    id: string
    topic: string
    category: string
    current_volume: number
    trend_direction: 'up' | 'down' | 'stable'
    change_percent?: number
  }
  onTrackTopic?: (topicId: string, topicName: string) => void
}
```

**Features**:
- Card with hover effect (border-gray-300, shadow)
- Header: Topic name + category
- Trend icon (SVG, color-coded)
- Volume display (formatted with commas)
- Change percentage (color-coded)
- Two action buttons:
  1. "View Chart" - Opens modal
  2. "Track This Topic" - Calls onTrackTopic callback
- Modal with Headless UI Dialog
  - Backdrop overlay (gray-500, 75% opacity)
  - Slide-up animation
  - TrendChart inside
  - Close button (X icon)

**States**:
- `showChart`: Boolean for modal visibility
- `chartData`: Cached trend history data
- `loadingChart`: Loading state during fetch

**Chart Fetch Logic**:
```typescript
const handleShowChart = async () => {
  setShowChart(true)

  if (!chartData) {
    setLoadingChart(true)
    const response = await fetch(`/api/trends/${topic.id}`)
    const data = await response.json()
    setChartData(data.data)
    setLoadingChart(false)
  }
}
```

### Trends Page

**Location**: `src/app/(dashboard)/trends/page.tsx`

**Purpose**: Main trends dashboard with tabs

**State**:
- `activeTab`: "gainers" | "losers"

**Data Fetching**:
Uses TanStack Query with automatic refetching:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['trends', activeTab],
  queryFn: async () => {
    const response = await fetch(`/api/trends?type=${activeTab}&limit=20`)
    return response.json()
  },
})
```

**UI Sections**:

1. **Header**:
   - Title: "Trending Topics"
   - Description: "Discover emerging trends..."

2. **Tabs Navigation**:
   - Two tabs: Gainers / Losers
   - Active tab: Blue border + blue text
   - Inactive tab: Gray text + hover effect

3. **Info Banner**:
   - Blue background (#f0f9ff)
   - Icon + heading + description
   - Changes based on active tab

4. **Loading State**:
   - 6 skeleton cards (gray, animated pulse)
   - Grid layout (responsive)

5. **Topics Grid**:
   - Responsive grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
   - Gap: 24px (gap-6)
   - Maps over topics array
   - Renders TopicCard for each

6. **Empty State**:
   - Chart icon (gray)
   - "No trends available" heading
   - Description based on active tab

**Track Topic Handler**:
```typescript
const handleTrackTopic = (topicId: string, topicName: string) => {
  router.push(`/queries/new?topic_id=${topicId}&topic=${encodeURIComponent(topicName)}`)
}
```

## User Experience

### Loading States

1. **Initial page load**: 6 skeleton cards with pulse animation
2. **Chart modal**: "Loading chart..." text with spinner
3. **Tab switch**: Brief loading state, then content swap

### Empty States

1. **No gainers**: Chart icon + "No gaining topics found"
2. **No losers**: Chart icon + "No declining topics found"
3. **No chart data**: "No data available" in modal

### Success Feedback

1. **Chart loaded**: Smooth fade-in of line chart
2. **Tab switched**: Instant content swap (cached by React Query)
3. **Track clicked**: Immediate redirect to query wizard

### Error Handling

1. **API failure**: Error boundary catches, shows error message
2. **Chart fetch failure**: "Failed to load chart data" in modal
3. **Network error**: Retry prompt with TanStack Query

## Styling

### Color Palette

- **Gainers (Up)**: Green (#22c55e, green-500)
- **Losers (Down)**: Red (#ef4444, red-500)
- **Stable**: Gray (#9ca3af, gray-400)
- **Primary**: Blue (#3b82f6, blue-600)
- **Background**: White (#ffffff)
- **Border**: Gray (#e5e7eb, gray-200)

### Typography

- **Page title**: 3xl, bold (text-3xl font-bold)
- **Card title**: lg, semibold (text-lg font-semibold)
- **Volume**: 2xl, bold (text-2xl font-bold)
- **Change %**: lg, semibold (text-lg font-semibold)
- **Category**: sm, normal (text-sm)

### Spacing

- **Page padding**: 24px (space-y-6)
- **Card padding**: 24px (p-6)
- **Grid gap**: 24px (gap-6)
- **Button spacing**: 8px (space-x-2)

## Integration with Query Wizard

### Pre-filled Query Flow

1. User clicks "Track This Topic" on a trend card
2. App redirects to `/queries/new?topic_id={id}&topic={name}`
3. Query wizard reads URL parameters
4. Topic field pre-filled with selected topic
5. User completes remaining steps:
   - Location filters
   - Company size filters
   - Industry filters
   - Review and create
6. Query created and starts generating leads

### URL Parameters

```typescript
// Example redirect
router.push(
  `/queries/new?topic_id=550e8400-e29b-41d4-a716-446655440000&topic=Artificial%20Intelligence`
)

// Query wizard reads params
const searchParams = useSearchParams()
const topicId = searchParams.get('topic_id')
const topicName = searchParams.get('topic')

// Pre-fill form
const [selectedTopic, setSelectedTopic] = useState({
  id: topicId,
  name: decodeURIComponent(topicName)
})
```

## Performance Optimizations

### 1. Chart Data Caching

Topic cards cache chart data after first load:
```typescript
const [chartData, setChartData] = useState<any>(null)

// Only fetch if not cached
if (!chartData) {
  setLoadingChart(true)
  const data = await fetchChartData()
  setChartData(data)
}
```

### 2. React Query Caching

Trends data cached for 5 minutes:
```typescript
useQuery({
  queryKey: ['trends', activeTab],
  queryFn: fetchTrends,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
})
```

### 3. Lazy Chart Loading

Charts only load when modal opens (not on initial page load).

### 4. Image Optimization

SVG icons used instead of images for trend indicators (smaller bundle size).

## Responsive Design

### Breakpoints

- **Mobile** (< 768px): 1 column grid, full-width cards
- **Tablet** (768px - 1024px): 2 column grid
- **Desktop** (> 1024px): 3 column grid

### Mobile Optimizations

1. Tabs: Smaller font size, reduced padding
2. Cards: Full width, stacked layout
3. Chart modal: Full screen on mobile
4. Buttons: Full width on small screens

## Testing Checklist

- [ ] Gainers tab displays topics with positive change
- [ ] Losers tab displays topics with negative change
- [ ] Tab switching works instantly (cached)
- [ ] Chart modal opens on "View Chart" click
- [ ] Chart displays 12 weeks of data
- [ ] Chart tooltip shows correct values
- [ ] Modal closes on X button click
- [ ] Modal closes on backdrop click
- [ ] "Track This Topic" redirects to query wizard
- [ ] Query wizard receives correct URL params
- [ ] Topic pre-filled in query wizard
- [ ] Empty state shows when no trends
- [ ] Loading state shows during fetch
- [ ] Error handling works for failed API calls
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Colors are accessible (WCAG AA)
- [ ] Keyboard navigation works (tab, enter, escape)

## Next Steps (Future Enhancements)

1. **Real-time Updates**: Use Supabase real-time subscriptions for live trend updates
2. **Filters**: Add category filter, volume range filter, time period selector
3. **Sorting**: Allow custom sorting (volume, change %, alphabetical)
4. **Comparison**: Compare multiple topics on same chart
5. **Favorites**: Save favorite topics for quick access
6. **Alerts**: Notify users when tracked topics become top gainers
7. **Export**: Export trend data as CSV or image
8. **Share**: Share trend charts via unique URLs
9. **Annotations**: Add notes to specific weeks on chart
10. **Predictions**: Show forecasted volume based on trend

---

**Last Updated**: 2026-01-22
**Phase Status**: ✅ Complete
