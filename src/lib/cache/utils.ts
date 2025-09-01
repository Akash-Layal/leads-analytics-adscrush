// Cache utility functions for common operations
import { CacheStore, CacheOptions } from './store';

// Cache decorator for functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheStore: CacheStore,
  keyGenerator: (...args: Parameters<T>) => string,
  options: Partial<CacheOptions> = {}
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = cacheStore.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, execute function and cache result
    const result = await fn(...args);
    cacheStore.set(cacheKey, result, options);
    
    return result;
  }) as T;
}

// Generate cache key from function name and arguments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateCacheKey(fnName: string, ...args: any[]): string {
  const argsStr = args
    .map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg);
      }
      return String(arg);
    })
    .join(':');
  
  return `${fnName}:${argsStr}`;
}

// Cache with automatic key generation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cacheResult<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheStore: CacheStore,
  fnName: string,
  options: Partial<CacheOptions> = {}
): T {
  return withCache(fn, cacheStore, (...args) => generateCacheKey(fnName, ...args), options);
}

// Batch cache operations
export async function batchCacheGet<T>(
  cacheStore: CacheStore,
  keys: string[]
): Promise<Map<string, T | null>> {
  const results = new Map<string, T | null>();
  
  for (const key of keys) {
    const cached = cacheStore.get<T>(key);
    results.set(key, cached);
  }
  
  return results;
}

export async function batchCacheSet<T>(
  cacheStore: CacheStore,
  entries: Array<{ key: string; data: T; options?: Partial<CacheOptions> }>
): Promise<void> {
  for (const { key, data, options } of entries) {
    cacheStore.set(key, data, options);
  }
}

// Cache invalidation helpers
export function invalidateCachePattern(
  cacheStore: CacheStore,
  pattern: string | RegExp
): number {
  let deletedCount = 0;
  
  if (typeof pattern === 'string') {
    // Simple string pattern matching
    for (const key of cacheStore['store'].keys()) {
      if (key.includes(pattern)) {
        cacheStore.delete(key);
        deletedCount++;
      }
    }
  } else {
    // Regex pattern matching
    for (const key of cacheStore['store'].keys()) {
      if (pattern.test(key)) {
        cacheStore.delete(key);
        deletedCount++;
      }
    }
  }
  
  return deletedCount;
}

// Cache warming utilities
export async function warmCache<T>(
  cacheStore: CacheStore,
  keys: string[],
  dataFetcher: (key: string) => Promise<T>,
  options: Partial<CacheOptions> = {}
): Promise<void> {
  const promises = keys.map(async (key) => {
    try {
      const data = await dataFetcher(key);
      cacheStore.set(key, data, options);
    } catch (error) {
      console.warn(`Failed to warm cache for key ${key}:`, error);
    }
  });
  
  await Promise.allSettled(promises);
}

// Cache statistics helpers
export function getCacheEfficiency(cacheStore: CacheStore): {
  hitRate: number;
  missRate: number;
  efficiency: string;
} {
  const stats = cacheStore.getStats();
  if (!stats) {
    return { hitRate: 0, missRate: 0, efficiency: 'No data' };
  }
  
  const hitRate = stats.hitRate;
  const missRate = 100 - hitRate;
  let efficiency = 'Poor';
  
  if (hitRate >= 80) efficiency = 'Excellent';
  else if (hitRate >= 60) efficiency = 'Good';
  else if (hitRate >= 40) efficiency = 'Fair';
  else if (hitRate >= 20) efficiency = 'Poor';
  
  return { hitRate, missRate, efficiency };
}

// Cache health check
export function checkCacheHealth(cacheStore: CacheStore): {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
} {
  const stats = cacheStore.getStats();
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!stats) {
    return {
      healthy: false,
      issues: ['No cache statistics available'],
      recommendations: ['Check cache initialization']
    };
  }
  
  // Check hit rate
  if (stats.hitRate < 20) {
    issues.push(`Low cache hit rate: ${stats.hitRate.toFixed(1)}%`);
    recommendations.push('Consider increasing TTL or improving cache keys');
  }
  
  // Check cache size
  if (stats.size > stats.maxSize * 0.9) {
    issues.push(`Cache nearly full: ${stats.size}/${stats.maxSize}`);
    recommendations.push('Consider increasing maxSize or reducing TTL');
  }
  
  // Check if cache is being used
  if (stats.totalRequests === 0) {
    issues.push('Cache not being used');
    recommendations.push('Verify cache integration in data fetching functions');
  }
  
  const healthy = issues.length === 0;
  
  return { healthy, issues, recommendations };
}
