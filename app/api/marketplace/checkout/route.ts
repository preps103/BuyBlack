import { getGoodOsUser } from "../../../../lib/server/auth";
import {
  ApiError,
  assertSameOrigin,
  id,
  json,
  readJson,
  routeError,
} from "../../../../lib/server/http";
import {
  attachProviderOrder,
  insertOrder,
  markOrder,
  resolveCheckoutLines,
} from "../../../../lib/server/marketplace";
import { createProviderCheckout } from "../../../../lib/server/payments";
import type { PaymentProvider } from "../../../../lib/server/runtime";

export async function POST(request: Request) {
  let orderId: string | null = null;
  try {
    assertSameOrigin(request);
    const payload = await readJson(request);
    const provider = String(payload.provider || "").toLowerCase();
    if (provider !== "stripe" && provider !== "paypal") {
      throw new ApiError(
        "Choose Stripe or PayPal for checkout.",
        400,
        "UNSUPPORTED_PROVIDER",
      );
    }

    const lines = await resolveCheckoutLines(payload.items);
    const user = await getGoodOsUser(request);
    const subtotalCents = lines.reduce(
      (total, line) => total + line.unitAmountCents * line.quantity,
      0,
    );
    orderId = id("ord");
    await insertOrder({
      id: orderId,
      businessId: lines[0].businessId,
      customerUserId: user?.id,
      customerEmail: user?.email,
      provider,
      subtotalCents,
      lines,
    });

    const checkout = await createProviderCheckout(
      provider as PaymentProvider,
      {
        orderId,
        origin: new URL(request.url).origin,
        customerEmail: user?.email,
        lines,
        totalCents: subtotalCents,
      },
    );
    await attachProviderOrder({
      orderId,
      providerOrderId: checkout.providerOrderId,
      checkoutUrl: checkout.checkoutUrl,
    });
    return json(
      {
        orderId,
        provider,
        checkoutUrl: checkout.checkoutUrl,
      },
      201,
    );
  } catch (error) {
    if (orderId) {
      await markOrder(
        orderId,
        "failed",
        error instanceof Error ? error.message.slice(0, 500) : "Checkout failed.",
      ).catch(() => undefined);
    }
    return routeError(error);
  }
}
