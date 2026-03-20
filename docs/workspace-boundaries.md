# Workspace Boundaries

This document freezes the Solange Bernard monorepo workspace boundaries as of
March 20, 2026.

It is the source of truth for what each top-level workspace owns, what it may
depend on, and what must stay out of it.

## Confirmed Repo Signals

- The pnpm workspace currently includes `apps/*` and `packages/*`.
- The top-level workspaces are:
  `apps/api`,
  `apps/client`,
  `packages/contracts`,
  `packages/domain`,
  and `packages/api-client`.
- `packages/domain` currently depends only on `@repo/contracts`.
- `packages/api-client` currently depends only on `@repo/contracts`.
- `apps/api` currently depends on NestJS plus `@repo/contracts`.
- `apps/client` currently depends on Angular client libraries plus
  `@repo/api-client`.
- No package under `packages/*` currently imports Angular, Nest, Ionic,
  Capacitor, or Tauri code.

## Boundary Contract

| Workspace             | Owns                                                                                    | May depend on                                                                     | Must stay out                                                             |
| --------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `packages/contracts`  | shared contracts and transport-safe types                                               | TypeScript-only dependencies and runtime-light shared typing helpers              | Angular, Nest, HTTP transport logic, persistence logic, UI code           |
| `packages/domain`     | framework-free domain logic, value objects, invariants, aggregates, and domain services | `@repo/contracts` and framework-free utilities                                    | Angular, Nest, Ionic, Tauri, direct persistence code, HTTP client code    |
| `packages/api-client` | typed API-calling helpers and response parsing for clients                              | `@repo/contracts` and standard web-platform fetch primitives                      | Nest controllers, domain orchestration, UI components                     |
| `apps/api`            | Nest transport layer, application orchestration, and future persistence integration     | `@repo/contracts`, `@repo/domain`, Nest, persistence and infrastructure libraries | Angular UI code, Tauri or Capacitor code, client fetch wrappers           |
| `apps/client`         | all web, desktop, and mobile UI surfaces                                                | `@repo/api-client`, shared client-safe contracts, Angular and UI libraries        | Nest server code, persistence code, server orchestration responsibilities |

## Dependency Direction

The intended dependency flow for the current MVP is:

- `packages/contracts` sits at the bottom and should not depend on other
  internal workspaces.
- `packages/domain` may depend on `packages/contracts`.
- `packages/api-client` may depend on `packages/contracts`.
- `apps/api` may depend on `packages/contracts` and `packages/domain`.
- `apps/client` may depend on `packages/api-client` and client-safe shared
  contracts.

The reverse directions are not allowed:

- `packages/contracts` must not depend on `packages/domain`, `packages/api-client`,
  `apps/api`, or `apps/client`.
- `packages/domain` must not depend on `packages/api-client`, `apps/api`, or
  `apps/client`.
- `packages/api-client` must not depend on `packages/domain`, `apps/api`, or
  `apps/client`.
- `apps/api` must not depend on `packages/api-client` or `apps/client`.
- `apps/client` must not depend on `apps/api`.

## Notes On The Client Workspace

- `apps/client` is a single Angular workspace that currently contains the
  `web`, `desktop`, and `mobile` applications plus the `core` and `ui-web`
  Angular libraries.
- This task freezes the top-level workspace boundaries only.
- The exact responsibility split for `projects/core` and `projects/ui-web`
  is intentionally handled by separate client-library decisions.
- `projects/core` is the shared Angular-helper library; `projects/ui-web` is
  the shared presentation library for `web` and `desktop` only.

## Practical Rule Of Thumb

- Put shared transport-safe types in `packages/contracts`.
- Put business rules and pure domain behavior in `packages/domain`.
- Put reusable HTTP-calling behavior in `packages/api-client`.
- Put server entrypoints and orchestration in `apps/api`.
- Put presentation, routing, and client interaction code in `apps/client`.

## Related Decisions

- `TASKS.md`
- `README.md`
- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/domain-aggregates.md`
- `docs/domain-services.md`
