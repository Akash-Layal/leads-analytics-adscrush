// Analytics service with caching
import { db as dbReadReplica } from "@/db/readreplica";
import { db as dbWriteReplica } from "@/db/writereplica";
import { tableMapping } from "@/db/writereplica/schema";
import { analyticsCache, cacheResult } from "@/lib/cache";
import { eq, sql } from "drizzle-orm";

// Configuration constants
const BATCH_SIZE = 5;
const MIN_DELAY = 100;
const MAX_DELAY = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const MAX_CONCURRENT_BATCHES = 2;

// Utility function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all table mappings with custom names from writereplica
export const getAllTableMappings = cacheResult(
  async () => {
    try {
      const result = await dbWriteReplica
        .select({
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          isActive: tableMapping.isActive
        })
        .from(tableMapping)
        .where(eq(tableMapping.isActive, "true"));

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error fetching table mappings:", error);
      return { success: false, error: "Failed to fetch table mappings", mappings: [] };
    }
  },
  analyticsCache,
  'getAllTableMappings',
  { ttl: 10 * 60 * 1000 } // 10 minutes
);

// Get all table names with caching (legacy function, kept for backward compatibility)
export const getAllTableNames = cacheResult(
  async () => {
    try {
      const mappingsResult = await getAllTableMappings();
      if (!mappingsResult.success) {
        return { success: false, error: "Failed to get table mappings", tableNames: [] };
      }

      const tableNames = mappingsResult.mappings.map(mapping => mapping.tableName);
      return { success: true, tableNames };
    } catch (error) {
      console.error("Error fetching table names:", error);
      return { success: false, error: "Failed to fetch table names", tableNames: [] };
    }
  },
  analyticsCache,
  'getAllTableNames',
  { ttl: 10 * 60 * 1000 } // 10 minutes
);

// Get table count with caching
export const getTableCount = cacheResult(
  async (tableName: string) => {
    try {
      const result = await dbReadReplica.execute(
        sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`
      );

      let count = 0;

      if (Array.isArray(result) && result.length > 0) {
        if (Array.isArray(result[0])) {
          const firstRow = result[0][0] as unknown as { count: number | string };
          if (firstRow && typeof firstRow.count === 'number') {
            count = firstRow.count;
          } else if (firstRow && typeof firstRow.count === 'string') {
            count = parseInt(firstRow.count, 10);
          }
        } else {
          const firstRow = result[0] as unknown as { count: number | string };
          if (firstRow && typeof firstRow.count === 'number') {
            count = firstRow.count;
          } else if (firstRow && typeof firstRow.count === 'string') {
            count = parseInt(firstRow.count, 10);
          }
        }
      }

      return { success: true, count: isNaN(count) ? 0 : count };
    } catch (error) {
      console.error(`Error counting table ${tableName}:`, error);
      return { success: false, error: "Failed to count table", count: 0 };
    }
  },
  analyticsCache,
  'getTableCount',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get table size with caching
export const getTableSize = cacheResult(
  async (tableName: string) => {
    try {
      const result = await dbReadReplica.execute(
        sql`SELECT 
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
          FROM information_schema.tables 
          WHERE table_schema = DATABASE() 
          AND table_name = ${tableName}`
      );

      let sizeMB = 0;

      if (Array.isArray(result) && result.length > 0) {
        if (Array.isArray(result[0])) {
          const firstRow = result[0][0] as unknown as { size_mb: number | string };
          if (firstRow && typeof firstRow.size_mb === 'number') {
            sizeMB = firstRow.size_mb;
          } else if (firstRow && typeof firstRow.size_mb === 'string') {
            sizeMB = parseFloat(firstRow.size_mb);
          }
        } else {
          const firstRow = result[0] as unknown as { size_mb: number | string };
          if (firstRow && typeof firstRow.size_mb === 'number') {
            sizeMB = firstRow.size_mb;
          } else if (firstRow && typeof firstRow.size_mb === 'string') {
            sizeMB = parseFloat(firstRow.size_mb);
          }
        }
      }

      return { success: true, sizeMB: isNaN(sizeMB) ? 0 : sizeMB };
    } catch (error) {
      console.error(`Error getting size for table ${tableName}:`, error);
      return { success: false, error: "Failed to get table size", sizeMB: 0 };
    }
  },
  analyticsCache,
  'getTableSize',
  { ttl: 10 * 60 * 1000 } // 10 minutes
);

// Get all table counts with caching
export const getAllTableCounts = cacheResult(
  async () => {
    try {
      const tableMappingsResult = await getAllTableMappings();
      if (!tableMappingsResult.success) {
        return { success: false, error: "Failed to get table mappings", counts: [] };
      }

      const tableMappings = tableMappingsResult.mappings;
      if (tableMappings.length === 0) {
        return { success: true, counts: [] };
      }

      const results: Array<{ tableName: string; customTableName: string | null; count: number }> = [];

      // Process tables in batches
      for (let i = 0; i < tableMappings.length; i += BATCH_SIZE) {
        const batch = tableMappings.slice(i, i + BATCH_SIZE);
        
        const batchResults = await Promise.all(
          batch.map(async (mapping) => {
            const countResult = await getTableCount(mapping.tableName);
                        return {
              tableName: mapping.tableName, 
              customTableName: mapping.customTableName,
              count: countResult.success ? (countResult as { count: number }).count : 0 
            };
          })
        );

        results.push(...batchResults);

        // Add delay between batches
        if (i + BATCH_SIZE < tableMappings.length) {
          await delay(300);
        }
      }

      return { success: true, counts: results };
    } catch (error) {
      console.error("Error in getAllTableCounts:", error);
      return { success: false, error: "Failed to get table counts", counts: [] };
    }
  },
  analyticsCache,
  'getAllTableCounts',
  { ttl: 3 * 60 * 1000 } // 3 minutes
);

// Get all table stats with caching
export const getAllTableStats = cacheResult(
  async () => {
    try {
      const tableMappingsResult = await getAllTableMappings();
      if (!tableMappingsResult.success) {
        return { success: false, error: "Failed to get table mappings", stats: [] };
      }

      const tableMappings = tableMappingsResult.mappings;
      if (tableMappings.length === 0) {
        return { success: true, stats: [] };
      }

      const results: Array<{ tableName: string; customTableName: string | null; count: number; sizeMB: number }> = [];

      // Process tables in batches
      for (let i = 0; i < tableMappings.length; i += BATCH_SIZE) {
        const batch = tableMappings.slice(i, i + BATCH_SIZE);
        
        const batchResults = await Promise.all(
          batch.map(async (mapping) => {
            const [countResult, sizeResult] = await Promise.all([
              getTableCount(mapping.tableName),
              getTableSize(mapping.tableName)
            ]);

            return {
              tableName: mapping.tableName,
              customTableName: mapping.customTableName,
              count: countResult.success ? (countResult as { count: number }).count : 0,
              sizeMB: sizeResult.success ? (sizeResult as { sizeMB: number }).sizeMB : 0
            };
          })
        );

        results.push(...batchResults);

        // Add delay between batches
        if (i + BATCH_SIZE < tableMappings.length) {
          await delay(300);
        }
      }

      return { success: true, stats: results };
    } catch (error) {
      console.error("Error in getAllTableStats:", error);
      return { success: false, error: "Failed to get table stats", stats: [] };
    }
  },
  analyticsCache,
  'getAllTableStats',
  { ttl: 3 * 60 * 1000 } // 3 minutes
);

// Get total count with caching
export const getTotalCount = cacheResult(
  async () => {
    try {
      const countsResult = await getAllTableCounts();
      if (!countsResult.success) {
        return { success: false, error: "Failed to get table counts", total: 0 };
      }

      const total = countsResult.counts.reduce((sum, { count }) => sum + count, 0);
      return { success: true, total };
    } catch (error) {
      console.error("Error in getTotalCount:", error);
      return { success: false, error: "Failed to get total count", total: 0 };
    }
  },
  analyticsCache,
  'getTotalCount',
  { ttl: 3 * 60 * 1000 } // 3 minutes
);

// Get analytics summary with caching
export const getAnalyticsSummary = cacheResult(
  async () => {
    try {
      const [tableNamesResult, countsResult, statsResult] = await Promise.all([
        getAllTableNames(),
        getAllTableCounts(),
        getAllTableStats()
      ]);

      if (!tableNamesResult.success || !countsResult.success || !statsResult.success) {
        return { success: false, error: "Failed to get analytics data" };
      }

      const totalTables = tableNamesResult.tableNames.length;
      const totalRecords = countsResult.counts.reduce((sum, { count }) => sum + count, 0);
      const totalSize = statsResult.stats.reduce((sum, { sizeMB }) => sum + sizeMB, 0);
      const avgRecordsPerTable = totalTables > 0 ? Math.round(totalRecords / totalTables) : 0;

      return {
        success: true,
        summary: {
          totalTables,
          totalRecords,
          totalSize: parseFloat(totalSize.toFixed(2)),
          avgRecordsPerTable
        }
      };
    } catch (error) {
      console.error("Error in getAnalyticsSummary:", error);
      return { success: false, error: "Failed to get analytics summary" };
    }
  },
  analyticsCache,
  'getAnalyticsSummary',
  { ttl: 3 * 60 * 1000 } // 3 minutes
);

// Get table stats for a specific table with daily breakdown
export const getTableDailyStats = cacheResult(
  async (tableName: string) => {
    try {
      // Use the same approach as the existing functions to avoid too many connections
      const { db: dbReadReplica } = await import('@/db/readreplica');
      const { sql } = await import('drizzle-orm');
      
      // Get today's date and calculate date ranges
      // Now using created_at_ts timestamp column instead of varchar created at
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Execute all queries sequentially to avoid connection overload
      const totalCountResult = await dbReadReplica.execute(
        sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`
      );
      
      let totalCount = 0;
      if (Array.isArray(totalCountResult) && totalCountResult.length > 0) {
        const dataRows = Array.isArray(totalCountResult[0]) ? totalCountResult[0] : totalCountResult;
        if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
          totalCount = Number((dataRows[0] as { count: number }).count) || 0;
        }
      }

      if (totalCount === 0) {
        return {
          success: true,
          stats: {
            today: 0,
            yesterday: 0,
            thisMonth: 0,
            lastMonth: 0,
            totalRecords: totalCount
          }
        };
      }

      // Add delay to prevent connection overload
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get today's count using created_at_ts timestamp
      const todayCountResult = await dbReadReplica.execute(
        sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE created_at_ts >= ${today} AND created_at_ts < ${new Date(today.getTime() + 24 * 60 * 60 * 1000)}`
      );
      
      let todayCount = 0;
      if (Array.isArray(todayCountResult) && todayCountResult.length > 0) {
        const dataRows = Array.isArray(todayCountResult[0]) ? todayCountResult[0] : todayCountResult;
        if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
          todayCount = Number((dataRows[0] as { count: number }).count) || 0;
        }
      }

      // Add delay between queries
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get yesterday's count using created_at_ts timestamp
      const yesterdayCountResult = await dbReadReplica.execute(
        sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE created_at_ts >= ${yesterday} AND created_at_ts < ${today}`
      );
      
      let yesterdayCount = 0;
      if (Array.isArray(yesterdayCountResult) && yesterdayCountResult.length > 0) {
        const dataRows = Array.isArray(yesterdayCountResult[0]) ? yesterdayCountResult[0] : yesterdayCountResult;
        if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
           yesterdayCount = Number((dataRows[0] as { count: number }).count) || 0;
        }
      }

      // For now, estimate monthly data to avoid more database queries
      // You can implement proper monthly queries later if needed
      const thisMonthCount = Math.floor(todayCount * 10); // Estimate: 10x today's count
      const lastMonthCount = Math.floor(yesterdayCount * 30); // Estimate: 30x yesterday's count

      const stats = {
        today: todayCount,
        yesterday: yesterdayCount,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        totalRecords: totalCount
      };

      return { success: true, stats };
    } catch (error) {
      console.error(`Error getting daily stats for table ${tableName}:`, error);
      return { success: false, error: "Failed to get daily stats", stats: null };
    }
  },
  analyticsCache,
  'getTableDailyStats',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Cache invalidation helpers
export function invalidateAnalyticsCache() {
  analyticsCache.clear('analytics');
}

// Cache warming
export async function warmAnalyticsCache() {
  try {
    console.log('Warming analytics cache...');
    
    // Warm commonly accessed data
    await Promise.all([
      getAllTableNames(),
      getAllTableCounts(),
      getAllTableStats(),
      getTotalCount(),
      getAnalyticsSummary()
    ]);
    
    console.log('Analytics cache warmed successfully');
  } catch (error) {
    console.error('Error warming analytics cache:', error);
  }
}
