CREATE TABLE `ambassadors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(40) NOT NULL,
	`name` varchar(160) NOT NULL,
	`referralCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ambassadors_id` PRIMARY KEY(`id`),
	CONSTRAINT `ambassadors_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `referralCode` varchar(40);