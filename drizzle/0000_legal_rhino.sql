CREATE TABLE `buyblack_businesses` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`owner_email` text NOT NULL,
	`owner_name` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`website_url` text,
	`image_url` text,
	`address` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`review_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `buyblack_businesses_slug_unique` ON `buyblack_businesses` (`slug`);--> statement-breakpoint
CREATE INDEX `buyblack_businesses_catalog_idx` ON `buyblack_businesses` (`status`,`state`,`category`,`created_at`);--> statement-breakpoint
CREATE INDEX `buyblack_businesses_owner_idx` ON `buyblack_businesses` (`owner_user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `buyblack_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`customer_user_id` text,
	`customer_email` text,
	`provider` text NOT NULL,
	`provider_order_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`items_json` text NOT NULL,
	`checkout_url` text,
	`failure_reason` text,
	`paid_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `buyblack_businesses`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `buyblack_orders_provider_order_unique` ON `buyblack_orders` (`provider`,`provider_order_id`);--> statement-breakpoint
CREATE INDEX `buyblack_orders_business_idx` ON `buyblack_orders` (`business_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `buyblack_orders_customer_idx` ON `buyblack_orders` (`customer_user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `buyblack_payment_events` (
	`provider` text NOT NULL,
	`event_id` text NOT NULL,
	`order_id` text,
	`event_type` text NOT NULL,
	`payload_hash` text NOT NULL,
	`processed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`provider`, `event_id`),
	FOREIGN KEY (`order_id`) REFERENCES `buyblack_orders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `buyblack_products` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price_cents` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`image_url` text,
	`inventory_count` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `buyblack_businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `buyblack_products_business_idx` ON `buyblack_products` (`business_id`,`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `buyblack_review_helpful` (
	`review_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`review_id`, `user_id`),
	FOREIGN KEY (`review_id`) REFERENCES `buyblack_reviews`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `buyblack_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `buyblack_businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `buyblack_reviews_business_user_unique` ON `buyblack_reviews` (`business_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `buyblack_reviews_business_idx` ON `buyblack_reviews` (`business_id`,`status`,`created_at`);