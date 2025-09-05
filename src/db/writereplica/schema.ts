import { pgTable, unique, check, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { sql } from "drizzle-orm"

export const client_status = pgEnum("client_status", ["active", "inactive", "pending"]);

export const client = pgTable("Client", {
	xataId: text("xata_id").default(sql`(\'rec_\'::text || (xata_private.xid())::text)`).notNull(),
	xataVersion: integer("xata_version").default(0).notNull(),
	xataCreatedat: timestamp("xata_createdat", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	xataUpdatedat: timestamp("xata_updatedat", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text("name").notNull(),
	phone: text("phone"),
	company: text("company").notNull(),
	email: text("email").notNull(),
	status: text("status").default("active").notNull(),
}, (table) => [
	unique("_pgroll_new_Client_xata_id_key").on(table.xataId),
	check("Client_xata_id_length_xata_id", sql`length(xata_id) < 256`),
]);

export const tableMapping = pgTable("TableMapping", {
	xataId: text("xata_id").default(sql`(\'rec_\'::text || (xata_private.xid())::text)`).notNull(),
	xataVersion: integer("xata_version").default(0).notNull(),
	xataCreatedat: timestamp("xata_createdat", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	xataUpdatedat: timestamp("xata_updatedat", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	clientId: text("client_id").notNull(),
	tableName: text("table_name").notNull(),
	imageUrl: text("image_url"),
	customTableName: text("custom_table_name"),
	tableSchema: text("table_schema").notNull(),
	description: text("description"),
	isActive: text("is_active").default("true").notNull(),
}, (table) => [
	unique("_pgroll_new_TableMapping_xata_id_key").on(table.xataId),
	unique("_pgroll_new_TableMapping_table_name_key").on(table.tableName),
	check("TableMapping_xata_id_length_xata_id", sql`length(xata_id) < 256`),
]);

// Relations
export const clientRelations = relations(client, ({ many }) => ({
	tableMappings: many(tableMapping),
}));

export const tableMappingRelations = relations(tableMapping, ({ one }) => ({
	client: one(client, {
		fields: [tableMapping.clientId],
		references: [client.xataId],
	}),
}));
