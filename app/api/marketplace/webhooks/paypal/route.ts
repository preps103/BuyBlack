import {
  ApiError,
  json,
  readJson,
  routeError,
} from "../../../../../lib/server/http";
import {
  markOrder,
  orderIdForProvider,
  recordPaymentEvent,
} from "../../../../../lib/server/marketplace";
import {
  sha256,
  verifyPayPalWebhook,
} from "../../../../../lib/server/payments";

export async function POST(request: Request) {
  try {
    const event = await readJson(request, 256 * 1024);
    await verifyPayPalWebhook(event, request.headers);
    const eventId = String(event.id || "");
    const eventType = String(event.event_type || "");
    if (!eventId || !eventType) {
      throw new ApiError("PayPal webhook event is incomplete.", 400, "INVALID_WEBHOOK_EVENT");
    }
    const resource = (event.resource || {}) as Record<string, unknown>;
    const supplementary = (resource.supplementary_data || {}) as {
      related_ids?: { order_id?: string };
    };
    const providerOrderId =
      supplementary.related_ids?.order_id ||
      (eventType.startsWith("CHECKOUT.ORDER.") && resource.id
        ? String(resource.id)
        : null);
    const orderId = providerOrderId
      ? await orderIdForProvider("paypal", providerOrderId)
      : null;

    await recordPaymentEvent({
      provider: "paypal",
      eventId,
      orderId,
      eventType,
      payloadHash: await sha256(JSON.stringify(event)),
    });

    if (orderId) {
      if (
        eventType === "PAYMENT.CAPTURE.COMPLETED" ||
        eventType === "CHECKOUT.ORDER.COMPLETED"
      ) {
        await markOrder(orderId, "paid");
      } else if (
        eventType === "PAYMENT.CAPTURE.DENIED" ||
        eventType === "PAYMENT.CAPTURE.DECLINED"
      ) {
        await markOrder(orderId, "failed", "PayPal reported a failed payment.");
      } else if (eventType === "CHECKOUT.ORDER.VOIDED") {
        await markOrder(orderId, "cancelled");
      }
    }

    return json({ received: true });
  } catch (error) {
    return routeError(error);
  }
}
