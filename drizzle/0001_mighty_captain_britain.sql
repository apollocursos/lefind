CREATE TABLE `communities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int,
	`slug` varchar(140) NOT NULL,
	`name` varchar(180) NOT NULL,
	`visibility` enum('public','private') NOT NULL DEFAULT 'private',
	`city` varchar(120) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communities_id` PRIMARY KEY(`id`),
	CONSTRAINT `communities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `communityMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`profileId` int NOT NULL,
	`status` enum('pending','approved','blocked') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetKey` varchar(220) NOT NULL,
	`kind` enum('gold','sponsored_spot') NOT NULL,
	`profileId` int,
	`storeId` int,
	`paymentId` int,
	`status` enum('active','revoked','expired') NOT NULL DEFAULT 'revoked',
	`source` enum('payment','manual') NOT NULL DEFAULT 'payment',
	`manualOverride` enum('none','grant','revoke') NOT NULL DEFAULT 'none',
	`overrideByUserId` int,
	`overrideReason` varchar(255),
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entitlements_id` PRIMARY KEY(`id`),
	CONSTRAINT `entitlements_targetKey_unique` UNIQUE(`targetKey`)
);
--> statement-breakpoint
CREATE TABLE `paymentEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(32) NOT NULL DEFAULT 'stripe',
	`eventId` varchar(255) NOT NULL,
	`eventType` varchar(120) NOT NULL,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentEvents_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(32) NOT NULL DEFAULT 'stripe',
	`providerPaymentId` varchar(255),
	`providerEventId` varchar(255),
	`userId` int,
	`profileId` int,
	`storeId` int,
	`productType` enum('gold','sponsored_spot') NOT NULL,
	`amountCents` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'brl',
	`method` enum('pix','card') NOT NULL DEFAULT 'card',
	`status` enum('pending','approved','failed','refunded','canceled') NOT NULL DEFAULT 'pending',
	`metadataJson` text,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_providerPaymentId_unique` UNIQUE(`providerPaymentId`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`slug` varchar(140) NOT NULL,
	`name` varchar(160) NOT NULL,
	`role` varchar(160) NOT NULL,
	`bio` text,
	`city` varchar(120) NOT NULL,
	`neighborhood` varchar(120),
	`avatarUrl` text,
	`coverUrl` text,
	`verified` int NOT NULL DEFAULT 0,
	`gold` int NOT NULL DEFAULT 0,
	`sos` int NOT NULL DEFAULT 0,
	`availability` enum('open','next','full') NOT NULL DEFAULT 'open',
	`rating` decimal(3,2) NOT NULL DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`socialsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int,
	`storeId` int,
	`requesterName` varchar(160) NOT NULL,
	`requesterPhone` varchar(40),
	`description` text NOT NULL,
	`status` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`authorName` varchar(160) NOT NULL,
	`rating` int NOT NULL,
	`body` text NOT NULL,
	`verified` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`slug` varchar(140) NOT NULL,
	`title` varchar(180) NOT NULL,
	`summary` text,
	`beforeUrl` text,
	`afterUrl` text,
	`checklistJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serviceReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceReports_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sponsoredSpots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`keyword` varchar(120) NOT NULL,
	`region` varchar(160) NOT NULL,
	`budgetCents` int NOT NULL DEFAULT 0,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`status` enum('draft','active','paused','finished') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sponsoredSpots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int,
	`name` varchar(180) NOT NULL,
	`category` varchar(100) NOT NULL,
	`city` varchar(120) NOT NULL,
	`neighborhood` varchar(120),
	`description` text,
	`imageUrl` text,
	`productsJson` text,
	`sponsored` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stores_id` PRIMARY KEY(`id`)
);
