# Architecture

This document freezes the high-level Solange Bernard monorepo architecture as of
March 20, 2026.

It is the source of truth for how the main workspaces fit together, how code is
expected to flow between them, and which architectural boundaries already exist
in the repo.

It is intentionally short. Use the linked boundary and domain documents when a
decision needs more detail.

## Monorepo Shape

The repo is a pnpm workspace with:

- `apps/client`: Angular workspace for the `web`, `desktop`, and `mobile`
  frontends
- `apps/api`: NestJS API using Fastify
- `packages/contracts`: shared transport-safe contracts
- `packages/domain`: framework-free domain logic
- `packages/api-client`: typed fetch-based API client

Inside `apps/client`, the current project split is:

- `projects/web`: browser UI
- `projects/desktop`: Angular UI packaged for Tauri
- `projects/mobile`: Angular UI using Ionic
- `projects/core`: shared UI-agnostic Angular helpers
- `projects/ui-web`: shared presentation for `web` and `desktop` only

## Layered Model

The intended dependency direction is:

```text
apps/client (web, desktop, mobile)
  -> @repo/api-client
  -> @repo/contracts

apps/api
  -> @repo/domain
  -> @repo/contracts

@repo/domain
  -> @repo/contracts

@repo/contracts
  -> no internal workspace dependencies
```

The reverse directions are not allowed.

In practical terms:

- `packages/contracts` is the lowest shared layer
- `packages/domain` holds business rules without framework code
- `packages/api-client` is the client-side transport helper layer
- `apps/api` is the server entrypoint and orchestration layer
- `apps/client` is the presentation layer for all user-facing surfaces

## Runtime Flow

The current intended request path is:

```text
web / desktop / mobile UI
  -> @repo/api-client
  -> HTTP
  -> apps/api
  -> @repo/domain
  -> future PostgreSQL persistence layer
```

`@repo/contracts` defines the shared shapes that move across the API boundary.

The current repo already shows this pattern in the health-check path:

- client apps call `getHealth` from `@repo/api-client`
- `@repo/api-client` exchanges `HealthResponse`
- `apps/api` returns that contract from the `/health` endpoint

## Client Split

The client workspace has two different kinds of shared code:

- `projects/core` is for UI-agnostic Angular helpers that `web`, `desktop`, and
  `mobile` may all use
- `projects/ui-web` is for shared presentation used by `web` and `desktop`
  only

`mobile` must not depend on `projects/ui-web`.

## Current Guardrails

The repo already enforces several architecture rules:

- workspace ownership is frozen in `docs/workspace-boundaries.md`
- import boundaries are frozen and lint-enforced in
  `docs/import-boundaries.md`
- internal aliases are frozen in `docs/path-aliases.md`
- `packages/domain` must stay framework-free
- `packages/contracts` must stay transport-safe
- API code must stay server-side
- API controllers must not import ORM or persistence-model modules directly

## Current Boundary Of The Architecture

The current architecture is intentionally incomplete in one major area:

- the primary database choice is now frozen as PostgreSQL
- the ORM or query layer is not frozen yet
- the real persistence module layout does not exist yet

Until those decisions are made, `apps/api` owns transport and orchestration,
`packages/domain` owns business rules, and persistence stays a future boundary
rather than a current workspace even though the target database is now known.

## Related Decisions

- `README.md`
- `docs/database-choice.md`
- `docs/workspace-boundaries.md`
- `docs/import-boundaries.md`
- `docs/path-aliases.md`
- `docs/client-core-boundary.md`
- `docs/client-ui-web-boundary.md`
- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/domain-aggregates.md`
- `docs/domain-services.md`
