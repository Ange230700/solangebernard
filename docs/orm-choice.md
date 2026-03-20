# ORM Or Query Layer Choice

This document freezes the Solange Bernard MVP ORM or query-layer choice as of
March 20, 2026.

It is the source of truth for which persistence access layer the repo should
use by default with PostgreSQL.

## Decision

Prisma is the default and only planned ORM or query layer for the MVP.

## Why Prisma

- The repo is a TypeScript monorepo with a Nest API, so Prisma fits the current
  stack without adding a second modeling language or a lower-level SQL workflow
  too early.
- The upcoming table-modeling work needs a fast path for schema definition,
  migrations, and typed access to relational data.
- The MVP domain has clear relational structure around admins, auth tokens,
  products, variants, orders, order items, inventory adjustments, and
  notifications.
- The order and inventory flows need transactions, constraints, and typed data
  access, which Prisma supports well enough for an MVP.
- Choosing Prisma now avoids wasting time on a Drizzle-versus-Prisma or
  Kysely-versus-ORM debate before the first real schema exists.

## What This Freezes Now

- Task 29 should model the initial persistence layer with Prisma.
- The default application persistence path should be
  `apps/api` -> Prisma -> PostgreSQL.
- The repo should not introduce Drizzle, Kysely, or raw SQL as a parallel
  first-class default persistence layer for the MVP.
- Controllers should keep depending on contracts and services rather than on
  Prisma client types directly.

## What This Does Not Decide Yet

- the exact Prisma file or module layout under `apps/api`
- whether the API uses repositories, services, or a thin persistence adapter
  around Prisma
- migration naming conventions
- seed scripts and local developer bootstrap details
- whether targeted raw SQL is ever justified for isolated later edge cases

Those choices belong to later implementation tasks.

## Related Decisions

- [database-choice.md](/C:/Users/USER/solangebernard/docs/database-choice.md)
- [ARCHITECTURE.md](/C:/Users/USER/solangebernard/ARCHITECTURE.md)
- [workspace-boundaries.md](/C:/Users/USER/solangebernard/docs/workspace-boundaries.md)
- [import-boundaries.md](/C:/Users/USER/solangebernard/docs/import-boundaries.md)
- [domain-aggregates.md](/C:/Users/USER/solangebernard/docs/domain-aggregates.md)
- [domain-services.md](/C:/Users/USER/solangebernard/docs/domain-services.md)
