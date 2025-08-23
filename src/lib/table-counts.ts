"use server";
import { sql } from "drizzle-orm";
import { db } from "@/db/readreplica";

// Configuration constants
const BATCH_SIZE = 5; // Process tables in batches to avoid overwhelming the connection pool
const MIN_DELAY = 100;
const MAX_DELAY = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const MAX_CONCURRENT_BATCHES = 2;
const CACHE_TTL = 300000; // 5 minutes
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

// Type definitions for database results
interface TableNameRow {
  table_name: string;
}

interface CountRow {
  count: number | string;
}

interface SizeRow {
  size_mb: number | string;
}

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface TableStats {
  tableName: string;
  count: number;
  sizeMB: number;
}

// Performance metrics
const metrics = {
  totalQueries: 0,
  successfulQueries: 0,
  failedQueries: 0,
  averageResponseTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  totalCacheRequests: 0
};

// Simple in-memory cache with TTL
const cache = new Map<string, CacheEntry<unknown>>();

// Circuit breaker implementation
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 30000; // 30 seconds

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - too many failures');
      }
    }

    try {
      const result = await fn();
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failures;
  }
}

// Global circuit breaker instance
const circuitBreaker = new CircuitBreaker();

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getCachedResult<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    metrics.cacheHits++;
    return cached.data as T;
  }
  if (cached) {
    cache.delete(key);
  }
  metrics.cacheMisses++;
  return null;
}

function setCachedResult(key: string, data: any, ttl: number = CACHE_TTL): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

function updateMetrics(success: boolean, responseTime: number): void {
  metrics.totalQueries++;
  if (success) {
    metrics.successfulQueries++;
  } else {
    metrics.failedQueries++;
  }

  metrics.averageResponseTime = 
    (metrics.averageResponseTime * (metrics.totalQueries - 1) + responseTime) / metrics.totalQueries;
}

// Database health check
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const startTime = Date.now();
    await db.execute(sql`SELECT 1`);
    const responseTime = Date.now() - startTime;
    updateMetrics(true, responseTime);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    updateMetrics(false, 0);
    return false;
  }
}

// Clean up cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        cache.delete(key);
      }
    }
  }, HEALTH_CHECK_INTERVAL);
}

// Function to get all table names from the database dynamically
async function getAllTableNames(): Promise<string[]> {
  const cacheKey = 'all_table_names';
  const cached = getCachedResult(cacheKey);
  if (cached !== null) return cached;

  try {
    const startTime = Date.now();
    const result = await circuitBreaker.execute(() => 
      db.execute(
        sql`SELECT TABLE_NAME as table_name 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_type = 'BASE TABLE'
            ORDER BY TABLE_NAME`
      )
    );
    const responseTime = Date.now() - startTime;
    updateMetrics(true, responseTime);

    // Handle the nested array structure that MySQL returns
    let tableNames: string[] = [];

    if (Array.isArray(result) && result.length > 0) {
      // If result is an array of arrays, flatten it
      if (Array.isArray(result[0])) {
        tableNames = result[0].map((row: TableNameRow) => {
          if (row && typeof row.table_name === 'string') {
            return row.table_name;
          }
          return null;
        }).filter(Boolean);
      } else {
        // If result is a flat array of objects
        tableNames = result.map((row: TableNameRow) => {
          if (row && typeof row.table_name === 'string') {
            return row.table_name;
          }
          return null;
        }).filter(Boolean);
      }
    }

    // Cache table names for 10 minutes since they don't change often
    setCachedResult(cacheKey, tableNames, 600000);
    return tableNames;
  } catch (error) {
    console.error("Error fetching table names:", error);
    updateMetrics(false, 0);
    return [];
  }
}

// Function to get count for a specific table by name with retry logic
async function getTableCountByName(tableName: string, retryCount = 0): Promise<number> {
  const cacheKey = `count_${tableName}`;
  const cached = getCachedResult(cacheKey);
  if (cached !== null) return cached;

  try {
    const startTime = Date.now();
    const result = await circuitBreaker.execute(() =>
      db.execute(
        sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`
      )
    );
    const responseTime = Date.now() - startTime;
    updateMetrics(true, responseTime);

    // Handle the nested array structure that MySQL returns
    let count = 0;

    if (Array.isArray(result) && result.length > 0) {
      // If result is an array of arrays, get the first array
      if (Array.isArray(result[0])) {
        const firstRow = (result[0] as CountRow[])[0];
        if (firstRow && typeof firstRow.count === 'number') {
          count = firstRow.count;
        } else if (firstRow && typeof firstRow.count === 'string') {
          count = parseInt(firstRow.count, 10);
        }
      } else {
        // If result is a flat array of objects
        const firstRow = (result[0] as CountRow);
        if (firstRow && typeof firstRow.count === 'number') {
          count = firstRow.count;
        } else if (firstRow && typeof firstRow.count === 'string') {
          count = parseInt(firstRow.count, 10);
        }
      }
    }

    const finalCount = isNaN(count) ? 0 : count;
    
    // Cache count for 5 minutes
    setCachedResult(cacheKey, finalCount, CACHE_TTL);
    
    return finalCount;
  } catch (error) {
    console.error(`Error counting table ${tableName} (attempt ${retryCount + 1}):`, error);
    updateMetrics(false, 0);

    // Retry logic for queue limit errors
    if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('Queue limit')) {
      console.log(`Retrying table ${tableName} in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      return getTableCountByName(tableName, retryCount + 1);
    }

    return 0;
  }
}

// Process tables in batches to avoid overwhelming the connection pool
async function processTableBatch(tableNames: string[], processor: (tableName: string) => Promise<any>): Promise<any[]> {
  const results: any[] = [];

  for (const tableName of tableNames) {
    try {
      const result = await processor(tableName);
      results.push(result);
    } catch (error) {
      console.error(`Error processing table ${tableName}:`, error);
      // Add fallback result
      results.push({ tableName, count: 0, sizeMB: 0 });
    }
  }

  return results;
}

// Adaptive delay based on response time
let currentDelay = 300; // Start with 300ms

async function processBatchWithAdaptiveDelay(batch: string[], processor: Function) {
  const startTime = Date.now();
  const results = await processTableBatch(batch, processor);
  const processingTime = Date.now() - startTime;

  // Adjust delay based on processing time
  if (processingTime > 2000) {
    currentDelay = Math.min(currentDelay + 100, MAX_DELAY);
  } else if (processingTime < 500) {
    currentDelay = Math.max(currentDelay - 50, MIN_DELAY);
  }

  return results;
}

// Process multiple batches in parallel with controlled concurrency
async function processBatchesInParallel(tableNames: string[], processor: Function) {
  const batches: string[][] = [];
  for (let i = 0; i < tableNames.length; i += BATCH_SIZE) {
    batches.push(tableNames.slice(i, i + BATCH_SIZE));
  }

  const results: any[] = [];
  for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
    const currentBatches = batches.slice(i, i + MAX_CONCURRENT_BATCHES);
    const batchResults = await Promise.all(
      currentBatches.map(batch => processBatchWithAdaptiveDelay(batch, processor))
    );
    results.push(...batchResults.flat());

    if (i + MAX_CONCURRENT_BATCHES < batches.length) {
      await delay(currentDelay);
    }
  }

  return results;
}

// Get all table counts with batching to avoid connection pool issues
export async function getAllTableCounts() {
  if (!(await checkDatabaseHealth())) {
    console.warn('Database health check failed, returning cached results');
    return [];
  }

  try {
    const tableNames = await getAllTableNames();

    if (tableNames.length === 0) {
      return [];
    }

    const results: Array<{ tableName: string; count: number }> = [];

    // Use parallel processing with controlled concurrency
    const batchResults = await processBatchesInParallel(tableNames, async (tableName: string) => {
      const count = await getTableCountByName(tableName);
      return { tableName, count };
    });

    results.push(...batchResults);

    return results;
  } catch (error) {
    console.error("Error in getAllTableCounts:", error);
    return [];
  }
}

export async function getTotalCount() {
  try {
    const counts = await getAllTableCounts();
    return counts.reduce((total, { count }) => total + count, 0);
  } catch (error) {
    console.error("Error in getTotalCount:", error);
    return 0;
  }
}

// Get count for a specific table by name
export async function getTableCount(tableName: string) {
  try {
    return await getTableCountByName(tableName);
  } catch (error) {
    console.error(`Error in getTableCount for ${tableName}:`, error);
    return 0;
  }
}

// Get all table names
export async function getTableNames() {
  try {
    return await getAllTableNames();
  } catch (error) {
    console.error("Error in getTableNames:", error);
    return [];
  }
}

// Get table counts with additional info (like table size, last updated, etc.)
export async function getTableStats() {
  if (!(await checkDatabaseHealth())) {
    console.warn('Database health check failed, returning cached results');
    return [];
  }

  try {
    const tableNames = await getAllTableNames();

    if (tableNames.length === 0) {
      return [];
    }

    const results: Array<TableStats> = [];

    // Use parallel processing with controlled concurrency
    const batchResults = await processBatchesInParallel(tableNames, async (tableName: string) => {
      try {
        // Get count and size info in parallel for each table
        const [countResult, sizeResult] = await Promise.all([
          db.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`),
          db.execute(sql`SELECT 
            ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = ${tableName}`)
        ]);

        // Parse count result
        let count = 0;
        if (Array.isArray(countResult) && countResult.length > 0) {
          if (Array.isArray(countResult[0])) {
            const firstRow = (countResult[0] as CountRow[])[0];
            if (firstRow && typeof firstRow.count === 'number') {
              count = firstRow.count;
            } else if (firstRow && typeof firstRow.count === 'string') {
              count = parseInt(firstRow.count, 10);
            }
          } else {
            const firstRow = (countResult[0] as CountRow);
            if (firstRow && typeof firstRow.count === 'number') {
              count = firstRow.count;
            } else if (firstRow && typeof firstRow.count === 'string') {
              count = parseInt(firstRow.count, 10);
            }
          }
        }

        // Parse size result
        let sizeMB = 0;
        if (Array.isArray(sizeResult) && sizeResult.length > 0) {
          if (Array.isArray(sizeResult[0])) {
            const firstRow = (sizeResult[0] as SizeRow[])[0];
            if (firstRow && typeof firstRow.size_mb === 'number') {
              sizeMB = firstRow.size_mb;
            } else if (firstRow && typeof firstRow.size_mb === 'string') {
              sizeMB = parseFloat(firstRow.size_mb);
            }
          } else {
            const firstRow = (sizeResult[0] as SizeRow);
            if (firstRow && typeof firstRow.size_mb === 'number') {
              sizeMB = firstRow.size_mb;
            } else if (firstRow && typeof firstRow.size_mb === 'string') {
              sizeMB = parseFloat(firstRow.size_mb);
            }
          }
        }

        return {
          tableName,
          count: isNaN(count) ? 0 : count,
          sizeMB: isNaN(sizeMB) ? 0 : sizeMB
        };
      } catch (error) {
        console.error(`Error getting stats for table ${tableName}:`, error);
        return { tableName, count: 0, sizeMB: 0 };
      }
    });

    results.push(...batchResults);

    return results;
  } catch (error) {
    console.error("Error in getTableStats:", error);
    return [];
  }
}

// Export metrics for monitoring
export async function getMetrics() {
  return {
    ...metrics,
    cacheHitRate: metrics.totalCacheRequests > 0 ? (metrics.cacheHits / metrics.totalCacheRequests) * 100 : 0,
    circuitBreakerState: circuitBreaker.getState(),
    circuitBreakerFailures: circuitBreaker.getFailureCount(),
    cacheSize: cache.size
  };
}

// Export circuit breaker status
export async function getCircuitBreakerStatus() {
  return {
    state: circuitBreaker.getState(),
    failureCount: circuitBreaker.getFailureCount()
  };
}

// Clear cache function for manual cache management
export async function clearCache(): Promise<void> {
  cache.clear();
  console.log('Cache cleared');
}

// Preload cache with frequently accessed data
export async function preloadCache(): Promise<void> {
  try {
    console.log('Preloading cache...');
    await getAllTableNames(); // This will cache table names
    console.log('Cache preloaded successfully');
  } catch (error) {
    console.error('Error preloading cache:', error);
  }
}
