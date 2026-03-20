# Database Choice

This document freezes the Solange Bernard MVP database choice as of March 20, 2026.

It is the source of truth for which primary application database the repo
should target.

## Decision

PostgreSQL is the default and only planned primary application database for the
MVP.

This applies to:

- `local`
- `staging`
- `production`

## Why PostgreSQL

- The current MVP domain is strongly relational:
  admins,
  sessions or reset tokens,
  products,
  variants,
  orders,
  order items,
  inventory adjustments,
  and notifications all fit a relational model well.
- The order and inventory flows need reliable transactions so stock reduction,
  stock restoration, and order state changes stay consistent.
- The system benefits from strong constraints, foreign keys, and indexes.
- PostgreSQL is a mature default with broad hosting support and a strong TypeScript
  ecosystem around it.

## What This Freezes Now

- Future schema design should target PostgreSQL first.
- Task 28 has chosen Prisma as the default ORM or query layer.
- Task 29 should model tables, constraints, and indexes with PostgreSQL as the
  target database.
- The repo should not treat SQLite, MySQL, or another database as an equal
  first-class MVP target.

## What This Does Not Decide Yet

- the exact migration workflow
- the local developer setup details
- the staging or production hosting provider
- the final persistence package or module layout inside `apps/api`

Those choices belong to later tasks.

## Related Decisions

- [ARCHITECTURE.md](/C:/Users/USER/solangebernard/ARCHITECTURE.md)
- [orm-choice.md](/C:/Users/USER/solangebernard/docs/orm-choice.md)
- [workspace-boundaries.md](/C:/Users/USER/solangebernard/docs/workspace-boundaries.md)
- [import-boundaries.md](/C:/Users/USER/solangebernard/docs/import-boundaries.md)
- [domain-aggregates.md](/C:/Users/USER/solangebernard/docs/domain-aggregates.md)
- [domain-services.md](/C:/Users/USER/solangebernard/docs/domain-services.md)
