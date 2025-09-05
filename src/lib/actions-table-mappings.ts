'use server';

import { db } from "@/db/writereplica";
import { client, tableMapping } from "@/db/writereplica/schema";
import { eq } from "drizzle-orm";
import { tableCache, CACHE_KEYS } from "@/lib/cache";

// Type definitions for action return types
export type TableMappingActionResult<T = unknown> = {
  success: boolean;
  mappings?: T[];
  mapping?: T;
  displayName?: string;
  mappingId?: string;
  message?: string;
  error?: string;
};

// Helper function to invalidate all table mapping caches
function invalidateTableMappingCaches(mappingId?: string, clientId?: string) {
  // Always invalidate the all mappings cache
  tableCache.delete(CACHE_KEYS.TABLE_MAPPINGS.ALL);
  
  // Invalidate specific mapping caches if mappingId is provided
  if (mappingId) {
    tableCache.delete(`${CACHE_KEYS.TABLE_MAPPINGS.BY_ID}-${mappingId}`);
    tableCache.delete(`${CACHE_KEYS.TABLE_MAPPINGS.DISPLAY_NAME}-${mappingId}`);
  }
  
  // Invalidate client-specific caches if clientId is provided
  if (clientId) {
    tableCache.delete(`${CACHE_KEYS.TABLE_MAPPINGS.BY_CLIENT}-${clientId}`);
  }
}

// Get all table mappings with client information
export async function getAllTableMappingsAction(): Promise<TableMappingActionResult> {
  const cacheKey = CACHE_KEYS.TABLE_MAPPINGS.ALL;
  
  // Try to get from cache first
  const cached = tableCache.get<TableMappingActionResult>(cacheKey);
  if (cached) {
    return cached;
  }

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
        client: {
          name: client.name,
          company: client.company,
        },
      })
      .from(tableMapping)
      .innerJoin(client, eq(tableMapping.clientId, client.xataId))
      .orderBy(tableMapping.xataUpdatedat);

    const response = { success: true, mappings: result };
    
    // Cache the result for 5 minutes
    tableCache.set(cacheKey, response, { ttl: 5 * 60 * 1000 });
    
    return response;
  } catch (error) {
    console.error("Error getting all table mappings:", error);
    return { success: false, error: "Failed to get table mappings" };
  }
}

// Update a table mapping
export async function updateTableMappingAction(
  mappingId: string,
  updates: {
    customTableName?: string | null;
    description?: string | null;
    isActive?: string;
  }
): Promise<TableMappingActionResult> {
  try {
    const result = await db
      .update(tableMapping)
      .set({
        ...updates,
        xataUpdatedat: new Date().toISOString(),
      })
      .where(eq(tableMapping.xataId, mappingId))
      .returning({ xataId: tableMapping.xataId });

    if (result.length === 0) {
      return { success: false, error: "Table mapping not found" };
    }

    // Invalidate related caches after update
    // Get clientId first for proper cache invalidation
    const mapping = await db
      .select({ clientId: tableMapping.clientId })
      .from(tableMapping)
      .where(eq(tableMapping.xataId, mappingId))
      .limit(1);
    
    const clientId = mapping.length > 0 ? mapping[0].clientId : undefined;
    invalidateTableMappingCaches(mappingId, clientId);

    return { success: true, mappingId: result[0].xataId };
  } catch (error) {
    console.error("Error updating table mapping:", error);
    return { success: false, error: "Failed to update table mapping" };
  }
}

// Get table mapping by ID
export async function getTableMappingByIdAction(mappingId: string): Promise<TableMappingActionResult> {
  const cacheKey = `${CACHE_KEYS.TABLE_MAPPINGS.BY_ID}-${mappingId}`;
  
  // Try to get from cache first
  const cached = tableCache.get<TableMappingActionResult>(cacheKey);
  if (cached) {
    return cached;
  }

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
        client: {
          name: client.name,
          company: client.company,
        },
      })
      .from(tableMapping)
      .innerJoin(client, eq(tableMapping.clientId, client.xataId))
      .where(eq(tableMapping.xataId, mappingId))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Table mapping not found" };
    }

    const response = { success: true, mapping: result[0] };
    
    // Cache the result for 5 minutes
    tableCache.set(cacheKey, response, { ttl: 5 * 60 * 1000 });
    
    return response;
  } catch (error) {
    console.error("Error getting table mapping by ID:", error);
    return { success: false, error: "Failed to get table mapping" };
  }
}

// Get display name for a table mapping (with fallback logic)
export async function getTableDisplayNameAction(mappingId: string): Promise<TableMappingActionResult> {
  const cacheKey = `${CACHE_KEYS.TABLE_MAPPINGS.DISPLAY_NAME}-${mappingId}`;
  
  // Try to get from cache first
  const cached = tableCache.get<TableMappingActionResult>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await db
      .select({
        tableName: tableMapping.tableName,
        customTableName: tableMapping.customTableName,
      })
      .from(tableMapping)
      .where(eq(tableMapping.xataId, mappingId))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Table mapping not found" };
    }

    const mapping = result[0];
    const displayName = mapping.customTableName || mapping.tableName;

    const response = { success: true, displayName };
    
    // Cache the result for 10 minutes (display names change less frequently)
    tableCache.set(cacheKey, response, { ttl: 10 * 60 * 1000 });
    
    return response;
  } catch (error) {
    console.error("Error getting table display name:", error);
    return { success: false, error: "Failed to get table display name" };
  }
}

// Get all table mappings for a specific client
export async function getClientTableMappingsAction(clientId: string): Promise<TableMappingActionResult> {
  const cacheKey = `${CACHE_KEYS.TABLE_MAPPINGS.BY_CLIENT}-${clientId}`;
  
  // Try to get from cache first
  const cached = tableCache.get<TableMappingActionResult>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const result = await db
      .select({
        xataId: tableMapping.xataId,
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
      .orderBy(tableMapping.xataUpdatedat);

    const response = { success: true, mappings: result };
    
    // Cache the result for 5 minutes
    tableCache.set(cacheKey, response, { ttl: 5 * 60 * 1000 });
    
    return response;
  } catch (error) {
    console.error("Error getting client table mappings:", error);
    return { success: false, error: "Failed to get client table mappings" };
  }
}

// Manual cache invalidation function for admin operations
export async function invalidateTableMappingCachesAction(): Promise<TableMappingActionResult> {
  try {
    // Clear all table mapping related caches
    tableCache.clear();
    return { success: true, message: "All table mapping caches cleared" };
  } catch (error) {
    console.error("Error clearing table mapping caches:", error);
    return { success: false, error: "Failed to clear caches" };
  }
}
