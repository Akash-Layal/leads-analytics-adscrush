"use server";
// leadService.ts
import { dbReadReplica } from "@/db/readreplica";
import { db } from "@/db/writereplica";
import * as schema from "@/db/writereplica/schema";
import { tableMapping } from "@/db/writereplica/schema";
import { eq, sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { RowDataPacket } from "mysql2";
import postgres from "postgres";
import { fromIST, getCurrentISTDate } from "@/lib/helpers/date";

type TableRowCount = {
  tableName: string;
  displayName: string;
  count: number;         // current period count
  previousCount: number; // previous period count (same duration before)
};

function formatMySQLDateTimeUTC(d: Date): string {
  // Convert Date → UTC datetime string (YYYY-MM-DD HH:mm:ss)
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Compute UTC window for IST calendar dates using proper timezone handling.
 * If no dates passed → default to "today in IST".
 */
function computeUTCWindowFromIST(
  startDate?: string,
  endDate?: string
): { startUTC: Date; endUTC: Date } {
  if (startDate && endDate) {
    // Parse IST date strings and convert to UTC for database queries
    const [sy, sm, sd] = startDate.split("-").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);

    // Create IST dates (start of day and end of day)
    const istStartDate = new Date(sy, sm - 1, sd, 0, 0, 0);
    const istEndDate = new Date(ey, em - 1, ed, 23, 59, 59, 999);

    // Convert IST dates to UTC for database queries
    const startUTC = fromIST(istStartDate);
    const endUTC = fromIST(istEndDate);

    return { startUTC, endUTC };
  }

  // Default: today in IST
  const todayIST = getCurrentISTDate();
  const startOfDayIST = new Date(todayIST.getFullYear(), todayIST.getMonth(), todayIST.getDate(), 0, 0, 0);
  const endOfDayIST = new Date(todayIST.getFullYear(), todayIST.getMonth(), todayIST.getDate(), 23, 59, 59, 999);

  // Convert IST dates to UTC for database queries
  const startUTC = fromIST(startOfDayIST);
  const endUTC = fromIST(endOfDayIST);

  return { startUTC, endUTC };
}

/**
 * Extract count value from MySQL2 result
 */
function extractCount(result: unknown): number {
  const rows = Array.isArray(result) ? (result[0] as RowDataPacket[]) : (result as RowDataPacket[]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n = Number((rows?.[0] as any)?.count ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export class LeadService {
  constructor(
    private writeDb: PostgresJsDatabase<typeof schema> & {
      $client: postgres.Sql<Record<string, unknown>>;
    },
    private readDb: MySql2Database
  ) {}

  /**
   * Get row counts for current and previous period (growth %).
   * Dates are treated as IST calendar dates.
   */
  async getTableWiseCountsWithGrowth(
    startDate?: string,
    endDate?: string
  ): Promise<TableRowCount[]> {
    // Ensure MySQL session uses UTC
    await this.readDb.execute(sql`SET time_zone = '+00:00'`);

    // Compute IST → UTC window
    const { startUTC, endUTC } = computeUTCWindowFromIST(startDate, endDate);
    const durationMs = endUTC.getTime() - startUTC.getTime();
    const prevStartUTC = new Date(startUTC.getTime() - durationMs);
    const prevEndUTC = new Date(endUTC.getTime() - durationMs);

    const startS = formatMySQLDateTimeUTC(startUTC);
    const endS = formatMySQLDateTimeUTC(endUTC);
    const prevStartS = formatMySQLDateTimeUTC(prevStartUTC);
    const prevEndS = formatMySQLDateTimeUTC(prevEndUTC);

    // Get active table mappings
    const mappings = await this.writeDb
      .select({
        tableName: tableMapping.tableName,
        isActive: tableMapping.isActive,
        displayName: tableMapping.customTableName,
      })
      .from(tableMapping)
      .where(eq(tableMapping.isActive, "true"));

    const results: TableRowCount[] = [];

    // Query each table
    for (const { tableName, displayName } of mappings) {
      // Current period
      const currentRes = await this.readDb.execute(
        sql`
          SELECT COUNT(*) AS count
          FROM ${sql.identifier(tableName)}
          WHERE created_at_ts >= ${startS}
            AND created_at_ts <  ${endS}
        `
      );
      const currentCount = extractCount(currentRes);

      // Previous period
      const prevRes = await this.readDb.execute(
        sql`
          SELECT COUNT(*) AS count
          FROM ${sql.identifier(tableName)}
          WHERE created_at_ts >= ${prevStartS}
            AND created_at_ts <  ${prevEndS}
        `
      );
      const previousCount = extractCount(prevRes);

      results.push({
        tableName,
        displayName: displayName ?? tableName,
        count: currentCount,
        previousCount,
      });
    }

    return results.sort((a, b) => b.count - a.count);
  }

  /**
   * Get only total row count across all mapped tables (current period)
   */
  async getTotalCount(startDate?: string, endDate?: string): Promise<number> {
    const tableCounts = await this.getTableWiseCountsWithGrowth(startDate, endDate);
    return tableCounts.reduce((sum, t) => sum + t.count, 0);
  }
}

export const leadService = new LeadService(db, dbReadReplica);
