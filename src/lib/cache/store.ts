// Centralized Cache Store for the entire application
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  version?: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  version?: string; // Cache version for invalidation
  maxSize?: number; // Maximum number of entries
  namespace?: string; // Namespace for grouping related caches
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  size: number;
  maxSize: number;
  namespace: string;
}

export class CacheStore {
  private store: Map<string, CacheEntry> = new Map();
  private stats: Map<string, CacheStats> = new Map();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      version: '1.0.0',
      maxSize: 1000, // 1000 entries default
      namespace: 'default',
      ...options
    };

    this.initializeStats();
    this.startCleanupInterval();
  }

  private initializeStats(): void {
    this.stats.set(this.options.namespace, {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      size: 0,
      maxSize: this.options.maxSize,
      namespace: this.options.namespace
    });
  }

  private updateStats(key: string, hit: boolean): void {
    const stats = this.stats.get(this.options.namespace);
    if (stats) {
      stats.totalRequests++;
      if (hit) {
        stats.hits++;
      } else {
        stats.misses++;
      }
      stats.hitRate = (stats.hits / stats.totalRequests) * 100;
      stats.size = this.store.size;
    }
  }

  private generateKey(key: string, namespace?: string): string {
    const ns = namespace || this.options.namespace;
    return `${ns}:${key}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private enforceMaxSize(): void {
    if (this.store.size >= this.options.maxSize) {
      // Remove oldest entries (LRU-like behavior)
      const entries = Array.from(this.store.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove 20% of oldest entries
      const toRemove = Math.ceil(this.options.maxSize * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.store.delete(entries[i][0]);
      }
    }
  }

  // Set cache entry
  set<T>(key: string, data: T, options: Partial<CacheOptions> = {}): void {
    const fullKey = this.generateKey(key, options.namespace);
    const ttl = options.ttl || this.options.ttl;
    const version = options.version || this.options.version;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key: fullKey,
      version
    };

    this.store.set(fullKey, entry);
    this.enforceMaxSize();
  }

  // Get cache entry
  get<T>(key: string, namespace?: string): T | null {
    const fullKey = this.generateKey(key, namespace);
    const entry = this.store.get(fullKey) as CacheEntry<T> | undefined;

    if (!entry) {
      this.updateStats(fullKey, false);
      return null;
    }

    if (this.isExpired(entry)) {
      this.store.delete(fullKey);
      this.updateStats(fullKey, false);
      return null;
    }

    this.updateStats(fullKey, true);
    return entry.data;
  }

  // Check if key exists and is valid
  has(key: string, namespace?: string): boolean {
    const fullKey = this.generateKey(key, namespace);
    const entry = this.store.get(fullKey);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.store.delete(fullKey);
      return false;
    }

    return true;
  }

  // Delete cache entry
  delete(key: string, namespace?: string): boolean {
    const fullKey = this.generateKey(key, namespace);
    return this.store.delete(fullKey);
  }

  // Clear all cache entries
  clear(namespace?: string): void {
    if (namespace) {
      const ns = this.generateKey('', namespace);
      for (const key of this.store.keys()) {
        if (key.startsWith(ns)) {
          this.store.delete(key);
        }
      }
    } else {
      this.store.clear();
    }
    
    // Reset stats
    this.initializeStats();
  }

  // Get cache statistics
  getStats(namespace?: string): CacheStats | undefined {
    const ns = namespace || this.options.namespace;
    return this.stats.get(ns);
  }

  // Get all cache statistics
  getAllStats(): Map<string, CacheStats> {
    return new Map(this.stats);
  }

  // Invalidate cache by version
  invalidateByVersion(version: string): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.version === version) {
        this.store.delete(key);
      }
    }
  }

  // Get cache size
  size(namespace?: string): number {
    if (namespace) {
      const ns = this.generateKey('', namespace);
      let count = 0;
      for (const key of this.store.keys()) {
        if (key.startsWith(ns)) {
          count++;
        }
      }
      return count;
    }
    return this.store.size;
  }

  // Start automatic cleanup interval
  private startCleanupInterval(): void {
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.cleanup();
      }, 60000); // Clean up every minute
    }
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key);
      }
    }
  }

  // Export cache for debugging
  export(): Record<string, unknown> {
    return {
      store: Object.fromEntries(this.store),
      stats: Object.fromEntries(this.stats),
      options: this.options
    };
  }
}

// Global cache instance
export const globalCache = new CacheStore();

// Namespace-specific cache instances
export const tableCache = new CacheStore({ 
  namespace: 'tables', 
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 500 
});

export const clientCache = new CacheStore({ 
  namespace: 'clients', 
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 300 
});

export const dashboardCache = new CacheStore({ 
  namespace: 'dashboard', 
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 200 
});

export const analyticsCache = new CacheStore({ 
  namespace: 'analytics', 
  ttl: 3 * 60 * 1000, // 3 minutes
  maxSize: 150 
});
