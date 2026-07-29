import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const businesses = sqliteTable(
  "buyblack_businesses",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").notNull(),
    ownerEmail: text("owner_email").notNull(),
    ownerName: text("owner_name").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    category: text("category").notNull(),
    description: text("description").notNull(),
    websiteUrl: text("website_url"),
    imageUrl: text("image_url"),
    address: text("address"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    status: text("status").notNull().default("pending"),
    reviewNote: text("review_note"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("buyblack_businesses_slug_unique").on(table.slug),
    index("buyblack_businesses_catalog_idx").on(
      table.status,
      table.state,
      table.category,
      table.createdAt,
    ),
    index("buyblack_businesses_owner_idx").on(
      table.ownerUserId,
      table.createdAt,
    ),
  ],
);

export const products = sqliteTable(
  "buyblack_products",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    imageUrl: text("image_url"),
    inventoryCount: integer("inventory_count"),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("buyblack_products_business_idx").on(
      table.businessId,
      table.status,
      table.createdAt,
    ),
  ],
);

export const reviews = sqliteTable(
  "buyblack_reviews",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("published"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("buyblack_reviews_business_user_unique").on(
      table.businessId,
      table.userId,
    ),
    index("buyblack_reviews_business_idx").on(
      table.businessId,
      table.status,
      table.createdAt,
    ),
  ],
);

export const reviewHelpful = sqliteTable(
  "buyblack_review_helpful",
  {
    reviewId: text("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({
      columns: [table.reviewId, table.userId],
      name: "buyblack_review_helpful_pk",
    }),
  ],
);

export const orders = sqliteTable(
  "buyblack_orders",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "restrict" }),
    customerUserId: text("customer_user_id"),
    customerEmail: text("customer_email"),
    provider: text("provider").notNull(),
    providerOrderId: text("provider_order_id"),
    status: text("status").notNull().default("pending"),
    currency: text("currency").notNull().default("USD"),
    subtotalCents: integer("subtotal_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    itemsJson: text("items_json").notNull(),
    checkoutUrl: text("checkout_url"),
    failureReason: text("failure_reason"),
    paidAt: text("paid_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("buyblack_orders_provider_order_unique").on(
      table.provider,
      table.providerOrderId,
    ),
    index("buyblack_orders_business_idx").on(
      table.businessId,
      table.createdAt,
    ),
    index("buyblack_orders_customer_idx").on(
      table.customerUserId,
      table.createdAt,
    ),
  ],
);

export const paymentEvents = sqliteTable(
  "buyblack_payment_events",
  {
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    orderId: text("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").notNull(),
    payloadHash: text("payload_hash").notNull(),
    processedAt: text("processed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({
      columns: [table.provider, table.eventId],
      name: "buyblack_payment_events_pk",
    }),
  ],
);
