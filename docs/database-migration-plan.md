# Database Migration Plan

This document freezes the Solange Bernard MVP initial database migration plan
as of March 21, 2026.

It is the source of truth for how the repo should turn the current Prisma
schema into the first committed PostgreSQL migration artifact.

## Confirmed Repo Signals

- The Prisma schema already lives at `apps/api/prisma/schema.prisma`.
- Prisma config already points migration files to `apps/api/prisma/migrations`.
- The API env example already defines `DATABASE_URL` for a local PostgreSQL
  database.
- The repo already froze PostgreSQL as the only planned MVP database and Prisma
  as the only planned ORM or query layer.
- The API package now exposes Prisma validate, generate, and migrate deploy
  scripts for local and shared-environment schema application.
- Seed data is the next separate task and should not be bundled into the first
  schema migration.

## Initial Migration Scope

The first migration should create the current baseline schema in one coherent
step, including:

- enums for admin role, product status, and order status
- tables for:
  `admins`,
  `admin_sessions`,
  `password_reset_tokens`,
  `products`,
  `product_variants`,
  `product_media`,
  `inventory_adjustments`,
  `orders`,
  `order_items`,
  `notifications`,
  `notification_attempts`
- primary keys, foreign keys, unique constraints, indexes, and timestamps
  already defined in the Prisma schema

## Migration Artifact Decision

- Use Prisma migration files under `apps/api/prisma/migrations` as the committed
  source of truth for schema changes.
- Create one initial baseline migration named `init_mvp_schema`.
- Commit the generated migration directory together with the Prisma schema
  change that produced it.
- Do not treat `prisma db push` as the shared-environment source of truth.

## Local Generation Plan

Generate the first migration only from a local, disposable PostgreSQL database.

Recommended command flow:

1. set `DATABASE_URL` from `apps/api/.env.example` or an equivalent local value
2. run `pnpm --dir apps/api run prisma:validate`
3. run `pnpm --dir apps/api exec prisma migrate dev --name init_mvp_schema`
4. inspect the generated SQL under `apps/api/prisma/migrations`
5. run `pnpm --dir apps/api run prisma:generate` if a fresh client build is
   needed after checkout or install

## Shared Environment Application Plan

- `staging` and `production` should apply only committed migration artifacts.
- Use `pnpm --dir apps/api exec prisma migrate deploy` in shared environments.
- Do not generate new migrations in `staging` or `production`.
- Promote the same committed migration artifact from `local` review to
  `staging`, then to `production`.

## Baseline Change Rule

- Before the initial migration has been applied in any shared environment, it
  is acceptable to replace or regenerate the baseline migration on a short-lived
  branch if the schema is still evolving.
- After the initial migration has been applied in `staging` or `production`,
  future schema changes must be new follow-up migrations rather than rewrites of
  `init_mvp_schema`.

## What This Plan Does Not Cover Yet

- the exact seeded dataset itself, which is defined separately in
  `docs/development-seed-data.md`
- CI or deployment automation that runs migrations automatically
- backup, restore, or rollback mechanics
- production-specific operator runbooks
- a broader migration script surface beyond the currently needed deploy path

Those choices belong to later tasks.

## Recommended Now

- generate one baseline migration named `init_mvp_schema`
- generate it locally against a disposable PostgreSQL database
- commit the generated Prisma migration files
- apply committed migrations in shared environments with `migrate deploy`
- keep seed data separate from the schema migration

## Not Recommended Now

- multiple partial "initial" migrations for the same baseline schema
- `prisma db push` as the shared-environment schema source of truth
- generating migrations directly in `staging` or `production`
- mixing seed data into the initial schema migration
- hand-applied schema drift outside committed Prisma migration files

## Maybe Later

- dedicated migrate scripts in `apps/api/package.json`
- CI checks for migration drift or missing migration artifacts
- rollback and restore docs once backup strategy is defined
- a fuller per-environment migration process after deployment automation exists

## Related Decisions

- `docs/database-choice.md`
- `docs/orm-choice.md`
- `docs/branching-and-environments.md`
- `docs/development-seed-data.md`
- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/deletion-rules.md`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma.config.ts`
