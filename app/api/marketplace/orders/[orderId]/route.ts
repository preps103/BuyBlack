import { ApiError, json, routeError } from "../../../../../lib/server/http";
import {
  getOrder,
  markOrder,
} from "../../../../../lib/server/marketplace";
import { retrieveStripeSession } from "../../../../../lib/server/payments";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await context.params;
    let order = await getOrder(orderId);
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (
      order.provider === "stripe" &&
      order.status === "pending" &&
      sessionId
    ) {
      if (order.providerOrderId !== sessionId) {
        throw new ApiError(
          "Checkout session does not match this order.",
          403,
          "ORDER_SESSION_MISMATCH",
        );
      }
      const session = await retrieveStripeSession(sessionId);
      const sessionOrderId =
        session.metadata?.buyblack_order_id || session.client_reference_id;
      if (sessionOrderId !== orderId) {
        throw new ApiError(
          "Checkout session does not match this order.",
          403,
          "ORDER_SESSION_MISMATCH",
        );
      }
      if (session.payment_status === "paid") {
        await markOrder(orderId, "paid");
      } else if (session.status === "expired") {
        await markOrder(orderId, "cancelled");
      }
      order = await getOrder(orderId);
    }

    return json({ order });
  } catch (error) {
    return routeError(error);
  }
}
