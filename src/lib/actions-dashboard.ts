'use server';

import { db as dbReadReplica } from "@/db/readreplica";
import { db as dbWriteReplica } from "@/db/writereplica";
import { client } from "@/db/writereplica/schema";
import { desc } from "drizzle-orm";
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
    count: number;
  }>;
  todayTableCounts: Array<{
    tableName: string;
    count: number;
  }>;
  yesterdayTableCounts: Array<{
    tableName: string;
    count: number;
  }>;
  last7DaysTableCounts: Array<{
    tableName: string;
    count: number;
  }>;
  dailyStats: Array<{
    tableName: string;
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
    const [clientsResult, tablesResult] = await Promise.all([
      // Get all clients
      dbWriteReplica
        .select()
        .from(client)
        .orderBy(desc(client.xataCreatedat)),
      
      // Get all available tables from read replica
      dbReadReplica.execute(sql`SHOW TABLES`)
    ]);

    // Parse tables result
    const allTables: string[] = [];
    if (Array.isArray(tablesResult) && tablesResult.length > 0) {
      const tableRows = Array.isArray(tablesResult[0]) ? tablesResult[0] : tablesResult;
      allTables.push(...tableRows.map((row: any) => Object.values(row)[0] as string));
    }

    // Get table counts, today's counts, yesterday's counts, last 7 days counts, and daily stats in parallel
    const [countsResult, todayCountsResult, yesterdayCountsResult, last7DaysCountsResult, statsResult] = await Promise.all([
      getTableCountsOptimized(allTables),
      getTodayTableCountsOptimized(allTables),
      getYesterdayTableCountsOptimized(allTables),
      getLast7DaysTableCountsOptimized(allTables),
      getDailyStatsOptimized(allTables)
    ]);

    const dashboardData: DashboardResult = {
      success: true,
      data: {
        clients: clientsResult,
        tableCounts: countsResult,
        todayTableCounts: todayCountsResult,
        yesterdayTableCounts: yesterdayCountsResult,
        last7DaysTableCounts: last7DaysCountsResult,
        dailyStats: statsResult,
        totalTables: allTables.length,
        totalRecords: countsResult.reduce((sum: number, table: any) => sum + table.count, 0),
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
async function getTableCountsOptimized(tableNames: string[]) {
  if (tableNames.length === 0) return [];

  const counts: Array<{ tableName: string; count: number }> = [];
  
  // Process tables in smaller batches to reduce connection pressure
  const batchSize = 1; // Reduced from 3 to prevent connection exhaustion
  for (let i = 0; i < tableNames.length; i += batchSize) {
    const batch = tableNames.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (tableName) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName, count };
      } catch (error) {
        console.error(`Error getting count for table ${tableName}:`, error);
        return { tableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    // Add a longer delay between batches to prevent overwhelming the connection pool
    if (i + batchSize < tableNames.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get today's table counts
async function getTodayTableCountsOptimized(tableNames: string[]) {
  if (tableNames.length === 0) return [];

  const now = new Date();
  const today = now.getDate().toString().padStart(2, '0');
  const thisMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const thisYear = now.getFullYear().toString();
  const todayPattern = `${today}-${thisMonth}-${thisYear}%`;

  const counts: Array<{ tableName: string; count: number }> = [];
  
  // Process tables in smaller batches
  const batchSize = 1; // Reduced from 2 to prevent connection exhaustion
  for (let i = 0; i < tableNames.length; i += batchSize) {
    const batch = tableNames.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (tableName) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE \`created at\` LIKE ${todayPattern}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName, count };
      } catch (error) {
        console.error(`Error getting today's count for table ${tableName}:`, error);
        return { tableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    // Add a longer delay between batches
    if (i + batchSize < tableNames.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get yesterday's table counts
async function getYesterdayTableCountsOptimized(tableNames: string[]) {
  if (tableNames.length === 0) return [];

  const now = new Date();
  const yesterday = (now.getDate() - 1).toString().padStart(2, '0');
  const thisMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const thisYear = now.getFullYear().toString();
  const yesterdayPattern = `${yesterday}-${thisMonth}-${thisYear}%`;

  const counts: Array<{ tableName: string; count: number }> = [];
  
  // Process tables in smaller batches
  const batchSize = 1; // Reduced from 2 to prevent connection exhaustion
  for (let i = 0; i < tableNames.length; i += batchSize) {
    const batch = tableNames.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (tableName) => {
      try {
        const result = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE \`created at\` LIKE ${yesterdayPattern}`
        );
        
        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }
        
        return { tableName, count };
      } catch (error) {
        console.error(`Error getting yesterday's count for table ${tableName}:`, error);
        return { tableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    // Add a longer delay between batches
    if (i + batchSize < tableNames.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Function to get last 7 days table counts
async function getLast7DaysTableCountsOptimized(tableNames: string[]) {
  if (tableNames.length === 0) return [];

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  // Format dates for the pattern matching approach that works with the existing date format
  // We'll check each day individually and sum them up, similar to how today and yesterday work
  
  const counts: Array<{ tableName: string; count: number }> = [];
  
  // Process tables in smaller batches
  const batchSize = 1; // Reduced from 2 to prevent connection exhaustion
  for (let i = 0; i < tableNames.length; i += batchSize) {
    const batch = tableNames.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (tableName) => {
      try {
        let totalCount = 0;
        
        // Check each of the last 7 days individually
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const checkDate = new Date(now.getTime() - (dayOffset * 24 * 60 * 60 * 1000));
          const day = checkDate.getDate().toString().padStart(2, '0');
          const month = (checkDate.getMonth() + 1).toString().padStart(2, '0');
          const year = checkDate.getFullYear().toString();
          const datePattern = `${day}-${month}-${year}%`;
          
          try {
            const result = await dbReadReplica.execute(
              sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE \`created at\` LIKE ${datePattern}`
            );
            
            if (Array.isArray(result) && result.length > 0) {
              const dataRows = Array.isArray(result[0]) ? result[0] : result;
              if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
                totalCount += Number(dataRows[0].count) || 0;
              }
            }
          } catch (dayError) {
            // If one day fails, continue with other days
            console.error(`Error getting count for ${datePattern} in table ${tableName}:`, dayError);
          }
        }
        
        return { tableName, count: totalCount };
      } catch (error) {
        console.error(`Error getting last 7 days count for table ${tableName}:`, error);
        return { tableName, count: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    counts.push(...batchResults);
    
    // Add a longer delay between batches
    if (i + batchSize < tableNames.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return counts;
}

// Optimized daily stats function with better date handling
async function getDailyStatsOptimized(tableNames: string[]) {
  if (tableNames.length === 0) return [];

  const now = new Date();
  const today = now.getDate().toString().padStart(2, '0');
  const yesterday = (now.getDate() - 1).toString().padStart(2, '0');
  const thisMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const lastMonth = now.getMonth() === 0 ? '12' : (now.getMonth()).toString().padStart(2, '0');
  const thisYear = now.getFullYear().toString();
  const lastYear = now.getMonth() === 0 ? (now.getFullYear() - 1).toString() : thisYear;

  const tableStats: Array<{
    tableName: string;
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    totalRecords: number;
    hasData: boolean;
  }> = [];

  // Process tables in batches
  const batchSize = 1; // Reduced from 2 to prevent connection exhaustion
  for (let i = 0; i < tableNames.length; i += batchSize) {
    const batch = tableNames.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (tableName) => {
      try {
        // First, let's check if table has any records at all
        const totalRecordsResult = await dbReadReplica.execute(
          sql`SELECT COUNT(*) as total FROM ${sql.identifier(tableName)}`
        );
        
        let totalRecords = 0;
        if (Array.isArray(totalRecordsResult) && totalRecordsResult.length > 0) {
          const dataRows = Array.isArray(totalRecordsResult[0]) ? totalRecordsResult[0] : totalRecordsResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'total' in dataRows[0]) {
            totalRecords = Number(dataRows[0].total) || 0;
          }
        }

        // If no records, return early
        if (totalRecords === 0) {
          return {
            tableName,
            today: 0,
            yesterday: 0,
            thisMonth: 0,
            lastMonth: 0,
            totalRecords: 0,
            hasData: false
          };
        }

        // Use the original pattern matching approach that was working
        const todayPattern = `${today}-${thisMonth}-${thisYear}%`;
        const yesterdayPattern = `${yesterday}-${thisMonth}-${thisYear}%`;
        const thisMonthPattern = `%-${thisMonth}-${thisYear}%`;
        const lastMonthPattern = `%-${lastMonth}-${lastYear}%`;

        // Execute all queries in parallel for better performance
        const [todayResult, yesterdayResult, thisMonthResult, lastMonthResult] = await Promise.all([
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE \`created at\` LIKE ${todayPattern}`
          ),
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE \`created at\` LIKE ${yesterdayPattern}`
          ),
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE \`created at\` LIKE ${thisMonthPattern}`
          ),
          dbReadReplica.execute(
            sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE \`created at\` LIKE ${lastMonthPattern}`
          )
        ]);

        // Parse results using the same logic as the original
        let todayCount = 0;
        if (Array.isArray(todayResult) && todayResult.length > 0) {
          const dataRows = Array.isArray(todayResult[0]) ? todayResult[0] : todayResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            todayCount = Number(dataRows[0].count) || 0;
          }
        }

        let yesterdayCount = 0;
        if (Array.isArray(yesterdayResult) && yesterdayResult.length > 0) {
          const dataRows = Array.isArray(yesterdayResult[0]) ? yesterdayResult[0] : yesterdayResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            yesterdayCount = Number(dataRows[0].count) || 0;
          }
        }

        let thisMonthCount = 0;
        if (Array.isArray(thisMonthResult) && thisMonthResult.length > 0) {
          const dataRows = Array.isArray(thisMonthResult[0]) ? thisMonthResult[0] : thisMonthResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            thisMonthCount = Number(dataRows[0].count) || 0;
          }
        }

        let lastMonthCount = 0;
        if (Array.isArray(lastMonthResult) && lastMonthResult.length > 0) {
          const dataRows = Array.isArray(lastMonthResult[0]) ? lastMonthResult[0] : lastMonthResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === 'object' && 'count' in dataRows[0]) {
            lastMonthCount = Number(dataRows[0].count) || 0;
          }
        }

        return {
          tableName,
          today: todayCount,
          yesterday: yesterdayCount,
          thisMonth: thisMonthCount,
          lastMonth: lastMonthCount,
          totalRecords,
          hasData: true
        };

      } catch (error) {
        console.error(`Error getting stats for table ${tableName}:`, error);
        return {
          tableName,
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
    tableStats.push(...batchResults);
    
    // Add a longer delay between batches to prevent overwhelming the connection pool
    if (i + batchSize < tableNames.length) {
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }

  return tableStats;
}

// Helper function to calculate aggregated stats
function calculateAggregatedStats(dailyStats: any[]) {
  if (dailyStats.length === 0) {
    return { today: 0, yesterday: 0, thisMonth: 0, lastMonth: 0 };
  }

  return {
    today: dailyStats.reduce((sum: number, table: any) => sum + table.today, 0),
    yesterday: dailyStats.reduce((sum: number, table: any) => sum + table.yesterday, 0),
    thisMonth: dailyStats.reduce((sum: number, table: any) => sum + table.thisMonth, 0),
    lastMonth: dailyStats.reduce((sum: number, table: any) => sum + table.lastMonth, 0),
  };
}

// Function to clear cache (useful for testing or manual refresh)
export async function clearDashboardCacheAction() {
  cache.clear();
  return { success: true };
}
