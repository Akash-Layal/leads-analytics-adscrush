# Cache Keys Usage Examples

## Overview
The centralized cache keys system provides type-safe, autocomplete-enabled cache key management.

## Available Cache Keys

### Dashboard Keys
- `CACHE_KEYS.DASHBOARD.DATA` - Main dashboard data
- `CACHE_KEYS.DASHBOARD.METRICS` - Dashboard metrics
- `CACHE_KEYS.DASHBOARD.STATS` - Dashboard statistics
- `CACHE_KEYS.DASHBOARD.OVERVIEW` - Dashboard overview

### Analytics Keys
- `CACHE_KEYS.ANALYTICS.TABLE_COUNTS` - Table count analytics
- `CACHE_KEYS.ANALYTICS.TOTAL_COUNT` - Total count analytics
- `CACHE_KEYS.ANALYTICS.TABLE_STATS` - Table statistics
- `CACHE_KEYS.ANALYTICS.PERFORMANCE` - Performance analytics
- `CACHE_KEYS.ANALYTICS.GROWTH_DATA` - Growth data analytics

### Client Keys
- `CACHE_KEYS.CLIENTS.LIST` - Client list
- `CACHE_KEYS.CLIENTS.COUNT` - Client count
- `CACHE_KEYS.CLIENTS.DETAILS` - Client details
- `CACHE_KEYS.CLIENTS.STATUS` - Client status

### Table Keys
- `CACHE_KEYS.TABLES.MAPPINGS` - Table mappings
- `CACHE_KEYS.TABLES.COUNTS` - Table counts
- `CACHE_KEYS.TABLES.STATS` - Table statistics
- `CACHE_KEYS.TABLES.RECORDS` - Table records

### Lead Keys
- `CACHE_KEYS.LEADS.TODAY` - Today's leads
- `CACHE_KEYS.LEADS.YESTERDAY` - Yesterday's leads
- `CACHE_KEYS.LEADS.THIS_WEEK` - This week's leads
- `CACHE_KEYS.LEADS.LAST_WEEK` - Last week's leads
- `CACHE_KEYS.LEADS.THIS_MONTH` - This month's leads
- `CACHE_KEYS.LEADS.LAST_MONTH` - Last month's leads
- `CACHE_KEYS.LEADS.TOTAL` - Total leads
- `CACHE_KEYS.LEADS.BY_TABLE` - Leads by table

### Cache Management Keys
- `CACHE_KEYS.CACHE.STATS` - Cache statistics
- `CACHE_KEYS.CACHE.HEALTH` - Cache health
- `CACHE_KEYS.CACHE.PERFORMANCE` - Cache performance
- `CACHE_KEYS.CACHE.RECOMMENDATIONS` - Cache recommendations

## Usage Methods

### Method 1: Direct Import (Recommended)
```typescript
import { cacheResult, globalCache, CACHE_KEYS } from '@/lib/cache';

export const getDashboardData = cacheResult(
  async (date_from?: string, date_to?: string) => {
    // Your function logic here
    return { data: 'example' };
  },
  globalCache,
  CACHE_KEYS.DASHBOARD.DATA, // ✅ Autocomplete works!
  { ttl: 2 * 60 * 1000 }
);
```

### Method 2: From Cache Store
```typescript
import { globalCache } from '@/lib/cache';

export const getAnalyticsData = cacheResult(
  async () => {
    // Your function logic here
    return { data: 'example' };
  },
  globalCache,
  globalCache.KEYS.ANALYTICS.TABLE_COUNTS, // ✅ Autocomplete works!
  { ttl: 3 * 60 * 1000 }
);
```

### Method 3: From Any Cache Store
```typescript
import { tableCache } from '@/lib/cache';

export const getTableData = cacheResult(
  async () => {
    // Your function logic here
    return { data: 'example' };
  },
  tableCache,
  tableCache.KEYS.TABLES.MAPPINGS, // ✅ Autocomplete works!
  { ttl: 5 * 60 * 1000 }
);
```

## Benefits

1. **Type Safety**: TypeScript catches typos at compile time
2. **Autocomplete**: Full IntelliSense support in your IDE
3. **Centralized Management**: All keys in one place
4. **Easy Refactoring**: Change a key once, updates everywhere
5. **Consistency**: Ensures consistent naming across the app
6. **No Imports Needed**: Cache stores have KEYS built-in

## Adding New Keys

To add new cache keys, update the `CACHE_KEYS` constant in `src/lib/cache/keys.ts`:

```typescript
export const CACHE_KEYS = {
  // ... existing keys
  
  NEW_CATEGORY: {
    NEW_KEY: 'new-category-new-key',
    ANOTHER_KEY: 'new-category-another-key',
  },
} as const;
```

The `as const` assertion ensures TypeScript treats this as a readonly object with literal types.
