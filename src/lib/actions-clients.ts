'use server';

import { db } from "@/db/writereplica";
import { client, tableMapping } from "@/db/writereplica/schema";
import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getClientAssignedTablesAction } from "./actions-tables";
import { getTableCountsAction, getDailyStatsAction } from "./actions-tables";

export type ClientStatus = "active" | "inactive" | "pending";

export async function createClientAction(clientData: {
  name: string;
  email: string;
  phone?: string;
  company: string;
  status: ClientStatus;
}) {
  try {
    const result = await db.insert(client).values({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      company: clientData.company,
      status: clientData.status,
    }).returning({ xataId: client.xataId });
    
    return { success: true, clientId: result[0]?.xataId };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: "Failed to create client" };
  }
}

export async function getAllClientsAction() {
  try {
    const result = await db
      .select()
      .from(client)
      .orderBy(desc(client.xataCreatedat));
    
    return { success: true, clients: result };
  } catch (error) {
    console.error("Error getting clients:", error);
    return { success: false, error: "Failed to get clients" };
  }
}

export async function getClientByIdAction(clientId: string) {
  try {
    const result = await db
      .select()
      .from(client)
      .where(sql`${client.xataId} = ${clientId}`)
      .limit(1);
    
    if (result.length === 0) {
      return { success: false, error: "Client not found" };
    }
    
    return { success: true, client: result[0] };
  } catch (error) {
    console.error("Error getting client by ID:", error);
    return { success: false, error: "Failed to get client" };
  }
}

export async function createTableMappingAction(mappingData: {
  clientId: string;
  tableName: string;
  tableSchema: string;
  customTableName?: string;
  description?: string;
}) {
  try {
    const result = await db.insert(tableMapping).values({
      clientId: mappingData.clientId,
      tableName: mappingData.tableName,
      customTableName: mappingData.customTableName || null,
      tableSchema: mappingData.tableSchema,
      description: mappingData.description,
      isActive: "true",
    }).returning({ xataId: tableMapping.xataId });
    
    return { success: true, mappingId: result[0]?.xataId };
  } catch (error) {
    console.error("Error creating table mapping:", error);
    return { success: false, error: "Failed to create table mapping" };
  }
}

export async function deleteClientAction(clientId: string) {
  try {
    // First delete all table mappings for this client
    await db.delete(tableMapping).where(sql`${tableMapping.clientId} = ${clientId}`);
    
    // Then delete the client
    const result = await db.delete(client).where(sql`${client.xataId} = ${clientId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { success: false, error: "Failed to delete client" };
  }
}

export async function getClientDetailsAction(clientId: string) {
  try {
    // Fetch client details
    const clientResult = await getClientByIdAction(clientId);
    if (!clientResult.success || !clientResult.client) {
      return { success: false, error: "Client not found" };
    }

    // Fetch assigned tables
    const tablesResult = await getClientAssignedTablesAction(clientId);
    const assignedTables = tablesResult.success && tablesResult.tables ? tablesResult.tables : [];

    // Fetch table counts
    const countsResult = await getTableCountsAction(assignedTables.map((t: { tableName: string }) => t.tableName));
    const counts = countsResult.success && countsResult.counts ? countsResult.counts : [];
    
    // Fetch daily stats
    const statsResult = await getDailyStatsAction(assignedTables.map((t: { tableName: string }) => t.tableName));
    const stats = statsResult.success && statsResult.stats ? statsResult.stats : [];

    // Calculate total count
    const total = counts.reduce((sum: number, table: { count: number }) => sum + table.count, 0);

    return {
      success: true,
      data: {
        client: {
          ...clientResult.client,
          assignedTables
        },
        tableCounts: counts,
        totalCount: total,
        dailyStats: stats
      }
    };
  } catch (error) {
    console.error("Error getting client details:", error);
    return { success: false, error: "Failed to get client details" };
  }
}
