'use server';

import { db as dbReadReplica } from "@/db/readreplica";
import { db as dbWriteReplica } from "@/db/writereplica";
import { client, tableMapping } from "@/db/writereplica/schema";
import { desc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

// TypeScript interfaces for dashboard data
export interface DashboardData {
  clients: Array<{
    xataId: string;
    name: string;
    email: string;
    phone: string | null;
    company: string;
    status: string;
    xataCreatedat: string;
    xataUpdatedat: string;
  }>;
  tableCounts: Array<{
    tableName: string;
    customTableName: string | null;
    count: number;
  }>;
  todayTableCounts: Array<{
    tableName: string;
    customTableName: string | null;
    count: number;
  }>;
  yesterdayTableCounts: Array<{
    tableName: string;
    customTableName: string | null;
    count: number;
  }>;
  last7DaysTableCounts: Array<{
    tableName: string;
    customTableName: string | null;
    count: number;
  }>;
  thisMonthTableCounts: Array<{
    tableName: string;
    customTableName: string | null;
    count: number;
  }>;
  lastMonthTableCounts: Array<{
    tableName: string;
    customTableName: string | null;
    count: number;
  }>;
  dailyStats: Array<{
    tableName: string;
    customTableName: string | null;
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    totalRecords: number;
    hasData: boolean;
  }>;
  totalTables: number;
  totalRecords: number;
  aggregatedStats: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
  };
}

export interface DashboardResult {
  success: true;
  data: DashboardData;
}

export interface DashboardError {
  success: false;
  error: string;
}

export type DashboardActionResult = DashboardResult | DashboardError;

// Cache for dashboard data (in-memory cache with TTL)
const cache = new Map<string, { data: DashboardActionResult; timestamp: number; ttl: number }>();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCachedData<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  cache.set(key, { data: data as DashboardActionResult, timestamp: Date.now(), ttl });
}

// Optimized function to get all dashboard data in parallel
export async function getDashboardDataAction(): Promise<DashboardActionResult> {
  const cacheKey = 'dashboard-data';
  const cached = getCachedData<DashboardActionResult>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Execute all queries in parallel for better performance
    const [clientsResult, tableMappingsResult] = await Promise.all([
      // Get all clients
      dbWriteReplica
        .select()
        .from(client)
        .orderBy(desc(client.xataCreatedat)),
      
      // Get all active table mappings with custom names
      dbWriteReplica
        .select({
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          isActive: tableMapping.isActive
        })
        .from(tableMapping)
        .where(eq(tableMapping.isActive, "true"))
    ]);

    // Extract active table names from mappings
    const allTables = tableMappingsResult.map(mapping => mapping.tableName);

    // Get table counts, today's counts, yesterday's counts, last 7 days counts, monthly counts, and daily stats in parallel
    const [countsResult, todayCountsResult, yesterdayCountsResult, last7DaysCountsResult, thisMonthCountsResult, lastMonthCountsResult, statsResult] = await Promise.all([
      getTableCountsOptimized(tableMappingsResult),
      getTodayTableCountsOptimized(tableMappingsResult),
      getYesterdayTableCountsOptimized(tableMappingsResult),
      getLast7DaysTableCountsOptimized(tableMappingsResult),
      getThisMonthTableCountsOptimized(tableMappingsResult),
      getLastMonthTableCountsOptimized(tableMappingsResult),
      getDailyStatsOptimized(tableMappingsResult)
    ]);

    const dashboardData: DashboardResult = {
      success: true,
      data: {
        clients: clientsResult,
        tableCounts: countsResult,
        todayTableCounts: todayCountsResult,
        yesterdayTableCounts: yesterdayCountsResult,
        last7DaysTableCounts: last7DaysCountsResult,
        thisMonthTableCounts: thisMonthCountsResult,
        lastMonthTableCounts: lastMonthCountsResult,
        dailyStats: statsResult,
        totalTables: allTables.length,
        totalRecords: countsResult.reduce((sum: number, table: { count: number }) => sum + table.count, 0),
        aggregatedStats: calculateAggregatedStats(statsResult)
      }
    };

    setCachedData(cacheKey, dashboardData);
    return dashboardData;

  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    const errorResult: DashboardError = { 
      success: false, 
      error: "Failed to fetch dashboard data" 
    };
    return errorResult;
  }
}

// Optimized table counts function with batch processing
async function getTableCountsOptimized(tableMappings: Array<{ tableName: string; customTableName: string | null }>) {
  if (tableMappings.length === 0) return [];

  const counts: Array<{ tableName: string; customTableName: string | null; count: number }> = [];
  
  // Process tables in smaller batches to reduce connection pressure
  const batchSize = 1; // Reduced from 3 to prevent connection exhaustion
  for (let i = 0; i < tableMappings.length; i += batchSize) {
    const batch = tableMappings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mapping) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count };
      } catch (error) {
        console.error(`Error getting count for table ${mapping.tableName}:`, error);
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    // Add a longer delay between batches to prevent overwhelming the connection pool
    if (i + batchSize < tableMappings.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get today's table counts
async function getTodayTableCountsOptimized(tableMappings: Array<{ tableName: string; customTableName: string | null }>) {
  if (tableMappings.length === 0) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const counts: Array<{ tableName: string; customTableName: string | null; count: number }> = [];
  
  // Process tables in smaller batches
  const batchSize = 1; // Reduced from 2 to prevent connection exhaustion
  for (let i = 0; i < tableMappings.length; i += batchSize) {
    const batch = tableMappings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mapping) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${today} AND created_at_ts < ${tomorrow}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count };
      } catch (error) {
        console.error(`Error getting today's count for table ${mapping.tableName}:`, error);
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    // Add a longer delay between batches
    if (i + batchSize < tableMappings.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get yesterday's table counts
async function getYesterdayTableCountsOptimized(tableMappings: Array<{ tableName: string; customTableName: string | null }>) {
  if (tableMappings.length === 0) return [];

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const counts: Array<{ tableName: string; customTableName: string | null; count: number }> = [];
  
  // Process tables in smaller batches
  const batchSize = 1;
  for (let i = 0; i < tableMappings.length; i += batchSize) {
    const batch = tableMappings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mapping) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${yesterday} AND created_at_ts < ${now}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count };
      } catch (error) {
        console.error(`Error getting yesterday's count for table ${mapping.tableName}:`, error);
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    if (i + batchSize < tableMappings.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get last 7 days table counts
async function getLast7DaysTableCountsOptimized(tableMappings: Array<{ tableName: string; customTableName: string | null }>) {
  if (tableMappings.length === 0) return [];

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const counts: Array<{ tableName: string; customTableName: string | null; count: number }> = [];
  
  const batchSize = 1;
  for (let i = 0; i < tableMappings.length; i += batchSize) {
    const batch = tableMappings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mapping) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${sevenDaysAgo}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count };
      } catch (error) {
        console.error(`Error getting last 7 days count for table ${mapping.tableName}:`, error);
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    if (i + batchSize < tableMappings.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get this month's table counts
async function getThisMonthTableCountsOptimized(tableMappings: Array<{ tableName: string; customTableName: string | null }>) {
  if (tableMappings.length === 0) return [];

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const counts: Array<{ tableName: string; customTableName: string | null; count: number }> = [];
  
  const batchSize = 1;
  for (let i = 0; i < tableMappings.length; i += batchSize) {
    const batch = tableMappings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mapping) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${thisMonth}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count };
      } catch (error) {
        console.error(`Error getting this month's count for table ${mapping.tableName}:`, error);
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    if (i + batchSize < tableMappings.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get last month's table counts
async function getLastMonthTableCountsOptimized(tableMappings: Array<{ tableName: string; customTableName: string | null }>) {
  if (tableMappings.length === 0) return [];

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const counts: Array<{ tableName: string; customTableName: string | null; count: number }> = [];
  
  const batchSize = 1;
  for (let i = 0; i < tableMappings.length; i += batchSize) {
    const batch = tableMappings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mapping) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${lastMonth} AND created_at_ts < ${thisMonth}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count };
      } catch (error) {
        console.error(`Error getting last month's count for table ${mapping.tableName}:`, error);
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    if (i + batchSize < tableMappings.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get custom date range table counts
async function getCustomDateRangeTableCountsOptimized(
  tableMappings: Array<{ tableName: string; customTableName: string | null }>,
  startDate: Date,
  endDate: Date
) {
  if (tableMappings.length === 0) return [];

  // Ensure endDate is set to end of day for inclusive range
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const counts: Array<{ tableName: string; customTableName: string | null; count: number }> = [];
  
  const batchSize = 1;
  for (let i = 0; i < tableMappings.length; i += batchSize) {
    const batch = tableMappings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mapping) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${startDate} AND created_at_ts <= ${endOfDay}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count };
      } catch (error) {
        console.error(`Error getting custom date range count for table ${mapping.tableName}:`, error);
        return { tableName: mapping.tableName, customTableName: mapping.customTableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    if (i + batchSize < tableMappings.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get daily stats
async function getDailyStatsOptimized(tableMappings: Array<{ tableName: string; customTableName: string | null }>) {
  if (tableMappings.length === 0) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const stats: Array<{
    tableName: string;
    customTableName: string | null;
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    totalRecords: number;
    hasData: boolean;
  }> = [];

  const batchSize = 1;
  for (let i = 0; i < tableMappings.length; i += batchSize) {
    const batch = tableMappings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (mapping) => {
      try {
        const [todayResult, yesterdayResult, thisMonthResult, lastMonthResult, totalResult] = await Promise.all([
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${today} AND created_at_ts < ${tomorrow}`
          ),
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${yesterday} AND created_at_ts < ${today}`
          ),
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${thisMonth}`
          ),
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)} WHERE created_at_ts >= ${lastMonth} AND created_at_ts < ${thisMonth}`
          ),
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(mapping.tableName)}`
          )
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extractCount = (result: any): number => {
          let count = 0;
          if (Array.isArray(result) && result.length > 0) {
            const dataRows = Array.isArray(result[0]) ? result[0] : result;
            if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
              count = Number(dataRows[0].count) || 0;
            }
          }
          return count;
        };

        const todayCount = extractCount(todayResult);
        const yesterdayCount = extractCount(yesterdayResult);
        const thisMonthCount = extractCount(thisMonthResult);
        const lastMonthCount = extractCount(lastMonthResult);
        const totalCount = extractCount(totalResult);

        return {
          tableName: mapping.tableName,
          customTableName: mapping.customTableName,
          today: todayCount,
          yesterday: yesterdayCount,
          thisMonth: thisMonthCount,
          lastMonth: lastMonthCount,
          totalRecords: totalCount,
          hasData: totalCount > 0
        };
      } catch (error) {
        console.error(`Error getting daily stats for table ${mapping.tableName}:`, error);
        return {
          tableName: mapping.tableName,
          customTableName: mapping.customTableName,
          today: 0,
          yesterday: 0,
          thisMonth: 0,
          lastMonth: 0,
          totalRecords: 0,
          hasData: false
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    stats.push(...batchResults);
    
    if (i + batchSize < tableMappings.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return stats;
}

// Helper function to calculate aggregated stats
function calculateAggregatedStats(dailyStats: Array<{ today: number; yesterday: number; thisMonth: number; lastMonth: number }>) {
  if (dailyStats.length === 0) {
    return { today: 0, yesterday: 0, thisMonth: 0, lastMonth: 0 };
  }

  return {
    today: dailyStats.reduce((sum: number, table) => sum + table.today, 0),
    yesterday: dailyStats.reduce((sum: number, table) => sum + table.yesterday, 0),
    thisMonth: dailyStats.reduce((sum: number, table) => sum + table.thisMonth, 0),
    lastMonth: dailyStats.reduce((sum: number, table) => sum + table.lastMonth, 0),
  };
}

// Function to clear cache (useful for testing or manual refresh)
export async function clearDashboardCacheAction() {
  cache.clear();
  return { success: true };
}

// Server action for getting custom date range table counts
export async function getCustomDateRangeTableCountsAction(startDate: string, endDate: string) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: "Invalid date format" };
    }

    // Get active table mappings
    const tableMappingsResult = await dbWriteReplica
      .select({
        tableName: tableMapping.tableName,
        customTableName: tableMapping.customTableName,
        isActive: tableMapping.isActive
      })
      .from(tableMapping)
      .where(eq(tableMapping.isActive, "true"));

    if (tableMappingsResult.length === 0) {
      return { success: true, data: [] };
    }

    const counts = await getCustomDateRangeTableCountsOptimized(tableMappingsResult, start, end);
    
    return { success: true, data: counts };
  } catch (error) {
    console.error("Error getting custom date range table counts:", error);
    return { success: false, error: "Failed to get custom date range data" };
  }
}
