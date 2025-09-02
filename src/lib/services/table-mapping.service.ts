"use server";
// Table mapping service with caching
import { db } from "@/db/writereplica";
import { tableMapping, client } from "@/db/writereplica/schema";
import { eq, sql } from "drizzle-orm";
import { tableCache, cacheResult, generateCacheKey } from "@/lib/cache";

// Get all table mappings with client information and caching
export const getAllTableMappingsWithClients = cacheResult(
  async () => {
    try {
      const result = await db
        .select({
          xataId: tableMapping.xataId,
          clientId: tableMapping.clientId,
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          tableSchema: tableMapping.tableSchema,
          description: tableMapping.description,
          isActive: tableMapping.isActive,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
          client: {
            xataId: client.xataId,
            clientName: client.clientName,
            clientEmail: client.clientEmail,
            clientStatus: client.clientStatus,
          },
        })
        .from(tableMapping)
        .leftJoin(client, eq(tableMapping.clientId, client.xataId))
        .orderBy(tableMapping.xataCreatedat);

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error getting all table mappings with clients:", error);
      return { success: false, error: "Failed to get table mappings" };
    }
  },
  tableCache,
  'getAllTableMappingsWithClients',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get table mappings by status with caching
export const getTableMappingsByStatus = cacheResult(
  async (status: string) => {
    try {
      const result = await db
        .select({
          xataId: tableMapping.xataId,
          clientId: tableMapping.clientId,
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          tableSchema: tableMapping.tableSchema,
          description: tableMapping.description,
          isActive: tableMapping.isActive,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
        })
        .from(tableMapping)
        .where(eq(tableMapping.isActive, status))
        .orderBy(tableMapping.xataCreatedat);

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error getting table mappings by status:", error);
      return { success: false, error: "Failed to get table mappings" };
    }
  },
  tableCache,
  'getTableMappingsByStatus',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get table mappings by schema with caching
export const getTableMappingsBySchema = cacheResult(
  async (schema: string) => {
    try {
      const result = await db
        .select({
          xataId: tableMapping.xataId,
          clientId: tableMapping.clientId,
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          tableSchema: tableMapping.tableSchema,
          description: tableMapping.description,
          isActive: tableMapping.isActive,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
        })
        .from(tableMapping)
        .where(eq(tableMapping.tableSchema, schema))
        .orderBy(tableMapping.xataCreatedat);

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error getting table mappings by schema:", error);
      return { success: false, error: "Failed to get table mappings" };
    }
  },
  tableCache,
  'getTableMappingsBySchema',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get table mapping statistics with caching
export const getTableMappingStats = cacheResult(
  async () => {
    try {
      // Get total count
      const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tableMapping);

      // Get active count
      const activeCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tableMapping)
        .where(eq(tableMapping.isActive, "true"));

      // Get inactive count
      const inactiveCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tableMapping)
        .where(eq(tableMapping.isActive, "false"));

      // Get schema distribution
      const schemaDistributionResult = await db
        .select({
          schema: tableMapping.tableSchema,
          count: sql<number>`count(*)`,
        })
        .from(tableMapping)
        .groupBy(tableMapping.tableSchema);

      // Get recent mappings
      const recentMappingsResult = await db
        .select({
          xataId: tableMapping.xataId,
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          clientId: tableMapping.clientId,
          xataCreatedat: tableMapping.xataCreatedat,
        })
        .from(tableMapping)
        .orderBy(sql`${tableMapping.xataCreatedat} DESC`)
        .limit(10);

      return {
        success: true,
        stats: {
          total: totalCountResult[0]?.count || 0,
          active: activeCountResult[0]?.count || 0,
          inactive: inactiveCountResult[0]?.count || 0,
          schemaDistribution: schemaDistributionResult,
          recentMappings: recentMappingsResult,
        }
      };
    } catch (error) {
      console.error("Error getting table mapping statistics:", error);
      return { success: false, error: "Failed to get table mapping statistics" };
    }
  },
  tableCache,
  'getTableMappingStats',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Search table mappings with caching
export const searchTableMappings = cacheResult(
  async (query: string) => {
    try {
      const result = await db
        .select({
          xataId: tableMapping.xataId,
          clientId: tableMapping.clientId,
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          tableSchema: tableMapping.tableSchema,
          description: tableMapping.description,
          isActive: tableMapping.isActive,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
        })
        .from(tableMapping)
        .where(
          sql`${tableMapping.tableName} LIKE ${`%${query}%`} OR 
               ${tableMapping.customTableName} LIKE ${`%${query}%`} OR 
               ${tableMapping.description} LIKE ${`%${query}%`}`
        )
        .orderBy(tableMapping.xataCreatedat);

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error searching table mappings:", error);
      return { success: false, error: "Failed to search table mappings" };
    }
  },
  tableCache,
  'searchTableMappings',
  { ttl: 2 * 60 * 1000 } // 2 minutes
);

// Get table mappings by date range with caching
export const getTableMappingsByDateRange = cacheResult(
  async (startDate: string, endDate: string) => {
    try {
      const result = await db
        .select({
          xataId: tableMapping.xataId,
          clientId: tableMapping.clientId,
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          tableSchema: tableMapping.tableSchema,
          description: tableMapping.description,
          isActive: tableMapping.isActive,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
        })
        .from(tableMapping)
        .where(
          sql`${tableMapping.xataCreatedat} >= ${startDate} AND ${tableMapping.xataCreatedat} <= ${endDate}`
        )
        .orderBy(tableMapping.xataCreatedat);

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error getting table mappings by date range:", error);
      return { success: false, error: "Failed to get table mappings" };
    }
  },
  tableCache,
  'getTableMappingsByDateRange',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Bulk update table mappings (invalidates cache)
export async function bulkUpdateTableMappings(
  mappingIds: string[],
  updateData: Partial<{
    customTableName: string;
    description: string;
    isActive: string;
  }>
) {
  try {
    const result = await db
      .update(tableMapping)
      .set({
        ...updateData,
        xataUpdatedat: new Date().toISOString(),
      })
      .where(sql`${tableMapping.xataId} IN (${mappingIds.join(',')})`)
      .returning({ xataId: tableMapping.xataId, clientId: tableMapping.clientId });

    if (result.length === 0) {
      return { success: false, error: "No product mappings found" };
    }

    // Invalidate related caches
    result.forEach(({ xataId, clientId }) => {
      tableCache.delete(generateCacheKey('getTableMappingById', xataId));
      if (clientId) {
        tableCache.delete(generateCacheKey('getTableMappingsByClientId', clientId));
      }
    });
    tableCache.clear('tables');

    return { success: true, updatedCount: result.length };
  } catch (error) {
    console.error("Error bulk updating table mappings:", error);
    return { success: false, error: "Failed to bulk update table mappings" };
  }
}

// Get table mapping audit log with caching
export const getTableMappingAuditLog = cacheResult(
  async (mappingId: string) => {
    try {
      const result = await db
        .select({
          xataId: tableMapping.xataId,
          tableName: tableMapping.tableName,
          customTableName: tableMapping.customTableName,
          tableSchema: tableMapping.tableSchema,
          description: tableMapping.description,
          isActive: tableMapping.isActive,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
        })
        .from(tableMapping)
        .where(eq(tableMapping.xataId, mappingId))
        .limit(1);

      if (result.length === 0) {
        return { success: false, error: "Table mapping not found" };
      }

      // In a real application, you might have a separate audit table
      // For now, we'll return the current state
      return { success: true, auditLog: [result[0]] };
    } catch (error) {
      console.error("Error getting table mapping audit log:", error);
      return { success: false, error: "Failed to get audit log" };
    }
  },
  tableCache,
  'getTableMappingAuditLog',
  { ttl: 10 * 60 * 1000 } // 10 minutes
);

// Cache invalidation helpers
export function invalidateTableMappingCache(mappingId?: string, clientId?: string) {
  if (mappingId) {
    tableCache.delete(generateCacheKey('getTableMappingById', mappingId));
    tableCache.delete(generateCacheKey('getTableMappingAuditLog', mappingId));
  }
  if (clientId) {
    tableCache.delete(generateCacheKey('getTableMappingsByClientId', clientId));
  }
  tableCache.clear('tables');
}

// Cache warming
export async function warmTableMappingCache() {
  try {
    console.log('Warming table mapping cache...');
    
    // Warm commonly accessed data
    await Promise.all([
      getAllTableMappingsWithClients(),
      getTableMappingsByStatus('true'),
      getTableMappingStats(),
      getTableMappingsBySchema('default')
    ]);
    
    console.log('Table mapping cache warmed successfully');
  } catch (error) {
    console.error('Error warming table mapping cache:', error);
  }
}
