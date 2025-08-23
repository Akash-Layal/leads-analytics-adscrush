import { pgTable, unique, check, text, integer, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const client = pgTable("Client", {
	xataId: text("xata_id").default(sql`(\'rec_\'::text || (xata_private.xid())::text)`).notNull(),
	xataVersion: integer("xata_version").default(0).notNull(),
	xataCreatedat: timestamp("xata_createdat", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	xataUpdatedat: timestamp("xata_updatedat", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("_pgroll_new_Client_xata_id_key").on(table.xataId),
	check("Client_xata_id_length_xata_id", sql`length(xata_id) < 256`),
]);
