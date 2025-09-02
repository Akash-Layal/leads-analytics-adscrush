"use server";
// Cache management service
import { 
  globalCache, 
  tableCache, 
  clientCache, 
  dashboardCache, 
  analyticsCache,
  CacheStore 
} from '@/lib/cache';

// Cache management service
export class CacheManagementService {
  private static instance: CacheManagementService;
  private caches: Map<string, CacheStore>;

  private constructor() {
    this.caches = new Map([
      ['global', globalCache],
      ['tables', tableCache],
      ['clients', clientCache],
      ['dashboard', dashboardCache],
      ['analytics', analyticsCache],
    ]);
  }

  public static getInstance(): CacheManagementService {
    if (!CacheManagementService.instance) {
      CacheManagementService.instance = new CacheManagementService();
    }
    return CacheManagementService.instance;
  }

  // Get cache by namespace
  public getCache(namespace: string): CacheStore | undefined {
    return this.caches.get(namespace);
  }

  // Get all caches
  public getAllCaches(): Map<string, CacheStore> {
    return new Map(this.caches);
  }

  // Clear specific cache namespace
  public clearCache(namespace: string): boolean {
    const cache = this.caches.get(namespace);
    if (cache) {
      cache.clear(namespace);
      return true;
    }
    return false;
  }

  // Clear all caches
  public clearAllCaches(): void {
    this.caches.forEach(cache => cache.clear());
  }

  // Get cache statistics for all namespaces
  public getAllCacheStats(): Record<string, Map<string, import('@/lib/cache').CacheStats>> {
    const stats: Record<string, Map<string, import('@/lib/cache').CacheStats>> = {};
    
    this.caches.forEach((cache, namespace) => {
      stats[namespace] = cache.getAllStats();
    });
    
    return stats;
  }

  // Get cache health for all namespaces
  public getAllCacheHealth(): Record<string, {
    healthy: boolean;
    hitRate: number;
    size: number;
    maxSize: number;
    totalRequests: number;
  }> {
    const health: Record<string, {
      healthy: boolean;
      hitRate: number;
      size: number;
      maxSize: number;
      totalRequests: number;
    }> = {};
    
    this.caches.forEach((cache, namespace) => {
      const cacheStats = cache.getAllStats();
      cacheStats.forEach((stats, cacheNamespace) => {
        health[`${namespace}:${cacheNamespace}`] = {
          healthy: stats.hitRate >= 20,
          hitRate: stats.hitRate,
          size: stats.size,
          maxSize: stats.maxSize,
          totalRequests: stats.totalRequests
        };
      });
    });
    
    return health;
  }

  // Warm all caches
  public async warmAllCaches(): Promise<void> {
    try {
      console.log('Starting cache warming process...');
      
      const warmingPromises: Promise<void>[] = [];
      
      // Warm each cache namespace
      this.caches.forEach((cache, namespace) => {
        console.log(`Warming ${namespace} cache...`);
        // Note: Individual cache warming would be implemented in each service
      });
      
      await Promise.allSettled(warmingPromises);
      console.log('Cache warming completed');
    } catch (error) {
      console.error('Error during cache warming:', error);
    }
  }

  // Get cache performance metrics
  public getCachePerformanceMetrics(): Record<string, {
    totalHits: number;
    totalMisses: number;
    totalRequests: number;
    overallHitRate: number;
    efficiency: string;
  }> {
    const metrics: Record<string, {
      totalHits: number;
      totalMisses: number;
      totalRequests: number;
      overallHitRate: number;
      efficiency: string;
    }> = {};
    
    this.caches.forEach((cache, namespace) => {
      const cacheStats = cache.getAllStats();
      let totalHits = 0;
      let totalMisses = 0;
      let totalRequests = 0;
      
      cacheStats.forEach((stats) => {
        totalHits += stats.hits;
        totalMisses += stats.misses;
        totalRequests += stats.totalRequests;
      });
      
      const overallHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
      
      metrics[namespace] = {
        totalHits,
        totalMisses,
        totalRequests,
        overallHitRate: parseFloat(overallHitRate.toFixed(2)),
        efficiency: this.getEfficiencyRating(overallHitRate)
      };
    });
    
    return metrics;
  }

  // Get efficiency rating
  private getEfficiencyRating(hitRate: number): string {
    if (hitRate >= 80) return 'Excellent';
    if (hitRate >= 60) return 'Good';
    if (hitRate >= 40) return 'Fair';
    if (hitRate >= 20) return 'Poor';
    return 'Very Poor';
  }

  // Export cache data for debugging
  public exportCacheData(): Record<string, Record<string, unknown>> {
    const exportData: Record<string, Record<string, unknown>> = {};
    
    this.caches.forEach((cache, namespace) => {
      exportData[namespace] = cache.export();
    });
    
    return exportData;
  }

  // Reset all caches
  public resetAllCaches(): void {
    this.caches.forEach(cache => cache.clear());
    console.log('All caches have been reset');
  }

  // Get cache recommendations
  public getCacheRecommendations(): string[] {
    const recommendations: string[] = [];
    const health = this.getAllCacheHealth();
    
    Object.entries(health).forEach(([cacheKey, cacheHealth]) => {
      if (cacheHealth.hitRate < 20) {
        recommendations.push(`Consider increasing TTL for ${cacheKey} (hit rate: ${cacheHealth.hitRate.toFixed(1)}%)`);
      }
      
      if (cacheHealth.size > cacheHealth.maxSize * 0.9) {
        recommendations.push(`Consider increasing maxSize for ${cacheKey} (${cacheHealth.size}/${cacheHealth.maxSize})`);
      }
      
      if (cacheHealth.totalRequests === 0) {
        recommendations.push(`Cache ${cacheKey} is not being used - verify integration`);
      }
    });
    
    return recommendations;
  }
}

// Export singleton instance
export const cacheManagementService = CacheManagementService.getInstance();

// Utility functions for common cache operations
export const clearAllCaches = () => cacheManagementService.clearAllCaches();
export const getCacheStats = () => cacheManagementService.getAllCacheStats();
export const getCacheHealth = () => cacheManagementService.getAllCacheHealth();
export const warmAllCaches = () => cacheManagementService.warmAllCaches();
export const getCachePerformance = () => cacheManagementService.getCachePerformanceMetrics();
export const getCacheRecommendations = () => cacheManagementService.getCacheRecommendations();
export const exportCacheData = () => cacheManagementService.exportCacheData();
export const resetAllCaches = () => cacheManagementService.resetAllCaches();
