"use server";
import { db } from "@/db/writereplica";
import { client, tableMapping } from "@/db/writereplica/schema";
import { desc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export type Client = {
  xataId: string;
  name: string;
  email: string;
  phone: string | null;
  company: string;
  status: string;
  xataCreatedat: string;
  xataUpdatedat: string;
};

export type AssignedTable = {
  xataId: string;
  tableName: string;
  tableSchema: string;
  description: string | null;
  isActive: string;
  xataCreatedat: string;
};

export type ClientWithTables = Client & {
  assignedTables: AssignedTable[];
};

export async function getClientsWithTables(): Promise<ClientWithTables[]> {
  try {
    // Single optimized query using JOIN to fetch all clients with their assigned tables
    // This eliminates the N+1 query problem by fetching everything in one database call
    const result = await db
      .select({
        // Client fields
        xataId: client.xataId,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        status: client.status,
        xataCreatedat: client.xataCreatedat,
        xataUpdatedat: client.xataUpdatedat,
        // Table mapping fields (nullable since not all clients may have tables)
        tableMappingId: tableMapping.xataId,
        tableName: tableMapping.tableName,
        tableSchema: tableMapping.tableSchema,
        description: tableMapping.description,
        isActive: tableMapping.isActive,
        tableCreatedAt: tableMapping.xataCreatedat,
      })
      .from(client)
      .leftJoin(tableMapping, eq(client.xataId, tableMapping.clientId))
      .orderBy(desc(client.xataCreatedat));

    // Efficiently group the results by client using Map for O(1) lookups
    const clientsMap = new Map<string, ClientWithTables>();

    for (const row of result) {
      const clientId = row.xataId;
      
      // Initialize client if not exists
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          xataId: row.xataId,
          name: row.name,
          email: row.email,
          phone: row.phone,
          company: row.company,
          status: row.status,
          xataCreatedat: row.xataCreatedat,
          xataUpdatedat: row.xataUpdatedat,
          assignedTables: [],
        });
      }

      // Add table mapping if it exists (with null safety)
      if (row.tableMappingId && row.tableName && row.tableSchema && row.isActive && row.tableCreatedAt) {
        const clientData = clientsMap.get(clientId)!;
        clientData.assignedTables.push({
          xataId: row.tableMappingId,
          tableName: row.tableName,
          tableSchema: row.tableSchema,
          description: row.description,
          isActive: row.isActive,
          xataCreatedat: row.tableCreatedAt,
        });
      }
    }

    const clientsWithTables = Array.from(clientsMap.values());
    return clientsWithTables;
  } catch (error) {
    console.error("Failed to fetch clients with tables:", error);
    throw new Error("Failed to fetch clients with tables");
  }
}

// Alternative optimized version for better performance with large datasets
export async function getClientsWithTablesOptimized(): Promise<ClientWithTables[]> {
  try {
    // Use a more efficient approach with separate queries but batched
    // This can be faster when dealing with very large datasets
    
    // First, get all clients
    const clientsResult = await db
      .select()
      .from(client)
      .orderBy(desc(client.xataCreatedat));
    
    if (clientsResult.length === 0) {
      return [];
    }
    
    // Get all table mappings for all clients in one query
    const clientIds = clientsResult.map(c => c.xataId);
    const allTableMappings = await db
      .select()
      .from(tableMapping)
      .where(sql`${tableMapping.clientId} = ANY(${clientIds})`);
    
    // Create a map for fast table lookup
    const tablesByClientId = new Map<string, AssignedTable[]>();
    for (const mapping of allTableMappings) {
      if (!tablesByClientId.has(mapping.clientId)) {
        tablesByClientId.set(mapping.clientId, []);
      }
      tablesByClientId.get(mapping.clientId)!.push({
        xataId: mapping.xataId,
        tableName: mapping.tableName,
        tableSchema: mapping.tableSchema,
        description: mapping.description,
        isActive: mapping.isActive,
        xataCreatedat: mapping.xataCreatedat,
      });
    }
    
    // Combine clients with their tables
    const clientsWithTables = clientsResult.map(client => ({
      ...client,
      assignedTables: tablesByClientId.get(client.xataId) || []
    }));
    
    return clientsWithTables;
  } catch (error) {
    console.error("Failed to fetch clients with tables (optimized):", error);
    throw new Error("Failed to fetch clients with tables");
  }
}
