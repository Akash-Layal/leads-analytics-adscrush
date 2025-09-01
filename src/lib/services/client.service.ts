// Client service with caching
import { db } from "@/db/writereplica";
import { client, tableMapping } from "@/db/writereplica/schema";
import { eq, sql } from "drizzle-orm";
import { clientCache, cacheResult, generateCacheKey } from "@/lib/cache";

// Cache keys
const CACHE_KEYS = {
  ALL_CLIENTS: 'all_clients',
  CLIENT_BY_ID: 'client_by_id',
  CLIENT_TABLES: 'client_tables',
  CLIENT_COUNT: 'client_count'
} as const;

// Get all clients with caching
export const getAllClients = cacheResult(
  async () => {
    try {
      const result = await db
        .select({
          xataId: client.xataId,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          status: client.status,
          xataCreatedat: client.xataCreatedat,
          xataUpdatedat: client.xataUpdatedat,
        })
        .from(client)
        .orderBy(client.xataCreatedat);

      return { success: true, clients: result };
    } catch (error) {
      console.error("Error getting all clients:", error);
      return { success: false, error: "Failed to get clients" };
    }
  },
  clientCache,
  'getAllClients',
  { ttl: 10 * 60 * 1000 } // 10 minutes
);

// Get client by ID with caching
export const getClientById = cacheResult(
  async (clientId: string) => {
    try {
      const result = await db
        .select({
          xataId: client.xataId,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          status: client.status,
          xataCreatedat: client.xataCreatedat,
          xataUpdatedat: client.xataUpdatedat,
        })
        .from(client)
        .where(eq(client.xataId, clientId))
        .limit(1);

      if (result.length === 0) {
        return { success: false, error: "Client not found" };
      }

      return { success: true, client: result[0] };
    } catch (error) {
      console.error("Error getting client by ID:", error);
      return { success: false, error: "Failed to get client" };
    }
  },
  clientCache,
  'getClientById',
  { ttl: 10 * 60 * 1000 } // 10 minutes
);

// Get client tables with caching
export const getClientTables = cacheResult(
  async (clientId: string) => {
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
        })
        .from(tableMapping)
        .where(eq(tableMapping.clientId, clientId));

      return { success: true, tables: result };
    } catch (error) {
      console.error("Error getting client tables:", error);
      return { success: false, error: "Failed to get client tables" };
    }
  },
  clientCache,
  'getClientTables',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Get client count with caching
export const getClientCount = cacheResult(
  async () => {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(client);

      return { success: true, count: result[0]?.count || 0 };
    } catch (error) {
      console.error("Error getting client count:", error);
      return { success: false, error: "Failed to get client count" };
    }
  },
  clientCache,
  'getClientCount',
  { ttl: 5 * 60 * 1000 } // 5 minutes
);

// Create client (invalidates cache)
export async function createClient(clientData: {
  name: string;
  email: string;
  phone?: string;
  company: string;
  status?: string;
}) {
  try {
    const result = await db.insert(client).values({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      company: clientData.company,
      status: clientData.status || "active",
    }).returning({ xataId: client.xataId });

    // Invalidate related caches
    clientCache.clear('clients');
    
    return { success: true, clientId: result[0]?.xataId };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: "Failed to create client" };
  }
}

// Update client (invalidates cache)
export async function updateClient(
  clientId: string,
  updateData: Partial<{
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
  }>
) {
  try {
    const result = await db
      .update(client)
      .set({
        ...updateData,
        xataUpdatedat: new Date().toISOString(),
      })
      .where(eq(client.xataId, clientId))
      .returning({ xataId: client.xataId });

    if (result.length === 0) {
      return { success: false, error: "Client not found" };
    }

    // Invalidate related caches
    clientCache.delete(generateCacheKey('getClientById', clientId));
    clientCache.clear('clients');

    return { success: true, clientId: result[0]?.xataId };
  } catch (error) {
    console.error("Error updating client:", error);
    return { success: false, error: "Failed to update client" };
  }
}

// Delete client (invalidates cache)
export async function deleteClient(clientId: string) {
  try {
    const result = await db
      .delete(client)
      .where(eq(client.xataId, clientId))
      .returning({ xataId: client.xataId });

    if (result.length === 0) {
      return { success: false, error: "Client not found" };
    }

    // Invalidate related caches
    clientCache.delete(generateCacheKey('getClientById', clientId));
    clientCache.delete(generateCacheKey('getClientTables', clientId));
    clientCache.clear('clients');

    return { success: true, clientId: result[0]?.xataId };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { success: false, error: "Failed to delete client" };
  }
}

// Cache invalidation helpers
export function invalidateClientCache(clientId?: string) {
  if (clientId) {
    clientCache.delete(generateCacheKey('getClientById', clientId));
    clientCache.delete(generateCacheKey('getClientTables', clientId));
  }
  clientCache.clear('clients');
}

// Cache warming
export async function warmClientCache() {
  try {
    console.log('Warming client cache...');
    
    // Warm commonly accessed data
    await Promise.all([
      getAllClients(),
      getClientCount()
    ]);
    
    console.log('Client cache warmed successfully');
  } catch (error) {
    console.error('Error warming client cache:', error);
  }
}
