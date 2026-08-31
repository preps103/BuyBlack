ALTER TABLE `buyblack_businesses` ADD `submitter_relationship` text DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE `buyblack_businesses` ADD `ownership_confirmed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `buyblack_businesses` ADD `verification_url` text;--> statement-breakpoint
ALTER TABLE `buyblack_businesses` ADD `verification_details` text;--> statement-breakpoint
ALTER TABLE `buyblack_businesses` ADD `verified_at` text;--> statement-breakpoint
ALTER TABLE `buyblack_businesses` ADD `verified_by_user_id` text;--> statement-breakpoint
UPDATE `buyblack_businesses`
SET `status` = 'pending',
    `review_note` = 'Reverification required under the curated-directory standard.',
    `updated_at` = CURRENT_TIMESTAMP
WHERE `status` = 'verified';
