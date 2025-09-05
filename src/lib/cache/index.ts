// Main cache module exports
export * from './store';
export * from './utils';
export * from './keys';

// Re-export commonly used cache instances
export { 
  globalCache, 
  tableCache, 
  clientCache, 
  dashboardCache, 
  analyticsCache 
} from './store';

// Re-export commonly used utilities
export { 
  withCache, 
  cacheResult, 
  generateCacheKey,
  batchCacheGet,
  batchCacheSet,
  invalidateCachePattern,
  warmCache,
  getCacheEfficiency,
  checkCacheHealth
} from './utils';
