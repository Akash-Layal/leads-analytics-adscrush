// Table service with caching
import { db } from "@/db/writereplica";
import { tableMapping } from "@/db/writereplica/schema";
import { eq, sql } from "drizzle-orm";
import { tableCache, cacheResult, generateCacheKey } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache/keys";

// Get all table mappings with caching
export const getAllTableMappings = cacheResult(
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
          imageUrl: tableMapping.imageUrl,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
        })
        .from(tableMapping)
        .orderBy(tableMapping.xataCreatedat);

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error getting all table mappings:", error);
      return { success: false, error: "Failed to get table mappings" };
    }
  },
  tableCache,
  'getAllTableMappings',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get table mapping by ID with caching
export const getTableMappingById = cacheResult(
  async (mappingId: string) => {
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
          imageUrl: tableMapping.imageUrl,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
        })
        .from(tableMapping)
        .where(eq(tableMapping.xataId, mappingId))
        .limit(1);

      if (result.length === 0) {
        return { success: false, error: "Table mapping not found" };
      }

      return { success: true, mapping: result[0] };
    } catch (error) {
      console.error("Error getting table mapping by ID:", error);
      return { success: false, error: "Failed to get table mapping" };
    }
  },
  tableCache,
  'getTableMappingById',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get table mappings by client ID with caching
export const getTableMappingsByClientId = cacheResult(
  async (clientId: string) => {
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
          imageUrl: tableMapping.imageUrl,
          xataCreatedat: tableMapping.xataCreatedat,
          xataUpdatedat: tableMapping.xataUpdatedat,
        })
        .from(tableMapping)
        .where(eq(tableMapping.clientId, clientId))
        .orderBy(tableMapping.xataCreatedat);

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error getting table mappings by client ID:", error);
      return { success: false, error: "Failed to get table mappings" };
    }
  },
  tableCache,
  'getTableMappingsByClientId',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get table mapping count with caching
export const getTableMappingCount = cacheResult(
  async () => {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(tableMapping);

      return { success: true, count: result[0]?.count || 0 };
    } catch (error) {
      console.error("Error getting table mapping count:", error);
      return { success: false, error: "Failed to get table mapping count" };
    }
  },
  tableCache,
  'getTableMappingCount',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Create table mapping (invalidates cache)
export async function createTableMapping(mappingData: {
  clientId: string;
  tableName: string;
  tableSchema: string;
  customTableName?: string;
  description?: string;
}) {
  try {
    const result = await db.insert(tableMapping).values({
      ...mappingData,
      isActive: "true",
    }).returning({ xataId: tableMapping.xataId });

    // Invalidate related caches
    tableCache.delete(generateCacheKey('getTableMappingsByClientId', mappingData.clientId));
    tableCache.delete(CACHE_KEYS.TABLE_MAPPINGS.ALL);
    tableCache.clear('tables');

    return { success: true, mappingId: result[0]?.xataId };
  } catch (error) {
    console.error("Error creating table mapping:", error);
    return { success: false, error: "Failed to create table mapping" };
  }
}

// Update table mapping (invalidates cache)
export async function updateTableMapping(
  mappingId: string,
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
      .where(eq(tableMapping.xataId, mappingId))
      .returning({ xataId: tableMapping.xataId, clientId: tableMapping.clientId });

    if (result.length === 0) {
      return { success: false, error: "Table mapping not found" };
    }

    // Invalidate related caches
    tableCache.delete(generateCacheKey('getTableMappingById', mappingId));
    tableCache.delete(generateCacheKey('getTableMappingsByClientId', result[0].clientId));
    tableCache.delete(CACHE_KEYS.TABLE_MAPPINGS.ALL);
    tableCache.clear('tables');

    return { success: true, mappingId: result[0]?.xataId };
  } catch (error) {
    console.error("Error updating table mapping:", error);
    return { success: false, error: "Failed to update table mapping" };
  }
}

// Delete table mapping (invalidates cache)
export async function deleteTableMapping(mappingId: string) {
  try {
    const result = await db
      .delete(tableMapping)
      .where(eq(tableMapping.xataId, mappingId))
      .returning({ xataId: tableMapping.xataId, clientId: tableMapping.clientId });

    if (result.length === 0) {
      return { success: false, error: "Table mapping not found" };
    }

    // Invalidate related caches
    tableCache.delete(generateCacheKey('getTableMappingById', mappingId));
    tableCache.delete(generateCacheKey('getTableMappingsByClientId', result[0].clientId));
    tableCache.delete(CACHE_KEYS.TABLE_MAPPINGS.ALL);
    tableCache.clear('tables');

    return { success: true, mappingId: result[0]?.xataId };
  } catch (error) {
    console.error("Error deleting table mapping:", error);
    return { success: false, error: "Failed to delete table mapping" };
  }
}

// Get active table mappings with caching
export const getActiveTableMappings = cacheResult(
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
        })
        .from(tableMapping)
        .where(eq(tableMapping.isActive, "true"))
        .orderBy(tableMapping.xataCreatedat);

      return { success: true, mappings: result };
    } catch (error) {
      console.error("Error getting active table mappings:", error);
      return { success: false, error: "Failed to get active table mappings" };
    }
  },
  tableCache,
  'getActiveTableMappings',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Cache invalidation helpers
export async function invalidateTableCache(mappingId?: string, clientId?: string) {
  if (mappingId) {
    tableCache.delete(generateCacheKey('getTableMappingById', mappingId));
  }
  if (clientId) {
    tableCache.delete(generateCacheKey('getTableMappingsByClientId', clientId));
  }
  tableCache.delete(CACHE_KEYS.TABLE_MAPPINGS.ALL);
  tableCache.clear('tables');
}

// Cache warming
export async function warmTableCache() {
  try {
    console.log('Warming table cache...');
    
    // Warm commonly accessed data
    await Promise.all([
      getAllTableMappings(),
      getTableMappingCount(),
      getActiveTableMappings()
    ]);
    
    console.log('Table cache warmed successfully');
  } catch (error) {
    console.error('Error warming table cache:', error);
  }
}
