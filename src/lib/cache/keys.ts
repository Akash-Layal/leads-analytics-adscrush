// Centralized cache keys for easy access and autocomplete
export const CACHE_KEYS = {
  // Dashboard related keys
  DASHBOARD: {
    DATA: 'dashboard-data',
    METRICS: 'dashboard-metrics',
    STATS: 'dashboard-stats',
    OVERVIEW: 'dashboard-overview',
  },
  
  // Analytics related keys
  ANALYTICS: {
    TABLE_COUNTS: 'analytics-table-counts',
    TOTAL_COUNT: 'analytics-total-count',
    TABLE_STATS: 'analytics-table-stats',
    PERFORMANCE: 'analytics-performance',
    GROWTH_DATA: 'analytics-growth-data',
  },
  
  // Client related keys
  CLIENTS: {
    LIST: 'clients-list',
    COUNT: 'clients-count',
    DETAILS: 'clients-details',
    STATUS: 'clients-status',
  },
  
  // Table related keys
  TABLES: {
    MAPPINGS: 'tables-mappings',
    COUNTS: 'tables-counts',
    STATS: 'tables-stats',
    RECORDS: 'tables-records',
  },
  
  // Table mapping specific keys
  TABLE_MAPPINGS: {
    ALL: 'table-mappings-all',
    BY_ID: 'table-mappings-by-id',
    BY_CLIENT: 'table-mappings-by-client',
    DISPLAY_NAME: 'table-mappings-display-name',
  },
  
  // Lead related keys
  LEADS: {
    TODAY: 'leads-today',
    YESTERDAY: 'leads-yesterday',
    THIS_WEEK: 'leads-this-week',
    LAST_WEEK: 'leads-last-week',
    THIS_MONTH: 'leads-this-month',
    LAST_MONTH: 'leads-last-month',
    TOTAL: 'leads-total',
    BY_TABLE: 'leads-by-table',
  },
  
  // Cache management keys
  CACHE: {
    STATS: 'cache-stats',
    HEALTH: 'cache-health',
    PERFORMANCE: 'cache-performance',
    RECOMMENDATIONS: 'cache-recommendations',
  },
} as const;

// Type for cache keys to ensure type safety
export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS][keyof typeof CACHE_KEYS[keyof typeof CACHE_KEYS]];
