-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "Client" (
	"xata_id" text DEFAULT ('rec_'::text || (xata_private.xid())::text) NOT NULL,
	"xata_version" integer DEFAULT 0 NOT NULL,
	"xata_createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"xata_updatedat" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "_pgroll_new_Client_xata_id_key" UNIQUE("xata_id"),
	CONSTRAINT "Client_xata_id_length_xata_id" CHECK (length(xata_id) < 256)
);

*/