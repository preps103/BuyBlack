# BuyBlack Directory

BuyBlack is the curated directory at [buyblack.goodos.app](https://buyblack.goodos.app). Its sole product purpose is discovering verified Black-owned businesses.

## Curation workflow

1. A signed-in owner, team member, or community supporter submits a business.
2. The submission must attest that the business is at least 51% Black-owned and explain how ownership can be confirmed.
3. A GoodOS administrator reviews the evidence and records a curator note.
4. Only approved businesses appear in the public directory.

BuyBlack does not publish placeholder listings, accept paid placement, sell products, process payments, or host customer reviews.

## Architecture

- Next.js through Vinext on Cloudflare Workers
- Cloudflare D1 for durable business submissions and curation decisions
- GoodOS shared authentication for submissions and the Curation Center
- Cloudflare Sites for releases and the custom domain

## Local development

Requirements: Node.js 22.13 or newer and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Quality checks

```bash
npm run check
```

The Sites project is declared in `.openai/hosting.json`. Production publishing runs the migrations in `drizzle/` against the bound `DB` database before activating the new release.
