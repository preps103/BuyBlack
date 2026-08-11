import { ApiError, json, routeError } from "../../../../../lib/server/http";
import { getGoodOsUser } from "../../../../../lib/server/auth";
import {
  canAccessOrder,
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
    let sessionAuthorized = false;

    if (order.provider === "stripe" && sessionId) {
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
      sessionAuthorized = true;
      if (order.status === "pending") {
        if (session.payment_status === "paid") {
          await markOrder(orderId, "paid");
        } else if (session.status === "expired") {
          await markOrder(orderId, "cancelled");
        }
        order = await getOrder(orderId);
      }
    }

    if (!sessionAuthorized) {
      const user = await getGoodOsUser(request);
      if (!user) {
        throw new ApiError(
          "Sign in or provide the matching checkout session to view this order.",
          401,
          "AUTHENTICATION_REQUIRED",
        );
      }
      if (!(await canAccessOrder(orderId, user))) {
        throw new ApiError(
          "You do not have access to this order.",
          403,
          "ORDER_ACCESS_DENIED",
        );
      }
    }

    return json({ order });
  } catch (error) {
    return routeError(error);
  }
}
