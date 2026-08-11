import { env } from "cloudflare:workers";

export type PaymentProvider = "stripe" | "paypal";

type RuntimeEnvironment = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_WEBHOOK_ID?: string;
  PAYPAL_ENVIRONMENT?: string;
};

export function runtimeEnvironment() {
  return env as unknown as RuntimeEnvironment;
}

export function paymentReadiness() {
  const runtime = runtimeEnvironment();
  const paypalEnvironment =
    runtime.PAYPAL_ENVIRONMENT?.toLowerCase() === "live" ? "live" : "sandbox";

  return {
    stripe: {
      provider: "stripe" as const,
      label: "Credit or debit card",
      configured: Boolean(runtime.STRIPE_SECRET_KEY),
      webhooksConfigured: Boolean(runtime.STRIPE_WEBHOOK_SECRET),
      mode: runtime.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "test",
    },
    paypal: {
      provider: "paypal" as const,
      label: "PayPal",
      configured: Boolean(
        runtime.PAYPAL_CLIENT_ID && runtime.PAYPAL_CLIENT_SECRET,
      ),
      webhooksConfigured: Boolean(runtime.PAYPAL_WEBHOOK_ID),
      mode: paypalEnvironment,
    },
  };
}

export function assertProviderReady(provider: PaymentProvider) {
  const readiness = paymentReadiness()[provider];
  if (!readiness.configured || !readiness.webhooksConfigured) {
    throw new Error(
      `${provider === "stripe" ? "Card payments" : "PayPal"} require credentials and a verified webhook before checkout can open.`,
    );
  }
  return readiness;
}
