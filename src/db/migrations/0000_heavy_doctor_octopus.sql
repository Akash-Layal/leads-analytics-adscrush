-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `gb_bb_maxx_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_de_addiction_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_divitiz_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_divitiz_tamil` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_hammer-lp-test-malay` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_herbal-thorex-gujrati` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL,
	CONSTRAINT `api_lead_id_idx` UNIQUE(`api lead id`)
);
--> statement-breakpoint
CREATE TABLE `gb_herbal-thorex-hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL,
	CONSTRAINT `api_lead_id_idx` UNIQUE(`api lead id`)
);
--> statement-breakpoint
CREATE TABLE `gb_keto_plus_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_knight-king-gold-tamil` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_kub-deepam-tamil` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_liveda-english` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_mans-power-telugu` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_man_care_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_man_click_tamil` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_men-x-malay` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_men-x-tamil` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_men-x-telugu` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_power-x_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_pwr_up_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_pwr_up_tamil` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_slimo_veda_gujrati` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL,
	CONSTRAINT `api_lead_id_idx` UNIQUE(`api lead id`)
);
--> statement-breakpoint
CREATE TABLE `gb_spartan_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_strong_men_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`shipping` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gb_xeno_prost_hindi` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`api lead id` varchar(255) DEFAULT 'NULL',
	`domain` varchar(255) NOT NULL,
	`lp name` varchar(100) NOT NULL,
	`lang` varchar(100) NOT NULL,
	`product name` varchar(200) NOT NULL,
	`quantity` varchar(200) NOT NULL,
	`price` varchar(200) NOT NULL,
	`payment type` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`ip` varchar(200) NOT NULL,
	`country` varchar(200) NOT NULL,
	`region` varchar(200) NOT NULL,
	`city` varchar(200) NOT NULL,
	`address` varchar(500) NOT NULL,
	`landmark` varchar(250) NOT NULL,
	`pincode` varchar(200) NOT NULL,
	`created at` varchar(200) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_bb_maxx_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_de_addiction_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_divitiz_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_divitiz_tamil` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_hammer-lp-test-malay` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_herbal-thorex-gujrati` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_herbal-thorex-hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_keto_plus_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_knight-king-gold-tamil` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_kub-deepam-tamil` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_liveda-english` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_mans-power-telugu` (`domain`);--> statement-breakpoint
CREATE INDEX `api_lead_id_idx` ON `gb_mans-power-telugu` (`api lead id`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_man_care_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_man_click_tamil` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_men-x-malay` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_men-x-tamil` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_men-x-telugu` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_power-x_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_pwr_up_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_pwr_up_tamil` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_slimo_veda_gujrati` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_spartan_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_strong_men_hindi` (`domain`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `gb_xeno_prost_hindi` (`domain`);
*/