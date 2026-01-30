# Twenty CRM Architecture Analysis

> Analysis of Twenty CRM (https://github.com/twentyhq/twenty.git) for implementing similar UI/UX patterns in OpenInfo CRM (light mode)

## Executive Summary

Twenty CRM uses a sophisticated, modular architecture with:
- **Generic object system** - All CRM entities (Companies, People, Opportunities) use the same base components
- **View system** - Table, Kanban, and Calendar views with easy switching
- **Three-column layout** - Sidebar navigation, main content area, right drawer for details
- **Professional UI** - Clean design with proper spacing, subtle animations, and mobile responsiveness

## Architecture Overview

### Directory Structure

```
twenty-front/src/
├── modules/
│   ├── ui/                      # UI components library
│   │   ├── layout/              # Layout components (page, modal, dropdown, etc.)
│   │   ├── input/               # Input components
│   │   ├── field/               # Field components
│   │   ├── navigation/          # Navigation components
│   │   └── theme/               # Theme system
│   ├── object-record/           # Generic CRM object system
│   │   ├── record-table/        # Table view
│   │   ├── record-board/        # Kanban board view
│   │   ├── record-show/         # Detail/show page
│   │   ├── record-index/        # List/index page
│   │   ├── record-filter/       # Filtering system
│   │   ├── record-sort/         # Sorting system
│   │   └── record-right-drawer/ # Right drawer for details
│   ├── page-layout/             # Page layout system
│   ├── favorites/               # Favorites/bookmarks
│   ├── command-menu/            # CMD+K command palette
│   └── action-menu/             # Action menus
└── pages/
    └── object-record/           # CRM pages
        ├── RecordIndexPage.tsx  # List view page
        └── RecordShowPage.tsx   # Detail view page
```

### Key Architectural Patterns

#### 1. Generic Object Metadata System

Twenty treats all CRM entities generically using an `objectMetadataItem`:

```typescript
interface ObjectMetadataItem {
  id: string
  nameSingular: string      // "company", "person"
  namePlural: string        // "companies", "people"
  labelSingular: string     // "Company", "Person"
  labelPlural: string       // "Companies", "People"
  // ... field definitions, permissions, etc.
}
```

This allows one set of components to handle Companies, People, Opportunities, etc.

#### 2. View Type System

```typescript
enum ViewType {
  Table = 'table',
  Kanban = 'kanban',
  Calendar = 'calendar'
}
```

The same page can render different views based on `recordIndexViewType` state.

#### 3. Component Instance Context

They use context providers extensively to scope component state:

```typescript
<ViewComponentInstanceContext.Provider value={{ instanceId: recordIndexId }}>
  <RecordComponentInstanceContextsWrapper componentInstanceId={recordIndexId}>
    <ActionMenuComponentInstanceContext.Provider value={{ instanceId: actionMenuId }}>
      {/* Component tree */}
    </ActionMenuComponentInstanceContext.Provider>
  </RecordComponentInstanceContextsWrapper>
</ViewComponentInstanceContext.Provider>
```

This allows multiple instances of the same component on a page without state conflicts.

## Core Components

### 1. RecordIndexPage (List View)

**File**: `pages/object-record/RecordIndexPage.tsx`

**Structure**:
```typescript
<PageContainer>
  <RecordIndexPageHeader />
  <MainContainerLayoutWithCommandMenu>
    <RecordIndexContainer>
      {/* ViewBar with filters/sort */}
      <ViewBar optionsDropdownButton={<ObjectOptionsDropdown />} />

      {/* Conditional rendering based on view type */}
      {viewType === ViewType.Table && <RecordIndexTableContainer />}
      {viewType === ViewType.Kanban && <RecordBoardContainer />}
      {viewType === ViewType.Calendar && <RecordIndexCalendarContainer />}
    </RecordIndexContainer>
  </MainContainerLayoutWithCommandMenu>
</PageContainer>
```

**Key Features**:
- Dynamic object metadata loading
- Permissions checking
- View type switching
- Command menu integration
- Drag-select support

### 2. RecordShowPage (Detail View)

**File**: `pages/object-record/RecordShowPage.tsx`

**Structure**:
```typescript
<PageContainer>
  <RecordShowPageHeader />
  <ShowPageContainer>
    {/* Left panel with record details */}
    <ShowPageLeftContainer>
      <ShowPageSummaryCard />
      {/* Field cards */}
    </ShowPageLeftContainer>

    {/* Right panel with activities, emails, etc. */}
    <ShowPageRightContainer>
      <Tabs>
        <Tab label="Timeline" />
        <Tab label="Tasks" />
        <Tab label="Notes" />
      </Tabs>
    </ShowPageRightContainer>
  </ShowPageContainer>
</PageContainer>
```

### 3. RecordBoard (Kanban View)

**File**: `modules/object-record/record-board/components/RecordBoard.tsx`

**Key Components**:
- `RecordBoardDragDropContext` - Handles drag-and-drop
- `RecordBoardColumns` - Renders board columns
- `RecordBoardHeader` - Column headers
- `RecordBoardDragSelect` - Multi-select support

**Features**:
- Drag-and-drop cards between columns
- Multi-select with drag-select
- Infinite scroll
- Real-time updates via SSE
- Keyboard shortcuts

### 4. ViewBar

**File**: `modules/views/components/ViewBar.tsx`

**Features**:
- View name and icon
- Filter button with dropdown
- Sort button with dropdown
- View options (Table/Kanban/Calendar toggle)
- Custom action buttons
- View management (save, edit, delete views)

**Layout**:
```
[View Icon] [View Name] | [Filter] [Sort] [Options] [Actions...]
```

### 5. Right Drawer

**File**: `modules/ui/layout/right-drawer/`

**Purpose**: Slide-in panel from right for showing record details without navigating away

**Features**:
- Smooth slide animation
- Resizable width
- Keyboard shortcuts to close (ESC)
- Click outside to close
- Footer with actions

## Layout System

### Three-Column Layout

```
┌─────────────────────────────────────────────────┐
│ Sidebar (260px) │ Main Content │ Right Drawer  │
├─────────────────────────────────────────────────┤
│ - Navigation    │ - ViewBar    │ (resizable)   │
│ - Favorites     │ - Table/     │               │
│ - Search        │   Board/     │               │
│                 │   Calendar   │               │
└─────────────────────────────────────────────────┘
```

### Mobile Responsiveness

**Pattern**: `useIsMobile()` hook throughout

```typescript
const StyledInnerContainer = styled.div<{ isMobile: boolean }>`
  width: ${({ isMobile }) =>
    isMobile ? `100%` : `${CONTAINER_WIDTH}px`};
`;
```

**Mobile Behavior**:
- Sidebar becomes bottom sheet or hamburger menu
- Right drawer becomes full-screen modal
- Tables switch to card view
- Touch-friendly spacing (44px minimum)

## Design Tokens

### Spacing System

```typescript
theme.spacing(n) // n * 4px
// Common values:
spacing(1) = 4px
spacing(2) = 8px
spacing(3) = 12px
spacing(4) = 16px
spacing(10) = 40px
```

### Colors (Dark Mode - Need to Convert)

They use a semantic color system:

```typescript
background: {
  primary: '#0D0D0D',
  secondary: '#141414',
  tertiary: '#1A1A1A'
}

border: {
  color: {
    light: '#FFFFFF14',
    medium: '#FFFFFF1F',
    strong: '#FFFFFF33'
  }
}

font: {
  color: {
    primary: '#FFFFFF',
    secondary: '#FFFFFFB3',
    tertiary: '#FFFFFF80'
  }
}
```

**Light Mode Conversion** (for our implementation):

```typescript
background: {
  primary: '#FFFFFF',
  secondary: '#F7F7F7',
  tertiary: '#F0F0F0'
}

border: {
  color: {
    light: '#E5E5E5',
    medium: '#D1D1D1',
    strong: '#B8B8B8'
  }
}

font: {
  color: {
    primary: '#0D0D0D',
    secondary: '#666666',
    tertiary: '#999999'
  }
}
```

### Border Radius

```typescript
borderRadius: {
  sm: '4px',
  md: '8px',
  lg: '12px'
}
```

## State Management

### Recoil Patterns

**Component-Scoped State**:
```typescript
const recordIndexViewTypeState = atomFamily({
  key: 'recordIndexViewTypeState',
  default: (instanceId: string) => ViewType.Table
})
```

**Global State**:
```typescript
const currentWorkspaceState = atom({
  key: 'currentWorkspace',
  default: null
})
```

### Context Providers

**Pattern**: Nested contexts for different concerns

```typescript
<RecordIndexContext.Provider>
  <ViewContext.Provider>
    <ActionMenuContext.Provider>
      {children}
    </ActionMenuContext.Provider>
  </ViewContext.Provider>
</RecordIndexContext.Provider>
```

## Filtering & Sorting

### Filter System

**Components**:
- `ObjectFilterDropdownButton` - Opens filter panel
- `ObjectFilterDropdownContent` - Filter configuration
- `RecordFilter` - Individual filter row

**Filter Types**:
- Text: contains, does not contain, is, is not, is empty, is not empty
- Number: =, ≠, >, ≥, <, ≤
- Date: is, is before, is after, is within
- Select: is, is not, is any of, is none of
- Boolean: is true, is false

**Filter Groups**:
- AND groups (all conditions must match)
- OR groups (any condition matches)
- Nested groups support

### Sort System

**Components**:
- `ObjectSortDropdownButton` - Opens sort panel
- `ObjectSortDropdownContent` - Sort configuration

**Features**:
- Multi-column sorting
- Drag to reorder sort priority
- Ascending/descending toggle

## Empty States

### Pattern

**Components**: `EmptyState` with:
- Icon (large, centered)
- Title (bold, primary color)
- Description (smaller, secondary color)
- Primary action button
- Secondary action button (optional)

**Example**:
```typescript
<EmptyState
  icon={<IconInbox size={48} />}
  title="No deals yet"
  description="Create your first deal to get started"
  primaryAction={{
    label: "Create Deal",
    onClick: handleCreate
  }}
  secondaryAction={{
    label: "Import Deals",
    onClick: handleImport
  }}
/>
```

## Animations

### Patterns

**Page Transitions**: Fade in
```typescript
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Drawer Slide**: Transform
```typescript
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

**Hover Effects**: Scale + subtle shadow
```typescript
transition: all 0.15s ease;

&:hover {
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
```

**Loading States**: Skeleton shimmer (already in our globals.css)

## Implementation Plan for OpenInfo CRM

### Phase 1: Layout Foundation (Week 1)

**Priority 1**: Create generic layout system

1. **Create layout components**:
   - `CRMPageContainer` - Main page wrapper
   - `CRMViewBar` - Top bar with filters/sort/view switcher
   - `CRMThreeColumnLayout` - Sidebar + Content + Drawer
   - `CRMRightDrawer` - Detail panel drawer

2. **Update CRM pages**:
   - Leads page → Use new layout
   - Companies page → Use new layout
   - Contacts page → Use new layout
   - Deals page → Use new layout

**Priority 2**: View switching system

3. **Create view components**:
   - `CRMTableView` - Enhanced table with Twenty patterns
   - `CRMBoardView` - Kanban board (start with basic, enhance later)
   - View type state management (Zustand store)

### Phase 2: Enhanced Components (Week 2)

**Priority 1**: Filtering & Sorting

4. **Create filter system**:
   - `FilterButton` - Opens filter dropdown
   - `FilterDropdown` - Filter configuration panel
   - `FilterRow` - Individual filter
   - Filter state management

5. **Create sort system**:
   - `SortButton` - Opens sort dropdown
   - `SortDropdown` - Sort configuration panel
   - Multi-column sort support

**Priority 2**: Record detail drawer

6. **Create right drawer**:
   - `RecordDrawer` - Main drawer component
   - `RecordDrawerHeader` - Header with title/close
   - `RecordDrawerTabs` - Timeline, Tasks, Notes tabs
   - Animation support

### Phase 3: Advanced Features (Week 3)

**Priority 1**: Kanban board

7. **Enhance board view**:
   - Drag-and-drop between columns
   - Card components
   - Column headers
   - Add card button
   - Empty state per column

**Priority 2**: Empty states & Polish

8. **Professional empty states**:
   - Each CRM page when no records
   - Each view type when no records
   - Filter results when nothing matches
   - Icon + title + description + actions

9. **Micro-animations**:
   - Drawer slide-in/out
   - Card hover effects
   - Button press feedback
   - View transition fades

### Phase 4: Mobile & Performance (Week 4)

10. **Mobile optimization**:
    - Table → Card view on mobile
    - Bottom sheet for filters
    - Full-screen drawer
    - Touch-friendly spacing

11. **Performance**:
    - Virtual scrolling for long lists
    - Memoization of expensive renders
    - Debounced filter/sort
    - Lazy load drawer content

## Key Differences from Twenty

**What We Keep**:
- Three-column layout
- View switching (Table/Kanban)
- ViewBar with filters/sort
- Right drawer pattern
- Empty states
- Generic component structure

**What We Simplify**:
- No Calendar view (not needed yet)
- Simpler object metadata (not fully generic)
- Simpler permissions (our existing RBAC)
- No SSE real-time updates (not needed yet)
- No command menu (nice-to-have, not priority)

**What We Add**:
- Light mode design (instead of dark)
- OpenInfo/Cursive branding
- Integration with our existing toast system
- Integration with our existing auth/workspace system

## Design System Mapping

### From Twenty Dark → OpenInfo Light

**Backgrounds**:
```
Twenty Dark       →  OpenInfo Light
#0D0D0D (primary) →  #FFFFFF
#141414 (secondary) → #F9FAFB (Tailwind gray-50)
#1A1A1A (tertiary) → #F3F4F6 (Tailwind gray-100)
```

**Borders**:
```
Twenty Dark          →  OpenInfo Light
#FFFFFF14 (light)    →  #E5E7EB (Tailwind gray-200)
#FFFFFF1F (medium)   →  #D1D5DB (Tailwind gray-300)
#FFFFFF33 (strong)   →  #9CA3AF (Tailwind gray-400)
```

**Text**:
```
Twenty Dark          →  OpenInfo Light
#FFFFFF (primary)    →  #111827 (Tailwind gray-900)
#FFFFFFB3 (secondary) → #6B7280 (Tailwind gray-500)
#FFFFFF80 (tertiary) →  #9CA3AF (Tailwind gray-400)
```

**Accents** (use our existing Cursive brand colors):
```
Primary: #3B82F6 (blue-500)
Success: #10B981 (green-500)
Warning: #F59E0B (amber-500)
Danger: #EF4444 (red-500)
```

## Files to Create

### New Components

```
src/components/crm/
├── layout/
│   ├── CRMPageContainer.tsx
│   ├── CRMThreeColumnLayout.tsx
│   ├── CRMViewBar.tsx
│   └── CRMRightDrawer.tsx
├── views/
│   ├── CRMTableView.tsx
│   ├── CRMBoardView.tsx
│   └── CRMViewSwitcher.tsx
├── filters/
│   ├── FilterButton.tsx
│   ├── FilterDropdown.tsx
│   └── FilterRow.tsx
├── sorting/
│   ├── SortButton.tsx
│   └── SortDropdown.tsx
├── board/
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   ├── KanbanCard.tsx
│   └── KanbanCardDragLayer.tsx
├── drawer/
│   ├── RecordDrawer.tsx
│   ├── RecordDrawerHeader.tsx
│   ├── RecordDrawerTabs.tsx
│   └── RecordDrawerContent.tsx
└── empty-states/
    ├── EmptyState.tsx
    └── CRMEmptyStates.tsx
```

### State Management

```
src/lib/stores/
└── crm-view-store.ts  # Zustand store for view type, filters, sort
```

### Updated Pages

```
src/app/crm/
├── leads/page.tsx       # Update with new layout
├── companies/page.tsx   # Update with new layout
├── contacts/page.tsx    # Update with new layout
└── deals/page.tsx       # Update with new layout
```

## Success Criteria

### Functional Requirements

- [ ] All 4 CRM pages use new three-column layout
- [ ] Table view works on all pages
- [ ] Kanban board view works on Leads and Deals
- [ ] View switching (Table ↔ Kanban) works
- [ ] Filter system works with 3+ filter types
- [ ] Sort system works (single and multi-column)
- [ ] Right drawer opens for record details
- [ ] Right drawer has Timeline tab
- [ ] Empty states show on all pages when no data
- [ ] Mobile: Tables switch to cards
- [ ] Mobile: Drawer becomes full-screen
- [ ] Mobile: Touch targets ≥ 44px

### Design Requirements

- [ ] Light mode design matches screenshots (inverted)
- [ ] Spacing matches Twenty's spacing system
- [ ] Border radius consistent (8px standard)
- [ ] Colors follow our light mode palette
- [ ] Typography uses our existing fonts
- [ ] Animations: Drawer slide, card hover, view fade
- [ ] Loading states: Skeleton shimmers
- [ ] No horizontal scroll on any viewport

### Performance Requirements

- [ ] Initial page load < 2s
- [ ] View switching < 300ms
- [ ] Filter application < 500ms
- [ ] Drawer open animation 60fps
- [ ] Virtual scrolling for 100+ records
- [ ] No layout shifts (CLS score 0)

## Next Steps

1. Create task tracking for implementation
2. Start with Phase 1: Layout foundation
3. Build `CRMPageContainer` and `CRMViewBar` first
4. Update Leads page as proof of concept
5. Iterate based on user feedback
6. Expand to other CRM pages

---

**Analysis Date**: 2026-01-30
**Twenty CRM Version**: Latest (main branch)
**Target**: OpenInfo CRM (Light Mode)
**Implementation Timeline**: 4 weeks
