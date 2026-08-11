import { getDb } from "../../db";
import type { GoodOsUser } from "./auth";
import { isPlatformAdmin, userName } from "./auth";
import {
  ApiError,
  cleanText,
  id,
  optionalHttpsUrl,
  optionalText,
  slugify,
  validEmail,
} from "./http";
import { paymentReadiness } from "./runtime";

type Row = Record<string, unknown>;

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function businessFromRow(row: Row) {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id || ""),
    name: String(row.name),
    slug: String(row.slug),
    ownerName: String(row.owner_name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : null,
    category: String(row.category),
    description: String(row.description),
    websiteUrl: row.website_url ? String(row.website_url) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    address: row.address ? String(row.address) : null,
    city: String(row.city),
    state: String(row.state),
    location: `${String(row.city)}, ${String(row.state)}`,
    status: String(row.status),
    reviewNote: row.review_note ? String(row.review_note) : null,
    rating: numberValue(row.rating),
    reviewCount: numberValue(row.review_count),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function productFromRow(row: Row) {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    name: String(row.name),
    description: String(row.description),
    priceCents: numberValue(row.price_cents),
    currency: String(row.currency || "USD"),
    imageUrl: row.image_url ? String(row.image_url) : null,
    inventoryCount:
      row.inventory_count === null || row.inventory_count === undefined
        ? null
        : numberValue(row.inventory_count),
    status: String(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function reviewFromRow(row: Row) {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    businessName: row.business_name ? String(row.business_name) : null,
    userId: String(row.user_id),
    userName: String(row.user_name),
    rating: numberValue(row.rating),
    body: String(row.body),
    helpfulCount: numberValue(row.helpful_count),
    createdAt: String(row.created_at),
  };
}

function orderFromRow(row: Row) {
  let items: unknown[] = [];
  try {
    items = JSON.parse(String(row.items_json || "[]"));
  } catch {
    items = [];
  }

  return {
    id: String(row.id),
    businessId: String(row.business_id),
    businessName: row.business_name ? String(row.business_name) : null,
    customerEmail: row.customer_email ? String(row.customer_email) : null,
    provider: String(row.provider),
    providerOrderId: row.provider_order_id
      ? String(row.provider_order_id)
      : null,
    status: String(row.status),
    currency: String(row.currency || "USD"),
    subtotalCents: numberValue(row.subtotal_cents),
    totalCents: numberValue(row.total_cents),
    items,
    checkoutUrl: row.checkout_url ? String(row.checkout_url) : null,
    failureReason: row.failure_reason ? String(row.failure_reason) : null,
    paidAt: row.paid_at ? String(row.paid_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

const businessProjection = `
  business.*,
  COALESCE(ROUND(AVG(review.rating), 1), 0) AS rating,
  COUNT(DISTINCT review.id) AS review_count
`;

export async function catalog(filters: {
  query?: string | null;
  state?: string | null;
  category?: string | null;
} = {}) {
  const db = getDb();
  const where = ["business.status = 'verified'"];
  const values: unknown[] = [];

  const query = optionalText(filters.query, 120);
  const state = optionalText(filters.state, 80);
  const category = optionalText(filters.category, 100);

  if (query) {
    where.push(
      "(LOWER(business.name) LIKE ? OR LOWER(business.description) LIKE ? OR LOWER(business.category) LIKE ?)",
    );
    const like = `%${query.toLowerCase()}%`;
    values.push(like, like, like);
  }
  if (state) {
    where.push("LOWER(business.state) = ?");
    values.push(state.toLowerCase());
  }
  if (category) {
    where.push("LOWER(business.category) = ?");
    values.push(category.toLowerCase());
  }

  const businessesResult = await db
    .prepare(
      `
        SELECT ${businessProjection}
        FROM buyblack_businesses AS business
        LEFT JOIN buyblack_reviews AS review
          ON review.business_id = business.id
          AND review.status = 'published'
        WHERE ${where.join(" AND ")}
        GROUP BY business.id
        ORDER BY business.created_at DESC
        LIMIT 250
      `,
    )
    .bind(...values)
    .all<Row>();

  const businesses = (businessesResult.results || []).map(businessFromRow);
  const businessIds = businesses.map((business) => business.id);
  let products: ReturnType<typeof productFromRow>[] = [];
  let reviews: ReturnType<typeof reviewFromRow>[] = [];

  if (businessIds.length) {
    const placeholders = businessIds.map(() => "?").join(",");
    const [productResult, reviewResult] = await Promise.all([
      db
        .prepare(
          `
            SELECT *
            FROM buyblack_products
            WHERE status = 'active'
              AND business_id IN (${placeholders})
            ORDER BY created_at DESC
            LIMIT 500
          `,
        )
        .bind(...businessIds)
        .all<Row>(),
      db
        .prepare(
          `
            SELECT
              review.*,
              business.name AS business_name,
              COUNT(helpful.user_id) AS helpful_count
            FROM buyblack_reviews AS review
            JOIN buyblack_businesses AS business
              ON business.id = review.business_id
            LEFT JOIN buyblack_review_helpful AS helpful
              ON helpful.review_id = review.id
            WHERE review.status = 'published'
              AND review.business_id IN (${placeholders})
            GROUP BY review.id
            ORDER BY review.created_at DESC
            LIMIT 100
          `,
        )
        .bind(...businessIds)
        .all<Row>(),
    ]);

    products = (productResult.results || []).map(productFromRow);
    reviews = (reviewResult.results || []).map(reviewFromRow);
  }

  const states = Array.from(
    new Set(businesses.map((business) => business.state)),
  ).sort();
  const categories = Array.from(
    new Set(businesses.map((business) => business.category)),
  ).sort();

  return {
    businesses,
    products,
    reviews,
    states,
    categories,
    stats: {
      businesses: businesses.length,
      states: states.length,
      products: products.length,
      reviews: reviews.length,
    },
    payments: paymentReadiness(),
  };
}

export async function createApplication(
  user: GoodOsUser,
  payload: Record<string, unknown>,
) {
  const db = getDb();
  const name = cleanText(payload.name, "Business name", 2, 140);
  const existing = await db
    .prepare(
      `
        SELECT id
        FROM buyblack_businesses
        WHERE owner_user_id = ?
          AND LOWER(name) = LOWER(?)
          AND status IN ('pending', 'verified')
        LIMIT 1
      `,
    )
    .bind(user.id, name)
    .first<Row>();

  if (existing) {
    throw new ApiError(
      "This business already has an active BuyBlack application.",
      409,
      "APPLICATION_EXISTS",
    );
  }

  const baseSlug = slugify(name) || "business";
  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const conflict = await db
      .prepare("SELECT id FROM buyblack_businesses WHERE slug = ? LIMIT 1")
      .bind(slug)
      .first<Row>();
    if (!conflict) break;
    slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const businessId = id("biz");
  const owner = cleanText(
    payload.ownerName || userName(user),
    "Owner name",
    2,
    120,
  );
  const email = validEmail(payload.email || user.email, "Business email");
  const category = cleanText(payload.category, "Category", 2, 100);
  const description = cleanText(
    payload.description,
    "Business description",
    40,
    2000,
  );
  const city = cleanText(payload.city, "City", 2, 100);
  const state = cleanText(payload.state, "State", 2, 80);

  await db
    .prepare(
      `
        INSERT INTO buyblack_businesses (
          id, owner_user_id, owner_email, owner_name, name, slug, email, phone,
          category, description, website_url, image_url, address, city, state,
          status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending',
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
    )
    .bind(
      businessId,
      user.id,
      user.email.toLowerCase(),
      owner,
      name,
      slug,
      email,
      optionalText(payload.phone, 40),
      category,
      description,
      optionalHttpsUrl(payload.websiteUrl, "Website"),
      optionalHttpsUrl(payload.imageUrl, "Image"),
      optionalText(payload.address, 300),
      city,
      state,
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM buyblack_businesses WHERE id = ?")
    .bind(businessId)
    .first<Row>();

  return businessFromRow(created || {});
}

export async function dashboard(user: GoodOsUser) {
  const db = getDb();
  const admin = isPlatformAdmin(user);
  const ownerClause = admin ? "1 = 1" : "business.owner_user_id = ?";
  const ownerValues = admin ? [] : [user.id];

  const [businessResult, productResult, orderResult] = await Promise.all([
    db
      .prepare(
        `
          SELECT ${businessProjection}
          FROM buyblack_businesses AS business
          LEFT JOIN buyblack_reviews AS review
            ON review.business_id = business.id
            AND review.status = 'published'
          WHERE ${ownerClause}
          GROUP BY business.id
          ORDER BY business.created_at DESC
          LIMIT 250
        `,
      )
      .bind(...ownerValues)
      .all<Row>(),
    db
      .prepare(
        `
          SELECT product.*
          FROM buyblack_products AS product
          JOIN buyblack_businesses AS business
            ON business.id = product.business_id
          WHERE ${ownerClause}
          ORDER BY product.created_at DESC
          LIMIT 500
        `,
      )
      .bind(...ownerValues)
      .all<Row>(),
    db
      .prepare(
        `
          SELECT orders.*, business.name AS business_name
          FROM buyblack_orders AS orders
          JOIN buyblack_businesses AS business
            ON business.id = orders.business_id
          WHERE ${ownerClause}
          ORDER BY orders.created_at DESC
          LIMIT 500
        `,
      )
      .bind(...ownerValues)
      .all<Row>(),
  ]);

  return {
    canAdmin: admin,
    businesses: (businessResult.results || []).map(businessFromRow),
    products: (productResult.results || []).map(productFromRow),
    orders: (orderResult.results || []).map(orderFromRow),
    payments: paymentReadiness(),
  };
}

export async function updateBusinessStatus(
  user: GoodOsUser,
  businessId: string,
  payload: Record<string, unknown>,
) {
  if (!isPlatformAdmin(user)) {
    throw new ApiError(
      "BuyBlack administrator access is required.",
      403,
      "ADMIN_REQUIRED",
    );
  }

  const status = cleanText(payload.status, "Status", 2, 20).toLowerCase();
  if (!["pending", "verified", "rejected"].includes(status)) {
    throw new ApiError("The business status is invalid.", 400, "INVALID_STATUS");
  }

  const db = getDb();
  await db
    .prepare(
      `
        UPDATE buyblack_businesses
        SET status = ?,
            review_note = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .bind(status, optionalText(payload.reviewNote, 1000), businessId)
    .run();

  const updated = await db
    .prepare("SELECT * FROM buyblack_businesses WHERE id = ?")
    .bind(businessId)
    .first<Row>();
  if (!updated) {
    throw new ApiError("Business not found.", 404, "BUSINESS_NOT_FOUND");
  }
  return businessFromRow(updated);
}

async function ownedBusiness(
  user: GoodOsUser,
  businessId: string,
  requireVerified = false,
) {
  const db = getDb();
  const business = await db
    .prepare("SELECT * FROM buyblack_businesses WHERE id = ? LIMIT 1")
    .bind(businessId)
    .first<Row>();

  if (!business) {
    throw new ApiError("Business not found.", 404, "BUSINESS_NOT_FOUND");
  }
  if (
    String(business.owner_user_id) !== user.id &&
    !isPlatformAdmin(user)
  ) {
    throw new ApiError(
      "You do not manage this business.",
      403,
      "BUSINESS_ACCESS_DENIED",
    );
  }
  if (requireVerified && business.status !== "verified") {
    throw new ApiError(
      "The business must be verified before products can be published.",
      409,
      "BUSINESS_VERIFICATION_REQUIRED",
    );
  }
  return business;
}

export async function createProduct(
  user: GoodOsUser,
  payload: Record<string, unknown>,
) {
  const businessId = cleanText(payload.businessId, "Business", 5, 100);
  await ownedBusiness(user, businessId, true);

  const priceCents = Math.round(Number(payload.priceCents));
  if (!Number.isInteger(priceCents) || priceCents < 50 || priceCents > 100_000_000) {
    throw new ApiError("Product price is invalid.", 400, "INVALID_PRICE");
  }

  const rawInventory = payload.inventoryCount;
  const inventoryCount =
    rawInventory === null || rawInventory === undefined || rawInventory === ""
      ? null
      : Math.round(Number(rawInventory));
  if (
    inventoryCount !== null &&
    (!Number.isInteger(inventoryCount) || inventoryCount < 0)
  ) {
    throw new ApiError("Inventory must be zero or greater.", 400, "INVALID_INVENTORY");
  }

  const productId = id("prd");
  const db = getDb();
  await db
    .prepare(
      `
        INSERT INTO buyblack_products (
          id, business_id, name, description, price_cents, currency, image_url,
          inventory_count, status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'USD', ?, ?, 'active',
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
    )
    .bind(
      productId,
      businessId,
      cleanText(payload.name, "Product name", 2, 140),
      cleanText(payload.description, "Product description", 10, 1500),
      priceCents,
      optionalHttpsUrl(payload.imageUrl, "Product image"),
      inventoryCount,
    )
    .run();

  const product = await db
    .prepare("SELECT * FROM buyblack_products WHERE id = ?")
    .bind(productId)
    .first<Row>();
  return productFromRow(product || {});
}

export async function createReview(
  user: GoodOsUser,
  payload: Record<string, unknown>,
) {
  const businessId = cleanText(payload.businessId, "Business", 5, 100);
  const rating = Math.round(Number(payload.rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError("Rating must be between 1 and 5.", 400, "INVALID_RATING");
  }

  const db = getDb();
  const business = await db
    .prepare(
      "SELECT id FROM buyblack_businesses WHERE id = ? AND status = 'verified'",
    )
    .bind(businessId)
    .first<Row>();
  if (!business) {
    throw new ApiError("Verified business not found.", 404, "BUSINESS_NOT_FOUND");
  }

  const reviewId = id("rev");
  await db
    .prepare(
      `
        INSERT INTO buyblack_reviews (
          id, business_id, user_id, user_name, rating, body, status,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(business_id, user_id) DO UPDATE SET
          user_name = excluded.user_name,
          rating = excluded.rating,
          body = excluded.body,
          status = 'published',
          updated_at = CURRENT_TIMESTAMP
      `,
    )
    .bind(
      reviewId,
      businessId,
      user.id,
      userName(user),
      rating,
      cleanText(payload.body, "Review", 10, 2000),
    )
    .run();

  const review = await db
    .prepare(
      `
        SELECT review.*, business.name AS business_name, 0 AS helpful_count
        FROM buyblack_reviews AS review
        JOIN buyblack_businesses AS business ON business.id = review.business_id
        WHERE review.business_id = ? AND review.user_id = ?
      `,
    )
    .bind(businessId, user.id)
    .first<Row>();
  return reviewFromRow(review || {});
}

export async function toggleHelpful(user: GoodOsUser, reviewId: string) {
  const db = getDb();
  const review = await db
    .prepare("SELECT id FROM buyblack_reviews WHERE id = ? AND status = 'published'")
    .bind(reviewId)
    .first<Row>();
  if (!review) {
    throw new ApiError("Review not found.", 404, "REVIEW_NOT_FOUND");
  }

  const existing = await db
    .prepare(
      "SELECT review_id FROM buyblack_review_helpful WHERE review_id = ? AND user_id = ?",
    )
    .bind(reviewId, user.id)
    .first<Row>();

  if (existing) {
    await db
      .prepare(
        "DELETE FROM buyblack_review_helpful WHERE review_id = ? AND user_id = ?",
      )
      .bind(reviewId, user.id)
      .run();
  } else {
    await db
      .prepare(
        `
          INSERT INTO buyblack_review_helpful (review_id, user_id, created_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `,
      )
      .bind(reviewId, user.id)
      .run();
  }

  const count = await db
    .prepare(
      "SELECT COUNT(*) AS count FROM buyblack_review_helpful WHERE review_id = ?",
    )
    .bind(reviewId)
    .first<Row>();

  return {
    helpful: !existing,
    helpfulCount: numberValue(count?.count),
  };
}

export type CheckoutLine = {
  productId: string;
  quantity: number;
  name: string;
  unitAmountCents: number;
  businessId: string;
};

export async function resolveCheckoutLines(
  rawItems: unknown,
): Promise<CheckoutLine[]> {
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 25) {
    throw new ApiError(
      "Your cart must contain between 1 and 25 products.",
      400,
      "INVALID_CART",
    );
  }

  const requestedItems = rawItems.map((item) => {
    const record = item as Record<string, unknown>;
    const productId = cleanText(record.productId, "Product", 5, 100);
    const quantity = Math.round(Number(record.quantity || 1));
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 25) {
      throw new ApiError("Product quantity is invalid.", 400, "INVALID_QUANTITY");
    }
    return { productId, quantity };
  });

  const requestedByProduct = new Map<string, number>();
  for (const item of requestedItems) {
    const quantity = (requestedByProduct.get(item.productId) || 0) + item.quantity;
    if (quantity > 25) {
      throw new ApiError("Product quantity is invalid.", 400, "INVALID_QUANTITY");
    }
    requestedByProduct.set(item.productId, quantity);
  }
  const requested = Array.from(requestedByProduct, ([productId, quantity]) => ({
    productId,
    quantity,
  }));

  const uniqueIds = Array.from(new Set(requested.map((item) => item.productId)));
  const placeholders = uniqueIds.map(() => "?").join(",");
  const result = await getDb()
    .prepare(
      `
        SELECT product.*, business.status AS business_status
        FROM buyblack_products AS product
        JOIN buyblack_businesses AS business ON business.id = product.business_id
        WHERE product.id IN (${placeholders})
          AND product.status = 'active'
          AND business.status = 'verified'
      `,
    )
    .bind(...uniqueIds)
    .all<Row>();

  const rows = new Map(
    (result.results || []).map((row) => [String(row.id), row]),
  );
  if (rows.size !== uniqueIds.length) {
    throw new ApiError(
      "One or more products are unavailable.",
      409,
      "PRODUCT_UNAVAILABLE",
    );
  }

  const lines = requested.map((item) => {
    const row = rows.get(item.productId)!;
    const inventory =
      row.inventory_count === null || row.inventory_count === undefined
        ? null
        : numberValue(row.inventory_count);
    if (inventory !== null && item.quantity > inventory) {
      throw new ApiError(
        `${String(row.name)} does not have enough inventory.`,
        409,
        "INSUFFICIENT_INVENTORY",
      );
    }
    return {
      productId: item.productId,
      quantity: item.quantity,
      name: String(row.name),
      unitAmountCents: numberValue(row.price_cents),
      businessId: String(row.business_id),
    };
  });

  if (new Set(lines.map((line) => line.businessId)).size !== 1) {
    throw new ApiError(
      "Checkout currently supports products from one business at a time.",
      409,
      "MULTI_MERCHANT_CART",
    );
  }
  return lines;
}

export async function insertOrder(input: {
  id: string;
  businessId: string;
  customerUserId?: string | null;
  customerEmail?: string | null;
  provider: string;
  subtotalCents: number;
  lines: CheckoutLine[];
}) {
  await getDb()
    .prepare(
      `
        INSERT INTO buyblack_orders (
          id, business_id, customer_user_id, customer_email, provider, status,
          currency, subtotal_cents, total_cents, items_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'pending', 'USD', ?, ?, ?,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
    )
    .bind(
      input.id,
      input.businessId,
      input.customerUserId || null,
      input.customerEmail || null,
      input.provider,
      input.subtotalCents,
      input.subtotalCents,
      JSON.stringify(input.lines),
    )
    .run();
}

export async function attachProviderOrder(input: {
  orderId: string;
  providerOrderId: string;
  checkoutUrl: string;
}) {
  await getDb()
    .prepare(
      `
        UPDATE buyblack_orders
        SET provider_order_id = ?,
            checkout_url = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .bind(input.providerOrderId, input.checkoutUrl, input.orderId)
    .run();
}

export async function markOrder(
  orderId: string,
  status: "pending" | "paid" | "cancelled" | "failed",
  failureReason: string | null = null,
) {
  const db = getDb();

  if (status === "paid") {
    const order = await db
      .prepare("SELECT items_json FROM buyblack_orders WHERE id = ? LIMIT 1")
      .bind(orderId)
      .first<Row>();
    if (!order) return;

    let lines: CheckoutLine[] = [];
    try {
      lines = JSON.parse(String(order.items_json || "[]")) as CheckoutLine[];
    } catch {
      console.error(`BuyBlack order ${orderId} has invalid item data.`);
    }

    const inventoryUpdates = lines
      .filter(
        (line) =>
          typeof line.productId === "string" &&
          Number.isInteger(line.quantity) &&
          line.quantity > 0,
      )
      .map((line) =>
        db
          .prepare(
            `
              UPDATE buyblack_products
              SET inventory_count = MAX(0, inventory_count - ?),
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
                AND inventory_count IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM buyblack_orders
                  WHERE id = ? AND status <> 'paid'
                )
            `,
          )
          .bind(line.quantity, line.productId, orderId),
      );
    const paidTransition = db
      .prepare(
        `
          UPDATE buyblack_orders
          SET status = 'paid',
              failure_reason = NULL,
              paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND status <> 'paid'
        `,
      )
      .bind(orderId);
    await db.batch([...inventoryUpdates, paidTransition]);
    return;
  }

  await db
    .prepare(
      `
        UPDATE buyblack_orders
        SET status = ?,
            failure_reason = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status <> 'paid'
      `,
    )
    .bind(status, failureReason, orderId)
    .run();
}

export async function getOrder(orderId: string) {
  const row = await getDb()
    .prepare(
      `
        SELECT orders.*, business.name AS business_name
        FROM buyblack_orders AS orders
        JOIN buyblack_businesses AS business ON business.id = orders.business_id
        WHERE orders.id = ?
      `,
    )
    .bind(orderId)
    .first<Row>();
  if (!row) {
    throw new ApiError("Order not found.", 404, "ORDER_NOT_FOUND");
  }
  return orderFromRow(row);
}

export async function canAccessOrder(orderId: string, user: GoodOsUser) {
  if (isPlatformAdmin(user)) return true;
  const row = await getDb()
    .prepare(
      `
        SELECT orders.customer_user_id, business.owner_user_id
        FROM buyblack_orders AS orders
        JOIN buyblack_businesses AS business ON business.id = orders.business_id
        WHERE orders.id = ?
        LIMIT 1
      `,
    )
    .bind(orderId)
    .first<Row>();
  return Boolean(
    row &&
      (String(row.customer_user_id || "") === user.id ||
        String(row.owner_user_id || "") === user.id),
  );
}

export async function recordPaymentEvent(input: {
  provider: string;
  eventId: string;
  orderId?: string | null;
  eventType: string;
  payloadHash: string;
}) {
  const result = await getDb()
    .prepare(
      `
        INSERT OR IGNORE INTO buyblack_payment_events (
          provider, event_id, order_id, event_type, payload_hash, processed_at
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
    )
    .bind(
      input.provider,
      input.eventId,
      input.orderId || null,
      input.eventType,
      input.payloadHash,
    )
    .run();
  return result;
}

export async function orderIdForProvider(
  provider: string,
  providerOrderId: string,
) {
  const row = await getDb()
    .prepare(
      "SELECT id FROM buyblack_orders WHERE provider = ? AND provider_order_id = ?",
    )
    .bind(provider, providerOrderId)
    .first<Row>();
  return row?.id ? String(row.id) : null;
}
