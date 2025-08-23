CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(50),
	`company` varchar(255),
	`client_status` enum('active','inactive','pending') DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`table_mapping_id` int NOT NULL,
	`sync_type` enum('full','incremental','schema') NOT NULL,
	`sync_status` enum('success','failed','partial') NOT NULL,
	`records_processed` int NOT NULL DEFAULT 0,
	`records_added` int NOT NULL DEFAULT 0,
	`records_updated` int NOT NULL DEFAULT 0,
	`records_deleted` int NOT NULL DEFAULT 0,
	`error_message` text,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`duration` int
);
--> statement-breakpoint
CREATE TABLE `table_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`read_replica_table_name` varchar(255) NOT NULL,
	`custom_table_name` varchar(255),
	`description` text,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`last_sync_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mapping_unique_idx` UNIQUE(`client_id`,`read_replica_table_name`)
);
--> statement-breakpoint
CREATE TABLE `table_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`table_mapping_id` int NOT NULL,
	`record_count` int NOT NULL DEFAULT 0,
	`table_size_mb` decimal(10,2) NOT NULL DEFAULT '0.00',
	`last_record_count` int NOT NULL DEFAULT 0,
	`growth_rate` decimal(5,2) DEFAULT '0.00',
	`last_updated` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
DROP TABLE `gb_bb_maxx_hindi`;--> statement-breakpoint
DROP TABLE `gb_de_addiction_hindi`;--> statement-breakpoint
DROP TABLE `gb_divitiz_hindi`;--> statement-breakpoint
DROP TABLE `gb_divitiz_tamil`;--> statement-breakpoint
DROP TABLE `gb_hammer-lp-test-malay`;--> statement-breakpoint
DROP TABLE `gb_herbal-thorex-gujrati`;--> statement-breakpoint
DROP TABLE `gb_herbal-thorex-hindi`;--> statement-breakpoint
DROP TABLE `gb_keto_plus_hindi`;--> statement-breakpoint
DROP TABLE `gb_knight-king-gold-tamil`;--> statement-breakpoint
DROP TABLE `gb_kub-deepam-tamil`;--> statement-breakpoint
DROP TABLE `gb_liveda-english`;--> statement-breakpoint
DROP TABLE `gb_mans-power-telugu`;--> statement-breakpoint
DROP TABLE `gb_man_care_hindi`;--> statement-breakpoint
DROP TABLE `gb_man_click_tamil`;--> statement-breakpoint
DROP TABLE `gb_men-x-malay`;--> statement-breakpoint
DROP TABLE `gb_men-x-tamil`;--> statement-breakpoint
DROP TABLE `gb_men-x-telugu`;--> statement-breakpoint
DROP TABLE `gb_power-x_hindi`;--> statement-breakpoint
DROP TABLE `gb_pwr_up_hindi`;--> statement-breakpoint
DROP TABLE `gb_pwr_up_tamil`;--> statement-breakpoint
DROP TABLE `gb_slimo_veda_gujrati`;--> statement-breakpoint
DROP TABLE `gb_spartan_hindi`;--> statement-breakpoint
DROP TABLE `gb_strong_men_hindi`;--> statement-breakpoint
DROP TABLE `gb_xeno_prost_hindi`;--> statement-breakpoint
CREATE INDEX `client_name_idx` ON `clients` (`name`);--> statement-breakpoint
CREATE INDEX `client_status_idx` ON `clients` (`client_status`);--> statement-breakpoint
CREATE INDEX `sync_client_idx` ON `sync_logs` (`client_id`);--> statement-breakpoint
CREATE INDEX `sync_mapping_idx` ON `sync_logs` (`table_mapping_id`);--> statement-breakpoint
CREATE INDEX `sync_status_idx` ON `sync_logs` (`sync_status`);--> statement-breakpoint
CREATE INDEX `sync_started_idx` ON `sync_logs` (`started_at`);--> statement-breakpoint
CREATE INDEX `mapping_client_idx` ON `table_mappings` (`client_id`);--> statement-breakpoint
CREATE INDEX `mapping_read_table_idx` ON `table_mappings` (`read_replica_table_name`);--> statement-breakpoint
CREATE INDEX `stats_client_idx` ON `table_stats` (`client_id`);--> statement-breakpoint
CREATE INDEX `stats_mapping_idx` ON `table_stats` (`table_mapping_id`);--> statement-breakpoint
CREATE INDEX `stats_updated_idx` ON `table_stats` (`last_updated`);