// Optimized dashboard data service with parallel queries and caching
import { db as dbReplica } from "@/db/readreplica";
import { getClientCount } from "./client.service";
import { getTableMappingCount } from "./table.service";
import { getTableWiseCountsWithGrowth } from "./leadService";
import {
  getLastMonthLeadsCount,
  getLastWeekLeadsCount,
  getThisMonthLeadsCount,
  getThisWeekLeadsCount,
  getTodayLeadsCount,
  getTotalRowCount,
  getYesterdayLeadsCount,
} from "@/lib/queries";
import { cacheResult, globalCache } from "@/lib/cache";

export type DashboardData = {
  totalClientsCount: number;
  totalTablesCount: number;
  totalTableRecordsCount: number;
  todaysLeadsCount: number;
  yesterdayLeadsCount: number;
  thisWeekLeadsCount: number;
  lastWeekLeadsCount: number;
  thisMonthLeadsCount: number;
  lastMonthLeadsCount: number;
  tableCounts: Array<{
    tableName: string;
    displayName: string;
    count: number;
    previousCount: number;
  }>;
  totalLeads: number;
  averageGrowth: number;
};

/**
 * Get all dashboard data in a single optimized call
 * Executes all queries in parallel for maximum performance
 */
export const getDashboardData = cacheResult(
  async (date_from?: string, date_to?: string): Promise<DashboardData> => {
    try {
      // Execute all queries in parallel for better performance
      const [
        clientsResult,
        tableMappingResult,
        totalTableRecordsCount,
        todaysLeadsCount,
        yesterdayLeadsCount,
        thisWeekLeadsCount,
        lastWeekLeadsCount,
        thisMonthLeadsCount,
        lastMonthLeadsCount,
        tableCounts
      ] = await Promise.all([
        getClientCount(),
        getTableMappingCount(),
        getTotalRowCount(dbReplica),
        getTodayLeadsCount(dbReplica),
        getYesterdayLeadsCount(dbReplica),
        getThisWeekLeadsCount(dbReplica),
        getLastWeekLeadsCount(dbReplica),
        getThisMonthLeadsCount(dbReplica),
        getLastMonthLeadsCount(dbReplica),
        getTableWiseCountsWithGrowth(date_from ?? "", date_to ?? "")
      ]);

      // Extract counts with fallback values
      const totalClientsCount = clientsResult.success && clientsResult.count ? clientsResult.count : 0;
      const totalTablesCount = tableMappingResult.success && tableMappingResult.count ? tableMappingResult.count : 0;

      // Calculate total leads and average growth for the selected period
      const totalLeads = tableCounts.reduce((sum, table) => sum + table.count, 0);

      const averageGrowth =
        tableCounts.length > 0
          ? tableCounts.reduce((sum, table) => {
              const growth = table.previousCount && table.previousCount > 0 
                ? ((table.count - table.previousCount) / table.previousCount) * 100 
                : 0;
              return sum + growth;
            }, 0) / tableCounts.length
          : 0;

      return {
        totalClientsCount,
        totalTablesCount,
        totalTableRecordsCount,
        todaysLeadsCount,
        yesterdayLeadsCount,
        thisWeekLeadsCount,
        lastWeekLeadsCount,
        thisMonthLeadsCount,
        lastMonthLeadsCount,
        tableCounts,
        totalLeads,
        averageGrowth,
      };
    } catch (error) {
      console.error("Error in getDashboardData:", error);
      throw new Error("Failed to load dashboard data");
    }
  },
  globalCache,
  'dashboard-data',
  { ttl: 2 * 60 * 1000 } // 2 minutes cache
);

/**
 * Get dashboard data with error handling
 */
export const getDashboardDataSafe = async (date_from?: string, date_to?: string) => {
  try {
    const data = await getDashboardData(date_from, date_to);
    return { success: true, data };
  } catch (error) {
    console.error("Error in getDashboardDataSafe:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      data: null 
    };
  }
};
