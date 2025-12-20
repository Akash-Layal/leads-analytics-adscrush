"use server";

import { db as dbReadReplica } from "@/db/readreplica";
import { db as dbWriteReplica } from "@/db/writereplica";
import { tableMapping } from "@/db/writereplica/schema";
import { sql } from "drizzle-orm";

// Helper function to parse count results
function parseCountResult(result: unknown): number {
  let count = 0;
  if (Array.isArray(result) && result.length > 0) {
    const dataRows = Array.isArray(result[0]) ? result[0] : result;
    if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === "object" && "count" in dataRows[0]) {
      count = Number((dataRows[0] as { count: unknown }).count) || 0;
    }
  }
  return count;
}

// Get all table names from read replica
export async function getAllReadReplicaTablesAction() {
  try {
    console.log("=== getAllReadReplicaTablesAction START ===");
    console.log("Getting table names from schema...");

    // Use the schema tables directly since we have them defined
    const schemaTables = [
      "gb_bb_maxx_hindi",
      "gb_de_addiction_hindi",
      "gb_divitiz_hindi",
      "gb_divitiz_tamil",
      "gb_hammer-lp-test-malay",
      "gb_herbal-thorex-gujrati",
      "gb_herbal-thorex-hindi",
      "gb_keto_plus_hindi",
      "gb_knight-king-gold-tamil",
      "gb_kub-deepam-tamil",
      "gb_liveda-english",
      "gb_mans-power-telugu",
      "gb_man_care_hindi",
      "gb_man_click_tamil",
      "gb_men-x-malay",
      "gb_men-x-tamil",
      "gb_men-x-telugu",
      "gb_power-x_hindi",
      "gb_pwr_up_hindi",
      "gb_pwr_up_tamil",
      "gb_slimo_veda_gujrati",
      "gb_spartan_hindi",
      "gb_strong_men_hindi",
      "gb_xeno_prost_hindi",
      "gb_force_one_hindi",
      "gb_nonstop_kama_hindi",
      "gb_jonitas_hindi",
      "gb_energy_booster_hindi",
      "gb_b_boost_hindi",
      "gb_bb_maxx_tamil",
      "gb_jonitas_tamil",
      "gb_keto_max_tamil",
      "gb_pile_xpert_tamil",
      "gb_bold_pro_maxx_tamil",
      "gb_horny_jack_hindi",
      "gb_bb_enhance_cream_hindi",
      "gb_be_care_cream_tamil",
    ];

    // console.log("Schema tables:", schemaTables);
    console.log("=== getAllReadReplicaTablesAction END (success) ===");

    return { success: true, tables: schemaTables };
  } catch (error) {
    console.error("=== getAllReadReplicaTablesAction ERROR ===", error);
    return { success: false, error: "Failed to get tables" };
  }
}

// Get assigned tables for all clients
export async function getAssignedTablesAction() {
  try {
    const result = await dbWriteReplica
      .select({
        tableName: tableMapping.tableName,
      })
      .from(tableMapping);

    const assignedTables = result.map((row) => row.tableName);
    return { success: true, assignedTables };
  } catch (error) {
    console.error("Error getting assigned tables:", error);
    return { success: false, error: "Failed to get assigned tables" };
  }
}

// Get assigned tables for a specific client
export async function getClientAssignedTablesAction(clientId: string) {
  try {
    const result = await dbWriteReplica
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
      .where(sql`${tableMapping.clientId} = ${clientId}`);

    return { success: true, tables: result };
  } catch (error) {
    console.error("Error getting client assigned tables:", error);
    return { success: false, error: "Failed to get client assigned tables" };
  }
}

// Remove a table mapping (hard delete to allow reassignment)
export async function removeTableMappingAction(tableMappingId: string) {
  try {
    console.log(`=== removeTableMappingAction START ===`);
    console.log(`Removing table mapping with ID: ${tableMappingId}`);

    // Delete the table mapping record to allow reassignment
    const result = await dbWriteReplica.delete(tableMapping).where(sql`${tableMapping.xataId} = ${tableMappingId}`);

    console.log(`Delete result:`, result);
    console.log(`=== removeTableMappingAction END (success) ===`);

    return { success: true };
  } catch (error) {
    console.error(`=== removeTableMappingAction ERROR ===`);
    console.error(`Failed to remove table mapping ${tableMappingId}:`, error);
    return { success: false, error: `Failed to remove table mapping: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

// Get available tables (not assigned to any client)
export async function getAvailableTablesAction() {
  try {
    console.log("=== getAvailableTablesAction START ===");
    console.log("Getting available tables...");

    const [allTablesResult, assignedTablesResult] = await Promise.all([getAllReadReplicaTablesAction(), getAssignedTablesAction()]);

    console.log("All tables result:", allTablesResult);
    console.log("Assigned tables result:", assignedTablesResult);

    if (!allTablesResult.success || !assignedTablesResult.success) {
      console.error("Failed to get table data:", { allTablesResult, assignedTablesResult });
      return { success: false, error: "Failed to get table data" };
    }

    const allTables = allTablesResult.tables || [];
    const assignedTables = assignedTablesResult.assignedTables || [];

    console.log("All tables:", allTables);
    console.log("Assigned tables:", assignedTables);

    const availableTables = allTables.filter((table) => !assignedTables.includes(table));
    console.log("Available tables after filtering:", availableTables);
    console.log("=== getAvailableTablesAction END ===");

    return { success: true, availableTables };
  } catch (error) {
    console.error("Error getting available tables:", error);
    return { success: false, error: "Failed to get available tables" };
  }
}

// Get record counts from multiple tables
export async function getTableCountsAction(tableNames: string[]) {
  try {
    console.log("=== getTableCountsAction START ===");
    console.log("Getting counts for tables:", tableNames);

    if (tableNames.length === 0) {
      return { success: true, counts: [] };
    }

    const counts: { tableName: string; count: number }[] = [];

    // Get count for each table
    for (const tableName of tableNames) {
      try {
        const result = await dbReadReplica.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`);
        console.log(`Count result for ${tableName}:`, result);

        let count = 0;
        if (Array.isArray(result) && result.length > 0) {
          const dataRows = Array.isArray(result[0]) ? result[0] : result;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === "object" && "count" in dataRows[0]) {
            count = Number(dataRows[0].count) || 0;
          }
        }

        counts.push({ tableName, count });
        console.log(`Table ${tableName} has ${count} records`);
      } catch (tableError) {
        console.error(`Error getting count for table ${tableName}:`, tableError);
        // Add table with 0 count if there's an error
        counts.push({ tableName, count: 0 });
      }
    }

    console.log("Final counts:", counts);
    console.log("=== getTableCountsAction END ===");

    return { success: true, counts };
  } catch (error) {
    console.error("=== getTableCountsAction ERROR ===", error);
    return { success: false, error: "Failed to get table counts" };
  }
}

// Get daily stats (today, yesterday, this month, last month) from multiple tables
export async function getDailyStatsAction(tableNames: string[]) {
  try {
    console.log("=== getDailyStatsAction START ===");
    console.log("Getting daily stats for tables:", tableNames);

    if (tableNames.length === 0) {
      return {
        success: true,
        stats: [],
      };
    }

    // Get current date and calculate date ranges
    const now = new Date();

    // Today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // This month
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Last month
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    console.log("Date ranges for timestamp queries:", {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
      yesterday: yesterday.toISOString(),
      thisMonth: thisMonth.toISOString(),
      lastMonth: lastMonth.toISOString(),
    });

    const tableStats: Array<{
      tableName: string;
      today: number;
      yesterday: number;
      thisMonth: number;
      lastMonth: number;
      totalRecords: number;
      hasData: boolean;
    }> = [];

    // Get stats for each table
    for (const tableName of tableNames) {
      try {
        console.log(`=== Processing table: ${tableName} ===`);

        // First, let's check if table has any records at all - use the same approach as getTableCountsAction
        const totalRecordsResult = await dbReadReplica.execute(sql`SELECT COUNT(*) as total FROM ${sql.identifier(tableName)}`);

        let totalRecords = 0;
        if (Array.isArray(totalRecordsResult) && totalRecordsResult.length > 0) {
          const dataRows = Array.isArray(totalRecordsResult[0]) ? totalRecordsResult[0] : totalRecordsResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === "object" && "total" in dataRows[0]) {
            totalRecords = Number(dataRows[0].total) || 0;
          }
        }

        console.log(`Total records in ${tableName}:`, totalRecords);
        console.log(`Raw totalRecordsResult:`, totalRecordsResult);

        // If no records, add table with 0 stats
        if (totalRecords === 0) {
          console.log(`Table ${tableName} has no records, adding with 0 stats`);
          tableStats.push({
            tableName,
            today: 0,
            yesterday: 0,
            thisMonth: 0,
            lastMonth: 0,
            totalRecords: 0,
            hasData: false,
          });
          continue;
        }

        console.log(`Using timestamp queries for ${tableName}`);

        // Execute all queries in parallel for better performance using created_at_ts timestamp
        const [todayResult, yesterdayResult, thisMonthResult, lastMonthResult] = await Promise.all([
          dbReadReplica.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE created_at_ts >= ${today} AND created_at_ts < ${tomorrow}`),
          dbReadReplica.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE created_at_ts >= ${yesterday} AND created_at_ts < ${today}`),
          dbReadReplica.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE created_at_ts >= ${thisMonth}`),
          dbReadReplica.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)} WHERE created_at_ts >= ${lastMonth} AND created_at_ts < ${thisMonth}`),
        ]);

        // Parse results using the same logic as getTableCountsAction
        let todayCount = 0;
        if (Array.isArray(todayResult) && todayResult.length > 0) {
          const dataRows = Array.isArray(todayResult[0]) ? todayResult[0] : todayResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === "object" && "count" in dataRows[0]) {
            todayCount = Number(dataRows[0].count) || 0;
          }
        }

        let yesterdayCount = 0;
        if (Array.isArray(yesterdayResult) && yesterdayResult.length > 0) {
          const dataRows = Array.isArray(yesterdayResult[0]) ? yesterdayResult[0] : yesterdayResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === "object" && "count" in dataRows[0]) {
            yesterdayCount = Number(dataRows[0].count) || 0;
          }
        }

        let thisMonthCount = 0;
        if (Array.isArray(thisMonthResult) && thisMonthResult.length > 0) {
          const dataRows = Array.isArray(thisMonthResult[0]) ? thisMonthResult[0] : thisMonthResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === "object" && "count" in dataRows[0]) {
            thisMonthCount = Number(dataRows[0].count) || 0;
          }
        }

        let lastMonthCount = 0;
        if (Array.isArray(lastMonthResult) && lastMonthResult.length > 0) {
          const dataRows = Array.isArray(lastMonthResult[0]) ? lastMonthResult[0] : lastMonthResult;
          if (dataRows.length > 0 && dataRows[0] && typeof dataRows[0] === "object" && "count" in dataRows[0]) {
            lastMonthCount = Number(dataRows[0].count) || 0;
          }
        }

        console.log(`Table ${tableName} stats:`, { todayCount, yesterdayCount, thisMonthCount, lastMonthCount, totalRecords });
        console.log(`Raw results:`, { todayResult, yesterdayResult, thisMonthResult, lastMonthResult });

        // Add table stats
        tableStats.push({
          tableName,
          today: todayCount,
          yesterday: yesterdayCount,
          thisMonth: thisMonthCount,
          lastMonth: lastMonthCount,
          totalRecords,
          hasData: true,
        });
      } catch (tableError) {
        console.error(`Error getting daily stats for table ${tableName}:`, tableError);
        // Add table with 0 stats if there's an error
        tableStats.push({
          tableName,
          today: 0,
          yesterday: 0,
          thisMonth: 0,
          lastMonth: 0,
          totalRecords: 0,
          hasData: false,
        });
      }
    }

    console.log("Final table stats:", tableStats);
    console.log("=== getDailyStatsAction END ===");

    return { success: true, stats: tableStats };
  } catch (error) {
    console.error("=== getDailyStatsAction ERROR ===", error);
    return { success: false, error: "Failed to get daily stats" };
  }
}
