# BuyBlack Marketplace

BuyBlack is the production marketplace at [buyblack.goodos.app](https://buyblack.goodos.app). It lets shoppers discover verified Black-owned businesses, review merchants, buy products, and pay through Stripe or PayPal. Merchants and GoodOS administrators manage applications, listings, inventory, and orders through the built-in dashboard.

## Architecture

- Next.js application running through Vinext on Cloudflare Workers
- Cloudflare D1 for businesses, products, reviews, orders, and payment events
- GoodOS shared authentication through `base.goodos.app`
- Stripe Checkout and PayPal Orders v2, with signed webhook verification
- Cloudflare Sites for builds, releases, environment variables, and the custom domain

## Local development

Requirements: Node.js 22.13 or newer and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Use non-production Stripe and PayPal credentials locally. The payment values are optional for browsing and merchant administration, but checkout remains disabled until both the provider credentials and its webhook verification value are present.

## Environment variables

| Name | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe server-side API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe endpoint signing secret |
| `PAYPAL_CLIENT_ID` | PayPal REST client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal REST client secret |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook ID used for signature verification |
| `PAYPAL_ENVIRONMENT` | `sandbox` or `live` |

Production secrets belong in the Sites environment-variable manager and must never be committed.

## Webhooks

Register these public endpoints with the matching provider:

- Stripe: `https://buyblack.goodos.app/api/marketplace/webhooks/stripe`
- PayPal: `https://buyblack.goodos.app/api/marketplace/webhooks/paypal`

For Stripe, subscribe to Checkout Session completed, asynchronous payment succeeded, asynchronous payment failed, and expired events. For PayPal, subscribe to payment capture completed, denied or declined, and checkout order completed or voided events.

## Quality checks

```bash
npm run check
```

The check runs linting, strict TypeScript validation, and a production build. The same checks run for GitHub pushes and pull requests.

## Deployment

The Sites project is declared in `.openai/hosting.json`. Production publishes run the schema migrations in `drizzle/` against the bound `DB` database before the new Worker release is activated.

Before enabling a processor in production, confirm that:

1. Live credentials and the verified webhook value are installed.
2. A real low-value purchase reaches `paid`, appears in the merchant dashboard, and reduces finite inventory exactly once.
3. Refund, fulfillment, shipping, tax, privacy, and terms policies are published and linked for shoppers.
