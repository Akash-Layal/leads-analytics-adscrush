import { sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { globalCache } from "@/lib/cache";
import { fromIST, getCurrentISTDate } from "@/lib/helpers/date";

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeExecute<T>(db: MySql2Database, query: any): Promise<T[]> {
    const result = await db.execute(query);

    if (Array.isArray(result) && Array.isArray(result[0])) {
        return result[0] as T[];
    }
    if (Array.isArray(result)) {
        return result as unknown as T[];
    }
    return [];
}

async function getAllTables(db: MySql2Database): Promise<string[]> {
    const rows = await safeExecute<{ table_name: string }>(
        db,
        sql`SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()`
    );
    return rows.map((r) => r.table_name);
}

// Convert IST day/week/month boundaries into UTC strings using proper timezone handling
function getUtcRangeForPeriod(
    period: "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth"
): { startUtc: string; endUtc: string } {
    const nowIST = getCurrentISTDate();

    let startIST: Date;
    let endIST: Date;

    switch (period) {
        case "today": {
            startIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 0, 0, 0);
            endIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 23, 59, 59, 999);
            break;
        }
        case "yesterday": {
            const yesterday = new Date(nowIST);
            yesterday.setDate(yesterday.getDate() - 1);
            startIST = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
            endIST = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
            break;
        }
        case "thisWeek": {
            const day = nowIST.getDay(); // 0 = Sunday
            const diffToMonday = (day + 6) % 7; // shift so Monday=0
            const monday = new Date(nowIST);
            monday.setDate(monday.getDate() - diffToMonday);
            startIST = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0);
            const sunday = new Date(monday);
            sunday.setDate(sunday.getDate() + 6);
            endIST = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);
            break;
        }
        case "lastWeek": {
            const day = nowIST.getDay();
            const diffToMonday = (day + 6) % 7;
            const thisWeekMonday = new Date(nowIST);
            thisWeekMonday.setDate(thisWeekMonday.getDate() - diffToMonday);
            const lastWeekMonday = new Date(thisWeekMonday);
            lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);
            startIST = new Date(lastWeekMonday.getFullYear(), lastWeekMonday.getMonth(), lastWeekMonday.getDate(), 0, 0, 0);
            const lastWeekSunday = new Date(lastWeekMonday);
            lastWeekSunday.setDate(lastWeekSunday.getDate() + 6);
            endIST = new Date(lastWeekSunday.getFullYear(), lastWeekSunday.getMonth(), lastWeekSunday.getDate(), 23, 59, 59, 999);
            break;
        }
        case "thisMonth": {
            startIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), 1, 0, 0, 0);
            endIST = new Date(nowIST.getFullYear(), nowIST.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of current month
            break;
        }
        case "lastMonth": {
            startIST = new Date(nowIST.getFullYear(), nowIST.getMonth() - 1, 1, 0, 0, 0);
            endIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), 0, 23, 59, 59, 999); // Last day of last month
            break;
        }
    }

    // Convert IST dates to UTC for database queries
    const startUTC = fromIST(startIST);
    const endUTC = fromIST(endIST);

    const startUtc = startUTC.toISOString().slice(0, 19).replace("T", " ");
    const endUtc = endUTC.toISOString().slice(0, 19).replace("T", " ");

    return { startUtc, endUtc };
}

async function countLeadsInRange(
    db: MySql2Database,
    startUtc: string,
    endUtc: string,
    cacheKey: string
): Promise<number> {
    const cached = globalCache.get<number>(cacheKey);
    if (cached !== null) return cached;

    try {
        const tables = await getAllTables(db);
        let total = 0;

        for (const table of tables) {
            const rows = await safeExecute<{ count: number }>(
                db,
                sql.raw(
                    `SELECT COUNT(*) as count 
           FROM \`${table}\` 
           WHERE created_at_ts >= '${startUtc}' 
             AND created_at_ts < '${endUtc}'`
                )
            );
            total += rows.length ? Number(rows[0].count) || 0 : 0;
        }

        globalCache.set(cacheKey, total, { ttl: 5 * 60 * 1000 }); // 5 min cache
        return total;
    } catch (error) {
        console.error(`❌ Error in countLeadsInRange(${cacheKey}):`, error);
        return 0;
    }
}

/* --------------------------------------------------
   Public API
-------------------------------------------------- */

// 1. Total rows (no date filter)
export const getTotalRowCount = async (db: MySql2Database): Promise<number> => {
    const cacheKey = "getTotalRowCount:total";

    const cached = globalCache.get<number>(cacheKey);
    if (cached !== null) return cached;

    try {
        const tables = await getAllTables(db);
        let totalCount = 0;

        for (const table of tables) {
            const rows = await safeExecute<{ count: number }>(
                db,
                sql.raw(`SELECT COUNT(*) as count FROM \`${table}\``)
            );
            totalCount += rows.length ? Number(rows[0].count) || 0 : 0;
        }

        globalCache.set(cacheKey, totalCount, { ttl: 5 * 60 * 1000 });
        return totalCount;
    } catch (error) {
        console.error("❌ Error in getTotalRowCount:", error);
        return 0;
    }
};

// 2. Period-based counts
export const getTodayLeadsCount = async (db: MySql2Database) => {
    const { startUtc, endUtc } = getUtcRangeForPeriod("today");
    return countLeadsInRange(db, startUtc, endUtc, "leads:today");
};

export const getYesterdayLeadsCount = async (db: MySql2Database) => {
    const { startUtc, endUtc } = getUtcRangeForPeriod("yesterday");
    return countLeadsInRange(db, startUtc, endUtc, "leads:yesterday");
};

export const getThisWeekLeadsCount = async (db: MySql2Database) => {
    const { startUtc, endUtc } = getUtcRangeForPeriod("thisWeek");
    return countLeadsInRange(db, startUtc, endUtc, "leads:thisWeek");
};

export const getLastWeekLeadsCount = async (db: MySql2Database) => {
    const { startUtc, endUtc } = getUtcRangeForPeriod("lastWeek");
    return countLeadsInRange(db, startUtc, endUtc, "leads:lastWeek");
};

export const getThisMonthLeadsCount = async (db: MySql2Database) => {
    const { startUtc, endUtc } = getUtcRangeForPeriod("thisMonth");
    return countLeadsInRange(db, startUtc, endUtc, "leads:thisMonth");
};

export const getLastMonthLeadsCount = async (db: MySql2Database) => {
    const { startUtc, endUtc } = getUtcRangeForPeriod("lastMonth");
    return countLeadsInRange(db, startUtc, endUtc, "leads:lastMonth");
};
