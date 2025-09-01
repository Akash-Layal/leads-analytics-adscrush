'use server';

import { db } from "@/db/writereplica";
import { client, tableMapping } from "@/db/writereplica/schema";
import { eq } from "drizzle-orm";

// Get all table mappings with client information
export async function getAllTableMappingsAction() {
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
          name: client.name,
          company: client.company,
        },
      })
      .from(tableMapping)
      .innerJoin(client, eq(tableMapping.clientId, client.xataId))
      .orderBy(tableMapping.xataUpdatedat);

    return { success: true, mappings: result };
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
) {
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

    return { success: true, mappingId: result[0].xataId };
  } catch (error) {
    console.error("Error updating table mapping:", error);
    return { success: false, error: "Failed to update table mapping" };
  }
}

// Get table mapping by ID
export async function getTableMappingByIdAction(mappingId: string) {
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

    return { success: true, mapping: result[0] };
  } catch (error) {
    console.error("Error getting table mapping by ID:", error);
    return { success: false, error: "Failed to get table mapping" };
  }
}

// Get display name for a table mapping (with fallback logic)
export async function getTableDisplayNameAction(mappingId: string) {
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

    return { success: true, displayName };
  } catch (error) {
    console.error("Error getting table display name:", error);
    return { success: false, error: "Failed to get table display name" };
  }
}

// Get all table mappings for a specific client
export async function getClientTableMappingsAction(clientId: string) {
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
      .where(eq(tableMapping.clientId, clientId))
      .orderBy(tableMapping.xataUpdatedat);

    return { success: true, mappings: result };
  } catch (error) {
    console.error("Error getting client table mappings:", error);
    return { success: false, error: "Failed to get client table mappings" };
  }
}
