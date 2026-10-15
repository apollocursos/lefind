CREATE TABLE `serviceCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`normalizedName` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serviceCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceCategories_normalizedName_unique` UNIQUE(`normalizedName`),
	CONSTRAINT `serviceCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `whatsapp` varchar(32);