# Development Seed Data

This document freezes the minimum development seed dataset for Solange Bernard
as of March 21, 2026.

It is the source of truth for what the repo's local seed command creates in the
database for day-to-day development.

## Run Commands

From the repo root:

- `pnpm db:dev:up`
- `pnpm db:push`
- `pnpm db:seed`

From `apps/api`:

- `pnpm run prisma:push`
- `pnpm run prisma:seed`

## Seed Behavior

- The seed uses deterministic IDs, unique emails, unique SKUs, and unique order
  references so it can be run repeatedly in local development.
- The seed updates or creates the minimum named records it owns.
- The seed does not wipe unrelated data from the database.
- The root workflow starts the local Docker PostgreSQL container, waits for it
  to become healthy, applies the current Prisma schema with `prisma db push`,
  and then runs the seed.
- The Docker bootstrap reads `apps/api/.env` so the local container matches the
  configured `DATABASE_URL` database name, credentials, and port.
- The API-local seed command expects a reachable PostgreSQL database and is best
  paired with `pnpm run prisma:push` when run outside the root workflow.

## Seeded Back-Office Users

- `admin@solangebernard.com`
  role: `admin`
- `staff@solangebernard.com`
  role: `staff`
- default development password for both users: `SecurePass123!`

## Seeded Products

- published `Signature Set`
  category: `Sets`
- published `Tailored Blazer`
  category: `Blazers`
- published `Classic Black Dress`
  category: `Dresses`
- published `Cotton Shirt`
  category: `Shirts`
- draft `Linen Two-Piece`
  category: `Sets`

## Seeded Catalog Details

- published products include at least one main photo
- products include the variants referenced by the BDD pack, including:
  `Signature Set` -> `M / Grey`
  `Tailored Blazer` -> `S / Black`, `M / Black`, `L / Black`
  `Linen Two-Piece` -> `S / Beige`, `M / Beige`, `L / Beige`
  `Cotton Shirt` -> `M / White`
- inventory history is seeded for `Cotton Shirt`

## Seeded Orders

- `ORD-001`
  status: `PendingConfirmation`
  customer: `Awa Konan`
- `ORD-1001`
  status: `ReadyForDelivery`
  customer: `Awa Konan`

## Seeded Notifications

- sample order-status notifications are seeded for `ORD-1001`
- the dataset includes both queued and sent notification examples
- the sent example includes one notification attempt record

## Related Decisions

- `docs/database-migration-plan.md`
- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/order-statuses.md`
- `apps/api/prisma/schema.prisma`
