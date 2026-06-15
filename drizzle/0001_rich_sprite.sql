CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoUrl` varchar(2048) NOT NULL,
	`videoTitle` varchar(512),
	`videoThumbnail` varchar(2048),
	`transcriptText` text,
	`ocrText` text,
	`mergedContent` text,
	`analysisStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`claimText` text NOT NULL,
	`claimOrder` int,
	`verdict` enum('صحيح','غير مدعوم','مضلل'),
	`explanation` text,
	`confidence` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` int NOT NULL,
	`sourceUrl` varchar(2048) NOT NULL,
	`sourceTitle` varchar(512),
	`sourceSnippet` text,
	`relevanceScore` int,
	`sourceType` enum('supporting','contradicting','neutral') DEFAULT 'neutral',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sources_id` PRIMARY KEY(`id`)
);
