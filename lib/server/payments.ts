import { ApiError } from "./http";
import type { CheckoutLine } from "./marketplace";
import {
  assertProviderReady,
  runtimeEnvironment,
  type PaymentProvider,
} from "./runtime";

type CheckoutInput = {
  orderId: string;
  origin: string;
  customerEmail?: string | null;
  lines: CheckoutLine[];
  totalCents: number;
};

type ProviderCheckout = {
  providerOrderId: string;
  checkoutUrl: string;
};

async function providerJson<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    message?: string;
    details?: Array<{ description?: string }>;
  };

  if (!response.ok) {
    const providerMessage =
      body.error?.message ||
      body.details?.[0]?.description ||
      body.message ||
      fallbackMessage;
    throw new ApiError(
      `Payment provider error: ${providerMessage}`,
      502,
      "PAYMENT_PROVIDER_ERROR",
    );
  }
  return body as T;
}

export function requireProvider(provider: PaymentProvider) {
  try {
    assertProviderReady(provider);
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Payment provider setup is incomplete.",
      503,
      "PAYMENT_PROVIDER_NOT_CONFIGURED",
    );
  }
}

async function createStripeCheckout(
  input: CheckoutInput,
): Promise<ProviderCheckout> {
  requireProvider("stripe");
  const secret = runtimeEnvironment().STRIPE_SECRET_KEY!;
  const body = new URLSearchParams();

  body.set("mode", "payment");
  body.set("client_reference_id", input.orderId);
  body.set("metadata[buyblack_order_id]", input.orderId);
  body.set(
    "success_url",
    `${input.origin}/?checkout=success&provider=stripe&order=${encodeURIComponent(
      input.orderId,
    )}&session_id={CHECKOUT_SESSION_ID}`,
  );
  body.set(
    "cancel_url",
    `${input.origin}/?checkout=cancelled&order=${encodeURIComponent(input.orderId)}`,
  );
  body.set("billing_address_collection", "auto");
  body.set("shipping_address_collection[allowed_countries][0]", "US");
  if (input.customerEmail) {
    body.set("customer_email", input.customerEmail);
  }

  input.lines.forEach((line, index) => {
    body.set(`line_items[${index}][quantity]`, String(line.quantity));
    body.set(`line_items[${index}][price_data][currency]`, "usd");
    body.set(
      `line_items[${index}][price_data][unit_amount]`,
      String(line.unitAmountCents),
    );
    body.set(
      `line_items[${index}][price_data][product_data][name]`,
      line.name,
    );
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": input.orderId,
    },
    body,
  });
  const session = await providerJson<{ id: string; url?: string }>(
    response,
    "Stripe Checkout could not be created.",
  );

  if (!session.id || !session.url) {
    throw new ApiError(
      "Stripe did not return a checkout link.",
      502,
      "PAYMENT_PROVIDER_ERROR",
    );
  }

  return {
    providerOrderId: session.id,
    checkoutUrl: session.url,
  };
}

function paypalApiBase() {
  return runtimeEnvironment().PAYPAL_ENVIRONMENT?.toLowerCase() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function paypalAccessToken() {
  requireProvider("paypal");
  const runtime = runtimeEnvironment();
  const credentials = btoa(
    `${runtime.PAYPAL_CLIENT_ID}:${runtime.PAYPAL_CLIENT_SECRET}`,
  );
  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const token = await providerJson<{ access_token?: string }>(
    response,
    "PayPal authentication failed.",
  );
  if (!token.access_token) {
    throw new ApiError(
      "PayPal did not return an access token.",
      502,
      "PAYMENT_PROVIDER_ERROR",
    );
  }
  return token.access_token;
}

async function createPayPalCheckout(
  input: CheckoutInput,
): Promise<ProviderCheckout> {
  const accessToken = await paypalAccessToken();
  const total = (input.totalCents / 100).toFixed(2);
  const response = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": input.orderId,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.orderId,
          custom_id: input.orderId,
          description: `BuyBlack order ${input.orderId}`,
          amount: {
            currency_code: "USD",
            value: total,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: total,
              },
            },
          },
          items: input.lines.map((line) => ({
            name: line.name,
            unit_amount: {
              currency_code: "USD",
              value: (line.unitAmountCents / 100).toFixed(2),
            },
            quantity: String(line.quantity),
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "BuyBlack",
            shipping_preference: "GET_FROM_FILE",
            user_action: "PAY_NOW",
            return_url: `${input.origin}/?checkout=success&provider=paypal&order=${encodeURIComponent(
              input.orderId,
            )}`,
            cancel_url: `${input.origin}/?checkout=cancelled&order=${encodeURIComponent(
              input.orderId,
            )}`,
          },
        },
      },
    }),
  });
  const order = await providerJson<{
    id?: string;
    links?: Array<{ rel?: string; href?: string }>;
  }>(response, "PayPal Checkout could not be created.");
  const checkoutUrl = order.links?.find(
    (link) => link.rel === "payer-action" || link.rel === "approve",
  )?.href;

  if (!order.id || !checkoutUrl) {
    throw new ApiError(
      "PayPal did not return an approval link.",
      502,
      "PAYMENT_PROVIDER_ERROR",
    );
  }

  return {
    providerOrderId: order.id,
    checkoutUrl,
  };
}

export async function createProviderCheckout(
  provider: PaymentProvider,
  input: CheckoutInput,
) {
  if (provider === "stripe") return createStripeCheckout(input);
  if (provider === "paypal") return createPayPalCheckout(input);
  throw new ApiError("Unsupported payment provider.", 400, "UNSUPPORTED_PROVIDER");
}

export async function retrieveStripeSession(sessionId: string) {
  requireProvider("stripe");
  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${runtimeEnvironment().STRIPE_SECRET_KEY}`,
      },
    },
  );
  return providerJson<{
    id: string;
    payment_status?: string;
    status?: string;
    client_reference_id?: string;
    metadata?: Record<string, string>;
  }>(response, "Stripe Checkout status could not be retrieved.");
}

export async function capturePayPalOrder(providerOrderId: string, orderId: string) {
  const accessToken = await paypalAccessToken();
  const response = await fetch(
    `${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(
      providerOrderId,
    )}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `${orderId}-capture`,
        Prefer: "return=representation",
      },
      body: "{}",
    },
  );
  return providerJson<{ id?: string; status?: string }>(
    response,
    "PayPal payment could not be captured.",
  );
}

function parseStripeSignature(header: string) {
  const pairs = header.split(",").map((value) => value.trim().split("="));
  const timestamp = pairs.find(([key]) => key === "t")?.[1];
  const signatures = pairs
    .filter(([key]) => key === "v1")
    .map(([, value]) => value)
    .filter(Boolean);
  if (!timestamp || signatures.length === 0) {
    throw new ApiError(
      "Stripe webhook signature is invalid.",
      400,
      "INVALID_WEBHOOK_SIGNATURE",
    );
  }
  return { timestamp, signatures };
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyStripeWebhook(rawBody: string, header: string) {
  const secret = runtimeEnvironment().STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new ApiError(
      "Stripe webhooks are not configured.",
      503,
      "WEBHOOK_NOT_CONFIGURED",
    );
  }

  const { timestamp, signatures } = parseStripeSignature(header);
  const eventTime = Number(timestamp);
  if (
    !Number.isFinite(eventTime) ||
    Math.abs(Date.now() / 1000 - eventTime) > 300
  ) {
    throw new ApiError(
      "Stripe webhook timestamp is outside the allowed window.",
      400,
      "INVALID_WEBHOOK_SIGNATURE",
    );
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`),
  );
  const expected = bytesToHex(signed);
  if (!signatures.some((signature) => constantTimeEqual(signature, expected))) {
    throw new ApiError(
      "Stripe webhook signature is invalid.",
      400,
      "INVALID_WEBHOOK_SIGNATURE",
    );
  }

  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    throw new ApiError("Stripe webhook payload is invalid.", 400, "INVALID_JSON");
  }
}

export async function verifyPayPalWebhook(
  event: Record<string, unknown>,
  headers: Headers,
) {
  const webhookId = runtimeEnvironment().PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new ApiError(
      "PayPal webhooks are not configured.",
      503,
      "WEBHOOK_NOT_CONFIGURED",
    );
  }
  const accessToken = await paypalAccessToken();
  const response = await fetch(
    `${paypalApiBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_time: headers.get("paypal-transmission-time"),
        cert_url: headers.get("paypal-cert-url"),
        auth_algo: headers.get("paypal-auth-algo"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        webhook_id: webhookId,
        webhook_event: event,
      }),
    },
  );
  const verification = await providerJson<{ verification_status?: string }>(
    response,
    "PayPal webhook verification failed.",
  );
  if (verification.verification_status !== "SUCCESS") {
    throw new ApiError(
      "PayPal webhook signature is invalid.",
      400,
      "INVALID_WEBHOOK_SIGNATURE",
    );
  }
  return event;
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return bytesToHex(digest);
}
