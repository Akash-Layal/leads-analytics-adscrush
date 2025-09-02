"use server";
// Dashboard service with caching
import { db } from "@/db/writereplica";
import { client, tableMapping } from "@/db/writereplica/schema";
import { sql } from "drizzle-orm";
import { dashboardCache, cacheResult } from "@/lib/cache";

// Get dashboard overview with caching
export const getDashboardOverview = cacheResult(
  async () => {
    try {
      // Get total clients
      const clientCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(client);

      // Get total table mappings
      const tableMappingCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tableMapping);

      // Get active table mappings
      const activeTableMappingsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tableMapping)
        .where(sql`${tableMapping.isActive} = 'true'`);

      // Get recent clients
      const recentClientsResult = await db
        .select({
          xataId: client.xataId,
          clientName: client.name,
          clientStatus: client.status,
          xataCreatedat: client.xataCreatedat,
        })
        .from(client)
        .orderBy(sql`${client.xataCreatedat} DESC`)
        .limit(5);

      // Get recent table mappings
      const recentTableMappingsResult = await db
        .select({
          xataId: tableMapping.xataId,
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          clientId: tableMapping.clientId,
          xataCreatedat: tableMapping.xataCreatedat,
        })
        .from(tableMapping)
        .orderBy(sql`${tableMapping.xataCreatedat} DESC`)
        .limit(5);

      return {
        success: true,
        overview: {
          totalClients: clientCountResult[0]?.count || 0,
          totalTableMappings: tableMappingCountResult[0]?.count || 0,
          activeTableMappings: activeTableMappingsResult[0]?.count || 0,
          recentClients: recentClientsResult,
          recentTableMappings: recentTableMappingsResult,
        }
      };
    } catch (error) {
      console.error("Error getting dashboard overview:", error);
      return { success: false, error: "Failed to get dashboard overview" };
    }
  },
  dashboardCache,
  'getDashboardOverview',
  { ttl: 2 * 60 * 1000 } // 2 minutes
);

// Get client status distribution with caching
export const getClientStatusDistribution = cacheResult(
  async () => {
    try {
      const result = await db
        .select({
          status: client.clientStatus,
          count: sql<number>`count(*)`,
        })
        .from(client)
        .groupBy(client.clientStatus);

      return { success: true, distribution: result };
    } catch (error) {
      console.error("Error getting client status distribution:", error);
      return { success: false, error: "Failed to get client status distribution" };
    }
  },
  dashboardCache,
  'getClientStatusDistribution',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get table mapping status distribution with caching
export const getTableMappingStatusDistribution = cacheResult(
  async () => {
    try {
      const result = await db
        .select({
          status: tableMapping.isActive,
          count: sql<number>`count(*)`,
        })
        .from(tableMapping)
        .groupBy(tableMapping.isActive);

      return { success: true, distribution: result };
    } catch (error) {
      console.error("Error getting table mapping status distribution:", error);
      return { success: false, error: "Failed to get table mapping status distribution" };
    }
  },
  dashboardCache,
  'getTableMappingStatusDistribution',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get monthly growth data with caching
export const getMonthlyGrowth = cacheResult(
  async (months: number = 6) => {
    try {
      const result = await db
        .select({
          month: sql<string>`DATE_FORMAT(${client.xataCreatedat}, '%Y-%m')`,
          clientCount: sql<number>`count(*)`,
        })
        .from(client)
        .where(sql`${client.xataCreatedat} >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)`)
        .groupBy(sql`DATE_FORMAT(${client.xataCreatedat}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${client.xataCreatedat}, '%Y-%m')`);

      return { success: true, growth: result };
    } catch (error) {
      console.error("Error getting monthly growth:", error);
      return { success: false, error: "Failed to get monthly growth" };
    }
  },
  dashboardCache,
  'getMonthlyGrowth',
  { ttl: 10 * 60 * 1000 } // 10 minutes
);

// Get top performing clients with caching
export const getTopPerformingClients = cacheResult(
  async (limit: number = 5) => {
    try {
      const result = await db
        .select({
          clientId: client.xataId,
          clientName: client.clientName,
          tableCount: sql<number>`count(${tableMapping.xataId})`,
        })
        .from(client)
        .leftJoin(tableMapping, sql`${client.xataId} = ${tableMapping.clientId}`)
        .groupBy(client.xataId, client.clientName)
        .orderBy(sql`count(${tableMapping.xataId}) DESC`)
        .limit(limit);

      return { success: true, clients: result };
    } catch (error) {
      console.error("Error getting top performing clients:", error);
      return { success: false, error: "Failed to get top performing clients" };
    }
  },
  dashboardCache,
  'getTopPerformingClients',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get dashboard metrics with caching
export const getDashboardMetrics = cacheResult(
  async () => {
    try {
      // Get all metrics in parallel
      const [
        overviewResult,
        clientStatusResult,
        tableMappingStatusResult,
        topClientsResult
      ] = await Promise.all([
        getDashboardOverview(),
        getClientStatusDistribution(),
        getTableMappingStatusDistribution(),
        getTopPerformingClients()
      ]);

      if (!overviewResult.success || !clientStatusResult.success || 
          !tableMappingStatusResult.success || !topClientsResult.success) {
        return { success: false, error: "Failed to get dashboard metrics" };
      }

      return {
        success: true,
        metrics: {
          overview: overviewResult.overview,
          clientStatusDistribution: clientStatusResult.distribution,
          tableMappingStatusDistribution: tableMappingStatusResult.distribution,
          topPerformingClients: topClientsResult.clients,
        }
      };
    } catch (error) {
      console.error("Error getting dashboard metrics:", error);
      return { success: false, error: "Failed to get dashboard metrics" };
    }
  },
  dashboardCache,
  'getDashboardMetrics',
  { ttl: 2 * 60 * 1000 } // 2 minutes
);

// Cache invalidation helpers
export function invalidateDashboardCache() {
  dashboardCache.clear('dashboard');
}

// Cache warming
export async function warmDashboardCache() {
  try {
    console.log('Warming dashboard cache...');
    
    // Warm commonly accessed data
    await Promise.all([
      getDashboardOverview(),
      getClientStatusDistribution(),
      getTableMappingStatusDistribution(),
      getTopPerformingClients(),
      getDashboardMetrics()
    ]);
    
    console.log('Dashboard cache warmed successfully');
  } catch (error) {
    console.error('Error warming dashboard cache:', error);
  }
}
