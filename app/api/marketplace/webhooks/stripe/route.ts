import {
  ApiError,
  json,
  readText,
  routeError,
} from "../../../../../lib/server/http";
import {
  markOrder,
  orderIdForProvider,
  recordPaymentEvent,
} from "../../../../../lib/server/marketplace";
import {
  sha256,
  verifyStripeWebhook,
} from "../../../../../lib/server/payments";

export async function POST(request: Request) {
  try {
    const rawBody = await readText(request, 256 * 1024);
    const signature = request.headers.get("stripe-signature") || "";
    const event = await verifyStripeWebhook(rawBody, signature);
    const eventId = String(event.id || "");
    const eventType = String(event.type || "");
    if (!eventId || !eventType) {
      throw new ApiError("Stripe webhook event is incomplete.", 400, "INVALID_WEBHOOK_EVENT");
    }
    const data = event.data as { object?: Record<string, unknown> } | undefined;
    const object = data?.object || {};
    const metadata = object.metadata as Record<string, unknown> | undefined;
    const providerOrderId = object.id ? String(object.id) : null;
    const orderId =
      (metadata?.buyblack_order_id
        ? String(metadata.buyblack_order_id)
        : null) ||
      (object.client_reference_id
        ? String(object.client_reference_id)
        : null) ||
      (providerOrderId
        ? await orderIdForProvider("stripe", providerOrderId)
        : null);

    await recordPaymentEvent({
      provider: "stripe",
      eventId,
      orderId,
      eventType,
      payloadHash: await sha256(rawBody),
    });

    if (orderId) {
      if (
        (eventType === "checkout.session.completed" &&
          object.payment_status === "paid") ||
        eventType === "checkout.session.async_payment_succeeded"
      ) {
        await markOrder(orderId, "paid");
      } else if (eventType === "checkout.session.expired") {
        await markOrder(orderId, "cancelled");
      } else if (eventType === "checkout.session.async_payment_failed") {
        await markOrder(orderId, "failed", "Stripe reported a failed payment.");
      }
    }

    return json({ received: true });
  } catch (error) {
    return routeError(error);
  }
}
