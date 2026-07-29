import {
  ApiError,
  assertSameOrigin,
  cleanText,
  json,
  readJson,
  routeError,
} from "../../../../../lib/server/http";
import { getOrder, markOrder } from "../../../../../lib/server/marketplace";
import { capturePayPalOrder } from "../../../../../lib/server/payments";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const payload = await readJson(request);
    const orderId = cleanText(payload.orderId, "Order", 5, 100);
    const providerOrderId = cleanText(
      payload.providerOrderId,
      "PayPal order",
      5,
      200,
    );
    let order = await getOrder(orderId);
    if (
      order.provider !== "paypal" ||
      order.providerOrderId !== providerOrderId
    ) {
      throw new ApiError(
        "PayPal order does not match this BuyBlack order.",
        403,
        "ORDER_SESSION_MISMATCH",
      );
    }

    if (order.status === "pending") {
      const capture = await capturePayPalOrder(providerOrderId, orderId);
      if (capture.status === "COMPLETED") {
        await markOrder(orderId, "paid");
      } else {
        throw new ApiError(
          `PayPal returned ${capture.status || "an incomplete status"}.`,
          409,
          "PAYMENT_NOT_COMPLETED",
        );
      }
      order = await getOrder(orderId);
    }
    return json({ order });
  } catch (error) {
    return routeError(error);
  }
}
