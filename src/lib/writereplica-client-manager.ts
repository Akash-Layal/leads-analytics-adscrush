import { dbWriteReplica } from "@/db/writereplica";
import { clients, tableMappings, tableStats, syncLogs, clientStatusEnum, syncTypeEnum, syncStatusEnum } from "@/db/writereplica/schema";
import { eq, and, desc } from "drizzle-orm";

// Type definitions for better type safety
export type ClientStatus = "active" | "inactive" | "pending";
export type SyncType = "full" | "incremental" | "schema";
export type SyncStatus = "success" | "failed" | "partial";

// Client Management Functions
export async function createClient(clientData: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: ClientStatus;
}) {
  try {
    const result = await dbWriteReplica.insert(clients).values({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      company: clientData.company,
      status: clientData.status || "active",
    });
    return { success: true, clientId: (result as any).insertId };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: "Failed to create client" };
  }
}

export async function getAllClients() {
  try {
    const result = await dbWriteReplica
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));
    
    return { success: true, clients: result };
  } catch (error) {
    console.error("Error getting clients:", error);
    return { success: false, error: "Failed to get clients" };
  }
}
